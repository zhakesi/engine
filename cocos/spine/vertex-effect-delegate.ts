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

import spine from './lib/spine-core.js';

/**
 * @en
 * The delegate of spine vertex effect.
 * @zh
 * Spine 顶点动画代理。
 * @class VertexEffectDelegate
 */
export class VertexEffectDelegate {
    /**
     * @internal
     * @deprecated since v3.7.1, this is an engine private variable that will be removed in the future.
     */
    name = 'sp.VertexEffectDelegate';
    /**
     * @en Spine vertex effect object instance.
     * @zh spine 顶点特效对象实例。
     */
    _vertexEffect: spine.VertexEffect | null = null;
    private _interpolation: spine.Interpolation | null = null;
    private _effectType: string;

    constructor () {
        this._vertexEffect = null;
        this._interpolation = null;
        this._effectType = 'none';
    }

    /**
     * @en Clears vertex effect.
     * @zh 清空顶点特效。
     */
    clear () {
        this._vertexEffect = null;
        this._interpolation = null;
        this._effectType = 'none';
    }

    /**
     * @en Inits delegate with jitter effect.
     * @zh 设置顶点抖动特效。
     * @param {Number} jitterX
     * @param {Number} jitterY
     * @return {spine.VertexEffect} @en return a vertex effect type of jitter. @zh 返回一个 jitter 类型的顶点特效对象实例。
     */
    initJitter (jitterX: number, jitterY: number): spine.VertexEffect {
        this._effectType = 'jitter';
        this._vertexEffect = new spine.JitterEffect(jitterX, jitterY);
        return this._vertexEffect;
    }

    /**
     * @en Inits delegate with swirl effect.
     * @zh 设置顶点漩涡特效。
     * @method initSwirlWithPow
     * @param {Number} radius
     * @param {Number} power
     * @return {sp.spine.JitterEffect} @en return a vertex effect type of swirl. @zh 返回一个 swirl 类型的顶点特效对象实例。
     */
    initSwirlWithPow (radius: number, power: number): spine.VertexEffect {
        this._effectType = 'swirl';
        this._interpolation = new spine.Pow(power);
        this._vertexEffect = new spine.SwirlEffect(radius, this._interpolation);
        return this._vertexEffect;
    }

    /**
     * @en Inits delegate with swirl effect.
     * @zh 设置顶点漩涡特效。
     * @method initSwirlWithPowOut
     * @param {Number} radius
     * @param {Number} power
     * @return {sp.spine.SwirlEffect} @en return a vertex effect type of swirl. @zh 返回一个 swirl 类型的顶点特效对象实例。
     */
    initSwirlWithPowOut (radius: number, power: number) {
        this._effectType = 'swirl';
        this._interpolation = new spine.PowOut(power);
        this._vertexEffect = new spine.SwirlEffect(radius, this._interpolation);
        return this._vertexEffect;
    }

    /**
     * @en Gets jitter vertex effect.
     * @zh 获取顶点抖动特效。
     * @method getJitterVertexEffect
     * @return {sp.spine.JitterEffect}
     */
    getJitterVertexEffect () {
        return this._vertexEffect;
    }

    /**
     * @en Gets swirl vertex effect.
     * @zh 获取顶点漩涡特效。
     * @method getSwirlVertexEffect
     * @return {sp.spine.SwirlEffect}
     */
    getSwirlVertexEffect () {
        return this._vertexEffect;
    }

    /**
     * @en Gets vertex effect.
     * @zh 获取顶点特效。
     * @method getVertexEffect
     * @return {sp.spine.JitterEffect|sp.spine.SwirlEffect}
     */
    getVertexEffect () {
        return this._vertexEffect;
    }

    /**
     * @en Gets effect type.
     * @zh 获取特效类型。
     * @method getEffectType
     * @return {String}
     */
    getEffectType () {
        return this._effectType;
    }
}
