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
 * @const
 */
ByteBuffer.DEFAULT_CAPACITY = 32;

/**
 * Little endian constant for usage in constructors instead of a boolean value. Evaluates to true.
 * @type {boolean}
 * @const
 */
ByteBuffer.LITTLE_ENDIAN = true;

/**
 * Big endian constant for usage in constructors instead of a boolean value. Evaluates to false.
 * @type {boolean}
 * @const
 */
ByteBuffer.BIG_ENDIAN = false;

/**
 * Allocates a new ByteBuffer.
 * @param {number=} capacity Initial capacity. Defaults to {@link ByteBuffer.DEFAULT_CAPACITY}.
 * @param {boolean=} littleEndian true to use little endian multi byte values, false for big endian. Defaults to true.
 * @return {dcodeIO.ByteBuffer}
 */
ByteBuffer.allocate = function(capacity, littleEndian) {
    return new ByteBuffer(capacity, littleEndian);
};

/**
 * Wraps an ArrayBuffer. Sets the ByteBuffer's offset to 0 and its length to the specified ArrayBuffer's byte length.
 * @param {ArrayBuffer|*} buffer ArrayBuffer or any object with an object#array or object#buffer property to wrap
 * @param {boolean=} littleEndian true to use little endian multi byte values, false for big endian. Defaults to true.
 * @return {dcodeIO.ByteBuffer}
 */
ByteBuffer.wrap = function(buffer, littleEndian) {
    if (!!buffer["array"]) {
        buffer = buffer["array"];
    } else if (!!buffer["buffer"]) {
        buffer = buffer["buffer"];
    }
    if (!(buffer instanceof ArrayBuffer)) {
        throw("Cannot wrap buffer of type "+typeof(buffer));
    }
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
 * Slices the ByteBuffer. This is independent of the ByteBuffer's actual offsets. Does not compact the underlying
 * ArrayBuffer (use {@link dcodeIO.ByteBuffer#compact} and maybe {@link dcodeIO.ByteBuffer.wrap} instead).
 * @param {number} begin Begin offset
 * @param {number} end End offset
 * @return {dcodeIO.ByteBuffer} Clone of this ByteBuffer with the specified slicing applied, backed by the same ArrayBuffer
 */
ByteBuffer.prototype.slice = function(begin, end) {
    if (this.array == null) {
        throw(this+" cannot be sliced: Already destroyed");
    }
    if (end <= begin) {
        throw(this+" cannot be sliced: End ("+end+") is less than begin ("+begin+")");
    }
    if (begin < 0 || begin > this.array.byteLength || end < 1 || end > this.array.byteLength) {
        throw(this+" cannot be sliced: Index out of bounds (0-"+this.array.byteLength+" -> "+begin+"-"+end+")");
    }
    var b = this.clone();
    b.offset = begin;
    b.length = end;
    return b;
};

/**
 * Slices and compacts the ByteBuffer. The resulting ByteBuffer will have its own ArrayBuffer with the compacted contents
 * of this ByteBuffer's contents.
 * @param {number} begin Begin offset
 * @param {number} end End offset
 * @returns {dcodeIO.ByteBuffer}
 */
ByteBuffer.prototype.sliceAndCompact = function(begin, end) {
    return ByteBuffer.wrap(this.slice(begin,end).toArrayBuffer(true));
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
 * Copies this ByteBuffer. The returned copied ByteBuffer has its own ArrayBuffer and uses the same offsets as this one.
 * @return {dcodeIO.ByteBuffer}
 */
ByteBuffer.prototype.copy = function() {
    var b = new ByteBuffer(this.array.byteLength, this.littleEndian);
    var src = new Uint8Array(this.array);
    var dst = new Uint8Array(b.array);
    dst.set(src);
    b.offset = this.offset;
    b.length = this.length;
    return b;
};

/**
 * Compacts the ByteBuffer to be backed by an ArrayBuffer of its actual length. Will {@link ByteBuffer#flip} the 
 * ByteBuffer if its offset is larger than its length. If the ByteBuffer's offset is less than its length, only the
 * portion between its offset and length will be contained in the compacted backing buffer. Will set offset=0 and
 * length=capacity. Will do nothing but flipping, if required, if already compacted.
 * @return {ByteBuffer} this
 */
ByteBuffer.prototype.compact = function() {
    if (this.array == null) {
        throw(this+" cannot be compacted: Already destroyed");
    }
    var b;
    if (this.offset > this.length) {
        this.flip();
    }
    if (this.offset == this.length) {
        throw(this+" cannot be compacted: Offset ("+this.offset+") is equal to its length ("+this.length+")");
    }
    if (this.offset == 0 && this.length == this.array.byteLength) {
        return this; // Already compacted
    }
    var srcView = new Uint8Array(this.array);
    var dst = new ArrayBuffer(this.length-this.offset);
    var dstView = new Uint8Array(dst);
    dstView.set(srcView.subarray(this.offset, this.length));
    this.array = dst;
    this.offset = 0;
    this.length = this.array.byteLength;
    return this;
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
    return this.view.getInt8(offset, this.littleEndian);
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
    this.view.setFloat64(offset, value, this.littleEndian);
    return this;
};

/**
 * Reads a 64bit float.
 * @param {number=} offset Offset to read from. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {number}
 */
ByteBuffer.prototype.readFloat64 = function(offset) {
    offset = typeof offset != 'undefined' ? offset : (this.offset+=8)-8;
    return this.view.getFloat64(offset, this.littleEndian);
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
    var start = offset;
    this.ensureCapacity(offset+s.length*6); // 6 bytes per character in the worst case
    for (var i=0; i<s.length; i++) {
        offset += ByteBuffer.encodeUTF8Char(s.charCodeAt(i), this, offset);
    }
    if (advance) {
        this.offset = offset;
        return this;
    } else {
        return offset-start;
    }
};

/**
 * Reads an UTF8 string.
 * @param {number} chars Number of characters to read
 * @param {number=} offset Offset to read from. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {string|{string: string, length: number}} The string read if offset is omitted, else the string read and the actual number of bytes read.
 */
ByteBuffer.prototype.readUTF8String = function(chars, offset) {
    var advance = typeof offset == 'undefined';
    offset = typeof offset != 'undefined' ? offset : this.offset;
    var dec, result = "", start = offset;
    for (var i=0; i<chars; i++) {
        dec = ByteBuffer.decodeUTF8Char(this, offset);
        offset += dec["length"];
        result += String.fromCharCode(dec["char"]);
    }
    if (advance) {
        this.offset = offset;
        return result;
    } else {
        return {
            "string": result,
            "length": offset-start
        }
    }
};

/**
 * Writes a string with prepended number of characters, which is also encoded as an UTF8 character..
 * @param {string} s String to write
 * @param {number=} offset Offset to write to. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {dcodeIO.ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
 */
ByteBuffer.prototype.writeLString = function(s, offset) {
    var advance = typeof offset == 'undefined';
    offset = typeof offset != 'undefined' ? offset : this.offset;
    var encLen = ByteBuffer.encodeUTF8Char(s.length, this, offset);
    encLen += this.writeUTF8String(s, offset+encLen);
    if (advance) {
        this.offset += encLen;
        return this;
    } else {
        return encLen;
    }
};

/**
 * Reads a string with a prepended number of characters, which is also encoded as an UTF8 character.
 * @param {number=} offset Offset to read from. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {string|{string: string, length: number}} The string read if offset is omitted, else the string read and the actual number of bytes read.
 */
ByteBuffer.prototype.readLString = function(offset) {
    var advance = typeof offset == 'undefined';
    offset = typeof offset != 'undefined' ? offset : this.offset;
    var lenDec = ByteBuffer.decodeUTF8Char(this, offset);
    var dec = this.readUTF8String(lenDec["char"], offset+lenDec["length"]);
    if (advance) {
        this.offset += lenDec["length"]+dec["length"];
        return dec["string"];
    } else {
        return {
            "string": dec["string"],
            "length": lenDec["length"]+dec["length"]
        };
    }
};

/**
 * Writes a string followed by a NULL character (Uint8).
 * @param {string} s String to write
 * @param {number=} offset Offset to write to. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {dcodeIO.ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
 */
ByteBuffer.prototype.writeCString = function(s, offset) {
    var advance = typeof offset == 'undefined';
    offset = typeof offset != 'undefined' ? offset : this.offset;
    var encLen = this.writeUTF8String(s, offset);
    this.writeUint8(s, offset+encLen);
    if (advance) {
        this.offset += encLen+1;
        return this;
    } else {
        return encLen+1;
    }
};

/**
 * Reads a string followed by a NULL character (Uint8).
 * @param {number=} offset Offset to read from. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @return {string|{string: string, length: number}} The string read if offset is omitted, else the string read and the actual number of bytes read.
 */
ByteBuffer.prototype.readCString = function(offset) {
    var advance = typeof offset == 'undefined';
    offset = typeof offset != 'undefined' ? offset : this.offset;
    var dec, result = "", start = offset;
    do {
        dec = ByteBuffer.decodeUTF8Char(this, offset);
        offset += dec["length"];
        if (dec["char"] != 0) result += String.fromCharCode(dec["char"]);
    } while (dec["char"] != 0);
    if (advance) {
        this.offset = offset;
        return result;
    } else {
        return {
            "string": result,
            "length": offset-start
        };
    }
};

/**
 * Serializes and writes a JSON payload.
 * @param {*} data Data payload to serialize
 * @param {number=} offset Offset to write to. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted,
 * @param {function=} stringify Stringify implementation to use. Defaults to {@link JSON.stringify}.
 * @return {dcodeIO.ByteBuffer|number} this if offset is omitted, else the actual number if bytes written,
 */
ByteBuffer.prototype.writeJSON = function(data, offset, stringify) {
    stringify = stringify || JSON.stringify.bind(JSON);
    return this.writeLString(stringify(data), offset);
};

/**
 * Reads a JSON payload and unserializes it.
 * @param {number=} offset Offset to read from. Defaults to {@link dcodeIO.ByteBuffer#offset} which will be modified only if omitted.
 * @param {function=} parse Parse implementation to use. Defaults to {@link JSON.parse}.
 * @return {*|{data: *, length: number}} Data payload if offset is omitted, else the data payload and the actual number of bytes read.
 */
ByteBuffer.prototype.readJSON = function(offset, parse) {
    parse = parse || JSON.parse.bind(JSON);
    var result = this.readLString(offset);
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
    console.log(this.toHex()+"\n");
};

/**
 * Returns a hex representation of this ByteBuffer's contents. Beware: May be large.
 * @param {number=} wrap Wrap length. Defaults to 16.
 * @return {string} Hex representation as of " 00<01 02>03..." with marked offsets
 */
ByteBuffer.prototype.toHex = function(wrap) {
    if (this.array == null) return "DESTROYED";
    wrap = typeof wrap != 'undefined' ? parseInt(wrap, 10) : 16;
    if (wrap < 1) wrap = 16;
    var out = "", view = new Uint8Array(this.array);
    for (var i=0; i<this.array.byteLength; i++) {
        var val = view[i];
        val = val.toString(16).toUpperCase();
        if (val.length < 2) val = "0"+val;
        if (i>0 && i%wrap == 0) {
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
    return out;
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
 * Returns an ArrayBuffer compacted to contain this ByteBuffer's actual contents. Will implicitly
 * {@link dcodeIO.ByteBuffer#flip} the ByteBuffer if its offset is larger than its length. Will return a reference to
 * the unmodified backing buffer if offset=0 and length=capacity unless forceCopy is set to true.
 * @param {boolean=} forceCopy Forces the creation of a copy if set to true. Defaults to false.
 * @return {ArrayBuffer} Compacted ArrayBuffer
 */
ByteBuffer.prototype.toArrayBuffer = function(forceCopy) {
    var b = this.clone();
    if (b.offset > b.length) {
        b.flip();
    }
    var copied = false;
    if (b.offset > 0 || b.length < b.array.byteLength) {
        b.compact(); // Will always create a new backing buffer because of the above condition
        copied = true;
    }
    return forceCopy && !copied ? b.copy().array : b.array;
};

/**
 * Decodes a single UTF8 character from the specified ByteBuffer. The ByteBuffer's offsets are not modified.
 * @param {dcodeIO.ByteBuffer} src
 * @param {number} offset Offset to read from
 * @return {{char: number, length: number}} Decoded char code and the actual number of bytes read 
 */
ByteBuffer.decodeUTF8Char = function(src, offset) {
    var a = src.readUint8(offset), b, c, d, e, f, start = offset, charCode;
    // ref: http://en.wikipedia.org/wiki/UTF-8#Description
    // It's quite huge but should be pretty fast.
    if ((a&0x80)==0) {
        charCode = a;
        offset += 1;
    } else if ((a&0xE0)==0xC0) {
        b = src.readUint8(offset+1);
        charCode = ((a&0x1F)<<6) | (b&0x3F);
        offset += 2;
    } else if ((a&0xF0)==0xE0) {
        b = src.readUint8(offset+1);
        c = src.readUint8(offset+2);
        charCode = ((a&0x0F)<<12) | ((b&0x3F)<<6) | (c&0x3F);
        offset += 3;
    } else if ((a&0xF8)==0xF0) {
        b = src.readUint8(offset+1);
        c = src.readUint8(offset+2);
        d = src.readUint8(offset+3);
        charCode = ((a&0x07)<<18) | ((b&0x3F)<<12) | ((c&0x3F)<<6) | (d&0x3F);
        offset += 4;
    } else if ((a&0xFC)==0xF8) {
        b = src.readUint8(offset+1);
        c = src.readUint8(offset+2);
        d = src.readUint8(offset+3);
        e = src.readUint8(offset+4);
        charCode = ((a&0x03)<<24) | ((b&0x3F)<<18) | ((c&0x3F)<<12) | ((d&0x3F)<<6) | (e&0x3F);
        offset += 5;
    } else if ((a&0xFE)==0xFC) {
        b = src.readUint8(offset+1);
        c = src.readUint8(offset+2);
        d = src.readUint8(offset+3);
        e = src.readUint8(offset+4);
        f = src.readUint8(offset+5);
        charCode = ((a&0x01)<<30) | ((b&0x3F)<<24) | ((c&0x3F)<<18) | ((d&0x3F)<<12) | ((e&0x3F)<<6) | (f&0x3F);
        offset += 6;
    } else {
        throw("Invalid byte at offset "+offset+": 0x"+a.toString(16));
    }
    return {
        "char": charCode ,
        "length": offset-start
    };
};

/**
 * Encodes a single UTF8 character to the specified ByteBuffer. The ByteBuffer's offsets are not modified.
 * @param {number} charCode Character to encode as char code
 * @param {ByteBuffer} dst ByteBuffer to encode to
 * @param {number} offset Offset to write to
 * @return {number} Actual number of bytes written
 */
ByteBuffer.encodeUTF8Char = function(charCode, dst, offset) {
    var a = charCode, start = offset;
    // ref: http://en.wikipedia.org/wiki/UTF-8#Description
    // It's quite huge but should be pretty fast.
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
    return offset-start;
};

// Enable module loading if available
if (typeof module != 'undefined' && module["exports"]) {
    module["exports"] = ByteBuffer;
} else if (typeof require != 'undefined' && typeof define != 'undefined') {
    define([], function() { return ByteBuffer; });
} else if (typeof window != "undefined") {
    if (typeof window["dcodeIO"] == "undefined") {
       window["dcodeIO"] = {};
    }
    window["dcodeIO"]["ByteBuffer"] = ByteBuffer;
    delete window["ByteBuffer"];
}
