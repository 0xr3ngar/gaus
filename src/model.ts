/**
 * A decoded image in memory: raw pixel bytes + geometry.
 *
 * `data` is a flat buffer of pixel values — one byte per channel,
 * rows stored consecutively. There is no "row" concept in the buffer;
 * `width` and `channels` are the ruler that tells you where rows break:
 *
 *   index of pixel (x, y), channel c = (y * width + x) * channels + c
 *
 * Channel order is whatever the source format used (BMP stores BGR,
 * not RGB). Blur treats channels independently, so order never matters
 * to it — but an encoder must write the bytes back in the same order.
 */
export type DecodedImage = {
    width: number;
    height: number;
    channels: number;
    data: Uint8Array;
};
