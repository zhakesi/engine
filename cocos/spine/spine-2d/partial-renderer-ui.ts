import { EDITOR, JSB } from 'internal:constants';
import { Material, RenderingSubMesh, Texture2D } from '../../asset/assets';
import { legacyCC } from '../../core/global-exports';
import { Model } from '../../render-scene/scene';
import { ModelLocalBindings } from '../../rendering/define';
import { vfmtPosUvColor, getAttributeStride, vfmtPosUvColor4B, vfmtPosUvTwoColor4B } from '../../2d/renderer/vertex-format';
import { Root } from '../../root';
import { Skeleton2DMesh } from './skeleton2d-native';
import { BlendFactor, BlendOp, BufferInfo, BufferUsageBit, Device, MemoryUsageBit, PrimitiveMode, deviceManager } from '../../gfx';
import { builtinResMgr } from '../../asset/asset-manager';
import { ccclass, displayName, executeInEditMode, executionOrder, help, serializable, type } from '../../core/data/decorators';
import { CCClass, Color, Enum, ccenum } from '../../core';
import { IAssembler, RenderData, UIRenderable } from '../../2d';
import { IBatcher } from '../../2d/renderer/i-batcher';
import { director } from '../../game';
import { StaticVBAccessor } from '../../2d/renderer/static-vb-accessor';
import { Batcher2D } from '../../2d/renderer/batcher-2d';
import { MaterialInstance } from '../../render-scene';

let _accessor: StaticVBAccessor = null!;

const simple: IAssembler = {
    fillBuffers (render: PartialRendererUI, batcher: IBatcher) {

    },
    updateColor () {

    },
};

@ccclass('sp.PartialRendererUI')
@help('i18n:sp.PartialRendererUI')
@executionOrder(100)
@executeInEditMode
export class PartialRendererUI extends UIRenderable {
    private _texture: Texture2D | null = null;
    private _meshArray: Skeleton2DMesh[] = [];

    constructor () {
        super();
        this._assembler = simple;
    }

    public resetProperties (tex: Texture2D | null) {
        this._texture = tex;
    }

    set meshArray (meshes: Skeleton2DMesh[]) {
        this._meshArray = meshes;
    }

    public onLoad () {
        super.onLoad();
        this.createRenderData();
    }

    public onEnable () {
        super.onEnable();
    }

    public onDisable () {
        super.onDisable();
    }

    protected updateMaterial () {
        if (this._customMaterial) {
            if (this.getMaterial(0) !== this._customMaterial) {
                this.setMaterial(this._customMaterial, 0);
            }
            return;
        }
        const mat = builtinResMgr.get<Material>('default-spine-material');
        this.setMaterial(mat, 0);
    }

    public updateRenderer () {
        this._assembleRenderData();
        this._renderFlag = this._canRender();
        this._renderEntity.enabled = this._renderFlag;
    }

    protected _render (batcher: Batcher2D): void {
        if (this._meshArray.length < 1) return;
        if (!this._texture) return;
        if (!this._renderData) return;

        this._updateVertexColor();
        const rd = this._renderData;
        const chunk = rd.chunk;
        const accessor = chunk.vertexAccessor;
        const indicesCount = rd.indexCount;
        const meshBuffer = rd.getMeshBuffer()!;
        meshBuffer.setDirty();
        const origin = meshBuffer.indexOffset;
        batcher.commitMiddleware(this, meshBuffer, origin, indicesCount, this._texture, this.material!, false);
        accessor.appendIndices(chunk.bufferId, rd.chunk.ib);
    }

    public onDestroy () {
        super.onDestroy();
        console.log('Skeleton2DPartialRenderer destroy');
    }

    private _assembleRenderData () {
        const count = this._meshArray.length;
        let vc = 0;
        let ic = 0;
        for (let idx = 0;  idx < count; idx++) {
            const mesh = this._meshArray[idx];
            vc += mesh.vCount;
            ic += mesh.iCount;
        }
        const renderData = this._renderData!;
        renderData.resize(vc, ic);
        const vb = renderData.chunk.vb;
        const ib = renderData.chunk.ib;
        let vbOffset = 0;
        let ibOffset = 0;
        let vCount = 0;
        for (let idx = 0;  idx < count; idx++) {
            const mesh = this._meshArray[idx];
            const srcVB = mesh.vertices;
            const srcIB = mesh.indices;
            const length = srcIB.length;
            for (let ii = 0; ii < length; ii++) {
                srcIB[ii] += vCount;
            }
            vb.set(srcVB, vbOffset);
            ib.set(srcIB, ibOffset);
            vbOffset += srcVB.length;
            ibOffset += srcIB.length;
            vCount += mesh.vCount;
        }
    }

    private createRenderData () {
        let accessor = _accessor;
        if (!accessor) {
            const device = director.root!.device;
            const batcher = director.root!.batcher2D;
            const attributes = vfmtPosUvColor;
            accessor = _accessor = new StaticVBAccessor(device, attributes, 32767);
            //Register to batcher so that batcher can upload buffers after batching process
            batcher.registerBufferAccessor(Number.parseInt('SPINE_2D', 36), _accessor);
        }
        const rd = RenderData.add(vfmtPosUvColor, accessor);
        rd.resize(0, 0);
        this._renderData = rd;
    }

    private _updateVertexColor () {
        if (this.color.r === 255 && this.color.g === 255
            && this.color.b === 255 && this.color.a === 255) {
            return;
        }

        const floatStride = getAttributeStride(vfmtPosUvColor) / 4;
        const renderData = this._renderData!;
        const vb = renderData.chunk.vb;
        const count = renderData.vertexCount;
        const colorR = this.color.r / 255.0;
        const colorG = this.color.g / 255.0;
        const colorB = this.color.b / 255.0;
        const colorA = this.color.a / 255.0;
        let floatOffset = 5;
        for (let i = 0; i < count; i++) {
            vb[floatOffset] *= colorR;
            vb[floatOffset + 1] *= colorG;
            vb[floatOffset + 2] *= colorB;
            vb[floatOffset + 3] *= colorA;
            floatOffset += floatStride;
        }
    }
}
