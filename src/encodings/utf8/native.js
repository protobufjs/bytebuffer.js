// encodings/utf8/native

/**
 * Decodes a single UTF8 character from the specified ByteBuffer. The ByteBuffer's offsets remain untouched.
 * @param {!ByteBuffer} bb ByteBuffer to decode from
 * @param {number} offset Offset to start at
 * @returns {!{codePoint: number, length: number}} Decoded char code and the number of bytes read
 * @inner
 * @see http://en.wikipedia.org/wiki/UTF-8#Description
 */
function utf8_decode_char(bb, offset) { //? // Also required for node to extract CStrings and such
    var start = offset,
        a, b, c, d,
        codePoint;
    //? if (NODE) {
    if (offset+1 > bb.buffer.length)
        throw new RangeError("Index out of range: "+offset+" + 1 <= "+bb.buffer.length);
    a = bb.buffer[offset++];
    //? } else {
    a = bb.view.getUint8(offset++);
    //? }
    if ((a&0x80) === 0) {
        codePoint = a;
    } else if ((a&0xE0) === 0xC0) {
    //? if (NODE) {
        if (offset+1 > bb.buffer.length)
            throw new RangeError("Index out of range: "+offset+" + 1 <= "+bb.buffer.length);
        b = bb.buffer[offset++];
    //? } else { // getUint8 asserts on its own
        b = bb.view.getUint8(offset++);
    //? }
        codePoint = ((a&0x1F)<<6) | (b&0x3F);
    } else if ((a&0xF0) === 0xE0) {
    //? if (NODE) {
        if (offset+2 > bb.buffer.length)
            throw new RangeError("Index out of range: "+offset+" + 2 <= "+bb.buffer.length);
        b = bb.buffer[offset++];
        c = bb.buffer[offset++];
    //? } else {
        b = bb.view.getUint8(offset++);
        c = bb.view.getUint8(offset++);
    //? }
        codePoint = ((a&0x0F)<<12) | ((b&0x3F)<<6) | (c&0x3F);
    } else if ((a&0xF8) === 0xF0) {
        //? if (NODE) {
        if (offset+3 > bb.buffer.length)
            throw new RangeError("Index out of range: "+offset+" + 3 <= "+bb.buffer.length);
        b = bb.buffer[offset++];
        c = bb.buffer[offset++];
        d = bb.buffer[offset++];
        //? } else {
        b = bb.view.getUint8(offset++);
        c = bb.view.getUint8(offset++);
        d = bb.view.getUint8(offset++);
        //? }
        codePoint = ((a&0x07)<<18) | ((b&0x3F)<<12) | ((c&0x3F)<<6) | (d&0x3F);
    } else
        throw new RangeError("Illegal code point at offset "+offset+": "+a);
    return {
        'codePoint': codePoint,
        'length': offset - start
    };
}

/**
 * Calculates the actual number of bytes required to encode the specified char code.
 * @param {number} codePoint Code point to encode
 * @returns {number} Number of bytes required to encode the specified code point
 * @inner
 * @see http://en.wikipedia.org/wiki/UTF-8#Description
 */
function utf8_calc_char(codePoint) {
    if (codePoint < 0)
        throw new RangeError("Illegal code point: "+codePoint);
    if      (codePoint <       0x80) return 1;
    else if (codePoint <      0x800) return 2;
    else if (codePoint <    0x10000) return 3;
    else if (codePoint <   0x110000) return 4;
    else throw new RangeError("Illegal code point: "+codePoint);
}

/**
 * Calculates the number of bytes required to store an UTF8 encoded string.
 * @param {string} str String to calculate
 * @returns {number} Number of bytes required
 * @inner
 */
function utf8_calc_string(str) {
    var cp, n = 0;
    for (var i=0; i<str.length; i++) {
        cp = str.charCodeAt(i);
        if (cp >= 0xD800 && cp <= 0xDFFF) {
            cp = str.codePointAt(i);
            if (cp > 0xFFFF) i++;
        }
        n += utf8_calc_char(cp);
    }
    return n;
}
//? if (!NODE) {

/**
 * Encodes a single UTF8 character to the specified ByteBuffer backed by an ArrayBuffer. The ByteBuffer's offsets are
 *  not modified.
 * @param {number} codePoint Code point to encode
 * @param {!ByteBuffer} bb ByteBuffer to encode to
 * @param {number} offset Offset to write to
 * @returns {number} Number of bytes written
 * @inner
 * @see http://en.wikipedia.org/wiki/UTF-8#Description
 */
function utf8_encode_char(codePoint, bb, offset) {
    var start = offset;
    if (codePoint < 0)
        throw new RangeError("Illegal code point: "+codePoint);
    //? // ByteBufferAB only, meta not necessary.
    if (codePoint < 0x80) {
        bb.view.setUint8(offset++,   codePoint     &0x7F)      ;
    } else if (codePoint < 0x800) {
        bb.view.setUint8(offset++, ((codePoint>>6 )&0x1F)|0xC0);
        bb.view.setUint8(offset++, ( codePoint     &0x3F)|0x80);
    } else if (codePoint < 0x10000) {
        bb.view.setUint8(offset++, ((codePoint>>12)&0x0F)|0xE0);
        bb.view.setUint8(offset++, ((codePoint>>6 )&0x3F)|0x80);
        bb.view.setUint8(offset++, ( codePoint     &0x3F)|0x80);
    } else if (codePoint < 0x110000) {
        bb.view.setUint8(offset++, ((codePoint>>18)&0x07)|0xF0);
        bb.view.setUint8(offset++, ((codePoint>>12)&0x3F)|0x80);
        bb.view.setUint8(offset++, ((codePoint>>6 )&0x3F)|0x80);
        bb.view.setUint8(offset++, ( codePoint     &0x3F)|0x80);
    } else
        throw new RangeError("Illegal code point: "+codePoint);
    return offset - start;
}

//? }