'use strict';

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var LiePromise = require('lie');
var EVENTS = require('../enums/VPAID_EVENTS');

function proxy(method, event) {
    return function callMethod(/*..args*/) {
        var args = arguments;
        var api = this.api;
        var self = this;

        function getError() {
            return new Error('Ad has not been loaded.');
        }

        function call() {
            return api[method].apply(api, args);
        }

        if (!event) {
            if (!api) {
                throw getError();
            }

            return call();
        }

        return new LiePromise(function(resolve, reject) {
            if (!api) {
                return reject(getError());
            }

            self.once(event, function done() {
                resolve(self);
            });

            return call();
        });
    };
}

function VPAID(container) {
    this.container = container;
    this.api = null;
    this.vpaidVersion = null;
}
inherits(VPAID, EventEmitter);
Object.defineProperties(VPAID.prototype, {
    adLinear: { get: proxy('getAdLinear') },
    adWidth: { get: proxy('getAdWidth') },
    adHeight: { get: proxy('getAdHeight') },
    adExpanded: { get: proxy('getAdExpanded') },
    adSkippableState: { get: proxy('getAdSkippableState') },
    adRemainingTime: { get: proxy('getAdRemainingTime') },
    adDuration: { get: proxy('getAdDuration') },
    adVolume: { get: proxy('getAdVolume'), set: proxy('setAdVolume') },
    adCompanions: { get: proxy('getAdCompanions') },
    adIcons: { get: proxy('getAdIcons') }
});

VPAID.prototype.load = function load() {
    throw new Error('VPAID subclass must implement load() method.');
};

VPAID.prototype.resizeAd = proxy('resizeAd', EVENTS.AdSizeChange);

VPAID.prototype.startAd = proxy('startAd', EVENTS.AdStarted);

VPAID.prototype.stopAd = proxy('stopAd', EVENTS.AdStopped);

VPAID.prototype.pauseAd = proxy('pauseAd', EVENTS.AdPaused);

VPAID.prototype.resumeAd = proxy('resumeAd', EVENTS.AdPlaying);

VPAID.prototype.expandAd = proxy('expandAd', EVENTS.AdExpandedChange);

VPAID.prototype.collapseAd = proxy('collapseAd', EVENTS.AdExpandedChange);

VPAID.prototype.skipAd = proxy('skipAd', EVENTS.AdSkipped);

module.exports = VPAID;
