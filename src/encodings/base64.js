//? if (BASE64) {
// encodings/base64
//? if (!NODE) {

/**
 * Base64 alphabet.
 * @type {string}
 * @inner
 */
var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
B64 = B64+""; // Prevent CC from inlining this
//? }

/**
 * Encodes this ByteBuffer's contents to a base64 encoded string.
 * @param {number=} begin Offset to begin at, defaults to {@link ByteBuffer#offset}.
 * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}.
 * @returns {string} Base64 encoded string
 * @expose
 */
ByteBuffer.prototype.toBase64 = function(begin, end) {
    if (typeof begin === 'undefined') begin = this.offset;
    if (typeof end === 'undefined') end = this.limit;
    if (!this.noAssert) {
        //? ASSERT_RANGE();
    }
    //? if (NODE)
    return this.buffer.slice(begin, end).toString("base64");
    //? else {
    if (begin === end) return "";
    var b1, b2, b3,     // input bytes
        h2, h3,         // has input?
        o1, o2, o3, o4, // output bytes
        out = "";       // output
    while (begin < end) {
        b1 = this.view.getUint8(begin++);
        b2 = (h2 = begin < end) ? this.view.getUint8(begin++) : 0;
        b3 = (h3 = begin < end) ? this.view.getUint8(begin++) : 0;
        o1 =                       b1 >> 2;
        o2 = ((b1 & 0x03) << 4) | (b2 >> 4);
        o3 = ((b2 & 0x0F) << 2) | (b3 >> 6);
        o4 =   b3 & 0x3F;
        if (!h3) {
            o4 = 64;
            if (!h2) o3 = 64;
        }
        out += B64.charAt(o1) + B64.charAt(o2) + B64.charAt(o3) + B64.charAt(o4);
    }
    return out;
    //? }
};

/**
 * Decodes a base64 encoded string to a ByteBuffer.
 * @param {string} str String to decode
 * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
 *  {@link ByteBuffer.DEFAULT_ENDIAN}.
 * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
 *  {@link ByteBuffer.DEFAULT_NOASSERT}.
 * @returns {!ByteBuffer} ByteBuffer
 * @expose
 */
ByteBuffer.fromBase64 = function(str, littleEndian, noAssert) {
    if (!noAssert) {
        if (typeof str !== 'string')
            throw new TypeError("Illegal str: Not a string");
        if (str.length % 4 !== 0)
            throw new TypeError("Illegal str: Length not a multiple of 4");
    }
    //? if (NODE) {
    var bb = new ByteBuffer(0, littleEndian, noAssert);
    bb.buffer = new Buffer(str, "base64");
    //? if (BUFFERVIEW)
    bb.view = new BufferView(bb.buffer);
    bb.limit = bb.buffer.length;
    //? } else {
    var len = str.length,
        suffix = 0,
        i, j;
    for (i=str.length-1; i>=0; --i) {
        if (str.charAt(i) === '=') suffix++;
        else break;
    }
    if (suffix > 2)
        throw new TypeError("Illegal str: Suffix is too large");
    if (len === 0)
        return new ByteBuffer(0, littleEndian, noAssert);
    var b1, b2, b3, b4, // input bytes
        h2, h3, h4,     // has input?
        bb = new ByteBuffer(len/4*3-suffix, littleEndian, noAssert);
    for (i=0, j=0; i<len; ) {
        b1 =                  B64.indexOf(str.charAt(i++));
        b2 = (h2 = i < len) ? B64.indexOf(str.charAt(i++)) : 0;
        b3 = (h3 = i < len) ? B64.indexOf(str.charAt(i++)) : 0;
        b4 = (h4 = i < len) ? B64.indexOf(str.charAt(i++)) : 0;
        if (!noAssert) {
            if (b1 < 0 || b2 < 0 || b3 < 0 || b4 < 0)
                throw new TypeError("Illegal str: Contains non-base64 characters");
        }
        bb.view.setUint8(j++, (b1 << 2) | (b2 >> 4));
        if (b3 !== 64) {
            bb.view.setUint8(j++, ((b2 << 4) & 0xF0) | (b3 >> 2), j);
            if (b4 !== 64) {
                bb.view.setUint8(j++, ((b3 << 6) & 0xC0) | b4);
            }
        }
    }
    bb.limit = j;
    //? }
    return bb;
};

/**
 * Encodes a binary string to base64 like `window.btoa` does.
 * @param {string} str Binary string
 * @returns {string} Base64 encoded string
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window.btoa
 * @expose
 */
ByteBuffer.btoa = function(str) {
    return ByteBuffer.fromBinary(str).toBase64();
};

/**
 * Decodes a base64 encoded string to binary like `window.atob` does.
 * @param {string} b64 Base64 encoded string
 * @returns {string} Binary string
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window.atob
 * @expose
 */
ByteBuffer.atob = function(b64) {
    return ByteBuffer.fromBase64(b64).toBinary();
};

//? }
