var AssetsExpander = require('assets-expander'),
  fs = require('fs'),
  path = require('path'),
  existsSync = fs.existsSync || path.existsSync;

var AssetsInclude = function(pathToConfig, options) {
  this.options = options;
  this.pathToConfig = pathToConfig;
  this.rootPath = process.cwd();

  if (this.options.root.indexOf('/') > 0)
    this.options.root = path.normalize(path.join(this.rootPath, this.options.root));

  if (this.options.cacheBoosters) {
    var cacheFile = path.join(this.rootPath, path.dirname(pathToConfig), '.' + path.basename(pathToConfig) + '.json');
    if (existsSync(cacheFile))
      this.cacheInfo = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  }
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
      return [self._assetPathWithStamp(self._bundledPath(bundleInfo), bundleInfo)];
    } else {
      var expanderOptions = {
        root: this.options.root,
        type: bundleInfo.typeExt
      };
      // TODO: We should be sharing one instance of AssetsExpander but it does not allow passing 'typeExt' to processGroup
      return new AssetsExpander(this.pathToConfig, expanderOptions)
        .processGroup(bundleInfo.type, bundleInfo.group)
        .map(function(assetPath) {
          return self._assetPathWithStamp(assetPath, bundleInfo);
        });
    }
  },

  inline: function(locator) {
    if (!this.options.bundled)
      return this.group(locator);

    var bundleInfo = this._bundleInfo(locator),
      data = '';
    if (this.options.bundled && this.cacheInfo) {
      var pathWithStamp = this._assetPathWithStamp(this._bundledPath(bundleInfo), bundleInfo);
      data = fs.readFileSync(path.join(this.options.root, pathWithStamp), 'utf-8');
    } else {
      data = fs.readFileSync(this._bundledPath(bundleInfo), 'utf-8');
    }

    switch (bundleInfo.typeExt) {
      case 'css':
        return "<style type=\"text/css\">" + data + "</style>";
      case 'js':
        return "<script>" + data + "</script>";
    }
  },

  _assetPathWithStamp: function(assetPath, bundleInfo) {
    var relativePath = assetPath.replace(this.options.root, '');
    if (this.options.bundled && this.cacheInfo) {
      var cacheStamp = this.cacheInfo[bundleInfo.type + '/' + bundleInfo.group];
      return relativePath.replace(/\.(css|js)/, '-' + cacheStamp + ".$1");
    } else {
      var mtime = assetPath.indexOf('/') == 0 ?
        fs.statSync(assetPath).mtime.getTime() :
        fs.statSync(path.join(this.rootPath, assetPath)).mtime.getTime();

      return relativePath + "?" + mtime;
    }
  },

  _assetFragment: function(assetPathWithMTime, bundleInfo) {
    switch(bundleInfo.typeExt) {
      case 'css':
      case 'less':
        return "<link href=\"" + assetPathWithMTime + "\" media=\"screen\" rel=\"stylesheet" + (bundleInfo.typeExt == 'less' ? '/less' : '') + "\"/>";
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