'use strict';

function VPAIDVersion(versionString) {
    var parts = versionString.split('.').map(parseFloat);

    this.string = versionString;

    this.major = parts[0];
    this.minor = parts[1];
    this.patch = parts[2];

    Object.freeze(this);
}

VPAIDVersion.prototype.toString = function toString() {
    return this.string;
};

module.exports = VPAIDVersion;
