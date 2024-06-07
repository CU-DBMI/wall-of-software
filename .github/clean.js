import { readdirSync, unlinkSync } from "fs";
import { ExifTool } from "exiftool-vendored";

const exiftool = new ExifTool({ taskTimeoutMillis: 5000 });

(async () => {
  await stripMeta("./images");
  await stripMeta("./print");

  exiftool.end();
})();

// strip all metadata from all images in folder to ensure consistency
async function stripMeta(folder) {
  await exiftool.deleteAllTags(folder, ["-recurse", "-overwrite_original"]);
  // delete originals
  readdirSync(folder)
    .filter((filename) => filename.endsWith("_original"))
    .map((filename) => `${folder}/${filename}`)
    .forEach(unlinkSync);
}
