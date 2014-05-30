/*
 Copyright 2013-2014 Daniel Wirtz <dcode@dcode.io>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
//? NODE = true;

/**
 * @license ByteBuffer.js (c) 2013-2014 Daniel Wirtz <dcode@dcode.io>  
 * This version of ByteBuffer.js uses a node Buffer (NB) as its backing buffer and is compatible with node.js only.  
 * Released under the Apache License, Version 2.0  
 * see: https://github.com/dcodeIO/ByteBuffer.js for details
 */
module.exports = (function() {
    "use strict";
    
    var buffer = require("buffer"),
        Buffer = buffer['Buffer'],
        SlowBuffer = buffer['SlowBuffer'],
        //? if (BUFFERVIEW)
        BufferView = require("bufferview"),
        Long = require("long"),
        memcpy = null; try { memcpy = require("memcpy"); } catch (e) {}

    //? include("ByteBuffer.js");

    /**
     * node-memcpy. This is an optional binding dependency and may not be present.
     * @type {?function(!(Buffer|ArrayBuffer|Uint8Array), number|!(Buffer|ArrayBuffer), (!(Buffer|ArrayBuffer|Uint8Array)|number)=, number=, number=):number}
     * @see https://npmjs.org/package/memcpy
     * @expose
     */
    ByteBuffer.memcpy = memcpy;
    //? if (BUFFERVIEW) {
    
    /**
     * node-BufferView. Available when compiled with `BUFFERVIEW=true`, which is the default.
     * @type {!BufferView}
     * @see https://npmjs.org/package/bufferview
     * @expose
     */
    ByteBuffer.BufferView = BufferView;
    //? }
    
    return ByteBuffer;

})();
