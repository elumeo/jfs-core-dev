const {unlink} = require('fs');
const {FsNode} = require('./fsnode.js');

class Link extends FsNode
{
  constructor()
  {
    super(...Array.from(arguments));
  }

  remove(callback = () => {})
  {
    this.unlink(this.path, error =>
    {
      if (error) throw error;
      callback();
    });
  }
}

module.exports.Link = Link;
