/**
 * Reads the specified number of bytes.
 * @param {number} length Number of bytes to read
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `length` if omitted.
 * @returns {!ByteBuffer}
 * @expose
 */
ByteBufferPrototype.readBytes = function(length, offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_OFFSET('length');
    }
    var slice = this.slice(offset, offset + length);
    //? RELATIVE('length');
    return slice;
};

