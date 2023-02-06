export class FileResource {
    private fileList = new Map<string, Uint8Array>();
    public AddToFileList (name: string, data: string) {
        const encoder = new TextEncoder();
        const array = encoder.encode(data);
        this.fileList.set(name, array);
    }

    public RequireFileBuffer (name: string): Uint8Array {
        if (!this.fileList.has(name)) return new Uint8Array(0);
        const array = this.fileList.get(name);
        return array!;
    }
}

const fileResouce = new FileResource();
export function FileResourceInstance (): FileResource {
    return fileResouce;
}
