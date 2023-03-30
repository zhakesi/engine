let fs = null;
export function JsReadFile (path) {
    if (!fs) fs = require('fs');
    try {
        const rawData = fs.readFileSync(path, null);
        return rawData;
    } catch (err) {
        console.error(err);
        return null;
    }
}