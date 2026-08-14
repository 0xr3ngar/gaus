import type { DecodedImage } from "./model";

export const blur = (image: DecodedImage): Uint8Array => {
    console.log("blur", image);
    throw new Error("not implemented");
};
