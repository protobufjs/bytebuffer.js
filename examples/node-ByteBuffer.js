var ByteBuffer = require("../ByteBuffer.js");

console.log("dcodeIO.ByteBuffer Examples & Tests");
console.log("===================================\n");

console.log("Creating ByteBuffer with capacity=10");
var bb = new ByteBuffer(10);
bb.writeUint32(0x1FFF2FFF);
bb.printDebug();

console.log("Ensuring a capacity=12 (should result in 20)");
bb.ensureCapacity(12);
bb.printDebug();

console.log("Flipping");
bb.flip();
bb.printDebug();

console.log("Compacting");
bb.compact();
bb.printDebug();

console.log("Compacting with implicit flip at offset=3 and length=0");
bb.offset = 3;
bb.length = 0;
bb.compact();
bb.printDebug();

console.log("Compacting with offset=1, length=2");
bb.offset = 1;
bb.length = 2;
bb.compact();
bb.printDebug();

console.log("Resizing explicitly to capacity=4");
bb.resize(4);
bb.printDebug();

console.log("Destroying");
bb.destroy();
bb.printDebug();

console.log("Reinitializing with a length-prepended string");
bb.writeLString("Hello world!");
bb.printDebug();

console.log("Reading back length-prepended string after flip");
bb.flip();
var s = bb.readLString();
bb.printDebug();
console.log("Result: <"+s+">\n");

console.log("Resetting");
bb.reset();
bb.printDebug();

console.log("Writing NULL-terminated string");
bb.writeCString("World hello!");
bb.printDebug();

console.log("Reading back NULL-terminated string after flip");
bb.flip();
s = bb.readCString();
bb.printDebug();
console.log("Result: <"+s+">\n");

console.log("Slicing to 3,4");
bb = bb.slice(3,4);
bb.printDebug();

console.log("Copying");
var bb2 = bb.copy();
bb.printDebug();
bb2.printDebug();
console.log("Same backing buffer: "+(bb.array == bb2.array)+"\n");

console.log("Converting to ArrayBuffer and wrapping back");
bb = ByteBuffer.wrap(bb.toArrayBuffer());
bb.printDebug();

console.log("Writing some string contents");
bb.writeUTF8String("Hello world!");
bb.printDebug();

console.log("Slicing and compacting with implicit flip to 3,6");
bb2 = bb.sliceAndCompact(3,6);
bb2.printDebug();
console.log("Previous one must be unmodified:");
bb.printDebug();