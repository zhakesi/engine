export class FileResource {
    private fileList = new Map<string, Uint8Array>();
    public AddToFileList (name : string, data: string) {
        const encoder = new TextEncoder();
        const array = encoder.encode(data);
        this.fileList.set(name, array);
    }

    public RequireFileBuffer (name: string) : Uint8Array {
        if (!this.fileList.has(name)) return new Uint8Array(0);
        const array = this.fileList.get(name);
        return array!;
    }
}

const fileResouce = new FileResource();
export function FileResourceInstance () : FileResource {
    return fileResouce;
}

export interface SpineWasmUtil {
    spineWasmUtilInit(): number;
    spineWasmUtilDestroy() : number;
    getStoreMemory():number;
    createSkeletonObject () : number;
    setSkeletonData(objID: number, start: number, length: number): number;
    setAnimation(objID: number, start: number, length: number) : number;
    setSkin(objID: number, start: number, length: number) : number;
    updateAnimation(objID: number, dltTime: number) : number;
    updateRenderData(objID: number) : number;
    queryMemory(size : number) : number;
    freeMemory(data:Uint8Array);
    testFunction(objID: number, start: number, length: number): number;
    memory: any;
}
