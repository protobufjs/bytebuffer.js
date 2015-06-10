//? if (VARINT32) {
// types/varints/varint32

/**
 * Maximum number of bytes required to store a 32bit base 128 variable-length integer.
 * @type {number}
 * @const
 * @expose
 */
ByteBuffer.MAX_VARINT32_BYTES = 5;

/**
 * Calculates the actual number of bytes required to store a 32bit base 128 variable-length integer.
 * @param {number} value Value to encode
 * @returns {number} Number of bytes required. Capped to {@link ByteBuffer.MAX_VARINT32_BYTES}
 * @expose
 */
ByteBuffer.calculateVarint32 = function(value) {
    // ref: src/google/protobuf/io/coded_stream.cc
    value = value >>> 0;
         if (value < 1 << 7 ) return 1;
    else if (value < 1 << 14) return 2;
    else if (value < 1 << 21) return 3;
    else if (value < 1 << 28) return 4;
    else                      return 5;
};

/**
 * Zigzag encodes a signed 32bit integer so that it can be effectively used with varint encoding.
 * @param {number} n Signed 32bit integer
 * @returns {number} Unsigned zigzag encoded 32bit integer
 * @expose
 */
ByteBuffer.zigZagEncode32 = function(n) {
    return (((n |= 0) << 1) ^ (n >> 31)) >>> 0; // ref: src/google/protobuf/wire_format_lite.h
};

/**
 * Decodes a zigzag encoded signed 32bit integer.
 * @param {number} n Unsigned zigzag encoded 32bit integer
 * @returns {number} Signed 32bit integer
 * @expose
 */
ByteBuffer.zigZagDecode32 = function(n) {
    return ((n >>> 1) ^ -(n & 1)) | 0; // // ref: src/google/protobuf/wire_format_lite.h
};

/**
 * Writes a 32bit base 128 variable-length integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted.
 * @returns {!ByteBuffer|number} this if `offset` is omitted, else the actual number of bytes written
 * @expose
 */
ByteBufferPrototype.writeVarint32 = function(value, offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_INTEGER('value');
        //? ASSERT_OFFSET();
    }
    var size = ByteBuffer.calculateVarint32(value),
        b;
    //? ENSURE_CAPACITY('size');
    // ref: http://code.google.com/searchframe#WTeibokF6gE/trunk/src/google/protobuf/io/coded_stream.cc
    //? var dst = NODE ? 'this.buffer' : 'this.view';
    //? if (NODE || !DATAVIEW) {
    /*?= dst */[offset] = b = value | 0x80;
    //? } else
    this.view.setUint8(offset, b = value | 0x80);
    value >>>= 0;
    if (value >= 1 << 7) {
        b = (value >> 7) | 0x80;
        //? if (NODE || !DATAVIEW) {
        /*?= dst */[offset+1] = b;
        //? } else
        this.view.setUint8(offset+1, b);
        if (value >= 1 << 14) {
            b = (value >> 14) | 0x80;
            //? if (NODE || !DATAVIEW) {
            /*?= dst */[offset+2] = b;
            //? } else
            this.view.setUint8(offset+2, b);
            if (value >= 1 << 21) {
                b = (value >> 21) | 0x80;
                //? if (NODE || !DATAVIEW) {
                /*?= dst */[offset+3] = b;
                //? } else
                this.view.setUint8(offset+3, b);
                if (value >= 1 << 28) {
                    //? if (NODE || !DATAVIEW) {
                    /*?= dst */[offset+4] = (value >> 28) & 0x0F;
                    //? } else
                    this.view.setUint8(offset+4, (value >> 28) & 0x0F);
                    size = 5;
                } else {
                    //? if (NODE || !DATAVIEW) {
                    /*?= dst */[offset+3] = b & 0x7F;
                    //? } else
                    this.view.setUint8(offset+3, b & 0x7F);
                    size = 4;
                }
            } else {
                //? if (NODE || !DATAVIEW) {
                /*?= dst */[offset+2] = b & 0x7F;
                //? } else
                this.view.setUint8(offset+2, b & 0x7F);
                size = 3;
            }
        } else {
            //? if (NODE || !DATAVIEW) {
            /*?= dst */[offset+1] = b & 0x7F;
            //? } else
            this.view.setUint8(offset+1, b & 0x7F);
            size = 2;
        }
    } else {
        //? if (NODE || !DATAVIEW) {
        /*?= dst */[offset] = b & 0x7F;
        //? } else
        this.view.setUint8(offset, b & 0x7F);
        size = 1;
    }
    if (relative) {
        this.offset += size;
        return this;
    }
    return size;
};

/**
 * Writes a zig-zag encoded 32bit base 128 variable-length integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted.
 * @returns {!ByteBuffer|number} this if `offset` is omitted, else the actual number of bytes written
 * @expose
 */
ByteBufferPrototype.writeVarint32ZigZag = function(value, offset) {
    return this.writeVarint32(ByteBuffer.zigZagEncode32(value), offset);
};

/**
 * Reads a 32bit base 128 variable-length integer.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted.
 * @returns {number|!{value: number, length: number}} The value read if offset is omitted, else the value read
 *  and the actual number of bytes read.
 * @throws {Error} If it's not a valid varint. Has a property `truncated = true` if there is not enough data available
 *  to fully decode the varint.
 * @expose
 */
ByteBufferPrototype.readVarint32 = function(offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_OFFSET(1);
    }
    // ref: src/google/protobuf/io/coded_stream.cc
    var size = 0,
        value = 0 >>> 0,
        temp,
        ioffset;
    do {
        ioffset = offset+size;
        if (!this.noAssert && ioffset > this.limit) {
            var err = Error("Truncated");
            err['truncated'] = true;
            throw err;
        }
        //? if (NODE)
        temp = this.buffer[ioffset];
        //? else if (DATAVIEW)
        temp = this.view.getUint8(ioffset);
        //? else
        temp = this.view[ioffset];
        if (size < 5)
            value |= ((temp&0x7F)<<(7*size)) >>> 0;
        ++size;
    } while ((temp & 0x80) === 0x80);
    value = value | 0; // Make sure to discard the higher order bits
    if (relative) {
        this.offset += size;
        return value;
    }
    return {
        "value": value,
        "length": size
    };
};

/**
 * Reads a zig-zag encoded 32bit base 128 variable-length integer.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted.
 * @returns {number|!{value: number, length: number}} The value read if offset is omitted, else the value read
 *  and the actual number of bytes read.
 * @throws {Error} If it's not a valid varint
 * @expose
 */
ByteBufferPrototype.readVarint32ZigZag = function(offset) {
    var val = this.readVarint32(offset);
    if (typeof val === 'object')
        val["value"] = ByteBuffer.zigZagDecode32(val["value"]);
    else
        val = ByteBuffer.zigZagDecode32(val);
    return val;
};

//? }