const fs = require("fs");
const path = require("path");
const semver = require("semver");

const packageJsonPath = path.join(__dirname, "../package.json");
const packageJson = require(packageJsonPath);

const { execSync } = require("child_process");

const diffOutput = execSync("git diff --stat HEAD~1 HEAD").toString();

let additions = 0;
let deletions = 0;

const diffLines = diffOutput.split("\n");
diffLines.forEach((line) => {
  const match = line.match(/(\d+) insertions\(\+\), (\d+) deletions\(\-\)/);
  if (match) {
    additions += parseInt(match[1], 10);
    deletions += parseInt(match[2], 10);
  }
});

let newVersion = packageJson.version;

if (deletions > 0) {
  newVersion = semver.inc(newVersion, "minor");
} else if (additions > 0) {
  newVersion = semver.inc(newVersion, "patch");
}

// Only update package.json if the version has changed
if (newVersion !== packageJson.version) {
  packageJson.version = newVersion;
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + "\n"
  );
  console.log(`Version bumped to ${newVersion}`);
} else {
  console.log("No version bump needed");
}
