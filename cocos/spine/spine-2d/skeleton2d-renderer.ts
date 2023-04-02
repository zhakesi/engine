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
import { EDITOR, JSB } from 'internal:constants';
import { ccclass, executeInEditMode, executionOrder, help, menu, serializable, type, displayName, range, slide, tooltip } from 'cc.decorator';
import { builtinResMgr } from '../../asset/asset-manager/builtin-res-mgr';
import { PrimitiveMode, Device, BufferUsageBit, BufferInfo, MemoryUsageBit, deviceManager } from '../../gfx';
import { Material, Texture2D, RenderingSubMesh } from '../../asset/assets';
import { editable } from '../../core/data/decorators';
import { errorID } from '../../core/platform/debug';
import { SkeletonData } from '../skeleton-data';

import { ccenum, Enum } from '../../core/value-types/enum';
import { CCClass } from '../../core/data/class';
import { Skeleton2DImply } from './skeleton2d-imply';
import { Skeleton2DImplyWasm } from './skeleton2d-imply-wasm';
import { Skeleton2DImplyNative } from './skeleton2d-imply-native';
import { Skeleton2DMesh } from './skeleton2d-native';
import { CCInteger } from '../../core';
import { Node } from '../../scene-graph/node';
import { Skeleton2DPartialRenderer } from './skeleton2d-partial-renderer';
import { Component } from '../../scene-graph';

export enum Skel2DSkinsEnum {
    default = 0,
}
ccenum(Skel2DSkinsEnum);

export enum Skel2DAnimsEnum {
    '<None>' = 0,
}
ccenum(Skel2DAnimsEnum);

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
export class Skeleton2DRenderer extends Component {
    @serializable
    protected _skeletonData: SkeletonData | null = null;
    @serializable
    private _defaultSkinName = 'default';
    @serializable
    private _defaultAnimationName = '<None>';
    @serializable
    private _texture: Texture2D | null = null;
    @serializable
    private _separatorsNum = 0;

    private _parts: Skeleton2DPartialRenderer[] = [];

    private _imply: Skeleton2DImply | null = null;
    private _meshArray: Skeleton2DMesh[] = [];
    private _slotList: string[] = [];

    constructor () {
        super();
        setEnumAttr(this, 'defaultSkinIndex', Enum({}));
        setEnumAttr(this, 'animationIndex', Enum({}));
        if (JSB) {
            this._imply = new Skeleton2DImplyNative();
        } else {
            this._imply = new Skeleton2DImplyWasm();
        }
    }

    @editable
    @type(SkeletonData)
    @displayName('SkeletonData')
    get skeletonData () {
        return this._skeletonData;
    }
    set skeletonData (value: SkeletonData | null) {
        if (this._skeletonData === value) return;
        if (this._skeletonData !== null) {
            console.log('need release');
        }
        this._skeletonData = value;
        if (this._skeletonData) {
            if (this._skeletonData.textures.length > 0) {
                this._texture = this._skeletonData.textures[0];
            }
        }
        this._updateSkinEnum();
        this._updateAnimEnum();
        this._updateSkeletonData();
    }

    /**
     * @internal
     */
    @displayName('Default Skin')
    @type(Skel2DSkinsEnum)
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
    @type(Skel2DAnimsEnum)
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

    @type(Texture2D)
    @displayName('Texture2D')
    get texture () {
        return this._texture;
    }
    set texture (tex: Texture2D| null) {
        this._texture = tex;
    }

    @editable
    @range([0, 64, 1])
    @type(CCInteger)
    @tooltip('i18n:separators number')
    @displayName('Separators Number')
    get separatorsNumber (): number {
        return this._separatorsNum;
    }
    set separatorsNumber (val: number) {
        this._separatorsNum = val;
        this._resetPartialSetting();
    }

    public setSkin (skinName: string) {
        if (!this._imply) return;

        this._imply.setSkin(skinName);
    }

    // update skin list for editor
    protected _updateSkinEnum () {
        if (!EDITOR) return;
        let skinEnum;
        if (this.skeletonData) {
            skinEnum = this.skeletonData.getSkinsEnum();
        } else {
            skinEnum = Skel2DSkinsEnum;
        }

        const enumSkins = Enum({});
        Object.assign(enumSkins, skinEnum);
        Enum.update(enumSkins);
        setEnumAttr(this, 'defaultSkinIndex', enumSkins);
    }

    // update animation list for editor
    protected _updateAnimEnum () {
        let animEnum;
        if (this.skeletonData) {
            animEnum = this.skeletonData.getAnimsEnum();
        } else {
            animEnum = Skel2DAnimsEnum;
        }
        // reset enum type
        const enumAnimations = Enum({});
        Object.assign(enumAnimations, animEnum);
        Enum.update(enumAnimations);
        setEnumAttr(this, 'animationIndex', enumAnimations);
    }

    public __preload () {
        if (EDITOR) {
            this._updateSkinEnum();
            this._updateAnimEnum();
        }
    }

    public onRestore () {
        // if (!this._wasmObj) return;
        // console.log('onRestore');
    }

    public update (dt: number) {
        if (!this._imply) return;
        if (!EDITOR) this._imply.updateAnimation(dt);
        this._meshArray = this._imply.updateRenderData();
        this._updatePartsRenderData();
    }

    public onEnable () {
        this._updateSkeletonData();
    }

    public onDisable () {
        // if (!this._wasmObj) return;
        // console.log('onDisable');
    }

    public onDestroy () {
        console.log('Skeleton2DRenderer onDestroy');
        this._parts.length = 0;
        // if (!this._wasmObj) return;
        // console.log('onDestroy');
    }

    protected _updateSkeletonData () {
        if (this._skeletonData === null || this._imply === null) return;
        this._imply.initSkeletonData(this._skeletonData);
        this.setSkin(this._defaultSkinName);
        this.setAnimation(this._defaultAnimationName);

        this._slotList = this._imply.getSlots();
        this._resetPartialSetting();
    }

    public setAnimation (name: string) {
        if (!this._imply) return;
        this._imply.setAnimation(name);
    }

    private _resetPartialSetting () {
        if (!this._imply) return;

        const slots = this._slotList;
        this._parts.length = 0;
        let part = this.node.getComponent(Skeleton2DPartialRenderer);
        if (part) {
            part.initializeConfig(0, this._texture, slots);
            this._parts.push(part);
        } else {
            part = this.node.addComponent(Skeleton2DPartialRenderer);
            part.initializeConfig(0, this._texture, slots);
            this._parts.push(part);
        }
        const chilren = this.node.children;
        chilren.forEach((node) => {
            part = node.getComponent(Skeleton2DPartialRenderer);
            if (part) node.destroy();
        });

        let i = 1;
        for (i = 1; i <= this._separatorsNum; i++) {
            const node = new Node(`${i.toString()}-part`);
            node.parent = this.node;
            part = node.addComponent(Skeleton2DPartialRenderer);
            part.initializeConfig(i, this._texture, slots);
            this._parts.push(part);
        }
    }

    private _updatePartsRenderData () {
        for (let i = 0; i < this._parts.length; i++) {
            const part = this._parts[i];
            part.meshArray = this._meshArray;
        }
    }
}
