let spineWasm;
(function (spineWasm) {
    spineWasm = spineWasm || {};
    const Module = typeof spineWasm !== 'undefined' ? spineWasm : {};

    let readBinary;

    const out = console.log.bind(console);
    const err = console.warn.bind(console);

    const STACK_ALIGN = 16;
    const POINTER_SIZE = 4;

    function getNativeTypeSize (type) {
        switch (type) {
        case 'i1': case 'i8': case 'u8': return 1;
        case 'i16': case 'u16': return 2;
        case 'i32': case 'u32': return 4;
        case 'i64': case 'u64': return 8;
        case 'float': return 4;
        case 'double': return 8;
        default: {
            if (type[type.length - 1] === '*') {
                return POINTER_SIZE;
            }
            if (type[0] === 'i') {
                const bits = Number(type.substr(1));
                assert(bits % 8 === 0, `getNativeTypeSize invalid bits ${bits}, type ${type}`);
                return bits / 8;
            }
            return 0;
        }
        }
    }

    let wasmMemory;

    let ABORT = false;

    /** @type {function(*, string=)} */
    function assert (condition, text) {
        if (!condition) {
            abort(`Assertion failed${text ? `: ${text}` : ''}`);
        }
    }

    // We used to include malloc/free by default in the past. Show a helpful error in
    // builds with assertions.
    function _malloc () {
        abort('malloc() called but not included in the build - add \'_malloc\' to EXPORTED_FUNCTIONS');
    }
    function _free () {
        // Show a helpful error since we used to include free by default in the past.
        abort('free() called but not included in the build - add \'_free\' to EXPORTED_FUNCTIONS');
    }

    // include: runtime_strings.js

    // runtime_strings.js: Strings related runtime functions that are part of both MINIMAL_RUNTIME and regular runtime.

    const UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined;

    // Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
    // a copy of that string as a Javascript String object.
    /**
   * heapOrArray is either a regular array, or a JavaScript typed array view.
   * @param {number} idx
   * @param {number=} maxBytesToRead
   * @return {string}
   */
    function UTF8ArrayToString (heapOrArray, idx, maxBytesToRead) {
        const endIdx = idx + maxBytesToRead;
        let endPtr = idx;
        // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
        // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
        // (As a tiny code save trick, compare endPtr against endIdx using a negation, so that undefined means Infinity)
        while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;

        if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
            return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
        }
        let str = '';
        // If building with TextDecoder, we have already computed the string length above, so test loop end condition against that
        while (idx < endPtr) {
            // For UTF8 byte structure, see:
            // http://en.wikipedia.org/wiki/UTF-8#Description
            // https://www.ietf.org/rfc/rfc2279.txt
            // https://tools.ietf.org/html/rfc3629
            let u0 = heapOrArray[idx++];
            if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
            const u1 = heapOrArray[idx++] & 63;
            if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
            const u2 = heapOrArray[idx++] & 63;
            if ((u0 & 0xF0) == 0xE0) {
                u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
            } else {
                if ((u0 & 0xF8) != 0xF0) warnOnce(`Invalid UTF-8 leading byte 0x${u0.toString(16)} encountered when deserializing a UTF-8 string in wasm memory to a JS string!`);
                u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
            }

            if (u0 < 0x10000) {
                str += String.fromCharCode(u0);
            } else {
                const ch = u0 - 0x10000;
                str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
            }
        }
        return str;
    }

    // Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns a
    // copy of that string as a Javascript String object.
    // maxBytesToRead: an optional length that specifies the maximum number of bytes to read. You can omit
    //                 this parameter to scan the string until the first \0 byte. If maxBytesToRead is
    //                 passed, and the string at [ptr, ptr+maxBytesToReadr[ contains a null byte in the
    //                 middle, then the string will cut short at that byte index (i.e. maxBytesToRead will
    //                 not produce a string of exact length [ptr, ptr+maxBytesToRead[)
    //                 N.B. mixing frequent uses of UTF8ToString() with and without maxBytesToRead may
    //                 throw JS JIT optimizations off, so it is worth to consider consistently using one
    //                 style or the other.
    /**
   * @param {number} ptr
   * @param {number=} maxBytesToRead
   * @return {string}
   */
    function UTF8ToString (ptr, maxBytesToRead) {
        return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
    }

    // Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
    // encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
    // Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
    // Parameters:
    //   str: the Javascript string to copy.
    //   heap: the array to copy to. Each index in this array is assumed to be one 8-byte element.
    //   outIdx: The starting offset in the array to begin the copying.
    //   maxBytesToWrite: The maximum number of bytes this function can write to the array.
    //                    This count should include the null terminator,
    //                    i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
    //                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
    // Returns the number of bytes written, EXCLUDING the null terminator.

    function stringToUTF8Array (str, heap, outIdx, maxBytesToWrite) {
        if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
        { return 0; }

        const startIdx = outIdx;
        const endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
        for (let i = 0; i < str.length; ++i) {
            // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
            // See http://unicode.org/faq/utf_bom.html#utf16-3
            // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
            let u = str.charCodeAt(i); // possibly a lead surrogate
            if (u >= 0xD800 && u <= 0xDFFF) {
                const u1 = str.charCodeAt(++i);
                u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
            }
            if (u <= 0x7F) {
                if (outIdx >= endIdx) break;
                heap[outIdx++] = u;
            } else if (u <= 0x7FF) {
                if (outIdx + 1 >= endIdx) break;
                heap[outIdx++] = 0xC0 | (u >> 6);
                heap[outIdx++] = 0x80 | (u & 63);
            } else if (u <= 0xFFFF) {
                if (outIdx + 2 >= endIdx) break;
                heap[outIdx++] = 0xE0 | (u >> 12);
                heap[outIdx++] = 0x80 | ((u >> 6) & 63);
                heap[outIdx++] = 0x80 | (u & 63);
            } else {
                if (outIdx + 3 >= endIdx) break;
                if (u > 0x10FFFF) warnOnce(`Invalid Unicode code point 0x${u.toString(16)} encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).`);
                heap[outIdx++] = 0xF0 | (u >> 18);
                heap[outIdx++] = 0x80 | ((u >> 12) & 63);
                heap[outIdx++] = 0x80 | ((u >> 6) & 63);
                heap[outIdx++] = 0x80 | (u & 63);
            }
        }
        // Null-terminate the pointer to the buffer.
        heap[outIdx] = 0;
        return outIdx - startIdx;
    }

    // Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
    // null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
    // Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
    // Returns the number of bytes written, EXCLUDING the null terminator.

    function stringToUTF8 (str, outPtr, maxBytesToWrite) {
        assert(typeof maxBytesToWrite === 'number', 'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
        return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    }

    // Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.
    function lengthBytesUTF8 (str) {
        let len = 0;
        for (let i = 0; i < str.length; ++i) {
            // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
            // See http://unicode.org/faq/utf_bom.html#utf16-3
            const c = str.charCodeAt(i); // possibly a lead surrogate
            if (c <= 0x7F) {
                len++;
            } else if (c <= 0x7FF) {
                len += 2;
            } else if (c >= 0xD800 && c <= 0xDFFF) {
                len += 4; ++i;
            } else {
                len += 3;
            }
        }
        return len;
    }

    // end include: runtime_strings.js
    // Memory management

    let HEAP;
    /** @type {!ArrayBuffer} */
    let buffer;
    /** @type {!Int8Array} */
    let HEAP8;
    /** @type {!Uint8Array} */
    let HEAPU8;
    /** @type {!Int16Array} */
    let HEAP16;
    /** @type {!Uint16Array} */
    let HEAPU16;
    /** @type {!Int32Array} */
    let HEAP32;
    /** @type {!Uint32Array} */
    let HEAPU32;
    /** @type {!Float32Array} */
    let HEAPF32;
    /** @type {!Float64Array} */
    let HEAPF64;

    function updateGlobalBufferAndViews (buf) {
        buffer = buf;
        Module.HEAP8 = HEAP8 = new Int8Array(buf);
        Module.HEAP16 = HEAP16 = new Int16Array(buf);
        Module.HEAP32 = HEAP32 = new Int32Array(buf);
        Module.HEAPU8 = HEAPU8 = new Uint8Array(buf);
        Module.HEAPU16 = HEAPU16 = new Uint16Array(buf);
        Module.HEAPU32 = HEAPU32 = new Uint32Array(buf);
        Module.HEAPF32 = HEAPF32 = new Float32Array(buf);
        Module.HEAPF64 = HEAPF64 = new Float64Array(buf);
    }

    const TOTAL_STACK = 5242880;
    if (Module.TOTAL_STACK) assert(TOTAL_STACK === Module.TOTAL_STACK, 'the stack size can no longer be determined at runtime');

    const INITIAL_MEMORY = Module.INITIAL_MEMORY || 16777216; legacyModuleProp('INITIAL_MEMORY', 'INITIAL_MEMORY');

    assert(INITIAL_MEMORY >= TOTAL_STACK, `INITIAL_MEMORY should be larger than TOTAL_STACK, was ${INITIAL_MEMORY}! (TOTAL_STACK=${TOTAL_STACK})`);

    // check for full engine support (use string 'subarray' to avoid closure compiler confusion)
    assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && Int32Array.prototype.subarray != undefined && Int32Array.prototype.set != undefined,
        'JS engine does not provide full typed array support');

    // If memory is defined in wasm, the user can't provide it.
    assert(!Module.wasmMemory, 'Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally');
    assert(INITIAL_MEMORY == 16777216, 'Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically');

    // include: runtime_init_table.js
    // In regular non-RELOCATABLE mode the table is exported
    // from the wasm module and this will be assigned once
    // the exports are available.
    let wasmTable;

    // end include: runtime_init_table.js
    // include: runtime_stack_check.js

    // Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
    function writeStackCookie () {
        const max = _emscripten_stack_get_end();
        assert((max & 3) == 0);
        // The stack grow downwards towards _emscripten_stack_get_end.
        // We write cookies to the final two words in the stack and detect if they are
        // ever overwritten.
        HEAPU32[((max) >> 2)] = 0x2135467;
        HEAPU32[(((max) + (4)) >> 2)] = 0x89BACDFE;
        // Also test the global address 0 for integrity.
        HEAPU32[0] = 0x63736d65; /* 'emsc' */
    }

    function checkStackCookie () {
        if (ABORT) return;
        const max = _emscripten_stack_get_end();
        const cookie1 = HEAPU32[((max) >> 2)];
        const cookie2 = HEAPU32[(((max) + (4)) >> 2)];
        if (cookie1 != 0x2135467 || cookie2 != 0x89BACDFE) {
            abort(`Stack overflow! Stack cookie has been overwritten at 0x${max.toString(16)}, expected hex dwords 0x89BACDFE and 0x2135467, but received 0x${cookie2.toString(16)} 0x${cookie1.toString(16)}`);
        }
        // Also test the global address 0 for integrity.
        if (HEAPU32[0] !== 0x63736d65 /* 'emsc' */) abort('Runtime error: The application has corrupted its heap memory area (address zero)!');
    }

    // end include: runtime_stack_check.js
    // include: runtime_assertions.js

    // Endianness check
    (function () {
        const h16 = new Int16Array(1);
        const h8 = new Int8Array(h16.buffer);
        h16[0] = 0x6373;
        if (h8[0] !== 0x73 || h8[1] !== 0x63) throw 'Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)';
    }());

    // end include: runtime_assertions.js
    const __ATPRERUN__  = []; // functions called before the runtime is initialized
    const __ATINIT__    = []; // functions called during startup
    const __ATEXIT__    = []; // functions called during shutdown
    const __ATPOSTRUN__ = []; // functions called after the main() is called

    let runtimeInitialized = false;

    function keepRuntimeAlive () {
        return noExitRuntime;
    }

    function initRuntime () {
        assert(!runtimeInitialized);
        runtimeInitialized = true;

        checkStackCookie();

        callRuntimeCallbacks(__ATINIT__);
    }

    function postRun () {
        checkStackCookie();

        if (Module.postRun) {
            if (typeof Module.postRun === 'function') Module.postRun = [Module.postRun];
            while (Module.postRun.length) {
                addOnPostRun(Module.postRun.shift());
            }
        }

        callRuntimeCallbacks(__ATPOSTRUN__);
    }

    function addOnPreRun (cb) {
        __ATPRERUN__.unshift(cb);
    }

    function addOnInit (cb) {
        __ATINIT__.unshift(cb);
    }

    function addOnExit (cb) {
    }

    function addOnPostRun (cb) {
        __ATPOSTRUN__.unshift(cb);
    }

    // include: runtime_math.js

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

    assert(Math.imul, 'This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
    assert(Math.fround, 'This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
    assert(Math.clz32, 'This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
    assert(Math.trunc, 'This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');

    // end include: runtime_math.js
    // A counter of dependencies for calling run(). If we need to
    // do asynchronous work before running, increment this and
    // decrement it. Incrementing must happen in a place like
    // Module.preRun (used by emcc to add file preloading).
    // Note that you can add dependencies in preRun, even though
    // it happens right before run - run will be postponed until
    // the dependencies are met.
    let runDependencies = 0;
    let runDependencyWatcher = null;
    let dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
    const runDependencyTracking = {};

    function getUniqueRunDependency (id) {
        const orig = id;
        while (1) {
            if (!runDependencyTracking[id]) return id;
            id = orig + Math.random();
        }
    }

    function addRunDependency (id) {
        runDependencies++;

        if (Module.monitorRunDependencies) {
            Module.monitorRunDependencies(runDependencies);
        }

        if (id) {
            assert(!runDependencyTracking[id]);
            runDependencyTracking[id] = 1;
            if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
                // Check for missing dependencies every few seconds
                runDependencyWatcher = setInterval(() => {
                    if (ABORT) {
                        clearInterval(runDependencyWatcher);
                        runDependencyWatcher = null;
                        return;
                    }
                    let shown = false;
                    for (const dep in runDependencyTracking) {
                        if (!shown) {
                            shown = true;
                            err('still waiting on run dependencies:');
                        }
                        err(`dependency: ${dep}`);
                    }
                    if (shown) {
                        err('(end of list)');
                    }
                }, 10000);
            }
        } else {
            err('warning: run dependency added without ID');
        }
    }

    function removeRunDependency (id) {
        runDependencies--;

        if (Module.monitorRunDependencies) {
            Module.monitorRunDependencies(runDependencies);
        }

        if (id) {
            assert(runDependencyTracking[id]);
            delete runDependencyTracking[id];
        } else {
            err('warning: run dependency removed without ID');
        }
        if (runDependencies == 0) {
            if (runDependencyWatcher !== null) {
                clearInterval(runDependencyWatcher);
                runDependencyWatcher = null;
            }
            if (dependenciesFulfilled) {
                const callback = dependenciesFulfilled;
                dependenciesFulfilled = null;
                callback(); // can add another dependenciesFulfilled
            }
        }
    }

    /** @param {string|number=} what */
    function abort (what) {
        {
            if (Module.onAbort) {
                Module.onAbort(what);
            }
        }

        what = `Aborted(${what})`;
        // TODO(sbc): Should we remove printing and leave it up to whoever
        // catches the exception?
        err(what);

        ABORT = true;
        EXITSTATUS = 1;

        // Use a wasm runtime error, because a JS error might be seen as a foreign
        // exception, which means we'd run destructors on it. We need the error to
        // simply make the program stop.
        // FIXME This approach does not work in Wasm EH because it currently does not assume
        // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
        // a trap or not based on a hidden field within the object. So at the moment
        // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
        // allows this in the wasm spec.

        // Suppress closure compiler warning here. Closure compiler's builtin extern
        // defintion for WebAssembly.RuntimeError claims it takes no arguments even
        // though it can.
        // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
        /** @suppress {checkTypes} */
        const e = new WebAssembly.RuntimeError(what);

        readyPromiseReject(e);
        // Throw the error whether or not MODULARIZE is set because abort is used
        // in code paths apart from instantiation where an exception is expected
        // to be thrown when abort is called.
        throw e;
    }

    // {{MEM_INITIALIZER}}

    // include: memoryprofiler.js

    // end include: memoryprofiler.js
    // show errors on likely calls to FS when it was not included
    var FS = {
        error () {
            abort('Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM');
        },
        init () { FS.error(); },
        createDataFile () { FS.error(); },
        createPreloadedFile () { FS.error(); },
        createLazyFile () { FS.error(); },
        open () { FS.error(); },
        mkdev () { FS.error(); },
        registerDevice () { FS.error(); },
        analyzePath () { FS.error(); },
        loadFilesFromDB () { FS.error(); },

        ErrnoError: function ErrnoError () { FS.error(); },
    };
    Module.FS_createDataFile = FS.createDataFile;
    Module.FS_createPreloadedFile = FS.createPreloadedFile;

    // include: URIUtils.js

    // Prefix of data URIs emitted by SINGLE_FILE and related options.
    const dataURIPrefix = 'data:application/octet-stream;base64,';

    // Indicates whether filename is a base64 data URI.
    function isDataURI (filename) {
        // Prefix of data URIs emitted by SINGLE_FILE and related options.
        return filename.startsWith(dataURIPrefix);
    }

    // Indicates whether filename is delivered via file protocol (as opposed to http/https)
    function isFileURI (filename) {
        return filename.startsWith('file://');
    }

    // end include: URIUtils.js
    /** @param {boolean=} fixedasm */
    function createExportWrapper (name, fixedasm) {
        return function () {
            const displayName = name;
            let asm = fixedasm;
            if (!fixedasm) {
                asm = Module.asm;
            }
            assert(runtimeInitialized, `native function \`${displayName}\` called before runtime initialization`);
            if (!asm[name]) {
                assert(asm[name], `exported native function \`${displayName}\` not found`);
            }
            return asm[name].apply(null, arguments);
        };
    }

    const wasmBinaryFile = 'spine2d.wasm';

    // Create the wasm instance.
    // Receives the wasm imports, returns the exports.
    function createWasm () {
        // prepare imports
        const info = {
            env: asmLibraryArg,
            wasi_snapshot_preview1: asmLibraryArg,
        };
        // Load the wasm module and create an instance of using native support in the JS engine.
        // handle a generated wasm instance, receiving its exports and
        // performing other necessary setup
        /** @param {WebAssembly.Module=} module*/
        function receiveInstance (instance, module) {
            const exports = instance.exports;

            Module.asm = exports;

            wasmMemory = Module.asm.memory;
            assert(wasmMemory, 'memory not found in wasm exports');
            // This assertion doesn't hold when emscripten is run in --post-link
            // mode.
            // TODO(sbc): Read INITIAL_MEMORY out of the wasm file in post-link mode.
            //assert(wasmMemory.buffer.byteLength === 16777216);
            updateGlobalBufferAndViews(wasmMemory.buffer);

            wasmTable = Module.asm.__indirect_function_table;
            assert(wasmTable, 'table not found in wasm exports');

            addOnInit(Module.asm.__wasm_call_ctors);

            removeRunDependency('wasm-instantiate');
        }
        // we can't run yet (except in a pthread, where we have a custom sync instantiator)
        addRunDependency('wasm-instantiate');

        function receiveInstantiationResult (result) {
            receiveInstance(result.instance);
        }

        function instantiateAsync () {
            return fetch(wasmBinaryFile).then((response) => {
                const result = WebAssembly.instantiateStreaming(response, info);
                return result.then(
                    receiveInstantiationResult,
                    (reason) => {
                        err(`wasm streaming compile failed: ${reason}`);
                    },
                );
            });
        }

        instantiateAsync();
    }

    // Globals used by JS i64 conversions (see makeSetValue)
    let tempDouble;
    let tempI64;

    // === Body ===

    const ASM_CONSTS = {

    };

    /** @constructor */
    function ExitStatus (status) {
        this.name = 'ExitStatus';
        this.message = `Program terminated with exit(${status})`;
        this.status = status;
    }

    function callRuntimeCallbacks (callbacks) {
        while (callbacks.length > 0) {
            // Pass the module as the first argument.
            callbacks.shift()(Module);
        }
    }

    /**
       * @param {number} ptr
       * @param {string} type
       */
    function getValue (ptr, type = 'i8') {
        if (type.endsWith('*')) type = '*';
        switch (type) {
        case 'i1': return HEAP8[((ptr) >> 0)];
        case 'i8': return HEAP8[((ptr) >> 0)];
        case 'i16': return HEAP16[((ptr) >> 1)];
        case 'i32': return HEAP32[((ptr) >> 2)];
        case 'i64': return HEAP32[((ptr) >> 2)];
        case 'float': return HEAPF32[((ptr) >> 2)];
        case 'double': return HEAPF64[((ptr) >> 3)];
        case '*': return HEAPU32[((ptr) >> 2)];
        default: abort(`invalid type for getValue: ${type}`);
        }
        return null;
    }

    /**
       * @param {number} ptr
       * @param {number} value
       * @param {string} type
       */
    function setValue (ptr, value, type = 'i8') {
        if (type.endsWith('*')) type = '*';
        switch (type) {
        case 'i1': HEAP8[((ptr) >> 0)] = value; break;
        case 'i8': HEAP8[((ptr) >> 0)] = value; break;
        case 'i16': HEAP16[((ptr) >> 1)] = value; break;
        case 'i32': HEAP32[((ptr) >> 2)] = value; break;
        case 'i64': (tempI64 = [value >>> 0, (tempDouble = value, (+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble) / 4294967296.0))), 4294967295.0)) | 0) >>> 0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble))) >>> 0)) / 4294967296.0))))) >>> 0) : 0)], HEAP32[((ptr) >> 2)] = tempI64[0], HEAP32[(((ptr) + (4)) >> 2)] = tempI64[1]); break;
        case 'float': HEAPF32[((ptr) >> 2)] = value; break;
        case 'double': HEAPF64[((ptr) >> 3)] = value; break;
        case '*': HEAPU32[((ptr) >> 2)] = value; break;
        default: abort(`invalid type for setValue: ${type}`);
        }
    }

    function warnOnce (text) {
        if (!warnOnce.shown) warnOnce.shown = {};
        if (!warnOnce.shown[text]) {
            warnOnce.shown[text] = 1;
            err(text);
        }
    }

    function _abort () {
        abort('native code called abort()');
    }

    function _emscripten_memcpy_big (dest, src, num) {
        HEAPU8.copyWithin(dest, src, src + num);
    }

    function getHeapMax () {
        // Stay one Wasm page short of 4GB: while e.g. Chrome is able to allocate
        // full 4GB Wasm memories, the size will wrap back to 0 bytes in Wasm side
        // for any code that deals with heap sizes, which would require special
        // casing all heap size related code to treat 0 specially.
        return 2147483648;
    }

    function emscripten_realloc_buffer (size) {
        try {
            // round size grow request up to wasm page size (fixed 64KB per spec)
            wasmMemory.grow((size - buffer.byteLength + 65535) >>> 16); // .grow() takes a delta compared to the previous size
            updateGlobalBufferAndViews(wasmMemory.buffer);
            return 1;
        } catch (e) {
            err(`emscripten_realloc_buffer: Attempted to grow heap from ${buffer.byteLength} bytes to ${size} bytes, but got error: ${e}`);
        }
        return 0;
    }

    function _emscripten_resize_heap (requestedSize) {
        const oldSize = HEAPU8.length;
        requestedSize >>>= 0;
        // With multithreaded builds, races can happen (another thread might increase the size
        // in between), so return a failure, and let the caller retry.
        assert(requestedSize > oldSize);

        // A limit is set for how much we can grow. We should not exceed that
        // (the wasm binary specifies it, so if we tried, we'd fail anyhow).
        const maxHeapSize = getHeapMax();
        if (requestedSize > maxHeapSize) {
            err(`Cannot enlarge memory, asked to go up to ${requestedSize} bytes, but the limit is ${maxHeapSize} bytes!`);
            return false;
        }

        const alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;

        // Loop through potential heap size increases. If we attempt a too eager
        // reservation that fails, cut down on the attempted size and reserve a
        // smaller bump instead. (max 3 times, chosen somewhat arbitrarily)
        for (let cutDown = 1; cutDown <= 4; cutDown *= 2) {
            let overGrownHeapSize = oldSize * (1 + 0.2 / cutDown); // ensure geometric growth
            // but limit overreserving (default to capping at +96MB overgrowth at most)
            overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);

            var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));

            const replacement = emscripten_realloc_buffer(newSize);
            if (replacement) {
                return true;
            }
        }
        err(`Failed to grow the heap from ${oldSize} bytes to ${newSize} bytes, not enough memory!`);
        return false;
    }

    var SYSCALLS = { varargs: undefined,
        get () {
            assert(SYSCALLS.varargs != undefined);
            SYSCALLS.varargs += 4;
            const ret = HEAP32[(((SYSCALLS.varargs) - (4)) >> 2)];
            return ret;
        },
        getStr (ptr) {
            const ret = UTF8ToString(ptr);
            return ret;
        } };
    function _fd_close (fd) {
        abort('fd_close called without SYSCALLS_REQUIRE_FILESYSTEM');
    }

    function convertI32PairToI53Checked (lo, hi) {
        assert(lo == (lo >>> 0) || lo == (lo | 0)); // lo should either be a i32 or a u32
        assert(hi === (hi | 0));                    // hi should be a i32
        return ((hi + 0x200000) >>> 0 < 0x400001 - !!lo) ? (lo >>> 0) + hi * 4294967296 : NaN;
    }
    function _fd_seek (fd, offset_low, offset_high, whence, newOffset) {
        return 70;
    }

    const printCharBuffers = [null, [], []];
    function printChar (stream, curr) {
        const buffer = printCharBuffers[stream];
        assert(buffer);
        if (curr === 0 || curr === 10) {
            (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
            buffer.length = 0;
        } else {
            buffer.push(curr);
        }
    }
    function _fd_write (fd, iov, iovcnt, pnum) {
        // hack to support printf in SYSCALLS_REQUIRE_FILESYSTEM=0
        let num = 0;
        for (let i = 0; i < iovcnt; i++) {
            const ptr = HEAPU32[((iov) >> 2)];
            const len = HEAPU32[(((iov) + (4)) >> 2)];
            iov += 8;
            for (let j = 0; j < len; j++) {
                printChar(fd, HEAPU8[ptr + j]);
            }
            num += len;
        }
        HEAPU32[((pnum) >> 2)] = num;
        return 0;
    }

    // eslint-disable-next-line vars-on-top
    var asmLibraryArg = {
        abort: _abort,
        emscripten_memcpy_big: _emscripten_memcpy_big,
        emscripten_resize_heap: _emscripten_resize_heap,
        fd_close: _fd_close,
        fd_seek: _fd_seek,
        fd_write: _fd_write,
    };
    const asm = createWasm();
    /** @type {function(...*):?} */
    const ___wasm_call_ctors = Module.___wasm_call_ctors = createExportWrapper('__wasm_call_ctors');

    /** @type {function(...*):?} */
    const _add = Module._add = createExportWrapper('add');

    /** @type {function(...*):?} */
    const ___errno_location = Module.___errno_location = createExportWrapper('__errno_location');

    /** @type {function(...*):?} */
    const _fflush = Module._fflush = createExportWrapper('fflush');

    /** @type {function(...*):?} */
    var _emscripten_stack_init = Module._emscripten_stack_init = function () {
        return (_emscripten_stack_init = Module._emscripten_stack_init = Module.asm.emscripten_stack_init).apply(null, arguments);
    };

    /** @type {function(...*):?} */
    var _emscripten_stack_get_free = Module._emscripten_stack_get_free = function () {
        return (_emscripten_stack_get_free = Module._emscripten_stack_get_free = Module.asm.emscripten_stack_get_free).apply(null, arguments);
    };

    /** @type {function(...*):?} */
    var _emscripten_stack_get_base = Module._emscripten_stack_get_base = function () {
        return (_emscripten_stack_get_base = Module._emscripten_stack_get_base = Module.asm.emscripten_stack_get_base).apply(null, arguments);
    };

    /** @type {function(...*):?} */
    var _emscripten_stack_get_end = Module._emscripten_stack_get_end = function () {
        return (_emscripten_stack_get_end = Module._emscripten_stack_get_end = Module.asm.emscripten_stack_get_end).apply(null, arguments);
    };

    // === Auto-generated postamble setup entry stuff ===
}(spineWasm || (spineWasm = {})));
export default spineWasm;
