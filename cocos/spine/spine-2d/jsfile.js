let fs = null;
export function JsReadFile (path) {
    if (!fs) fs = require('fs');
    const filePath = `D:/v3.7.2-win-022401/${path}`;
    try {
        const rawData = fs.readFileSync(filePath, null);
        return rawData;
    } catch (err) {
        console.error(err);
        return null;
    }
}