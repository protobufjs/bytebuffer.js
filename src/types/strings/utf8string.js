//? if (UTF8STRING && UTF8) {
// types/strings/utf8string

/**
 * Metrics representing number of UTF8 characters. Evaluates to `c`.
 * @type {string}
 * @const
 * @expose
 */
ByteBuffer.METRICS_CHARS = 'c';

/**
 * Metrics representing number of bytes. Evaluates to `b`.
 * @type {string}
 * @const
 * @expose
 */
ByteBuffer.METRICS_BYTES = 'b';

/**
 * Writes an UTF8 encoded string.
 * @param {string} str String to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} if omitted.
 * @returns {!ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
 * @expose
 */
ByteBuffer.prototype.writeUTF8String = function(str, offset) {
    //? RELATIVE();
    if (!this.noAssert) {
        //? ASSERT_OFFSET();
    }
    var k;
    //? if (NODE) {
    var buffer = new Buffer(str, 'utf8');
    k = buffer.length;
    //? ENSURE_CAPACITY('k');
    buffer.copy(this.buffer, offset);
    if (relative) {
        this.offset += k;
        return this;
    }
    return k;
    //? } else {
    var start = offset,
        cp;
    k = utf8_calc_string(str);
    //? ENSURE_CAPACITY('k');
    for (var i=0; i<str.length; i++) {
        cp = str.charCodeAt(i);
        if (cp >= 0xD800 && cp <= 0xDFFF) {
            cp = str.codePointAt(i);
            if (cp > 0xFFFF) i++;
        }
        offset += utf8_encode_char(cp, this, offset);
    }
    if (relative) {
        this.offset = offset;
        return this;
    }
    return offset - start;
    //? }
};
//? if (ALIASES) {

/**
 * Writes an UTF8 encoded string. This is an alias of {@link ByteBuffer#writeUTF8String}.
 * @function
 * @param {string} str String to write
 * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} if omitted.
 * @returns {!ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
 * @expose
 */
ByteBuffer.prototype.writeString = ByteBuffer.prototype.writeUTF8String;
//? }

/**
 * Calculates the number of UTF8 characters of a string. JavaScript itself uses UTF-16, so that a string's
 *  `length` property does not reflect its actual UTF8 size if it contains code points larger than 0xFFFF.
 * @function
 * @param {string} str String to calculate
 * @returns {number} Number of UTF8 characters
 * @expose
 */
ByteBuffer.calculateUTF8Chars = function(str) {
    var n = 0, cp;
    for (var i=0; i<str.length; i++) {
        cp = str.charCodeAt(i);
        if (cp >= 0xD800 && cp <= 0xDFFF) {
            cp = str.codePointAt(i);
            if (cp > 0xFFFF) i++;
        }
        n++;
    }
    return n;
};

/**
 * Calculates the number of UTF8 bytes of a string.
 * @function
 * @param {string} str String to calculate
 * @returns {number} Number of UTF8 bytes
 * @expose
 */
ByteBuffer.calculateUTF8Bytes = utf8_calc_string;

/**
 * Reads an UTF8 encoded string.
 * @param {number} length Number of characters or bytes to read.
 * @param {string=} metrics Metrics specifying what `length` is meant to count. Defaults to
 *  {@link ByteBuffer.METRICS_CHARS}.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  read if omitted.
 * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
 *  read and the actual number of bytes read.
 * @expose
 */
ByteBuffer.prototype.readUTF8String = function(length, metrics, offset) {
    if (typeof metrics === 'number') {
        offset = metrics;
        metrics = undefined;
    }
    //? RELATIVE();
    if (typeof metrics === 'undefined') metrics = ByteBuffer.METRICS_CHARS;
    if (!this.noAssert) {
        //? ASSERT_INTEGER('length');
        //? ASSERT_OFFSET();
    }
    var out,
        i = 0,
        start = offset,
        temp;
    if (metrics === ByteBuffer.METRICS_CHARS) { // The same for node and the browser
        out = [];
        while (i < length) {
            temp = utf8_decode_char(this, offset);
            offset += temp['length'];
            out.push(temp['codePoint']);
            ++i;
        }
        if (relative) {
            this.offset = offset;
            return String.fromCodePoint.apply(String, out);
        } else {
            return {
                "string": String.fromCodePoint.apply(String, out),
                "length": offset - start
            };
        }
    } else if (metrics === ByteBuffer.METRICS_BYTES) {
        if (!this.noAssert) {
            //? ASSERT_OFFSET('length');
        }
        //? if (NODE) {
        temp = this.buffer.slice(offset, offset+length).toString("utf8");
        if (relative) {
            this.offset += length;
            return temp;
        } else {
            return {
                'string': temp,
                'length': length
            };
        }
        //? } else {
        var k = offset + length;
        out = [];
        while (offset < k) {
            temp = utf8_decode_char(this, offset);
            offset += temp['length'];
            out.push(temp['codePoint']);
        }
        if (offset !== k)
            throw new RangeError("Illegal range: Truncated character at "+k);
        if (relative) {
            this.offset = offset;
            return String.fromCodePoint.apply(String, out);
        } else {
            return {
                'string': String.fromCodePoint.apply(String, out),
                'length': offset - start
            };
        }
        //? }
    } else
        throw new TypeError("Unsupported metrics: "+metrics);
};
//? if (ALIASES) {

/**
 * Reads an UTF8 encoded string. This is an alias of {@link ByteBuffer#readUTF8String}.
 * @function
 * @param {number} length Number of characters or bytes to read
 * @param {number=} metrics Metrics specifying what `n` is meant to count. Defaults to
 *  {@link ByteBuffer.METRICS_CHARS}.
 * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
 *  read if omitted.
 * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
 *  read and the actual number of bytes read.
 * @expose
 */
ByteBuffer.prototype.readString = ByteBuffer.prototype.readUTF8String;
//? }

//? }