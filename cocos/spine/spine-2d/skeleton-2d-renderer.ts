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
import { ccclass, executeInEditMode, executionOrder, help, menu, serializable, type, displayName } from 'cc.decorator';
import { EDITOR, JSB } from 'internal:constants';
import { editable } from '../../core/data/decorators';
import { ccenum, Enum } from '../../core/value-types/enum';
import { Renderer } from '../../core/components/renderer';
import { Texture2D } from '../../core/assets';
import { SkeletonData } from '../skeleton-data';
import { Skeleton2DImplement } from './skeleton-2d-impl';
import { Skeleton2DNativeImpl } from './skeleton-2d-native';
import { Skeleton2DWasmImpl } from './skeleton-2d-wasm';
import { ModelRenderer } from '../../core';
import { Model } from '../../core/renderer/scene';
import { Root } from '../../core/root';
import { legacyCC } from '../../core/global-exports';
import { ModelLocalBindings } from '../../core/pipeline/define';

export enum SkelSkinsEnum {
    default = 0,
}
ccenum(SkelSkinsEnum);

export enum SkelAnimsEnum {
    '<None>' = 0
}
ccenum(SkelAnimsEnum);

@ccclass('cc.Skeleton2DRenderer')
@help('i18n:cc.Skeleton2DRenderer')
@menu('2D/Skeleton2DRenderer')
@executeInEditMode
export class Skeleton2DRenderer extends ModelRenderer {
    @serializable
    protected _skeletonData: SkeletonData | null = null;
    @serializable
    protected _defaultSkinName = 'default';
    @serializable
    protected _defaultAnimationName = '<None>';
    @serializable
    protected _texture : Texture2D | null = null;

    protected _imply : Skeleton2DImplement | null = null;

    constructor () {
        super();
    }

    @editable
    @type(SkeletonData)
    get skeletonData () {
        return this._skeletonData;
    }
    set skeletonData (value: SkeletonData | null) {
        if (!this._imply) return;
        if (this._skeletonData !== null) {
            this._imply.releaseSkeletonData();
        }
        this._skeletonData = value;
        this._imply.updateSkeletonData(this._skeletonData!);
    }

    /**
     * @internal
     */
    @displayName('Default Skin')
    @type(SkelSkinsEnum)
    get defaultSkinIndex (): number {
        return 0;
    }
    set defaultSkinIndex (value: number) {
    }

    /**
     * @internal
     */
    @displayName('Animation')
    @type(SkelAnimsEnum)
    get animationIndex () {
        return 0;
    }
    set animationIndex (value: number) {
    }

    @displayName('Texture')
    @type(Texture2D)
    get texture () {
        return this._texture;
    }
    set texture (tex: Texture2D| null) {
        this._texture = tex;
    }

    public __preload () {
        if (JSB) {
            this._imply = new Skeleton2DNativeImpl();
        } else {
            this._imply = new Skeleton2DWasmImpl();
        }
        this._imply.init();
        console.log('imply.init() done');
    }

    public onLoad () {

    }

    public onRestore () {

    }

    private frameCount = 0;
    public update (dt: number) {
        // if (EDITOR) return;
        // if (!this._imply) return;
        // if (!this._imply.isInit) return;
        // this.frameCount++;
        // if (this.frameCount === 1) {
        //     this._imply.updateSkeletonData(this._skeletonData!);
        // }
        // this._imply.updateRenderData();
        // this._imply.updateModel(this._models[0]);
        // this.onUpdateLocalDescriptorSet();
    }

    public onEnable () {
        // this._createModel();
        // this._attachToScene();
    }

    public onDisable () {

    }

    public onDestroy () {

    }

    protected _createModel () {
        const model = (legacyCC.director.root as Root).createModel<Model>(Model);
        this._models.push(model);
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

    protected onUpdateLocalDescriptorSet () {
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
}
