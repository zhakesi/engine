/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-void */
/*
 Copyright (c) 2022 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
 worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
 not use Cocos Creator software for developing other software or tools that's
 used for developing games. You are not granted to publish, distribute,
 sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

import { SpineWasmUtil } from './spine-wasm-util';

const spineWasmUrl = 'scripting/engine/cocos/spine/spine-2d/spine2d.wasm';

const err = console.warn.bind(console);
function assert (condition, text) {
    if (!condition) {
        console.error(`Assertion failed${text ? `: ${text}` : ''}`);
    }
}

let wasmUtil:SpineWasmUtil;

function _console_error_report (message) {
    console.log(message);
}

let wasmMemory;
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
    HEAP8 = new Int8Array(buf);
    HEAP16 = new Int16Array(buf);
    HEAP32 = new Int32Array(buf);
    HEAPU8 = new Uint8Array(buf);
    HEAPU16 = new Uint16Array(buf);
    HEAPU32 = new Uint32Array(buf);
    HEAPF32 = new Float32Array(buf);
    HEAPF64 = new Float64Array(buf);
}

function reportLog () {
    console.log('xxx');
}
function _emscripten_memcpy_big (dest, src, num) {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
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
    assert(requestedSize > oldSize, 'no need resize_heap');

    // A limit is set for how much we can grow. We should not exceed that
    // (the wasm binary specifies it, so if we tried, we'd fail anyhow).
    const maxHeapSize = getHeapMax();
    if (requestedSize > maxHeapSize) {
        err(`Cannot enlarge memory, asked to go up to ${requestedSize} bytes, but the limit is ${maxHeapSize} bytes!`);
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-return
    const alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;

    // Loop through potential heap size increases. If we attempt a too eager
    // reservation that fails, cut down on the attempted size and reserve a
    // smaller bump instead. (max 3 times, chosen somewhat arbitrarily)
    for (let cutDown = 1; cutDown <= 4; cutDown *= 2) {
        let overGrownHeapSize = oldSize * (1 + 0.2 / cutDown); // ensure geometric growth
        // but limit overreserving (default to capping at +96MB overgrowth at most)
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);

        // eslint-disable-next-line vars-on-top, no-var
        var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));

        const replacement = emscripten_realloc_buffer(newSize);
        if (replacement) {
            return true;
        }
    }
    err(`Failed to grow the heap, not enough memory!`);
    return false;
}

const assemblyMemory = new WebAssembly.Memory({ initial: 256 });

const asmLibraryArg = {
    memory: assemblyMemory,
    __cxa_allocate_exception: reportLog,
    __cxa_throw: reportLog,
    abort: reportLog,
    emscripten_memcpy_big: _emscripten_memcpy_big,
    emscripten_resize_heap: _emscripten_resize_heap,
    fd_close: reportLog,
    fd_seek: reportLog,
    fd_write: reportLog,
};

function receiveInstance (instance) {
    wasmUtil = instance.exports as unknown as SpineWasmUtil;
    wasmMemory = instance.exports.memory;
    assert(wasmMemory, 'memory not found in wasm exports');
    updateGlobalBufferAndViews(wasmMemory.buffer);
}

function receiveInstantiationResult (result) {
    receiveInstance(result.instance);
}

export function promiseForSpineInstantiation () {
    const info = {
        env: asmLibraryArg,
        wasi_snapshot_preview1: asmLibraryArg,
    };

    return new Promise<void>((resolve, reject) => {
        WebAssembly.instantiateStreaming(fetch(spineWasmUrl), info).then(
            (results) => {
                receiveInstantiationResult(results);
                resolve();
            },
        );
    });
}

export function getSpineSpineWasmInterface () {
    return wasmUtil;
}
