'use strict';

var proxyquire = require('proxyquire');
var EventEmitter = require('events').EventEmitter;
var LiePromise = require('lie');
var VPAID = require('../../lib/players/VPAID');
var VPAID_EVENTS = require('../../lib/enums/VPAID_EVENTS');
var environment = require('../../lib/environment');
var VPAIDVersion = require('../../lib/VPAIDVersion');

describe('JavaScriptVPAID(container)', function() {
    var JavaScriptVPAID;
    var stubs;

    function getVPAIDAd() {
        var emitter = new EventEmitter();
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
            'skipAd',
            'subscribe',
            'unsubscribe'
        ]);

        vpaid.subscribe.and.callFake(function(handler, event) {
            emitter.on(event, handler);
        });
        vpaid.unsubscribe.and.callFake(function(handler, event) {
            emitter.removeListener(event, handler);
        });

        vpaid.__trigger__ = function __trigger__(/*event, ...args*/) {
            emitter.emit.apply(emitter, arguments);
        };

        return vpaid;
    }

    beforeEach(function() {
        stubs = {
            'events': require('events'),
            'lie': LiePromise,
            './VPAID': VPAID,
            '../VPAIDVersion': VPAIDVersion,

            '@noCallThru': true
        };

        JavaScriptVPAID = proxyquire('../../lib/players/JavaScriptVPAID', stubs);
    });

    it('should exist', function() {
        expect(JavaScriptVPAID).toEqual(jasmine.any(Function));
        expect(JavaScriptVPAID.name).toEqual('JavaScriptVPAID');
    });

    describe('instance:', function() {
        var container;
        var player;

        beforeEach(function() {
            container = document.createElement('div');
            container.style.width = '800px';
            container.style.height = '600px';
            document.body.appendChild(container);

            player = new JavaScriptVPAID(container);
        });

        afterEach(function() {
            document.body.removeChild(container);
        });

        it('should exist', function() {
            expect(player).toEqual(jasmine.any(VPAID));
        });

        describe('properties:', function() {
            describe('frame', function() {
                it('should be null', function() {
                    expect(player.frame).toBeNull();
                });
            });
        });

        describe('methods:', function() {
            describe('load(mediaFiles, parameters)', function() {
                var mediaFiles, parameters;
                var success, failure;
                var iframe, script, video;
                var result;

                beforeEach(function() {
                    var createElement = document.createElement;

                    mediaFiles = [
                        { type: 'application/javascript', bitrate: 500, width: 500, height: 400, uri: 'http://videos.com/vpaid.js', apiFramework: 'VPAID' }
                    ];
                    parameters = 'foo=bar&bar=foo';

                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    spyOn(document, 'createElement').and.callFake(function(tagName) {
                        if (tagName.toUpperCase() === 'SCRIPT') {
                            return createElement.call(document, 'x-script');
                        } else {
                            return createElement.apply(document, arguments);
                        }
                    });

                    result = player.load(mediaFiles, parameters);
                    result.then(success, failure);

                    iframe = container.children[0];
                    script = iframe.contentWindow.document.head.querySelector('x-script');
                    video = iframe.contentWindow.document.body.querySelector('video');
                });

                it('should return a Promise', function() {
                    expect(result).toEqual(jasmine.any(LiePromise));
                });

                it('should create an <iframe> in the container', function() {
                    expect(container.children.length).toBe(1);
                    expect(iframe.tagName).toBe('IFRAME');
                    expect(iframe.src).toBe('about:blank');
                    expect(iframe.style.width).toBe('100%');
                    expect(iframe.style.height).toBe('100%');
                    expect(iframe.style.display).toBe('block');
                    expect(iframe.style.opacity).toBe('0');
                    expect(iframe.style.border).toBe('none');
                    expect(iframe.contentWindow.document.body.style.margin).toBe('0px');
                });

                it('should make sure the iframe\'s url protocol matches the protocol of the parent page', function() {
                    expect(iframe.contentWindow.location.href).toBe(window.location.href);
                    expect(iframe.contentWindow.location.protocol).toBe(window.location.protocol);
                });

                it('should save a reference to the iframe', function() {
                    expect(player.frame).toBe(iframe);
                });

                it('should create a <script> in the <head> of the <iframe>', function() {
                    expect(iframe.contentWindow.document.head.querySelector('x-script')).not.toBeNull();
                    expect(document.createElement).not.toHaveBeenCalledWith('x-script');

                    expect(script.src).toBe(mediaFiles[0].uri);
                });

                it('should create a <video> in the <body> of the <iframe>', function() {
                    expect(iframe.contentWindow.document.body.querySelector('video')).not.toBeNull();
                    expect(video.getAttribute('webkit-playsinline')).toBe('true');
                    expect(video.style.display).toBe('block');
                    expect(video.style.width).toBe('100%');
                    expect(video.style.height).toBe('100%');
                    expect(video.style.objectFit).toBe('contain');
                });

                describe('when the script loads', function() {
                    var vpaid;

                    beforeEach(function() {
                        vpaid = getVPAIDAd();

                        iframe.contentWindow.getVPAIDAd = jasmine.createSpy('getVPAIDAd()').and.returnValue(vpaid);
                    });

                    ['1.0', '1.1', '2.0', '2.0.1', '1.0.1'].forEach(function(version) {
                        describe('if the vpaid version is ' + version, function() {
                            beforeEach(function() {
                                vpaid.handshakeVersion.and.returnValue(version);
                                script.onload();
                            });

                            it('should call handshakeVersion()', function() {
                                expect(vpaid.handshakeVersion).toHaveBeenCalledWith('2.0');
                            });

                            it('should set the vpaidVersion', function() {
                                expect(player.vpaidVersion).toEqual(new VPAIDVersion(version));
                            });

                            it('should call initAd()', function() {
                                expect(vpaid.initAd).toHaveBeenCalledWith(800, 600, 'normal', mediaFiles[0].bitrate, { AdParameters: parameters }, {
                                    slot: iframe.contentWindow.document.body,
                                    videoSlot: video,
                                    videoSlotCanAutoPlay: environment.isDesktop
                                });
                            });

                            describe('when the container is resized', function() {
                                beforeEach(function(done) {
                                    spyOn(player, 'resizeAd').and.returnValue(LiePromise.resolve(player));

                                    container.style.width = '1024px';
                                    container.style.height = '768px';

                                    process.nextTick(done);
                                });

                                it('should resize the ad', function() {
                                    expect(player.resizeAd).toHaveBeenCalledWith(1024, 768, 'normal');
                                });

                                describe('after the ad is stopped', function() {
                                    beforeEach(function(done) {
                                        player.resizeAd.calls.reset();
                                        player.emit(VPAID_EVENTS.AdStopped);

                                        container.style.width = '800px';
                                        container.style.height = '600px';

                                        process.nextTick(done);
                                    });

                                    it('should not resize the ad', function() {
                                        expect(player.resizeAd).not.toHaveBeenCalled();
                                    });
                                });
                            });

                            describe('when AdLoaded is emitted', function() {
                                beforeEach(function(done) {
                                    vpaid.__trigger__('AdLoaded');
                                    result.then(done, done);
                                });

                                it('should set the api', function() {
                                    expect(player.api).toBe(vpaid);
                                });

                                it('should show the iframe', function() {
                                    expect(iframe.style.opacity).toBe('1');
                                });

                                it('should fulfill the promise', function() {
                                    expect(success).toHaveBeenCalledWith(player);
                                });

                                describe('and then AdStopped is emitted', function() {
                                    beforeEach(function() {
                                        vpaid.__trigger__('AdStopped');
                                    });

                                    it('should remove the iframe from the DOM', function() {
                                        expect(document.contains(iframe)).toBe(false, '<iframe> is still in the DOM!');
                                    });

                                    it('should set the frame and api to null', function() {
                                        expect(player.frame).toBeNull();
                                        expect(player.api).toBeNull();
                                    });
                                });
                            });

                            VPAID_EVENTS.forEach(function(event) {
                                describe('when ' + event + ' is emitted', function() {
                                    var spy;
                                    var arg1, arg2;

                                    beforeEach(function() {
                                        spy = jasmine.createSpy(event + '()');
                                        player.on(event, spy);

                                        arg1 = { foo: 'bar' };
                                        arg2 = { bar: 'foo' };

                                        vpaid.__trigger__(event, arg1, arg2);
                                    });

                                    it('should emit ' + event + ' on the player', function() {
                                        expect(spy).toHaveBeenCalledWith(arg1, arg2);
                                    });
                                });
                            });

                            describe('when AdError is emitted', function() {
                                var error;

                                beforeEach(function(done) {
                                    error = 'I FAILED!';

                                    vpaid.__trigger__(VPAID_EVENTS.AdError, error);
                                    result.then(done, done);
                                });

                                it('should remove the iframe from the DOM', function() {
                                    expect(document.contains(iframe)).toBe(false, '<iframe> is still in the DOM!');
                                });

                                it('should set the frame and api to null', function() {
                                    expect(player.frame).toBeNull();
                                    expect(player.api).toBeNull();
                                });

                                it('should reject the Promise', function() {
                                    expect(failure).toHaveBeenCalledWith(new Error(error));
                                });
                            });
                        });
                    });

                    ['3.0', '3', '3.1.1', '4.2', '4.0'].forEach(function(version) {
                        describe('if the VPAID version is ' + version, function() {
                            beforeEach(function(done) {
                                vpaid.handshakeVersion.and.returnValue(version);
                                script.onload();

                                result.then(done, done);
                            });

                            it('should reject the Promise', function() {
                                expect(failure).toHaveBeenCalledWith(new Error('VPAID version ' + version + ' is not supported.'));
                            });

                            it('should not set the api', function() {
                                expect(player.api).toBeNull();
                            });

                            it('should not call initAd()', function() {
                                expect(vpaid.initAd).not.toHaveBeenCalled();
                            });
                        });
                    });
                });

                describe('if the script fails to load', function() {
                    beforeEach(function(done) {
                        script.onerror();

                        result.then(done, done);
                    });

                    it('should remove the iframe from the DOM', function() {
                        expect(document.contains(iframe)).toBe(false, '<iframe> is still in the DOM!');
                    });

                    it('should set the frame and api to null', function() {
                        expect(player.frame).toBeNull();
                        expect(player.api).toBeNull();
                    });

                    it('should reject the Promise', function() {
                        expect(failure).toHaveBeenCalledWith(new Error('Failed to load MediaFile [' + mediaFiles[0].uri + '].'));
                    });
                });
            });
        });
    });
});
