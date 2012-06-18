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

    if (this.options.bundled) {
      asHTMLFragment = this._assetFragment(self.options.root + '/' + type + '/bundled/' + name + '.' + this.options.type, rootPath);
    } else {
      this.expander.processGroup(type, name).forEach(function(assetPath) {
        asHTMLFragment += self._assetFragment(assetPath, rootPath);
      });
    }

    return asHTMLFragment;
  },

  inline: function(groupName) {
    if (!this.options.bundled)
      return this.group(groupName);

    var tokens = groupName.split('/'),
      type = tokens[0],
      name = tokens[1],
      assetPath = path.join(this.options.root, type, 'bundled', name + '.' + this.options.type),
      data = fs.readFileSync(assetPath, 'utf-8');

    switch (this.options.type) {
      case 'css':
        return "<style type=\"text/css\">" + data + "</style>";
      case 'js':
        return "<script>" + data + "</script>";
    }
  },

  _assetFragment: function(assetPath, rootPath) {
    var relativePath = assetPath.replace(this.options.root, ''),
      mtime = fs.statSync(path.join(rootPath, assetPath)).mtime.getTime(),
      fragment = '';

    switch(this.options.type) {
      case 'css':
      case 'less':
        fragment = "<link href=\"" + relativePath + "?" + mtime + "\" media=\"screen\" rel=\"stylesheet/" + this.options.type + "\"/>";
        break;
      case 'js':
        fragment = "<script src=\"" + relativePath + "?" + mtime + "\"></script>";
    }

    return fragment;
  }
};

module.exports = AssetsInclude;