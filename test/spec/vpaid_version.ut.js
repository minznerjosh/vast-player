'use strict';

var proxyquire = require('proxyquire');

describe('VPAIDVersion(versionString)', function() {
    var VPAIDVersion;
    var stubs;

    beforeEach(function() {
        stubs = {
            '@noCallThru': true
        };

        VPAIDVersion = proxyquire('../../lib/VPAIDVersion', stubs);
    });

    it('should exist', function() {
        expect(VPAIDVersion).toEqual(jasmine.any(Function));
        expect(VPAIDVersion.name).toEqual('VPAIDVersion');
    });

    describe('instance:', function() {
        var version;
        var versionString;

        beforeEach(function() {
            versionString = '1.1.0';

            version = new VPAIDVersion(versionString);
        });

        it('should exist', function() {
            expect(version).toEqual(jasmine.any(Object));
        });

        it('should be frozen', function() {
            expect(Object.isFrozen(version)).toBe(true, 'version is not frozen!');
        });

        describe('if some parts of the version are missing', function() {
            beforeEach(function() {
                version = new VPAIDVersion('3');
            });

            it('should set those parts to undefined', function() {
                expect(version.major).toBe(3);
                expect(version.minor).toBeUndefined();
                expect(version.patch).toBeUndefined();
            });
        });

        describe('properties:', function() {
            describe('string', function() {
                it('should be the original versionString', function() {
                    expect(version.string).toBe(versionString);
                });
            });

            describe('major', function() {
                it('should be the major version as an int', function() {
                    expect(version.major).toBe(1);
                });
            });

            describe('minor', function() {
                it('should be the minor version as an int', function() {
                    expect(version.minor).toBe(1);
                });
            });

            describe('patch', function() {
                it('should be the patch version as an int', function() {
                    expect(version.patch).toBe(0);
                });
            });
        });

        describe('methods:', function() {
            describe('toString()', function() {
                it('should return the versionString', function() {
                    expect(version.toString()).toBe(versionString);
                });
            });
        });
    });
});
