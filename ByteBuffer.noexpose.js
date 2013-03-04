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
(function(global) {
    "use strict";

    /**
     * Int8.
     * @type {Int8Array}
     * @const
     */
    // var INT8 = new Int8Array(1);

    /**
     * Uint7.
     * @type {Uint8Array}
     * @const
     */
    // var UINT8 = new Uint8Array(1);

    /**
     * Int16.
     * @type {Int16Array}
     * @const
     */
    // var INT16 = new Int16Array(1);

    /**
     * Uint16.
     * @type {Uint16Array}
     * @const
     */
    // var UINT16 = new Uint16Array(1);

    /**
     * Int32.
     * @type {Int32Array}
     * @const
     */
    var INT32 = new Int32Array(1);

    /**
     * Uint32.
     * @type {Uint32Array}
     * @const
     */
    var UINT32 = new Uint32Array(1);

    /**
     * Float32.
     * @type {Float32Array}
     * @const
     */
    // var FLOAT32 = new Float32Array(1);

    /**
     * Float64.
     * @type {Float64Array}
     * @const
     */
    // var FLOAT64 = new Float64Array(1);
    
    /**
     * Constructs a new ByteBuffer.
     * @exports ByteBuffer
     * @class Provides a Java-like, Netty-inspired ByteBuffer implementation using typed arrays. It also tries to
     * abstract a bit of the complexity away by providing convenience methods for those who just want to write stuff
     * without caring about signed, unsigned and the actual bit sizes.
     * @param {number=} capacity Initial capacity. Defaults to {@link ByteBuffer.DEFAULT_CAPACITY}.
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
         * Current read/write offset. Length- and capacity-independent index. Contents are the bytes between offset and
         * length, which are both absolute indexes. There is no capacity property, use {@link ByteBuffer#capacity}
         * instead.
         * @type {number}
         */
        this.offset = 0;
    
        /**
         * Length of the contained data. Offset- and capacity-independent index. Contents are the bytes between offset and
         * length, which are both absolute indexes. There is no capacity property, use {@link ByteBuffer#capacity}
         * instead.
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
     * @return {ByteBuffer}
     */
    ByteBuffer.allocate = function(capacity, littleEndian) {
        return new ByteBuffer(capacity, littleEndian);
    };
    
    /**
     * Wraps an ArrayBuffer. Sets the ByteBuffer's offset to 0 and its length to the specified ArrayBuffer's byte length.
     * @param {ArrayBuffer|{array: ArrayBuffer}|{buffer: ArrayBuffer}|string} buffer ArrayBuffer, any object with an .array or .buffer property or a string to wrap
     * @param {boolean=} littleEndian true to use little endian multi byte values, false for big endian. Defaults to true.
     * @return {ByteBuffer}
     */
    ByteBuffer.wrap = function(buffer, littleEndian) {
        // Wrap a string
        if (typeof buffer == 'string') {
            return new ByteBuffer().writeUTF8String(buffer);
        }
        // Wrap anything that is or contains an ArrayBuffer
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
     * ArrayBuffer (use {@link ByteBuffer#compact} and maybe {@link ByteBuffer.wrap} instead).
     * @param {number} begin Begin offset
     * @param {number} end End offset
     * @return {ByteBuffer} Clone of this ByteBuffer with the specified slicing applied, backed by the same ArrayBuffer
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
     * @return {ByteBuffer}
     */
    ByteBuffer.prototype.sliceAndCompact = function(begin, end) {
        return ByteBuffer.wrap(this.slice(begin,end).toArrayBuffer(true));
    };
    
    /**
     * Makes sure that the specified capacity is available. If the current capacity is exceeded, it will be doubled. If
     * double the previous capacity is less than the required capacity, the required capacity will be used.
     * @param {number} capacity Required capacity
     * @return {boolean} true if actually resized, false if already that large or larger
     */
    ByteBuffer.prototype.ensureCapacity = function(capacity) {
        if (this.array == null) {
            return this.resize(capacity);
        }
        if (this.array.byteLength < capacity) return this.resize(this.array.byteLength*2 >= capacity ? this.array.byteLength*2 : capacity);
        return false;
    };
    
    /**
     * Flips the ByteBuffer. Sets length=offset and offset=0.
     * @return {ByteBuffer} this
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
     * @return {ByteBuffer} this
     */
    ByteBuffer.prototype.reset = function() {
        this.offset = 0;
        this.length = 0;
        return this;
    };
    
    /**
     * Clones this ByteBuffer. The returned cloned ByteBuffer shares the same ArrayBuffer but will have its own offsets.
     * @return {ByteBuffer}
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
     * @return {ByteBuffer}
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
     * Gets the number of remaining readable bytes. Contents are the bytes between offset and length, so this returns
     * length-offset.
     * @return {number} Remaining readable bytes (may be negative if offset is larger than length)
     */
    ByteBuffer.prototype.remaining = function() {
        return this.length - this.offset;
    };
    
    /**
     * Gets the capacity of the backing buffer. May be larger but not less than the contents actual length. Contents are the
     * bytes between offset and length, which is independent of the actual capacity.
     * @return {number} Capacity of the backing buffer or 0 if destroyed
     */
    ByteBuffer.prototype.capacity = function() {
        return this.array != null ? this.array.byteLength : 0;
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
     * @return {ByteBuffer} this
     */
    ByteBuffer.prototype.destroy = function() {
        if (this.array == null) return; // Already destroyed
        this.array = null;
        this.view = null;
        this.offset = 0;
        this.length = 0;
        return this;
    };

    /**
     * Reverses the underlying back buffer and adapts offset and length to retain the same relative position on the
     * reversed data in inverse order. Example: "00<01 02>03 04".reverse() = "04 03<02 01>00".
     * @return {ByteBuffer} this
     */
    ByteBuffer.prototype.reverse = function() {
        if (this.array == null) {
            throw(this+" cannot be reversed: Already destroyed");
        }
        // Not sure what for, but other implementations seem to have it :-)
        Array.prototype.reverse.call(new Uint8Array(this.array));
        var o = this.offset;
        this.offset = this.array.byteLength - this.length;
        this.length = this.array.byteLength - o;
        return this;
    };

    /**
     * Appends another ByteBuffer to this one. Appends only the portion between offset and length of the specified
     * ByteBuffer and overwrites any contents  behind the specified offset up to the number of bytes appended from
     * the specified ByteBuffer in this ByteBuffer. Will clone and flip the specified ByteBuffer if its offset is
     * larger than its length (its offsets remain untouched through cloning).
     * @param {ByteBuffer} src ByteBuffer to append
     * @param {number=} offset Offset to append behind. Defaults to {@link ByteBuffer#length} which will be modified only if omitted. 
     * @return {ByteBuffer} this
     */
    ByteBuffer.prototype.append = function(src, offset) {
        if (src.array == null) {
            throw(src+" cannot be appended to "+this+": Already destroyed");
        }
        var n = src.length - src.offset;
        if (n == 0) return this; // Nothing to append
        if (n < 0) {
            src = src.clone().flip();
            n = src.length - src.offset;
        }
        offset = typeof offset != 'undefined' ? offset : (this.length+=n)-n;
        this.ensureCapacity(offset+n);
        var srcView = new Uint8Array(src.array);
        var dstView = new Uint8Array(this.array);
        dstView.set(srcView.subarray(src.offset, src.length), offset);
        return this;
    };

    /**
     * Prepends another ByteBuffer to this one. Prepends only the portion between offset and length of the specified
     * ByteBuffer and overwrites any contents before the specified offsets up to the number of bytes prepended from
     * the specified ByteBuffer in this ByteBuffer. Will clone and flip the specified ByteBuffer if its offset is
     * larger than its length (its offsets remain untouched through cloning).
     * @param {ByteBuffer} src ByteBuffer to prepend
     * @param {number=} offset Offset to prepend before. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {ByteBuffer} this
     */
    ByteBuffer.prototype.prepend = function(src, offset) {
        if (src.array == null) {
            throw(src+" cannot be prepended to "+this+": Already destroyed");
        }
        var n = src.length - src.offset;
        if (n == 0) return this; // Nothing to prepend
        if (n < 0) {
            src = src.clone().flip();
            n = src.length - src.offset;
        }
        var modify = typeof offset == 'undefined';
        offset = typeof offset != 'undefined' ? offset : this.offset;
        var diff = n-offset;
        if (diff > 0) {
            // Doesn't fit, so maybe resize and move the contents that are already contained
            this.ensureCapacity(this.length+diff);
            this.append(this, n);
            this.offset += diff;
            this.length += diff;
            this.append(src, 0);
        } else {
            this.append(src, offset-n);
        }
        if (modify) {
            this.offset -= n;
        }
        return this;
    };
    
    /**
     * Writes an 8bit singed integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {ByteBuffer} this
     */
    ByteBuffer.prototype.writeInt8 = function(value, offset) {
        offset = typeof offset != 'undefined' ? offset : (this.offset+=1)-1;
        this.ensureCapacity(offset+1);
        this.view.setInt8(offset, value, this.littleEndian);
        return this;
    };
    
    /**
     * Reads an 8bit singed integer.
     * @param {number=} offset Offset to read from. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {number}
     */
    ByteBuffer.prototype.readInt8 = function(offset) {
        offset = typeof offset != 'undefined' ? offset : (this.offset+=1)-1;
        return this.view.getInt8(offset, this.littleEndian);
    };
    
    /**
     * Writes a byte. This is an alias of {ByteBuffer#writeInt8}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {ByteBuffer} this
     */
    ByteBuffer.prototype.writeByte = ByteBuffer.prototype.writeInt8;
    
    /**
     * Reads a byte. This is an alias of {@link ByteBuffer#readInt8}.
     * @function
     * @param {number=} offset Offset to read from. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {number}
     */
    ByteBuffer.prototype.readByte = ByteBuffer.prototype.readInt8;
    
    /**
     * Writes an 8bit unsinged integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {ByteBuffer} this
     */
    ByteBuffer.prototype.writeUint8 = function(value, offset) {
        offset = typeof offset != 'undefined' ? offset : (this.offset+=1)-1;
        this.ensureCapacity(offset+1);
        this.view.setUint8(offset, value, this.littleEndian);
        return this;
    };
    
    /**
     * Reads an 8bit unsinged integer.
     * @param {number=} offset Offset to read from. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {number}
     */
    ByteBuffer.prototype.readUint8 = function(offset) {
        offset = typeof offset != 'undefined' ? offset : (this.offset+=1)-1;
        return this.view.getUint8(offset, this.littleEndian);
    };
    
    /**
     * Writes a 16bit signed integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {ByteBuffer} this
     */
    ByteBuffer.prototype.writeInt16 = function(value, offset) {
        offset = typeof offset != 'undefined' ? offset : (this.offset+=2)-2;
        this.ensureCapacity(offset+2);
        this.view.setInt16(offset, value, this.littleEndian);
        return this;
    };
    
    /**
     * Reads a 16bit signed integer.
     * @param {number=} offset Offset to read from. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {number}
     */
    ByteBuffer.prototype.readInt16 = function(offset) {
        offset = typeof offset != 'undefined' ? offset : (this.offset+=2)-2;
        return this.view.getInt16(offset, this.littleEndian);
    };
    
    /**
     * Writes a short value. This is an alias of {@link ByteBuffer#writeInt16}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {ByteBuffer} this
     */
    ByteBuffer.prototype.writeShort = ByteBuffer.prototype.writeInt16;
    
    /**
     * Reads a short value. This is an alias of {@link ByteBuffer#readInt16}.
     * @function
     * @param {number=} offset Offset to read from. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {number}
     */
    ByteBuffer.prototype.readShort = ByteBuffer.prototype.readInt16;
    
    /**
     * Writes a 16bit unsigned integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {ByteBuffer} this
     */
    ByteBuffer.prototype.writeUint16 = function(value, offset) {
        offset = typeof offset != 'undefined' ? offset : (this.offset+=2)-2;
        this.ensureCapacity(offset+2);
        this.view.setUint16(offset, value, this.littleEndian);
        return this;
    };
    
    /**
     * Reads a 16bit unsigned integer.
     * @param {number=} offset Offset to read from. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {number}
     */
    ByteBuffer.prototype.readUint16 = function(offset) {
        offset = typeof offset != 'undefined' ? offset : (this.offset+=2)-2;
        return this.view.getUint16(offset, this.littleEndian);
    };
    
    /**
     * Writes a 32bit signed integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {ByteBuffer} this
     */
    ByteBuffer.prototype.writeInt32 = function(value, offset) {
        offset = typeof offset != 'undefined' ? offset : (this.offset+=4)-4;
        this.ensureCapacity(offset+4);
        this.view.setInt32(offset, value, this.littleEndian);
        return this;
    };
    
    /**
     * Reads a 32bit signed integer.
     * @param {number=} offset Offset to read from. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
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
     * @param {number=} offset Offset to write to. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {ByteBuffer} this
     */
    ByteBuffer.prototype.writeInt = ByteBuffer.prototype.writeInt32;
    
    /**
     * Reads an integer. This is an alias of {@link ByteBuffer#readInt32}.
     * @function
     * @param {number=} offset Offset to read from. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {number}
     */
    ByteBuffer.prototype.readInt = ByteBuffer.prototype.readInt32;
    
    /**
     * Writes a 32bit unsigned integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {ByteBuffer} this
     */
    ByteBuffer.prototype.writeUint32 = function(value, offset) {
        offset = typeof offset != 'undefined' ? offset : (this.offset+=4)-4;
        this.ensureCapacity(offset+4);
        this.view.setUint32(offset, value, this.littleEndian);
        return this;
    };
    
    /**
     * Reads a 32bit unsigned integer.
     * @param {number=} offset Offset to read from. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {number}
     */
    ByteBuffer.prototype.readUint32 = function(offset) {
        offset = typeof offset != 'undefined' ? offset : (this.offset+=4)-4;
        return this.view.getUint32(offset, this.littleEndian);
    };
    
    /**
     * Writes a 32bit float.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {ByteBuffer} this
     */
    ByteBuffer.prototype.writeFloat32 = function(value, offset) {
        offset = typeof offset != 'undefined' ? offset : (this.offset+=4)-4;
        this.ensureCapacity(offset+4);
        this.view.setFloat32(offset, value, this.littleEndian);
        return this;
    };
    
    /**
     * Reads a 32bit float.
     * @param {number=} offset Offset to read from. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {number}
     */
    ByteBuffer.prototype.readFloat32 = function(offset) {
        offset = typeof offset != 'undefined' ? offset : (this.offset+=4)-4;
        return this.view.getFloat32(offset, this.littleEndian);
    };
    
    /**
     * Writes a float. This is an alias of {@link ByteBuffer#writeFloat32}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {ByteBuffer} this
     */
    ByteBuffer.prototype.writeFloat = ByteBuffer.prototype.writeFloat32;
    
    /**
     * Reads a float. This is an alias of {@link ByteBuffer#readFloat32}.
     * @function
     * @param {number=} offset Offset to read from. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {number}
     */
    ByteBuffer.prototype.readFloat = ByteBuffer.prototype.readFloat32;
    
    /**
     * Writes a 64bit float.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {ByteBuffer} this
     */
    ByteBuffer.prototype.writeFloat64 = function(value, offset) {
        offset = typeof offset != 'undefined' ? offset : (this.offset+=8)-8;
        this.ensureCapacity(offset+8);
        this.view.setFloat64(offset, value, this.littleEndian);
        return this;
    };
    
    /**
     * Reads a 64bit float.
     * @param {number=} offset Offset to read from. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {number}
     */
    ByteBuffer.prototype.readFloat64 = function(offset) {
        offset = typeof offset != 'undefined' ? offset : (this.offset+=8)-8;
        return this.view.getFloat64(offset, this.littleEndian);
    };
    
    /**
     * Writes a double. This is an alias of {@link ByteBuffer#writeFloat64}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {ByteBuffer} this
     */
    ByteBuffer.prototype.writeDouble = ByteBuffer.prototype.writeFloat64;
    
    /**
     * Reads a double. This is an alias of {@link ByteBuffer#readFloat64}.
     * @function
     * @param {number=} offset Offset to read from. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {number}
     */
    ByteBuffer.prototype.readDouble = ByteBuffer.prototype.readFloat64;
    
    /**
     * Writes a long. This is an alias of {@link ByteBuffer#writeFloat64}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {ByteBuffer} this
     */
    ByteBuffer.prototype.writeLong = ByteBuffer.prototype.writeFloat64;
    
    /**
     * Reads a long. This makes use of {@link ByteBuffer#readFloat64} by additionally clamping the returned value to a natural number.
     * @param {number=} offset Offset to read from. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {number}
     */
    ByteBuffer.prototype.readLong = function(offset) {
        // Assuming it's +- a fraction -> round, not parseInt or something
        return Math.round(this.readFloat64(offset));
    };

    /**
     * Casts a value from one to another type. Expects two typed arrays of the desired types to write to for conversion.
     * @param {Int8Array|Uint8Array|Int16Array|Uint16Array|Int32Array|Uint32Array|Float32Array|Float64Array} fromType Type to convert from
     * @param {Int8Array|Uint8Array|Int16Array|Uint16Array|Int32Array|Uint32Array|Float32Array|Float64Array} toType Type to convert to
     * @param {number} value Value to convert
     * @return {number}
     */
    ByteBuffer.cast = function(fromType, toType, value) {
        fromType[0] = value;
        toType.set(fromType);
        return toType[0];
    };

    /**
     * Required number of bytes to store a base 128 variable-length 32bit integer.
     * @type {number}
     * @const
     */
    ByteBuffer.MAX_VARINT32_BYTES = 5;

    /**
     * Writes a base 128 variable-length 32bit integer as used in protobuf.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
     */
    ByteBuffer.prototype.writeVarint32 = function(value, offset) {
        var advance = typeof offset == 'undefined';
        offset = typeof offset != 'undefined' ? offset : this.offset;
        // ref: http://code.google.com/searchframe#WTeibokF6gE/trunk/src/google/protobuf/io/coded_stream.cc
        this.ensureCapacity(offset+ByteBuffer.calculateVarint32(value));
        var dst = new Uint8Array(this.array),
            size = 0;
        dst[offset] = (value | 0x80);
        if (value >= (1 << 7)) {
            dst[offset+1] = ((value >>  7) | 0x80);
            if (value >= (1 << 14)) {
                dst[offset+2] = ((value >> 14) | 0x80);
                if (value >= (1 << 21)) {
                    dst[offset+3] = ((value >> 21) | 0x80);
                    if (value >= (1 << 28)) {
                        dst[offset+4] = (value >> 28) & 0x7F;
                        size = 5;
                    } else {
                        dst[offset+3] &= 0x7F;
                        size = 4;
                    }
                } else {
                    dst[offset+2] &= 0x7F;
                    size = 3;
                }
            } else {
                dst[offset+1] &= 0x7F;
                size = 2;
            }
        } else {
            dst[offset] &= 0x7F;
            size = 1;
        }
        if (advance) {
            this.offset += size;
            return this;
        } else {
            return size;
        }
    };

    /**
     * Reads a base 128 variable-length 32bit integer as used in protobuf.
     * @param {number=} offset Offset to read from. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {number|{value: number, length: number}} The value read if offset is omitted, else the value read and the actual number of bytes read.
     */
    ByteBuffer.prototype.readVarint32 = function(offset) {
        var advance = typeof offset == 'undefined';
        offset = typeof offset != 'undefined' ? offset : this.offset;
        // ref: http://code.google.com/searchframe#WTeibokF6gE/trunk/src/google/protobuf/io/coded_stream.cc
        var src = new Uint8Array(this.array),
            count = 0,
            result = 0,
            b;
        do {
            if (count == ByteBuffer.MAX_VARINT32_BYTES) {
                throw("Cannot read Varint32 from "+this+"@"+offset+": Number of bytes is larger than "+ByteBuffer.MAX_VARINT32_BYTES);
            }
            b = src[offset+count];
            result |= (b & 0x7F) << (7 * count);
            ++count;
        } while (b & 0x80);
        if (result > 0xFFFFFFFF) {
            throw("Cannot read Varint32 from "+this+"@"+offset+": Value ("+result+") is out of bounds");
        }
        result = ByteBuffer.cast(UINT32, INT32, result);
        if (advance) {
            this.offset += count;
            return result;
        } else {
            return {
                "value": result,
                "length": count
            };
        }
    };

    /**
     * Writes a base 128 variable-length integer as used in protobuf. This is an alias of {@link ByteBuffer#writeVarint32}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
     */
    ByteBuffer.prototype.writeVarint = ByteBuffer.prototype.writeVarint32;

    /**
     * Reads a base 128 variable-length integer as used in protobuf. This is an alias of {@link ByteBuffer#readVarint32}.
     * @function
     * @param {number=} offset Offset to read from. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {number|{value: number, length: number}} The value read if offset is omitted, else the value read and the actual number of bytes read.
     */
    ByteBuffer.prototype.readVarint = ByteBuffer.prototype.readVarint32;

    /**
     * Calculates the actual number of bytes required to encode a base 128 variable.length 32bit integer.
     * @param {number} value Value to encode
     * @return {number} Number of bytes required
     */
    ByteBuffer.calculateVarint32 = function(value) {
        // ref: http://code.google.com/searchframe#WTeibokF6gE/trunk/src/google/protobuf/io/coded_stream.cc
        if (value < 0x80) {
            return 1;
        } else if (value < 0x4000) {
            return 2;
        } else if (value < 0x200000) {
            return 3;
        } else if (value < 0x10000000) {
            return 4;
        } else {
            return 5;
        }
    };
    
    /**
     * Writes an UTF8 string.
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
     */
    ByteBuffer.prototype.writeUTF8String = function(str, offset) {
        var advance = typeof offset == 'undefined';
        offset = typeof offset != 'undefined' ? offset : this.offset;
        var start = offset;
        var encLen = 0, i;
        for (i=0;i< str.length; i++) {
            encLen += ByteBuffer.calculateUTF8Char(str.charCodeAt(i));
        }
        this.ensureCapacity(offset+encLen);
        for (i=0; i<str.length; i++) {
            offset += ByteBuffer.encodeUTF8Char(str.charCodeAt(i), this, offset);
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
     * @param {number=} offset Offset to read from. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
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
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
     */
    ByteBuffer.prototype.writeLString = function(str, offset) {
        var advance = typeof offset == 'undefined';
        offset = typeof offset != 'undefined' ? offset : this.offset;
        var encLen = ByteBuffer.encodeUTF8Char(str.length, this, offset);
        encLen += this.writeUTF8String(str, offset+encLen);
        if (advance) {
            this.offset += encLen;
            return this;
        } else {
            return encLen;
        }
    };
    
    /**
     * Reads a string with a prepended number of characters, which is also encoded as an UTF8 character.
     * @param {number=} offset Offset to read from. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
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
     * Writes a string with prepended number of characters, which is encoded as a base 128 variable-length 32bit integer.
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
     */
    ByteBuffer.prototype.writeVString = function(str, offset) {
        var advance = typeof offset == 'undefined';
        offset = typeof offset != 'undefined' ? offset : this.offset;
        var encLen = this.writeVarint32(str.length, offset);
        encLen += this.writeUTF8String(str, offset+encLen);
        if (advance) {
            this.offset += encLen;
            return this;
        } else {
            return encLen;
        }
    };

    /**
     * Reads a string with a prepended number of characters, which is encoded as a base 128 variable-length 32bit integer.
     * @param {number=} offset Offset to read from. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {string|{string: string, length: number}} The string read if offset is omitted, else the string read and the actual number of bytes read.
     */
    ByteBuffer.prototype.readVString = function(offset) {
        var advance = typeof offset == 'undefined';
        offset = typeof offset != 'undefined' ? offset : this.offset;
        var lenDec = this.readVarint32(offset);
        var dec = this.readUTF8String(lenDec["value"], offset+lenDec["length"]);
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
     * Writes a string followed by a NULL character (Uint8). Beware: The source string must not contain NULL characters
     * unless this is actually intended. This is not checked. If you have the option it is recommended to use
     * {@link ByteBuffer#writeLString} or {@link ByteBuffer#writeVString} with the corresponding reading methods instead.
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @return {ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
     */
    ByteBuffer.prototype.writeCString = function(str, offset) {
        var advance = typeof offset == 'undefined';
        offset = typeof offset != 'undefined' ? offset : this.offset;
        var encLen = this.writeUTF8String(str, offset);
        this.writeUint8(0, offset+encLen);
        if (advance) {
            this.offset += encLen+1;
            return this;
        } else {
            return encLen+1;
        }
    };
    
    /**
     * Reads a string followed by a NULL character (Uint8).
     * @param {number=} offset Offset to read from. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
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
     * @param {number=} offset Offset to write to. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted,
     * @param {function=} stringify Stringify implementation to use. Defaults to {@link JSON.stringify}.
     * @return {ByteBuffer|number} this if offset is omitted, else the actual number if bytes written,
     */
    ByteBuffer.prototype.writeJSON = function(data, offset, stringify) {
        stringify = stringify || JSON.stringify;
        return this.writeLString(stringify(data), offset);
    };
    
    /**
     * Reads a JSON payload and unserializes it.
     * @param {number=} offset Offset to read from. Defaults to {@link ByteBuffer#offset} which will be modified only if omitted.
     * @param {function=} parse Parse implementation to use. Defaults to {@link JSON.parse}.
     * @return {*|{data: *, length: number}} Data payload if offset is omitted, else the data payload and the actual number of bytes read.
     */
    ByteBuffer.prototype.readJSON = function(offset, parse) {
        parse = parse || JSON.parse;
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
    
    /**
     * Prints debug information about this ByteBuffer's contents to console.
     * @param {!Function=|boolean} out Output function to call with the result or true to return the data as a string.
     * Defaults to call console.log.
     */
    ByteBuffer.prototype.printDebug = function(out) {
        var s = (this.array != null ? "ByteBuffer(offset="+this.offset+",length="+this.length+",capacity="+this.array.byteLength+")" : "ByteBuffer(DESTROYED)")+"\n"+
                "-------------------------------------------------------------------\n";
        var h = this.toHex(16, true);
        var a = this.toASCII(16, true);
        for (var i=0; i<h.length; i++) {
            s += h[i]+"  "+a[i]+"\n";
        }
        if (out === true) return s;
        if (typeof out == 'function') {
            out(s);
        } else {
            console.log(s);
        }
    };
    
    /**
     * Returns a hex representation of this ByteBuffer's contents. Beware: May be large.
     * @param {number=} wrap Wrap length. Defaults to 16.
     * @param {boolean=} asArray Set to true to return an array of lines. Defaults to false.
     * @return {string|Array.<string>} Hex representation as of " 00<01 02>03..." with marked offsets
     */
    ByteBuffer.prototype.toHex = function(wrap, asArray) {
        if (this.array == null) return "DESTROYED";
        asArray = !!asArray;
        wrap = typeof wrap != 'undefined' ? parseInt(wrap, 10) : 16;
        if (wrap < 1) wrap = 16;
        var out = "", lines = [], view = new Uint8Array(this.array);
        if (this.offset == 0 && this.length == 0) {
            out += "|";
        } else if (this.length == 0) {
            out += ">";
        } else if (this.offset == 0) {
            out += "<";
        } else {
            out += " ";
        }
        for (var i=0; i<this.array.byteLength; i++) {
            if (i>0 && i%wrap == 0) {
                lines.push(out);
                out = " ";
            }
            var val = view[i];
            val = val.toString(16).toUpperCase();
            if (val.length < 2) val = "0"+val;
            out += val;
            if (i+1 == this.offset && i+1 == this.length) {
                out += "|";
            } else if (i+1 == this.offset) {
                out += "<";
            } else if (i+1 == this.length) {
                out += ">";
            } else {
                out += " ";
            }
        }
        if (asArray) {
            while (out.length < 3*wrap+1) out += "   "; // Make it equal to maybe show something on the right
        }
        lines.push(out);
        return asArray ? lines : lines.join("\n");
    };

    /**
     * Returns an ASCII representation of this ByteBuffer's contents. Beware: May be large.
     * @param {number=} wrap Wrap length. Defaults to 16.
     * @param {boolean=} asArray Set to true to return an array of lines. Defaults to false.
     * @return {string|Array.<string>} ASCII representation as of "abcdef..." (33-126, else ".", no marked offsets)
     */
    ByteBuffer.prototype.toASCII = function(wrap, asArray) {
        if (this.array == null) return "";
        asArray = !!asArray;
        wrap = typeof wrap != 'undefined' ? parseInt(wrap, 10) : 16;
        if (wrap < 1) wrap = 16;
        var out = "", lines = [], view = new Uint8Array(this.array);
        for (var i=0; i<this.array.byteLength; i++) {
            if (i>0 && i%wrap == 0) {
                lines.push(out);
                out = "";
            }
            var val = view[i];
            if (val >  32 && val < 127) {
                val = String.fromCharCode(val);
            } else {
                val = ".";
            }
            out += val;
        }
        lines.push(out);
        return asArray ? lines : lines.join("\n")+"\n";
    };
    
    /**
     * Returns a string representation.
     * @return {string} String representation as of "ByteBuffer(offset=...,length=...,capacity=...)"
     */
    ByteBuffer.prototype.toString = function() {
        if (this.array == null) {
            return "ByteBuffer(DESTROYED)";
        }
        return "ByteBuffer(offset="+this.offset+",length="+this.length+",capacity="+this.array.byteLength+")";
    };
    
    /**
     * Returns an ArrayBuffer compacted to contain this ByteBuffer's actual contents. Will implicitly
     * {@link ByteBuffer#flip} the ByteBuffer if its offset is larger than its length. Will return a reference to
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
     * @param {ByteBuffer} src
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
            throw("Cannot decode UTF8 character at offset "+offset+": charCode (0x"+a.toString(16)+") is invalid");
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
        var start = offset;
        // ref: http://en.wikipedia.org/wiki/UTF-8#Description
        // It's quite huge but should be pretty fast.
        if (charCode < 0) {
            throw("Cannot encode UTF8 character: charCode ("+charCode+") is negative");
        }
        if (charCode < 0x80) {
            dst.writeUint8(charCode&0x7F, offset);
            offset += 1;
        } else if (charCode < 0x800) {
            dst.writeUint8(((charCode>>6)&0x1F)|0xC0, offset)
               .writeUint8((charCode&0x3F)|0x80, offset+1);
            offset += 2;
        } else if (charCode < 0x10000) {
            dst.writeUint8(((charCode>>12)&0x0F)|0xE0, offset)
               .writeUint8(((charCode>>6)&0x3F)|0x80, offset+1)
               .writeUint8((charCode&0x3F)|0x80, offset+2);
            offset += 3;
        } else if (charCode < 0x200000) {
            dst.writeUint8(((charCode>>18)&0x07)|0xF0, offset)
               .writeUint8(((charCode>>12)&0x3F)|0x80, offset+1)
               .writeUint8(((charCode>>6)&0x3F)|0x80, offset+2)
               .writeUint8((charCode&0x3F)|0x80, offset+3);
            offset += 4;
        } else if (charCode < 0x4000000) {
            dst.writeUint8(((charCode>>24)&0x03)|0xF8, offset)
               .writeUint8(((charCode>>18)&0x3F)|0x80, offset+1)
               .writeUint8(((charCode>>12)&0x3F)|0x80, offset+2)
               .writeUint8(((charCode>>6)&0x3F)|0x80, offset+3)
               .writeUint8((charCode&0x3F)|0x80, offset+4);
            offset += 5;
        } else if (charCode < 0x80000000) {
            dst.writeUint8(((charCode>>30)&0x01)|0xFC, offset)
               .writeUint8(((charCode>>24)&0x3F)|0x80, offset+1)
               .writeUint8(((charCode>>18)&0x3F)|0x80, offset+2)
               .writeUint8(((charCode>>12)&0x3F)|0x80, offset+3)
               .writeUint8(((charCode>>6)&0x3F)|0x80, offset+4)
               .writeUint8((charCode&0x3F)|0x80, offset+5);
            offset += 6;
        } else {
            throw("Cannot encode UTF8 character: charCode (0x"+charCode.toString(16)+") is too large (>= 0x80000000)");
        }
        return offset-start;
    };
    
    /**
     * Calculates the actual number of bytes required to encode the specified char code.
     * @param {number} charCode Character to encode as char code
     * @return {number} Number of bytes required to encode the specified char code
     */
    ByteBuffer.calculateUTF8Char = function(charCode) {
        if (charCode < 0) {
            throw("Cannot calculate length of UTF8 character: charCode ("+charCode+") is negative");
        }
        if (charCode < 0x80) {
            return 1;
        } else if (charCode < 0x800) {
            return 2;
        } else if (charCode < 0x10000) {
            return 3;
        } else if (charCode < 0x200000) {
            return 4;
        } else if (charCode < 0x4000000) {
            return 5;
        } else if (charCode < 0x80000000) {
            return 6;
        } else {
            throw("Cannot calculate length of UTF8 character: charCode (0x"+charCode.toString(16)+") is too large (>= 0x80000000)");
        }
    };


    /**
     * Encodes a signed integer so that it can be effectively used with varint encoding.
     * @param {number} n Signed integer
     * @return {number} Unsigned, zigzag encoded integer
     */
    ByteBuffer.zigZagEncode32 = function(n) {
        n = parseInt(n, 10);
        return (n>=0) ? n*2 : -n*2-1; // If we'd have real 32bit arithmetic: (n << 1) ^ (n >> 31);
    };

    /**
     * Decodes a zigzag encoded integer.
     * @param {number} n Unsigned zigzag encoded integer
     * @return {number} Signed integer
     */
    ByteBuffer.zigZagDecode32 = function(n) {
        n = parseInt(n, 10);
        return ((n&1)==0) ? n/2 : -(n+1)/2; // If we'd have real 32bit arithmetic: (n >> 1) ^ -(n & 1);
    };

    /**
     * Extends the ByteBuffer prototype with additional methods.
     * @param {string} name Method name
     * @param {!Function} func Prototype function
     */
    ByteBuffer.extend = function(name, func) {
        if (typeof name == "string" && typeof func == "function") {
            ByteBuffer.prototype[name] = func;
        } else {
            throw("Cannot extend prototype with "+name+"="+func+" (exptected string and function)")
        }
    };

    // Enable module loading if available
    if (typeof module != 'undefined' && module["exports"]) { // CommonJS
        module["exports"] = ByteBuffer;
    } else if (typeof define != 'undefined' && define["amd"]) { // AMD
        define("ByteBuffer", [], function() { return ByteBuffer; });
    } else { // Shim
        if (!global["dcodeIO"]) {
            global["dcodeIO"] = {};
        }
        global["dcodeIO"]["ByteBuffer"] = ByteBuffer;
    }
    
})(this);
