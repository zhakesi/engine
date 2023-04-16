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

export class SpineJitterVertexEffect extends SpineVertexEffectDelegate {
    constructor (x: number, y: number) {
        super();
        this._jitterX = x;
        this._jitterY = y;
        this.handle = wasmInstance.createJitterVertexEffect(x, y);
    }

    private _jitterX = 0;
    private _jitterY = 0;
}

export class SpineSwirlVertexEffect extends SpineVertexEffectDelegate {
    constructor () {
        super();
        this.handle = wasmInstance.createSwirlVertexEffect(1);
    }
}
