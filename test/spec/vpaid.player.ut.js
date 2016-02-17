'use strict';

var proxyquire = require('proxyquire');
var EventEmitter = require('events').EventEmitter;
var LiePromise = require('lie');
var EVENTS = require('../../lib/enums/VPAID_EVENTS');

function noop() {}

describe('VPAID(container)', function() {
    var VPAID;
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

            '@noCallThru': true
        };

        VPAID = proxyquire('../../lib/players/VPAID', stubs);
    });

    it('should exist', function() {
        expect(VPAID).toEqual(jasmine.any(Function));
        expect(VPAID.name).toEqual('VPAID');
    });

    describe('instance:', function() {
        var container;
        var player;

        beforeEach(function() {
            container = document.createElement('div');
            container.style.width = '800px';
            container.style.height = '600px';
            document.body.appendChild(container);

            player = new VPAID(container);
        });

        afterEach(function() {
            document.body.removeChild(container);
        });

        it('should exist', function() {
            expect(player).toEqual(jasmine.any(EventEmitter));
        });

        describe('properties:', function() {
            describe('container:', function() {
                it('should be the container', function() {
                    expect(player.container).toBe(container);
                });
            });

            describe('api', function() {
                it('should be null', function() {
                    expect(player.api).toBeNull();
                });
            });

            describe('vpaidVersion', function() {
                it('should be null', function() {
                    expect(player.vpaidVersion).toBeNull();
                });
            });
        });

        describe('properties:', function() {
            describe('adLinear', function() {
                var result;

                describe('before there is an api', function() {
                    beforeEach(function() {
                        player.api = null;
                    });

                    it('should throw an Error', function() {
                        expect(function() { noop(player.adLinear); }).toThrow(new Error('Ad has not been loaded.'));
                    });
                });

                describe('when there is an api', function() {
                    beforeEach(function() {
                        player.api = getVPAIDAd();
                        player.api.getAdLinear.and.returnValue(true);

                        result = player.adLinear;
                    });

                    it('should call getAdLinear()', function() {
                        expect(player.api.getAdLinear).toHaveBeenCalledWith();
                    });

                    it('should be the result of calling getAdLinear()', function() {
                        expect(result).toBe(player.api.getAdLinear.calls.mostRecent().returnValue);
                    });
                });
            });

            describe('adWidth', function() {
                var result;

                describe('before there is an api', function() {
                    beforeEach(function() {
                        player.api = null;
                    });

                    it('should throw an Error', function() {
                        expect(function() { noop(player.adWidth); }).toThrow(new Error('Ad has not been loaded.'));
                    });
                });

                describe('when there is an api', function() {
                    beforeEach(function() {
                        player.api = getVPAIDAd();
                        player.api.getAdWidth.and.returnValue(800);

                        result = player.adWidth;
                    });

                    it('should call getAdWidth()', function() {
                        expect(player.api.getAdWidth).toHaveBeenCalledWith();
                    });

                    it('should be the result of calling getAdWidth()', function() {
                        expect(result).toBe(player.api.getAdWidth.calls.mostRecent().returnValue);
                    });
                });
            });

            describe('adHeight', function() {
                var result;

                describe('before there is an api', function() {
                    beforeEach(function() {
                        player.api = null;
                    });

                    it('should throw an Error', function() {
                        expect(function() { noop(player.adHeight); }).toThrow(new Error('Ad has not been loaded.'));
                    });
                });

                describe('when there is an api', function() {
                    beforeEach(function() {
                        player.api = getVPAIDAd();
                        player.api.getAdHeight.and.returnValue(600);

                        result = player.adHeight;
                    });

                    it('should call getAdHeight()', function() {
                        expect(player.api.getAdHeight).toHaveBeenCalledWith();
                    });

                    it('should be the result of calling getAdHeight()', function() {
                        expect(result).toBe(player.api.getAdHeight.calls.mostRecent().returnValue);
                    });
                });
            });

            describe('adExpanded', function() {
                var result;

                describe('before there is an api', function() {
                    beforeEach(function() {
                        player.api = null;
                    });

                    it('should throw an Error', function() {
                        expect(function() { noop(player.adExpanded); }).toThrow(new Error('Ad has not been loaded.'));
                    });
                });

                describe('when there is an api', function() {
                    beforeEach(function() {
                        player.api = getVPAIDAd();
                        player.api.getAdExpanded.and.returnValue(false);

                        result = player.adExpanded;
                    });

                    it('should call getAdExpanded()', function() {
                        expect(player.api.getAdExpanded).toHaveBeenCalledWith();
                    });

                    it('should be the result of calling getAdExpanded()', function() {
                        expect(result).toBe(player.api.getAdExpanded.calls.mostRecent().returnValue);
                    });
                });
            });

            describe('adSkippableState', function() {
                var result;

                describe('before there is an api', function() {
                    beforeEach(function() {
                        player.api = null;
                    });

                    it('should throw an Error', function() {
                        expect(function() { noop(player.adSkippableState); }).toThrow(new Error('Ad has not been loaded.'));
                    });
                });

                describe('when there is an api', function() {
                    beforeEach(function() {
                        player.api = getVPAIDAd();
                        player.api.getAdSkippableState.and.returnValue(false);

                        result = player.adSkippableState;
                    });

                    it('should call getAdSkippableState()', function() {
                        expect(player.api.getAdSkippableState).toHaveBeenCalledWith();
                    });

                    it('should be the result of calling getAdSkippableState()', function() {
                        expect(result).toBe(player.api.getAdSkippableState.calls.mostRecent().returnValue);
                    });
                });
            });

            describe('adRemainingTime', function() {
                var result;

                describe('before there is an api', function() {
                    beforeEach(function() {
                        player.api = null;
                    });

                    it('should throw an Error', function() {
                        expect(function() { noop(player.adRemainingTime); }).toThrow(new Error('Ad has not been loaded.'));
                    });
                });

                describe('when there is an api', function() {
                    beforeEach(function() {
                        player.api = getVPAIDAd();
                        player.api.getAdRemainingTime.and.returnValue(22);

                        result = player.adRemainingTime;
                    });

                    it('should call getAdRemainingTime()', function() {
                        expect(player.api.getAdRemainingTime).toHaveBeenCalledWith();
                    });

                    it('should be the result of calling getAdRemainingTime()', function() {
                        expect(result).toBe(player.api.getAdRemainingTime.calls.mostRecent().returnValue);
                    });
                });
            });

            describe('adDuration', function() {
                var result;

                describe('before there is an api', function() {
                    beforeEach(function() {
                        player.api = null;
                    });

                    it('should throw an Error', function() {
                        expect(function() { noop(player.adDuration); }).toThrow(new Error('Ad has not been loaded.'));
                    });
                });

                describe('when there is an api', function() {
                    beforeEach(function() {
                        player.api = getVPAIDAd();
                        player.api.getAdDuration.and.returnValue(30);

                        result = player.adDuration;
                    });

                    it('should call getAdDuration()', function() {
                        expect(player.api.getAdDuration).toHaveBeenCalledWith();
                    });

                    it('should be the result of calling getAdDuration()', function() {
                        expect(result).toBe(player.api.getAdDuration.calls.mostRecent().returnValue);
                    });
                });
            });

            describe('adVolume', function() {
                var result;

                describe('before there is an api', function() {
                    beforeEach(function() {
                        player.api = null;
                    });

                    describe('getting', function() {
                        it('should throw an Error', function() {
                            expect(function() { noop(player.adVolume); }).toThrow(new Error('Ad has not been loaded.'));
                        });
                    });

                    describe('setting', function() {
                        it('should throw an Error', function() {
                            expect(function() { player.adVolume = 0.5; }).toThrow(new Error('Ad has not been loaded.'));
                        });
                    });
                });

                describe('when there is an api', function() {
                    beforeEach(function() {
                        player.api = getVPAIDAd();
                        player.api.getAdVolume.and.returnValue(0.75);
                    });

                    describe('getting', function() {
                        beforeEach(function() {
                            result = player.adVolume;
                        });

                        it('should call getAdVolume()', function() {
                            expect(player.api.getAdVolume).toHaveBeenCalledWith();
                        });

                        it('should be the result of calling getAdVolume()', function() {
                            expect(result).toBe(player.api.getAdVolume.calls.mostRecent().returnValue);
                        });
                    });

                    describe('setting', function() {
                        beforeEach(function() {
                            player.adVolume = 0.5;
                        });

                        it('should call setAdVolume()', function() {
                            expect(player.api.setAdVolume).toHaveBeenCalledWith(0.5);
                        });
                    });
                });
            });

            describe('adCompanions', function() {
                var result;

                describe('before there is an api', function() {
                    beforeEach(function() {
                        player.api = null;
                    });

                    it('should throw an Error', function() {
                        expect(function() { noop(player.adCompanions); }).toThrow(new Error('Ad has not been loaded.'));
                    });
                });

                describe('when there is an api', function() {
                    beforeEach(function() {
                        player.api = getVPAIDAd();
                        player.api.getAdCompanions.and.returnValue([
                            '<AdCompanions>',
                            '    <Companion>',
                            '        <StaticResource type=”image/jpg”>',
                            '            <![CDATA[http://AdServer.com/120x60companion.jpg]>',
                            '        </StaticResource>',
                            '        <TrackingEvents>',
                            '            <Tracking event=creativeView>',
                            '                <![CDATA[http://AdServer.com/creativeview.jpg]>',
                            '            </Tracking>',
                            '        </TrackingEvents>',
                            '    </Companion>',
                            '</AdCompanions>'
                        ].join('\n'));

                        result = player.adCompanions;
                    });

                    it('should call getAdCompanions()', function() {
                        expect(player.api.getAdCompanions).toHaveBeenCalledWith();
                    });

                    it('should be the result of calling getAdCompanions()', function() {
                        expect(result).toBe(player.api.getAdCompanions.calls.mostRecent().returnValue);
                    });
                });
            });

            describe('adIcons', function() {
                var result;

                describe('before there is an api', function() {
                    beforeEach(function() {
                        player.api = null;
                    });

                    it('should throw an Error', function() {
                        expect(function() { noop(player.adIcons); }).toThrow(new Error('Ad has not been loaded.'));
                    });
                });

                describe('when there is an api', function() {
                    beforeEach(function() {
                        player.api = getVPAIDAd();
                        player.api.getAdIcons.and.returnValue(false);

                        result = player.adIcons;
                    });

                    it('should call getAdIcons()', function() {
                        expect(player.api.getAdIcons).toHaveBeenCalledWith();
                    });

                    it('should be the result of calling getAdIcons()', function() {
                        expect(result).toBe(player.api.getAdIcons.calls.mostRecent().returnValue);
                    });
                });
            });
        });

        describe('methods:', function() {
            describe('load()', function() {
                it('should throw an Error', function() {
                    expect(function() { player.load(); }).toThrow(new Error('VPAID subclass must implement load() method.'));
                });
            });

            describe('resizeAd(width, height, viewMode)', function() {
                var width, height, viewMode;
                var success, failure;

                beforeEach(function() {
                    width = 800;
                    height = 600;
                    viewMode = 'normal';

                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');
                });

                describe('before there is an api', function() {
                    beforeEach(function(done) {
                        player.resizeAd(width, height, viewMode).then(success, failure).then(done, done);
                    });

                    it('should return a rejected Promise', function() {
                        expect(failure).toHaveBeenCalledWith(new Error('Ad has not been loaded.'));
                    });
                });

                describe('when there is an api', function() {
                    beforeEach(function() {
                        player.api = getVPAIDAd();
                        player.resizeAd(width, height, viewMode).then(success, failure);
                    });

                    it('should call vpaid.resizeAd()', function() {
                        expect(player.api.resizeAd).toHaveBeenCalledWith(width, height, viewMode);
                    });

                    describe('when the player emits AdSizeChange', function() {
                        beforeEach(function(done) {
                            player.emit(EVENTS.AdSizeChange);
                            LiePromise.resolve().then(done);
                        });

                        it('should fulfill the promise', function() {
                            expect(success).toHaveBeenCalledWith(player);
                        });
                    });
                });
            });

            describe('startAd()', function() {
                var success, failure;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');
                });

                describe('before there is an api', function() {
                    beforeEach(function(done) {
                        player.startAd().then(success, failure).then(done, done);
                    });

                    it('should return a rejected Promise', function() {
                        expect(failure).toHaveBeenCalledWith(new Error('Ad has not been loaded.'));
                    });
                });

                describe('when there is an api', function() {
                    beforeEach(function() {
                        player.api = getVPAIDAd();
                        player.startAd().then(success, failure);
                    });

                    it('should call vpaid.startAd()', function() {
                        expect(player.api.startAd).toHaveBeenCalledWith();
                    });

                    describe('when the player emits AdStarted', function() {
                        beforeEach(function(done) {
                            player.emit(EVENTS.AdStarted);
                            LiePromise.resolve().then(done);
                        });

                        it('should fulfill the promise', function() {
                            expect(success).toHaveBeenCalledWith(player);
                        });
                    });
                });
            });

            describe('stopAd()', function() {
                var success, failure;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');
                });

                describe('before there is an api', function() {
                    beforeEach(function(done) {
                        player.stopAd().then(success, failure).then(done, done);
                    });

                    it('should return a rejected Promise', function() {
                        expect(failure).toHaveBeenCalledWith(new Error('Ad has not been loaded.'));
                    });
                });

                describe('when there is an api', function() {
                    beforeEach(function() {
                        player.api = getVPAIDAd();
                        player.stopAd().then(success, failure);
                    });

                    it('should call vpaid.stopAd()', function() {
                        expect(player.api.stopAd).toHaveBeenCalledWith();
                    });

                    describe('when the player emits AdStarted', function() {
                        beforeEach(function(done) {
                            player.emit(EVENTS.AdStopped);
                            LiePromise.resolve().then(done);
                        });

                        it('should fulfill the promise', function() {
                            expect(success).toHaveBeenCalledWith(player);
                        });
                    });
                });
            });

            describe('pauseAd()', function() {
                var success, failure;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');
                });

                describe('before there is an api', function() {
                    beforeEach(function(done) {
                        player.pauseAd().then(success, failure).then(done, done);
                    });

                    it('should return a rejected Promise', function() {
                        expect(failure).toHaveBeenCalledWith(new Error('Ad has not been loaded.'));
                    });
                });

                describe('when there is an api', function() {
                    beforeEach(function() {
                        player.api = getVPAIDAd();
                        player.pauseAd().then(success, failure);
                    });

                    it('should call vpaid.pauseAd()', function() {
                        expect(player.api.pauseAd).toHaveBeenCalledWith();
                    });

                    describe('when the player emits AdPaused', function() {
                        beforeEach(function(done) {
                            player.emit(EVENTS.AdPaused);
                            LiePromise.resolve().then(done);
                        });

                        it('should fulfill the promise', function() {
                            expect(success).toHaveBeenCalledWith(player);
                        });
                    });
                });
            });

            describe('resumeAd()', function() {
                var success, failure;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');
                });

                describe('before there is an api', function() {
                    beforeEach(function(done) {
                        player.resumeAd().then(success, failure).then(done, done);
                    });

                    it('should return a rejected Promise', function() {
                        expect(failure).toHaveBeenCalledWith(new Error('Ad has not been loaded.'));
                    });
                });

                describe('when there is an api', function() {
                    beforeEach(function() {
                        player.api = getVPAIDAd();
                        player.resumeAd().then(success, failure);
                    });

                    it('should call vpaid.resumeAd()', function() {
                        expect(player.api.resumeAd).toHaveBeenCalledWith();
                    });

                    describe('when the player emits AdPlaying', function() {
                        beforeEach(function(done) {
                            player.emit(EVENTS.AdPlaying);
                            LiePromise.resolve().then(done);
                        });

                        it('should fulfill the promise', function() {
                            expect(success).toHaveBeenCalledWith(player);
                        });
                    });
                });
            });

            describe('expandAd()', function() {
                var success, failure;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');
                });

                describe('before there is an api', function() {
                    beforeEach(function(done) {
                        player.expandAd().then(success, failure).then(done, done);
                    });

                    it('should return a rejected Promise', function() {
                        expect(failure).toHaveBeenCalledWith(new Error('Ad has not been loaded.'));
                    });
                });

                describe('when there is an api', function() {
                    beforeEach(function() {
                        player.api = getVPAIDAd();
                        player.expandAd().then(success, failure);
                    });

                    it('should call vpaid.expandAd()', function() {
                        expect(player.api.expandAd).toHaveBeenCalledWith();
                    });

                    describe('when the player emits AdExpandedChange', function() {
                        beforeEach(function(done) {
                            player.emit(EVENTS.AdExpandedChange);
                            LiePromise.resolve().then(done);
                        });

                        it('should fulfill the promise', function() {
                            expect(success).toHaveBeenCalledWith(player);
                        });
                    });
                });
            });

            describe('collapseAd()', function() {
                var success, failure;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');
                });

                describe('before there is an api', function() {
                    beforeEach(function(done) {
                        player.collapseAd().then(success, failure).then(done, done);
                    });

                    it('should return a rejected Promise', function() {
                        expect(failure).toHaveBeenCalledWith(new Error('Ad has not been loaded.'));
                    });
                });

                describe('when there is an api', function() {
                    beforeEach(function() {
                        player.api = getVPAIDAd();
                        player.collapseAd().then(success, failure);
                    });

                    it('should call vpaid.collapseAd()', function() {
                        expect(player.api.collapseAd).toHaveBeenCalledWith();
                    });

                    describe('when the player emits AdExpandedChange', function() {
                        beforeEach(function(done) {
                            player.emit(EVENTS.AdExpandedChange);
                            LiePromise.resolve().then(done);
                        });

                        it('should fulfill the promise', function() {
                            expect(success).toHaveBeenCalledWith(player);
                        });
                    });
                });
            });

            describe('skipAd()', function() {
                var success, failure;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');
                });

                describe('before there is an api', function() {
                    beforeEach(function(done) {
                        player.skipAd().then(success, failure).then(done, done);
                    });

                    it('should return a rejected Promise', function() {
                        expect(failure).toHaveBeenCalledWith(new Error('Ad has not been loaded.'));
                    });
                });

                describe('when there is an api', function() {
                    beforeEach(function() {
                        player.api = getVPAIDAd();
                        player.skipAd().then(success, failure);
                    });

                    it('should call vpaid.skipAd()', function() {
                        expect(player.api.skipAd).toHaveBeenCalledWith();
                    });

                    describe('when the player emits AdSkipped', function() {
                        beforeEach(function(done) {
                            player.emit(EVENTS.AdSkipped);
                            LiePromise.resolve().then(done);
                        });

                        it('should fulfill the promise', function() {
                            expect(success).toHaveBeenCalledWith(player);
                        });
                    });
                });
            });
        });
    });
});
