const { File } = require('../filesystem/file.js');
const { Directory } = require('../filesystem/directory.js');
const Version = require('./version.js');
const { utilities: string } = require('../utilities.js');

// ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----

class PackageJSON extends File
{
  constructor()
  {
    super(...Array.from(arguments), 'package.json');
  }

  getVersion(callback)
  {
    this.get('version', version =>
    {
      callback(new Version(version));
    });
  }

  setVersion(version)
  {
    this.set('version', version.toString());
  }

  get(key, callback)
  {
    this.read(string =>
    {
      const json = JSON.parse(string);
      callback(json[key]);
    });
  }

  set(key, value, callback = () => {})
  {
    this.read(string =>
    {
      const json = JSON.parse(string);
      json[key] = value;
      this.write(JSON.stringify(json, null, 2), () =>
      {
        callback(json);
      });
    });
  }
}

// ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- ----- -----

module.exports.PackageJSON = PackageJSON;
