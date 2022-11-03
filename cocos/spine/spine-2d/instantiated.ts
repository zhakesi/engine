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
let wasmUtil:SpineWasmUtil;
let wasmMemory;
let HEAPU8: Uint8Array;

function assert (condition, text) {
    if (!condition) {
        console.error(`Assertion failed${text ? `: ${text}` : ''}`);
    }
}

function _reportError () {
    console.error('invalid operation');
}

function _emscripten_memcpy_big (dest, src, num) {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    HEAPU8.copyWithin(dest, src, src + num);
}

function _emscripten_resize_heap (requestedSize) {
    console.error('no support _emscripten_resize_heap');
    return false;
}

const assemblyMemory = new WebAssembly.Memory({ initial: 256 });

function _abort (err) {
    console.error(err);
}

function _abortOnCannotGrowMemory (err) {
    console.error(`abortOnCannotGrowMemory${err}`);
}

function _cxa_throw (ptr, type, destructor) {
    console.error(`cxa_throw: throwing an exception, ${[ptr, type, destructor]}`);
}

function _cxa_allocate_exception (size) {
    console.error(`cxa_allocate_exception${size}`);
    return false; // always fail
}

const asmLibraryArg = {
    memory: assemblyMemory,
    abortOnCannotGrowMemory: _abortOnCannotGrowMemory,
    __cxa_allocate_exception: _cxa_allocate_exception,
    __cxa_throw: _cxa_throw,
    abort: _abort,
    emscripten_memcpy_big: _emscripten_memcpy_big,
    emscripten_resize_heap: _emscripten_resize_heap,
    fd_close: _reportError,
    fd_seek: _reportError,
    fd_write: _reportError,
};

function receiveInstance (instance) {
    wasmUtil = instance.exports as unknown as SpineWasmUtil;
    wasmMemory = instance.exports.memory;
    assert(wasmMemory, 'memory not found in wasm exports');
    HEAPU8 = new Uint8Array(wasmMemory.buffer);
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

export function getSpineSpineWasmUtil () {
    return wasmUtil;
}
