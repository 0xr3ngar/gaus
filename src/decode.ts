import type { DecodedImage } from "./model";

const BMP_HEX = "424d"

export const decode = (bytes: Uint8Array): DecodedImage => {
    if (bytes.subarray(0, 2).toHex() !== BMP_HEX) {
        throw new Error("file is not a valid bmp file: magic number is not BM");
    }

    console.log("decode", bytes);
    throw new Error("not implemented");
};
