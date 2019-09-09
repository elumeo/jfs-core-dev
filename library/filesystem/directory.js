const { open, readdir, mkdir, lstat } = require('fs');
const {sep, resolve} = require('path');
const { spawn } = require('child_process');
const rmdir = require('rimraf');
const { ncp } = require('ncp');

const { FsNode } = require('./fsnode.js');
const { File } = require('./file.js');
const { Link } = require('./link.js');

function search(settings, child)
{
  for (const criterion in settings) if (child[criterion] !== settings[criterion])
  {
    return false;
  }
  return true;
}

class Directory extends FsNode
{
  constructor()
  {
    super(...Array.from(arguments));
    this.type = 'directory';
  }

  create(callback = () => {})
  {
    if (!this.exists) mkdir(this.path, { recursive: true }, error =>
    {
      if (error) throw error;
      this.exists = true;
      callback();
    });
    else callback();
  }

  detect(name, callback)
  {
    const path = resolve(this.path, name);
    lstat(path, (error, stats) =>
    {
      if (error) throw error;
      if (stats.isSymbolicLink()) callback(new Link(path));
      if (stats.isFile()) callback(new File(path));
      if (stats.isDirectory()) callback(new Directory(path));
    });
  }

  explore(callback)
  {
    readdir(this.path, (error, names) =>
    {
      if (error) throw error;
      if (!names.length) callback(null, null, []);
      for (let i = 0; i < names.length; i++)
      {
        const name = names[i];
        this.detect(name, fsNode => callback(fsNode, i, names));
      }
    })
  }

  fsNodes(callback)
  {
    if (this.exists)
    {
      const fsNodes = [];
      this.explore((fsNode, index, names) =>
      {
        if (fsNode === null || index === null) callback([]);
        else fsNodes.push(fsNode);
        if (index +1 === names.length) callback(fsNodes);
      });
    }
  }

  find(settings, callback = () => {})
  {
    this.fsNodes(fsNodes =>
    {
      callback( fsNodes.filter(fsNode => search(settings, fsNode)) );
    });
  }

  files(callback)
  {
    this.find({ type: 'file' }, callback);
  }

  file(name)
  {
    return new File(this.path, name);
  }

  directories(callback)
  {
    this.find({ type: 'directory' }, callback);
  }

  directory(name)
  {
    return new Directory(this.path, name);
  }

  remove(callback = () => {})
  {
    rmdir(this.path, callback);
  }

  copy(path, callback = () => {})
  {
    ncp(this.path, path, error =>
    {
      if (error) throw error;
      callback();
    });
  }

  paths(callback)
  {
    this.fsNodes(fsNodes => callback(fsNodes.map(fsNode => fsNode.path)));
  }

  run(command, parameters = [], callback = () => {})
  {
    const options = {};
    options.cwd = this.path
    const task = spawn(command, parameters, options);
    task.stdout.on('data', data => console.log(data.toString()));
    task.stderr.on('data', data => console.log(data.toString()));
    task.on('exit', code => callback(code, task));
  }
};

module.exports.Directory = Directory;
