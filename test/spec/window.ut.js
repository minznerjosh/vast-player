'use strict';

var proxyquire = require('proxyquire');

describe('window', function() {
    var window;
    var stubs;

    beforeEach(function() {
        stubs = {
            '@noCallThru': true
        };

        window = proxyquire('../../lib/window', stubs);
    });

    it('should be the global Object', function() {
        expect(window).toBe(global);
    });
});
