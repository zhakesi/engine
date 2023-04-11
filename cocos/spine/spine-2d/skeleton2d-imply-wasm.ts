import { SkeletonData } from '../skeleton-data';
import { getSpineSpineWasmInstance } from './instantiated';
import { SpineWasmInterface } from './spine-wasm-util';
import { FileResourceInstance } from './file-resource';
import { Skeleton2DMesh } from './skeleton2d-native';
import { Skeleton2DImply } from './skeleton2d-imply';
import { Mat4 } from '../../core';

const tempBoneMat = new Mat4();

const floatStride = 9;
export class Skeleton2DImplyWasm implements Skeleton2DImply {
    constructor () {
        this._wasmInstance = getSpineSpineWasmInstance();
        this._wasmHEAPU8 = new Uint8Array(this._wasmInstance.memory.buffer);
        this._objID = this._wasmInstance.createSkeletonObject();
        this._wasmInstance.setDefaultScale(this._objID, 0.01);
    }
    public initSkeletonData (data: SkeletonData): boolean {
        if (data.skeletonJson) {
            const name = data.name;
            const altasName = `${name}.atlas`;
            const jsonName = `${name}.json`;
            const fileInst = FileResourceInstance();
            fileInst.addTextRes(altasName, data.atlasText);
            fileInst.addTextRes(jsonName, data.skeletonJsonStr);
            const encoder = new TextEncoder();
            const encoded = encoder.encode(name);
            const length = encoded.length;

            const local = this._wasmInstance.queryMemory(length);
            const array = this._wasmHEAPU8.subarray(local, local + length);
            array.set(encoded);

            this._wasmInstance.setSkeletonData(this._objID, true, local, length);
        } else {
            const name = data.name;
            const altasName = `${name}.atlas`;
            const binName = `${name}.bin`;
            const fileInst = FileResourceInstance();
            fileInst.addTextRes(altasName, data.atlasText);
            fileInst.addRawRes(binName, new Uint8Array(data._nativeAsset));
            const encoder = new TextEncoder();
            const encoded = encoder.encode(name);
            const length = encoded.length;

            const local = this._wasmInstance.queryMemory(length);
            const array = this._wasmHEAPU8.subarray(local, local + length);
            array.set(encoded);

            this._wasmInstance.setSkeletonData(this._objID, false, local, length);
        }

        return true;
    }

    public updateRenderData (): Skeleton2DMesh[] {
        this._meshArray.length = 0;
        const address = this._wasmInstance.updateRenderData(this._objID);
        let start = address / 4;
        const heap32 = new Uint32Array(this._wasmHEAPU8.buffer);
        const meshSize = heap32[start];
        for (let i = 0; i < meshSize; i++) {
            const slot = heap32[++start];
            const vc = heap32[++start];
            const ic = heap32[++start];
            const startV = heap32[++start];
            const startI = heap32[++start];
            const vertices = new Float32Array(heap32.buffer, startV, floatStride * vc);
            const indices = new Uint16Array(heap32.buffer, startI, ic);

            const mesh = new Skeleton2DMesh();
            mesh.initialize(slot, vc, ic, 4 * floatStride);
            mesh.vertices.set(vertices);
            mesh.indices.set(indices);
            this._meshArray.push(mesh);
        }
        return this._meshArray;
    }

    public setSkin (name: string): boolean {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(name);
        const length = encoded.length;

        const local = this._wasmInstance.queryMemory(length);
        const array = this._wasmHEAPU8.subarray(local, local + length);
        array.set(encoded);
        this._wasmInstance.setSkin(this._objID, local, length);
        return true;
    }

    public setAnimation (name: string): boolean {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(name);
        const length = encoded.length;

        const local = this._wasmInstance.queryMemory(length);
        const array = this._wasmHEAPU8.subarray(local, local + length);
        array.set(encoded);
        this._wasmInstance.setAnimation(this._objID, local, length);
        return true;
    }

    public setTimeScale (timeScale: number): boolean {
        this._wasmInstance.setTimeScale(this._objID, timeScale);
        return true;
    }

    public updateAnimation (dltTime: number) {
        this._wasmInstance.updateAnimation(this._objID, dltTime);
    }

    getSlotsTable (): Map<number, string | null> {
        const table = new Map<number, string>();
        const count = this._wasmInstance.getDrawOrderSize(this._objID);

        let i = 0;
        const decoder = new TextDecoder();
        for (i = 0; i < count; i++) {
            const address = this._wasmInstance.getSlotNameByOrder(this._objID, i);
            const heap32 = new Uint32Array(this._wasmHEAPU8.buffer);
            const length = heap32[address / 4];
            let name;
            if (length < 1) {
                name = null;
            } else {
                const source = this._wasmHEAPU8.subarray(address + 4, address + 4 + length);
                name = decoder.decode(source);
            }
            table.set(i, name);
        }
        return table;
    }

    public getBoneMatrix (index: number, mat: Mat4) {
        const address = this._wasmInstance.getBoneMatrix(this._objID, index);
        const start = address / 4;
        const floatArray = new Float32Array(this._wasmHEAPU8.buffer);
        mat.m00 = floatArray[start];
        mat.m01 = floatArray[start + 1];
        mat.m04 = floatArray[start + 2];
        mat.m05 = floatArray[start + 3];
        mat.m12 = floatArray[start + 4];
        mat.m13 = floatArray[start + 5];
    }

    private _objID: number;
    private _wasmInstance: SpineWasmInterface;
    private _wasmHEAPU8: Uint8Array = new Uint8Array(0);

    private _meshArray: Skeleton2DMesh[] = [];
}
