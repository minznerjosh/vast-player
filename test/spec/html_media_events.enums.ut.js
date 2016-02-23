'use strict';

var proxyquire = require('proxyquire');

describe('HTML_MEDIA_EVENTS', function() {
    var HTML_MEDIA_EVENTS;
    var stubs;

    beforeEach(function() {
        stubs = {
            '@noCallThru': true
        };

        HTML_MEDIA_EVENTS = proxyquire('../../lib/enums/HTML_MEDIA_EVENTS', stubs);
    });

    it('should be an Array', function() {
        expect(HTML_MEDIA_EVENTS).toEqual(jasmine.any(Array));
    });

    it('should be frozen', function() {
        expect(Object.isFrozen(HTML_MEDIA_EVENTS)).toBe(true, 'HTML_MEDIA_EVENTS is not frozen!');
    });

    it('should have a member for each HTMLMediaElement event name', function() {
        expect(HTML_MEDIA_EVENTS.slice()).toEqual([
            'abort',
            'canplay',
            'canplaythrough',
            'durationchange',
            'emptied',
            'encrypted',
            'ended',
            'error',
            'interruptbegin',
            'interruptend',
            'loadeddata',
            'loadedmetadata',
            'loadstart',
            'mozaudioavailable',
            'pause',
            'play',
            'playing',
            'progress',
            'ratechange',
            'seeked',
            'seeking',
            'stalled',
            'suspend',
            'timeupdate',
            'volumechange',
            'waiting'
        ]);
    });

    it('should have a property for each VPAID event name', function() {
        HTML_MEDIA_EVENTS.forEach(function(event) {
            expect(HTML_MEDIA_EVENTS[event.toUpperCase()]).toBe(event);
        });
    });
});
