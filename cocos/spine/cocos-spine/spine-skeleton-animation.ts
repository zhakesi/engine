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
import { Skeleton2DImplyWasm } from './skeleton2d-imply-wasm';
import { Skeleton2DImplyNative } from './skeleton2d-imply-native';
import { Skeleton2DMesh } from './skeleton2d-native';
import { CCFloat, CCInteger, Mat4, path } from '../../core';
import { Node } from '../../scene-graph/node';
import { Skeleton2DPartialRenderer } from './skeleton2d-partial-renderer';
import { Component } from '../../scene-graph';
import { Enum } from '../../core/value-types/enum';
import { SpineSkinEnum, SpineAnimationEnum, setEnumAttr } from './spine-define';
import { SpineSocket } from '../skeleton';

const attachMat4 = new Mat4();
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

@ccclass('sp.SpineSkeletonAnimation')
@help('i18n:sp.SpineSkeletonAnimation')
@executionOrder(99)
@menu('Spine/SpineSkeletonAnimation')
@executeInEditMode
export class SpineSkeletonAnimation extends Component {
    @serializable
    protected _skeletonData: SkeletonData | null = null;
    @serializable
    private _defaultSkinName = 'default';
    @serializable
    private _defaultAnimationName = '<None>';
    @serializable
    private _texture: Texture2D | null = null;
    @serializable
    private _timeScale = 1.0;
    @serializable
    private _loop = true;
    @serializable
    private _seperatorNumber = 0;
    @serializable
    protected _sockets: SpineSocket[] = [];

    private _parts: Skeleton2DPartialRenderer[] = [];

    private _imply: Skeleton2DImplyWasm | Skeleton2DImplyNative = null!;
    private _meshArray: Skeleton2DMesh[] = [];
    declare private _slotTable: Map<number, string | null>;
    private _slotList: string[] = [];
    protected _cachedSockets: Map<string, number> = new Map<string, number>();
    protected _socketNodes: Map<number, Node> = new Map();

    constructor () {
        super();
        setEnumAttr(this, 'defaultSkinIndex', Enum({}));
        setEnumAttr(this, 'animationIndex', Enum({}));
        if (JSB) {
            this._imply = new Skeleton2DImplyNative();
            console.log('xxx- new Skeleton2DImplyNative');
        } else {
            this._imply = new Skeleton2DImplyWasm();
            this._imply.setDefaultScale(0.01);
            console.log('xxx- new Skeleton2DImplyWasm');
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

        this._clearPartialRenderers();
    }

    /**
     * @internal
     */
    @displayName('Default Skin')
    @type(SpineSkinEnum)
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
    @type(SpineAnimationEnum)
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
            this.setAnimation(0, this._defaultAnimationName);
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

    /**
     * @en Whether play animations in loop mode.
     * @zh 是否循环播放当前骨骼动画。
     */
    @tooltip('i18n:COMPONENT.skeleton.loop')
    get loop () {
        return this._loop;
    }
    set loop (val) {
        this._loop = this.loop;
    }

    @editable
    @range([0, 10.0])
    @type(CCFloat)
    @tooltip('i18n:Animation Speed')
    @displayName('Time Scale')
    get timeScale (): number {
        return this._timeScale;
    }
    set timeScale (val: number) {
        this._timeScale = val;
        this.updateTimeScale(val);
    }

    @editable
    @range([0, 64, 1])
    @type(CCInteger)
    @tooltip('i18n:Seperator Number')
    @displayName('Seperator Number')
    get seperatorNumber (): number {
        return this._seperatorNumber;
    }
    set seperatorNumber (val: number) {
        this._seperatorNumber = val;
        this._clearPartialRenderers();
        let i = 1;
        for (; i <= val; i++) {
            const node = new Node(`part-${i.toString()}`);
            this._addPatialRenderer(node, i);
            node.parent = this.node;
        }
    }

    @type([SpineSocket])
    @tooltip('i18n:SpineBone.sockets')
    get sockets (): SpineSocket[] {
        return this._sockets;
    }

    set sockets (val: SpineSocket[]) {
        this._sockets = val;
        this._updateSocketBindings();
        this._syncAttachedNode();
    }

    public setSkin (skinName: string) {
        if (!this._imply) return;

        this._imply.setSkin(skinName);
        //this._updateRenderData();
    }

    // update skin list for editor
    protected _updateSkinEnum () {
        if (!EDITOR) return;
        let skinEnum;
        if (this.skeletonData) {
            skinEnum = this.skeletonData.getSkinsEnum();
        } else {
            skinEnum = SpineSkinEnum;
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
            animEnum = SpineAnimationEnum;
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
        if (!this._skeletonData) return;
        this._imply.updateAnimation(dt);
        this._syncAttachedNode();
        this._updateRenderData();
    }

    public onEnable () {
        this._updateSkeletonData();
        this._initPartsRenderers();
    }

    public onDisable () {
        // if (!this._wasmObj) return;
        // console.log('onDisable');
    }

    public onDestroy () {
        console.log('SpineSkeletonAnimation onDestroy');
        this._parts.length = 0;
        // if (!this._wasmObj) return;
        // console.log('onDestroy');
    }

    protected _updateSkeletonData () {
        if (this._skeletonData === null || this._imply === null) return;
        this._imply.initSkeletonData(this._skeletonData);
        this.setSkin(this._defaultSkinName);
        this.setAnimation(0, this._defaultAnimationName);
        this._slotTable = this._imply.getSlotsTable();
        this._updateSlotEnumList();
        this._indexBoneSockets();
        this._updateSocketBindings();
        this._updateRenderData();
    }

    public setAnimation (trackIdex: number, name: string, loop?: boolean) {
        if (!this._imply) return;
        if (loop) this._loop = loop;
        this._imply.setAnimation(trackIdex, name, this._loop);
        this._imply.setTimeScale(this._timeScale);
    }

    private _clearPartialRenderers () {
        const children = this.node.children;
        children.forEach((node) => {
            const part = node.getComponent(Skeleton2DPartialRenderer);
            if (part) node.destroy();
        });
        this._parts.length = 0;
        this._addPatialRenderer(this.node, 0);
    }

    private _addPatialRenderer (node: Node, idx: number) {
        const slotList = this._slotList;
        let part = node.getComponent(Skeleton2DPartialRenderer);
        if (part) {
            this.fillPartialRenderProperties(part);
        } else {
            part = node.addComponent(Skeleton2DPartialRenderer);
            this.fillPartialRenderProperties(part);
        }
        this._parts[idx] = part;
    }

    private _updateRenderData () {
        if (!this._imply || !this._skeletonData) return;
        this._meshArray = this._imply.updateRenderData();
        for (let i = 0; i < this._parts.length; i++) {
            const part = this._parts[i];
            const next = this._parts[i + 1];
            const slotStart = part.slotStart;
            let slotEnd = this._slotList.length - 1;
            if (next) slotEnd = next.slotStart;

            // const meshStart = this._findMeshBySlot(slotStart);
            // const meshEnd = this._findMeshBySlot(slotEnd);
            const meshStart = 0;
            const meshEnd = this._meshArray.length - 1;

            const meshes = this._meshArray.slice(meshStart, meshEnd + 1);
            part.meshArray = meshes;
        }
    }

    private _initPartsRenderers () {
        this._parts.length = 0;
        let part = this.node.getComponent(Skeleton2DPartialRenderer);
        if (!part) {
            this._addPatialRenderer(this.node, 0);
        } else {
            this.fillPartialRenderProperties(part);
            this._parts.push(part);
        }
        const children = this.node.children;
        children.forEach((node) => {
            part = node.getComponent(Skeleton2DPartialRenderer);
            if (part) {
                this.fillPartialRenderProperties(part);
                this._parts.push(part);
            }
        });
    }

    private fillPartialRenderProperties (part: Skeleton2DPartialRenderer) {
        part.resetProperties(this._texture, this._slotList);
    }

    private _findMeshBySlot (slotIndex: number): number {
        const name = this._slotList[slotIndex];
        let realIndex = 0;
        this._slotTable.forEach((value, key) => {
            if (value === name) {
                realIndex = key;
            }
        });
        const meshArray = this._meshArray;
        const length = meshArray.length;
        let meshIndex = 0;
        for (let i = 0; i < length; i++) {
            if (meshArray[i].slotIndex === realIndex) {
                meshIndex = i;
                break;
            }
        }
        return meshIndex;
    }

    private _updateSlotEnumList () {
        this._slotList.length = 0;
        this._slotTable.forEach((value, key) => {
            if (value) {
                this._slotList.push(value);
            }
        });
    }

    public updateTimeScale (val: number) {
        if (!this._imply) return;
        this._imply.setTimeScale(val);
    }

    private _updateSocketBindings () {
        if (!this._skeletonData) return;
        this._socketNodes.clear();
        for (let i = 0, l = this._sockets.length; i < l; i++) {
            const socket = this._sockets[i];
            if (socket.path && socket.target) {
                const boneIdx = this._cachedSockets.get(socket.path);
                if (!boneIdx) {
                    console.error(`Skeleton data does not contain path ${socket.path}`);
                    continue;
                }
                this._socketNodes.set(boneIdx, socket.target);
            }
        }
    }

    private _indexBoneSockets () {
        if (!this._skeletonData) return;
        this._cachedSockets.clear();
        const sd = this._skeletonData.getRuntimeData();
        const bones = sd!.bones;

        const getBoneName = (bone: any): any => {
            if (bone.parent == null) return bone.name || '<Unamed>';
            return `${getBoneName(bones[bone.parent.index])}/${bone.name}`;
        };

        for (let i = 0, l = bones.length; i < l; i++) {
            const bd = bones[i];
            const boneName = getBoneName(bd);
            this._cachedSockets.set(boneName, bd.index);
        }
    }
    public querySockets () {
        this._indexBoneSockets();
        return Array.from(this._cachedSockets.keys());
    }

    private _syncAttachedNode () {
        const socketNodes = this._socketNodes;
        for (const boneIdx of socketNodes.keys()) {
            const boneNode = socketNodes.get(boneIdx);
            if (!boneNode) continue;
            this._imply.getBoneMatrix(boneIdx, attachMat4);
            attachMat4.m12 *= 0.01;
            attachMat4.m13 *= 0.01;
            boneNode.matrix = attachMat4;
        }
    }
}
