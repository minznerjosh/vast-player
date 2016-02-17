'use strict';

var proxyquire = require('proxyquire');

describe('MIME', function() {
    var MIME;
    var stubs;

    beforeEach(function() {
        stubs = {
            '@noCallThru': true
        };

        MIME = proxyquire('../../lib/enums/MIME', stubs);
    });

    it('should be an Object', function() {
        expect(MIME).toEqual(jasmine.any(Object));
    });

    it('should be frozen', function() {
        expect(Object.isFrozen(MIME)).toBe(true, 'MIME is not frozen!');
    });

    it('should have a property for relevant MIME types', function() {
        expect(MIME.JAVASCRIPT).toBe('application/javascript', 'JAVASCRIPT');
        expect(MIME.FLASH).toBe('application/x-shockwave-flash', 'FLASH');
    });
});
