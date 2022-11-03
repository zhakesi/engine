import { getSpineSpineWasmUtil } from './instantiated';
import { SpineWasmUtil } from './spine-wasm-util';

export class SkeletonWasmObject {
    constructor () {
        this._wasmUtil = getSpineSpineWasmUtil();
        this._objID = this._wasmUtil.createSkeletonObject();
    }
    public initSkeletonData (str:string) {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(str);
        console.log(encoded);
        const length = encoded.length;
        const local = this._wasmUtil.queryMemory(length);
        const memBuffer = new Uint8Array(this._wasmUtil.memory.buffer);
        console.log(memBuffer[local + 3]);
        const bytes = new Uint8Array(memBuffer, local, length);
        bytes.set(encoded);
        const res = this._wasmUtil.setSkeletonData(this._objID, bytes, length);
        console.log(`xxx-${res}`);
    }
    private _objID: number;
    private _wasmUtil: SpineWasmUtil;
}
