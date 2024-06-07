const { execSync } = require("child_process");

export function exec(command, print = true) {
  const result = execSync(command).toString().trim();
  if (print) console.log(result);
  return result;
}
