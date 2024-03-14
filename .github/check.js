const { readdirSync, readFileSync, existsSync } = require("fs");
const { execSync } = require("child_process");

// strip all metadata to ensure consistency
exec("exiftool -All= -r -overwrite_original ./images");
exec("exiftool -All= -r -overwrite_original ./print");

checkDimensions("./images", 600, 600);
checkDimensions("./print", 1200, 1200);

checkList("software.json");
checkList("groups.json");

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

// check dimensions of images in directory
function checkDimensions(
  directory,
  expectedWidth,
  expectedHeight,
  extension = "png"
) {
  // get all images matching extension in directory
  const paths = readdirSync(directory)
    .filter((filename) => filename.endsWith(`.${extension}`))
    .map((filename) => `${directory}/${filename}`);

  for (const [index, path] of Object.entries(paths)) {
    console.info(`Checking "${path}" (${+index + 1} of ${paths.length})`);

    // extract dimensions
    const [width, height] = exec(
      `exiftool -s3 -ImageWidth -ImageHeight ${path}`,
      false
    )
      .split(/\s/)
      .filter(Boolean)
      .map(Number);

    // check dimensions
    if (width !== expectedWidth || height !== expectedHeight)
      throw Error(
        `${width} × ${height}, expected ${expectedWidth} × ${expectedHeight}`
      );

    // check color space
    const colorspace = exec(`exiftool -s3 -ColorType ${path}`, false);
    if (!colorspace.toLowerCase().includes("rgb"))
      throw Error(`Colorspace "${colorspace}", expected RGB`);
  }
}

function exec(command, print = true) {
  const result = execSync(command).toString().trim();
  if (print) console.log(result);
  return result;
}
