import fs from 'node:fs';

const version = JSON.parse(fs.readFileSync('version.json', 'utf8'));
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
if (!semver.test(version.versionName)) {
  throw new Error(`Invalid versionName: ${version.versionName}`);
}
if (!Number.isInteger(version.versionCode) || version.versionCode < 1) {
  throw new Error(`Invalid versionCode: ${version.versionCode}`);
}
if (pkg.version !== version.versionName) {
  throw new Error(`Version source mismatch: package.json=${pkg.version}, version.json=${version.versionName}`);
}

console.log(`Release version contract PASS: ${version.versionName} / versionCode ${version.versionCode}`);
