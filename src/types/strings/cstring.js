//? if (CSTRING) {
// types/strings/cstring

/**
 * Writes a NULL-terminated UTF8 encoded string. For this to work the specified string must not contain any NULL
 *  characters itself.
 * @param {string} str String to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  contained in `str` + 1 if omitted.
 * @returns {!ByteBuffer|number} this if offset is omitted, else the actual number of bytes written
 * @expose
 */
ByteBuffer.prototype.writeCString = function(str, offset) {
    //? RELATIVE();
    var i,
        k = str.length;
    if (!this.noAssert) {
        if (typeof str !== 'string')
            throw new TypeError("Illegal str: Not a string");
        for (i=0; i<k; ++i) {
            if (str.codePointAt(i) === 0)
                throw new RangeError("Illegal str: Contains NULL-characters");
        }
        //? ASSERT_OFFSET();
    }
    var start = offset;
    // UTF8 strings do not contain zero bytes in between except for the zero character, so:
    //? if (NODE) {
    var buffer = new Buffer(str, 'utf8');
    k = buffer.length;
    //? ENSURE_CAPACITY('k+1');
    buffer.copy(this.buffer, offset);
    offset += k;
    this.buffer[offset++] = 0;
    buffer = null;
    //? } else {
    k = utf8_calc_string(str);
    //? ENSURE_CAPACITY('k+1');
    var cp; k = str.length;
    for (i=0; i<k; i++) {
        cp = str.charCodeAt(i);
        if (cp >= 0xD800 && cp <= 0xDFFF) {
            cp = str.codePointAt(i);
            if (cp > 0xFFFF) i++;
        }
        offset += utf8_encode_char(cp, this, offset);
    }
    this.view.setUint8(offset++, 0);
    //? }
    if (relative) {
        this.offset = offset;
        return this;
    }
    return offset - start;
};

/**
 * Reads a NULL-terminated UTF8 encoded string. For this to work the string read must not contain any NULL characters
 *  itself.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  read if omitted.
 * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
 *  read and the actual number of bytes read.
 * @expose
 */
ByteBuffer.prototype.readCString = function(offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_OFFSET(1);
    }
    var start = offset,
        temp;
    // UTF8 strings do not contain zero bytes in between except for the zero character itself, so:
    //? if (NODE) {
    do {
        if (offset >= this.buffer.length)
            throw new RangeError("Index out of range: "+offset+" <= "+this.buffer.length);
        temp = this.buffer[offset++];
    } while (temp !== 0);
    var str = this.buffer.slice(start, offset-1).toString("utf8");
    if (relative) {
        this.offset = offset;
        return str;
    } else {
        return {
            "string": str,
            "length": offset - start
        };
    }
    //? } else { // getUint8 asserts on its own
    var out = [];
    do {
        temp = utf8_decode_char(this, offset);
        offset += temp['length'];
        if (temp['codePoint'] === 0) break;
        out.push(temp['codePoint']);
    } while (true);
    if (relative) {
        this.offset = offset;
        return String.fromCodePoint.apply(String, out);
    } else {
        return {
            "string": String.fromCodePoint.apply(String, out),
            "length": offset - start
        };
    }
    //? }
};

//? }
