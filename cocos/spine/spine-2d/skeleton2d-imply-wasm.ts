import { SkeletonData } from '../skeleton-data';
import { getSpineSpineWasmUtil } from './instantiated';
import { SpineWasmUtil } from './spine-wasm-util';
import { FileResourceInstance } from './file-resource';
import { SKMesh } from './sk-mesh';
import { Skeleton2DImply } from './skeleton2d-imply';

const floatStride = 9;
export class Skeleton2DImplyWasm implements Skeleton2DImply {
    constructor () {
        this._wasmUtil = getSpineSpineWasmUtil();
        this._wasmHEAPU8 = new Uint8Array(this._wasmUtil.memory.buffer);
        this._objID = this._wasmUtil.createSkeletonObject();
    }
    public initSkeletonData (data: SkeletonData): boolean {
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
        return true;
    }

    public updateRenderData (): SKMesh[] {
        this._meshArray.length = 0;
        const addres = this._wasmUtil.updateRenderData(this._objID);
        let start = addres / 4;
        const heap32 = new Uint32Array(this._wasmHEAPU8.buffer);
        const meshSize = heap32[start];
        for (let i = 0; i < meshSize; i++) {
            const vc = heap32[++start];
            const ic = heap32[++start];
            const startV = heap32[++start];
            const startI = heap32[++start];
            const vertices = new Float32Array(heap32.buffer, startV, floatStride * vc);
            const indeices = new Uint16Array(heap32.buffer, startI, ic);

            const mesh = new SKMesh(vc, ic);
            mesh.vertices.set(vertices);
            mesh.indeices.set(indeices);
            this._meshArray.push(mesh);
        }
        return this._meshArray;
    }

    public setSkin (name: string): boolean {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(name);
        const length = encoded.length;

        const local = this._wasmUtil.queryMemory(length);
        const array = this._wasmHEAPU8.subarray(local, local + length);
        array.set(encoded);
        this._wasmUtil.setSkin(this._objID, local, length);
        return true;
    }

    public setAnimation (name: string): boolean {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(name);
        const length = encoded.length;

        const local = this._wasmUtil.queryMemory(length);
        const array = this._wasmHEAPU8.subarray(local, local + length);
        array.set(encoded);
        this._wasmUtil.setAnimation(this._objID, local, length);
        return true;
    }

    public updateAnimation (dltTime: number) {
        this._wasmUtil.updateAnimation(this._objID, dltTime);
    }

    private _objID: number;
    private _wasmUtil: SpineWasmUtil;
    private _wasmHEAPU8: Uint8Array = new Uint8Array(0);

    private _meshArray: SKMesh[] = [];
}
