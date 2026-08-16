import type { DecodedImage } from "./model";
import { buildBmp } from "./decode";
import { assert } from "./assert";

const DEFAULT_SIGMA = 1.5;

const gaussianKernel = (sigma: number, radius: number): Float64Array => {
  const kernel = new Float64Array(radius * 2 + 1);
  let sum = 0;
  for (let i = -radius; i <= radius; i++) {
    kernel[i + radius] = Math.exp(-(i * i) / (2 * sigma * sigma));
    sum += kernel[i + radius]!;
  }
  for (let i = 0; i < kernel.length; i++) kernel[i] = kernel[i]! / sum;
  return kernel;
};

// separable gaussian blur, edges clamped (replicated)
export const blur = (image: DecodedImage): Uint8Array => {
  const { width, height, channels, data } = image;
  assert(data.length === width * height * channels, "decoded image data");

  const sigma = Math.abs(parseFloat(process.env.GAUS_SIGMA ?? "")) || DEFAULT_SIGMA;
  const radius = Math.max(1, Math.ceil(sigma * 3));
  const kernel = gaussianKernel(sigma, radius);

  const tmp = new Float64Array(data.length);
  const out = new Uint8Array(data.length);

  // horizontal pass
  for (let y = 0; y < height; y++) {
    const row = y * width * channels;
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < channels; c++) {
        let acc = 0;
        for (let t = -radius; t <= radius; t++) {
          const sx = Math.min(width - 1, Math.max(0, x + t));
          acc += data[row + sx * channels + c]! * kernel[t + radius]!;
        }
        tmp[row + x * channels + c] = acc;
      }
    }
  }

  // vertical pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < channels; c++) {
        let acc = 0;
        for (let t = -radius; t <= radius; t++) {
          const sy = Math.min(height - 1, Math.max(0, y + t));
          acc += tmp[(sy * width + x) * channels + c]! * kernel[t + radius]!;
        }
        out[y * width * channels + x * channels + c] = Math.min(255, Math.max(0, Math.round(acc)));
      }
    }
  }

  return buildBmp(image, out);
};
