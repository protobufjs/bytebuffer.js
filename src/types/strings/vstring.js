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
    k = buffer.length;
    l = ByteBuffer.calculateVarint32(k);
    //? ENSURE_CAPACITY('l+k');
    offset += this.writeVarint32(buffer.length, offset);
    buffer.copy(this.buffer, offset);
    offset += buffer.length;
    //? } else {
    k = utfx.calculateUTF16asUTF8(utfx.stringSource(str), this.noAssert)[1];
    l = ByteBuffer.calculateVarint32(k);
    //? ENSURE_CAPACITY('l+k');
    offset += this.writeVarint32(k, offset);
    utfx.encodeUTF16toUTF8(utfx.stringSource(str), function(b) {
        this.view.setUint8(offset++, b);
    }.bind(this));
    if (offset !== start+k+l)
        throw new RangeError("Illegal range: Truncated data, "+offset+" == "+(offset+k+l));
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
        sd = utfx.stringDestination();
    utfx.decodeUTF8toUTF16(function() {
        return offset < k ? this.view.getUint8(offset++) : null;
    }.bind(this), sd, this.noAssert);
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
