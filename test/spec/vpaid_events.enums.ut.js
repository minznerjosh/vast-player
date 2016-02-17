'use strict';

var proxyquire = require('proxyquire');

describe('VPAID_EVENTS', function() {
    var VPAID_EVENTS;
    var stubs;

    beforeEach(function() {
        stubs = {
            '@noCallThru': true
        };

        VPAID_EVENTS = proxyquire('../../lib/enums/VPAID_EVENTS', stubs);
    });

    it('should be an Array', function() {
        expect(VPAID_EVENTS).toEqual(jasmine.any(Array));
    });

    it('should be frozen', function() {
        expect(Object.isFrozen(VPAID_EVENTS)).toBe(true, 'VPAID_EVENTS is not frozen!');
    });

    it('should have a member for each VPAID event name', function() {
        expect(VPAID_EVENTS.slice()).toEqual([
            'AdLoaded',
            'AdStarted',
            'AdStopped',
            'AdSkipped',
            'AdSkippableStateChange',
            'AdSizeChange',
            'AdLinearChange',
            'AdDurationChange',
            'AdExpandedChange',
            'AdRemainingTimeChange',
            'AdVolumeChange',
            'AdImpression',
            'AdVideoStart',
            'AdVideoFirstQuartile',
            'AdVideoMidpoint',
            'AdVideoThirdQuartile',
            'AdVideoComplete',
            'AdClickThru',
            'AdInteraction',
            'AdUserAcceptInvitation',
            'AdUserMinimize',
            'AdUserClose',
            'AdPaused',
            'AdPlaying',
            'AdLog',
            'AdError'
        ]);
    });

    it('should have a property for each VPAID event name', function() {
        VPAID_EVENTS.forEach(function(event) {
            expect(VPAID_EVENTS[event]).toBe(event);
        });
    });
});
