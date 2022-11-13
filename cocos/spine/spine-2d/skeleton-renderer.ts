/*
 Copyright (c) 2020-2022 Xiamen Yaji Software Co., Ltd.
 https://www.cocos.com/
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
 worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
 not use Cocos Creator software for developing other software or tools that's
 used for developing games. You are not granted to publish, distribute,
 sublicense, and/or sell copies of Cocos Creator.
 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/
import { ccclass, executeInEditMode, executionOrder, help, menu, serializable, type } from 'cc.decorator';
import { builtinResMgr, Color, Material, ModelRenderer, ccenum, Enum, CCClass, Texture2D } from '../../core';
import { editable, displayName,  tooltip } from '../../core/data/decorators';
import { errorID, warnID } from '../../core/platform/debug';
import { SkeletonData } from '../skeleton-data';
import { vfmtPosUvColor, getAttributeStride, getComponentPerVertex, vfmtPosUvTwoColor } from '../../2d/renderer/vertex-format';
import { ModelLocalBindings } from '../../core/pipeline/define';
import { Format, PrimitiveMode, Attribute, Device, BufferUsageBit, BufferInfo, MemoryUsageBit, deviceManager } from '../../core/gfx';
import { Model } from '../../core/renderer/scene';
import { Root } from '../../core/root';
import { RenderingSubMesh } from '../../core/assets';
import { legacyCC } from '../../core/global-exports';

import { SkeletonWasmObject } from './skeleton-wasm';
import { SKMesh } from './sk-mesh';

// eslint-disable-next-line dot-notation
SkeletonData.prototype['init'] = function () {
    console.log('SkeletonData.prototype init');
    const uuid = this._uuid;
    if (!uuid) {
        errorID(7504);
        return;
    }
    const atlasText = this.atlasText;
    if (!atlasText) {
        errorID(7508, this.name);
        return;
    }
    const textures = this.textures;
    const textureNames = this.textureNames;
    if (!(textures && textures.length > 0 && textureNames && textureNames.length > 0)) {
        errorID(7507, this.name);
    }
};

@ccclass('cc.Skeleton2DRenderer')
@help('i18n:cc.Skeleton2DRenderer')
@executionOrder(100)
@menu('2D/Skeleton2DRenderer')
@executeInEditMode
export class Skeleton2DRenderer extends ModelRenderer {
    @serializable
    protected _skeletonData: SkeletonData | null = null;

    /**
     * @en
     * The skeleton data contains the skeleton information (bind pose bones, slots, draw order,
     * attachments, skins, etc) and animations but does not hold any state.<br/>
     * Multiple skeletons can share the same skeleton data.
     * @zh
     * 骨骼数据包含了骨骼信息（绑定骨骼动作，slots，渲染顺序，
     * attachments，皮肤等等）和动画但不持有任何状态。<br/>
     * 多个 Skeleton 可以共用相同的骨骼数据。
     */
    @editable
    @type(SkeletonData)
    get skeletonData () {
        return this._skeletonData;
    }
    set skeletonData (value: SkeletonData | null) {
        if (this._skeletonData === value) return;
        if (this._skeletonData !== null) {
            console.log('need release');
        }
        this._skeletonData = value;
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._updateSkeletonData();
        console.log('set skeletonData');
    }

    @serializable
    private _texture : Texture2D | null = null;
    @type(Texture2D)
    get texture () {
        return this._texture;
    }
    set texture (tex: Texture2D| null) {
        this._texture = tex;
    }

    private _wasmObj : SkeletonWasmObject | null = null;

    private _meshArray : SKMesh[] = [];

    public __preload () {
        if (!this._skeletonData) return;
        if (!this._wasmObj) return;
        console.log('__preload');
    }

    public onLoad () {
        if (this._models.length < 1) {
            this._createModel();
        }
        if (!this._wasmObj) return;
        console.log('onLoad');
    }

    public onRestore () {
        if (!this._wasmObj) return;
        console.log('onRestore');
    }

    public update (dt: number) {
        if (!this._wasmObj) return;

        this._wasmObj.updateAnimation(dt);
        this._meshArray = this._wasmObj.updateRenderData();

        this.realTimeTraverse();
        this._onUpdateLocalDescriptorSet();
    }

    public onEnable () {
        console.log('onEnable');
        this._attachToScene();
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._updateSkeletonData();
        this.setAnimation('run');
    }

    public onDisable () {
        if (!this._wasmObj) return;
        console.log('onDisable');
    }

    public onDestroy () {
        if (!this._wasmObj) return;
        console.log('onDestroy');
    }

    protected _updateSkeletonData () {
        if (this._skeletonData === null) return;
        if (!this._wasmObj) {
            this._wasmObj = new SkeletonWasmObject();
        }
        this._wasmObj.initSkeletonData(this._skeletonData);
    }
    public setAnimation (name:string) {
        if (!this._wasmObj) return;
        this._wasmObj.setAnimation(name);
    }

    protected _onUpdateLocalDescriptorSet () {
        const subModels = this._models[0].subModels;
        const binding = ModelLocalBindings.SAMPLER_SPRITE;
        for (let i = 0; i < subModels.length; i++) {
            const { descriptorSet } = subModels[i];
            const texture = this._texture!;
            descriptorSet.bindTexture(binding, texture.getGFXTexture()!);
            descriptorSet.bindSampler(binding, texture.getGFXSampler()!);
            descriptorSet.update();
        }
    }

    protected _createModel () {
        const model = (legacyCC.director.root as Root).createModel<Model>(Model);
        this._models[0] = model;
        model.visFlags = this.visibility;
        model.node = model.transform = this.node;
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

    public _activeSubModel (idx: number) {
        if (this._models.length < 1) {
            return;
        }
        const attrs = vfmtPosUvColor;
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

            const mat = builtinResMgr.get<Material>('default-spine2d-material');
            this._models[0].initSubModel(idx, renderMesh, mat);
            this._models[0].enabled = true;
        }
    }
    public realTimeTraverse () {
        const count = this._meshArray.length;
        for (let idx = 0;  idx < count; idx++) {
            const mesh = this._meshArray[idx];

            this._activeSubModel(idx);
            const subModel = this._models[0].subModels[idx];
            const ia = subModel.inputAssembler;
            ia.vertexBuffers[0].update(mesh.vertices);
            ia.vertexCount = mesh.vCount;
            const ib = new Uint16Array(mesh.indeices);
            ia.indexBuffer!.update(ib);
            ia.indexCount = ib.length;
        }
    }
}
