import { SkeletonData } from '../skeleton-data';
import { getSpineSpineWasmInstance } from './instantiated';
import { SpineWasmInterface } from './spine-wasm-util';
import { FileResourceInstance } from './file-resource';
import { Skeleton2DMesh } from './skeleton2d-native';
import { Skeleton2DImply } from './skeleton2d-imply';
import { Mat4, Color } from '../../core';
import { SpineJitterVertexEffect, SpineSwirlVertexEffect } from './spine-vertex-effect-wasm';

const tempBoneMat = new Mat4();

function alignedBytes (address: number, bytes: number) {
    return Math.floor(address / bytes);
}
const floatStride = 6;
export class Skeleton2DImplyWasm implements Skeleton2DImply {
    constructor () {
        this._wasmInstance = getSpineSpineWasmInstance();
        this._wasmHEAPU8 = new Uint8Array(this._wasmInstance.memory.buffer);
        this._objID = this._wasmInstance.createSkeletonObject();
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

    public updateRenderData (): Skeleton2DMesh {
        const address = this._wasmInstance.updateRenderData(this._objID);
        let uint32Ptr = alignedBytes(address, 4);
        const heap32 = new Uint32Array(this._wasmHEAPU8.buffer);
        const vc = heap32[uint32Ptr++];
        const ic = heap32[uint32Ptr++];
        const startV = heap32[uint32Ptr++];
        const startI = heap32[uint32Ptr++];
        const blendCount = heap32[uint32Ptr++];
        const vertices = new Float32Array(heap32.buffer, startV, floatStride * vc);
        const indices = new Uint16Array(heap32.buffer, startI, ic);

        const mesh = new Skeleton2DMesh();
        mesh.slotIndex = 0;
        mesh.byteStride = 4 * floatStride;
        mesh.vCount = vc;
        mesh.iCount = ic;
        mesh.vertices = vertices;
        mesh.indices = indices;

        for (let i = 0; i < blendCount; i++) {
            const blend = heap32[uint32Ptr++];
            const iOffset = heap32[uint32Ptr++];
            const iCount = heap32[uint32Ptr++];
            mesh.blendInfos.push({
                blendMode: blend,
                indexOffset: iOffset,
                indexCount: iCount });
        }
        return mesh;
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

    public setAnimation (trackIndex: number, name: string, loop: boolean): number {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(name);
        const length = encoded.length;

        const local = this._wasmInstance.queryMemory(length);
        const array = this._wasmHEAPU8.subarray(local, local + length);
        array.set(encoded);
        const duration = this._wasmInstance.setAnimation(this._objID, local, length, trackIndex, loop);
        return duration;
    }

    public clearTrack (trackIndex: number) {
        this._wasmInstance.clearTrack(this._objID, trackIndex);
    }

    public clearTracks () {
        this._wasmInstance.clearTracks(this._objID);
    }

    public setToSetupPose () {
        this._wasmInstance.setToSetupPose(this._objID);
    }

    public setTimeScale (timeScale: number): boolean {
        this._wasmInstance.setTimeScale(this._objID, timeScale);
        return true;
    }

    public updateAnimation (dltTime: number) {
        this._wasmInstance.updateAnimation(this._objID, dltTime);
    }

    public setMix (fromAnimation: string, toAnimation: string, duration: number) {
        const encoder = new TextEncoder();
        const fromAnimationEncode = encoder.encode(fromAnimation);
        const toAnimationEncode = encoder.encode(toAnimation);
        const length = fromAnimationEncode.length + toAnimationEncode.length;
        const local = this._wasmInstance.queryMemory(length);
        const array = this._wasmHEAPU8.subarray(local, local + length);
        array.set(fromAnimationEncode, 0);
        array.set(toAnimationEncode, fromAnimationEncode.length);
        this._wasmInstance.setMix(this._objID, local, fromAnimationEncode.length, toAnimationEncode.length, duration);
    }

    getSlotsTable (): Map<number, string | null> {
        const table = new Map<number, string>();
        const count = this._wasmInstance.getDrawOrderSize(this._objID);

        let i = 0;
        const decoder = new TextDecoder();
        for (i = 0; i < count; i++) {
            const address = this._wasmInstance.getSlotNameByOrder(this._objID, i);
            const start = alignedBytes(address, 4);
            const heap32 = new Uint32Array(this._wasmHEAPU8.buffer);
            const length = heap32[start];
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

    public setDefaultScale (scale: number) {
        this._wasmInstance.setDefaultScale(this._objID, scale);
    }

    public setVertexEffect (effect: SpineJitterVertexEffect | SpineSwirlVertexEffect | null) {
        let effectHandle = 0;
        if (effect) {
            effectHandle = effect.getHandle();
        }
        this._wasmInstance.setVertexEffect(this._objID, effectHandle, 0);
    }

    public setPremultipliedAlpha (premultipliedAlpha: boolean) {
        this._wasmInstance.setPremultipliedAlpha(this._objID, premultipliedAlpha);
    }

    public setColor (color: Color) {
        const r = color.r / 255.0;
        const g = color.g / 255.0;
        const b = color.b / 255.0;
        const a = color.a / 255.0;
        this._wasmInstance.setColor(this._objID, r, g, b, a);
    }

    private _objID: number;
    private _wasmInstance: SpineWasmInterface;
    private _wasmHEAPU8: Uint8Array = new Uint8Array(0);
}
