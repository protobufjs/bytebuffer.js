![ByteBuffer.js - A full-featured and highly optimized ByteBuffer in JavaScript](https://raw.github.com/dcodeIO/ByteBuffer.js/master/ByteBuffer.png)
======================================
ByteBuffer.js provides a full-featured and highly optimized ByteBuffer implementation in JavaScript, since version 3
either backed by an ArrayBuffer for browser environments (ByteBufferAB) or, alternatively, a node Buffer (ByteBufferNB)
to make use of the performance benefits when running under node.js. Both versions are API-compatible and generated from
a single source tree using [MetaScript](https://github.com/dcodeIO/MetaScript).

If you are looking for ByteBuffer.js 2, [that's the branch](https://github.com/dcodeIO/ByteBuffer.js/tree/ByteBuffer2).

**Please note**: Though all old and new test cases are passing, ByteBuffer.js 3 still needs to be tested in real world
scenarios. Also, the API has changed a bit to make things more straight forward.

What can it do?
---------------
* Mimics Java ByteBuffers as close as reasonable while using typed array terms
* 8, 16, 32 and 64 bit signed and unsigned integers
* 32 and 64 bit floats
* Big and little endianness
* Variable length integers as used in protobuf (32 and 64 bit, including zig zag encoding)
* Base64, binary, debug, hex and utf8 encodings
* Handy string and debugging utilities
* Relative and absolute zero-copy operations wherever possible
* Manual and automatic resizing (efficiently doubles capacity)
* Chaining of all operations that do not return a specific value
* Slicing, appending, prepending, reversing, flip, mark, reset, etc.

More
----
* CommonJS, AMD and shim compatible
* Also available via [npm](https://npmjs.org/package/bytebuffer)
* Compiled through [Closure Compiler](https://developers.google.com/closure/compiler/) using ADVANCED_OPTIMIZATIONS 
 (fully annotated, includes externs and source map)
* Fully documented using [jsdoc3](https://github.com/jsdoc3/jsdoc)
* Well tested through [test.js](https://github.com/dcodeIO/test.js)
* Zero production dependencies (Long.js is optional)

Usage
-----
### Node.js ###
* Install: `npm install bytebuffer`

```javascript
var ByteBuffer = require("bytebuffer");
var bb = new ByteBuffer();
bb.writeIString("Hello world!").flip();
console.log(bb.readIString()+" from ByteBuffer.js");
```

### Browser ###

Optionally depends on [Long.js](https://github.com/dcodeIO/Long.js) for long (int64) support. If you do not require long
support, you can skip the Long.js include.

```html
<script src="Long.min.js"></script>
<script src="ByteBuffer.min.js"></script>
```

```javascript
var ByteBuffer = dcodeIO.ByteBuffer;
var bb = new ByteBuffer();
bb.writeIString("Hello world!").flip();
alert(bb.readIString()+" from ByteBuffer.js");
```

### AMD ###

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
    bb.writeLString("Hello world!").flip();
    alert(bb.readLString()+" from ByteBuffer.js");
});
```

Downloads
---------
* [ZIP-Archive](https://github.com/dcodeIO/ByteBuffer.js/archive/master.zip)
* [Tarball](https://github.com/dcodeIO/ByteBuffer.js/tarball/master)

Documentation
-------------
* [View the API documentation](http://htmlpreview.github.com/?http://github.com/dcodeIO/ByteBuffer.js/master/docs/ByteBuffer.html)

Tests (& Examples) [![Build Status](https://travis-ci.org/dcodeIO/ByteBuffer.js.png?branch=master)](https://travis-ci.org/dcodeIO/ByteBuffer.js)
------------------
* [View source](https://github.com/dcodeIO/ByteBuffer.js/blob/master/tests/suite.js)
* [View report](https://travis-ci.org/dcodeIO/ByteBuffer.js)

Support for IE<10, FF<15, Chrome<9 etc.
---------------------------------------
* Requires working ArrayBuffer & DataView implementations (i.e. use a [polyfill](https://github.com/inexorabletash/polyfill#typed-arrays-polyfill))

Contributors
------------
[Dretch](https://github.com/Dretch) (IE8 compatibility)

License
-------
Apache License, Version 2.0 - http://www.apache.org/licenses/LICENSE-2.0.html
