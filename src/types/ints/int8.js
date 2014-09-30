//? if (INT8) {
// types/ints/int8

/**
 * Writes an 8bit signed integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.writeInt8 = function(value, offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_INTEGER('value');
        //? ASSERT_OFFSET();
    }
    //? ENSURE_CAPACITY(1);
    //? if (NODE)
    this.buffer[offset] = value;
    //? else
    this.view.setInt8(offset, value);
    //? RELATIVE(1);
    return this;
};

/**
 * Writes an 8bit signed integer. This is an alias of {@link ByteBuffer#writeInt8}.
 * @function
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.writeByte = ByteBufferPrototype.writeInt8;

/**
 * Reads an 8bit signed integer.
 * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
 * @returns {number} Value read
 * @expose
 */
ByteBufferPrototype.readInt8 = function(offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_OFFSET(1);
    }
    //? if (NODE) {
    var value = this.buffer[offset];
    if ((value & 0x80) === 0x80) value = -(0xFF - value + 1); // Cast to signed
    //? } else
    var value = this.view.getInt8(offset);
    //? RELATIVE(1);
    return value;
};
//? if (ALIASES) {

/**
 * Reads an 8bit signed integer. This is an alias of {@link ByteBuffer#readInt8}.
 * @function
 * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
 * @returns {number} Value read
 * @expose
 */
ByteBufferPrototype.readByte = ByteBufferPrototype.readInt8;
//? }

/**
 * Writes an 8bit unsigned integer.
 * @param {number} value Value to write
 * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
 * @returns {!ByteBuffer} this
 * @expose
 */
ByteBufferPrototype.writeUint8 = function(value, offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_INTEGER('value', true);
        //? ASSERT_OFFSET();
    }
    //? ENSURE_CAPACITY(1);
    //? if (NODE)
    this.buffer[offset] = value;
    //? else
    this.view.setUint8(offset, value);
    //? RELATIVE(1);
    return this;
};

/**
 * Reads an 8bit unsigned integer.
 * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
 * @returns {number} Value read
 * @expose
 */
ByteBufferPrototype.readUint8 = function(offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_OFFSET(1);
    }
    //? if (NODE)
    var value = this.buffer[offset];
    //? else
    var value = this.view.getUint8(offset);
    //? RELATIVE(1);
    return value;
};

//? }