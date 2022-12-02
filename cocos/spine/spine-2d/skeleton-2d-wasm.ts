import { Skeleton2DImplement } from './skeleton-2d-impl';
import { SkeletonData } from '../skeleton-data';
import { Model } from '../../core/renderer/scene';
import { vfmtPosUvColor, getAttributeStride } from '../../2d/renderer/vertex-format';
import { PrimitiveMode, Device, BufferUsageBit, BufferInfo, MemoryUsageBit, deviceManager } from '../../gfx';
import { Material, Texture2D, RenderingSubMesh } from '../../core/assets';
import { builtinResMgr } from '../../core/builtin/builtin-res-mgr';
import { SpineWasmUtil, FileResourceInstance } from './wasm-util';
import { getSpineSpineWasmUtil, promiseForSpineInstantiation } from './spine-instantiated';
import { error } from '../../core';

const floatStride = 9;
class SKMesh {
    constructor (vc: number, ic: number) {
        this.vCount = vc;
        this.iCount = ic;
        const floatNum = floatStride * vc;
        this.vertices = new Float32Array(floatNum);
        this.indeices = new Uint16Array(ic);
    }

    public vCount: number;
    public iCount: number;
    public vertices: Float32Array;
    public indeices: Uint16Array;
}

export class Skeleton2DWasmImpl extends Skeleton2DImplement {
    protected _objID = 0;
    protected _wasmUtil: SpineWasmUtil | null = null;
    protected _wasmHEAPU8: Uint8Array = new Uint8Array(0);
    protected _meshArray: SKMesh[] = [];
    protected _isInit = false;

    public async init () {
        const wasm = getSpineSpineWasmUtil();
        if (wasm === undefined) {
            await promiseForSpineInstantiation();
        }
        this._wasmUtil = getSpineSpineWasmUtil();
        this._wasmHEAPU8 = new Uint8Array(this._wasmUtil.memory.buffer);
        this._objID = this._wasmUtil.createSkeletonObject();
        console.log('Skeleton2DWasmImpl::init');
        this._isInit = true;
    }
    get isInit () {
        return this._isInit;
    }

    public releaseSkeletonData () {
        console.log('Skeleton2DWasmImpl::releaseSkeletonData');
    }

    public updateSkeletonData (data: SkeletonData) {
        console.log('Skeleton2DWasmImpl::updateSkeletonData');
        if (!this._wasmUtil) return;
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

    public updateRenderData () {
        if (!this._wasmUtil) return;
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
        console.log(this._meshArray.length);
    }

    public updateModel (model : Model) {
        const count = this._meshArray.length;
        for (let idx = 0;  idx < count; idx++) {
            const mesh = this._meshArray[idx];

            this.activeSubModel(model, idx);
            const subModel = model.subModels[idx];
            const ia = subModel.inputAssembler;
            ia.vertexBuffers[0].update(mesh.vertices);
            ia.vertexCount = mesh.vCount;
            const ib = new Uint16Array(mesh.indeices);
            ia.indexBuffer!.update(ib);
            ia.indexCount = ib.length;
        }
    }

    private activeSubModel (model : Model, idx: number) {
        const attrs = vfmtPosUvColor;
        const stride = getAttributeStride(attrs);

        if (model.subModels.length <= idx) {
            const gfxDevice: Device = deviceManager.gfxDevice;
            const vertexBuffer = gfxDevice.createBuffer(new BufferInfo(
                BufferUsageBit.VERTEX | BufferUsageBit.TRANSFER_DST,
                MemoryUsageBit.DEVICE,
                65535 * stride,
                stride,
            ));
            const indexBuffer = gfxDevice.createBuffer(new BufferInfo(
                BufferUsageBit.INDEX | BufferUsageBit.TRANSFER_DST,
                MemoryUsageBit.DEVICE,
                65535 * Uint16Array.BYTES_PER_ELEMENT * 2,
                Uint16Array.BYTES_PER_ELEMENT,
            ));

            const renderMesh = new RenderingSubMesh([vertexBuffer], attrs, PrimitiveMode.TRIANGLE_LIST, indexBuffer);
            renderMesh.subMeshIdx = 0;

            const mat = builtinResMgr.get<Material>('default-spine2d-material');
            model.initSubModel(idx, renderMesh, mat);
            model.enabled = true;
        }
    }
}
