import { SkeletonData } from '../skeleton-data';
import { getSpineSpineWasmUtil, WasmHEAPU8 } from './instantiated';
import { SpineWasmUtil } from './spine-wasm-util';
import { FileResourceInstance } from './file-resource';

export class SkeletonWasmObject {
    constructor () {
        this._wasmUtil = getSpineSpineWasmUtil();
        this._wasmHEAPU8 = new Uint8Array(this._wasmUtil.memory.buffer);
        //this._wasmHEAPU8 = WasmHEAPU8();
        this._objID = this._wasmUtil.createSkeletonObject();
    }
    public initSkeletonData (data: SkeletonData) {
        const name = data.name;
        const altasName = `${name}.atlas`;
        const jsonName = `${name}.json`;
        const fileInst = FileResourceInstance();
        fileInst.AddToFileList(altasName, data.atlasText);
        fileInst.AddToFileList(jsonName, data.skeletonJsonStr);

        const encoder = new TextEncoder();
        const encoded = encoder.encode(name);
        const length = encoded.length;

        const local = this._wasmUtil.queryMemory(length);
        const array = this._wasmHEAPU8.subarray(local, local + length);
        array.set(encoded);

        this._wasmUtil.setSkeletonData(this._objID, local, length);
    }
    // public initSkeletonData (name : string) {
    //     const encoder = new TextEncoder();
    //     const encoded = encoder.encode(name);
    //     const length = encoded.length;

    //     const local = this._wasmUtil.queryMemory(length);
    //     const array = this._wasmHEAPU8.subarray(local, local + length);
    //     array.set(encoded);

    //     this._wasmUtil.testFunction(this._objID, local, length);
    // }

    public testFunc () {
        // const str = 'alien-pro';
        // const encoder = new TextEncoder();
        // const encoded = encoder.encode(str);
        // const length = encoded.length;

        // const local = this._wasmUtil.queryMemory(length);
        // const array = this._wasmHEAPU8.subarray(local, local + length);
        // array.set(encoded);

        // this._wasmUtil.testFunction(this._objID, local, length);
    }

    private _objID: number;
    private _wasmUtil: SpineWasmUtil;
    private _wasmHEAPU8: Uint8Array = new Uint8Array(0);
}
