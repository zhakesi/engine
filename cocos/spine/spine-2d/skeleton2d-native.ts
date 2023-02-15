export class Skeleton2DMesh {
    constructor () {

    }
    public initialize (vc: number, ic: number, stride: number) {
        this.vCount = vc;
        this.iCount = ic;
        this.byteStride = stride;
        const floatNum = vc * this.byteStride / 4;
        this.vertices = new Float32Array(floatNum);
        this.indices = new Uint16Array(ic);
    }

    public declare vCount: number;
    public declare iCount: number;
    public declare byteStride: number;
    public declare vertices: Float32Array;
    public declare indices: Uint16Array;
}

export declare class NativeSkeleton2D {
    initSkeletonData(jsonStr: string, atlasText: string);
    setSkin(name: string);
    setAnimation (name: string);
    updateAnimation(dltTime: number);
    updateRenderData(): Skeleton2DMesh[];
}
