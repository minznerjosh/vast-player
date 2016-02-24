'use strict';

var proxyquire = require('proxyquire');
var VideoTracker = require('../../lib/VideoTracker.js');
var HTML_MEDIA_EVENTS = require('../../lib/enums/HTML_MEDIA_EVENTS');

describe('HTMLVideoTracker(video)', function() {
    var HTMLVideoTracker;
    var stubs;

    beforeEach(function() {
        stubs = {
            './VideoTracker': VideoTracker,

            '@noCallThru': true
        };

        HTMLVideoTracker = proxyquire('../../lib/HTMLVideoTracker', stubs);
    });

    it('should exist', function() {
        expect(HTMLVideoTracker).toEqual(jasmine.any(Function));
        expect(HTMLVideoTracker.name).toEqual('HTMLVideoTracker');
    });

    describe('instance:', function() {
        var video;
        var tracker;

        beforeEach(function() {
            video = document.createElement('video');
            video.duration = 30.754;
            video.currentTime = 0;
            video.paused = true;

            tracker = new HTMLVideoTracker(video);
        });

        it('should exist', function() {
            expect(tracker).toEqual(jasmine.any(VideoTracker));
        });

        describe('properties:', function() {
            describe('video', function() {
                it('should be the video', function() {
                    expect(tracker.video).toBe(video);
                });
            });

            describe('duration', function() {
                it('should be the video duration, rounded down', function() {
                    expect(tracker.duration).toBe(Math.floor(video.duration));
                });
            });
        });

        describe('methods:', function() {
            describe('_getState()', function() {
                describe('if the video is paused', function() {
                    beforeEach(function() {
                        video.paused = true;
                    });

                    it('should make playing false', function() {
                        expect(tracker._getState()).toEqual(jasmine.objectContaining({ playing: false }));
                    });
                });

                describe('if the video is not paused', function() {
                    beforeEach(function() {
                        video.paused = false;
                    });

                    it('should make playing true', function() {
                        expect(tracker._getState()).toEqual(jasmine.objectContaining({ playing: true }));
                    });
                });

                it('should copy the currentTime from the video', function() {
                    video.currentTime = 3;
                    expect(tracker._getState()).toEqual(jasmine.objectContaining({ currentTime: 3 }));

                    video.currentTime = 8;
                    expect(tracker._getState()).toEqual(jasmine.objectContaining({ currentTime: 8 }));
                });
            });
        });

        [
            HTML_MEDIA_EVENTS.PLAYING,
            HTML_MEDIA_EVENTS.PAUSE,
            HTML_MEDIA_EVENTS.TIMEUPDATE
        ].forEach(function(eventName) {
            describe('when the video emits ' + eventName, function() {
                beforeEach(function() {
                    var event = document.createEvent('CustomEvent');

                    spyOn(tracker, 'tick').and.callThrough();
                    event.initCustomEvent(eventName);

                    video.dispatchEvent(event);
                });

                it('should tick() the tracker', function() {
                    expect(tracker.tick).toHaveBeenCalled();
                });
            });
        });
    });
});
