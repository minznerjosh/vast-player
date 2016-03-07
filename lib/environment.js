'use strict';

var win = require('./window');
var video = document.createElement('video');
var MIME = require('./enums/MIME');

exports.isDesktop = !/Android|Silk|Mobile|PlayBook/.test(win.navigator.userAgent);

exports.canPlay = function canPlay(type) {
    var mimeTypes = win.navigator.mimeTypes;
    var ActiveXObject = win.ActiveXObject;

    switch (type) {
    case MIME.FLASH:
        try {
            return new ActiveXObject('ShockwaveFlash.ShockwaveFlash') ? 2 : 0;
        } catch (e) {
            return !!(mimeTypes && mimeTypes[MIME.FLASH]) ? 2 : 0;
        }
        return 0;
    case MIME.JAVASCRIPT:
    case 'application/x-javascript':
        return 2;
    default:
        if (video.canPlayType) {
            switch (video.canPlayType(type)) {
            case 'probably':
                return 2;
            case 'maybe':
                return 1;
            default:
                return 0;
            }
        }
    }

    return 0;
};

Object.freeze(exports);
