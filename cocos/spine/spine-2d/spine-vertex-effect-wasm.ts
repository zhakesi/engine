import { ccclass, help } from '../../core/data/decorators';
import { getSpineSpineWasmInstance } from './instantiated';
import { SpineWasmInterface } from './spine-wasm-util';

let wasmInstance: SpineWasmInterface = null!;
export class SpineVertexEffectDelegate {
    constructor () {
        this.handle = -1;
        if (!wasmInstance) {
            wasmInstance = getSpineSpineWasmInstance();
        }
    }
    public getHandle () {
        return this.handle;
    }
    protected handle: number;
}

@ccclass('sp.SpineJitterVertexEffect')
export class SpineJitterVertexEffect extends SpineVertexEffectDelegate {
    constructor (x: number, y: number) {
        super();
        this._jitterX = x;
        this._jitterY = y;
        this.handle = wasmInstance.createJitterVertexEffect(x, y);
    }
    private _jitterX = 0;
    private _jitterY = 0;

    get jitterX () {
        return this._jitterX;
    }
    set jitterX (val: number) {
        this._jitterX = val;
        this._updateParameters();
    }
    get jitterY () {
        return this._jitterY;
    }
    set jitterY (val: number) {
        this._jitterY = val;
        this._updateParameters();
    }
    private _updateParameters () {
        wasmInstance.updateJitterParameters(this.handle, this._jitterX, this._jitterY);
    }
}

@ccclass('sp.SpineSwirlVertexEffect')
export class SpineSwirlVertexEffect extends SpineVertexEffectDelegate {
    constructor (radius: number, power: number, usePowerOut: boolean) {
        super();
        this.handle = wasmInstance.createSwirlVertexEffect(radius, power, usePowerOut);
        this._radius = radius;
    }
    private _centerX = 0;
    private _centerY = 0;
    private _radius = 0;
    private _angle = 0;

    get centerX () {
        return this._centerX;
    }
    set centerX (val: number) {
        this._centerX = val;
        this._updateParameters();
    }

    get centerY () {
        return this._centerY;
    }
    set centerY (val: number) {
        this._centerY = val;
        this._updateParameters();
    }

    get radius () {
        return this._radius;
    }
    set radius (val: number) {
        this._radius = val;
        this._updateParameters();
    }

    get angle () {
        return this._angle;
    }
    set angle (val: number) {
        this._angle = val;
        this._updateParameters();
    }

    private _updateParameters () {
        wasmInstance.updateSwirlParameters(this.handle, this._centerX, this._centerY, this._radius, this._angle);
    }
}
