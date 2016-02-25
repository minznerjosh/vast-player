'use strict';

var proxyquire = require('proxyquire');
var EventEmitter = require('events').EventEmitter;
var VAST = require('vastacular').VAST;
var LiePromise = require('lie');
var JavaScriptVPAID = require('../../lib/players/JavaScriptVPAID');
var FlashVPAID = require('../../lib/players/FlashVPAID');
var HTMLVideo = require('../../lib/players/HTMLVideo');
var EVENTS = require('../../lib/enums/VPAID_EVENTS');

describe('VASTPlayer(container, config)', function() {
    var VASTPlayer;
    var EventProxy, PixelReporter;
    var stubs;

    beforeEach(function() {
        EventProxy = jasmine.createSpy('EventProxy()').and.callFake(function(events) {
            var EventProxy_ = require('../../lib/EventProxy');
            var proxy = new EventProxy_(events);

            spyOn(proxy, 'from').and.callThrough();
            spyOn(proxy, 'to').and.callThrough();

            return proxy;
        });
        PixelReporter = jasmine.createSpy('PixelReporter()').and.callFake(function(events, mapper) {
            var PixelReporter_ = require('../../lib/PixelReporter');
            var reporter = new PixelReporter_(events, mapper);

            spyOn(reporter, 'track').and.callThrough();

            return reporter;
        });

        stubs = {
            'events': require('events'),
            'vastacular': require('vastacular'),
            './players/JavaScriptVPAID': JavaScriptVPAID,
            './players/FlashVPAID': FlashVPAID,
            './players/HTMLVideo': HTMLVideo,
            './EventProxy': EventProxy,
            './PixelReporter': PixelReporter,

            '@noCallThru': true
        };

        spyOn(VAST, 'fetch').and.callThrough();

        VASTPlayer = proxyquire('../../lib/VASTPlayer', stubs);
    });

    it('should exist', function() {
        expect(VASTPlayer).toEqual(jasmine.any(Function));
        expect(VASTPlayer.name).toEqual('VASTPlayer');
    });

    describe('static:', function() {
        describe('properties:', function() {
            describe('vpaidSWFLocation', function() {
                it('should be "https://cdn.jsdelivr.net/vast-player/__VERSION__/vast-player--vpaid.swf"', function() {
                    expect(VASTPlayer.vpaidSWFLocation).toBe('https://cdn.jsdelivr.net/vast-player/__VERSION__/vast-player--vpaid.swf');
                    expect('__VERSION__').toBe(require('../../package.json').version, 'browserify-versionify is not working.');
                });
            });
        });
    });

    describe('instance:', function() {
        var player;
        var container, config;

        beforeEach(function() {
            container = document.createElement('div');
            container.style.width = '800px';
            container.style.height = '600px';
            document.body.appendChild(container);

            config = {
                vast: {
                    resolveWrappers: true,
                    maxRedirects: 10,
                    headers: { 'Cache-Control': 'no-cache' }
                },
                tracking: {
                    mapper: function() {}
                }
            };

            player = new VASTPlayer(container, config);
        });

        afterEach(function() {
            document.body.removeChild(container);
        });

        it('should be an EventEmitter', function() {
            expect(player).toEqual(jasmine.any(EventEmitter));
        });

        describe('properties:', function() {
            describe('container', function() {
                it('should be the provided container', function() {
                    expect(player.container).toBe(container);
                });

                it('should not be settable', function() {
                    player.container = 'changed';
                    expect(player.container).toBe(container);
                });
            });

            describe('config', function() {
                it('should equal the provided config', function() {
                    expect(player.config).toEqual(config);
                    expect(player.config).not.toBe(config);
                });

                it('should not be settable', function() {
                    player.config = 'changed';
                    expect(player.config).toEqual(config);
                });

                describe('if the config is minimal', function() {
                    beforeEach(function() {
                        config = {};

                        player = new VASTPlayer(container, config);
                    });

                    it('should be given defaults', function() {
                        expect(player.config).toEqual({
                            vast: {
                                resolveWrappers: true,
                                maxRedirects: 5
                            },
                            tracking: {
                                mapper: jasmine.any(Function)
                            }
                        });
                        expect(player.config.tracking.mapper('foo')).toBe('foo', 'default mapper is not an identity fn');
                    });
                });

                describe('if a config is not specified', function() {
                    beforeEach(function() {
                        player = new VASTPlayer(container);
                    });

                    it('should be given defaults', function() {
                        expect(player.config).toEqual({
                            vast: {
                                resolveWrappers: true,
                                maxRedirects: 5
                            },
                            tracking: {
                                mapper: jasmine.any(Function)
                            }
                        });
                        expect(player.config.tracking.mapper('foo')).toBe('foo', 'default mapper is not an identity fn');
                    });
                });
            });

            describe('vast', function() {
                it('should be null', function() {
                    expect(player.vast).toBeNull();
                });

                it('should not be settable', function() {
                    player.vast = 'changed';
                    expect(player.vast).toBeNull();
                });
            });

            describe('ready', function() {
                it('should be false', function() {
                    expect(player.ready).toBe(false);
                });

                it('should not be settable', function() {
                    player.ready = 'changed';
                    expect(player.ready).toBe(false);
                });
            });

            ['adRemainingTime', 'adDuration', 'adVolume'].forEach(function(property) {
                describe(property, function() {
                    beforeEach(function() {
                        player.__private__.player = {};
                        player.__private__.player[property] = {};
                    });

                    describe('before the player is ready', function() {
                        beforeEach(function() {
                            player.__private__.ready = false;
                        });

                        describe('getting', function() {
                            it('should throw an Error', function() {
                                expect(function() { return player[property]; }).toThrow(new Error('VASTPlayer not ready.'));
                            });
                        });

                        describe('setting', function() {
                            it('should throw an Error', function() {
                                expect(function() { player[property] = {}; }).toThrow(new Error('VASTPlayer not ready.'));
                            });
                        });
                    });

                    describe('after the player is ready', function() {
                        beforeEach(function() {
                            player.__private__.ready = true;
                        });

                        describe('getting', function() {
                            it('should return the value of the player', function() {
                                expect(player[property]).toBe(player.__private__.player[property]);
                            });
                        });

                        describe('setting', function() {
                            var value;

                            beforeEach(function() {
                                value = {};

                                player[property] = value;
                            });

                            it('should set the value of the player', function() {
                                expect(player.__private__.player[property]).toBe(value);
                            });
                        });
                    });
                });
            });
        });

        describe('methods', function() {
            describe('load(uri)', function() {
                var uri;
                var success, failure;
                var resolve, reject;
                var result;

                beforeEach(function() {
                    uri = 'https://platform-staging.reelcontent.com/api/public/vast/2.0/tag?campaign=cam-e951792a909f17';

                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    VAST.fetch.and.returnValue(new LiePromise(function(/*resolve, reject*/) {
                        resolve = arguments[0];
                        reject = arguments[1];
                    }));

                    result = player.load(uri);
                    result.then(success, failure);
                });

                it('should fetch the VAST', function() {
                    expect(VAST.fetch).toHaveBeenCalledWith(uri, player.config.vast);
                });

                describe('if fetching the VAST fails', function() {
                    var reason;
                    var error;

                    beforeEach(function(done) {
                        error = jasmine.createSpy('error()');
                        player.on('error', error);

                        reason = new Error('It didn\'t work!');
                        reject(reason);

                        result.then(done, done);
                    });

                    it('should emit "error"', function() {
                        expect(error).toHaveBeenCalledWith(reason);
                    });

                    it('should reject the promise', function() {
                        expect(failure).toHaveBeenCalledWith(reason);
                    });
                });

                describe('when the VAST is fetched', function() {
                    var vast;
                    var resolvePlayerLoad, rejectPlayerLoad;
                    var proxy, reporter;

                    beforeEach(function() {
                        vast = new VAST({
                            version: '2.0',
                            ads: [
                                {
                                    type: 'inline',
                                    system: {
                                        name: 'The System'
                                    },
                                    title: 'My Awesome Ad!',
                                    errors: ['http://tracking.com/error'],
                                    impressions: [
                                        { uri: 'http://tracking.com/impression' }
                                    ],
                                    creatives: [
                                        {
                                            type: 'linear',
                                            duration: 30,
                                            parameters: 'foo=bar&bar=foo',
                                            mediaFiles: [
                                                { type: 'video/x-flv', width: 300, height: 200, uri: 'http://videos.com/video1.flv' },
                                                { type: 'video/x-flv', width: 400, height: 300, uri: 'http://videos.com/video2.flv' },
                                                { type: 'video/x-flv', width: 500, height: 400, uri: 'http://videos.com/video3.flv' },
                                                { type: 'application/javascript', width: 500, height: 400, uri: 'http://videos.com/vpaid.js', apiFramework: 'VPAID' },
                                                { type: 'video/mp4', width: 300, height: 200, uri: 'http://videos.com/video1.mp4' },
                                                { type: 'video/mp4', width: 400, height: 300, uri: 'http://videos.com/video2.mp4' },
                                                { type: 'video/mp4', width: 500, height: 400, uri: 'http://videos.com/video3.mp4' },
                                                { type: 'application/x-shockwave-flash', width: 500, height: 400, uri: 'http://videos.com/vpaid.swf', apiFramework: 'VPAID' },
                                                { type: 'video/webm', width: 300, height: 200, uri: 'http://videos.com/video1.webm' },
                                                { type: 'video/webm', width: 400, height: 300, uri: 'http://videos.com/video2.webm' },
                                                { type: 'video/webm', width: 500, height: 400, uri: 'http://videos.com/video3.webm' },
                                                { type: 'video/3gp', width: 300, height: 200, uri: 'http://videos.com/video1.3gp' },
                                                { type: 'video/3gp', width: 400, height: 300, uri: 'http://videos.com/video2.3gp' },
                                                { type: 'video/3gp', width: 500, height: 400, uri: 'http://videos.com/video3.3gp' },
                                            ],
                                            videoClicks: {
                                                clickThrough: ['http://www.my-site.com'],
                                                clickTrackings: ['http://cinema6.com/pixels/click'],
                                                customClicks: []
                                            },
                                            trackingEvents: [
                                                { event: 'start', uri: 'http://cinema6.com/pixels/start' },
                                                { event: 'midpoint', uri: 'http://cinema6.com/pixels/midpoint' }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        });

                        expect(vast.validate().valid).toBe(true, vast.validate());
                    });

                    describe('if there are no VPAID creatives', function() {
                        beforeEach(function(done) {
                            spyOn(HTMLVideo.prototype, 'load').and.returnValue(new LiePromise(function(/*resolve, reject*/) {
                                resolvePlayerLoad = arguments[0];
                                rejectPlayerLoad = arguments[1];
                            }));

                            vast.set('ads[0].creatives[0].mediaFiles', vast.filter('ads[0].creatives[0].mediaFiles', function(mediaFile) {
                                return mediaFile.apiFramework !== 'VPAID';
                            }));

                            resolve(vast);
                            LiePromise.resolve().then(function() {
                                proxy = EventProxy.calls.mostRecent().returnValue;
                                reporter = PixelReporter.calls.mostRecent().returnValue;
                            }).then(done, done.fail);
                        });

                        it('should set the vast property', function() {
                            expect(player.vast).toBe(vast);
                        });

                        it('should create a HTMLVideo player', function() {
                            expect(player.__private__.player).toEqual(jasmine.any(HTMLVideo));
                            expect(player.__private__.player.container).toBe(container);
                        });

                        it('should proxy VPAID events from the player to itself', function() {
                            expect(EventProxy).toHaveBeenCalledWith(EVENTS);
                            expect(proxy.from).toHaveBeenCalledWith(player.__private__.player);
                            expect(proxy.to).toHaveBeenCalledWith(player);
                        });

                        it('should fire pixels in response to events', function() {
                            expect(PixelReporter).toHaveBeenCalledWith([].concat(
                                vast.get('ads[0].impressions').map(function(impression) {
                                    return { event: 'impression', uri: impression.uri };
                                }),
                                vast.get('ads[0].errors').map(function(uri) {
                                    return { event: 'error', uri: uri };
                                }),
                                vast.get('ads[0].creatives[0].trackingEvents'),
                                vast.get('ads[0].creatives[0].videoClicks.clickTrackings').map(function(uri) {
                                    return { event: 'clickThrough', uri: uri };
                                })
                            ), player.config.tracking.mapper);
                        });

                        it('should load() the HTMLVideo player', function() {
                            expect(player.__private__.player.load).toHaveBeenCalledWith(vast.get('ads[0].creatives[0].mediaFiles'), vast.get('ads[0].creatives[0].parameters'));
                        });

                        describe('when the HTMLVideo player is loaded', function() {
                            var ready;

                            beforeEach(function(done) {
                                ready = jasmine.createSpy('ready()');
                                player.on('ready', ready);

                                player.__private__.player.video = document.createElement('video');
                                player.__private__.player.video.volume = 1;

                                resolvePlayerLoad(player.__private__.player);
                                result.then(done, done);
                            });

                            it('should fire pixels', function() {
                                expect(reporter.track).toHaveBeenCalledWith(player.__private__.player);
                            });

                            it('should fulfill the promise', function() {
                                expect(success).toHaveBeenCalledWith(player);
                            });

                            it('should set ready to true', function() {
                                expect(player.ready).toBe(true);
                            });

                            it('should emit "ready"', function() {
                                expect(ready).toHaveBeenCalledWith();
                            });
                        });
                    });

                    describe('if there is a JS and SWF VPAID mediaFile', function() {
                        beforeEach(function(done) {
                            spyOn(JavaScriptVPAID.prototype, 'load').and.returnValue(new LiePromise(function(/*resolve, reject*/) {
                                resolvePlayerLoad = arguments[0];
                                rejectPlayerLoad = arguments[1];
                            }));

                            expect(vast.find('ads[0].creatives[0].mediaFiles', function(mediaFile) {
                                return mediaFile.apiFramework === 'VPAID' && mediaFile.type === 'application/javascript';
                            })).toEqual(jasmine.any(Object));
                            expect(vast.find('ads[0].creatives[0].mediaFiles', function(mediaFile) {
                                return mediaFile.apiFramework === 'VPAID' && mediaFile.type === 'application/x-shockwave-flash';
                            })).toEqual(jasmine.any(Object));

                            resolve(vast);
                            LiePromise.resolve().then(function() {
                                proxy = EventProxy.calls.mostRecent().returnValue;
                                reporter = PixelReporter.calls.mostRecent().returnValue;
                            }).then(done, done.fail);
                        });

                        it('should create a JavaScriptVPAID player', function() {
                            expect(player.__private__.player).toEqual(jasmine.any(JavaScriptVPAID));
                            expect(player.__private__.player.container).toBe(container);
                        });

                        it('should load() the JavaScriptVPAID() player', function() {
                            expect(player.__private__.player.load).toHaveBeenCalledWith(vast.filter('ads[0].creatives[0].mediaFiles', function(mediaFile) {
                                return mediaFile.apiFramework === 'VPAID' && mediaFile.type === 'application/javascript';
                            }), vast.get('ads[0].creatives[0].parameters'));
                        });

                        it('should set the vast property', function() {
                            expect(player.vast).toBe(vast);
                        });

                        it('should proxy VPAID events from the player to itself', function() {
                            expect(EventProxy).toHaveBeenCalledWith(EVENTS);
                            expect(proxy.from).toHaveBeenCalledWith(player.__private__.player);
                            expect(proxy.to).toHaveBeenCalledWith(player);
                        });

                        it('should fire pixels in response to events', function() {
                            expect(PixelReporter).toHaveBeenCalledWith([].concat(
                                vast.get('ads[0].impressions').map(function(impression) {
                                    return { event: 'impression', uri: impression.uri };
                                }),
                                vast.get('ads[0].errors').map(function(uri) {
                                    return { event: 'error', uri: uri };
                                }),
                                vast.get('ads[0].creatives[0].trackingEvents'),
                                vast.get('ads[0].creatives[0].videoClicks.clickTrackings').map(function(uri) {
                                    return { event: 'clickThrough', uri: uri };
                                })
                            ), player.config.tracking.mapper);
                        });

                        describe('when the JavaScriptVPAID player is loaded', function() {
                            var ready;

                            beforeEach(function(done) {
                                ready = jasmine.createSpy('ready()');
                                player.on('ready', ready);

                                player.__private__.player.api = { getAdVolume: jasmine.createSpy('getAdVolume()').and.returnValue(1) };
                                resolvePlayerLoad(player.__private__.player);

                                result.then(done, done);
                            });

                            it('should fire pixels', function() {
                                expect(reporter.track).toHaveBeenCalledWith(player.__private__.player);
                            });

                            it('should fulfill the promise', function() {
                                expect(success).toHaveBeenCalledWith(player);
                            });

                            it('should set ready to true', function() {
                                expect(player.ready).toBe(true);
                            });

                            it('should emit "ready"', function() {
                                expect(ready).toHaveBeenCalledWith();
                            });
                        });
                    });

                    describe('if there is only a SWF VPAID mediaFile', function() {
                        beforeEach(function(done) {
                            spyOn(FlashVPAID.prototype, 'load').and.returnValue(new LiePromise(function(/*resolve, reject*/) {
                                resolvePlayerLoad = arguments[0];
                                rejectPlayerLoad = arguments[1];
                            }));

                            vast.set('ads[0].creatives[0].mediaFiles', vast.filter('ads[0].creatives[0].mediaFiles', function(mediaFile) {
                                return mediaFile.type !== 'application/javascript';
                            }));
                            expect(vast.find('ads[0].creatives[0].mediaFiles', function(mediaFile) {
                                return mediaFile.apiFramework === 'VPAID' && mediaFile.type === 'application/javascript';
                            })).toBeUndefined();
                            expect(vast.find('ads[0].creatives[0].mediaFiles', function(mediaFile) {
                                return mediaFile.apiFramework === 'VPAID' && mediaFile.type === 'application/x-shockwave-flash';
                            })).toEqual(jasmine.any(Object));

                            resolve(vast);
                            LiePromise.resolve().then(function() {
                                proxy = EventProxy.calls.mostRecent().returnValue;
                                reporter = PixelReporter.calls.mostRecent().returnValue;
                            }).then(done, done.fail);
                        });

                        it('should create a FlashVPAID() player', function() {
                            expect(player.__private__.player).toEqual(jasmine.any(FlashVPAID));
                            expect(player.__private__.player.container).toBe(container);
                        });

                        it('should load() the FlashVPAID() player', function() {
                            expect(player.__private__.player.load).toHaveBeenCalledWith(vast.filter('ads[0].creatives[0].mediaFiles', function(mediaFile) {
                                return mediaFile.apiFramework === 'VPAID' && mediaFile.type === 'application/x-shockwave-flash';
                            }), vast.get('ads[0].creatives[0].parameters'));
                        });

                        it('should set the vast property', function() {
                            expect(player.vast).toBe(vast);
                        });

                        it('should proxy VPAID events from the player to itself', function() {
                            expect(EventProxy).toHaveBeenCalledWith(EVENTS);
                            expect(proxy.from).toHaveBeenCalledWith(player.__private__.player);
                            expect(proxy.to).toHaveBeenCalledWith(player);
                        });

                        it('should fire pixels in response to events', function() {
                            expect(PixelReporter).toHaveBeenCalledWith([].concat(
                                vast.get('ads[0].impressions').map(function(impression) {
                                    return { event: 'impression', uri: impression.uri };
                                }),
                                vast.get('ads[0].errors').map(function(uri) {
                                    return { event: 'error', uri: uri };
                                }),
                                vast.get('ads[0].creatives[0].trackingEvents'),
                                vast.get('ads[0].creatives[0].videoClicks.clickTrackings').map(function(uri) {
                                    return { event: 'clickThrough', uri: uri };
                                })
                            ), player.config.tracking.mapper);
                        });

                        describe('when the FlashVPAID player is loaded', function() {
                            var ready;

                            beforeEach(function(done) {
                                ready = jasmine.createSpy('ready()');
                                player.on('ready', ready);

                                player.__private__.player.api = { getAdVolume: jasmine.createSpy('getAdVolume()').and.returnValue(1) };
                                resolvePlayerLoad(player.__private__.player);

                                result.then(done, done);
                            });

                            it('should fire pixels', function() {
                                expect(reporter.track).toHaveBeenCalledWith(player.__private__.player);
                            });

                            it('should fulfill the promise', function() {
                                expect(success).toHaveBeenCalledWith(player);
                            });

                            it('should set ready to true', function() {
                                expect(player.ready).toBe(true);
                            });

                            it('should emit "ready"', function() {
                                expect(ready).toHaveBeenCalledWith();
                            });
                        });
                    });
                });
            });

            describe('for playback', function() {
                beforeEach(function() {
                    player.__private__.player = new HTMLVideo(container);
                });

                ['startAd', 'stopAd', 'pauseAd', 'resumeAd'].forEach(function(method) {
                    describe(method + '()', function() {
                        var success, failure;
                        var resolve, reject;

                        beforeEach(function() {
                            success = jasmine.createSpy('success()');
                            failure = jasmine.createSpy('failure()');

                            spyOn(player.__private__.player, method).and.returnValue(new LiePromise(function(/*resolve, reject*/) {
                                resolve = arguments[0];
                                reject = arguments[1];
                            }));
                        });

                        describe('before the player is ready', function() {
                            beforeEach(function(done) {
                                player.__private__.ready = false;

                                player[method]().then(success, failure).then(done, done.fail);
                            });

                            it('should not call the player method', function() {
                                expect(player.__private__.player[method]).not.toHaveBeenCalled();
                            });

                            it('should return a rejected promise', function() {
                                expect(failure).toHaveBeenCalledWith(new Error('VASTPlayer not ready.'));
                            });
                        });

                        describe('after the player is ready', function() {
                            beforeEach(function(done) {
                                player.__private__.ready = true;

                                player[method]().then(success, failure);
                                LiePromise.resolve().then(done);
                            });

                            it('should call startAd() on the player', function() {
                                expect(player.__private__.player[method]).toHaveBeenCalledWith();
                            });

                            describe('when the Promise is resolved', function() {
                                beforeEach(function(done) {
                                    expect(success).not.toHaveBeenCalled();

                                    resolve(player.__private__.player);
                                    LiePromise.resolve().then(function() {}).then(done);
                                });

                                it('should fulfill with itself', function() {
                                    expect(success).toHaveBeenCalledWith(player);
                                });
                            });
                        });
                    });
                });
            });
        });

        describe('events:', function() {
            describe(EVENTS.AdClickThru, function() {
                var url, id, playerHandles;

                beforeEach(function() {
                    id = null;

                    player.__private__.vast = new VAST({
                        version: '2.0',
                        ads: [
                            {
                                type: 'inline',
                                system: {
                                    name: 'The System'
                                },
                                title: 'My Awesome Ad!',
                                impressions: [
                                    { uri: 'http://tracking.com/impression' }
                                ],
                                creatives: [
                                    {
                                        type: 'linear',
                                        duration: 30,
                                        mediaFiles: [
                                            { type: 'video/mp4', width: 300, height: 200, uri: 'http://videos.com/video1.mp4' },
                                        ],
                                        videoClicks: {
                                            clickThrough: ['http://www.my-site.com'],
                                            clickTrackings: ['http://cinema6.com/pixels/click'],
                                            customClicks: []
                                        },
                                        trackingEvents: []
                                    }
                                ]
                            }
                        ]
                    });

                    expect(player.vast.validate().valid).toBe(true, player.vast.validate());

                    spyOn(window, 'open');
                });

                describe('if the url is not specified', function() {
                    beforeEach(function() {
                        url = null;
                    });

                    describe('if playerHandles is false', function() {
                        beforeEach(function() {
                            playerHandles = false;

                            player.emit(EVENTS.AdClickThru, url, id, playerHandles);
                        });

                        it('should do nothing', function() {
                            expect(window.open).not.toHaveBeenCalled();
                        });
                    });

                    describe('if playerHandles is true', function() {
                        beforeEach(function() {
                            playerHandles = true;

                            player.emit(EVENTS.AdClickThru, url, id, playerHandles);
                        });

                        it('should open the URL specified in the VAST', function() {
                            expect(window.open).toHaveBeenCalledWith(player.vast.get('ads[0].creatives[0].videoClicks.clickThrough'));
                        });

                        describe('if there are no videoClicks', function() {
                            beforeEach(function() {
                                window.open.calls.reset();
                                delete player.vast.ads[0].creatives[0].videoClicks;

                                player.emit(EVENTS.AdClickThru, url, id, playerHandles);
                            });

                            it('should not open a new window', function() {
                                expect(window.open).not.toHaveBeenCalled();
                            });
                        });
                    });
                });

                describe('if the url is specified', function() {
                    beforeEach(function() {
                        url = 'http://my-awesome-product.com/buy-it';
                    });

                    describe('if playerHandles is false', function() {
                        beforeEach(function() {
                            playerHandles = false;

                            player.emit(EVENTS.AdClickThru, url, id, playerHandles);
                        });

                        it('should do nothing', function() {
                            expect(window.open).not.toHaveBeenCalled();
                        });
                    });

                    describe('if playerHandles is true', function() {
                        beforeEach(function() {
                            playerHandles = true;

                            player.emit(EVENTS.AdClickThru, url, id, playerHandles);
                        });

                        it('should open the URL specified in the event', function() {
                            expect(window.open).toHaveBeenCalledWith(url);
                        });
                    });
                });
            });
        });
    });
});
