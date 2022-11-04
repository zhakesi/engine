import { getSpineSpineWasmUtil } from './instantiated';
import { SpineWasmUtil } from './spine-wasm-util';

export class SkeletonWasmObject {
    constructor () {
        this._wasmUtil = getSpineSpineWasmUtil();
        this._wasmHEAPU8 = new Uint8Array(this._wasmUtil.memory.buffer);
        this._objID = this._wasmUtil.createSkeletonObject();
    }
    public initSkeletonData (str:string) {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(str);
        const length = encoded.length;

        const local = this._wasmUtil.queryMemory(length);
        const array = this._wasmHEAPU8.subarray(local, local + length);
        array.set(encoded);

        this._wasmUtil.setSkeletonData(this._objID, local, length);
    }
    public testFunc () {
        const str = 'spineboy-pro.atlas';
        const encoder = new TextEncoder();
        const encoded = encoder.encode(str);
        const length = encoded.length;

        const local = this._wasmUtil.queryMemory(length);
        const array = this._wasmHEAPU8.subarray(local, local + length);
        array.set(encoded);

        this._wasmUtil.testFunction(this._objID, local, length);
    }

    private _objID: number;
    private _wasmUtil: SpineWasmUtil;
    private _wasmHEAPU8: Uint8Array = new Uint8Array(0);
}
