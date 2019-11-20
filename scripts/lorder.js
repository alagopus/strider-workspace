#! /usr/bin/env node

const Promise = require('bluebird');
const readFile = Promise.promisify(require('fs').readFile);

function readJSON(filename) {
  return readFile(filename, 'utf8').then((data) => JSON.parse(data));
}

function depends(folder) {
  return readJSON(`${folder}/package.json`)
    .then((descriptor) => ({
      folder,
      name: descriptor.name,
      dependencies: Object.keys(descriptor.dependencies || {}),
    }));
}

function lorder(workspaces) {
  return Promise.all(workspaces.sort().reverse().map(depends))
    .then((descriptors) => descriptors.map((entry) => entry.dependencies
      .map((name) => descriptors.find((descriptor) => descriptor.name === name))
      .filter((descriptor) => !!descriptor)
      .map((descriptor) => ([descriptor.folder, entry.folder]))
      .concat([[entry.folder, entry.folder]]))
      .reduce((result, pair) => result.concat(pair)));
}

if (require.main === module) {
  readJSON('package.json')
    .then((data) => lorder(data.workspaces))
    .then((entries) => {
      entries.forEach((entry) => process.stdout.write(`${entry.join(' ')}\n`));
    })
    .catch((failure) => { process.stderr.write(failure.toString()); });
} else {
  exports = depends;
}
