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

const _spineMaterials = new Map< string, MaterialInstance>();

function getMaterialFromBlend (blendMode: number, premultipliedAlpha: boolean, baseMat: Material): MaterialInstance {
    const key = `${blendMode}/${premultipliedAlpha}`;
    const mat = _spineMaterials.get(key);
    if (mat) {
        return mat;
    }
    let src: BlendFactor;
    let dst: BlendFactor;
    switch (blendMode) {
    case 1:
        src =  premultipliedAlpha ? BlendFactor.ONE :  BlendFactor.SRC_ALPHA;
        dst = BlendFactor.ONE;
        break;
    case 2:
        src = BlendFactor.DST_COLOR;
        dst = BlendFactor.ONE_MINUS_SRC_ALPHA;
        break;
    case 3:
        src = BlendFactor.ONE;
        dst = BlendFactor.ONE_MINUS_SRC_COLOR;
        break;
    case 0:
    default:
        src = premultipliedAlpha ? BlendFactor.ONE : BlendFactor.SRC_ALPHA;
        dst = BlendFactor.ONE_MINUS_SRC_ALPHA;
        break;
    }

    const matInfo = {
        parent: baseMat,
        subModelIdx: 0,
    };
    const inst = new MaterialInstance(matInfo);
    inst.overridePipelineStates({
        blendState: {
            blendColor: Color.WHITE,
            targets: [{
                blendEq: BlendOp.ADD,
                blendAlphaEq: BlendOp.ADD,
                blendSrc: src,
                blendDst: dst,
                blendSrcAlpha: src,
                blendDstAlpha: dst,
            }],
        },
    });
    _spineMaterials.set(key, inst);
    return inst;
}

const simple: IAssembler = {
    fillBuffers (render: PartialRendererUI, batcher: IBatcher) {

    },
    updateColor (render: PartialRendererUI) {

    },
};

/**
 * @internal
 */
export interface SpineSkeletonUIDraw {
    material: Material | null;
    texture: Texture2D | null;
    indexOffset: number;
    indexCount: number;
}

@ccclass('sp.PartialRendererUI')
@help('i18n:sp.PartialRendererUI')
@executionOrder(100)
@executeInEditMode
export class PartialRendererUI extends UIRenderable {
    private _texture: Texture2D | null = null;
    private _mesh: Skeleton2DMesh = null!;
    private _nativeObj: NativePartialRendererUI = null!;
    private _drawList: SpineSkeletonUIDraw[] = [];
    private _premultipliedAlpha = true;

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
    set premultipliedAlpha (v: boolean) {
        this._premultipliedAlpha = v;
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
        const drawList = this._drawList;
        drawList.forEach((draw) => {
            const origin = meshBuffer.indexOffset;
            batcher.commitMiddleware(this, meshBuffer, origin + draw.indexOffset, draw.indexCount, draw.texture!, draw.material!, false);
        });
        accessor.appendIndices(chunk.bufferId, rd.chunk.ib);
    }

    public onDestroy () {
        super.onDestroy();
        console.log('Skeleton2DPartialRenderer destroy');
    }

    private _assembleRenderData () {
        this._drawList.length = 0;
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

        const blendInfos = mesh.blendInfos;
        const drawCount = mesh.blendInfos.length;
        for (let i = 0; i < drawCount; i++) {
            const blend = blendInfos[i].blendMode;
            const mat = getMaterialFromBlend(blend, this._premultipliedAlpha, this.material!);
            const iOffset = blendInfos[i].indexOffset;
            const iCount = blendInfos[i].indexCount;
            this._drawList.push({
                material: mat,
                texture: this._texture,
                indexOffset: iOffset,
                indexCount: iCount });
        }
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
