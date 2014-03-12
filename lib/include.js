(function() {
  var AssetsExpander = require('assets-expander');
  var fs = require('fs');
  var path = require('path');

  var isWindows = process.platform == 'win32';

  function rewriteSlashes(pathWithStamp) {
    return isWindows ? pathWithStamp.replace(/\\/g, '/') : pathWithStamp;
  }

  function assetFragment(assetPathWithMTime, bundleInfo, options) {
    var crossOrigin = assetPathWithMTime.indexOf('//') === 0 ? ' crossorigin' : '';
    var loadingMode = options.loadingMode ?
      ' ' + /(async|defer)/.exec(options.loadingMode)[0] :
      '';

    switch(bundleInfo.typeExt) {
      case 'css':
      case 'less':
        return ['<link', ' href="', assetPathWithMTime, '"', ' media="screen"',
          ' rel="stylesheet', (bundleInfo.typeExt == 'less' ? '/less' : ''), '"',
          crossOrigin, '/>'].join('');
      case 'js':
        return ['<script', ' src="', assetPathWithMTime, '"',
          crossOrigin, loadingMode, '></script>'].join('');
    }
  }

  function bundledPath(root, bundleInfo) {
    return path.join(root, bundleInfo.type, 'bundled', bundleInfo.group + '.' + bundleInfo.typeExt);
  }

  function hostsIterator(hostsDefinition) {
    if (!hostsDefinition)
      return null;

    return {
      next: function() {
        if (!this.cycleList) {
          var cycleList = [];
          if (hostsDefinition.indexOf('[') > -1) {
            var start = hostsDefinition.indexOf('[');
            var end = hostsDefinition.indexOf(']');
            var pattern = hostsDefinition.substring(start + 1, end);

            pattern.split(',').forEach(function(version) {
              cycleList.push(hostsDefinition.replace(/\[([^\]])+\]/, version));
            });
          } else {
            cycleList = [hostsDefinition];
          }

          this.cycleList = cycleList;
          this.index = 0;
        }

        if (this.index == this.cycleList.length) this.index = 0;
        return this.cycleList[this.index++];
      }
    };
  }

  function bundleInfo(locator) {
    var firstSlashIndex = locator.indexOf('/');
    var lastDotIndex = locator.lastIndexOf('.');

    return {
      type: locator.substring(0, firstSlashIndex),
      typeExt: locator.substring(lastDotIndex + 1),
      group: locator.substring(firstSlashIndex + 1, lastDotIndex)
    };
  }

  var AssetsInclude = function(pathToConfig, options) {
    var configDir = path.dirname(pathToConfig);

    this.options = options || {};
    this.pathToConfig = pathToConfig;
    this.rootPath = process.cwd();
    this.hostsIterator = hostsIterator(this.options.assetHosts);

    this.options.root = this.options.root || path.join(configDir, 'public');

    if (this.options.root.indexOf(this.rootPath) !== 0)
      this.options.root = path.normalize(path.join(this.rootPath, this.options.root));

    if (this.options.cacheBoosters) {
      var cacheFile = path.join(this.rootPath, configDir, '.' + path.basename(pathToConfig) + '.json');
      if (fs.existsSync(cacheFile))
        this.cacheInfo = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    }
  };

  AssetsInclude.prototype.group = function(locator, options) {
    options = options || {};

    var info = bundleInfo(locator);
    var fragmentOptions = {
      loadingMode: options.loadingMode || this.options.loadingMode
    };

    return this.list(locator)
      .map(function(assetPathWithMTime) {
        return assetFragment(assetPathWithMTime, info, fragmentOptions);
      })
      .join('');
  };

  AssetsInclude.prototype.list = function(locator) {
    var self = this;
    var info = bundleInfo(locator);

    if (this.options.bundled) {
      var assetPath = bundledPath(this.options.root, info);
      return [rewriteSlashes(self.assetPathWithStamp(assetPath, info))];
    } else {
      var expanderOptions = {
        root: this.options.root,
        type: info.typeExt
      };
      // TODO: We should be sharing one instance of AssetsExpander but it does not allow passing 'typeExt' to processGroup
      return new AssetsExpander(this.pathToConfig, expanderOptions)
        .processGroup(info.type, info.group, {})
        .map(function(assetPath) {
          return rewriteSlashes(self.assetPathWithStamp(assetPath, info));
        });
    }
  };

  AssetsInclude.prototype.inline = function(locator) {
    if (!this.options.bundled)
      return this.group(locator);

    var info = bundleInfo(locator);
    var data = '';
    var bundlePath = bundledPath(this.options.root, info);

    if (this.options.bundled && this.cacheInfo) {
      var pathWithStamp = this.assetPathWithStamp(bundlePath, info, true);
      data = fs.readFileSync(path.join(this.options.root, pathWithStamp), 'utf-8');
    } else {
      data = fs.readFileSync(bundlePath, 'utf-8');
    }

    switch (info.typeExt) {
      case 'css':
        return '<style type="text/css">' + data + '</style>';
      case 'js':
        return '<script>' + data + '</script>';
    }
  };

  AssetsInclude.prototype.assetPathWithStamp = function(assetPath, bundleInfo, skipHosts) {
    var hostPrefix = this.hostsIterator && !skipHosts ? '//' + this.hostsIterator.next() : '';
    var relativePath = assetPath.replace(this.options.root, '');

    if (this.options.bundled && this.cacheInfo) {
      var cacheStamp = this.cacheInfo[bundleInfo.type + '/' + bundleInfo.group];
      return hostPrefix + relativePath.replace(/\.(css|js)/, '-' + cacheStamp + '.$1');
    } else {
      var mtime = assetPath.indexOf(this.rootPath) === 0 ?
        fs.statSync(assetPath).mtime.getTime() :
        fs.statSync(path.join(this.rootPath, assetPath)).mtime.getTime();

      return hostPrefix + relativePath + '?' + mtime;
    }
  };

  module.exports = AssetsInclude;
})();
