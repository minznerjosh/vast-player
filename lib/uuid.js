'use strict';

var POSSIBILITIES = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
var POSSIBILITIES_LENGTH = POSSIBILITIES.length;

module.exports = function uuid(length) {
    var result = '';

    while (length--) {
        result += POSSIBILITIES.charAt(Math.floor(Math.random() * POSSIBILITIES_LENGTH));
    }

    return result;
};
