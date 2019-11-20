#! /usr/bin/env node


function depends(folder) {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const descriptor = require(`./${folder}/package.json`);
  return {
    folder,
    name: descriptor.name,
    dependencies: Object.keys(descriptor.dependencies || {}),
  };
}

function lorder(workspaces) {
  const descriptors = workspaces.sort().reverse().map(depends);
  return descriptors.map((entry) => entry.dependencies
    .map((name) => descriptors.find((descriptor) => descriptor.name === name))
    .filter((descriptor) => !!descriptor)
    .map((descriptor) => ([descriptor.folder, entry.folder]))
    .concat([[entry.folder, entry.folder]]))
    .reduce((result, pair) => result.concat(pair));
}

if (require.main === module) {
  // eslint-disable-next-line global-require
  lorder(require('./package.json').workspaces).forEach((entry) => {
    process.stdout.write(`${entry.join(' ')}\n`);
  });
} else {
  exports = depends;
}
