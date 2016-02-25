package com.reelcontent.vpaidadapter.vpaid {

    public interface IVPAID {
        function get adLinear():Boolean;
        function get adExpanded():Boolean;
        function get adRemainingTime():Number;
        function get adVolume():Number;
        function set adVolume(value:Number):void;
        function get adWidth():Number;
        function get adHeight():Number;
        function get adSkippableState():Boolean;
        function get adDuration():Number;
        function get adCompanions():String;
        function get adIcons():Boolean;

        function handshakeVersion(playerVPAIDVersion:String):String;
        function initAd(
            width:Number,
            height:Number,
            viewMode:String,
            desiredBitrate:Object = null,
            creativeData:Object = null,
            environmentVars:Object = null
        ):void;
        function resizeAd(width:Number, height:Number, viewMode:String):void;
        function startAd():void;
        function stopAd():void;
        function pauseAd():void;
        function resumeAd():void;
        function expandAd():void;
        function collapseAd():void;
        function skipAd():void;
    }
}
