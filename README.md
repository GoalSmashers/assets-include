[![NPM version](https://badge.fury.io/js/assets-include.png)](https://badge.fury.io/js/assets-include)
[![Build Status](https://secure.travis-ci.org/GoalSmashers/assets-include.png)](https://travis-ci.org/GoalSmashers/assets-include)
[![Dependency Status](https://david-dm.org/GoalSmashers/assets-include.png?theme=shields.io)](https://david-dm.org/GoalSmashers/assets-include)
[![devDependency Status](https://david-dm.org/GoalSmashers/assets-include/dev-status.png?theme=shields.io)](https://david-dm.org/GoalSmashers/assets-include#info=devDependencies)

## What is assets-include?

Assets-include is a [Node.js](http://nodejs.org/) tool for including your assets in HTML views.

This project is closely tied to [Assets-Packager](https://github.com/GoalSmashers/assets-packager) which can
minify, enhance, and bundle your assets based on a YAML definition file.

## Usage

### What are the requirements?

```
Node.js 0.8.0+ (tested on CentOS, Ubuntu, and OS X 10.6+)
```

### How to install assets-include?

```
npm install assets-include
```

### How to use assets-include programmatically?

```js
var includer = new AssetsIncluder('assets.yml');
includer.group('stylesheets/mobile/application.css');
```

AssetsInclude constructor accepts a hash as a 2nd parameter, i.e.,

* `bundled` - `true` for bundled, production mode, `false` for development mode
* `root` - root path of all assets, defaults to ./public under config's path
* `cacheBoosters` - `true` for cache boosters (timestamp in dev mode, md5 for bundled, production files)
* `assetHosts` - prefixes all paths with given asset host(s)
* `loadingMode` - `async` or `defer` for JavaScript assets' loading mode

AssetsInclude public methods will give you the following output:

* `group(locator)` - a list of `<script>` or `<link>` tags for JavaScript or CSS assets respectively
* `inline(locator)` - a JavaScript or CSS assets inlined rather than referenced by `<script>` or `<link>` tag respectively.
  In development mode works the same way as `group(locator)`.
* `list(locator)` - an array of of assets files (to easily embed it into JavaScript or data-attribute)

### How to use assets-include CLI?

assetsinc accepts the following command line arguments.

```
assetsinc <options> <group path, name, and type>

-h, --help                        output usage information
-v, --version                     output the version number
-a, --asset-hosts [asset-hosts]   prefix all paths with given asset host(s)
-b, --bundled                     output a bundled (production) version
-s, --cache-boosters              use cache boosters
-c, --config [config-file]        path to assets config file
-i, --inline                      output inline tags
-m, --loading-mode [async|defer]  use the given loading mode for JavaScript assets
-l, --list                        list mode (prints filenames instead of HTML tags)
-r, --root [root-path]            root path of all assets (defaults to ./public under config's path)
```

### What are the assets-include dev commands?

First clone the source, then run:

* `npm run check` to check JS sources with [JSHint](https://github.com/jshint/jshint/)
* `npm test` for the test suite

## License

Assets-include is released under the [MIT License](https://github.com/GoalSmashers/assets-include/blob/master/LICENSE).
