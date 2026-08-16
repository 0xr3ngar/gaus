import type { DecodedImage } from "./model";
import { assert } from "./assert";
import { Buffer } from "buffer";

const MIN_SIZE = 54; // 14-byte file header + 40-byte BITMAPINFOHEADER

const stride = (width: number, channels: number) => Math.floor((width * channels + 3) / 4) * 4;

export const decode = (bytes: Uint8Array): DecodedImage => {
    const buf = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (bytes.length < MIN_SIZE || buf.readUInt16LE(0) !== 0x4d42) throw new Error("not a valid bmp file");

    const offset = buf.readUInt32LE(10);
    const width = buf.readInt32LE(18);
    const signedHeight = buf.readInt32LE(22);
    const bpp = buf.readUInt16LE(28);
    const compression = buf.readUInt32LE(30);

    if (buf.readUInt32LE(14) < 40) throw new Error("unsupported bmp header");
    if (buf.readUInt16LE(26) !== 1) throw new Error("unsupported bmp planes");
    if (bpp !== 24 && bpp !== 32) throw new Error(`unsupported bmp: ${bpp} bpp`);
    if (compression !== 0) throw new Error("unsupported bmp: compression must be BI_RGB");
    if (width <= 0 || signedHeight === 0) throw new Error("invalid bmp dimensions");
    if (offset < MIN_SIZE || offset + stride(width, bpp / 8) * Math.abs(signedHeight) > bytes.length)
        throw new Error("corrupt bmp pixel data");

    const channels = bpp / 8;
    const height = Math.abs(signedHeight);
    const bottomUp = signedHeight > 0;
    const data = new Uint8Array(width * height * channels);

    // always store bottom-up, drop row padding
    for (let y = 0; y < height; y++) {
        const src = offset + y * stride(width, channels);
        const dst = (bottomUp ? y : height - 1 - y) * width * channels;
        data.set(bytes.subarray(src, src + width * channels), dst);
    }

    return { width, height, channels, data };
};

export const buildBmp = (image: DecodedImage, pixels: Uint8Array): Uint8Array => {
    const { width, height, channels } = image;
    assert(pixels.length === width * height * channels, "pixel buffer size to match image");

    const s = stride(width, channels);
    const out = Buffer.alloc(MIN_SIZE + s * height);

    out.writeUInt16LE(0x4d42, 0); // "BM"
    out.writeUInt32LE(out.length, 2); // file size
    out.writeUInt32LE(MIN_SIZE, 10); // pixel data offset
    out.writeUInt32LE(40, 14); // DIB size
    out.writeUInt32LE(width, 18);
    out.writeUInt32LE(height, 22); // bottom-up
    out.writeUInt16LE(1, 26); // planes
    out.writeUInt16LE(channels * 8, 28); // bits per pixel
    out.writeUInt32LE(s * height, 34); // pixel array size

    for (let y = 0; y < height; y++) {
        const src = y * width * channels;
        out.set(pixels.subarray(src, src + width * channels), MIN_SIZE + y * s);
    }

    return out;
};
