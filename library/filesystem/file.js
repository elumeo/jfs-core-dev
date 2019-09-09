const {readFile, unlink, appendFile, writeFile} = require('fs');
const {sep, resolve} = require('path');
const {spawn} = require('child_process');

const { FsNode } = require('./fsnode.js');

class File extends FsNode
{
  constructor()
  {
    super(...Array.from(arguments));
    const parts = this.name.split('.');
    this.suffix = parts[parts.length -1];
    this.type = 'file';
  }

  create(callback = () => {})
  {
    appendFile(this.path, '', 'utf8', error =>
    {
      if (error) throw error;
      this.exists = true;
      callback();
    });
  }

  read(callback = () => {})
  {
    readFile(this.path, 'utf8', (error, string) =>
    {
      if (error) throw error;
      callback(string);
    });
  }

  write(string, callback = () => {})
  {
    writeFile(this.path, string, 'utf8', error =>
    {
      if (error) throw error;
      callback();
    });
  }

  remove(callback = () => {})
  {
    unlink(this.path, error =>
    {
      if (error) throw error;
      callback();
    });
  }

  copy(parent, callback = () => {})
  {
    const file = new File(parent, this.name);
    this.read(string => file.create(() => file.write(string, () => callback(file))));
  }
};

module.exports.File = File;
