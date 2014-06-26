//? if (VSTRING && VARINTS && VARINT32) {
// types/strings/vstring

/**
 * Writes a length as varint32 prefixed UTF8 encoded string.
 * @param {string} str String to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  written if omitted.
 * @returns {!ByteBuffer|number} `this` if `offset` is omitted, else the actual number of bytes written
 * @expose
 * @see ByteBuffer#writeVarint32
 */
ByteBuffer.prototype.writeVString = function(str, offset) {
    //? RELATIVE()
    if (!this.noAssert) {
        if (typeof str !== 'string')
            throw new TypeError("Illegal str: Not a string");
        //? ASSERT_OFFSET();
    }
    var start = offset,
        k, l;
    //? if (NODE) {
    var buffer = new Buffer(str, "utf8");
    l = ByteBuffer.calculateVarint32(buffer.length);
    k = buffer.length;
    //? ENSURE_CAPACITY('l+k');
    offset += this.writeVarint32(buffer.length, offset);
    buffer.copy(this.buffer, offset);
    offset += buffer.length;
    //? } else {
    k = utf8_calc_string(str);
    l = ByteBuffer.calculateVarint32(k);
    //? ENSURE_CAPACITY('l+k');
    offset += this.writeVarint32(k, offset);
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
 * Reads a length as varint32 prefixed UTF8 encoded string.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  read if omitted.
 * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
 *  read and the actual number of bytes read.
 * @expose
 * @see ByteBuffer#readVarint32
 */
ByteBuffer.prototype.readVString = function(offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_OFFSET(1);
    }
    var temp = this.readVarint32(offset),
        start = offset,
        str;
    offset += temp['length'];
    temp = temp['value'];
    //? if (NODE) {
    if (offset + temp > this.buffer.length)
        throw new RangeError("Index out of bounds: "+offset+" + "+val.value+" <= "+this.buffer.length);
    str = this.buffer.slice(offset, offset + temp).toString("utf8");
    offset += temp;
    //? } else {
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
