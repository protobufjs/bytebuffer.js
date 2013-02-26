ByteBuffer.js - A Java-like ByteBuffer
======================================
Provides a Java-like ByteBuffer implementation using typed arrays. It also tries to abstract the complexity away by
providing convenience methods for those who just want to write stuff without caring about signed, unsigned and the
actual bit sizes.

This is a first, mostly untested release. There is nothing more than an incomplete node-based test case, yet. However,
it will become stable as soon as it will be used for the cross-platform multiplayer component in
[eSoccer](http://www.esoccer.me), a HTML5 game developed at [University of Applied Sciences Bonn](http://www.h-brs.de).

But beware: I'd not use it in production, yet, especially the included UTF8 de-/encoder needs some testing.

ByteBuffer
----------
* Mimics [Java ByteBuffers](http://docs.oracle.com/javase/1.5.0/docs/api/java/nio/ByteBuffer.html) as close as reasonable
* Allocation through new ByteBuffer([capacity, [littleEndian]]) or ByteBuffer#allocate
* Wrapping of plain ArrayBuffers through ByteBuffer.wrap(buffer[, littleEndian])
* Cloning by maintaining the reference to the underlying ArrayBuffer (ByteBuffer#clone)
* Manual offset manipulation throught ByteBuffer#offset and ByteBuffer#length
* Explicit resizing through ByteBuffer#resize(capacity)
* Implicit resizing through ByteBuffer#ensureCapacity(newCapacity) on each operation. Doubles the capacity by default.
* Hate it or love it: ByteBuffer#flip
* Compacting to a an ArrayBuffer of its actual size (offset to length) through ByteBuffer#compact. Will implicitly flip
  if required. This is used to send ByteBuffer data over the wire (e.g. a WebSocket with binaryType="arraybuffer").
* Explicit destruction through ByteBuffer#destroy
* writeInt8, readInt8 with alias writeByte, readByte
* writeUint8, readUint8
* writeInt16, readInt16 with aliases writeShort, readShort
* writeUint16, readUint16
* writeInt32, readInt32 with aliases writeInt, readInt
* writeUint32, readUint32
* writeFloat32, readFloat32 with aliases writeFloat, readFloat
* writeFloat64, readFloat64 with aliases writeDouble, readDouble
* writeUTF8String, readUTF8String with aliases writeString, readString (prepends the number of characters as Uint32)
* writeJSON, readJSON to stringify and write respectivly to read and parse JSON data. Allows overriding the default
  stringify (default: JSON.stringify) and parse (default: JSON.parse) implementations.
* All with implicit offset advance if the offset parameter is omitted or without, if specified.
* Provides ByteBuffer#toString and ByteBuffer#printDebug (including hex encoded contents) for debugging
* Includes an UTF8 encoder and decoder (full 1-6 bytes, [ref](http://en.wikipedia.org/wiki/UTF-8#Description)) available
  through ByteBuffer.encodeUTF8 and ByteBuffer.decodeUTF8
  
Features
--------
* [CommonJS](http://www.commonjs.org/) compatible
* [RequireJS](http://requirejs.org/)/AMD compatible
* Shim compatible
* [node.js](http://nodejs.org) compatible, also available via [npm](https://npmjs.org/package/bytebuffer) (npm install bytebuffer)
* [Closure Compiler](https://developers.google.com/closure/compiler/) ADVANCED_OPTIMIZATIONS compatible (fully annotated)
* Fully documented ([jsdoc3](https://github.com/jsdoc3/jsdoc))

Examples & Tests
----------------
* [View source](https://github.com/dcodeIO/ByteBuffer.js/blob/master/examples/node-ByteBuffer.js)

License
-------
Apache License, Version 2.0 - http://www.apache.org/licenses/LICENSE-2.0.html