ByteBuffer.js - A Java-like ByteBuffer
======================================
Provides a Java-like ByteBuffer implementation using typed arrays. It also tries to abstract the complexity away by
providing convenience methods for those who just want to write stuff without caring about signed, unsigned and the
actual bit sizes. It's also used for the cross-platform multiplayer component in [eSoccer](http://www.esoccer.me),
a HTML5 game developed at [University of Applied Sciences Bonn](http://www.h-brs.de).

ByteBuffer
----------
* Mimics [Java ByteBuffers](http://docs.oracle.com/javase/1.5.0/docs/api/java/nio/ByteBuffer.html) as close as reasonable while using typed array terms
* Simple allocation (new ByteBuffer or ByteBuffer#allocate)
* Wrapping of quite everything which is or includes an ArrayBuffer (ByteBuffer.wrap)
* Cloning using the same (ByteBuffer#clone) and copying using an independent backing buffer (ByteBuffer#copy)
* Slicing using the same (ByteBuffer#slice) and using an indepentent backing buffer (ByteBuffer#sliceAndCompact)
* Manual offset (ByteBuffer#offset and ByteBuffer#length) and array manipulation (ByteBuffer#array)
* Remaining readable bytes (ByteBuffer#remaining) and backing buffer capacity getters (ByteBuffer#capacity)
* Explicit (ByteBuffer#resize) and implicit resizing (ByteBuffer#ensureCapacity)
* Efficient implicit resizing by doubling the current capacity
* Flipping (ByteBuffer#flip) and resetting (ByteBuffer#reset) like known from Java ByteBuffers
* Compacting of the backing buffer (ByteBuffer#compact)
* Conversion to ArrayBuffer (ByteBuffer#toArrayBuffer) (i.e. to send data over the wire, e.g. a WebSocket with
  binaryType="arraybuffer")
* Explicit destruction (ByteBuffer#destroy)
* writeInt8/16/32, readInt8/16/32, writeUint8/16/32, readUint8/16/32
* writeFloat32/64, readFloat32/64
* write/readByte, write/readShort, write/readInt, write/readLong (all signed), write/readFloat, write/readDouble for convenience
* write/readUTF8String using the included UTF8 en-/decoder (full 6 bytes, [ref](http://en.wikipedia.org/wiki/UTF-8#Description))
* write/readLString to write respectively read a length-prepended (number of characters as UTF8 char) string
* write/readCString to write respectively read a NULL-terminated (Uint8 0x00) string
* write/readJSON to write respectively read arbitraty object data. Allows overriding the default stringify
  (default: JSON.stringify) and parse (default: JSON.parse) implementations.
* All with implicit offset advance if the offset parameter is omitted or without, if specified
* Chaining of all operations that allow this (i.e. do not return some specific value like in read operations), e.g.
  bb.reset().writeInt(1).writeLString("Hello world!").flip().compact()...
* Provides ByteBuffer#toString, ByteBuffer#toHex and ByteBuffer#printDebug for easy debugging
  
Features
--------
* [CommonJS](http://www.commonjs.org/) compatible
* [RequireJS](http://requirejs.org/)/AMD compatible
* Shim compatible (include the script, then use var ByteBuffer = dcodeIO.ByteBuffer;)
* [node.js](http://nodejs.org) compatible, also available via [npm](https://npmjs.org/package/bytebuffer)
* [Closure Compiler](https://developers.google.com/closure/compiler/) ADVANCED_OPTIMIZATIONS compatible (fully annotated)
* Fully documented ([jsdoc3](https://github.com/jsdoc3/jsdoc))
* Tested through [nodeunit](https://github.com/caolan/nodeunit) (TODO: heavily test UTF8 en-/decoding)
* Zero dependencies
* Small footprint

Usage
-----
### Node.js / CommonJS ###
* Install: `npm install bytebuffer`

```javascript
var ByteBuffer = require("bytebuffer");
var bb = new ByteBuffer();
bb.writeLString("Hello world!");
bb.flip();
console.log(bb.readLString()+" from ByteBuffer.js");
```

### Browser (shim) ###

```html
<script src="//raw.github.com/dcodeIO/ByteBuffer.js/master/ByteBuffer.min.js"></script>
```

```javascript
var ByteBuffer = dcodeIO.ByteBuffer;
var bb = new ByteBuffer();
bb.writeLString("Hello world!");
bb.flip();
alert(bb.readLString()+" from ByteBuffer.js");
```

### Require.js / AMD ###

```javascript
var ByteBuffer = require("/path/to/ByteBuffer.js");
var bb = new ByteBuffer();
bb.writeLString("Hello world!");
bb.flip();
alert(bb.readLString()+" from ByteBuffer.js");
```

Documentation
-------------
* [jsdoc3](https://github.com/jsdoc3/jsdoc): [View](http://htmlpreview.github.com/?http://github.com/dcodeIO/ByteBuffer.js/master/docs/dcodeIO.ByteBuffer.html)

Tests (& Examples)
------------------
* [nodeunit](https://github.com/caolan/nodeunit): [View source](https://github.com/dcodeIO/ByteBuffer.js/blob/master/tests/suite.js)
* Run: `nodeunit suite.js`

Prerequisites to run it against IE<10, FF<15, Chrome<9 etc.
-----------------------------------------------------------
* Working ArrayBuffer, DataView & Uint8Array implementations (i.e. use a [polyfill](http://www.calormen.com/polyfill/#typedarray), [2](https://github.com/davidflanagan/DataView.js))

License
-------
Apache License, Version 2.0 - http://www.apache.org/licenses/LICENSE-2.0.html