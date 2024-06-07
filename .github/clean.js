const { exec } = require("./util");

// install exiftool
exec("sudo apt install exiftool");

// strip all metadata to ensure consistency
exec("exiftool -All= -r -overwrite_original ./images");
exec("exiftool -All= -r -overwrite_original ./print");
