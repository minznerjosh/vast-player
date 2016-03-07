'use strict';

var proxyquire = require('proxyquire');

describe('environment', function() {
    var environment;
    var stubs;
    var mockWindow;

    function get() {
        return (environment = proxyquire('../../lib/environment', stubs));
    }

    beforeEach(function() {
        mockWindow = {
            navigator: {
                mimeTypes: {},
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.109 Safari/537.36'
            }
        };

        stubs = {
            './window': mockWindow,

            '@noCallThru': true
        };

        get();
    });

    it('should exist', function() {
        expect(environment).toEqual(jasmine.any(Object));
    });

    it('should be frozen', function() {
        expect(Object.isFrozen(environment)).toBe(true, 'environment is not frozen!');
    });

    describe('properties', function() {
        describe('isDesktop', function() {
            [
                'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
                'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A',
                'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246',
                'Opera/9.80 (X11; Linux i686; Ubuntu/14.10) Presto/2.12.388 Version/12.16'
            ].forEach(function(userAgent) {
                describe('with userAgent "' + userAgent + '"', function() {
                    beforeEach(function() {
                        mockWindow.navigator.userAgent = userAgent;
                        get();
                    });

                    it('should be true', function() {
                        expect(environment.isDesktop).toBe(true);
                    });
                });
            });

            [
                'Mozilla/5.0 (Linux; U; en-us; KFAPWI Build/JDQ39) AppleWebKit/535.19 (KHTML, like Gecko) Silk/3.13 Safari/535.19 Silk-Accelerated=true',
                'Mozilla/5.0 (iPad; CPU OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B137 Safari/601.1',
                'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
                'Mozilla/5.0 (PlayBook; U; RIM Tablet OS 2.1.0; en-US) AppleWebKit/536.2+ (KHTML like Gecko) Version/7.2.1.0 Safari/536.2+',
                'Mozilla/5.0 (BB10; Touch) AppleWebKit/537.10+ (KHTML, like Gecko) Version/10.0.9.2372 Mobile Safari/537.10+',
                'Mozilla/5.0 (Linux; Android 4.3; Nexus 10 Build/JSS15Q) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Safari/537.36',
                'Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36',
                'Mozilla/5.0 (Linux; U; Android 4.4.2; en-us; LGMS323 Build/KOT49I.MS32310c) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/46.0.2490.76 Mobile Safari/537.36',
                'Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 520)',
                'Mozilla/5.0 (Linux; U; Android 4.3; en-us; SM-N900T Build/JSS15J) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
                'Mozilla/5.0 (Linux; Android 4.2.2; GT-I9505 Build/JDQ39) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36'
            ].forEach(function(userAgent) {
                describe('with userAgent "' + userAgent + '"', function() {
                    beforeEach(function() {
                        mockWindow.navigator.userAgent = userAgent;
                        get();
                    });

                    it('should be false', function() {
                        expect(environment.isDesktop).toBe(false);
                    });
                });
            });
        });
    });

    describe('Functions', function() {
        describe('canPlay(type)', function() {
            var canPlay;
            var type;

            beforeEach(function() {
                canPlay = environment.canPlay;
            });

            describe('if the type is "video/x-flv"', function() {
                beforeEach(function() {
                    type = 'video/x-flv';
                });

                it('should return 0', function() {
                    expect(canPlay(type)).toBe(0);
                });
            });

            describe('if the type is "application/javascript"', function() {
                beforeEach(function() {
                    type = 'application/javascript';
                });

                it('should return 2', function() {
                    expect(canPlay(type)).toBe(2);
                });
            });

            describe('if the type is "application/x-javascript"', function() {
                beforeEach(function() {
                    type = 'application/x-javascript';
                });

                it('should return 2', function() {
                    expect(canPlay(type)).toBe(2);
                });
            });

            describe('if the type is "application/x-shockwave-flash"', function() {
                beforeEach(function() {
                    type = 'application/x-shockwave-flash';
                });

                describe('in any browser but IE', function() {
                    beforeEach(function() {
                        delete mockWindow.ActiveXObject;
                    });

                    describe('if the browser has no mimeTypes', function() {
                        beforeEach(function() {
                            delete mockWindow.navigator.mimeTypes;
                        });

                        it('should return 0', function() {
                            expect(canPlay(type)).toBe(0);
                        });
                    });

                    describe('if the browser has mimeTypes', function() {
                        beforeEach(function() {
                            mockWindow.navigator.mimeTypes = {};
                        });

                        describe('but the "Shockwave Flash" plugin is undefined', function() {
                            beforeEach(function() {
                                mockWindow.navigator.mimeTypes['application/x-shockwave-flash'] = undefined;
                            });

                            it('should return 0', function() {
                                expect(canPlay(type)).toBe(0);
                            });
                        });

                        describe('and the "Shockwave Flash" is an Object', function() {
                            beforeEach(function() {
                                mockWindow.navigator.mimeTypes['application/x-shockwave-flash'] = {};
                            });

                            it('should return 2', function() {
                                expect(canPlay(type)).toBe(2);
                            });
                        });
                    });
                });

                describe('in IE', function() {
                    beforeEach(function() {
                        delete mockWindow.navigator.mimeTypes;
                        mockWindow.ActiveXObject = jasmine.createSpy('ActiveXObject()');
                    });

                    describe('if the ShockwaveFlash.ShockwaveFlash ActiveXObject() throws an Error', function() {
                        beforeEach(function() {
                            mockWindow.ActiveXObject.and.throwError(new Error('NOT VALID!'));
                        });

                        it('should return 0', function() {
                            expect(canPlay(type)).toBe(0);
                            expect(mockWindow.ActiveXObject).toHaveBeenCalledWith('ShockwaveFlash.ShockwaveFlash');
                        });
                    });

                    [true, {}].forEach(function(value) {
                        describe('if the ShockwaveFlash.ShockwaveFlash is ' + value, function() {
                            beforeEach(function() {
                                mockWindow.ActiveXObject.and.returnValue(value);
                            });

                            it('should return 2', function() {
                                expect(canPlay(type)).toBe(2);
                                expect(mockWindow.ActiveXObject).toHaveBeenCalledWith('ShockwaveFlash.ShockwaveFlash');
                            });
                        });
                    });
                });
            });

            ['video/x-flv', 'video/mp4', 'video/webm', 'video/3gp'].forEach(function(mime) {
                describe('if the type is ' + mime, function() {
                    beforeEach(function() {
                        type = mime;
                    });

                    describe('if the browser supports HTML5 video', function() {
                        var createElement;
                        var video;

                        beforeEach(function() {
                            createElement = document.createElement;
                            spyOn(document, 'createElement').and.callFake(function(tagName) {
                                var element = createElement.apply(document, arguments);

                                if (tagName.toUpperCase() === 'VIDEO') {
                                    element.canPlayType = jasmine.createSpy('HTMLMediaElement.prototype.canPlayType()').and.returnValue('');
                                }

                                return element;
                            });

                            environment = proxyquire('../../lib/environment', stubs);
                            canPlay = environment.canPlay;

                            expect(document.createElement).toHaveBeenCalledWith('video');
                            video = document.createElement.calls.mostRecent().returnValue;
                        });

                        describe('and the browser can\'t play that type', function() {
                            beforeEach(function() {
                                video.canPlayType.and.returnValue('');
                            });

                            it('should return 0', function() {
                                expect(canPlay(type)).toBe(0);
                                expect(video.canPlayType).toHaveBeenCalledWith(type);
                            });
                        });

                        describe('if the browser can maybe play that type', function() {
                            beforeEach(function() {
                                video.canPlayType.and.returnValue('maybe');
                            });

                            it('should return 1', function() {
                                expect(canPlay(type)).toBe(1);
                                expect(video.canPlayType).toHaveBeenCalledWith(type);
                            });
                        });

                        describe('if the browser can probably play that type', function() {
                            beforeEach(function() {
                                video.canPlayType.and.returnValue('probably');
                            });

                            it('should return 2', function() {
                                expect(canPlay(type)).toBe(2);
                                expect(video.canPlayType).toHaveBeenCalledWith(type);
                            });
                        });
                    });

                    describe('if the browser does not support HTML5 video', function() {
                        var createElement;

                        beforeEach(function() {
                            createElement = document.createElement;
                            spyOn(document, 'createElement').and.callFake(function(tagName) {
                                var element = createElement.apply(document, arguments);

                                if (tagName.toUpperCase() === 'VIDEO') {
                                    delete element.canPlayType;
                                }

                                return element;
                            });

                            environment = proxyquire('../../lib/environment', stubs);
                            canPlay = environment.canPlay;

                            expect(document.createElement).toHaveBeenCalledWith('video');
                        });

                        it('should return 0', function() {
                            expect(canPlay(type)).toBe(0);
                        });
                    });
                });
            });
        });
    });
});
