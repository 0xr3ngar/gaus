export const save = async (image: Uint8Array, path: string) => {
    const dotIndex = path.lastIndexOf('.');

    const outPath = dotIndex === -1
        ? path + "-blur"
        : path.slice(0, dotIndex) + "-blur" + path.slice(dotIndex);


    await Bun.write(outPath, image);
};

export const get = async (path: string) => {
    const file = Bun.file(path);
    if (!file.exists()) {
        throw new Error(`file not found: ${path}`);
    }
    return await file.bytes();
};
