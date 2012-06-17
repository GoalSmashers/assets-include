var AssetsExpander = require('assets-expander'),
  fs = require('fs'),
  path = require('path');

var AssetsInclude = function(pathToConfig, options) {
  this.options = options;
  this.expander = new AssetsExpander(pathToConfig, options);
};

AssetsInclude.prototype = {
  group: function(groupName) {
    var tokens = groupName.split('/'),
      type = tokens[0],
      name = tokens[1],
      asHTMLFragment = '',
      self = this,
      rootPath = process.cwd();

    this.expander.processGroup(type, name).forEach(function(assetPath) {
      var relativePath = assetPath.replace(self.options.root, ''),
        mtime = fs.statSync(path.join(rootPath, assetPath)).mtime.getTime();

      switch(self.options.type) {
        case 'css':
        case 'less':
          asHTMLFragment += "<link href=\"" + relativePath + "?" + mtime + "\" media=\"screen\" rel=\"stylesheet/" + self.options.type + "\"/>";
          break;
      }
    });

    return asHTMLFragment;
  },

  inline: function(groupName) {

  }
};

module.exports = AssetsInclude;