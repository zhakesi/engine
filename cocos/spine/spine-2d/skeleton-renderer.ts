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
import { Node } from '../../scene-graph/node';

import { SkeletonWasmObject } from './skeleton-wasm';
import { SKMesh, SkModelUtil } from './sk-mesh';
import { SkeletonSeparatorRenderer } from './skeleton-separator-renderer';

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

export class SkSlotInfo {
    public name = '';
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

    private _wasmObj : SkeletonWasmObject | null = null;
    private _model : Model | null = null;
    private _meshArray : SKMesh[] = [];
    private _slotsList : string[] = [];

    private _separatorRenders: SkeletonSeparatorRenderer[] = [];

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
        this._updateSkeletonData();
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
    }

    public onRestore () {
        // if (!this._wasmObj) return;
        // console.log('onRestore');
    }

    public update (dt: number) {
        if (!this._wasmObj) return;

        this._wasmObj.updateAnimation(dt);
        this._meshArray = this._wasmObj.updateRenderData();
        if (this._separatorRenders.length < 1) {
            this.realTimeTraverse();
            this._onUpdateLocalDescriptorSet();
        } else {
            const separator0 = this._separatorRenders[0];
            this._fillSeparatorMesh(separator0, 0, 2);
            const separator1 = this._separatorRenders[1];
            this._fillSeparatorMesh(separator1, 3, 19);
        }
    }

    public onEnable () {
        this._setSeparatorEnable(false);
        this._defaultSkinName = 'goblin';
        this._updateSkeletonData();
        this.setAnimation('walk');
        this.addSeparatorRenderer('left-foot');
    }

    public onDisable () {
    }

    public onDestroy () {
    }

    protected _updateSkeletonData () {
        if (this._skeletonData === null) return;
        this._updateSlotsInfor();

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
        const subModels = this._model!.subModels;
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
        this._model = model;
        model.visFlags = this.visibility;
        model.node = model.transform = this.node;
    }

    protected attachToScene () {
        if (!this.node.scene || !this._model) {
            return;
        }
        const renderScene = this._getRenderScene();
        if (this._model.scene !== null) {
            this._model.scene.removeModel(this._model);
        }
        renderScene.addModel(this._model);
    }

    protected detachFromScene () {
        if (!this._model) return;
        if (this._model.scene) {
            this._model.scene.removeModel(this._model);
        }
    }

    private _fillSeparatorMesh (separator: SkeletonSeparatorRenderer, index1:number, index2:number) {
        for (let idx = index1, i = 0;  idx <= index2; idx++, i++) {
            const mesh = this._meshArray[idx];
            SkModelUtil.activeSubModel(separator.model!, i);
            const subModel = separator.model!.subModels[i];
            const ia = subModel.inputAssembler;
            ia.vertexBuffers[0].update(mesh.vertices);
            ia.vertexCount = mesh.vCount;
            const ib = new Uint16Array(mesh.indeices);
            ia.indexBuffer!.update(ib);
            ia.indexCount = ib.length;
        }
    }

    public realTimeTraverse () {
        if (!this._model) return;
        const count = this._meshArray.length;
        for (let idx = 0;  idx < count; idx++) {
            const mesh = this._meshArray[idx];

            SkModelUtil.activeSubModel(this._model, idx);
            const subModel = this._model.subModels[idx];
            const ia = subModel.inputAssembler;
            ia.vertexBuffers[0].update(mesh.vertices);
            ia.vertexCount = mesh.vCount;
            const ib = new Uint16Array(mesh.indeices);
            ia.indexBuffer!.update(ib);
            ia.indexCount = ib.length;
        }
    }

    public addSeparatorRenderer (slot : string) {
        let isExist = false;
        this._separatorRenders.forEach((separator) => {
            if (separator.name === slot) isExist = true;
        });
        if (isExist) return;

        const count = this._separatorRenders.length;
        if (count < 1) {
            const node = new Node('0');
            const separator = node.addComponent(SkeletonSeparatorRenderer);
            separator.initModelData(this.texture!, this.visibility);
            separator.attachToScene();
            separator.name = '0';
            this._separatorRenders.push(separator);
            this.node.addChild(node);
            this._setSeparatorEnable(true);
        }

        const node = new Node(slot);
        const separator = node.addComponent(SkeletonSeparatorRenderer);
        separator.initModelData(this.texture!, this.visibility);
        separator.attachToScene();
        separator.name = slot;
        this.node.addChild(node);
        this._separatorRenders.push(separator);
    }

    public removeSeparatorRenderer (slot : string) {
        const count = this._separatorRenders.length;
        for (let i = 0; i < count; i++) {
            const separator = this._separatorRenders[i];
            if (separator.name === slot) {
                separator.detachFromScene();
                this._separatorRenders.splice(i, 1);
                this.node.removeChild(separator.node);
                break;
            }
        }
        if (this._separatorRenders.length === 1) {
            const separator = this._separatorRenders[0];
            separator.detachFromScene();
            this.node.removeChild(separator.node);
            this._separatorRenders.length = 0;
            this._setSeparatorEnable(false);
        }
    }

    private _updateSlotsInfor () {
        this._slotsList.length = 0;
        if (!this._skeletonData) return;
        const json = this._skeletonData.skeletonJson;
        const slots = (json as any).slots;
        slots.forEach((slot) => {
            this._slotsList.push(slot.name);
        });
    }

    private _setSeparatorEnable (enbale:boolean) {
        if (!enbale) {
            this.attachToScene();
        } else {
            this.detachFromScene();
        }
    }
}
