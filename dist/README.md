Distributions
=============
* **ByteBufferAB** uses an ArrayBuffer as its backing buffer and is compatible with modern browsers.
* **ByteBufferNB** uses a node Buffer as its backing buffer and is compatible with node.js only, where it performs a lot
  better than *ByteBufferAB*.

While both versions are fully API-compatible, some internals like what `ByteBuffer#buffer` references and how it is
allocated differ. There is, however, no abstraction layer in between, as pretty much everything has been optimized to
work with the exact API it is based upon, providing a developer with a reliable API to write efficient code only once
targeting both node.js and the browser.
