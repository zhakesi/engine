export interface SpineWasmUtil {
    spineWasmUtilInit(): number;
    spineWasmUtilDestroy() : number;
    createSkeletonObject () : number;
    setSkeletonData(objID: number, start: number, length: number): number;
    setAnimation(objID: number) : number;
    setSkin(objID: number) : number;
    updateAnimation(objID: number) : number;
    updateRenderData(objID: number) : number;
    queryMemory(size : number) : number;
    freeMemory(data:Uint8Array);
    testFunction(objID: number, start: number, length: number): number;
    memory : any;
}
