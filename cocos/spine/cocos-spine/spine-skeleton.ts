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
import { ccclass, executeInEditMode, executionOrder, help, menu, serializable, type, displayName, range, tooltip, editable } from 'cc.decorator';
import { Texture2D } from '../../asset/assets';
import { errorID } from '../../core/platform/debug';
import { Enum } from '../../core/value-types/enum';
import { Component, Node } from '../../scene-graph';
import { CCBoolean, CCFloat, Mat4 } from '../../core';
import { SkeletonData } from '../skeleton-data';
import { UIRenderer, UITransform } from '../../2d';
import { spineX } from './spine-define';

@ccclass('sp.SpineSkeleton')
@help('i18n:sp.SpineSkeleton')
@menu('Spine/SpineSkeleton')
@executeInEditMode
export class SpineSkeleton extends UIRenderer {
    @serializable
    protected _skeletonData: SkeletonData | null = null;

    private _runtimeData: any = null;
    public _skeleton: any = null;
    private _instance: any = null;

    constructor () {
        super();
        this._instance = new spineX.SkeletonInstance();
    }

    @type(SkeletonData)
    @displayName('SkeletonData')
    get skeletonData () {
        return this._skeletonData;
    }
    set skeletonData (value: SkeletonData | null) {
        if (this._skeletonData === value) return;
        this._skeletonData = value;
        this._updateSkeletonData();
    }

    public __preload () {
        this._updateSkeletonData();
    }

    public onRestore () {

    }

    public update (dt: number) {
        if (!this._skeletonData) return;
        this.updateAnimation(dt);
    }

    public onEnable () {
        super.onEnable();
        this._flushAssembler();
    }

    public onDisable () {
    }

    public onDestroy () {
    }

    protected _updateSkeletonData () {
        if (!this._skeletonData) return;
        const jsonStr = this._skeletonData.skeletonJsonStr;
        const altasStr = this._skeletonData.atlasText;
        this._runtimeData = this._instance.initSkeletonDataJson(jsonStr, altasStr);
        if (!this._runtimeData) return;
        console.log(this._runtimeData.width);
        console.log(this._runtimeData.height);
        this._skeleton = this._instance.initSkeleton();
    }

    public setAnimation (trackIndex: number, name: string, loop?: boolean) {
        if (loop === undefined) loop = true;
        this._instance.setAnimation(trackIndex, name, loop);
    }

    public setSkin (name: string) {
        this._instance.setSkin(name);
    }

    public updateAnimation (dt: number) {
        this._instance.updateAnimation(dt);
        this.markForUpdateRenderData();
    }

    public updateRenderData (): any {
        const model = this._instance.updateRenderData();
        return model;
    }

    protected _flushAssembler () {
        const assembler = SpineSkeleton.Assembler.getAssembler(this);
        if (this._assembler !== assembler) {
            this._assembler = assembler;
        }
        if (this._skeleton && this._assembler) {
            this._renderData = this._assembler.createData(this);
            this.markForUpdateRenderData();
            this._updateColor();
        }
    }
}
