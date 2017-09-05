vast-player
===========

Vast-Player makes it easy to playback linear VAST creatives in the browser. It currently supports VPAID 1.0/2.0 (JavaScript and Flash) and HTML5 `<MediaFile>`s. The library has the following responsibilites:

* Requesting VAST ad tags
* Resolving VAST wrapper tags
* Choosing a `<MediaFile>` based on the browser environment
* Loading/initializing a `<MediaFile>` (including VPAID creatives)
* Firing VAST tracking pixels/impressions at the correct time
* Opening VAST `<VideoClicks>` when appropriate

### Example
```html
<!DOCTYPE html>
<html>
    <head>
        <title>Vast-Player Example</title>
        <script src="https://cdn.jsdelivr.net/npm/vast-player@latest/dist/vast-player.min.js"></script>
        <style>
            #container {
                width: 640px; height: 385px;
                position: relative;
            }
        </style>
    </head>
    <body>
        <div id="container"></div>
        <script>
            (function(VASTPlayer) {
                'use strict';

                var player = new VASTPlayer(document.getElementById('container'));

                player.once('AdStopped', function() {
                    console.log('Ad finished playback!');
                });

                player.load(
                    'https://platform-staging.reelcontent.com/api/public/vast/2.0/tag?campaign=cam-e951792a909f17'
                ).then(function startAd() {
                    return player.startAd();
                }).catch(function(reason) {
                    setTimeout(function() { throw reason; }, 0);
                });
            }(window.VASTPlayer));
        </script>
    </body>
</html>
```

Adding to Project
-----------------
### via npm (with browserify)

1. Install as a dependency

    ```bash
    $> npm install vast-player --save
    ```

2. Use the module

    ```javascript
    var VASTPlayer = require('vast-player');
    var player = new VASTPlayer(document.getElementById('container'));

    player.load('https://www.myadserver.com/mytag');
    ```

### via RequireJS

1. Add to RequireJS config

    ```javascript
    requirejs.config({
        paths: {
            VASTPlayer: 'https://cdn.jsdelivr.net/npm/vast-player@0.2/dist/vast-player.min.js'
        }
    });
    ```

2. Use the module

    ```javascript
    define(['VASTPlayer'], function(VASTPlayer) {
        var player = new VASTPlayer(document.getElementById('container'));

        player.load('https://www.myadserver.com/mytag');
    });
    ```

### via a `<script>`

1. Add a `<script>` to the page

    ```html
    <script src="https://cdn.jsdelivr.net/npm/vast-player@0.2/dist/vast-player.min.js"></script>
    ```

2. Use the module

    ```javascript
    var player = new window.VASTPlayer(document.getElementById('container'));

    player.load('https://www.myadserver.com/mytag');
    ```

API
----

### main exports
#### VASTPlayer(*container*:`Node`, *[config]*:`Object`) `extends` EventEmitter
* Parameters
    * **container**:`Node`: A DOM node into which the ad will be inserted. The ad will take up 100% of the width and height of the *container*.
    * *optional* **config**:`Object`: The following properties are supported
        * **config.vast**:`Object`: Configuration for fetching VAST ad tags
            * **config.vast.resolveWrappers**:`Boolean`: `true` if VAST `<Wrapper>`s should be fetched automatically. Defaults to `true`.
            * **config.vast.maxRedirects**:`Number`: The number of VAST `<Wrapper>`s that are allowed to be fetched. Defaults to `5`.
        * **config.tracking**:`Object`: Configuration for firing tracking pixels
            * **config.tracking.mapper**:`Function`: This `Function` can be used to transform the URIs of VAST tracking pixels. The `Function` will be invoked every time a tracking pixel is fired, with the URI of the pixel as the only argument. The returned `String` URI will be fired. Deaults to an [identity `Function`](https://en.wikipedia.org/wiki/Identity_function).
* Methods
    * **load(*uri*:`String`)** => `Promise`: Fetches a VAST ad tag and loads one of its `<MediaFile>`s into the *container*. The returned `Promise` will be resolved when it is safe to start playback via `startAd()`.
    * **startAd()** => `Promise`: Starts playback of the ad. This method may only be called once. The returned `Promise` will be fulfilled when the ad starts playing. This method cannot be called until the `Promise` returned by `load()` is fulfilled.
    * **stopAd()** => `Promise`: Stops playback of the ad and cleans-up its resources. Once this method has been called, the ad cannot be started again via `startAd()`. The returned `Promise` will be fulfilled when the ad's resources are cleaned-up. This method cannot be called until the `Promise` returned by `load()` is fulfilled.
    * **pauseAd()** => `Promise`: Pauses ad playback. The returned `Promise` will be fulfilled when the ad pauses. This method cannot be called until the `Promise` returned by `startAd()` is fulfilled.
    * **resumeAd()** => `Promise`: Resumes ad playback. The returned `Promise` will be fulfilled when ad playback resumes. This method cannot be called until the `Promise` returned by `pauseAd()` is fulfilled.
* Properties
    * **container**:`Node`: The supplied container.
    * **config**:`Object`: The supplied configuration, with defaults applied.
    * **vast**:[`VAST`](https://www.npmjs.com/package/vastacular#vastjson): A [vastacular](https://www.npmjs.com/package/vastacular) `VAST` instance representing the fetched ad tag.
    * **ready**:`Boolean`: Indicates if the ad is ready for playback.
    * **adRemainingTime**:`Number`: The amount of time (in seconds) left in the linear ad. Accessing this property before the ad is loaded will throw an `Error`.
    * **adDuration**:`Number`: The total duration of the ad (in seconds.) Accessing this property before the ad is loaded will throw an `Error`.
    * **adVolume**:`Number`: Gets/sets the volume of the ad with `0` being completely silent and `1` being as loud as possible. Accessing (or setting) this property before the ad is loaded will throw an `Error`.
* Events: All [VPAID 2.0](http://www.iab.com/guidelines/digital-video-player-ad-interface-definition-vpaid-2-0/) events are supported. A subset of these events are supported for non-VPAID `<MediaFile>`s as well. In addition, the following events are emitted:
    * **ready**: Fired when `startAd()` may be called and the `ready` property becomes `true`.
    * **error**: Fired when an error occurs with ad loading/playback.

#### VASTPlayer.vpaidSWFLocation:`String`
The location of the SWF needed for Flash VPAID playback. The defaults to a location on the [jsDelivr](https://www.jsdelivr.com/) CDN. Only override this property if you want to use a version of the SWF you have uploaded yourself.
