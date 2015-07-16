// TODO

/**
 * Registers an additional string encoding.
 * @param {string} name Short name of the encoding (i.e. "utf8")
 * @param {function(!ByteBuffer, string, number)} fromString A function capable of decoding a string using this encoding
 *  to a ByteBuffer
 * @param {function(!ByteBuffer, number, number)} toString A function capable of encoding a string using this encoding
 *  from a ByteBuffer
 */
ByteBuffer.registerEncoding = function(name, fromString, toString) {
    ByteBuffer.ENCODINGS[name] = {
        fromString: fromString,
        toString: toString
    };
};
