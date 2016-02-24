'use strict';

var VideoTracker = require('./VideoTracker');
var inherits = require('util').inherits;
var EVENTS = require('./enums/HTML_MEDIA_EVENTS');

function HTMLVideoTracker(video) {
    var self = this;

    VideoTracker.call(this, Math.floor(video.duration || 0)); // call super()

    this.video = video;

    [
        EVENTS.PLAYING,
        EVENTS.PAUSE,
        EVENTS.TIMEUPDATE
    ].forEach(function(event) {
        return video.addEventListener(event, function onevent() {
            return self.tick();
        }, false);
    });
}
inherits(HTMLVideoTracker, VideoTracker);

HTMLVideoTracker.prototype._getState = function _getState() {
    return {
        playing: !this.video.paused,
        currentTime: this.video.currentTime
    };
};

module.exports = HTMLVideoTracker;
