import { JSB } from 'internal:constants';
import { Material, RenderingSubMesh, Texture2D } from '../../asset/assets';
import { legacyCC } from '../../core/global-exports';
import { ModelRenderer } from '../../misc/model-renderer';
import { Model } from '../../render-scene/scene';
import { ModelLocalBindings } from '../../rendering/define';
import { vfmtPosUvColor, getAttributeStride, vfmtPosUvColor4B } from '../../2d/renderer/vertex-format';
import { Root } from '../../root';
import { Skeleton2DMesh } from './skeleton2d-native';
import { BufferInfo, BufferUsageBit, Device, MemoryUsageBit, PrimitiveMode, deviceManager } from '../../gfx';
import { builtinResMgr } from '../../asset/asset-manager';
import { ccclass, executeInEditMode, executionOrder, help } from '../../core/data/decorators';

@ccclass('cc.Skeleton2DSoltItem')
@executeInEditMode
export class Skeleton2DSoltItem {
    // constructor (index: number, slotName: string, itype: number) {
    //     this.idx = index;
    //     this.name = slotName;
    //     this.indexType = itype;
    // }
    public idx = 0;
    public name = '';
    public indexType = 1; // 0->first, 1->normal, 2->end
}

@ccclass('cc.Skeleton2DPartialRenderer')
@help('i18n:cc.Skeleton2DPartialRenderer')
@executionOrder(101)
@executeInEditMode
export class Skeleton2DPartialRenderer extends ModelRenderer {
    private _texture: Texture2D | null = null;
    private _meshArray: Skeleton2DMesh[] = [];
    private _slotStart = new Skeleton2DSoltItem();
    private _slotEnd = new Skeleton2DSoltItem();

    constructor () {
        super();
        this.material = builtinResMgr.get<Material>('default-spine-material');
    }

    set meshArray (meshes: Skeleton2DMesh[]) {
        this._meshArray = meshes;
    }

    public onLoad () {
        if (this._models.length < 1) {
            this._createModel();
        }
    }

    public onEnable () {
        this._attachToScene();
    }

    public update (dt: number) {
        this._assembleModel();
        this._onUpdateLocalDescriptorSet();
        //console.log('Skeleton2DPartialRenderer:update');
    }

    public onDestroy () {
        this._detachFromScene();
        this._destroyModel();
    }

    protected _createModel () {
        const model = (legacyCC.director.root as Root).createModel<Model>(Model);
        this._models[0] = model;
        model.visFlags = this.visibility;
        model.node = model.transform = this.node;
    }
    protected _destroyModel () {
        (legacyCC.director.root as Root).destroyModel(this._models[0]);
        this._models.length = 0;
    }

    protected _attachToScene () {
        if (!this.node.scene || this._models.length < 1) {
            return;
        }
        const renderScene = this._getRenderScene();
        if (this._models[0].scene !== null) {
            this._detachFromScene();
        }
        renderScene.addModel(this._models[0]);
    }

    protected _detachFromScene () {
        if (this._models.length > 0 && this._models[0].scene) {
            this._models[0].scene.removeModel(this._models[0]);
        }
    }

    protected _onUpdateLocalDescriptorSet () {
        if (!this._texture) return;
        const subModels = this._models[0].subModels;
        const binding = ModelLocalBindings.SAMPLER_SPRITE;
        for (let i = 0; i < subModels.length; i++) {
            const { descriptorSet } = subModels[i];
            const texture = this._texture;
            descriptorSet.bindTexture(binding, texture.getGFXTexture()!);
            descriptorSet.bindSampler(binding, texture.getGFXSampler()!);
            descriptorSet.update();
        }
    }

    public resetData (tex: Texture2D| null) {
        this.material = builtinResMgr.get<Material>('default-spine-material');
        this._texture = tex;
    }

    private _activeSubModel (idx: number) {
        if (this._models.length < 1) {
            return;
        }
        let attrs = vfmtPosUvColor;
        if (JSB) {
            attrs = vfmtPosUvColor4B;
        }
        const stride = getAttributeStride(attrs);

        if (this._models[0].subModels.length <= idx) {
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

            this._models[0].initSubModel(idx, renderMesh, this.material!);
            this._models[0].enabled = true;
        }
    }

    private _assembleModel () {
        const count = this._meshArray.length;
        for (let idx = 0;  idx < count; idx++) {
            const mesh = this._meshArray[idx];

            this._activeSubModel(idx);
            const subModel = this._models[0].subModels[idx];
            const ia = subModel.inputAssembler;
            const vb = new Float32Array(mesh.vertices);
            ia.vertexBuffers[0].update(vb);
            ia.vertexCount = mesh.vCount;
            const ib = new Uint16Array(mesh.indices);
            ia.indexBuffer!.update(ib);
            ia.indexCount = ib.length;
        }
    }
}
