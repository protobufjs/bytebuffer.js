//? if (BINARY) {
// encodings/binary

//? if (NODE) {
//
// http://nodejs.org/api/buffer.html states: "This encoding method is deprecated and should be avoided in favor of
// Buffer objects where possible. This encoding will be removed in future versions of Node."
//
// https://github.com/joyent/node/issues/3279 states: "The cost of doing this is too high. People use the binary
// encoding, apparently, and don't want it taken away. It's not in the way at all, so let's drop this."
//
// So let's assume that binary encoding will at least stay for a while and prepare for the case that it'll be removed
// eventually by adding NODE switches to the browser implementation as well.
//

//? }
/**
 * Encodes this ByteBuffer to a binary encoded string, that is using only characters 0x00-0xFF as bytes.
 * @param {number=} begin Offset to begin at. Defaults to {@link ByteBuffer#offset}.
 * @param {number=} end Offset to end at. Defaults to {@link ByteBuffer#limit}.
 * @returns {string} Binary encoded string
 * @throws {RangeError} If `offset > limit`
 * @expose
 */
ByteBufferPrototype.toBinary = function(begin, end) {
    begin = typeof begin === 'undefined' ? this.offset : begin;
    end = typeof end === 'undefined' ? this.limit : end;
    if (!this.noAssert) {
        //? ASSERT_RANGE();
    }
    //? if (NODE)
    return this.buffer.toString("binary", begin, end);
    //? else {
    if (begin === end)
        return "";
    var cc = [], pt = [];
    while (begin < end) {
        //? if (NODE)
        cc.push(this.buffer[begin++]);
        //? else if (DATAVIEW)
        cc.push(this.view.getUint8(begin++));
        //? else
        cc.push(this.view[begin++]);
        if (cc.length >= 1024)
            pt.push(String.fromCharCode.apply(String, cc)),
            cc = [];
    }
    return pt.join('') + String.fromCharCode.apply(String, cc);
    //? }
};

/**
 * Decodes a binary encoded string, that is using only characters 0x00-0xFF as bytes, to a ByteBuffer.
 * @param {string} str String to decode
 * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
 *  {@link ByteBuffer.DEFAULT_ENDIAN}.
 * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
 *  {@link ByteBuffer.DEFAULT_NOASSERT}.
 * @returns {!ByteBuffer} ByteBuffer
 * @expose
 */
ByteBuffer.fromBinary = function(str, littleEndian, noAssert) {
    if (!noAssert) {
        if (typeof str !== 'string')
            throw TypeError("Illegal str: Not a string");
    }
    //? if (NODE) {
    var bb = new ByteBuffer(0, littleEndian, noAssert);
    bb.buffer = new Buffer(str, 'binary');
    //? if (BUFFERVIEW)
    bb.view = new BufferView(bb.buffer);
    bb.limit = bb.buffer.length;
    return bb;
    //? } else {
    var i = 0, k = str.length, charCode,
        bb = new ByteBuffer(k, littleEndian, noAssert);
    while (i<k) {
        charCode = str.charCodeAt(i);
        if (!noAssert && charCode > 255)
            throw RangeError("Illegal charCode at "+i+": 0 <= "+charCode+" <= 255");
        //? if (NODE)
        bb.buffer[i++] = charCode;
        //? else if (DATAVIEW)
        bb.view.setUint8(i++, charCode);
        //? else
        bb.view[i++] = charCode;
    }
    bb.limit = k;
    //? }
    return bb;
};

//? }