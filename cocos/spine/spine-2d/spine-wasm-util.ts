export interface SpineWasmUtil {
    createSkeletonObject () : number;
    setSkeletonData(objID: number): number;
    setAnimation(objID: number) : number;
    setSkin(objID: number) : number;
    updateAnimation(objID: number) : number;
    updateRenderData(objID: number) : number;
    memoryTest()
    memory:any;
}