import { ExifTool } from "exiftool-vendored";

const exiftool = new ExifTool();

await stripMeta("./images");
await stripMeta("./print");

await exiftool.end();

// strip all metadata from all images in folder to ensure consistency
async function stripMeta(folder) {
  await exiftool.write(folder, {}, [
    "-All=",
    "-recurse",
    "-overwrite_original",
  ]);
}
