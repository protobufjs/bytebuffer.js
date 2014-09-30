//? if (INT32) {
// types/ints/int32

/**
 * Writes a 32bit signed integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
 * @expose
 */
ByteBufferPrototype.writeInt32 = function(value, offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_INTEGER('value');
        //? ASSERT_OFFSET();
    }
    //? ENSURE_CAPACITY(4);
    //? if (NODE) {
    //? WRITE_UINT32_ARRAY();
    //? } else
    this.view.setInt32(offset, value, this.littleEndian);
    //? RELATIVE(4);
    return this;
};
//? if (ALIASES) {

/**
 * Writes a 32bit signed integer. This is an alias of {@link ByteBuffer#writeInt32}.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
 * @expose
 */
ByteBufferPrototype.writeInt = ByteBufferPrototype.writeInt32;
//? }

/**
 * Reads a 32bit signed integer.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
 * @returns {number} Value read
 * @expose
 */
ByteBufferPrototype.readInt32 = function(offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_OFFSET(4);
    }
    //? if (NODE) {
    var value = 0;
    //? READ_UINT32_ARRAY();
    value |= 0; // Cast to signed
    //? } else
    var value = this.view.getInt32(offset, this.littleEndian);
    //? RELATIVE(4);
    return value;
};
//? if (ALIASES) {

/**
 * Reads a 32bit signed integer. This is an alias of {@link ByteBuffer#readInt32}.
 * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `4` if omitted.
 * @returns {number} Value read
 * @expose
 */
ByteBufferPrototype.readInt = ByteBufferPrototype.readInt32;
//? }

/**
 * Writes a 32bit unsigned integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
 * @expose
 */
ByteBufferPrototype.writeUint32 = function(value, offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_INTEGER('value', true);
        //? ASSERT_OFFSET();
    }
    //? ENSURE_CAPACITY(4);
    //? if (NODE) {
    //? WRITE_UINT32_ARRAY();
    //? } else
    this.view.setUint32(offset, value, this.littleEndian);
    //? RELATIVE(4);
    return this;
};

/**
 * Reads a 32bit unsigned integer.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
 * @returns {number} Value read
 * @expose
 */
ByteBufferPrototype.readUint32 = function(offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_OFFSET(4);
    }
    //? if (NODE) {
    var value = 0;
    //? READ_UINT32_ARRAY();
    //? } else
    var value = this.view.getUint32(offset, this.littleEndian);
    //? RELATIVE(4);
    return value;
};

//? }