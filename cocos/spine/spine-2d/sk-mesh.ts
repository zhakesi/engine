const floatStride = 9;
export class SKMesh {
    constructor (vc: number, ic: number) {
        this.vCount = vc;
        this.iCount = ic;
        const floatNum = floatStride * vc;
        this.vertices = new Float32Array(floatNum);
        this.indeices = new Uint16Array(ic);
    }

    public vCount: number;
    public iCount: number;
    public vertices: Float32Array;
    public indeices: Uint16Array;
}