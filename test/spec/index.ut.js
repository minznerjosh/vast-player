'use strict';

var proxyquire = require('proxyquire');

describe('index.js', function() {
    var index;
    var stubs;

    beforeEach(function() {
        stubs = {
            '@noCallThru': true
        };

        index = proxyquire('../../index', stubs);
    });

    it('should exist', function() {
        expect(index).toEqual(jasmine.any(Object));
    });
});
