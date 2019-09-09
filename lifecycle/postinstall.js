const { Project } = require('../library/project/project');
const { Directory } = require('../library/filesystem/directory');

const { sep } = require('path');

const { packageJSON } = new Project;

if (packageJSON.exists) {
  const scriptsDirectory = new Directory(__dirname, '..', 'scripts');
  packageJSON.read(string => {
    const { scripts } = JSON.parse(string);
    scriptsDirectory.directories(directories => {
      const base = './jfs_core/scripts';
      directories.map(({ name }, index) =>
        scripts[name] = `node ${base}/${name}/index.js`);
      packageJSON.set('scripts', scripts);
    });
  });
}
