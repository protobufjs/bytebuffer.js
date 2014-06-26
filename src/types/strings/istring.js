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
ByteBuffer.prototype.writeIString = function(str, offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        if (typeof str !== 'string')
            throw new TypeError("Illegal str: Not a string");
        //? ASSERT_OFFSET();
    }
    var start = offset,
        k;
    //? if (NODE) {
    var buffer = new Buffer(str, "utf8");
    k = buffer.length;
    //? ENSURE_CAPACITY('4+k');
    //? WRITE_UINT32_ARRAY('k');
    offset += 4;
    buffer.copy(this.buffer, offset);
    offset += k;
    //? } else {
    k = utf8_calc_string(str);
    //? ENSURE_CAPACITY('4+k');
    this.view.setUint32(offset, k, this.littleEndian);
    offset += 4;
    k = str.length;
    for (var i=0, cp; i<k; i++) {
        cp = str.charCodeAt(i);
        if (cp >= 0xD800 && cp <= 0xDFFF) {
            cp = str.codePointAt(i);
            if (cp > 0xFFFF) i++;
        }
        offset += utf8_encode_char(cp, this, offset);
    }
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
ByteBuffer.prototype.readIString = function(offset) {
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
        throw new RangeError("Index out of bounds: "+offset+" + "+temp+" <= "+this.buffer.length);
    str = this.buffer.slice(offset, offset + temp).toString("utf8");
    offset += temp;
    //? } else {
    temp = this.view.getUint32(offset, this.littleEndian);
    offset += 4;
    var k = offset + temp,
        out = [];
    while (offset < k) {
        temp = utf8_decode_char(this, offset);
        offset += temp['length'];
        out.push(temp['codePoint']);
    }
    str = String.fromCodePoint.apply(String, out);
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