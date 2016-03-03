package com.reelcontent.vpaidadapter.main {
    import com.reelcontent.vpaidadapter.vpaid.IVPAID;
    import com.reelcontent.vpaidadapter.vpaid.VPAIDEvent;
    import flash.display.DisplayObject;
    import flash.display.Loader;
    import flash.display.Sprite;
    import flash.events.Event;
    import flash.external.ExternalInterface;
    import flash.net.URLRequest;
    import flash.system.Security;
    import flash.text.*;
    import flash.utils.describeType;

    public class Player extends Sprite implements IVPAID {
        private var _black:Sprite = new Sprite();
        private var _vpaidURI:String;
        private var _eventCallback:String;

        private var _vpaidLoader:Loader;
        private var _vpaid:Object;

        public function Player():void {
            Security.allowDomain("*");
            Security.allowInsecureDomain("*");

            _black.graphics.clear();
            _black.graphics.beginFill(0x000000);
            _black.graphics.drawRect(0, 0, 1, 1);
            _black.graphics.endFill();
            _black.width = stage.stageWidth;
            _black.height = stage.stageHeight;

            addChild(_black);

            if (ExternalInterface.available) {
                try {
                    ExternalInterface.addCallback("getAdLinear", function() {
                        return adLinear;
                    });
                    ExternalInterface.addCallback("getAdExpanded", function() {
                        return adExpanded;
                    });
                    ExternalInterface.addCallback("getAdRemainingTime", function() {
                        return adRemainingTime;
                    });
                    ExternalInterface.addCallback("getAdVolume", function() {
                        return adVolume;
                    });
                    ExternalInterface.addCallback("setAdVolume", function(val) {
                        adVolume = val;
                    });
                    ExternalInterface.addCallback("getAdWidth", function() {
                        return adWidth;
                    });
                    ExternalInterface.addCallback("getAdHeight", function() {
                        return adHeight;
                    });
                    ExternalInterface.addCallback("getAdSkippableState", function() {
                        return adSkippableState;
                    });
                    ExternalInterface.addCallback("getAdDuration", function() {
                        return adDuration;
                    });
                    ExternalInterface.addCallback("getAdCompanions", function() {
                        return adCompanions;
                    });
                    ExternalInterface.addCallback("getAdIcons", function() {
                        return adIcons;
                    });

                    ExternalInterface.addCallback("handshakeVersion", handshakeVersion);
                    ExternalInterface.addCallback("initAd", initAd);
                    ExternalInterface.addCallback("resizeAd", resizeAd);
                    ExternalInterface.addCallback("startAd", startAd);
                    ExternalInterface.addCallback("stopAd", stopAd);
                    ExternalInterface.addCallback("skipAd", skipAd);
                    ExternalInterface.addCallback("pauseAd", pauseAd);
                    ExternalInterface.addCallback("resumeAd", resumeAd);
                    ExternalInterface.addCallback("expandAd", expandAd);
                    ExternalInterface.addCallback("collapseAd", collapseAd);
                } catch (e:Error) {}
            }

            if (this.loaderInfo.parameters) {
                if (this.loaderInfo.parameters.eventCallback) {
                    _eventCallback = this.loaderInfo.parameters.eventCallback;
                }

                if (this.loaderInfo.parameters.vpaidURI) {
                    _vpaidURI = this.loaderInfo.parameters.vpaidURI;

                    Security.allowDomain(_vpaidURI);
                    Security.allowInsecureDomain(_vpaidURI);

                    _vpaidLoader = new Loader();
                    _vpaidLoader.contentLoaderInfo.addEventListener(
                        Event.COMPLETE, onVpaidLoaderInit
                    );
                    _vpaidLoader.load(new URLRequest(_vpaidURI));
                }
            }
        }

        private function onVpaidLoaderInit(event:Event):void {
            if (Object(_vpaidLoader.content).hasOwnProperty('getVPAID')) {
                _vpaid = Object(_vpaidLoader.content).getVPAID();
            } else {
                _vpaid = _vpaidLoader.content;
            }

            _vpaid.addEventListener(VPAIDEvent.AdLoaded, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdStarted, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdStopped, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdSkipped, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdPaused, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdPlaying, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdSizeChange, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdLinearChange, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdSkippableStateChange, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdExpandedChange, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdDurationChange, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdRemainingTimeChange, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdVolumeChange, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdImpression, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdVideoStart, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdVideoFirstQuartile, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdVideoMidpoint, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdVideoThirdQuartile, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdVideoComplete, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdClickThru, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdUserAcceptInvitation, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdUserMinimize, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdUserClose, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdInteraction, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdLog, onVPAIDEvent);
            _vpaid.addEventListener(VPAIDEvent.AdError, onVPAIDEvent);

            this.addChild(_vpaid as DisplayObject);

            eventCallback({ type: "VPAIDInterfaceReady" });
        }

        private function onStageResize(evt:Event):void {
            _black.width = stage.stageWidth;
            _black.height = stage.stageHeight;

            eventCallback({ type: "VPAIDInterfaceResize" });
        }

        private function eventCallback(event:Object):void {
            if (ExternalInterface.available) {
                try {
                    ExternalInterface.call(_eventCallback, event);
                } catch (e:Error) {}
            }
        }

        private function toJSEventObject(event:Event):Object {
            var evt:Object = Object(event);
            var newEvent:Object = {};

            var xml:XML = describeType(evt);
            for each (var accessor in xml..accessor) {
                var name:String = accessor.@name;

                if (
                    typeof evt[name] === "string" ||
                    typeof evt[name] === "boolean" ||
                    typeof evt[name] === "number"
                ) {
                    newEvent[name] = evt[name];
                }
            }

            return newEvent;
        }

        public function onVPAIDEvent(event:Event) {
            var evt = toJSEventObject(event);
            eventCallback(evt);
        }

        public function get adLinear():Boolean {
            if (_vpaid)
                return _vpaid.adLinear;

            return false;
        }

        public function get adExpanded():Boolean {
            if (_vpaid)
                return _vpaid.adExpanded;

            return false;
        }

        public function get adRemainingTime():Number {
            if (_vpaid)
                return _vpaid.adRemainingTime;

            return -2;
        }

        public function get adVolume():Number {
            if (_vpaid)
                return _vpaid.adVolume;

            return 1;
        }

        public function set adVolume(value:Number):void {
            if (_vpaid)
                _vpaid.adVolume = value;
        }

        public function get adWidth():Number {
            if (_vpaid)
                return _vpaid.adWidth;

            return 0;
        }

        public function get adHeight():Number {
            if (_vpaid)
                return _vpaid.adHeight;

            return 0;
        }

        public function get adSkippableState():Boolean {
            if (_vpaid)
                return _vpaid.adSkippableState;

            return false;
        }

        public function get adDuration():Number {
            if (_vpaid)
                return _vpaid.adDuration;

            return 0;
        }

        public function get adCompanions():String {
            if (_vpaid)
                return _vpaid.adCompanions;

            return null;
        }

        public function get adIcons():Boolean {
            if (_vpaid)
                return _vpaid.adIcons;

            return false;
        }

        public function handshakeVersion(playerVPAIDVersion:String):String {
            if (_vpaid)
                return _vpaid.handshakeVersion(playerVPAIDVersion);

            return "2.0";
        }

        public function initAd(
            width:Number,
            height:Number,
            viewMode:String,
            desiredBitrate:Object = null,
            creativeData:Object = null,
            environmentVars:Object = null
        ):void {
            if (_vpaid) {
                _vpaid.initAd(
                    width,
                    height,
                    viewMode,
                    desiredBitrate,
                    creativeData,
                    environmentVars
                );

                stage.addEventListener(Event.RESIZE, onStageResize);
            }
        }

        public function resizeAd(width:Number, height:Number, viewMode:String):void {
            if (_vpaid)
                _vpaid.resizeAd(width, height, viewMode);
        }

        public function startAd():void {
            if (_vpaid)
                _vpaid.startAd();
        }

        public function stopAd():void {
            if (_vpaid)
                _vpaid.stopAd();
        }

        public function skipAd():void {
            if (_vpaid)
                _vpaid.skipAd();
        }

        public function pauseAd():void {
            if (_vpaid)
                _vpaid.pauseAd();
        }

        public function resumeAd():void {
            if (_vpaid)
                _vpaid.resumeAd();
        }

        public function expandAd():void {
            if (_vpaid)
                _vpaid.expandAd();
        }

        public function collapseAd():void {
            if (_vpaid)
                _vpaid.collapseAd();
        }
    }
}
