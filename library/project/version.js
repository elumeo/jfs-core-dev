class Version
{
  constructor(versionString)
  {
    this.versionNames = ['major', 'minor', 'hotfix'];
    this.parse(versionString);
  }

  parse(versionString)
  {
    versionString
      .split('.')
      .map((number, index) => this[this.versionNames[index]] = number);
  }

  bump(versionName)
  {
    this[versionName]++;
    const resetStart = this.versionNames.indexOf(versionName) +1;
    for (let i = resetStart; i < this.versionNames.length; i++)
    {
      this[this.versionNames[i]] = 0;
    }
  }

  toString()
  {
    return this.versionNames.map(versionName => this[versionName]).join('.');
  }
}

module.exports = Version;
