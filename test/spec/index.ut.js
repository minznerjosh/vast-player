'use strict';

var proxyquire = require('proxyquire');
var VASTPlayer = require('../../lib/VASTPlayer');

describe('index.js', function() {
    var index;
    var stubs;

    beforeEach(function() {
        stubs = {
            './lib/VASTPlayer': VASTPlayer,

            '@noCallThru': true
        };

        index = proxyquire('../../index', stubs);
    });

    it('should be the VASTPlayer', function() {
        expect(index).toBe(VASTPlayer);
    });
});
