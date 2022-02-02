import {createWriteStream, mkdir} from "fs";
import shortid from "shortid";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const  Readable = require('stream').Readable;

export const storeImage = (imageBase64Value: string, filename: string) => {
    mkdir("images", { recursive: true }, (err: any) => {
        if (err) throw err;
    });

    const id = shortid.generate();
    const base64Image = imageBase64Value.split(';base64,').pop();
    const uploadDir = 'images';
    const path = `${uploadDir}/${id}-${filename}`;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const imgBuffer = Buffer.from(base64Image, 'base64')

    const readable = new Readable()
    readable.push(imgBuffer)
    readable.push(null)
    readable.pipe(createWriteStream(path));
    return path;
}