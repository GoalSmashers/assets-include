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

    return this.list(locator)
      .map(function(assetPathWithMTime) {
        return self._assetFragment(assetPathWithMTime, rootPath, assetInfo);
      })
      .join('');
  },

  list: function(locator) {
    self = this,
      rootPath = process.cwd(),
      assetInfo = this._assetInfo(locator),
      assetsList = [];

    if (this.options.bundled) {
      return [self._assetPathWithMTime(self._bundledPath(assetInfo), rootPath)];
    } else {
      var expanderOptions = {
        root: this.options.root,
        type: assetInfo.typeExt
      };
      // TODO: We should be sharing one instance of AssetsExpander but it does not allow passing 'typeExt' to processGroup
      new AssetsExpander(this.pathToConfig, expanderOptions)
        .processGroup(assetInfo.type, assetInfo.group)
        .forEach(function(assetPath) {
          assetsList.push(self._assetPathWithMTime(assetPath, rootPath))
        });
      return assetsList;
    }
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

  _assetPathWithMTime: function(assetPath, rootPath) {
    var relativePath = assetPath.replace(this.options.root, ''),
      mtime = assetPath.indexOf('/') == 0 ?
        fs.statSync(assetPath).mtime.getTime() :
        fs.statSync(path.join(rootPath, assetPath)).mtime.getTime();

    return relativePath + "?" + mtime;
  },

  _assetFragment: function(assetPathWithMTime, rootPath, assetInfo) {
    switch(assetInfo.typeExt) {
      case 'css':
      case 'less':
        return "<link href=\"" + assetPathWithMTime + "\" media=\"screen\" rel=\"stylesheet/" + assetInfo.typeExt + "\"/>";
      case 'js':
        return "<script src=\"" + assetPathWithMTime + "\"></script>";
    }
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