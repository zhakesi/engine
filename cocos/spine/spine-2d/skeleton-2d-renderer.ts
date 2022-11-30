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
        console.log('imply.init()');
        if (JSB) {
            this._imply = new Skeleton2DNativeImpl();
        } else {
            this._imply = new Skeleton2DWasmImpl();
        }
        this._imply.init();
    }

    public onLoad () {

    }

    public onRestore () {

    }

    public update (dt: number) {
        if (EDITOR) return;
        if (!this._imply) return;
        this._imply.updateRenderData();
    }

    public lateUpdate (dt: number) {
        if (EDITOR) return;
        if (!this._imply) return;
        this._imply.render();
    }

    public onEnable () {
        if (!this._imply) return;
        this._imply.updateSkeletonData(this._skeletonData!);
    }

    public onDisable () {

    }

    public onDestroy () {

    }
}
