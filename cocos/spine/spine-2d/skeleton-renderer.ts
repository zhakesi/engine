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
import { retry } from '../../core/asset-manager/utilities';
import { editable, displayName,  tooltip } from '../../core/data/decorators';
import { errorID, warnID } from '../../core/platform/debug';
import { SkeletonData } from '../skeleton-data';
import { SkeletonWasmObject } from './skeleton-wasm';

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

    private _wasmObj : SkeletonWasmObject | null = null;

    public __preload () {
        if (!this._wasmObj) return;
        console.log('__preload');
    }

    public onLoad () {
        if (!this._wasmObj) return;
        console.log('onLoad');
    }

    public onRestore () {
        if (!this._wasmObj) return;
        console.log('onRestore');
    }

    public update (dt: number) {
        //if (!this._wasmObj) return;
        //console.log('update');
    }

    public onEnable () {
        console.log('onEnable');
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._updateSkeletonData();
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
        const jsonStr = this._skeletonData.skeletonJsonStr;
        this._wasmObj.testFunc();
        //this._wasmObj.initSkeletonData(jsonStr);
    }
}
