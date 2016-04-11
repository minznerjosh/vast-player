'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var EVENTS = require('./enums/VPAID_EVENTS');

function fire(event, tracker) {
    if (tracker.fired[event]) { return; }

    tracker.emit(event);
    tracker.fired[event] = true;
}

function VideoTracker(duration) {
    EventEmitter.apply(this, arguments); // call super()

    this.duration = duration;
    this.seconds = Array.apply([], new Array(duration)).map(function() { return false; });

    this.fired = [
        EVENTS.AdVideoStart,
        EVENTS.AdVideoFirstQuartile,
        EVENTS.AdVideoMidpoint,
        EVENTS.AdVideoThirdQuartile,
        EVENTS.AdVideoComplete
    ].reduce(function(fired, event) {
        fired[event] = false;
        return fired;
    }, {});
}
inherits(VideoTracker, EventEmitter);

VideoTracker.prototype.tick = function tick() {
    var seconds = this.seconds;
    var state = this._getState();
    var index = Math.round(state.currentTime) - 1;
    var quartileIndices = [1, 2, 3, 4].map(function(quartile) {
        return Math.floor(this.duration / 4  * quartile);
    }, this);

    function quartileViewed(quartile) {
        var end = quartileIndices[quartile - 1];

        return seconds.slice(0, end).every(function(second) {
            return second === true;
        });
    }

    if (state.playing) {
        fire(EVENTS.AdVideoStart, this);

        if (index > -1) {
            this.seconds[index] = true;
        }
    }

    if (quartileViewed(1)) {
        fire(EVENTS.AdVideoFirstQuartile, this);
    }

    if (quartileViewed(2)) {
        fire(EVENTS.AdVideoMidpoint, this);
    }

    if (quartileViewed(3)) {
        fire(EVENTS.AdVideoThirdQuartile, this);
    }

    if (quartileViewed(4)) {
        fire(EVENTS.AdVideoComplete, this);
    }
};

module.exports = VideoTracker;
