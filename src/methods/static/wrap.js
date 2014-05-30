/**
 * Wraps a buffer or a string. Sets the allocated ByteBuffer's {@link ByteBuffer#offset} to `0` and its
 *  {@link ByteBuffer#limit} to the length of the wrapped data.
//? if (NODE) {
 * @param {!ByteBuffer|!Buffer|!ArrayBuffer|!Uint8Array|string} buffer Anything that can be wrapped
//? } else {
 * @param {!ByteBuffer|!ArrayBuffer|!Uint8Array|string} buffer Anything that can be wrapped
//? }
 * @param {(string|boolean)=} encoding String encoding if `buffer` is a string ("base64", "hex", "binary", defaults to
 *  "utf8")
 * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
 *  {@link ByteBuffer.DEFAULT_ENDIAN}.
 * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
 *  {@link ByteBuffer.DEFAULT_NOASSERT}.
 * @returns {!ByteBuffer} A ByteBuffer wrapping `buffer`
 * @expose
 */
ByteBuffer.wrap = function(buffer, encoding, littleEndian, noAssert) {
    if (typeof encoding !== 'string') {
        noAssert = littleEndian;
        littleEndian = encoding;
        encoding = undefined;
    }
    if (typeof buffer === 'string') {
        if (typeof encoding === 'undefined') encoding = "utf8";
        switch (encoding) {
            //? if (BASE64) {
            case "base64":
                return ByteBuffer.fromBase64(buffer, littleEndian);
            //? } if (HEX) {
            case "hex":
                return ByteBuffer.fromHex(buffer, littleEndian);
            //? } if (BINARY) {
            case "binary":
                return ByteBuffer.fromBinary(buffer, littleEndian);
            //? } if (UTF8) {
            case "utf8":
                return ByteBuffer.fromUTF8(buffer, littleEndian);
            //? } if (DEBUG) {
            case "debug":
                return ByteBuffer.fromDebug(buffer, littleEndian);
            //? }
            default:
                throw(new TypeError("Unsupported encoding: "+encoding));
        }
    }
    if (buffer === null || typeof buffer !== 'object')
        throw(new TypeError("Illegal buffer: null or non-object"));
    var bb;
    if (ByteBuffer.isByteBuffer(buffer)) {
        bb = ByteBuffer.prototype.clone.call(buffer);
        bb.markedOffset = -1;
        return bb;
    }
    //? if (NODE) {
    var i = 0,
        k = 0,
        b;
    if (buffer instanceof Uint8Array) { // Extract bytes from Uint8Array
        b = new Buffer(buffer.length);
        if (memcpy) { // Fast
            memcpy(b, 0, buffer.buffer, buffer.byteOffset, buffer.byteOffset + buffer.length);
        } else { // Slow
            for (i=0, k=buffer.length; i<k; ++i)
                b[i] = buffer[i];
        }
        buffer = b;
    } else if (buffer instanceof ArrayBuffer) { // Convert ArrayBuffer to Buffer
        b = new Buffer(buffer.byteLength);
        if (memcpy) { // Fast
            memcpy(b, 0, buffer, 0, buffer.byteLength);
        } else { // Slow
            buffer = new Uint8Array(buffer);
            for (i=0, k=buffer.length; i<k; ++i) {
                b[i] = buffer[i];
            }
        }
        buffer = b;
    } else if (!(buffer instanceof Buffer))
        throw(new TypeError("Illegal buffer"));
    bb = new ByteBuffer(0, littleEndian, noAssert);
    if (buffer.length > 0) { // Avoid references to more than one EMPTY_BUFFER
        bb.buffer = buffer;
        //? if (BUFFERVIEW)
        bb.view = new BufferView(buffer);
        bb.limit = buffer.length;
    }
    //? } else {
    if (buffer instanceof Uint8Array) { // Extract ArrayBuffer from Uint8Array
        bb = new ByteBuffer(0, littleEndian, noAssert);
        if (buffer.length > 0) { // Avoid references to more than one EMPTY_BUFFER
            bb.buffer = buffer.buffer;
            bb.offset = buffer.byteOffset;
            bb.limit = buffer.byteOffset + buffer.length;
            bb.view = buffer.length > 0 ? new DataView(buffer.buffer) : null;
        }
    } else if (buffer instanceof ArrayBuffer) { // Reuse ArrayBuffer
        bb = new ByteBuffer(0, littleEndian, noAssert);
        if (buffer.byteLength > 0) {
            bb.buffer = buffer;
            bb.offset = 0;
            bb.limit = buffer.byteLength;
            bb.view = buffer.byteLength > 0 ? new DataView(buffer) : null;
        }
    } else throw(new TypeError("Illegal buffer"));
    //? }
    return bb;
};
