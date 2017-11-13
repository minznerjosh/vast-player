'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var VAST = require('vastacular').VAST;
var JavaScriptVPAIDPlayer = require('./players/JavaScriptVPAID');
var FlashVPAIDPlayer = require('./players/FlashVPAID');
var HTMLVideoPlayer = require('./players/HTMLVideo');
var MIME = require('./enums/MIME');
var EVENTS = require('./enums/VPAID_EVENTS');
var EventProxy = require('./EventProxy');
var LiePromise = require('lie');
var PixelReporter = require('./PixelReporter');

function defaults(/*...objects*/) {
    var result = {};
    var length = arguments.length;
    var index, object;
    var prop, value;

    for (index = 0; index < length; index++) {
        object = arguments[index] || {};

        for (prop in object) {
            value = object[prop];

            if (result[prop] === undefined) {
                result[prop] = value;
            }

            if (typeof value === 'object') {
                result[prop] = defaults(result[prop], value);
            }
        }
    }

    return result;
}

function identity(value) {
    return value;
}

function getNotReadyError() {
    return new Error('VASTPlayer not ready.');
}

function proxy(method) {
    return function callMethod() {
        var self = this;
        var player = this.__private__.player;

        if (!this.ready) {
            return LiePromise.reject(getNotReadyError());
        }

        return player[method].apply(player, arguments).then(function() {
            return self;
        });
    };
}

function proxyProp(property) {
    return {
        get: function get() {
            if (!this.ready) { throw getNotReadyError(); }

            return this.__private__.player[property];
        },

        set: function set(value) {
            if (!this.ready) { throw getNotReadyError(); }

            return (this.__private__.player[property] = value);
        }
    };
}

function VASTPlayer(container, config) {
    var self = this;

    EventEmitter.call(this); // call super()

    this.__private__ = {
        container: container,
        config: defaults(config, {
            vast: {
                resolveWrappers: true,
                maxRedirects: 5
            },
            tracking: {
                mapper: identity
            }
        }),

        vast: null,
        ready: false,
        player: null
    };

    this.on(EVENTS.AdClickThru, function onAdClickThru(url, id, playerHandles) {
        var clickThrough = url || self.vast.get('ads[0].creatives[0].videoClicks.clickThrough');

        if (playerHandles && clickThrough) {
            window.open(clickThrough);
        }
    });
}
inherits(VASTPlayer, EventEmitter);
Object.defineProperties(VASTPlayer.prototype, {
    container: {
        get: function getContainer() {
            return this.__private__.container;
        }
    },

    config: {
        get: function getConfig() {
            return this.__private__.config;
        }
    },

    vast: {
        get: function getVast() {
            return this.__private__.vast;
        }
    },

    ready: {
        get: function getReady() {
            return this.__private__.ready;
        }
    },

    adRemainingTime: proxyProp('adRemainingTime'),
    adDuration: proxyProp('adDuration'),
    adVolume: proxyProp('adVolume')
});

VASTPlayer.prototype.load = function load(uri) {
    var self = this;
    var config = this.config.vast;

    return VAST.fetch(uri, config).then(function loadPlayer(vast) {
        var config = (function() {
            var jsVPAIDFiles = vast.filter('ads[0].creatives[0].mediaFiles', function(mediaFile) {
                return (
                    mediaFile.type === MIME.JAVASCRIPT ||
                    mediaFile.type === 'application/x-javascript'
                ) && mediaFile.apiFramework === 'VPAID';
            });
            var swfVPAIDFiles = vast.filter('ads[0].creatives[0].mediaFiles', function(mediaFile) {
                return mediaFile.type === MIME.FLASH && mediaFile.apiFramework === 'VPAID';
            });
            var files = vast.filter('ads[0].creatives[0].mediaFiles', function() { return true; });

            if (jsVPAIDFiles.length > 0) {
                return {
                    player: new JavaScriptVPAIDPlayer(self.container),
                    mediaFiles: jsVPAIDFiles
                };
            } else if (swfVPAIDFiles.length > 0) {
                return {
                    player: new FlashVPAIDPlayer(self.container, VASTPlayer.vpaidSWFLocation),
                    mediaFiles: swfVPAIDFiles
                };
            }

            return {
                player: new HTMLVideoPlayer(self.container),
                mediaFiles: files
            };
        }());
        var parameters = vast.get('ads[0].creatives[0].parameters');
        var pixels = [].concat(
            vast.map('ads[0].impressions', function(impression) {
                return { event: 'impression', uri: impression.uri };
            }),
            vast.map('ads[0].errors', function(uri) {
                return { event: 'error', uri: uri };
            }),
            vast.get('ads[0].creatives[0].trackingEvents'),
            vast.map('ads[0].creatives[0].videoClicks.clickTrackings', function(uri) {
                return { event: 'clickThrough', uri: uri };
            })
        );
        var player = config.player;
        var mediaFiles = config.mediaFiles;
        var proxy = new EventProxy(EVENTS);
        var reporter = new PixelReporter(pixels, self.config.tracking.mapper);

        proxy.from(player).to(self);

        self.__private__.vast = vast;
        self.__private__.player = player;

    return () =>
        player.load(mediaFiles, parameters)
            .then(function setupPixels() {
                reporter.track(player);
            })
            .then(function setReady() {
                self.__private__.ready = true;
                self.emit('ready');

                return self;
            })
            .catch(function emitError(reason) {
                self.emit('error', reason);

                throw reason;
            });
    });
};

VASTPlayer.prototype.startAd = proxy('startAd');

VASTPlayer.prototype.stopAd = proxy('stopAd');

VASTPlayer.prototype.pauseAd = proxy('pauseAd');

VASTPlayer.prototype.resumeAd = proxy('resumeAd');

VASTPlayer.vpaidSWFLocation = 'https://cdn.jsdelivr.net' +
    '/npm/vast-player@__VERSION__/dist/vast-player--vpaid.swf';

module.exports = VASTPlayer;
