var ByteBuffer = require("../ByteBuffer.js");

console.log("dcodeIO.ByteBuffer Examples & Tests");
console.log("===================================\n");

console.log("Creating ByteBuffer with capacity=10");
var b = new ByteBuffer(10);
b.writeUint32(0x1FFF2FFF);
b.printDebug();

console.log("Ensuring a capacity=12 (should result in 20)");
b.ensureCapacity(12);
b.printDebug();

console.log("Flipping");
b.flip();
b.printDebug();

console.log("Compacting");
var b2 = ByteBuffer.wrap(b.compact());
b2.printDebug();

console.log("Compacting with implicit flip");
b2.offset = 4;
b2.length = 0;
b2 = ByteBuffer.wrap(b2.compact());
b2.printDebug();

console.log("Compacting with offset=1, length=3");
b2.offset = 1;
b2.length = 3;
b2 = ByteBuffer.wrap(b2.compact());
b2.printDebug();

console.log("Resizing to capacity=4");
b2.resize(4);
b2.printDebug();

console.log("Destroying");
b2.destroy();
b2.printDebug();

console.log("Reinitializing with a string");
b2.writeUTF8String("Hello world!");
b2.printDebug();

console.log("Reading back string after flip");
b2.flip();
var s = b2.readUTF8String();
b2.printDebug();
console.log("Result: "+s);