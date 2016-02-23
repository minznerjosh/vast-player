'use strict';

var HTML_MEDIA_EVENTS = [
    'abort',
    'canplay',
    'canplaythrough',
    'durationchange',
    'emptied',
    'encrypted',
    'ended',
    'error',
    'interruptbegin',
    'interruptend',
    'loadeddata',
    'loadedmetadata',
    'loadstart',
    'mozaudioavailable',
    'pause',
    'play',
    'playing',
    'progress',
    'ratechange',
    'seeked',
    'seeking',
    'stalled',
    'suspend',
    'timeupdate',
    'volumechange',
    'waiting'
];

HTML_MEDIA_EVENTS.forEach(function(event) {
    this[event.toUpperCase()] = event;
}, HTML_MEDIA_EVENTS);

Object.freeze(HTML_MEDIA_EVENTS);

module.exports = HTML_MEDIA_EVENTS;
