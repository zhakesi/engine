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
import { EDITOR } from 'internal:constants';
import { ccclass, executeInEditMode, executionOrder, help, menu, serializable, type, displayName } from 'cc.decorator';
import { builtinResMgr } from '../../asset/asset-manager/builtin-res-mgr';
import { PrimitiveMode, Device, BufferUsageBit, BufferInfo, MemoryUsageBit, deviceManager } from '../../gfx';
import { Material, Texture2D, RenderingSubMesh } from '../../asset/assets';
import { ModelRenderer } from '../../misc/model-renderer';
import { editable } from '../../core/data/decorators';
import { errorID } from '../../core/platform/debug';
import { SkeletonData } from '../skeleton-data';
import { ModelLocalBindings } from '../../rendering/define';
import { vfmtPosUvColor, getAttributeStride } from '../../2d/renderer/vertex-format';
import { Model } from '../../render-scene/scene';
import { Root } from '../../root';
import { legacyCC } from '../../core/global-exports';
import { ccenum, Enum } from '../../core/value-types/enum';
import { CCClass } from '../../core/data/class';

import { SkeletonWasmObject } from './skeleton-wasm';
import { SKMesh } from './sk-mesh';
import { forEach } from '../../asset/asset-manager/utilities';

export enum SkelSlotEnum {
    default = 0,
}
ccenum(SkelSlotEnum);

export class SlotSeparatorItem {
    public slotIdx = 0;
}

export enum SkelSkinsEnum {
    default = 0,
}
ccenum(SkelSkinsEnum);

export enum SkelAnimsEnum {
    '<None>' = 0
}

function setEnumAttr (obj, propName, enumDef) {
    CCClass.Attr.setClassAttr(obj, propName, 'type', 'Enum');
    CCClass.Attr.setClassAttr(obj, propName, 'enumList', Enum.getList(enumDef));
}

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
    @serializable
    private _defaultSkinName = 'default';
    @serializable
    private _defaultAnimationName = '<None>';
    @serializable
    private _texture : Texture2D | null = null;

    private _separators : (SkelSlotEnum | null)[] = [];

    private _wasmObj : SkeletonWasmObject | null = null;
    private _meshArray : SKMesh[] = [];

    constructor () {
        super();
    }

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
        this._defaultSkinName = 'default';
        this._defaultAnimationName = '<None>';

        this._updateSkinEnum();
        this._updateAnimEnum();
        //this._updateSkeletonData();
    }

    /**
     * @internal
     */
    @displayName('Default Skin')
    @type(SkelSkinsEnum)
    get defaultSkinIndex (): number {
        if (!this.skeletonData) return 0;
        const skinsEnum = this.skeletonData.getSkinsEnum();
        if (!skinsEnum) return 0;
        if (this._defaultSkinName === 'default') {
            // eslint-disable-next-line no-prototype-builtins
            if (skinsEnum.hasOwnProperty(0)) {
                this.defaultSkinIndex = 0;
                return 0;
            }
        } else {
            const skinIndex = skinsEnum[this._defaultSkinName];
            if (skinIndex !== undefined) return skinIndex;
        }
        return 0;
    }
    set defaultSkinIndex (value: number) {
        if (!this.skeletonData) return;
        const skinsEnum = this.skeletonData.getSkinsEnum();
        if (!skinsEnum) {
            console.error(`${this.name} skin enums are invalid`);
            return;
        }
        const skinName = skinsEnum[value];
        if (skinName !== undefined) {
            this._defaultSkinName = skinName.toString();
            this.setSkin(this._defaultSkinName);
            if (EDITOR) this._updateSkinEnum();
        } else {
            console.error(`${this.name} skin enums are invalid`);
        }
    }

    /**
     * @internal
     */
    @displayName('Animation')
    @type(SkelAnimsEnum)
    get animationIndex () {
        if (!this.skeletonData) return 0;
        const animsEnum = this.skeletonData.getAnimsEnum();
        if (!animsEnum) return 0;
        const animName = this._defaultAnimationName;
        const animIndex = animsEnum[animName];
        if (animIndex !== undefined) return animIndex;
        return 0;
    }
    set animationIndex (value: number) {
        if (!this.skeletonData) return;
        const animsEnum = this.skeletonData.getAnimsEnum();
        if (!animsEnum) {
            console.error(`${this.name} animation enums are invalid`);
            return;
        }
        const animName = animsEnum[value];
        if (animName !== undefined) {
            this._defaultAnimationName = animName.toString();
            this.setAnimation(this._defaultAnimationName);
            if (EDITOR) this._updateAnimEnum();
        } else {
            console.error(`${this.name} animation enums are invalid`);
        }
    }

    @displayName('Texture')
    @type(Texture2D)
    get texture () {
        return this._texture;
    }
    set texture (tex: Texture2D| null) {
        this._texture = tex;
    }

    @type(SkelSlotEnum)
    @displayName('Separator Items')
    get renderSeparators () {
        return this._separators;
    }
    set renderSeparators (val) {
        this._separators = val;
    }

    public setSkin (skinName: string) {
        if (!this._wasmObj) return;
        this._wasmObj.setSkin(skinName);
    }

    protected _updateSkinEnum () {
        if (!EDITOR) return;
        let enumDef : {[key: string]: number} | null = null;
        if (this.skeletonData) {
            enumDef = this.skeletonData.getSkinsEnum();
        }
        if (!enumDef) enumDef = { default: 0 };

        const enumSkins = Enum(enumDef);
        Enum.update(enumSkins);
        setEnumAttr(this, 'defaultSkinIndex', enumSkins);
    }

    protected _updateAnimEnum () {
        if (!EDITOR) return;

        let enumDef : {[key: string]: number} | null = null;
        if (this.skeletonData) {
            enumDef = this.skeletonData.getAnimsEnum();
        }
        if (!enumDef) enumDef = { '<None>': 0 };
        const enumAnimations = Enum(enumDef);
        Enum.update(enumAnimations);
        setEnumAttr(this, 'animationIndex', enumAnimations);
    }

    protected _updateSlotEnum () {
        if (!EDITOR) return;

        let enumDef : {[key: string]: number} | null = null;
        if (!enumDef) enumDef = { xxa: 0, xxb: 1 };
        const enumSlots = Enum(enumDef);
        Enum.update(enumSlots);
    }

    public __preload () {
        // if (!this._skeletonData) return;
        // if (!this._wasmObj) return;
        // console.log('__preload');
    }

    public onLoad () {
        if (this._models.length < 1) {
            this._createModel();
        }
        this._updateAnimEnum();
        this._updateSkinEnum();
        this._updateSlotEnum();
    }

    public onRestore () {
        // if (!this._wasmObj) return;
        // console.log('onRestore');
    }

    public update (dt: number) {
        // if (!this._wasmObj) return;

        // this._wasmObj.updateAnimation(dt);
        // this._meshArray = this._wasmObj.updateRenderData();

        // this.realTimeTraverse();
        // this._onUpdateLocalDescriptorSet();
    }

    public onEnable () {
        // console.log('onEnable');
        // this._attachToScene();
        // this._defaultSkinName = 'goblin';
        // this._updateSkeletonData();
        // this.setAnimation('walk');
    }

    public onDisable () {
        // if (!this._wasmObj) return;
        // console.log('onDisable');
    }

    public onDestroy () {
        // if (!this._wasmObj) return;
        // console.log('onDestroy');
    }

    protected _updateSkeletonData () {
        if (this._skeletonData === null) return;
        if (!this._wasmObj) {
            this._wasmObj = new SkeletonWasmObject();
        }

        this._wasmObj.initSkeletonData(this._skeletonData);
        this.setSkin(this._defaultSkinName);
    }

    public setAnimation (name:string) {
        if (!this._wasmObj) return;
        this._wasmObj.setAnimation(name);
    }

    protected _onUpdateLocalDescriptorSet () {
        if (!this.texture) return;
        const subModels = this._models[0].subModels;
        const binding = ModelLocalBindings.SAMPLER_SPRITE;
        for (let i = 0; i < subModels.length; i++) {
            const { descriptorSet } = subModels[i];
            const texture = this._texture;
            descriptorSet.bindTexture(binding, texture!.getGFXTexture()!);
            descriptorSet.bindSampler(binding, texture!.getGFXSampler()!);
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
