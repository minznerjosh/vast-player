'use strict';

var proxyquire = require('proxyquire');
var EventEmitter = require('events').EventEmitter;
var EVENTS = require('../../lib/enums/VPAID_EVENTS');

describe('PixelReporter(pixels)', function() {
    var PixelReporter;
    var stubs;

    beforeEach(function() {
        stubs = {
            'events': require('events'),

            '@noCallThru': true
        };

        PixelReporter = proxyquire('../../lib/PixelReporter', stubs);
    });

    it('should exist', function() {
        expect(PixelReporter).toEqual(jasmine.any(Function));
        expect(PixelReporter.name).toEqual('PixelReporter');
    });

    describe('instance:', function() {
        var pixels;
        var reporter;

        beforeEach(function() {
            pixels = [
                {
                    event: 'impression',
                    uri: 'http://www.tracking.com/impression1.gif'
                },
                {
                    event: 'impression',
                    uri: 'http://www.tracking.com/impression2.gif'
                },
                {
                    event: 'error',
                    uri: 'http://www.tracking.com/error1.gif'
                },
                {
                    event: 'error',
                    uri: 'http://www.tracking.com/error2.gif'
                },
                {
                    event: 'creativeView',
                    uri: 'http://www.tracking.com/creativeView1.gif'
                },
                {
                    event: 'creativeView',
                    uri: 'http://www.tracking.com/creativeView2.gif'
                },
                {
                    event: 'start',
                    uri: 'http://www.tracking.com/start1.gif'
                },
                {
                    event: 'start',
                    uri: 'http://www.tracking.com/start2.gif'
                },
                {
                    event: 'firstQuartile',
                    uri: 'http://www.tracking.com/firstQuartile1.gif'
                },
                {
                    event: 'firstQuartile',
                    uri: 'http://www.tracking.com/firstQuartile2.gif'
                },
                {
                    event: 'midpoint',
                    uri: 'http://www.tracking.com/midpoint1.gif'
                },
                {
                    event: 'midpoint',
                    uri: 'http://www.tracking.com/midpoint2.gif'
                },
                {
                    event: 'thirdQuartile',
                    uri: 'http://www.tracking.com/thirdQuartile1.gif'
                },
                {
                    event: 'thirdQuartile',
                    uri: 'http://www.tracking.com/thirdQuartile2.gif'
                },
                {
                    event: 'complete',
                    uri: 'http://www.tracking.com/complete1.gif'
                },
                {
                    event: 'complete',
                    uri: 'http://www.tracking.com/complete2.gif'
                },
                {
                    event: 'mute',
                    uri: 'http://www.tracking.com/mute1.gif'
                },
                {
                    event: 'mute',
                    uri: 'http://www.tracking.com/mute2.gif'
                },
                {
                    event: 'unmute',
                    uri: 'http://www.tracking.com/unmute1.gif'
                },
                {
                    event: 'unmute',
                    uri: 'http://www.tracking.com/unmute2.gif'
                },
                {
                    event: 'pause',
                    uri: 'http://www.tracking.com/pause1.gif'
                },
                {
                    event: 'pause',
                    uri: 'http://www.tracking.com/pause2.gif'
                },
                {
                    event: 'rewind',
                    uri: 'http://www.tracking.com/rewind1.gif'
                },
                {
                    event: 'rewind',
                    uri: 'http://www.tracking.com/rewind2.gif'
                },
                {
                    event: 'resume',
                    uri: 'http://www.tracking.com/resume1.gif'
                },
                {
                    event: 'resume',
                    uri: 'http://www.tracking.com/resume2.gif'
                },
                {
                    event: 'fullscreen',
                    uri: 'http://www.tracking.com/fullscreen1.gif'
                },
                {
                    event: 'fullscreen',
                    uri: 'http://www.tracking.com/fullscreen2.gif'
                },
                {
                    event: 'exitFullscreen',
                    uri: 'http://www.tracking.com/exitFullscreen1.gif'
                },
                {
                    event: 'exitFullscreen',
                    uri: 'http://www.tracking.com/exitFullscreen2.gif'
                },
                {
                    event: 'expand',
                    uri: 'http://www.tracking.com/expand1.gif'
                },
                {
                    event: 'expand',
                    uri: 'http://www.tracking.com/expand2.gif'
                },
                {
                    event: 'collapse',
                    uri: 'http://www.tracking.com/collapse1.gif'
                },
                {
                    event: 'collapse',
                    uri: 'http://www.tracking.com/collapse2.gif'
                },
                {
                    event: 'acceptInvitationLinear',
                    uri: 'http://www.tracking.com/acceptInvitationLinear1.gif'
                },
                {
                    event: 'acceptInvitationLinear',
                    uri: 'http://www.tracking.com/acceptInvitationLinear2.gif'
                },
                {
                    event: 'closeLinear',
                    uri: 'http://www.tracking.com/closeLinear1.gif'
                },
                {
                    event: 'closeLinear',
                    uri: 'http://www.tracking.com/closeLinear2.gif'
                },
                {
                    event: 'skip',
                    uri: 'http://www.tracking.com/skip1.gif'
                },
                {
                    event: 'skip',
                    uri: 'http://www.tracking.com/skip2.gif'
                },
                {
                    event: 'progress',
                    uri: 'http://www.tracking.com/progress1.gif'
                },
                {
                    event: 'progress',
                    uri: 'http://www.tracking.com/progress2.gif'
                },
                {
                    event: 'clickThrough',
                    uri: 'http://www.tracking.com/clickThrough1.gif'
                },
                {
                    event: 'clickThrough',
                    uri: 'http://www.tracking.com/clickThrough2.gif'
                }
            ];

            reporter = new PixelReporter(pixels);
        });

        it('should exist', function() {
            expect(reporter).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('pixels', function() {
                it('should be pixel URIs keyed by event type', function() {
                    expect(reporter.pixels).toEqual({
                        impression: ['http://www.tracking.com/impression1.gif', 'http://www.tracking.com/impression2.gif'],
                        error: ['http://www.tracking.com/error1.gif', 'http://www.tracking.com/error2.gif'],
                        creativeView: ['http://www.tracking.com/creativeView1.gif', 'http://www.tracking.com/creativeView2.gif'],
                        start: ['http://www.tracking.com/start1.gif', 'http://www.tracking.com/start2.gif'],
                        firstQuartile: ['http://www.tracking.com/firstQuartile1.gif', 'http://www.tracking.com/firstQuartile2.gif'],
                        midpoint: ['http://www.tracking.com/midpoint1.gif', 'http://www.tracking.com/midpoint2.gif'],
                        thirdQuartile: ['http://www.tracking.com/thirdQuartile1.gif', 'http://www.tracking.com/thirdQuartile2.gif'],
                        complete: ['http://www.tracking.com/complete1.gif', 'http://www.tracking.com/complete2.gif'],
                        mute: ['http://www.tracking.com/mute1.gif', 'http://www.tracking.com/mute2.gif'],
                        unmute: ['http://www.tracking.com/unmute1.gif', 'http://www.tracking.com/unmute2.gif'],
                        pause: ['http://www.tracking.com/pause1.gif', 'http://www.tracking.com/pause2.gif'],
                        rewind: ['http://www.tracking.com/rewind1.gif', 'http://www.tracking.com/rewind2.gif'],
                        resume: ['http://www.tracking.com/resume1.gif', 'http://www.tracking.com/resume2.gif'],
                        fullscreen: ['http://www.tracking.com/fullscreen1.gif', 'http://www.tracking.com/fullscreen2.gif'],
                        exitFullscreen: ['http://www.tracking.com/exitFullscreen1.gif', 'http://www.tracking.com/exitFullscreen2.gif'],
                        expand: ['http://www.tracking.com/expand1.gif', 'http://www.tracking.com/expand2.gif'],
                        collapse: ['http://www.tracking.com/collapse1.gif', 'http://www.tracking.com/collapse2.gif'],
                        acceptInvitationLinear: ['http://www.tracking.com/acceptInvitationLinear1.gif', 'http://www.tracking.com/acceptInvitationLinear2.gif'],
                        closeLinear: ['http://www.tracking.com/closeLinear1.gif', 'http://www.tracking.com/closeLinear2.gif'],
                        skip: ['http://www.tracking.com/skip1.gif', 'http://www.tracking.com/skip2.gif'],
                        progress: ['http://www.tracking.com/progress1.gif', 'http://www.tracking.com/progress2.gif'],
                        clickThrough: ['http://www.tracking.com/clickThrough1.gif', 'http://www.tracking.com/clickThrough2.gif']
                    });
                });
            });
        });

        describe('methods:', function() {
            describe('track(vpaid)', function() {
                var vpaid;

                function getPixelSrcs() {
                    return window.Image.calls.all().map(function(call) {
                        return call.returnValue.src;
                    });
                }

                beforeEach(function() {
                    var Image = window.Image;

                    vpaid = new EventEmitter();
                    vpaid.adVolume = 1;

                    spyOn(window, 'Image').and.callFake(function() {
                        return new Image();
                    });

                    reporter.track(vpaid);
                });

                describe('when ' + EVENTS.AdSkipped + ' is fired', function() {
                    beforeEach(function() {
                        vpaid.emit(EVENTS.AdSkipped);
                    });

                    it('should fire the skip pixels', function() {
                        expect(getPixelSrcs()).toEqual(reporter.pixels.skip);
                    });
                });

                describe('when ' + EVENTS.AdStarted + ' is fired', function() {
                    beforeEach(function() {
                        vpaid.emit(EVENTS.AdStarted);
                    });

                    it('should fire the creativeView pixels', function() {
                        expect(getPixelSrcs()).toEqual(reporter.pixels.creativeView);
                    });
                });

                describe('when ' + EVENTS.AdStarted + ' is fired', function() {
                    beforeEach(function() {
                        vpaid.emit(EVENTS.AdStarted);
                    });

                    it('should fire the creativeView pixels', function() {
                        expect(getPixelSrcs()).toEqual(reporter.pixels.creativeView);
                    });
                });

                describe('when ' + EVENTS.AdVolumeChange + ' is fired', function() {
                    [0.1, 0.2, 0.3, 0.6, 1].forEach(function(volume) {
                        describe('and the old volume was ' + volume, function() {
                            beforeEach(function() {
                                vpaid.removeAllListeners();
                                vpaid.adVolume = volume;

                                reporter.track(vpaid);
                            });

                            describe('and the new volume is 0', function() {
                                beforeEach(function() {
                                    vpaid.adVolume = 0;
                                    vpaid.emit(EVENTS.AdVolumeChange);
                                });

                                it('should fire the mute pixels', function() {
                                    expect(getPixelSrcs()).toEqual(reporter.pixels.mute);
                                });

                                describe('and another new volume is 1', function() {
                                    beforeEach(function() {
                                        window.Image.calls.reset();

                                        vpaid.adVolume = 1;
                                        vpaid.emit(EVENTS.AdVolumeChange);
                                    });

                                    it('should fire the unmute pixels', function() {
                                        expect(getPixelSrcs()).toEqual(reporter.pixels.unmute);
                                    });
                                });
                            });

                            [0.3, 0.5, 1, 0.75].forEach(function(volume) {
                                describe('and the new volume is ' + volume, function() {
                                    beforeEach(function() {
                                        vpaid.adVolume = volume;
                                        vpaid.emit(EVENTS.AdVolumeChange);
                                    });

                                    it('should not fire any pixels', function() {
                                        expect(getPixelSrcs()).toEqual([]);
                                    });
                                });
                            });
                        });
                    });

                    describe('and the old volume was 0', function() {
                        beforeEach(function() {
                            vpaid.removeAllListeners();
                            vpaid.adVolume = 0;

                            reporter.track(vpaid);
                        });

                        describe('and the new volume is 0', function() {
                            beforeEach(function() {
                                vpaid.adVolume = 0;
                                vpaid.emit(EVENTS.AdVolumeChange);
                            });

                            it('should not fire any pixels', function() {
                                expect(getPixelSrcs()).toEqual([]);
                            });
                        });

                        [0.3, 0.5, 1, 0.75].forEach(function(volume) {
                            describe('and the new volume is ' + volume, function() {
                                beforeEach(function() {
                                    vpaid.adVolume = volume;
                                    vpaid.emit(EVENTS.AdVolumeChange);
                                });

                                it('should fire the unmute pixels', function() {
                                    expect(getPixelSrcs()).toEqual(reporter.pixels.unmute);
                                });

                                describe('and another new volume is 0', function() {
                                    beforeEach(function() {
                                        window.Image.calls.reset();

                                        vpaid.adVolume = 0;
                                        vpaid.emit(EVENTS.AdVolumeChange);
                                    });

                                    it('should fire the mute pixels', function() {
                                        expect(getPixelSrcs()).toEqual(reporter.pixels.mute);
                                    });
                                });
                            });
                        });
                    });
                });

                describe('when ' + EVENTS.AdImpression + ' is fired', function() {
                    beforeEach(function() {
                        vpaid.emit(EVENTS.AdImpression);
                    });

                    it('should fire the impression pixels', function() {
                        expect(getPixelSrcs()).toEqual(reporter.pixels.impression);
                    });
                });

                describe('when ' + EVENTS.AdVideoStart + ' is fired', function() {
                    beforeEach(function() {
                        vpaid.emit(EVENTS.AdVideoStart);
                    });

                    it('should fire the start pixels', function() {
                        expect(getPixelSrcs()).toEqual(reporter.pixels.start);
                    });
                });

                describe('when ' + EVENTS.AdVideoFirstQuartile + ' is fired', function() {
                    beforeEach(function() {
                        vpaid.emit(EVENTS.AdVideoFirstQuartile);
                    });

                    it('should fire the firstQuartile pixels', function() {
                        expect(getPixelSrcs()).toEqual(reporter.pixels.firstQuartile);
                    });
                });

                describe('when ' + EVENTS.AdVideoMidpoint + ' is fired', function() {
                    beforeEach(function() {
                        vpaid.emit(EVENTS.AdVideoMidpoint);
                    });

                    it('should fire the midpoint pixels', function() {
                        expect(getPixelSrcs()).toEqual(reporter.pixels.midpoint);
                    });
                });

                describe('when ' + EVENTS.AdVideoThirdQuartile + ' is fired', function() {
                    beforeEach(function() {
                        vpaid.emit(EVENTS.AdVideoThirdQuartile);
                    });

                    it('should fire the thirdQuartile pixels', function() {
                        expect(getPixelSrcs()).toEqual(reporter.pixels.thirdQuartile);
                    });
                });

                describe('when ' + EVENTS.AdVideoComplete + ' is fired', function() {
                    beforeEach(function() {
                        vpaid.emit(EVENTS.AdVideoComplete);
                    });

                    it('should fire the complete pixels', function() {
                        expect(getPixelSrcs()).toEqual(reporter.pixels.complete);
                    });
                });

                describe('when ' + EVENTS.AdClickThru + ' is fired', function() {
                    beforeEach(function() {
                        vpaid.emit(EVENTS.AdClickThru);
                    });

                    it('should fire the clickThrough pixels', function() {
                        expect(getPixelSrcs()).toEqual(reporter.pixels.clickThrough);
                    });
                });

                describe('when ' + EVENTS.AdUserAcceptInvitation + ' is fired', function() {
                    beforeEach(function() {
                        vpaid.emit(EVENTS.AdUserAcceptInvitation);
                    });

                    it('should fire the acceptInvitation pixels', function() {
                        expect(getPixelSrcs()).toEqual(reporter.pixels.acceptInvitationLinear);
                    });
                });

                describe('when ' + EVENTS.AdUserMinimize + ' is fired', function() {
                    beforeEach(function() {
                        vpaid.emit(EVENTS.AdUserMinimize);
                    });

                    it('should fire the collapse pixels', function() {
                        expect(getPixelSrcs()).toEqual(reporter.pixels.collapse);
                    });
                });

                describe('when ' + EVENTS.AdUserClose + ' is fired', function() {
                    beforeEach(function() {
                        vpaid.emit(EVENTS.AdUserClose);
                    });

                    it('should fire the close pixels', function() {
                        expect(getPixelSrcs()).toEqual(reporter.pixels.closeLinear);
                    });
                });

                describe('when ' + EVENTS.AdPaused + ' is fired', function() {
                    beforeEach(function() {
                        vpaid.emit(EVENTS.AdPaused);
                    });

                    it('should fire the pause pixels', function() {
                        expect(getPixelSrcs()).toEqual(reporter.pixels.pause);
                    });
                });

                describe('when ' + EVENTS.AdPlaying + ' is fired', function() {
                    beforeEach(function() {
                        vpaid.emit(EVENTS.AdPlaying);
                    });

                    it('should fire the resume pixels', function() {
                        expect(getPixelSrcs()).toEqual(reporter.pixels.resume);
                    });
                });

                describe('when ' + EVENTS.AdPlaying + ' is fired', function() {
                    beforeEach(function() {
                        vpaid.emit(EVENTS.AdPlaying);
                    });

                    it('should fire the resume pixels', function() {
                        expect(getPixelSrcs()).toEqual(reporter.pixels.resume);
                    });
                });

                describe('when ' + EVENTS.AdError + ' is fired', function() {
                    beforeEach(function() {
                        vpaid.emit(EVENTS.AdError);
                    });

                    it('should fire the error pixels', function() {
                        expect(getPixelSrcs()).toEqual(reporter.pixels.error);
                    });

                    describe('if the pixels have the [ERRORCODE] macro', function() {
                        beforeEach(function() {
                            window.Image.calls.reset();
                            reporter.pixels.error = reporter.pixels.error.map(function(pixel) {
                                return pixel + '?code=[ERRORCODE]&other=[ERRORCODE]';
                            });

                            vpaid.emit(EVENTS.AdError);
                        });

                        it('should replace the macro', function() {
                            expect(getPixelSrcs()).toEqual(reporter.pixels.error.map(function(pixel) {
                                return pixel.replace(/\[ERRORCODE\]/g, 901);
                            }));
                        });
                    });
                });

                describe('if pixels are not defined', function() {
                    beforeEach(function() {
                        reporter = new PixelReporter([]);
                        reporter.track(vpaid);
                    });

                    it('should not throw any Errors', function() {
                        expect(function() {
                            EVENTS.forEach(function(event) {
                                vpaid.emit(event);
                            });
                        }).not.toThrow();
                    });
                });

                describe('if a mapper is provided', function() {
                    var mapper;

                    beforeEach(function() {
                        mapper = jasmine.createSpy('mapper()').and.callFake(function(url) {
                            return url.replace('{foo}', 'FOOD').replace('{bar}', 'BARD');
                        });

                        vpaid.removeAllListeners();

                        pixels = pixels.map(function(pixel) {
                            return {
                                event: pixel.event,
                                uri: pixel.uri + '?prop1={foo}&prop2={bar}'
                            };
                        });

                        reporter = new PixelReporter(pixels, mapper);
                        reporter.track(vpaid);

                        EVENTS.forEach(function(event) {
                            vpaid.emit(event);
                        });
                    });

                    it('should call the mapper every time it fires a pixel', function() {
                        expect(mapper.calls.count()).toBe(getPixelSrcs().length, 'Mapper was not called for each pixel.');
                        expect(mapper.calls.all().map(function(call) { return call.returnValue; })).toEqual(getPixelSrcs());
                    });
                });
            });
        });
    });
});
