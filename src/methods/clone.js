/**
 * Creates a cloned instance of this ByteBuffer, preset with this ByteBuffer's values for {@link ByteBuffer#offset},
 *  {@link ByteBuffer#markedOffset} and {@link ByteBuffer#limit}.
 * @param {boolean=} copy Whether to copy the backing buffer or to return another view on the same, defaults to `false`
 * @returns {!ByteBuffer} Cloned instance
 * @expose
 */
ByteBufferPrototype.clone = function(copy) {
    var bb = new ByteBuffer(0, this.littleEndian, this.noAssert);
    if (copy) {
        //? if (NODE) {
        var buffer = new Buffer(this.buffer.length);
        this.buffer.copy(buffer);
        bb.buffer = buffer;
        //? if (BUFFERVIEW)
        bb.view = new BufferView(this.buffer);
        //? } else {
        var buffer = new ArrayBuffer(this.buffer.byteLength);
        new Uint8Array(buffer).set(this.buffer);
        bb.buffer = buffer;
        bb.view = new DataView(buffer);
        //? }
    } else {
        bb.buffer = this.buffer;
        //? if (!NODE || BUFFERVIEW)
        bb.view = this.view;
    }
    bb.offset = this.offset;
    bb.markedOffset = this.markedOffset;
    bb.limit = this.limit;
    return bb;
};

