const { readdirSync } = require("fs");
const { execSync } = require("child_process");

// check dimensions of all images
getImages("./images").forEach((path) => checkDimensions(path, 600, 600));
getImages("./print").forEach((path) => checkDimensions(path, 1200, 1200));

// strip all meta to ensure consistency
execSync("exiftool -All= -r ./images");
execSync("exiftool -All= -r ./print");

// get all images in a folder
function getImages(path, extension = "png") {
  return readdirSync(path)
    .filter((file) => file.endsWith(`.${extension}`))
    .map((file) => `${path}/${file}`);
}

// check dimensions of image
function checkDimensions(path, expectedWidth, expectedHeight) {
  const [width, height] = execSync(
    `exiftool -s -s -s -ImageWidth -ImageHeight ${path}`
  )
    .toString()
    .split(/\s/)
    .filter(Boolean)
    .map(Number);
  if (width !== expectedWidth || height !== expectedHeight)
    throw Error(
      `${file} is ${width} × ${height}, expected ${expectedWidth} × ${expectedHeight}`
    );
}
