import { EDITOR, JSB } from 'internal:constants';
import { Material, RenderingSubMesh, Texture2D } from '../../asset/assets';
import { legacyCC } from '../../core/global-exports';
import { Model } from '../../render-scene/scene';
import { ModelLocalBindings } from '../../rendering/define';
import { vfmtPosUvColor, getAttributeStride, vfmtPosUvColor4B, vfmtPosUvTwoColor4B } from '../../2d/renderer/vertex-format';
import { Root } from '../../root';
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
import { RenderEntity, RenderEntityType } from '../../2d/renderer/render-entity';
import { Skeleton2DMesh, NativePartialRendererUI } from './skeleton2d-native';

let _accessor: StaticVBAccessor = null!;

// function MixUint32Color(uintColor:number, r: number, g:number, b:number, a:number) {
//     const uintA = Math.floor(a * (uintColor >> 24));
//     const uintB = Math.floor(b * ((uintColor << 8) >>24));
//     const uintG = Math.floor(g * ((uintColor << 16) >>24));
//     const uintR = Math.floor(g * ((uintColor << 16) >>24));
// }

const simple: IAssembler = {
    fillBuffers (render: PartialRendererUI, batcher: IBatcher) {

    },
    updateColor (render: PartialRendererUI) {

    },
};

@ccclass('sp.PartialRendererUI')
@help('i18n:sp.PartialRendererUI')
@executionOrder(100)
@executeInEditMode
export class PartialRendererUI extends UIRenderable {
    private _texture: Texture2D | null = null;
    private _mesh: Skeleton2DMesh = null!;
    private _nativeObj: NativePartialRendererUI = null!;

    constructor () {
        super();
        this._assembler = simple;
        if (JSB) {
            this._nativeObj = new NativePartialRendererUI();
            this._nativeObj.setRenderEntity(this._renderEntity.nativeObj);
        }
        this._useVertexOpacity = true;
    }

    get nativeObject () {
        return this._nativeObj;
    }

    public setTexture (tex: Texture2D | null) {
        this._texture = tex;
        if (JSB && tex) this._nativeObj.setTexture(tex);
    }

    set mesh (mesh: Skeleton2DMesh) {
        this._mesh = mesh;
        this._assembleRenderData();
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
        let mat;
        if (this._customMaterial) {
            mat = this._customMaterial;
            if (this.getMaterial(0) !== mat) {
                this.setMaterial(mat, 0);
            }
        } else {
            mat = builtinResMgr.get<Material>('default-spine-material');
            this.setMaterial(mat, 0);
        }
        if (JSB) {
            this._nativeObj.setMaterial(mat);
        }
    }

    public updateRenderer () {
        //this._assembleRenderData();
        this._renderFlag = this._canRender();
        this._renderEntity.enabled = this._renderFlag;
    }

    protected _render (batcher: Batcher2D): void {
        if (!this._mesh) return;
        if (!this._texture) return;
        if (!this._renderData) return;

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
        if (JSB || !this._mesh) return;
        const mesh = this._mesh;

        const renderData = this._renderData!;
        renderData.resize(mesh.vCount, mesh.iCount);
        const vb = renderData.chunk.vb;
        const ib = renderData.chunk.ib;
        const chunkOffset = renderData.chunk.vertexOffset;

        const srcVB = mesh.vertices;
        const srcIB = mesh.indices;
        for (let ii = 0; ii < srcIB.length; ii++) {
            srcIB[ii] += chunkOffset;
        }
        vb.set(srcVB, 0);
        ib.set(srcIB, 0);
    }

    private createRenderData () {
        let accessor = _accessor;
        const attributes = vfmtPosUvColor4B;
        if (!accessor) {
            const device = director.root!.device;
            const batcher = director.root!.batcher2D;
            accessor = _accessor = new StaticVBAccessor(device, attributes, 32767);
            //Register to batcher so that batcher can upload buffers after batching process
            batcher.registerBufferAccessor(Number.parseInt('SPINE_2D', 36), _accessor);
        }
        const rd = RenderData.add(attributes, accessor);
        rd.resize(0, 0);
        this._renderData = rd;
    }

    protected createRenderEntity () {
        const renderEntity = new RenderEntity(RenderEntityType.DYNAMIC);
        renderEntity.setUseLocal(true);
        return renderEntity;
    }
}
