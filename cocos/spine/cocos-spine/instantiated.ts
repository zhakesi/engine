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

import { EDITOR, JSB } from 'internal:constants';
import { SpineWasmInterface } from './spine-wasm-util';
import { FileResourceInstance } from './file-resource';
import { JsReadFile } from './jsfile.js';

let wasmUtil: SpineWasmInterface;
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

function _consoleInfo (start: number, length: number) {
    const decoder = new TextDecoder();
    const source = HEAPU8.subarray(start, start + length);
    const result = decoder.decode(source);
    console.log(result);
}
function _syscall_openat (dirfd, path, flags, varargs) {
    console.log(`syscall_openat eeror.`);
}
function _syscall_fcntl64 (fd, cmd, varargs) {
    console.log(`syscall_fcntl64 eeror.`);
}
function _syscall_ioctl (fd, op, varargs) {
    console.log(`syscall_ioctl eeror.`);
}

function _jsReadFile (start: number, length: number): number {
    const decoder = new TextDecoder();
    const source = HEAPU8.subarray(start, start + length);
    const filePath = decoder.decode(source);
    const fileResouce = FileResourceInstance();
    const arrayData = fileResouce.RequireFileBuffer(filePath);
    const dataSize = arrayData.length;
    const address = wasmUtil.queryStoreMemory();
    const storeArray = HEAPU8.subarray(address, address + dataSize);
    storeArray.set(arrayData);
    return dataSize;
}

const asmLibraryArg = {
    __assert_fail: _reportError,
    consoleInfo: _consoleInfo,
    abortOnCannotGrowMemory: _abortOnCannotGrowMemory,
    __cxa_allocate_exception: _cxa_allocate_exception,
    __cxa_throw: _cxa_throw,
    __syscall_fcntl64: _syscall_fcntl64,
    __syscall_ioctl: _syscall_ioctl,
    __syscall_openat: _syscall_openat,
    abort: _abort,
    emscripten_memcpy_big: _emscripten_memcpy_big,
    emscripten_resize_heap: _emscripten_resize_heap,
    fd_close: _reportError,
    fd_seek: _reportError,
    fd_read: _reportError,
    fd_write: _reportError,
    jsReadFile: _jsReadFile,
};

function receiveInstance (instance) {
    const wasmMemory = instance.exports.memory;
    const exports = instance.exports;
    assert(wasmMemory, 'memory not found in wasm exports');
    HEAPU8 = new Uint8Array(wasmMemory.buffer);
    wasmUtil = exports as unknown as SpineWasmInterface;
    //console.log('xxx receiveInstance');
}

function receiveInstantiationResult (result) {
    receiveInstance(result.instance);
    wasmUtil.spineWasmInstanceInit();
}

export function getSpineSpineWasmInstance () {
    return wasmUtil;
}

let promiseLoadSpineWasm;

if (EDITOR) {
    promiseLoadSpineWasm = async function promiseLoadSpineWasmEditor () {
        const spineWasmUrl = 'E:/Cocos/cocos-editor/resources/3d/engine/cocos/spine/cocos-spine/spine2d.wasm';
        const importObject = {
            env: asmLibraryArg,
            wasi_snapshot_preview1: asmLibraryArg,
        };
        const rawData = JsReadFile(spineWasmUrl);
        const promise = WebAssembly.instantiate(rawData, importObject).then(
            (results) => {
                receiveInstantiationResult(results);
            },
        );
        const result = await promise;
    };
} else {
    promiseLoadSpineWasm = async function promiseLoadSpineWasmRuntime () {
        const spineWasmUrl = 'scripting/engine/cocos/spine/cocos-spine/spine2d.wasm';
        const importObject = {
            env: asmLibraryArg,
            wasi_snapshot_preview1: asmLibraryArg,
        };

        const promise = new Promise<boolean>((resolve, reject) => {
            WebAssembly.instantiateStreaming(fetch(spineWasmUrl), importObject).then(
                (results) => {
                    receiveInstantiationResult(results);
                    resolve(true);
                },
            );
        });
        const result = await promise;
    };
}

if (!JSB) {
    promiseLoadSpineWasm();
}
