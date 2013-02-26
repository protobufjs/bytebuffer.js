/*
 Copyright 2013 Daniel Wirtz <dcode@dcode.io>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * @license ByteBuffer.js (c) 2013 Daniel Wirtz <dcode@dcode.io>
 * Released under the Apache License, Version 2.0
 * see: https://github.com/dcodeIO/ByteBuffer.js for details
 */

"use strict";

/**
 * Constructs a new ByteBuffer.
 * @exports dcodeIO.ByteBuffer
 * @class Provides a Java-like ByteBuffer implementation using typed arrays. It also tries to abstract the complexity
 * away by providing convenience methods for those who just want to write stuff without caring about signed, unsigned
 * and the actual bit sizes.
 * @param {number=} capacity Initial capacity. Defaults to {@link dcodeIO.ByteBuffer.DEFAULT_CAPACITY}.
 * @param {boolean=} littleEndian true to use little endian multi byte values, false for big endian. Defaults to false.
 * @constructor
 */
var ByteBuffer = function(capacity, littleEndian) {
    
    /**
     * Buffer capacity.
     * @type {number}
     */
    capacity = typeof capacity != 'undefined' ? parseInt(capacity, 10) : ByteBuffer.DEFAULT_CAPACITY;
    if (capacity < 1) capacity = ByteBuffer.DEFAULT_CAPACITY;

    /**
     * Underlying ArrayBuffer.
     * @type {ArrayBuffer}
     */
    this.array = arguments.length == 3 && arguments[2] === true ? null : new ArrayBuffer(capacity);
    
    /**
     * DataView to mess with the ArrayBuffer.
     * @type {DataView}
     */
    this.view = this.array != null ? new DataView(this.array) : null;
    
    /**
     * Current read/write offset.
     * @type {number}
     */
    this.offset = 0;

    /**
     * Number of bytes contained in our ArrayBuffer.
     * @type {number}
     */
    this.length = 0;

    /**
     * Whether to use little endian multi byte values.
     * @type {boolean}
     */
    this.littleEndian = typeof littleEndian != 'undefined' ? !!littleEndian : false;
};

/**
 * Default buffer capacity of 32 if nothing else is stated. The ByteBuffer will be automatically resized by a factor
 * of 2 if required.
 * @type {number}
 */
ByteBuffer.DEFAULT_CAPACITY = 32;

/**
 * Allocates a new ByteBuffer.
 * @param {number=} length Initial length. Defaults to {@link ByteBuffer.DEFAULT_CAPACITY}.
 * @param {boolean=} littleEndian true to use little endian multi byte values, false for big endian. Defaults to true.
 * @return {dcodeIO.ByteBuffer}
 */
ByteBuffer.allocate = function(length, littleEndian) {
    return new ByteBuffer(length, littleEndian);
};

/**
 * Wraps an ArrayBuffer. Sets the ByteBuffer's offset to 0 and its length to the specified ArrayBuffer's byte length.
 * @param {ArrayBuffer} buffer ArrayBuffer to wrap
 * @param {boolean=} littleEndian true to use little endian multi byte values, false for big endian. Defaults to true.
 * @return {dcodeIO.ByteBuffer}
 */
ByteBuffer.wrap = function(buffer, littleEndian) {
    var b = new ByteBuffer(0, littleEndian, /* shadow copy */ true);
    b.array = buffer;
    b.view = new DataView(b.array);
    b.offset = 0;
    b.length = buffer.byteLength;
    return b;
};

/**
 * Resizes the ByteBuffer to the given capacity.
 * @param {number} capacity New capacity
 * @return {boolean} true if actually resized, false if already that large or larger
 */
ByteBuffer.prototype.resize = function(capacity) {
    if (this.array == null && capacity > 0) { // Silently recreate
        this.array = new ArrayBuffer(capacity);
        this.view = new DataView(this.array);
    }
    if (this.array.byteLength < capacity) {
        var src = this.array;
        var srcView = new Uint8Array(src);
        var dst = new ArrayBuffer(capacity);
        var dstView = new Uint8Array(dst);
        dstView.set(srcView);
        this.array = dst;
        this.view = new DataView(dst);
        return true;
    }
    return false;
};

/**
 * Makes sure that the specified capacity is available. If the current capacity is exceeded, it will be doubled. If
 * double the previous capacity is less than the required capacity, the required capacity will be used.
 * @param {number} capacity Required capacity
 */
ByteBuffer.prototype.ensureCapacity = function(capacity) {
    if (this.array == null) {
        return this.resize(capacity);
    }
    if (this.array.byteLength < capacity) this.resize(this.array.byteLength*2 >= capacity ? this.array.byteLength*2 : capacity);
};

/**
 * Flips the ByteBuffer. Sets length=offset and offset=0.
 * @return {dcodeIO.ByteBuffer} this
 */
ByteBuffer.prototype.flip = function() {
    if (this.array == null) {
        throw(this+" cannot be flipped: Already destroyed");
    }
    this.length = this.offset;
    this.offset = 0;
    return this;
};

/**
 * Resets the ByteBuffer. Sets offset=0 and length=0.
 * @return {dcodeIO.ByteBuffer} this
 */
ByteBuffer.prototype.reset = function() {
    this.offset = 0;
    this.length = 0;
    return this;
};

/**
 * Clones this ByteBuffer. The returned cloned ByteBuffer shares the same ArrayBuffer but will have its own offsets.
 * @return {dcodeIO.ByteBuffer}
 */
ByteBuffer.prototype.clone = function() {
    // When cloning, an undocumented third parameter is used to set array and view manually.
    var b = new ByteBuffer(-1, this.littleEndian, /* shadow copy */ true);
    b.array = this.array;
    b.view = this.view;
    b.offset = this.offset;
    b.length = this.length;
    return b;
};

/**
 * Compacts the ByteBuffer into an ArrayBuffer of its actual length. Use this method to send the ByteBuffer's contents
 * over the network, e.g. using a WebSocket. Will {@link ByteBuffer#clone} this and {@link ByteBuffer#flip} the cloned
 * ByteBuffer if this ByteBuffer's offset is larger than its length. If this ByteBuffer's offset is less than its
 * length, only the portion between its offset and length will be contained in the returned ArrayBuffer.
 * @return {ArrayBuffer}
 */
ByteBuffer.prototype.compact = function() {
    if (this.array == null) {
        throw(this+" cannot be compacted: Already destroyed");
    }
    var b;
    if (this.offset > this.length) {
        b = this.clone().flip();
    } else {
        b = this;
    }
    var src = b.array;
    var srcView = new Uint8Array(src);
    var dst = new ArrayBuffer(b.length-b.offset);
    var dstView = new Uint8Array(dst);
    dstView.set(srcView.subarray(b.offset, b.length));
    return dst;
};

/**
 * Destroys the ByteBuffer, releasing all references to the backing array.
 */
ByteBuffer.prototype.destroy = function() {
    if (this.array == null) return; // Already destroyed
    this.array = null;
    this.view = null;
    this.offset = 0;
    this.length = 0;
}

/**
 * Writes an 8bit singed integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {dcodeIO.ByteBuffer} this
 */
ByteBuffer.prototype.writeInt8 = function(value, offset) {
    offset = typeof offset != 'undefined' ? offset : (this.offset+=1)-1;
    this.ensureCapacity(offset+1);
    this.view.setInt8(offset, value, this.littleEndian);
    return this;
};

/**
 * Reads an 8bit singed integer.
 * @param {number=} offset Offset to read from. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {number}
 */
ByteBuffer.prototype.readInt8 = function(offset) {
    offset = typeof offset != 'undefined' ? offset : (this.offset+=1)-1;
    return this.view.getUint8(offset, this.littleEndian);
};

/**
 * Writes a byte. This is an alias of {dcodeIO.ByteBuffer#writeInt8}.
 * @function
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {dcodeIO.ByteBuffer} this
 */
ByteBuffer.prototype.writeByte = ByteBuffer.prototype.writeInt8;

/**
 * Reads a byte. This is an alias of {@link dcodeIO.ByteBuffer#readInt8}.
 * @function
 * @param {number=} offset Offset to read from. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {number}
 */
ByteBuffer.prototype.readByte = ByteBuffer.prototype.readInt8;

/**
 * Writes an 8bit unsinged integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {dcodeIO.ByteBuffer} this
 */
ByteBuffer.prototype.writeUint8 = function(value, offset) {
    offset = typeof offset != 'undefined' ? offset : (this.offset+=1)-1;
    this.ensureCapacity(offset+1);
    this.view.setUint8(offset, value, this.littleEndian);
    return this;
};

/**
 * Reads an 8bit unsinged integer.
 * @param {number=} offset Offset to read from. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {number}
 */
ByteBuffer.prototype.readUint8 = function(offset) {
    offset = typeof offset != 'undefined' ? offset : (this.offset+=1)-1;
    return this.view.getUint8(offset, this.littleEndian);
};

/**
 * Writes a 16bit signed integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {dcodeIO.ByteBuffer} this
 */
ByteBuffer.prototype.writeInt16 = function(value, offset) {
    offset = typeof offset != 'undefined' ? offset : (this.offset+=2)-2;
    this.ensureCapacity(offset+2);
    this.view.setInt16(offset, value, this.littleEndian);
    return this;
};

/**
 * Reads a 16bit signed integer.
 * @param {number=} offset Offset to read from. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {number}
 */
ByteBuffer.prototype.readInt16 = function(offset) {
    offset = typeof offset != 'undefined' ? offset : (this.offset+=2)-2;
    return this.view.getInt16(offset, this.littleEndian);
};

/**
 * Writes a short value. This is an alias of {@link dcodeIO.ByteBuffer#writeInt16}.
 * @function
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {dcodeIO.ByteBuffer} this
 */
ByteBuffer.prototype.writeShort = ByteBuffer.prototype.writeInt16;

/**
 * Reads a short value. This is an alias of {@link dcodeIO.ByteBuffer#readInt16}.
 * @function
 * @param {number=} offset Offset to read from. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {number}
 */
ByteBuffer.prototype.readShort = ByteBuffer.prototype.readInt16;

/**
 * Writes a 16bit unsigned integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {dcodeIO.ByteBuffer} this
 */
ByteBuffer.prototype.writeUint16 = function(value, offset) {
    offset = typeof offset != 'undefined' ? offset : (this.offset+=2)-2;
    this.ensureCapacity(offset+2);
    this.view.setUint16(offset, value, this.littleEndian);
    return this;
};

/**
 * Reads a 16bit unsigned integer.
 * @param {number=} offset Offset to read from. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {number}
 */
ByteBuffer.prototype.readUint16 = function(offset) {
    offset = typeof offset != 'undefined' ? offset : (this.offset+=2)-2;
    return this.view.getUint16(offset, this.littleEndian);
};

/**
 * Writes a 32bit signed integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {dcodeIO.ByteBuffer} this
 */
ByteBuffer.prototype.writeInt32 = function(value, offset) {
    offset = typeof offset != 'undefined' ? offset : (this.offset+=4)-4;
    this.ensureCapacity(offset+4);
    this.view.setInt32(offset, value, this.littleEndian);
    return this;
};

/**
 * Reads a 32bit signed integer.
 * @param {number=} offset Offset to read from. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {number}
 */
ByteBuffer.prototype.readInt32 = function(offset) {
    offset = typeof offset != 'undefined' ? offset : (this.offset+=4)-4;
    return this.view.getInt32(offset, this.littleEndian);
};

/**
 * Writes an integer. This is an alias of {@link ByteBuffer#writeInt32}.
 * @function
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {dcodeIO.ByteBuffer} this
 */
ByteBuffer.prototype.writeInt = ByteBuffer.prototype.writeInt32;

/**
 * Reads an integer. This is an alias of {@link ByteBuffer#readInt32}.
 * @function
 * @param {number=} offset Offset to read from. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {number}
 */
ByteBuffer.prototype.readInt = ByteBuffer.prototype.readInt32;

/**
 * Writes a 32bit unsigned integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {dcodeIO.ByteBuffer} this
 */
ByteBuffer.prototype.writeUint32 = function(value, offset) {
    offset = typeof offset != 'undefined' ? offset : (this.offset+=4)-4;
    this.ensureCapacity(offset+4);
    this.view.setUint32(offset, value, this.littleEndian);
    return this;
};

/**
 * Reads a 32bit unsigned integer.
 * @param {number=} offset Offset to read from. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {number}
 */
ByteBuffer.prototype.readUint32 = function(offset) {
    offset = typeof offset != 'undefined' ? offset : (this.offset+=4)-4;
    return this.view.getUint32(offset, this.littleEndian);
};

/**
 * Writes a 32bit float.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {dcodeIO.ByteBuffer} this
 */
ByteBuffer.prototype.writeFloat32 = function(value, offset) {
    offset = typeof offset != 'undefined' ? offset : (this.offset+=4)-4;
    this.ensureCapacity(offset+4);
    this.view.setFloat32(offset, value, this.littleEndian);
    return this;
};

/**
 * Reads a 32bit float.
 * @param {number=} offset Offset to read from. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {number}
 */
ByteBuffer.prototype.readFloat32 = function(offset) {
    offset = typeof offset != 'undefined' ? offset : (this.offset+=4)-4;
    return this.view.getFloat32(offset, this.littleEndian);
};

/**
 * Writes a float. This is an alias of {@link dcodeIO.ByteBuffer#writeFloat32}.
 * @function
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {dcodeIO.ByteBuffer} this
 */
ByteBuffer.prototype.writeFloat = ByteBuffer.prototype.writeFloat32;

/**
 * Reads a float. This is an alias of {@link dcodeIO.ByteBuffer#readFloat32}.
 * @function
 * @param {number=} offset Offset to read from. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {number}
 */
ByteBuffer.prototype.readFloat = ByteBuffer.prototype.readFloat32;

/**
 * Writes a 64bit float.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {dcodeIO.ByteBuffer} this
 */
ByteBuffer.prototype.writeFloat64 = function(value, offset) {
    offset = typeof offset != 'undefined' ? offset : (this.offset+=8)-8;
    this.ensureCapacity(offset+8);
    this.view.setFloat32(offset, value, this.littleEndian);
    return this;
};

/**
 * Reads a 64bit float.
 * @param {number=} offset Offset to read from. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {number}
 */
ByteBuffer.prototype.readFloat64 = function(offset) {
    offset = typeof offset != 'undefined' ? offset : (this.offset+=8)-8;
    return this.view.getFloat32(offset, this.littleEndian);
};

/**
 * Writes a double. This is an alias of {@link dcodeIO.ByteBuffer#writeFloat64}.
 * @function
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {dcodeIO.ByteBuffer} this
 */
ByteBuffer.prototype.writeDouble = ByteBuffer.prototype.writeFloat64;

/**
 * Reads a double. This is an alias of {@link ByteBuffer#readFloat64}.
 * @function
 * @param {number=} offset Offset to read from. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {number}
 */
ByteBuffer.prototype.readDouble = ByteBuffer.prototype.readFloat64;

/**
 * Writes an UTF8 string.
 * @param {string} s String to write
 * @param {number=} offset Offset to write to. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {dcodeIO.ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
 */
ByteBuffer.prototype.writeUTF8String = function(s, offset) {
    var advance = typeof offset == 'undefined';
    offset = typeof offset != 'undefined' ? offset : this.offset;
    this.ensureCapacity(offset+4+s.length*6); // 6 bytes per character in the worst case
    this.writeUint32(s.length, offset); // Prepend the number of characters
    var length = ByteBuffer.encodeUTF8(s, this, offset+4);
    if (advance) {
        this.offset += 4+length;
        return this;
    } else {
        return 4+length;
    }
};

/**
 * Reads an UTF8 string.
 * @param {number=} offset Offset to read from. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {string|{string: string, length: number}} The string read if offset is omitted, else the string read and the actual number of bytes read.
 */
ByteBuffer.prototype.readUTF8String = function(offset) {
    var advance = typeof offset == 'undefined';
    offset = typeof offset != 'undefined' ? offset : this.offset;
    var chars = this.readUint32(offset); // Prepended number of characters
    var result = ByteBuffer.decodeUTF8(this, offset+4, chars);
    if (advance) {
        this.offset += 4+result["length"];
        return result["string"];
    } else {
        return result;
    }
};

/**
 * Writes a string. This is an alias for {@link dcodeIO.ByteBuffer#writeUTF8String}.
 * @function
 * @param {string} s String to write
 * @param {number=} offset Offset to write to. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {number} Actual number of bytes written
 */
ByteBuffer.prototype.writeString = ByteBuffer.prototype.writeUTF8String;

/**
 * Reads a string. This is an alias for {@link dcodeIO.ByteBuffer#readUTF8String}.
 * @function
 * @param {number=} offset Offset to read from. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {string}
 */
ByteBuffer.prototype.readString = ByteBuffer.prototype.readUTF8String;

/**
 * Serializes and writes a JSON payload.
 * @param {*} data Data payload to serialize
 * @param {number=} offset Offset to write to. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted,
 * @param {function=} stringify Stringify implementation to use. Defaults to {@link JSON.stringify}.
 * @return {dcodeIO.ByteBuffer|number} this if offset is omitted, else the actual number if bytes written,
 */
ByteBuffer.prototype.writeJSON = function(data, offset, stringify) {
    stringify = stringify || JSON.stringify.bind(JSON);
    return this.writeUTF8String(stringify(data), offset);
};

/**
 * Reads a JSON payload and unserializes it.
 * @param {number=} offset Offset to read from. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @param {function=} parse Parse implementation to use. Defaults to {@link JSON.parse}.
 * @return {*|{data: *, length: number}} Data payload if offset is omitted, else the data payload and the actual number of bytes read.
 */
ByteBuffer.prototype.readJSON = function(offset, parse) {
    parse = parse || JSON.parse.bind(JSON);
    var result = this.readUTF8String(offset);
    if (typeof result == "string") {
        return parse(result);
    } else {
        return {
            "data": parse(result["string"]),
            "length":  result["length"]
        };
    }
};

ByteBuffer.LINE = "--------------------------------------------------";

/**
 * Prints debug information about this ByteBuffer's contents to console.
 */
ByteBuffer.prototype.printDebug = function() {
    console.log(this.toString()+"\n"+ByteBuffer.LINE);
    if (this.array != null) {
        var view = new Uint8Array(this.array);
        var out = "";
        for (var i=0; i<this.array.byteLength; i++) {
            var val = view[i];
            val = val.toString(16).toUpperCase();
            if (val.length < 2) val = "0"+val;
            if (i>0 && i%16 == 0) {
                out += "\n";
            }
            if (i == this.offset && i == this.length) {
                out += "|";
            } else if (i == this.offset) {
                out += "<";
            } else if (i == this.length) {
                out += ">";
            } else {
                out += " ";
            }
            out += val;
        }
        if (this.length == this.array.byteLength) {
            out += ">";
        } else if (this.offset == this.array.byteLength) {
            out += "<";
        }
        console.log(out+"\n");
    }
};

/**
 * Returns a string representation of this object.
 * @return {string} String representation as of "ByteBuffer(offset,length,capacity)"
 */
ByteBuffer.prototype.toString = function() {
    if (this.array == null) {
        return "ByteBuffer(DESTROYED)";
    }
    return "ByteBuffer(offset="+this.offset+",length="+this.length+",capacity="+this.array.byteLength+")";
};

/**
 * Decodes the given ByteBuffer to an UTF8 string. The ByteBuffer's offsets are not modified.
 * @param {dcodeIO.ByteBuffer} src Source ByteBuffer to decode from
 * @param {number=} offset Offset to start at. Defaults to src#offset.
 * @param {number=} chars Number of characters to decode. Defaults to decode all the remaining bytes in src to characters.
 * @return {{string: string, length: number}} Encoded string and the actual number of bytes read
 */
ByteBuffer.decodeUTF8 = function(src, offset, chars) {
    offset = typeof offset != 'undefined' ? offset : src.offset;
    chars = typeof chars != 'undefined' ? chars : -1;
    var result = "";
    var a, b, c, e, d, f, n= 0, start=offset;
    // ref: http://en.wikipedia.org/wiki/UTF-8#Description
    while (offset < src.length && (chars==-1 || n<chars)) {
        a = src.readUint8(offset);
        if ((a&0x80)==0) {
            result += String.fromCharCode(a);
            offset += 1; n++;
        } else if ((a&0xE0)==0xC0) {
            b = src.readUint8(offset+1);
            result += String.fromCharCode(((a&0x1F)<<6) | (b&0x3F));
            offset += 2; n++;
        } else if ((a&0xF0)==0xE0) {
            b = src.readUint8(offset+1);
            c = src.readUint8(offset+2);
            result += String.fromCharCode(((a&0x0F)<<12) | ((b&0x3F)<<6) | (c&0x3F));
            offset += 3; n++;
        } else if ((a&0xF8)==0xF0) {
            b = src.readUint8(offset+1);
            c = src.readUint8(offset+2);
            d = src.readUint8(offset+3);
            result += String.fromCharCode(((a&0x07)<<18) | ((b&0x3F)<<12) | ((c&0x3F)<<6) | (d&0x3F));
            offset += 4; n++;
        } else if ((a&0xFC)==0xF8) {
            b = src.readUint8(offset+1);
            c = src.readUint8(offset+2);
            d = src.readUint8(offset+3);
            e = src.readUint8(offset+4);
            result += String.fromCharCode(((a&0x03)<<24) | ((b&0x3F)<<18) | ((c&0x3F)<<12) | ((d&0x3F)<<6) | (e&0x3F));
            offset += 5; n++;
        } else if ((a&0xFE)==0xFC) {
            b = src.readUint8(offset+1);
            c = src.readUint8(offset+2);
            d = src.readUint8(offset+3);
            e = src.readUint8(offset+4);
            f = src.readUint8(offset+5);
            result += String.fromCharCode(((a&0x01)<<30) | ((b&0x3F)<<24) | ((c&0x3F)<<18) | ((d&0x3F)<<12) | ((e&0x3F)<<6) | (f&0x3F));
            offset += 6; n++;
        } else {
            throw("Invalid byte at offset "+offset+": 0x"+a.toString(16));
        }
    }
    return {
        "string": result,
        "length": offset-start
    };
};

/**
 * Encodes the given UTF8 string to the given ByteBuffer. The ByteBuffer's offsets are not modified. 
 * @param {string} s String to encode
 * @param {dcodeIO.ByteBuffer} dst Destination ByteBuffer to encode to
 * @param {number=} offset Offset to start at. Defaults to dst#offset.
 * @return {number} Number of bytes encoded
 */
ByteBuffer.encodeUTF8 = function(s, dst, offset) {
    offset = typeof offset != 'undefined' ? offset : dst.offset;
    var start = offset;
    // ref: http://en.wikipedia.org/wiki/UTF-8#Description
    for (var i=0; i<s.length; i++) {
        var a = s.charCodeAt(i);
        if (a < 0x80) {
            dst.writeUint8(a&0x7F, offset);
            offset += 1;
        } else if (a < 0x800) {
            dst.writeUint8(((a>>6)&0x1F)|0xC0, offset)
               .writeUint8((a&0x3F)|0x80, offset+1);
            offset += 2;
        } else if (a < 0x10000) {
            dst.writeUint8(((a>>12)&0x0F)|0xE0, offset)
               .writeUint8(((a>>6)&0x3F)|0x80, offset+1)
               .writeUint8((a&0x3F)|0x80, offset+2);
            offset += 3;
        } else if (a < 0x200000) {
            dst.writeUint8(((a>>18)&0x07)|0xF0, offset)
               .writeUint8(((a>>12)&0x3F)|0x80, offset+1)
               .writeUint8(((a>>6)&0x3F)|0x80, offset+2)
               .writeUint8((a&0x3F)|0x80, offset+3);
            offset += 4;
        } else if (a < 0x4000000) {
            dst.writeUint8(((a>>24)&0x03)|0xF8, offset)
               .writeUint8(((a>>18)&0x3F)|0x80, offset+1)
               .writeUint8(((a>>12)&0x3F)|0x80, offset+2)
               .writeUint8(((a>>6)&0x3F)|0x80, offset+3)
               .writeUint8((a&0x3F)|0x80, offset+4);
            offset += 5;
        } else {
            dst.writeUint8(((a>>30)&0x01)|0xFC, offset)
               .writeUint8(((a>>24)&0x3F)|0x80, offset+1)
               .writeUint8(((a>>18)&0x3F)|0x80, offset+2)
               .writeUint8(((a>>12)&0x3F)|0x80, offset+3)
               .writeUint8(((a>>6)&0x3F)|0x80, offset+4)
               .writeUint8((a&0x3F)|0x80, offset+5);
            offset += 6;
        }
    }
    return offset-start;
};

// Enable module loading if available
if (typeof module != 'undefined' && module["exports"]) {
    module["exports"] = ByteBuffer;
} else if (typeof require != 'undefined' && typeof define != 'undefined') {
    define("dcodeIO/ByteBuffer/ByteBuffer", [], function() { return ByteBuffer; });
} else if (typeof window != "undefined") {
    if (typeof window["dcodeIO"] == "undefined") {
       window["dcodeIO"] = {};
    }
    window["dcodeIO"]["ByteBuffer"] = ByteBuffer;
    delete window["ByteBuffer"];
}