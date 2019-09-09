const { FsNode } = require('../filesystem/fsnode.js');
const { Directory } = require('../filesystem/directory.js');
const { PackageJSON } = require('./packageJSON.js');
const { input } = require('../../library/io/IO.js');
const ChangeLog = require('./changeLog.js');
const SimpleGit = require('simple-git');

// ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----

class Project extends Directory
{
  constructor()
  {
    super(...Array.from(arguments));
    this.packageJSON = new PackageJSON(this.path);
    this.changeLog = new ChangeLog(this);
    this.git = SimpleGit(this.path);
  }

  url(callback, user = 'scharfohnezwiebeln')
  {
    callback(`https://github.com/${user}/${this.name}.git`)
  }

  remote(callback)
  {
    this.git.getRemotes((error, remotes) => callback(remotes[0]));
  }

  branch(callback)
  {
    this.git.branch(null, (error, branch) => callback(branch));
  }

  status(callback)
  {
    this.git.status((error, status) =>
    {
      if (error) throw error;
      callback(status)
    });
  }

  pull(callback = () => {})
  {
    this.git.pull(callback);
  }

  checkout(checkoutWhat, callback = () => {})
  {
    this.git.checkout(checkoutWhat, callback);
  }

  clone(callback = () => {})
  {
    this.url(url => this.git.clone(url, this.path, error =>
    {
      if (error) throw error;
      callback();
    }));
  }

  host(newHost, callback = () => {})
  {
    const file = this.file('config.json.dist').read(string =>
    {
      const json = JSON.parse(string);
      json.Clients.Host = newHost;
      file.write(JSON.stringify(json, null, 2), callback);
    });
  }
}

// ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----

module.exports.Project = Project;
