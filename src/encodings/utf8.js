//? if (UTF8) {
//? if (!NODE) include("utf8/codepoint.js");
//? include("utf8/native.js");

// encodings/utf8

/**
 * Encodes this ByteBuffer's contents between {@link ByteBuffer#offset} and {@link ByteBuffer#limit} to an UTF8 encoded
 *  string.
 * @returns {string} Hex encoded string
 * @throws {RangeError} If `offset > limit`
 * @expose
 */
ByteBuffer.prototype.toUTF8 = function(begin, end) {
    if (typeof begin === 'undefined') begin = this.offset;
    if (typeof end === 'undefined') end = this.limit;
    if (!this.noAssert) {
        //? ASSERT_RANGE();
    }
    //? if (NODE)
    return this.buffer.slice(begin, end).toString("utf8");
    //? else {
    var out = [], temp;
    while (begin < end) {
        temp = utf8_decode_char(this, begin);
        out.push(temp['codePoint']);
        begin += temp['length'];
    }
    if (!this.noAssert) {
        if (begin !== end)
            throw new RangeError("Illegal range: Truncated data");
    }
    return String.fromCodePoint.apply(String, out);
    //? }
};

/**
 * Decodes an UTF8 encoded string to a ByteBuffer.
 * @param {string} str String to decode
 * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
 *  {@link ByteBuffer.DEFAULT_ENDIAN}.
 * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
 *  {@link ByteBuffer.DEFAULT_NOASSERT}.
 * @returns {!ByteBuffer} ByteBuffer
 * @expose
 */
ByteBuffer.fromUTF8 = function(str, littleEndian, noAssert) {
    if (!noAssert) {
        if (typeof str !== 'string')
            throw new TypeError("Illegal str: Not a string");
    }
    //? if (NODE) {
    var bb = new ByteBuffer(0, littleEndian, noAssert);
    bb.buffer = new Buffer(str, "utf8");
    //? if (BUFFERVIEW)
    bb.view = new BufferView(bb.buffer);
    bb.limit = bb.buffer.length;
    //? } else {
    var bb = new ByteBuffer(utf8_calc_string(str), littleEndian, noAssert),
        cp;
    for (var i=0, j=0, k=str.length; i<k; ++i) {
        cp = str.charCodeAt(i);
        if (cp >= 0xD800 && cp <= 0xDFFF) {
            cp = str.codePointAt(i);
            if (cp > 0xFFFF) i++;
        }
        j += utf8_encode_char(cp, bb, j);
    }
    bb.limit = j;
    //? }
    return bb;
};

//? }
