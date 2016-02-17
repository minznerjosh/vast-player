'use strict';

var proxyquire = require('proxyquire');

describe('uuid(length)', function() {
    var uuid;
    var stubs;

    beforeEach(function() {
        stubs = {
            '@noCallThru': true
        };

        uuid = proxyquire('../../lib/uuid', stubs);
    });

    it('should generate a uuid of the provided length', function() {
        expect(uuid(10)).toMatch(/^[a-zA-Z0-9]{10}$/);
        expect(uuid(15)).toMatch(/^[a-zA-Z0-9]{15}$/);
        expect(uuid(5)).toMatch(/^[a-zA-Z0-9]{5}$/);
    });

    it('should generate a unique ID', function() {
        expect(uuid(10)).not.toBe(uuid(10));
    });
});

