const {existsSync, mkdirSync, lstatSync, lstat, rename} = require('fs');
const {sep, resolve} = require('path');

class FsNode
{
  constructor(path)
  {
    this.path = resolve(...Array.from(arguments));
    const parts = this.path.split(sep);
    this.name = parts[parts.length -1];
    this.parent = parts.slice(0, parts.length -1).join(sep);
    this.exists = existsSync(this.path);
  }

  type(callback)
  {
    lstat(this.path, (error, stats) =>
    {
      if (error) throw error;

      if (stats.isSymbolicLink()) callback('link');
      if (stats.isFile()) callback('file');
      if (stats.isDirectory()) callback('directory');
    })
  }

  rename(name, callback = () => {})
  {
    const parts = this.path.split(sep);
    parts.pop();
    parts.push(name);
    const path = parts.join(sep);
    rename(this.path, path, error =>
    {
      if (error) throw error;
      callback();
    });
  }
};

module.exports.FsNode = FsNode;
