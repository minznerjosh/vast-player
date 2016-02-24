'use strict';

var EVENTS = require('./enums/VPAID_EVENTS');

function identity(value) {
    return value;
}

function fire(pixels, mapper) {
    (pixels || []).forEach(function(src) {
        new Image().src = mapper(src);
    });
}

function PixelReporter(pixels, mapper) {
    this.pixels = pixels.reduce(function(pixels, item) {
        (pixels[item.event] || (pixels[item.event] = [])).push(item.uri);
        return pixels;
    }, {});

    this.__private__ = {
        mapper: mapper || identity
    };
}

PixelReporter.prototype.track = function track(vpaid) {
    var pixels = this.pixels;
    var customMapper = this.__private__.mapper;
    var lastVolume = vpaid.adVolume;

    function fireType(type, mapper, predicate) {
        function pixelMapper(url) {
            return customMapper((mapper || identity)(url));
        }

        return function firePixels() {
            if (!predicate || predicate()) {
                fire(pixels[type], pixelMapper);
            }
        };
    }

    vpaid.on(EVENTS.AdSkipped, fireType('skip'));
    vpaid.on(EVENTS.AdStarted, fireType('creativeView'));
    vpaid.on(EVENTS.AdVolumeChange, fireType('unmute', null, function() {
        return lastVolume === 0 && vpaid.adVolume > 0;
    }));
    vpaid.on(EVENTS.AdVolumeChange, fireType('mute', null, function() {
        return lastVolume > 0 && vpaid.adVolume === 0;
    }));
    vpaid.on(EVENTS.AdImpression, fireType('impression'));
    vpaid.on(EVENTS.AdVideoStart, fireType('start'));
    vpaid.on(EVENTS.AdVideoFirstQuartile, fireType('firstQuartile'));
    vpaid.on(EVENTS.AdVideoMidpoint, fireType('midpoint'));
    vpaid.on(EVENTS.AdVideoThirdQuartile, fireType('thirdQuartile'));
    vpaid.on(EVENTS.AdVideoComplete, fireType('complete'));
    vpaid.on(EVENTS.AdClickThru, fireType('clickThrough'));
    vpaid.on(EVENTS.AdUserAcceptInvitation, fireType('acceptInvitationLinear'));
    vpaid.on(EVENTS.AdUserMinimize, fireType('collapse'));
    vpaid.on(EVENTS.AdUserClose, fireType('closeLinear'));
    vpaid.on(EVENTS.AdPaused, fireType('pause'));
    vpaid.on(EVENTS.AdPlaying, fireType('resume'));
    vpaid.on(EVENTS.AdError, fireType('error', function(pixel) {
        return pixel.replace(/\[ERRORCODE\]/g, 901);
    }));

    vpaid.on(EVENTS.AdVolumeChange, function updateLastVolume() {
        lastVolume = vpaid.adVolume;
    });
};

module.exports = PixelReporter;
