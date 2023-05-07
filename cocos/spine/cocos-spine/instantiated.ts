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
import { JsReadFile } from './js-file-util.js';

/**
 * @engineInternal
 */
export interface SpineWasmInterface {
    spineWasmInstanceInit(): number;
    spineWasmInstanceDestroy(): number;
    queryStoreMemory(): number;
    createSkeletonObject (): number;
    setSkeletonData(objID: number, datPtr: number);
    setAnimation(objID: number, length: number, trackIndex: number, loop: boolean): boolean;
    clearTrack(objID: number, trackIndex: number): boolean;
    clearTracks(objID: number): boolean;
    setToSetupPose(objID: number): boolean;
    setTimeScale(objID: number, timeScale: number): number;
    setSkin(objID: number, length: number): number;
    updateAnimation(objID: number, dltTime: number): number;
    setMix(objID: number, start: number, fromLength: number, toLength: number, duration: number);
    updateRenderData(objID: number): number;
    getDrawOrderSize(objID: number): number;
    getSlotNameByOrder(objID: number, index: number): number;
    getBoneMatrix(objID: number, index: number): number;
    queryMemory(size: number): number;
    freeMemory(data: Uint8Array);
    setDefaultScale(objID: number, scale: number): boolean;
    setVertexEffect(objID: number, effect: number, effectType: number);
    setPremultipliedAlpha(objID: number, premultipliedAlpha: boolean);
    setColor(objID: number, r: number, g: number, b: number, a: number);
    destroyInstance(objID: number);

    retainSkeletonDataByUUID(length: number): number;
    initSkeletonData(length: number, isJosn: boolean): number;
    recordSkeletonDataUUID(length: number, datPtr: number);

    createJitterVertexEffect(x: number, y: number): number;
    updateJitterParameters(handle: number, x: number, y: number);
    createSwirlVertexEffect(radius: number, power: number, usePowerOut: boolean): number;
    updateSwirlParameters(handle: number, centerX: number, centerY: number, radius: number, angle: number);

    memory: any;
}

/**
 * @engineInternal
 */
export class FileResource {
    private fileList = new Map<string, Uint8Array>();
    public addTextRes (name: string, data: string) {
        const encoder = new TextEncoder();
        const array = encoder.encode(data);
        this.fileList.set(name, array);
    }
    public addRawRes (name: string, data: Uint8Array) {
        const encoder = new TextEncoder();
        this.fileList.set(name, data);
    }

    public RequireFileBuffer (name: string): Uint8Array {
        if (!this.fileList.has(name)) return new Uint8Array(0);
        const array = this.fileList.get(name);
        return array!;
    }
}
/**
 * @engineInternal
 */
export const wasmResourceInstance = new FileResource();

let _wasmUtil: SpineWasmInterface = null!;
let _HEAPU8: Uint8Array = null!;

function assert (condition, text) {
    if (!condition) {
        console.error(`Assertion failed${text ? `: ${text}` : ''}`);
    }
}

function _reportError () {
    console.error('invalid operation');
}

function _assert_fail () {
    console.error('_assert_fail');
}

function _emscripten_memcpy_big (dest, src, num) {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    _HEAPU8.copyWithin(dest, src, src + num);
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
    const source = _HEAPU8.subarray(start, start + length);
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
    const source = _HEAPU8.subarray(start, start + length);
    const filePath = decoder.decode(source);
    const arrayData = wasmResourceInstance.RequireFileBuffer(filePath);
    const dataSize = arrayData.length;
    const address = _wasmUtil.queryStoreMemory();
    const storeArray = _HEAPU8.subarray(address, address + dataSize);
    storeArray.set(arrayData);
    return dataSize;
}

const asmLibraryArg = {
    __assert_fail: _assert_fail,
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
    _HEAPU8 = new Uint8Array(wasmMemory.buffer);
    _wasmUtil = exports as unknown as SpineWasmInterface;
}

function receiveInstantiationResult (result) {
    receiveInstance(result.instance);
    _wasmUtil.spineWasmInstanceInit();
}

/**
 * @engineInternal
 */
export function getSpineSpineWasmInstance () {
    return _wasmUtil;
}

let _promiseLoadSpineWasm;

if (EDITOR) {
    _promiseLoadSpineWasm = async function promiseLoadSpineWasmEditor () {
        const spineWasmUrl = 'E:/Cocos/cocos-editor/resources/3d/engine/cocos/spine/cocos-spine/spine.wasm';
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
    _promiseLoadSpineWasm = async function promiseLoadSpineWasmRuntime () {
        const spineWasmUrl = 'scripting/engine/cocos/spine/cocos-spine/spine.wasm';
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
    _promiseLoadSpineWasm();
}
