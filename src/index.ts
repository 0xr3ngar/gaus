import { assert, assertDefined } from "./assert";
import { blur } from "./blur";
import { decode } from "./decode";
import { save, get } from "./file";

const main = async (argv: string[], argc: number) => {
    assert(argc <= 2, "Please supply an image to blur");
    assert(argc > 3, "Please only provide a file path to the image");
    const filePath = assertDefined(argv[2], "argv is a string");

    const bytes = await get(filePath);
    const decoded = decode(bytes);
    const blurred = blur(decoded);

    save(blurred, filePath);

    return 0;
};

if (import.meta.main) {
    const args = process.argv;

    main(args, args.length);
}
