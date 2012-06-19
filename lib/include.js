var AssetsExpander = require('assets-expander'),
  fs = require('fs'),
  path = require('path');

var AssetsInclude = function(pathToConfig, options) {
  this.options = options;
  this.pathToConfig = pathToConfig;
  this.rootPath = process.cwd();

  if (this.options.root.indexOf('/') > 0)
    this.options.root = path.normalize(path.join(this.rootPath, this.options.root));
};

AssetsInclude.prototype = {
  group: function(locator) {
    var self = this,
      bundleInfo = this._bundleInfo(locator),
      asHTMLFragment = '';

    return this.list(locator)
      .map(function(assetPathWithMTime) {
        return self._assetFragment(assetPathWithMTime, bundleInfo);
      })
      .join('');
  },

  list: function(locator) {
    self = this,
      bundleInfo = this._bundleInfo(locator);

    if (this.options.bundled) {
      return [self._assetPathWithMTime(self._bundledPath(bundleInfo))];
    } else {
      var expanderOptions = {
        root: this.options.root,
        type: bundleInfo.typeExt
      };
      // TODO: We should be sharing one instance of AssetsExpander but it does not allow passing 'typeExt' to processGroup
      return new AssetsExpander(this.pathToConfig, expanderOptions)
        .processGroup(bundleInfo.type, bundleInfo.group)
        .map(function(assetPath) {
          return self._assetPathWithMTime(assetPath);
        });
    }
  },

  inline: function(locator) {
    if (!this.options.bundled)
      return this.group(locator);

    var bundleInfo = this._bundleInfo(locator),
      data = fs.readFileSync(this._bundledPath(bundleInfo), 'utf-8');

    switch (bundleInfo.typeExt) {
      case 'css':
        return "<style type=\"text/css\">" + data + "</style>";
      case 'js':
        return "<script>" + data + "</script>";
    }
  },

  _assetPathWithMTime: function(assetPath) {
    var relativePath = assetPath.replace(this.options.root, ''),
      mtime = assetPath.indexOf('/') == 0 ?
        fs.statSync(assetPath).mtime.getTime() :
        fs.statSync(path.join(this.rootPath, assetPath)).mtime.getTime();

    return relativePath + "?" + mtime;
  },

  _assetFragment: function(assetPathWithMTime, bundleInfo) {
    switch(bundleInfo.typeExt) {
      case 'css':
      case 'less':
        return "<link href=\"" + assetPathWithMTime + "\" media=\"screen\" rel=\"stylesheet/" + bundleInfo.typeExt + "\"/>";
      case 'js':
        return "<script src=\"" + assetPathWithMTime + "\"></script>";
    }
  },

  _bundledPath: function(bundleInfo) {
    return path.join(this.options.root, bundleInfo.type, 'bundled', bundleInfo.group + '.' + bundleInfo.typeExt);
  },

  _bundleInfo: function(locator) {
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