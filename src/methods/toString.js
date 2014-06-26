/**
 * Converts the ByteBuffer's contents to a string.
 * @param {string=} encoding Output encoding. Returns an informative string representation if omitted but also allows
 *  direct conversion to "utf8", "hex", "base64" and "binary" encoding. "debug" returns a hex representation with
 *  highlighted offsets.
 * @returns {string} String representation
 * @throws {Error} If `encoding` is invalid
 * @expose
 */
ByteBuffer.prototype.toString = function(encoding) {
    if (typeof encoding === 'undefined')
        return "ByteBuffer/*?= NODE ? 'NB' : 'AB' */(offset="+this.offset+",markedOffset="+this.markedOffset+",limit="+this.limit+",capacity="+this.capacity()+")";
    switch (encoding) {
        //? if (ENCODINGS) {
        //? if (UTF8) {
        case "utf8":
            return this.toUTF8();
        //? } if (BASE64) {
        case "base64":
            return this.toBase64();
        //? } if (HEX) {
        case "hex":
            return this.toHex();
        //? } if (BINARY) {
        case "binary":
            return this.toBinary();
        //? } if (DEBUG) {
        case "debug":
            return this.toDebug();
        case "columns":
            return this.toColumns();
        //? }
        //? } // ENCODINGS
        default:
            throw new Error("Unsupported encoding: "+encoding);
    }
};
