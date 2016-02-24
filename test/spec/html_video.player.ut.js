'use strict';

var proxyquire = require('proxyquire');
var EventEmitter = require('events').EventEmitter;
var LiePromise = require('lie');
var VPAID_EVENTS = require('../../lib/enums/VPAID_EVENTS');
var HTML_MEDIA_EVENTS = require('../../lib/enums/HTML_MEDIA_EVENTS');

describe('HTMLVideo(container)', function() {
    var HTMLVideo;
    var environment, HTMLVideoTracker, EventProxy;
    var stubs;

    beforeEach(function() {
        environment = {
            canPlay: jasmine.createSpy('canPlay()').and.returnValue(2)
        };

        HTMLVideoTracker = jasmine.createSpy('HTMLVideoTracker()').and.callFake(function(video) {
            var HTMLVideoTracker_ = require('../../lib/HTMLVideoTracker');

            return new HTMLVideoTracker_(video);
        });
        EventProxy = jasmine.createSpy('EventProxy()').and.callFake(function(events) {
            var EventProxy_ = require('../../lib/EventProxy');
            var proxy = new EventProxy_(events);

            spyOn(proxy, 'from').and.callThrough();
            spyOn(proxy, 'to').and.callThrough();

            return proxy;
        });

        stubs = {
            'events': require('events'),
            'lie': LiePromise,
            '../environment': environment,
            '../HTMLVideoTracker': HTMLVideoTracker,
            '../EventProxy': EventProxy,

            '@noCallThru': true
        };

        HTMLVideo = proxyquire('../../lib/players/HTMLVideo', stubs);
    });

    it('should exist', function() {
        expect(HTMLVideo).toEqual(jasmine.any(Function));
        expect(HTMLVideo.name).toEqual('HTMLVideo');
    });

    describe('instance:', function() {
        var container;
        var player;

        beforeEach(function() {
            container = document.createElement('div');
            container.style.width = '800px';
            container.style.height = '600px';
            document.body.appendChild(container);

            player = new HTMLVideo(container);
        });

        afterEach(function() {
            document.body.removeChild(container);
        });

        it('should exist', function() {
            expect(player).toEqual(jasmine.any(EventEmitter));
        });

        describe('properties:', function() {
            describe('container', function() {
                it('should be the container', function() {
                    expect(player.container).toBe(container);
                });
            });

            describe('video', function() {
                it('should be null', function() {
                    expect(player.video).toBeNull();
                });
            });

            describe('adRemainingTime', function() {
                describe('before the video is loaded', function() {
                    it('should throw an Error', function() {
                        expect(function() { return player.adRemainingTime; }).toThrow(new Error('The <video> has not been loaded.'));
                    });
                });

                describe('after the video is loaded', function() {
                    beforeEach(function() {
                        player.video = document.createElement('video');
                        player.video.currentTime = 10;
                        player.video.duration = 30;
                    });

                    it('should be the duration - currentTime', function() {
                        expect(player.adRemainingTime).toBe(20);
                    });
                });
            });

            describe('adDuration', function() {
                describe('before the video is loaded', function() {
                    it('should throw an Error', function() {
                        expect(function() { return player.adDuration; }).toThrow(new Error('The <video> has not been loaded.'));
                    });
                });

                describe('after the video is loaded', function() {
                    beforeEach(function() {
                        player.video = document.createElement('video');
                        player.video.duration = 60;
                    });

                    it('should be the duration', function() {
                        expect(player.adDuration).toBe(60);
                    });
                });
            });

            describe('adVolume', function() {
                describe('before the video is loaded', function() {
                    describe('getting', function() {
                        it('should throw an Error', function() {
                            expect(function() { return player.adVolume; }).toThrow(new Error('The <video> has not been loaded.'));
                        });
                    });

                    describe('setting', function() {
                        it('should throw an Error', function() {
                            expect(function() { player.adVolume = 0.8; }).toThrow(new Error('The <video> has not been loaded.'));
                        });
                    });
                });

                describe('after the video is loaded', function() {
                    beforeEach(function() {
                        player.video = document.createElement('video');
                        player.video.volume = 0.75;
                    });

                    describe('getting', function() {
                        it('should be the volume', function() {
                            expect(player.adVolume).toBe(0.75);
                        });
                    });

                    describe('setting', function() {
                        beforeEach(function() {
                            player.adVolume = 0.2;
                        });

                        it('should set the volume', function() {
                            expect(player.video.volume).toBe(0.2);
                        });
                    });
                });
            });
        });

        describe('methods:', function() {
            function trigger(target, eventName) {
                var event = document.createEvent('CustomEvent');

                event.initCustomEvent(eventName);

                target.dispatchEvent(event);
            }

            describe('load(mediaFiles)', function() {
                var mediaFiles;
                var success, failure;
                var video;
                var result;

                beforeEach(function() {
                    var createElement = document.createElement;

                    mediaFiles = [
                        { type: 'video/x-flv', width: 300, height: 200, uri: 'http://videos.com/video1.flv' },
                        { type: 'video/x-flv', width: 400, height: 300, uri: 'http://videos.com/video2.flv' },
                        { type: 'video/x-flv', width: 500, height: 400, uri: 'http://videos.com/video3.flv' },
                        { type: 'video/webm', width: 300, height: 200, uri: 'http://videos.com/video1.webm' },
                        { type: 'video/webm', width: 400, height: 300, uri: 'http://videos.com/video2.webm' },
                        { type: 'video/webm', width: 500, height: 400, uri: 'http://videos.com/video3.webm' },
                        { type: 'video/mp4', width: 300, height: 200, uri: 'http://videos.com/video1.mp4' },
                        { type: 'video/mp4', width: 400, height: 300, uri: 'http://videos.com/video2.mp4' },
                        { type: 'video/mp4', width: 500, height: 400, uri: 'http://videos.com/video3.mp4' },
                        { type: 'video/3gp', width: 200, height: 100, uri: 'http://videos.com/video1.3gp' },
                        { type: 'video/3gp', width: 300, height: 200, uri: 'http://videos.com/video2.3gp' },
                        { type: 'video/3gp', width: 400, height: 300, uri: 'http://videos.com/video3.3gp' },
                    ];

                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    spyOn(document, 'createElement').and.callFake(function(tagName) {
                        var element = createElement.apply(document, arguments);

                        if (tagName.toUpperCase() === 'VIDEO') {
                            element.play = jasmine.createSpy('video.play()');
                        }

                        return element;
                    });

                    result = player.load(mediaFiles);
                    result.then(success, failure);

                    video = container.children[0];
                });

                it('should return a Promise', function() {
                    expect(result).toEqual(jasmine.any(LiePromise));
                });

                it('should create a <video> in the container', function() {
                    expect(container.children.length).toBe(1);
                    expect(video.tagName).toBe('VIDEO');
                    expect(video.style.width).toBe('100%');
                    expect(video.style.height).toBe('100%');
                    expect(video.style.display).toBe('block');
                    expect(video.style.objectFit).toBe('contain');
                    expect(mediaFiles.map(function(mediaFile) { return mediaFile.uri; })).toContain(video.src);
                    expect(video.preload).toBe('auto');
                });

                describe('when the video emits "playing"', function() {
                    var AdImpression;

                    beforeEach(function() {
                        AdImpression = jasmine.createSpy('AdImpression()');
                        player.on(VPAID_EVENTS.AdImpression, AdImpression);

                        trigger(video, HTML_MEDIA_EVENTS.PLAYING);
                    });

                    it('should emit "AdImpression"', function() {
                        expect(AdImpression).toHaveBeenCalled();
                    });

                    describe('twice', function() {
                        beforeEach(function() {
                            AdImpression.calls.reset();

                            trigger(video, HTML_MEDIA_EVENTS.PLAYING);
                        });

                        it('should not emit "AdImpression" again', function() {
                            expect(AdImpression).not.toHaveBeenCalled();
                        });
                    });
                });

                describe('when the video emits ' + HTML_MEDIA_EVENTS.ENDED, function() {
                    beforeEach(function() {
                        spyOn(player, 'stopAd').and.callThrough();

                        trigger(video, HTML_MEDIA_EVENTS.ENDED);
                    });

                    it('should call stopAd() on itself', function() {
                        expect(player.stopAd).toHaveBeenCalled();
                    });
                });

                describe('if the video is clicked', function() {
                    var AdClickThru;

                    beforeEach(function() {
                        AdClickThru = jasmine.createSpy('AdClickThru()');
                        player.on(VPAID_EVENTS.AdClickThru, AdClickThru);

                        trigger(video, 'click');
                    });

                    it('should emit "AdClickThru"', function() {
                        expect(AdClickThru).toHaveBeenCalledWith(null, null, true);
                    });
                });

                describe('when the video emits "loadedmetadata"', function() {
                    var AdLoaded;
                    var tracker, proxy;

                    beforeEach(function(done) {
                        AdLoaded = jasmine.createSpy('AdLoaded');
                        player.on(VPAID_EVENTS.AdLoaded, AdLoaded);

                        video.duration = 60;
                        trigger(video, HTML_MEDIA_EVENTS.LOADEDMETADATA);

                        tracker = HTMLVideoTracker.calls.mostRecent().returnValue;
                        proxy = EventProxy.calls.mostRecent().returnValue;
                        result.then(done, done);
                    });

                    it('should emit AdLoaded', function() {
                        expect(AdLoaded).toHaveBeenCalled();
                    });

                    it('should save a reference to the video', function() {
                        expect(player.video).toBe(video);
                    });

                    it('should create a tracker for the video', function() {
                        expect(HTMLVideoTracker).toHaveBeenCalledWith(video);
                    });

                    it('should proxy from the tracker to the player', function() {
                        expect(EventProxy).toHaveBeenCalledWith(VPAID_EVENTS);
                        expect(proxy.from).toHaveBeenCalledWith(tracker);
                        expect(proxy.to).toHaveBeenCalledWith(player);
                    });

                    it('should fulfill the promise', function() {
                        expect(success).toHaveBeenCalledWith(player);
                    });

                    describe('and then emits "durationchange"', function() {
                        var AdDurationChange;

                        beforeEach(function() {
                            AdDurationChange = jasmine.createSpy('AdDurationChange()');
                            player.on(VPAID_EVENTS.AdDurationChange, AdDurationChange);

                            trigger(video, HTML_MEDIA_EVENTS.DURATIONCHANGE);
                        });

                        it('should emit "AdDurationChange"', function() {
                            expect(AdDurationChange).toHaveBeenCalled();
                        });
                    });

                    describe('and then emits "AdVolumeChange"', function() {
                        var AdVolumeChange;

                        beforeEach(function() {
                            AdVolumeChange = jasmine.createSpy('AdVolumeChange()');
                            player.on(VPAID_EVENTS.AdVolumeChange, AdVolumeChange);

                            trigger(video, HTML_MEDIA_EVENTS.VOLUMECHANGE);
                        });

                        it('should emit "AdVolumeChange"', function() {
                            expect(AdVolumeChange).toHaveBeenCalled();
                        });
                    });
                });

                describe('if the video emits "error"', function() {
                    var AdError;

                    beforeEach(function(done) {
                        AdError = jasmine.createSpy('AdError()');
                        player.on(VPAID_EVENTS.AdError, AdError);

                        video.error = new Error('It didn\'t play...');
                        trigger(video, HTML_MEDIA_EVENTS.ERROR);

                        result.then(done, done);
                    });

                    it('should emit "AdError"', function() {
                        expect(AdError).toHaveBeenCalledWith(video.error.message);
                    });

                    it('should reject the Promise', function() {
                        expect(failure).toHaveBeenCalledWith(video.error);
                    });
                });

                describe('when choosing a video to play', function() {
                    function load(width, height) {
                        container.innerHTML = '';
                        container.style.width = width + 'px';
                        container.style.height = height + 'px';

                        result = player.load(mediaFiles);

                        return container.children[0];
                    }

                    beforeEach(function() {
                        environment.canPlay.and.callFake(function(type) {
                            switch (type) {
                            case 'video/mp4':
                            case 'video/3gp':
                                return 2;
                            case 'video/webm':
                                return 1;
                            default:
                                return 0;
                            }
                        });
                    });

                    it('should choose the video using the size of the container', function() {
                        expect(load(300, 200).src).toBe('http://videos.com/video1.mp4', '300x200');
                        expect(load(400, 300).src).toBe('http://videos.com/video2.mp4', '400x300');
                        expect(load(500, 400).src).toBe('http://videos.com/video3.mp4', '500x400');
                        expect(load(200, 100).src).toBe('http://videos.com/video1.3gp', '200x100');

                        expect(load(300, 300).src).toBe('http://videos.com/video1.mp4', '300x300');
                        expect(load(290, 400).src).toBe('http://videos.com/video1.mp4', '290x400');
                        expect(load(375, 200).src).toBe('http://videos.com/video2.mp4', '375x200');
                        expect(load(460, 500).src).toBe('http://videos.com/video3.mp4', '460x500');
                        expect(load(1024, 768).src).toBe('http://videos.com/video3.mp4', '1024x768');
                        expect(load(50, 50).src).toBe('http://videos.com/video1.3gp', '50x50');
                    });

                    describe('if the mediaFiles have a bitrate', function() {
                        beforeEach(function() {
                            mediaFiles = [
                                { type: 'video/x-flv', width: 300, height: 200, uri: 'http://videos.com/video1.flv' },
                                { type: 'video/x-flv', width: 400, height: 300, uri: 'http://videos.com/video2.flv' },
                                { type: 'video/x-flv', width: 500, height: 400, uri: 'http://videos.com/video3.flv' },
                                { type: 'video/webm', width: 300, height: 200, uri: 'http://videos.com/video1.webm' },
                                { type: 'video/webm', width: 400, height: 300, uri: 'http://videos.com/video2.webm' },
                                { type: 'video/webm', width: 500, height: 400, uri: 'http://videos.com/video3.webm' },
                                { type: 'video/3gp', bitrate: 50, width: 200, height: 100, uri: 'http://videos.com/video1.3gp' },
                                { type: 'video/3gp', bitrate: 50, width: 300, height: 200, uri: 'http://videos.com/video2.3gp' },
                                { type: 'video/3gp', bitrate: 50, width: 400, height: 300, uri: 'http://videos.com/video3.3gp' },
                                { type: 'video/mp4', bitrate: 100, width: 300, height: 200, uri: 'http://videos.com/video1.mp4' },
                                { type: 'video/mp4', bitrate: 100, width: 400, height: 300, uri: 'http://videos.com/video2.mp4' },
                                { type: 'video/mp4', bitrate: 100, width: 500, height: 400, uri: 'http://videos.com/video3.mp4' },
                            ];
                        });

                        it('should prefer higher-bitrate videos', function() {
                            expect(load(300, 200).src).toBe('http://videos.com/video1.mp4', '300x200');
                            expect(load(400, 300).src).toBe('http://videos.com/video2.mp4', '400x300');
                            expect(load(500, 400).src).toBe('http://videos.com/video3.mp4', '500x400');
                            expect(load(200, 100).src).toBe('http://videos.com/video1.3gp', '200x100');
                        });
                    });

                    describe('if there are no videos that can confidently play', function() {
                        beforeEach(function() {
                            mediaFiles = [
                                { type: 'video/x-flv', width: 300, height: 200, uri: 'http://videos.com/video1.flv' },
                                { type: 'video/x-flv', width: 400, height: 300, uri: 'http://videos.com/video2.flv' },
                                { type: 'video/x-flv', width: 500, height: 400, uri: 'http://videos.com/video3.flv' },
                                { type: 'video/webm', width: 300, height: 200, uri: 'http://videos.com/video1.webm' },
                                { type: 'video/webm', width: 400, height: 300, uri: 'http://videos.com/video2.webm' },
                                { type: 'video/webm', width: 500, height: 400, uri: 'http://videos.com/video3.webm' }
                            ];
                        });

                        it('should use the videos that can maybe play', function() {
                            expect(load(290, 400).src).toBe('http://videos.com/video1.webm', '290x400');
                            expect(load(375, 200).src).toBe('http://videos.com/video2.webm', '375x200');
                            expect(load(460, 500).src).toBe('http://videos.com/video3.webm', '460x500');
                        });
                    });

                    describe('if there are no playable videos', function() {
                        beforeEach(function(done) {
                            success.calls.reset();
                            failure.calls.reset();

                            mediaFiles = [
                                { type: 'video/x-flv', width: 300, height: 200, uri: 'http://videos.com/video1.flv' },
                                { type: 'video/x-flv', width: 400, height: 300, uri: 'http://videos.com/video2.flv' },
                                { type: 'video/x-flv', width: 500, height: 400, uri: 'http://videos.com/video3.flv' },
                            ];

                            load(1024, 768);
                            result.then(success, failure);
                            result.then(done, done);
                        });

                        it('should reject the Promise', function() {
                            expect(failure).toHaveBeenCalledWith(new Error('There are no playable <MediaFile>s.'));
                        });
                    });

                    describe('if no mediaFiles are provided', function() {
                        beforeEach(function(done) {
                            success.calls.reset();
                            failure.calls.reset();

                            mediaFiles = [];

                            load(1024, 768);
                            result.then(success, failure);
                            result.then(done, done);
                        });

                        it('should reject the Promise', function() {
                            expect(failure).toHaveBeenCalledWith(new Error('There are no playable <MediaFile>s.'));
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

                describe('before the video is loaded', function() {
                    beforeEach(function(done) {
                        player.startAd().then(success, failure).then(done, done.fail);
                    });

                    it('should reject the Promise', function() {
                        expect(failure).toHaveBeenCalledWith(new Error('The <video> has not been loaded.'));
                    });
                });

                describe('after the video is loaded', function() {
                    var result;

                    beforeEach(function(done) {
                        player.load([{ type: 'video/mp4', bitrate: 100, width: 500, height: 400, uri: 'http://videos.com/video3.mp4' }]).then(function(player) {
                            player.video.play = jasmine.createSpy('video.play()');
                        }).then(done, done.fail);
                        trigger(container.children[0], HTML_MEDIA_EVENTS.LOADEDMETADATA);
                    });

                    describe('and before it has played', function() {
                        beforeEach(function() {
                            result = player.startAd();
                            result.then(success, failure);
                        });

                        it('should play the video', function() {
                            expect(player.video.play).toHaveBeenCalledWith();
                        });

                        describe('when the video emits "playing"', function() {
                            var AdStarted;

                            beforeEach(function(done) {
                                AdStarted = jasmine.createSpy('AdStarted()');
                                player.on(VPAID_EVENTS.AdStarted, AdStarted);

                                trigger(player.video, HTML_MEDIA_EVENTS.PLAYING);
                                result.then(done, done);
                            });

                            it('should emit AdStarted', function() {
                                expect(AdStarted).toHaveBeenCalled();
                            });

                            it('should fulfill the promise', function() {
                                expect(success).toHaveBeenCalledWith(player);
                            });
                        });
                    });

                    describe('and after is has played', function() {
                        beforeEach(function(done) {
                            trigger(player.video, HTML_MEDIA_EVENTS.PLAYING);

                            result = player.startAd();
                            result.then(success, failure);
                            result.then(done, done);
                        });

                        it('should not play the video', function() {
                            expect(player.video.play).not.toHaveBeenCalled();
                        });

                        it('should reject the Promise', function() {
                            expect(failure).toHaveBeenCalledWith(new Error('The ad has already been started.'));
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

                describe('before the video is loaded', function() {
                    beforeEach(function(done) {
                        player.stopAd().then(success, failure).then(done, done.fail);
                    });

                    it('should reject the Promise', function() {
                        expect(failure).toHaveBeenCalledWith(new Error('The <video> has not been loaded.'));
                    });
                });

                describe('after the video is loaded', function() {
                    var AdStopped;

                    beforeEach(function(done) {
                        AdStopped = jasmine.createSpy('AdStopped()');
                        player.on(VPAID_EVENTS.AdStopped, AdStopped);

                        player.video = document.createElement('video');
                        container.appendChild(player.video);

                        player.stopAd().then(success, failure).then(done, done.fail);
                    });

                    it('should remove the video from the DOM', function() {
                        expect(container.contains(player.video)).toBe(false, 'Video is still in the DOM!');
                    });

                    it('should emit AdStopped', function() {
                        expect(AdStopped).toHaveBeenCalled();
                    });

                    it('should fulfill the Promise', function() {
                        expect(success).toHaveBeenCalledWith(player);
                    });
                });
            });

            describe('pauseAd()', function() {
                var success, failure;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');
                });

                describe('before the video is loaded', function() {
                    beforeEach(function(done) {
                        player.pauseAd().then(success, failure).then(done, done.fail);
                    });

                    it('should reject the Promise', function() {
                        expect(failure).toHaveBeenCalledWith(new Error('The <video> has not been loaded.'));
                    });
                });

                describe('after the video is loaded', function() {
                    var result;

                    beforeEach(function() {
                        player.video = document.createElement('video');
                        player.video.pause = jasmine.createSpy('video.pause()');
                        player.video.paused = false;

                        result = player.pauseAd();
                        result.then(success, failure);
                    });

                    it('should pause the video', function() {
                        expect(player.video.pause).toHaveBeenCalledWith();
                    });

                    describe('if the video is already paused', function() {
                        beforeEach(function(done) {
                            success.calls.reset();
                            failure.calls.reset();
                            player.video.pause.calls.reset();

                            player.video.paused = true;

                            result = player.pauseAd();
                            result.then(success, failure);
                            result.then(done, done);
                        });

                        it('should not pause the video', function() {
                            expect(player.video.pause).not.toHaveBeenCalled();
                        });

                        it('should fulfill the Promise', function() {
                            expect(success).toHaveBeenCalledWith(player);
                        });
                    });

                    describe('when the video emits "pause"', function() {
                        var AdPaused;

                        beforeEach(function(done) {
                            AdPaused = jasmine.createSpy('AdPaused()');
                            player.on(VPAID_EVENTS.AdPaused, AdPaused);

                            trigger(player.video, HTML_MEDIA_EVENTS.PAUSE);
                            result.then(done, done);
                        });

                        it('should emit AdPaused', function() {
                            expect(AdPaused).toHaveBeenCalled();
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

                describe('before the video is loaded', function() {
                    beforeEach(function(done) {
                        player.resumeAd().then(success, failure).then(done, done.fail);
                    });

                    it('should reject the Promise', function() {
                        expect(failure).toHaveBeenCalledWith(new Error('The <video> has not been loaded.'));
                    });
                });

                describe('after the video is loaded', function() {
                    var result;

                    beforeEach(function(done) {
                        player.load([{ type: 'video/mp4', bitrate: 100, width: 500, height: 400, uri: 'http://videos.com/video3.mp4' }]).then(function(player) {
                            player.video.play = jasmine.createSpy('video.play()');
                            player.video.paused = true;
                        }).then(done, done.fail);
                        trigger(container.children[0], HTML_MEDIA_EVENTS.LOADEDMETADATA);
                    });

                    describe('if the video has not been played', function() {
                        beforeEach(function(done) {
                            result = player.resumeAd();
                            result.then(success, failure);
                            result.then(done, done);
                        });

                        it('should not play the video', function() {
                            expect(player.video.play).not.toHaveBeenCalled();
                        });

                        it('should reject the Promise', function() {
                            expect(failure).toHaveBeenCalledWith(new Error('The ad has not been started yet.'));
                        });
                    });

                    describe('if the video has been played', function() {
                        beforeEach(function() {
                            trigger(player.video, HTML_MEDIA_EVENTS.PLAYING);

                            result = player.resumeAd();
                            result.then(success, failure);
                        });

                        it('should play the video', function() {
                            expect(player.video.play).toHaveBeenCalledWith();
                        });

                        describe('if the video is already playing', function() {
                            beforeEach(function(done) {
                                success.calls.reset();
                                failure.calls.reset();
                                player.video.play.calls.reset();

                                player.video.paused = false;

                                result = player.resumeAd();
                                result.then(success, failure);
                                result.then(done, done);
                            });

                            it('should not play the video', function() {
                                expect(player.video.play).not.toHaveBeenCalled();
                            });

                            it('should fulfill the Promise', function() {
                                expect(success).toHaveBeenCalledWith(player);
                            });
                        });

                        describe('when the video emits "play"', function() {
                            var AdPlaying;

                            beforeEach(function(done) {
                                AdPlaying = jasmine.createSpy('AdPlaying()');
                                player.on(VPAID_EVENTS.AdPlaying, AdPlaying);

                                trigger(player.video, HTML_MEDIA_EVENTS.PLAY);
                                result.then(done, done);
                            });

                            it('should emit AdPlaying', function() {
                                expect(AdPlaying).toHaveBeenCalled();
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
});
