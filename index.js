const { resolve, join } = require('path');
const { readFile, writeFile, unlink, mkdir } = require('fs');

const chokidar = require('chokidar');
const rmdir = require('rimraf');

const copyFile = (sourcePath, targetPath, callback) => {
  readFile(sourcePath, 'utf8', (error, data) => {
    if (error) throw error;
    writeFile(targetPath, data, (error) => {
      if (error) throw error;
      callback();
    });
  });
}

try {
  if (process.argv.length < 3) {
    throw 'Error: Missing path of related project.';
  }
}
catch (e) {
  console.log(e);
  process.exit(1);
}

const targetBasePath = resolve(
  __dirname,
  process.argv[2],
  'node_modules',
  '@elumeo',
  'jfs-core'
);

const printLogs = process.argv[3] === '--print-logs';

console.log(`Files in ${targetBasePath} will be synchronized with ${__dirname}`);

if (printLogs) {
  console.log('Applied changes will be printed to this console.');
}

['app', 'library', 'scripts', 'settings'].map(corePath => {
  const whitelistPrefixes = [];
  const watcher = chokidar.watch(resolve(__dirname, corePath));
  setTimeout(() =>
  watcher.on('all', (event, sourcePath) => {
    const corePath = sourcePath.substring(__dirname.length, sourcePath.length);
    const targetPath = join(targetBasePath, corePath);

    switch (event) {
      case 'addDir': {
        mkdir(targetPath, error => {
          if (error) throw error;
          if (printLogs) console.log(`Created ${targetPath}`);
        });
        break;
      }
      case 'add':
      case 'change': {
        copyFile(sourcePath, targetPath, () => {
          if (printLogs) console.log(`${event === 'add' ? 'Created' : 'Updated'} ${targetPath}`);
        });
        break;
      }
      case 'unlink': {
        const prefixMatch = prefix =>
          targetPath.substring(0, prefix.length) === prefix;

        if (whitelistPrefixes.find(prefixMatch) === undefined) {
          unlink(targetPath, error => {
            if (error) throw error;
            if (printLogs) console.log(`Removed ${targetPath}`);
          });
        }
        break;
      }
      case 'unlinkDir':{
        whitelistPrefixes.push(targetPath);
        rmdir(targetPath, () => {
          if (printLogs) console.log(`Removed ${targetPath}`);
          setTimeout(() => {
            let offset = 0;
            while (whitelistPrefixes.indexOf(targetPath, offset) !== -1) {
              const index = whitelistPrefixes.indexOf(targetPath, offset);
              whitelistPrefixes.splice(index, 1);
            }
          }, 1000)
        });
        break;
      }
      default: {

      }
    }
  }), 1000);
});
