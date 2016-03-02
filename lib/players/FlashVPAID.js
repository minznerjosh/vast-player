'use strict';

var VPAID = require('./VPAID');
var inherits = require('util').inherits;
var LiePromise = require('lie');
var uuid = require('../uuid');
var querystring = require('querystring');
var EVENTS = require('../enums/VPAID_EVENTS');
var VPAIDVersion = require('../VPAIDVersion');

function FlashVPAID(container, swfURI) {
    VPAID.apply(this, arguments); // call super()

    this.swfURI = swfURI;
    this.object = null;
}
inherits(FlashVPAID, VPAID);

FlashVPAID.prototype.load = function load(mediaFiles, parameters) {
    var self = this;
    var uri = mediaFiles[0].uri;
    var bitrate = mediaFiles[0].bitrate;

    return new LiePromise(function loadCreative(resolve, reject) {
        var vpaid = document.createElement('object');
        var eventFnName = 'vast_player__' + uuid(20);
        var flashvars = querystring.stringify({
            vpaidURI: uri,
            eventCallback: eventFnName
        });

        function cleanup(reason) {
            self.container.removeChild(vpaid);
            self.api = null;
            self.object = null;
            delete window[eventFnName];

            if (reason) {
                reject(reason);
            }
        }

        vpaid.type = 'application/x-shockwave-flash';
        vpaid.data = self.swfURI + '?' + flashvars;
        vpaid.style.display = 'block';
        vpaid.style.width = '100%';
        vpaid.style.height = '100%';
        vpaid.style.border = 'none';
        vpaid.style.opacity = '0';
        vpaid.innerHTML = [
            '<param name="movie" value="' + self.swfURI + '">',
            '<param name="flashvars" value="' + flashvars + '">',
            '<param name="quality" value="high">',
            '<param name="play" value="false">',
            '<param name="loop" value="false">',
            '<param name="wmode" value="opaque">',
            '<param name="scale" value="noscale">',
            '<param name="salign" value="lt">',
            '<param name="allowScriptAccess" value="always">'
        ].join('\n');

        self.object = vpaid;

        window[eventFnName] = function handleVPAIDEvent(event) {
            switch (event.type) {
            case EVENTS.AdClickThru:
                return self.emit(event.type, event.url, event.Id, event.playerHandles);
            case EVENTS.AdInteraction:
            case EVENTS.AdLog:
                return self.emit(event.type, event.Id);
            case EVENTS.AdError:
                return self.emit(event.type, event.message);
            default:
                return self.emit(event.type);
            }
        };

        self.once('VPAIDInterfaceReady', function initAd() {
            var position = vpaid.getBoundingClientRect();
            var version = self.vpaidVersion = new VPAIDVersion(vpaid.handshakeVersion('2.0'));

            if (version.major > 2) {
                return reject(new Error('VPAID version ' + version + ' is not supported.'));
            }

            self.on('VPAIDInterfaceResize', function resizeAd() {
                var position = vpaid.getBoundingClientRect();

                self.resizeAd(position.width, position.height, 'normal');
            });

            vpaid.initAd(position.width, position.height, 'normal', bitrate, parameters, null);
        });

        self.once(EVENTS.AdLoaded, function handleAdLoaded() {
            self.api = vpaid;
            vpaid.style.opacity = '1';

            resolve(self);
        });

        self.once(EVENTS.AdError, function handleAdError(reason) {
            cleanup(new Error(reason));
        });

        self.once(EVENTS.AdStopped, cleanup);

        self.container.appendChild(vpaid);
    });
};

module.exports = FlashVPAID;
