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
            if (str.charCodeAt(i) === 0)
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
    k = utfx.calculateUTF16asUTF8(utfx.stringSource(str))[1];
    //? ENSURE_CAPACITY('k+1');
    utfx.encodeUTF16toUTF8(utfx.stringSource(str), function(b) {
        this.view.setUint8(offset++, b);
    }.bind(this));
    this.view.setUint8(offset++, 0);
    //? }
    if (relative) {
        this.offset = offset - start;
        return this;
    }
    return k;
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
    var sd, b = -1;
    utfx.decodeUTF8toUTF16(function() {
        if (b === 0) return null;
        if (offset >= this.limit)
            throw RangeError("Illegal range: Truncated data, "+offset+" < "+this.limit);
        return (b = this.view.getUint8(offset++)) === 0 ? null : b;
    }.bind(this), sd = utfx.stringDestination(), true);
    if (relative) {
        this.offset = offset;
        return sd();
    } else {
        return {
            "string": sd(),
            "length": offset - start
        };
    }
    //? }
};

//? }
