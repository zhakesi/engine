const fs = require('fs');
export function JsReadFile (path) {
    const filePath = 'D:/v3.7.2-win-022401/spine2d.wasm';
    let rawData;
    fs.readFile(filePath, (err, data) => {
        if (err) {
            rawData = null;
            console.log(err);
        } else {
            rawData = data;
        }
    });

    if (rawData) {
        console.log('xxx-' + rawData.byteLength);
    } else {
        console.log('xxx-' + 0);
    }
}