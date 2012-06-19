var AssetsExpander = require('assets-expander'),
  fs = require('fs'),
  path = require('path');

var AssetsInclude = function(pathToConfig, options) {
  this.options = options;
  this.pathToConfig = pathToConfig;
};

AssetsInclude.prototype = {
  group: function(locator) {
    var self = this,
      rootPath = process.cwd(),
      assetInfo = this._assetInfo(locator),
      asHTMLFragment = '';

    if (this.options.bundled) {
      asHTMLFragment = this._assetFragment(self._bundledPath(assetInfo), rootPath, assetInfo);
    } else {
      var expanderOptions = {
        root: this.options.root,
        type: assetInfo.typeExt
      };
      // TODO: We should be sharing one instance of AssetsExpander but it does not allow passing 'typeExt' to processGroup
      new AssetsExpander(this.pathToConfig, expanderOptions)
        .processGroup(assetInfo.type, assetInfo.group)
        .forEach(function(assetPath) {
          asHTMLFragment += self._assetFragment(assetPath, rootPath, assetInfo);
        });
    }

    return asHTMLFragment;
  },

  inline: function(locator) {
    if (!this.options.bundled)
      return this.group(locator);

    var assetInfo = this._assetInfo(locator),
      data = fs.readFileSync(this._bundledPath(assetInfo), 'utf-8');

    switch (assetInfo.typeExt) {
      case 'css':
        return "<style type=\"text/css\">" + data + "</style>";
      case 'js':
        return "<script>" + data + "</script>";
    }
  },

  _assetFragment: function(assetPath, rootPath, assetInfo) {
    var relativePath = assetPath.replace(this.options.root, ''),
      mtime = assetPath.indexOf('/') == 0 ?
        fs.statSync(assetPath).mtime.getTime() :
        fs.statSync(path.join(rootPath, assetPath)).mtime.getTime(),
      fragment = '';

    switch(assetInfo.typeExt) {
      case 'css':
      case 'less':
        fragment = "<link href=\"" + relativePath + "?" + mtime + "\" media=\"screen\" rel=\"stylesheet/" + assetInfo.typeExt + "\"/>";
        break;
      case 'js':
        fragment = "<script src=\"" + relativePath + "?" + mtime + "\"></script>";
    }

    return fragment;
  },

  _bundledPath: function(assetInfo) {
    return path.join(this.options.root, assetInfo.type, 'bundled', assetInfo.group + '.' + assetInfo.typeExt);
  },

  _assetInfo: function(locator) {
    var firstSlashIndex = locator.indexOf('/'),
      lastDotIndex = locator.lastIndexOf('.');

    return {
      type: locator.substring(0, firstSlashIndex),
      typeExt: locator.substring(lastDotIndex + 1),
      group: locator.substring(firstSlashIndex + 1, lastDotIndex)
    };
  }
};

module.exports = AssetsInclude;