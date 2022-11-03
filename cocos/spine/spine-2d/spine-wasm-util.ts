export interface SpineWasmUtil {
    createSkeletonObject () : number;
    setSkeletonData(objID: number, bytes: Uint8Array, length: number): number;
    setAnimation(objID: number) : number;
    setSkin(objID: number) : number;
    updateAnimation(objID: number) : number;
    updateRenderData(objID: number) : number;
    queryMemory(size : number) : number;
    freeMemory(data:Uint8Array);
    memory:any;
}
