import { readdirSync, readFileSync, existsSync } from "fs";
import { ExifTool } from "exiftool-vendored";

const exiftool = new ExifTool();

(async () => {
  await checkDimensions("./images", 600, 600);
  await checkDimensions("./print", 1200, 1200);

  checkList("software.json");
  checkList("groups.json");

  await exiftool.end();
})();

// check list of entries in json file
function checkList(filename) {
  console.info(`Checking list "${filename}"`);

  // load and parse list
  const list = JSON.parse(readFileSync(filename, { encoding: "utf8" }));

  for (const [index, entry] of Object.entries(list)) {
    console.info(`Checking entry ${+index + 1} of ${list.length}`);

    // check fields
    if (!entry.name?.trim()) throw Error(`Missing field "name"`);
    if (!entry.description?.trim()) throw Error(`Missing field "description"`);
    if (!entry.link?.trim()) throw Error(`Missing field "link"`);

    // check for associated images
    const filename = entry.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const image = `./images/${filename}.png`;
    const print = `./print/${filename}.png`;
    if (!existsSync(image)) throw Error(`Missing image "${image}"`);
    if (!existsSync(print)) throw Error(`Missing image "${print}"`);

    // check length
    if (entry.name?.trim().length > 40)
      throw Error(`Name too long "${entry.name}"`);
    if (entry.description?.trim().length > 120)
      throw Error(`Description too long "${entry.description}"`);
  }
}

// check dimensions of images in folder
async function checkDimensions(
  folder,
  expectedWidth,
  expectedHeight,
  extension = "png"
) {
  // get all images matching extension in folder
  const paths = readdirSync(folder)
    .filter((filename) => filename.endsWith(`.${extension}`))
    .map((filename) => `${folder}/${filename}`);

  for (const [index, path] of Object.entries(paths)) {
    console.info(`Checking "${path}" (${+index + 1} of ${paths.length})`);

    // extract metadata
    const {
      ImageWidth: width,
      ImageHeight: height,
      ColorType: colorspace,
    } = await exiftool.read(path);

    // check dimensions
    if (width !== expectedWidth || height !== expectedHeight)
      throw Error(
        `${width} × ${height}, expected ${expectedWidth} × ${expectedHeight}`
      );

    // check color space
    if (!colorspace.toLowerCase().includes("rgb"))
      throw Error(`Colorspace "${colorspace}", expected RGB`);
  }
}
