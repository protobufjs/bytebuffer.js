ByteBuffer.js - A Java-like ByteBuffer
======================================
Provides a Java-like ByteBuffer implementation using typed arrays. It also tries to abstract the complexity away by
providing convenience methods for those who just want to write stuff without caring about signed, unsigned and the
actual bit sizes. It's also used for the cross-platform multiplayer component in [eSoccer](http://www.esoccer.me),
a HTML5 game developed at [University of Applied Sciences Bonn](http://www.h-brs.de).

ByteBuffer
----------
* Mimics [Java ByteBuffers](http://docs.oracle.com/javase/1.5.0/docs/api/java/nio/ByteBuffer.html) as close as reasonable
* Allocation through new ByteBuffer([capacity, [littleEndian]]) or ByteBuffer#allocate
* Wrapping of plain ArrayBuffers or any object with an "array" or "buffer" property which is an ArrayBuffer
  through ByteBuffer.wrap(buffer[, littleEndian])
* Cloning by maintaining the reference to the underlying ArrayBuffer (ByteBuffer#clone)
* Copying to use an independent ArrayBuffer for the copy through ByteBuffer#copy
* Slicing while maintaining the reference to the underlying ArrayBuffer through ByteBuffer#slice
* Slicing to use an independent ArrayBuffer for the copy through ByteBuffer#sliceAndCompact
* Manual offset manipulation throught ByteBuffer#offset and ByteBuffer#length
* Manual array manipulation through ByteBuffer#array
* Explicit resizing through ByteBuffer#resize(capacity)
* Implicit resizing through ByteBuffer#ensureCapacity(newCapacity) on each operation. Doubles the capacity by default
  to be efficient in speed while maintaining reasonable memory usage.
* Hate it or love it: ByteBuffer#flip and ByteBuffer#reset
* Compacting to a an ArrayBuffer of its actual size (offset to length) through ByteBuffer#compact. Will implicitly flip
  if required. This is used to send ByteBuffer data over the wire (e.g. a WebSocket with binaryType="arraybuffer").
* If you do not want to care about compacting yourself, use ByteBuffer#toArrayBuffer to do all the stuff automatically
  and just send the data over whatever wire you prefer afterwards. Will return a reference to the backing buffer if
  already in a compacted form unless the forceCopy parameter is set to true.
* Explicit destruction through ByteBuffer#destroy
* writeInt8, readInt8 with alias writeByte, readByte
* writeUint8, readUint8
* writeInt16, readInt16 with aliases writeShort, readShort
* writeUint16, readUint16
* writeInt32, readInt32 with aliases writeInt, readInt
* writeUint32, readUint32
* writeFloat32, readFloat32 with aliases writeFloat, readFloat
* writeFloat64, readFloat64 with aliases writeDouble, readDouble
* writeUTF8String, readUTF8String
* writeLString, readLString to write respectively read a length-prepended (as UTF8 character) string
* writeCString, readCString to write respectively read a NULL-terminated (Uint8) string
* writeJSON, readJSON to stringify and write respectivly to read and parse JSON data. Allows overriding the default
  stringify (default: JSON.stringify) and parse (default: JSON.parse) implementations.
* All with implicit offset advance if the offset parameter is omitted or without, if specified.
* Chaining for all operations that allow this (i.e. do not return some specific value like in read operations), e.g.
  bb.writeInt(1).writeString("Hello world!")...
* Provides ByteBuffer#toString, ByteBuffer#toHex and ByteBuffer#printDebug
* Includes an UTF8 encoder and decoder (full 1-6 bytes, [ref](http://en.wikipedia.org/wiki/UTF-8#Description)) available
  through ByteBuffer.encodeUTF8Char and ByteBuffer.decodeUTF8Char
  
Features
--------
* [CommonJS](http://www.commonjs.org/) compatible
* [RequireJS](http://requirejs.org/)/AMD compatible
* Shim compatible (include the script, then use var ByteBuffer = dcodeIO.ByteBuffer;)
* [node.js](http://nodejs.org) compatible, also available via [npm](https://npmjs.org/package/bytebuffer) (npm install bytebuffer)
* [Closure Compiler](https://developers.google.com/closure/compiler/) ADVANCED_OPTIMIZATIONS compatible (fully annotated)
* Fully documented ([jsdoc3](https://github.com/jsdoc3/jsdoc))
* Tested through [nodeunit](https://github.com/caolan/nodeunit) (TODO: heavily test UTF8 en-/decoding)
* Zero dependencies
* Small footprint

Usage
-----
### Node / CommonJS ###
* Install: npm install bytebuffer
```javascript
var ByteBuffer = require("bytebuffer");
var bb = new ByteBuffer();
bb.writeLString("Hello world!");
bb.flip();
console.log(bb.readLString()+" from ByteBuffer.js");
```
### Browser (shim) ###
```
<script src="https://raw.github.com/dcodeIO/ByteBuffer.js/master/ByteBuffer.min.js"></script>
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
* [View](http://htmlpreview.github.com/?http://github.com/dcodeIO/ByteBuffer.js/master/docs/dcodeIO.ByteBuffer.html)

Tests (& Examples)
------------------
* [View source](https://github.com/dcodeIO/ByteBuffer.js/blob/master/tests/suite.js)

Prerequisites to run it against IE<10, FF<15, Chrome<9 etc.
-----------------------------------------------------------
* Working ArrayBuffer, DataView & Uint8Array implementations (i.e. use a [polyfill](http://www.calormen.com/polyfill/#typedarray), [2](https://github.com/davidflanagan/DataView.js))

License
-------
Apache License, Version 2.0 - http://www.apache.org/licenses/LICENSE-2.0.html