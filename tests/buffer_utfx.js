// This file compares encoding speed of an intermediate node Buffer with using utfx directly.
// Turns out that utfx is about 2.4 times faster when writing while buffers are about 2.4 times faster when reading.
// EDIT: This seems to be true for small strings (<=11 bytes) only.

var utfx = require("utfx");

var sample = "hello world";

(function() {
    console.time("Buffer write");
    for (var i=0; i<100000; ++i)
        new Buffer(sample, "utf8");
    console.timeEnd("Buffer write");
    var buf = new Buffer(sample, "utf8");
    console.time("Buffer read");
    for (i=0; i<100000; ++i)
        buf.toString("utf8");
    console.timeEnd("Buffer read");
})();

(function() {
    console.time("utfx write");
    for (var i=0; i<100000; ++i)
        utfx.encodeUTF16toUTF8(utfx.stringSource(sample), function(b) {});
    console.timeEnd("utfx write");
    var arr = new Buffer(sample, "utf8");
    console.time("utfx read");
    for (i=0; i<100000; ++i) {
        var j=0;
        utfx.decodeUTF8toUTF16(function() {
            return j < arr.length ? arr[j++] : null;
        }, function(c) {});
    }
    console.timeEnd("utfx read");
})();
