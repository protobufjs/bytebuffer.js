![ByteBuffer.js - The swiss army knife for binary data in JavaScript.](https://raw.github.com/dcodeIO/ByteBuffer.js/master/ByteBuffer.png)
======================================
A fast and complete ByteBuffer implementation using either ArrayBuffers in the browser or node Buffers under node.js,
generated from a single source tree through [MetaScript](https://github.com/dcodeIO/MetaScript).

[![Build Status](https://travis-ci.org/dcodeIO/ByteBuffer.js.svg?branch=master)](https://travis-ci.org/dcodeIO/ByteBuffer.js)
[![Donate](https://raw.githubusercontent.com/dcodeIO/Long.js/master/donate.png)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=info%40code-emitter.com&item_name=Open%20Source%3A%20ByteBuffer.js)

Features
--------
* Two API compatible versions, using either node Buffers under node.js or ArrayBuffers in the browser
* 8, 16, 32 and 64 bit signed and unsigned integers
* 32 and 64 bit floats
* Varints as used in protobuf (32 and 64 bit, zig-zag)
* [Base64](https://github.com/dcodeIO/lxiv), [utf8](https://github.com/dcodeIO/utfx), binary, hex and debug encodings
* Handy string and debugging utilities
* Big and little endianness
* Relative and absolute zero-copy operations wherever possible
* Transparent resizing when using unknown-length data
* Chaining of all operations that do not return a specific value
* Slicing, appending, prepending, reversing, flip, mark, reset, etc.

Usage
-----
The library is compatible with CommonJS and AMD loaders and is exposed globally as `dcodeIO.ByteBuffer` if neither is
available.

```javascript
var ByteBuffer = require("bytebuffer");

var bb = new ByteBuffer()
            .writeIString("Hello world!")
            .flip();
console.log(bb.readIString()+" from ByteBuffer.js");
```

In the browser, 64 bit integer support is optional and present only if [Long.js](https://github.com/dcodeIO/Long.js) has
been loaded prior to ByteBuffer.js.

API
---
* [View the API documentation](https://github.com/dcodeIO/ByteBuffer.js/wiki/API)
* [Check the wiki](https://github.com/dcodeIO/ByteBuffer.js/wiki)

Downloads
---------
* [Distributions](https://github.com/dcodeIO/ByteBuffer.js/tree/master/dist)
* [ZIP-Archive](https://github.com/dcodeIO/ByteBuffer.js/archive/master.zip)
* [Tarball](https://github.com/dcodeIO/ByteBuffer.js/tarball/master)

Support for IE<10, FF<15, Chrome<9 etc.
---------------------------------------
* Requires working ArrayBuffer & DataView implementations (i.e. use a [polyfill](https://github.com/inexorabletash/polyfill#typed-arrays-polyfill))

Contributors
------------
[Dretch](https://github.com/Dretch) (IE8 compatibility)

License
-------
Apache License, Version 2.0 - http://www.apache.org/licenses/LICENSE-2.0.html
