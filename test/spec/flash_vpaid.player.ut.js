'use strict';

var proxyquire = require('proxyquire');
var LiePromise = require('lie');
var VPAID = require('../../lib/players/VPAID');
var VPAID_EVENTS = require('../../lib/enums/VPAID_EVENTS');
var resolveURL = require('url').resolve;
var querystring = require('querystring');
var VPAIDVersion = require('../../lib/VPAIDVersion');

describe('FlashVPAID(container, swfURI)', function() {
    var FlashVPAID;
    var uuid;
    var stubs;

    function getVPAIDAd(player) {
        var vpaid = jasmine.createSpyObj('vpaid', [
            'getAdLinear',
            'getAdWidth',
            'getAdHeight',
            'getAdExpanded',
            'getAdSkippableState',
            'getAdRemainingTime',
            'getAdDuration',
            'getAdVolume',
            'setAdVolume',
            'getAdCompanions',
            'getAdIcons',
            'handshakeVersion',
            'initAd',
            'resizeAd',
            'startAd',
            'stopAd',
            'pauseAd',
            'resumeAd',
            'expandAd',
            'collapseAd',
            'skipAd'
        ]);

        Object.keys(vpaid).forEach(function(method) {
            player[method] = vpaid[method];
        });

        return player;
    }

    beforeEach(function() {
        uuid = jasmine.createSpy('uuid()').and.callFake(require('../../lib/uuid'));

        stubs = {
            'events': require('events'),
            'lie': LiePromise,
            './VPAID': VPAID,
            '../uuid': uuid,
            '../VPAIDVersion': VPAIDVersion,

            '@noCallThru': true
        };

        FlashVPAID = proxyquire('../../lib/players/FlashVPAID', stubs);
    });

    it('should exist', function() {
        expect(FlashVPAID).toEqual(jasmine.any(Function));
        expect(FlashVPAID.name).toEqual('FlashVPAID');
    });

    describe('instance:', function() {
        var container, swfURI;
        var player;

        beforeEach(function() {
            container = document.createElement('div');
            container.style.width = '800px';
            container.style.height = '600px';
            document.body.appendChild(container);
            swfURI = 'swf/vpaid.swf';

            player = new FlashVPAID(container, swfURI);
        });

        afterEach(function() {
            document.body.removeChild(container);
        });

        it('should exist', function() {
            expect(player).toEqual(jasmine.any(VPAID));
        });

        describe('properties:', function() {
            describe('object', function() {
                it('should be null', function() {
                    expect(player.object).toBeNull();
                });
            });

            describe('swfURI', function() {
                it('should be the swfURI', function() {
                    expect(player.swfURI).toBe(swfURI);
                });
            });
        });

        describe('methods:', function() {
            describe('load(mediaFiles, parameters)', function() {
                var mediaFiles, parameters;
                var success, failure;
                var object, eventFnName, eventCallback;
                var result;

                beforeEach(function() {
                    mediaFiles = [
                        { type: 'application/x-shockwave-flash', bitrate: 500, width: 500, height: 400, uri: 'http://videos.com/vpaid.swf', apiFramework: 'VPAID' }
                    ];
                    parameters = 'foo=bar&bar=foo';

                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    result = player.load(mediaFiles, parameters);
                    result.then(success, failure);

                    object = container.children[0];
                    eventFnName = 'vast_player__' + uuid.calls.mostRecent().returnValue;
                    eventCallback = window[eventFnName];
                });

                afterEach(function() {
                    uuid.calls.all().forEach(function(call) {
                        delete window['vast-player__' + call.returnValue];
                    });
                });

                it('should return a Promise', function() {
                    expect(result).toEqual(jasmine.any(LiePromise));
                });

                it('should create an <object> in the container', function() {
                    expect(container.children.length).toBe(1);
                    expect(object.tagName).toBe('OBJECT');
                    expect(object.type).toBe('application/x-shockwave-flash');
                    expect(object.data).toBe(resolveURL(window.location.href, swfURI + '?' + querystring.stringify({
                        vpaidURI: mediaFiles[0].uri,
                        eventCallback: 'vast_player__' + uuid.calls.mostRecent().returnValue
                    })));
                    expect(object.style.display).toBe('block');
                    expect(object.style.width).toBe('100%');
                    expect(object.style.height).toBe('100%');
                    expect(object.style.border).toBe('none');
                    expect(object.style.opacity).toBe('0');
                    expect(object.querySelector('param[name="movie"]').getAttribute('value')).toBe(swfURI, 'param[movie]');
                    expect(object.querySelector('param[name="flashvars"]').getAttribute('value')).toBe(querystring.stringify({
                        vpaidURI: mediaFiles[0].uri,
                        eventCallback: 'vast_player__' + uuid.calls.mostRecent().returnValue
                    }), 'param[flashvars]');
                    expect(object.querySelector('param[name="quality"]').getAttribute('value')).toBe('high', 'param[quality]');
                    expect(object.querySelector('param[name="play"]').getAttribute('value')).toBe('false', 'param[play]');
                    expect(object.querySelector('param[name="loop"]').getAttribute('value')).toBe('false', 'param[loop]');
                    expect(object.querySelector('param[name="wmode"]').getAttribute('value')).toBe('opaque', 'param[wmode]');
                    expect(object.querySelector('param[name="scale"]').getAttribute('value')).toBe('noscale', 'param[scale]');
                    expect(object.querySelector('param[name="salign"]').getAttribute('value')).toBe('lt', 'param[salign]');
                    expect(object.querySelector('param[name="allowScriptAccess"]').getAttribute('value')).toBe('always', 'param[allowScriptAccess]');
                });

                it('should save a reference to the object', function() {
                    expect(player.object).toBe(object);
                });

                it('should create a global Function', function() {
                    expect(uuid).toHaveBeenCalledWith(20);
                    expect(window[eventFnName]).toEqual(jasmine.any(Function), eventFnName + ' does not exist!');
                });

                [
                    VPAID_EVENTS.AdLoaded,
                    VPAID_EVENTS.AdStarted,
                    VPAID_EVENTS.AdStopped,
                    VPAID_EVENTS.AdSkipped,
                    VPAID_EVENTS.AdSkippableStateChange,
                    VPAID_EVENTS.AdSizeChange,
                    VPAID_EVENTS.AdLinearChange,
                    VPAID_EVENTS.AdDurationChange,
                    VPAID_EVENTS.AdExpandedChange,
                    VPAID_EVENTS.AdRemainingTimeChange,
                    VPAID_EVENTS.AdVolumeChange,
                    VPAID_EVENTS.AdImpression,
                    VPAID_EVENTS.AdVideoStart,
                    VPAID_EVENTS.AdVideoFirstQuartile,
                    VPAID_EVENTS.AdVideoMidpoint,
                    VPAID_EVENTS.AdVideoThirdQuartile,
                    VPAID_EVENTS.AdVideoComplete,
                    VPAID_EVENTS.AdUserAcceptInvitation,
                    VPAID_EVENTS.AdUserMinimize,
                    VPAID_EVENTS.AdUserClose,
                    VPAID_EVENTS.AdPaused,
                    VPAID_EVENTS.AdPlaying,
                    VPAID_EVENTS.AdPlaying,
                    'VPAIDInterfaceReady'
                ].forEach(function(type) {
                    describe('when the eventCallback is called with a "' + type + '" event', function() {
                        var event;
                        var spy;

                        beforeEach(function() {
                            event = { type: type };

                            spy = jasmine.createSpy(type + '()');
                            player.on(type, spy);

                            object.handshakeVersion = jasmine.createSpy('vpaid.handshakeVersion()').and.returnValue('2.0');
                            object.initAd = jasmine.createSpy('vpaid.initAd()');

                            eventCallback(event);
                        });

                        it('should emit ' + type, function() {
                            expect(spy).toHaveBeenCalledWith();
                        });
                    });
                });

                describe('when the eventCallback is called with a "' + VPAID_EVENTS.AdClickThru + '"', function() {
                    var event;
                    var spy;

                    beforeEach(function() {
                        event = { type: VPAID_EVENTS.AdClickThru, url: 'http://www.my-site.com/', Id: 'the-id', playerHandles: true };

                        spy = jasmine.createSpy(VPAID_EVENTS.AdClickThru + '()');
                        player.on(VPAID_EVENTS.AdClickThru, spy);

                        eventCallback(event);
                    });

                    it('should emit ' + VPAID_EVENTS.AdClickThru, function() {
                        expect(spy).toHaveBeenCalledWith(event.url, event.Id, event.playerHandles);
                    });
                });

                describe('when the eventCallback is called with a "' + VPAID_EVENTS.AdInteraction + '"', function() {
                    var event;
                    var spy;

                    beforeEach(function() {
                        event = { type: VPAID_EVENTS.AdInteraction, Id: 'the-id' };

                        spy = jasmine.createSpy(VPAID_EVENTS.AdInteraction + '()');
                        player.on(VPAID_EVENTS.AdInteraction, spy);

                        eventCallback(event);
                    });

                    it('should emit ' + VPAID_EVENTS.AdInteraction, function() {
                        expect(spy).toHaveBeenCalledWith(event.Id);
                    });
                });

                describe('when the eventCallback is called with a "' + VPAID_EVENTS.AdLog + '"', function() {
                    var event;
                    var spy;

                    beforeEach(function() {
                        event = { type: VPAID_EVENTS.AdLog, Id: 'the-id' };

                        spy = jasmine.createSpy(VPAID_EVENTS.AdLog + '()');
                        player.on(VPAID_EVENTS.AdLog, spy);

                        eventCallback(event);
                    });

                    it('should emit ' + VPAID_EVENTS.AdLog, function() {
                        expect(spy).toHaveBeenCalledWith(event.Id);
                    });
                });

                describe('when the eventCallback is called with a "' + VPAID_EVENTS.AdError + '"', function() {
                    var event;
                    var spy;

                    beforeEach(function() {
                        event = { type: VPAID_EVENTS.AdError, message: 'It went wrong!' };

                        spy = jasmine.createSpy(VPAID_EVENTS.AdError + '()');
                        player.on(VPAID_EVENTS.AdError, spy);

                        eventCallback(event);
                    });

                    it('should emit ' + VPAID_EVENTS.AdError, function() {
                        expect(spy).toHaveBeenCalledWith(event.message);
                    });
                });

                describe('when the SWF triggers "VPAIDInterfaceReady"', function() {
                    beforeEach(function() {
                        getVPAIDAd(object);
                    });

                    ['1.0', '1.1', '2.0', '2.0.1', '1.0.1'].forEach(function(version) {
                        describe('and handshakeVersion() returns ' + version, function() {
                            beforeEach(function() {
                                object.handshakeVersion.and.returnValue(version);

                                player.emit('VPAIDInterfaceReady');
                            });

                            it('should call handshakeVersion()', function() {
                                expect(object.handshakeVersion).toHaveBeenCalledWith('2.0');
                            });

                            it('should set the vpaidVersion', function() {
                                expect(player.vpaidVersion).toEqual(new VPAIDVersion(version));
                            });

                            it('should call initAd()', function() {
                                expect(object.initAd).toHaveBeenCalledWith(800, 600, 'normal', mediaFiles[0].bitrate, parameters, null);
                            });

                            describe('and emits "AdLoaded"', function() {
                                beforeEach(function(done) {
                                    player.emit(VPAID_EVENTS.AdLoaded);
                                    result.then(done, done);
                                });

                                it('should set the api to the object', function() {
                                    expect(player.api).toBe(object);
                                });

                                it('should show the object', function() {
                                    expect(object.style.opacity).toBe('1');
                                });

                                it('should fulfill the Promise', function() {
                                    expect(success).toHaveBeenCalledWith(player);
                                });

                                describe('then emits "AdStopped"', function() {
                                    beforeEach(function() {
                                        player.emit(VPAID_EVENTS.AdStopped);
                                    });

                                    it('should remove the object from the DOM', function() {
                                        expect(document.contains(object)).toBe(false, 'object is still in the DOM!');
                                    });

                                    it('should set the api and object to null', function() {
                                        expect(player.api).toBeNull('player.api is not null!');
                                        expect(player.object).toBeNull('player.object is not null!');
                                    });

                                    it('should remove the global Function', function() {
                                        expect(eventFnName in window).toBe(false, eventFnName + ' is still a window property.');
                                    });
                                });
                            });

                            describe('and emits "AdError"', function() {
                                var error;

                                beforeEach(function(done) {
                                    error = 'There was a problem!';

                                    player.api = object;

                                    player.emit(VPAID_EVENTS.AdError, error);
                                    result.then(done, done);
                                });

                                it('should reject the Promise', function() {
                                    expect(failure).toHaveBeenCalledWith(new Error(error));
                                });

                                it('should remove the object from the DOM', function() {
                                    expect(document.contains(object)).toBe(false, 'object is still in the DOM!');
                                });

                                it('should set the api and object to null', function() {
                                    expect(player.api).toBeNull('player.api is not null!');
                                    expect(player.object).toBeNull('player.object is not null!');
                                });

                                it('should remove the global Function', function() {
                                    expect(eventFnName in window).toBe(false, eventFnName + ' is still a window property.');
                                });
                            });
                        });
                    });

                    ['3.0', '3', '3.1.1', '4.2', '4.0'].forEach(function(version) {
                        describe('if the VPAID version is ' + version, function() {
                            beforeEach(function(done) {
                                object.handshakeVersion.and.returnValue(version);

                                player.emit('VPAIDInterfaceReady');
                                result.then(done, done);
                            });

                            it('should reject the Promise', function() {
                                expect(failure).toHaveBeenCalledWith(new Error('VPAID version ' + version + ' is not supported.'));
                            });

                            it('should not call initAd()', function() {
                                expect(object.initAd).not.toHaveBeenCalled();
                            });
                        });
                    });
                });
            });
        });
    });
});
