'use strict';

var proxyquire = require('proxyquire');
var EventEmitter = require('events').EventEmitter;
var VPAID_EVENTS = require('../../lib/enums/VPAID_EVENTS');

describe('VideoTracker(duration)', function() {
    var VideoTracker;
    var stubs;

    beforeEach(function() {
        stubs = {
            'events': require('events'),

            '@noCallThru': true
        };

        VideoTracker = proxyquire('../../lib/VideoTracker', stubs);
    });

    it('should exist', function() {
        expect(VideoTracker).toEqual(jasmine.any(Function));
        expect(VideoTracker.name).toEqual('VideoTracker');
    });

    describe('instance:', function() {
        var duration;
        var tracker;

        beforeEach(function() {
            duration = 37;
            tracker = new VideoTracker(duration);
        });

        it('should exist', function() {
            expect(tracker).toEqual(jasmine.any(EventEmitter));
        });

        describe('properties:', function() {
            describe('duration', function() {
                it('should be the duration', function() {
                    expect(tracker.duration).toBe(duration);
                });
            });

            describe('seconds', function() {
                it('should be an Array of false for each second of the video', function() {
                    expect(tracker.seconds).toEqual(jasmine.any(Array));
                    expect(tracker.seconds.length).toBe(duration);
                    expect(tracker.seconds.every(function(second) {
                        return second === false;
                    })).toBe(true, 'Every value is not false.');
                });
            });

            describe('fired', function() {
                it('should be an Object of VPAID events and if they\'ve been fired', function() {
                    expect(tracker.fired[VPAID_EVENTS.AdVideoStart]).toBe(false, VPAID_EVENTS.AdVideoStart);
                    expect(tracker.fired[VPAID_EVENTS.AdVideoFirstQuartile]).toBe(false, VPAID_EVENTS.AdVideoFirstQuartile);
                    expect(tracker.fired[VPAID_EVENTS.AdVideoMidpoint]).toBe(false, VPAID_EVENTS.AdVideoMidpoint);
                    expect(tracker.fired[VPAID_EVENTS.AdVideoThirdQuartile]).toBe(false, VPAID_EVENTS.AdVideoThirdQuartile);
                    expect(tracker.fired[VPAID_EVENTS.AdVideoComplete]).toBe(false, VPAID_EVENTS.AdVideoComplete);
                });
            });
        });

        describe('methods:', function() {
            describe('tick()', function() {
                var state;
                var AdVideoStart, AdVideoFirstQuartile, AdVideoMidpoint, AdVideoThirdQuartile, AdVideoComplete;

                function timeupdate(currentTime) {
                    state.currentTime = currentTime;
                    tracker.tick();
                }

                beforeEach(function() {
                    state = {
                        playing: false,
                        currentTime: 0
                    };

                    AdVideoStart = jasmine.createSpy('AdVideoStart()');
                    AdVideoFirstQuartile = jasmine.createSpy('AdVideoFirstQuartile()');
                    AdVideoMidpoint = jasmine.createSpy('AdVideoMidpoint()');
                    AdVideoThirdQuartile = jasmine.createSpy('AdVideoThirdQuartile()');
                    AdVideoComplete = jasmine.createSpy('AdVideoComplete()');

                    tracker.on(VPAID_EVENTS.AdVideoStart, AdVideoStart);
                    tracker.on(VPAID_EVENTS.AdVideoFirstQuartile, AdVideoFirstQuartile);
                    tracker.on(VPAID_EVENTS.AdVideoMidpoint, AdVideoMidpoint);
                    tracker.on(VPAID_EVENTS.AdVideoThirdQuartile, AdVideoThirdQuartile);
                    tracker.on(VPAID_EVENTS.AdVideoComplete, AdVideoComplete);

                    tracker._getState = jasmine.createSpy('_getState()').and.returnValue(state);
                });

                describe('before the video starts playing', function() {
                    beforeEach(function() {
                        tracker.tick();
                        tracker.tick();
                        tracker.tick();
                    });

                    it('should not emit "AdVideoStart"', function() {
                        expect(AdVideoStart).not.toHaveBeenCalled();
                    });
                });

                describe('as soon as the video starts playing', function() {
                    beforeEach(function() {
                        state.playing = true;

                        tracker.tick();
                        tracker.tick();
                        tracker.tick();
                    });

                    it('should emit AdVideoStart once', function() {
                        expect(AdVideoStart).toHaveBeenCalled();
                        expect(AdVideoStart.calls.count()).not.toBeGreaterThan(1, 'AdVideoStart called more than once!');
                        expect(tracker.fired[VPAID_EVENTS.AdVideoStart]).toBe(true, 'fired.' + VPAID_EVENTS.AdVideoStart);
                    });
                });

                describe('when a user watches a second of video', function() {
                    beforeEach(function() {
                        state.playing = true;

                        timeupdate(0.5);
                        timeupdate(0.75);
                        timeupdate(1.2); // Second 1 viewed

                        timeupdate(2); // Second 2 viewed

                        timeupdate(12.3); // Second 12 viewed

                        timeupdate(32.9); // Second 32 viewed

                        timeupdate(13); // Second 13 viewed

                        timeupdate(37); // Second 37 viewed
                    });

                    it('should set the value for that second to true in the seconds Array', function() {
                        expect(tracker.seconds).toEqual(Array.apply([], new Array(tracker.duration)).map(function(value, index) {
                            return [1, 2, 12, 32, 13, 37].indexOf(index + 1) > -1;
                        }));
                    });
                });

                describe('when a user scans over a second of video', function() {
                    beforeEach(function() {
                        timeupdate(0.5);
                        timeupdate(0.75);
                        timeupdate(1.2); // Second 1 scanned

                        timeupdate(2); // Second 2 scanned

                        timeupdate(12.3); // Second 12 scanned

                        timeupdate(32.9); // Second 32 scanned

                        timeupdate(13); // Second 13 scanned
                    });

                    it('should not set the value for that second to true in the seconds Array', function() {
                        expect(tracker.seconds).toEqual(Array.apply([], new Array(tracker.duration)).map(function() {
                            return false;
                        }));
                    });
                });

                describe('when the user watches the entire first quartile of video', function() {
                    beforeEach(function() {
                        state.playing = true;

                        [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function(second) {
                            timeupdate(second);
                        });

                        tracker.tick();
                        tracker.tick();
                        tracker.tick();
                    });

                    it('should emit AdVideoFirstQuartile once', function() {
                        expect(AdVideoFirstQuartile).toHaveBeenCalled();
                        expect(AdVideoFirstQuartile.calls.count()).not.toBeGreaterThan(1, 'AdVideoFirstQuartile called more than once!');
                        expect(tracker.fired[VPAID_EVENTS.AdVideoFirstQuartile]).toBe(true, 'fired.' + VPAID_EVENTS.AdVideoFirstQuartile);
                    });
                });

                describe('when the user watches part of the first quartile', function() {
                    beforeEach(function() {
                        state.playing = true;

                        [0.5, 1, 2, 3, 4, 6, 7, 8, 9].forEach(function(second) {
                            timeupdate(second);
                        });

                        tracker.tick();
                        tracker.tick();
                        tracker.tick();
                    });

                    it('should not emit AdVideoFirstQuartile once', function() {
                        expect(AdVideoFirstQuartile).not.toHaveBeenCalled();
                        expect(tracker.fired[VPAID_EVENTS.AdVideoFirstQuartile]).toBe(false, 'fired.' + VPAID_EVENTS.AdVideoFirstQuartile);
                    });
                });

                describe('when the user watches the entire second quartile of video', function() {
                    beforeEach(function() {
                        state.playing = true;

                        [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].forEach(function(second) {
                            timeupdate(second);
                        });

                        tracker.tick();
                        tracker.tick();
                        tracker.tick();
                    });

                    it('should emit AdVideoMidpoint once', function() {
                        expect(AdVideoMidpoint).toHaveBeenCalled();
                        expect(AdVideoMidpoint.calls.count()).not.toBeGreaterThan(1, 'AdVideoMidpoint called more than once!');
                        expect(tracker.fired[VPAID_EVENTS.AdVideoMidpoint]).toBe(true, 'fired.' + VPAID_EVENTS.AdVideoMidpoint);
                    });
                });

                describe('when the user watches part of the second quartile', function() {
                    beforeEach(function() {
                        state.playing = true;

                        [0.5, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].forEach(function(second) {
                            timeupdate(second);
                        });

                        tracker.tick();
                        tracker.tick();
                        tracker.tick();
                    });

                    it('should not emit AdVideoMidpoint once', function() {
                        expect(AdVideoMidpoint).not.toHaveBeenCalled();
                        expect(tracker.fired[VPAID_EVENTS.AdVideoMidpoint]).toBe(false, 'fired.' + VPAID_EVENTS.AdVideoMidpoint);
                    });
                });

                describe('when the user watches the entire third quartile of video', function() {
                    beforeEach(function() {
                        state.playing = true;

                        [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27].forEach(function(second) {
                            timeupdate(second);
                        });

                        tracker.tick();
                        tracker.tick();
                        tracker.tick();
                    });

                    it('should emit AdVideoThirdQuartile once', function() {
                        expect(AdVideoThirdQuartile).toHaveBeenCalled();
                        expect(AdVideoThirdQuartile.calls.count()).not.toBeGreaterThan(1, 'AdVideoThirdQuartile called more than once!');
                        expect(tracker.fired[VPAID_EVENTS.AdVideoThirdQuartile]).toBe(true, 'fired.' + VPAID_EVENTS.AdVideoThirdQuartile);
                    });
                });

                describe('when the user watches part of the third quartile', function() {
                    beforeEach(function() {
                        state.playing = true;

                        [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27].forEach(function(second) {
                            timeupdate(second);
                        });

                        tracker.tick();
                        tracker.tick();
                        tracker.tick();
                    });

                    it('should not emit AdVideoThirdQuartile once', function() {
                        expect(AdVideoThirdQuartile).not.toHaveBeenCalled();
                        expect(tracker.fired[VPAID_EVENTS.AdVideoThirdQuartile]).toBe(false, 'fired.' + VPAID_EVENTS.AdVideoThirdQuartile);
                    });
                });

                describe('when the user watches the entire video', function() {
                    beforeEach(function() {
                        state.playing = true;

                        [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37].forEach(function(second) {
                            timeupdate(second);
                        });

                        tracker.tick();
                        tracker.tick();
                        tracker.tick();
                    });

                    it('should emit AdVideoComplete once', function() {
                        expect(AdVideoComplete).toHaveBeenCalled();
                        expect(AdVideoComplete.calls.count()).not.toBeGreaterThan(1, 'AdVideoComplete called more than once!');
                        expect(tracker.fired[VPAID_EVENTS.AdVideoComplete]).toBe(true, 'fired.' + VPAID_EVENTS.AdVideoComplete);
                    });
                });

                describe('when the user watches part of the video', function() {
                    beforeEach(function() {
                        state.playing = true;

                        [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37].forEach(function(second) {
                            timeupdate(second);
                        });

                        tracker.tick();
                        tracker.tick();
                        tracker.tick();
                    });

                    it('should not emit AdVideoComplete once', function() {
                        expect(AdVideoComplete).not.toHaveBeenCalled();
                        expect(tracker.fired[VPAID_EVENTS.AdVideoComplete]).toBe(false, 'fired.' + VPAID_EVENTS.AdVideoComplete);
                    });
                });
            });
        });
    });
});
