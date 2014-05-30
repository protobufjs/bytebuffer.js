//? if (VARINT64) {
// types/varints/varint64

if (Long) {
    
    /**
     * Maximum number of bytes required to store a 64bit base 128 variable-length integer.
     * @type {number}
     * @const
     * @expose
     */
    ByteBuffer.MAX_VARINT64_BYTES = 10;
    
    /**
     * Calculates the actual number of bytes required to store a 64bit base 128 variable-length integer.
     * @param {number|!Long} value Value to encode
     * @returns {number} Number of bytes required. Capped to {@link ByteBuffer.MAX_VARINT64_BYTES}
     * @expose
     */
    ByteBuffer.calculateVarint64 = function(value) {
        //? LONG('value');
        // ref: src/google/protobuf/io/coded_stream.cc
        var part0 = value.toInt() >>> 0,
            part1 = value.shiftRightUnsigned(28).toInt() >>> 0,
            part2 = value.shiftRightUnsigned(56).toInt() >>> 0;
        if (part2 == 0) {
            if (part1 == 0) {
                if (part0 < 1 << 14)
                    return part0 < 1 << 7 ? 1 : 2;
                else
                    return part0 < 1 << 21 ? 3 : 4;
            } else {
                if (part1 < 1 << 14)
                    return part1 < 1 << 7 ? 5 : 6;
                else
                    return part1 < 1 << 21 ? 7 : 8;
            }
        } else
            return part2 < 1 << 7 ? 9 : 10;
    };
    
    /**
     * Zigzag encodes a signed 64bit integer so that it can be effectively used with varint encoding.
     * @param {number|!Long} value Signed long
     * @returns {!Long} Unsigned zigzag encoded long
     * @expose
     */
    ByteBuffer.zigZagEncode64 = function(value) {
        //? LONG('value', false);
        // ref: src/google/protobuf/wire_format_lite.h
        return value.shiftLeft(1).xor(value.shiftRight(63)).toUnsigned();
    };
    
    /**
     * Decodes a zigzag encoded signed 64bit integer.
     * @param {!Long|number} value Unsigned zigzag encoded long or JavaScript number
     * @returns {!Long} Signed long
     * @expose
     */
    ByteBuffer.zigZagDecode64 = function(value) {
        //? LONG('value', false);
        // ref: src/google/protobuf/wire_format_lite.h
        return value.shiftRightUnsigned(1).xor(value.and(Long.ONE).toSigned().negate()).toSigned();
    };
    
    /**
     * Writes a 64bit base 128 variable-length integer.
     * @param {number|Long} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer|number} `this` if offset is omitted, else the actual number of bytes written.
     * @expose
     */
    ByteBuffer.prototype.writeVarint64 = function(value, offset) {
        //? RELATIVE();
        if (!this.noAssert) {
            //? ASSERT_LONG('value');
            //? ASSERT_OFFSET();
        }
        //? LONG('value', false);
        var size = ByteBuffer.calculateVarint64(value),
            part0 = value.toInt() >>> 0,
            part1 = value.shiftRightUnsigned(28).toInt() >>> 0,
            part2 = value.shiftRightUnsigned(56).toInt() >>> 0;
        //? ENSURE_CAPACITY('size');
        switch (size) {
        //? if (NODE) {
            //? if (INLINE) {
            case 10: this.buffer[offset+9] = (part2 >>>  7) | 0x80;
            case 9 : this.buffer[offset+8] = (part2       ) | 0x80;
            case 8 : this.buffer[offset+7] = (part1 >>> 21) | 0x80;
            case 7 : this.buffer[offset+6] = (part1 >>> 14) | 0x80;
            case 6 : this.buffer[offset+5] = (part1 >>>  7) | 0x80;
            case 5 : this.buffer[offset+4] = (part1       ) | 0x80;
            case 4 : this.buffer[offset+3] = (part0 >>> 21) | 0x80;
            case 3 : this.buffer[offset+2] = (part0 >>> 14) | 0x80;
            case 2 : this.buffer[offset+1] = (part0 >>>  7) | 0x80;
            case 1 : this.buffer[offset  ] = (part0       ) | 0x80;
            //? } else {
            case 10: this.buffer.writeUint8((part2 >>>  7) | 0x80, offset+9, true);
            case 9 : this.buffer.writeUint8((part2       ) | 0x80, offset+8, true);
            case 8 : this.buffer.writeUint8((part1 >>> 21) | 0x80, offset+7, true);
            case 7 : this.buffer.writeUint8((part1 >>> 14) | 0x80, offset+6, true);
            case 6 : this.buffer.writeUint8((part1 >>>  7) | 0x80, offset+5, true);
            case 5 : this.buffer.writeUint8((part1       ) | 0x80, offset+4, true);
            case 4 : this.buffer.writeUint8((part0 >>> 21) | 0x80, offset+3, true);
            case 3 : this.buffer.writeUint8((part0 >>> 14) | 0x80, offset+2, true);
            case 2 : this.buffer.writeUint8((part0 >>>  7) | 0x80, offset+1, true);
            case 1 : this.buffer.writeUint8((part0       ) | 0x80, offset  , true);
            //? }
        //? } else {
            case 10: this.view.setUint8(offset+9, (part2 >>>  7) | 0x80);
            case 9 : this.view.setUint8(offset+8, (part2       ) | 0x80);
            case 8 : this.view.setUint8(offset+7, (part1 >>> 21) | 0x80);
            case 7 : this.view.setUint8(offset+6, (part1 >>> 14) | 0x80);
            case 6 : this.view.setUint8(offset+5, (part1 >>>  7) | 0x80);
            case 5 : this.view.setUint8(offset+4, (part1       ) | 0x80);
            case 4 : this.view.setUint8(offset+3, (part0 >>> 21) | 0x80);
            case 3 : this.view.setUint8(offset+2, (part0 >>> 14) | 0x80);
            case 2 : this.view.setUint8(offset+1, (part0 >>>  7) | 0x80);
            case 1 : this.view.setUint8(offset  , (part0       ) | 0x80);
        //? }
        }
        offset += size-1;
    //? if (NODE) {
        //? if (INLINE) {
        this.buffer[offset] &= 0x7F;
        //? } else {
        this.buffer.writeUint8(this.buffer.readUint8(offset, true) & 0x7F, offset, true);
        //? }
    //? } else {
        this.view.setUint8(offset, this.view.getUint8(offset) & 0x7F);
    //? }
        if (relative) {
            this.offset += size;
            return this;
        } else {
            return size;
        }
    };

    /**
     * Writes a zig-zag encoded 64bit base 128 variable-length integer.
     * @param {number|Long} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer|number} `this` if offset is omitted, else the actual number of bytes written.
     * @expose
     */
    ByteBuffer.prototype.writeVarint64ZigZag = function(value, offset) {
        return this.writeVarint64(ByteBuffer.zigZagEncode64(value), offset);
    };
    
    /**
     * Reads a 64bit base 128 variable-length integer. Requires Long.js.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {!Long|!{value: Long, length: number}} The value read if offset is omitted, else the value read and
     *  the actual number of bytes read.
     * @throws {Error} If it's not a valid varint
     * @expose
     */
    ByteBuffer.prototype.readVarint64 = function(offset) {
        //? RELATIVE(); 
        if (!this.noAssert) {
            //? ASSERT_OFFSET(1);
        }
        // ref: src/google/protobuf/io/coded_stream.cc
        var start = offset,
            part0 = 0,
            part1 = 0,
            part2 = 0,
            b  = 0;
    //? if (NODE) {
        //? if (INLINE) { // Assert through checking for undefined (not optimal but coherent)
        b = this.buffer[offset++]; part0  = (b & 0x7F)      ; if ( b & 0x80                                                   ) {
        b = this.buffer[offset++]; part0 |= (b & 0x7F) <<  7; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
        b = this.buffer[offset++]; part0 |= (b & 0x7F) << 14; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
        b = this.buffer[offset++]; part0 |= (b & 0x7F) << 21; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
        b = this.buffer[offset++]; part1  = (b & 0x7F)      ; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
        b = this.buffer[offset++]; part1 |= (b & 0x7F) <<  7; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
        b = this.buffer[offset++]; part1 |= (b & 0x7F) << 14; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
        b = this.buffer[offset++]; part1 |= (b & 0x7F) << 21; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
        b = this.buffer[offset++]; part2  = (b & 0x7F)      ; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
        b = this.buffer[offset++]; part2 |= (b & 0x7F) <<  7; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
        throw(new Error("Data must be corrupt: Buffer overrun")); }}}}}}}}}}
        //? } else { // Assert as usual
        b = this.buffer.readUint8(offset++, true         ); part0  = (b & 0x7F)      ; if (b & 0x80) {
        b = this.buffer.readUint8(offset++, this.noAssert); part0 |= (b & 0x7F) <<  7; if (b & 0x80) {
        b = this.buffer.readUint8(offset++, this.noAssert); part0 |= (b & 0x7F) << 14; if (b & 0x80) {
        b = this.buffer.readUint8(offset++, this.noAssert); part0 |= (b & 0x7F) << 21; if (b & 0x80) {
        b = this.buffer.readUint8(offset++, this.noAssert); part1  = (b & 0x7F)      ; if (b & 0x80) {
        b = this.buffer.readUint8(offset++, this.noAssert); part1 |= (b & 0x7F) <<  7; if (b & 0x80) {
        b = this.buffer.readUint8(offset++, this.noAssert); part1 |= (b & 0x7F) << 14; if (b & 0x80) {
        b = this.buffer.readUint8(offset++, this.noAssert); part1 |= (b & 0x7F) << 21; if (b & 0x80) {
        b = this.buffer.readUint8(offset++, this.noAssert); part2  = (b & 0x7F)      ; if (b & 0x80) {
        b = this.buffer.readUint8(offset++, this.noAssert); part2 |= (b & 0x7F) <<  7; if (b & 0x80) {
        throw(new Error("Data must be corrupt: Buffer overrun")); }}}}}}}}}}
        //? }
    //? } else { // Asserts on its own
        b = this.view.getUint8(offset++); part0  = (b & 0x7F)      ; if (b & 0x80) {
        b = this.view.getUint8(offset++); part0 |= (b & 0x7F) <<  7; if (b & 0x80) {
        b = this.view.getUint8(offset++); part0 |= (b & 0x7F) << 14; if (b & 0x80) {
        b = this.view.getUint8(offset++); part0 |= (b & 0x7F) << 21; if (b & 0x80) {
        b = this.view.getUint8(offset++); part1  = (b & 0x7F)      ; if (b & 0x80) {
        b = this.view.getUint8(offset++); part1 |= (b & 0x7F) <<  7; if (b & 0x80) {
        b = this.view.getUint8(offset++); part1 |= (b & 0x7F) << 14; if (b & 0x80) {
        b = this.view.getUint8(offset++); part1 |= (b & 0x7F) << 21; if (b & 0x80) {
        b = this.view.getUint8(offset++); part2  = (b & 0x7F)      ; if (b & 0x80) {
        b = this.view.getUint8(offset++); part2 |= (b & 0x7F) <<  7; if (b & 0x80) {
        throw(new Error("Data must be corrupt: Buffer overrun")); }}}}}}}}}}
    //? }
        var value = Long.from28Bits(part0, part1, part2, false);
        if (relative) {
            this.offset = offset;
            return value;
        } else {
            return {
                'value': value,
                'length': offset-start
            };
        }
    };

    /**
     * Reads a zig-zag encoded 64bit base 128 variable-length integer. Requires Long.js.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {!Long|!{value: Long, length: number}} The value read if offset is omitted, else the value read and
     *  the actual number of bytes read.
     * @throws {Error} If it's not a valid varint
     * @expose
     */
    ByteBuffer.prototype.readVarint64ZigZag = function(offset) {
        var val = this.readVarint64(offset);
        if (typeof val === 'object')
            val["value"] = ByteBuffer.zigZagDecode64(val["value"]);
        else
            val = ByteBuffer.zigZagDecode64(val);
        return val;
    };
    
} // Long

//? }