import { SkeletonData } from '../skeleton-data';
import { getSpineSpineWasmUtil } from './instantiated';
import { SpineWasmUtil } from './spine-wasm-util';
import { FileResourceInstance } from './file-resource';
import { Skeleton2DMesh } from './skeleton2d-native';
import { Skeleton2DImply } from './skeleton2d-imply';

const floatStride = 9;
export class Skeleton2DImplyWasm implements Skeleton2DImply {
    constructor () {
        this._wasmUtil = getSpineSpineWasmUtil();
        this._wasmHEAPU8 = new Uint8Array(this._wasmUtil.memory.buffer);
        this._objID = this._wasmUtil.createSkeletonObject();
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

            const local = this._wasmUtil.queryMemory(length);
            const array = this._wasmHEAPU8.subarray(local, local + length);
            array.set(encoded);

            this._wasmUtil.setSkeletonData(this._objID, true, local, length);
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

            const local = this._wasmUtil.queryMemory(length);
            const array = this._wasmHEAPU8.subarray(local, local + length);
            array.set(encoded);

            this._wasmUtil.setSkeletonData(this._objID, false, local, length);
        }

        return true;
    }

    public updateRenderData (): Skeleton2DMesh[] {
        this._meshArray.length = 0;
        const address = this._wasmUtil.updateRenderData(this._objID);
        let start = address / 4;
        const heap32 = new Uint32Array(this._wasmHEAPU8.buffer);
        const meshSize = heap32[start];
        for (let i = 0; i < meshSize; i++) {
            const vc = heap32[++start];
            const ic = heap32[++start];
            const startV = heap32[++start];
            const startI = heap32[++start];
            const vertices = new Float32Array(heap32.buffer, startV, floatStride * vc);
            const indices = new Uint16Array(heap32.buffer, startI, ic);

            const mesh = new Skeleton2DMesh();
            mesh.initialize(vc, ic, 4 * floatStride);
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

    public getSlots (): string[] {
        const slots: string[] = [];
        const count = this._wasmUtil.getDrawOrderSize(this._objID);
        console.log(`slot size:${count}`);
        let i = 0;
        const decoder = new TextDecoder();
        for (i = 0; i < count; i++) {
            const address = this._wasmUtil.getSlotNameByOrder(this._objID, i);
            const heap32 = new Uint32Array(this._wasmHEAPU8.buffer);
            const length = heap32[address / 4];
            if (length < 1) continue;

            const source = this._wasmHEAPU8.subarray(address + 4, address + 4 + length);
            const name = decoder.decode(source);
            console.log(`slot:${name}`);
            slots.push(name);
        }
        return slots;
    }

    private _objID: number;
    private _wasmUtil: SpineWasmUtil;
    private _wasmHEAPU8: Uint8Array = new Uint8Array(0);

    private _meshArray: Skeleton2DMesh[] = [];
}
