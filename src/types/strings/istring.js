//? if (ISTRING) {
// types/strings/istring

/**
 * Writes a length as uint32 prefixed UTF8 encoded string.
 * @param {string} str String to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted.
 * @returns {!ByteBuffer|number} `this` if `offset` is omitted, else the actual number of bytes written
 * @expose
 * @see ByteBuffer#writeVarint32
 */
ByteBufferPrototype.writeIString = function(str, offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        if (typeof str !== 'string')
            throw TypeError("Illegal str: Not a string");
        //? ASSERT_OFFSET();
    }
    var start = offset,
        k;
    //? if (NODE) {
    k = Buffer.byteLength(str, "utf8");
    //? ENSURE_CAPACITY('4+k');
    //? WRITE_UINT32_ARRAY('k');
    offset += 4;
    offset += this.buffer.write(str, offset, k, "utf8");
    //? } else {
    k = utfx.calculateUTF16asUTF8(stringSource(str), this.noAssert)[1];
    //? ENSURE_CAPACITY('4+k');
    //? if (DATAVIEW)
    this.view.setUint32(offset, k, this.littleEndian);
    //? else
    //? WRITE_UINT32_ARRAY('k');
    offset += 4;
    utfx.encodeUTF16toUTF8(stringSource(str), function(b) {
        //? if (DATAVIEW)
        this.view.setUint8(offset++, b);
        //? else
        this.view[offset++] = b;
    }.bind(this));
    if (offset !== start + 4 + k)
        throw RangeError("Illegal range: Truncated data, "+offset+" == "+(offset+4+k));
    //? }
    if (relative) {
        this.offset = offset;
        return this;
    }
    return offset - start;
};

/**
 * Reads a length as uint32 prefixed UTF8 encoded string.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  read if omitted.
 * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
 *  read and the actual number of bytes read.
 * @expose
 * @see ByteBuffer#readVarint32
 */
ByteBufferPrototype.readIString = function(offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_OFFSET(4);
    }
    var temp = 0,
        start = offset,
        str;
    //? if (NODE) {
    //? READ_UINT32_ARRAY('temp');
    offset += 4;
    if (offset + temp > this.buffer.length)
        throw RangeError("Index out of bounds: "+offset+" + "+temp+" <= "+this.buffer.length);
    str = this.buffer.toString("utf8", offset, offset + temp);
    offset += temp;
    //? } else {
    //? if (DATAVIEW)
    temp = this.view.getUint32(offset, this.littleEndian);
    //? else
    //? READ_UINT32_ARRAY('temp');
    offset += 4;
    var k = offset + temp,
        sd;
    utfx.decodeUTF8toUTF16(function() {
        //? if (DATAVIEW)
        return offset < k ? this.view.getUint8(offset++) : null;
        //? else
        return offset < k ? this.view[offset++] : null;
    }.bind(this), sd = stringDestination(), this.noAssert);
    str = sd();
    //? }
    if (relative) {
        this.offset = offset;
        return str;
    } else {
        return {
            'string': str,
            'length': offset - start
        };
    }
};

//? }