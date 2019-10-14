const fs = require('fs');
const path = require('path');
const process = require('process');

const INDEX_SOURCE = process.argv[2];
if(!INDEX_SOURCE) {
    throw new Error('Index source path not set');
}
const INDEX_DEST = process.argv[3];
if(!INDEX_DEST) {
    throw new Error('Index destination path not set');
}
const BASE_URL = process.argv[4];
if(!BASE_URL) {
    throw new Error('Base URL not set');
}

const sourceFilePath = path.join(process.cwd(), INDEX_SOURCE);
let content = fs.readFileSync(sourceFilePath, { 'encoding': 'utf-8' });
content = content.replace(/<base\s+href="[^"]*">/, `<base href="${BASE_URL}">`);
const destFilePath = path.join(process.cwd(), INDEX_DEST);
fs.writeFileSync(destFilePath, content);
