![ByteBuffer.js - A Java-like ByteBuffer](https://raw.github.com/dcodeIO/ByteBuffer.js/master/ByteBuffer.png)
======================================
Provides a full-features ByteBuffer implementation using typed arrays. It also tries to abstract a bit of
the complexity away by providing convenience methods for those who just want to write stuff without caring about signed,
unsigned and the actual bit sizes. It's also one of the components driving [ProtoBuf.js](https://github.com/dcodeIO/ProtoBuf.js)
and the [PSON](https://github.com/dcodeIO/PSON) reference implementation.

*Note:* The API behind toHex and toString has changed with ByteBuffer 2.0.0, which is a generally revised release, in
favor of making this more intuitive.

What can it do?
---------------
* Mimics Java ByteBuffers as close as reasonable while using typed array terms
* Signed and unsigned integers (8, 16, 32, 64 bit through [Long.js](https://github.com/dcodeIO/Long.js)) with endianness support
* Varints as known from protobuf including zig-zag encoding
* Includes an UTF8 and Base64 en-/decoder
* C-strings, Varint-prefixed strings and UTF8 length-prefixed strings 
* Rich string toolset (to hex, base64, utf8, debug, columns)
* Relative and absolute zero-copy operations
* Automatic resizing (always doubles)
* Chaining of all operations that do not return a specific value
* Slicing, appending, prepending etc.

And much more... (see the API documentation)

Features
--------
* [CommonJS](http://www.commonjs.org/) compatible
* [RequireJS](http://requirejs.org/)/AMD compatible
* [node.js](http://nodejs.org) compatible, also available via [npm](https://npmjs.org/package/bytebuffer)
* Browser compatible
* [Closure Compiler](https://developers.google.com/closure/compiler/) ADVANCED_OPTIMIZATIONS compatible (fully annotated,
  `ByteBuffer.min.js` has been compiled this way, `ByteBuffer.min.map` is the source map)
* Fully documented using [jsdoc3](https://github.com/jsdoc3/jsdoc)
* Well tested through [nodeunit](https://github.com/caolan/nodeunit)
* Zero production dependencies (Long.js is optional)
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

### Browser ###

Optionally depends on [Long.js](https://github.com/dcodeIO/Long.js) for long (int64) support. If you do not require long
support, you can skip the Long.js include.

```html
<script src="//raw.github.com/dcodeIO/Long.js/master/Long.min.js"></script>
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

Optionally depends on [Long.js](https://github.com/dcodeIO/Long.js) for long (int64) support. If you do not require long
support, you can skip the Long.js config. [Require.js](http://requirejs.org/) example:

```javascript
require.config({
    "paths": {
        "Long": "/path/to/Long.js"
        "ByteBuffer": "/path/to/ByteBuffer.js"
    }
});
require(["ByteBuffer"], function(ByteBuffer) {
    var bb = new ByteBuffer();
    bb.writeLString("Hello world!");
    bb.flip();
    alert(bb.readLString()+" from ByteBuffer.js");
});
```

On long (int64) support
-----------------------
As of the [ECMAScript specification](http://ecma262-5.com/ELS5_HTML.htm#Section_8.5), number types have a maximum value
of 2^53. Beyond that, behaviour might be unexpected. However, real long support requires the full 64 bits
with the possibility to perform bitwise operations on the value for varint en-/decoding. So, to enable true long support
in ByteBuffer.js, it optionally depends on [Long.js](https://github.com/dcodeIO/Long.js), which actually utilizes two
32 bit numbers internally. If you do not require long support at all, you can skip it and save the additional bandwidth.
On node, long support is available by default through the [long](https://npmjs.org/package/long) dependency.

Downloads
---------
* [ZIP-Archive](https://github.com/dcodeIO/ByteBuffer.js/archive/master.zip)
* [Tarball](https://github.com/dcodeIO/ByteBuffer.js/tarball/master)

Documentation
-------------
* [View documentation](http://htmlpreview.github.com/?http://github.com/dcodeIO/ByteBuffer.js/master/docs/ByteBuffer.html)

Tests (& Examples) [![Build Status](https://travis-ci.org/dcodeIO/ByteBuffer.js.png?branch=master)](https://travis-ci.org/dcodeIO/ByteBuffer.js)
------------------
* [View source](https://github.com/dcodeIO/ByteBuffer.js/blob/master/tests/suite.js)
* [View report](https://travis-ci.org/dcodeIO/ByteBuffer.js)

Prerequisites to run it against IE<10, FF<15, Chrome<9 etc.
-----------------------------------------------------------
* Working ArrayBuffer & DataView implementations (i.e. use a [polyfill](https://github.com/inexorabletash/polyfill#typed-arrays-polyfill))

Usage with Closure Compiler's advanced optimizations
----------------------------------------------------
You basically have the following three options:

#### ByteBuffer.js as external dependency ####
If you compile your code but want to use ByteBuffer.js as an external dependency that's not actually compiled "into"
your project, add the provided [externs file](https://github.com/dcodeIO/ByteBuffer.js/blob/master/externs/ByteBuffer.js)
to your compilation step (which usually excludes compilation of ByteBuffer.js).
  
#### ByteBuffer.js compiled into your project and exposed ####
Use [ByteBuffer.js](https://github.com/dcodeIO/ByteBuffer.js/blob/master/ByteBuffer.js) if you want the ByteBuffer class
to be exposed to the outside world (of JavaScript) so it can be called by external scripts. This also removes the
requirement of using externs but the compiler will also keep possibly unused code.

#### ByteBuffer.js fully compiled into your project ####
Use [ByteBuffer.noexpose.js](https://github.com/dcodeIO/ByteBuffer.js/blob/master/ByteBuffer.noexpose.js) if you want
the ByteBuffer class to be fully integrated into your (single file) project. Of course no external scripts will be able
to call it or its method (trivially) because quite everything will become renamed, some parts inlined and moved around.
This will also allow the compiler to actually remove unused code.

Contributors
------------
[Dretch](https://github.com/Dretch) (IE8 comp.)

License
-------
Apache License, Version 2.0 - http://www.apache.org/licenses/LICENSE-2.0.html