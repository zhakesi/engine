export interface SpineWasmInterface {
    spineWasmInstanceInit(): number;
    spineWasmInstanceDestroy(): number;
    getStoreMemory(): number;
    createSkeletonObject (): number;
    setSkeletonData(objID: number, isJosn: boolean, start: number, length: number): number;
    setAnimation(objID: number, start: number, length: number): number;
    setTimeScale(objID: number, timeScale: number): number;
    setSkin(objID: number, start: number, length: number): number;
    updateAnimation(objID: number, dltTime: number): number;
    updateRenderData(objID: number): number;
    getDrawOrderSize(objID: number): number;
    getSlotNameByOrder(objID: number, index: number): number;
    queryMemory(size: number): number;
    freeMemory(data: Uint8Array);
    testFunction(objID: number, start: number, length: number): number;
    memory: any;
}
