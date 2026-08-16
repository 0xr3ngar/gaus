# gaus

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/index.ts <image.bmp>
```

Blurs a 24/32-bit uncompressed (BI_RGB) BMP and writes `<image>-blur.bmp`
next to it. `GAUS_SIGMA` env var adjusts the blur strength (default 1.5).

This project was created using `bun init` in bun v1.3.14. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
