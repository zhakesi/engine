import { EDITOR, JSB } from 'internal:constants';
import { Material, RenderingSubMesh, Texture2D } from '../../asset/assets';
import { legacyCC } from '../../core/global-exports';
import { Model } from '../../render-scene/scene';
import { ModelLocalBindings } from '../../rendering/define';
import { vfmtPosUvColor, getAttributeStride, vfmtPosUvColor4B, vfmtPosUvTwoColor4B } from '../../2d/renderer/vertex-format';
import { Root } from '../../root';
import { Skeleton2DMesh } from './skeleton2d-native';
import { BufferInfo, BufferUsageBit, Device, MemoryUsageBit, PrimitiveMode, deviceManager } from '../../gfx';
import { builtinResMgr } from '../../asset/asset-manager';
import { ccclass, displayName, executeInEditMode, executionOrder, help, serializable, type } from '../../core/data/decorators';
import { CCClass, Enum, ccenum } from '../../core';
import { RenderData, UIRenderable } from '../../2d';
import { IBatcher } from '../../2d/renderer/i-batcher';
import { director } from '../../game';
import { StaticVBAccessor } from '../../2d/renderer/static-vb-accessor';
import { Batcher2D } from '../../2d/renderer/batcher-2d';

let _accessor: StaticVBAccessor = null!;

@ccclass('cc.PartialRendererUI')
@help('i18n:cc.PartialRendererUI')
@executionOrder(100)
@executeInEditMode
export class PartialRendererUI extends UIRenderable {
    private _texture: Texture2D | null = null;
    private _meshArray: Skeleton2DMesh[] = [];

    constructor () {
        super();
    }

    public resetProperties (tex: Texture2D | null) {
        this._texture = tex;
    }

    set meshArray (meshes: Skeleton2DMesh[]) {
        this._meshArray = meshes;
    }

    public onLoad () {
        super.onLoad();
        const material = builtinResMgr.get<Material>('default-spine-material');
        this.setMaterial(material, 0);
    }

    public onEnable () {
        super.onEnable();
        this.createRenderData();
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

        const rd = this._renderData;
        const meshBuffer = rd.getMeshBuffer()!;
        const origin = meshBuffer.indexOffset;
        batcher.commitMiddleware(this, meshBuffer, origin, rd.indexCount, this._texture, this.material!, false);
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
        for (let idx = 0;  idx < count; idx++) {
            const mesh = this._meshArray[idx];
            const srcVB = mesh.vertices;
            const srcIB = mesh.indices;
            vb.set(srcVB, vbOffset);
            ib.set(srcIB, ibOffset);
            vbOffset += srcVB.length;
            ibOffset += srcIB.length;
        }
    }

    private createRenderData () {
        let accessor = _accessor;
        if (!accessor) {
            const device = director.root!.device;
            const batcher = director.root!.batcher2D;
            const attributes = vfmtPosUvColor;
            accessor = _accessor = new StaticVBAccessor(device, attributes, 32767);
            // Register to batcher so that batcher can upload buffers after batching process
            batcher.registerBufferAccessor(Number.parseInt('SPINE_2D', 36), _accessor);
        }
        const rd = RenderData.add(vfmtPosUvColor, accessor);
        rd.resize(0, 0);
        this._renderData = rd;
    }
}
