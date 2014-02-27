var vows = require('vows'),
  assert = require('assert'),
  path = require('path'),
  AssetsInclude = require('../index');

var includeContext = function(definition, options) {
  definition.topic = function() {
    options = options || {};
    if (!options.root)
      options.root = path.join('test', 'data', 'public');

    return new AssetsInclude(path.join('test', 'data', 'config.yml'), options);
  };
  return definition;
};

exports.groupSuite = vows.describe('group').addBatch({
  'unknown type': includeContext({
    'should give empty result': function(include) {
      assert.throws(function() {
        include.group('unknown/xyz.js');
      });
    }
  }, 'css'),
  'unknown group': includeContext({
    'should give empty result': function(include) {
      assert.throws(function() {
        include.group('stylesheets/xyz.css');
      });
    }
  }, 'css'),
  'stylesheets group': {
    'in plain (dev) mode as CSS': includeContext({
      'should give a list of link tags': function(include) {
        var asFragment = include.group('stylesheets/all.css');
        assert(/\/stylesheets\/one.css\?\d+/.test(asFragment), 'missing one.css');
        assert(/\/stylesheets\/two.css\?\d+/.test(asFragment), 'missing two.css');
        assert(/\/stylesheets\/three.css\?\d+/.test(asFragment), 'missing three.css');
        assert.equal(asFragment.match(/link/g).length, 3);
        assert.equal(asFragment.match(/rel="stylesheet"/g).length, 3);
      }
    }),
    'in plain (dev) mode as CSS with cache boosters': includeContext({
      'should give a list of link tags': function(include) {
        var asFragment = include.group('stylesheets/all.css');
        assert(/\/stylesheets\/one.css\?\d+/.test(asFragment), 'missing one.css');
        assert(/\/stylesheets\/two.css\?\d+/.test(asFragment), 'missing two.css');
        assert(/\/stylesheets\/three.css\?\d+/.test(asFragment), 'missing three.css');
        assert.equal(asFragment.match(/link/g).length, 3);
        assert.equal(asFragment.match(/rel="stylesheet"/g).length, 3);
      }
    }, { cacheBoosters: true }),
    'in plain (dev) mode as LESS': includeContext({
      'should give a list of link tags': function(include) {
        var asFragment = include.group('stylesheets/all.less');
        assert(/\/stylesheets\/one.less\?\d+/.test(asFragment), 'missing one.less');
        assert(/\/stylesheets\/two.less\?\d+/.test(asFragment), 'missing two.less');
        assert(/\/stylesheets\/three.less\?\d+/.test(asFragment), 'missing three.less');
        assert.equal(asFragment.match(/<link/g).length, 3);
        assert.equal(asFragment.match(/rel="stylesheet\/less"/g).length, 3);
      }
    }),
    'in plain (dev) mode with asset hosts': includeContext({
      'should give a list of link tags': function(include) {
        var asFragment = include.group('stylesheets/all.less');
        assert(/\/\/assets0.goalsmashers.com\/stylesheets\/one.less\?\d+/.test(asFragment), 'missing one.less');
        assert(/\/\/assets1.goalsmashers.com\/stylesheets\/two.less\?\d+/.test(asFragment), 'missing two.less');
        assert(/\/\/assets0.goalsmashers.com\/stylesheets\/three.less\?\d+/.test(asFragment), 'missing three.less');
        assert.equal(asFragment.match(/<link/g).length, 3);
        assert.equal(asFragment.match(/rel="stylesheet\/less"/g).length, 3);
      }
    }, { assetHosts: 'assets[0,1].goalsmashers.com' }),
    'in bundled (prod) mode as CSS': includeContext({
      'should give a bundled link tag': function(include) {
        var asFragment = include.group('stylesheets/all.css');
        assert(/\/stylesheets\/bundled\/all.css\?\d+/.test(asFragment), 'missing all.css');
        assert.equal(asFragment.match(/<link/g).length, 1);
        assert.equal(asFragment.match(/ crossorigin/g), null);
      }
    }, { bundled: true }),
    'in bundled mode as CSS with cache boosters': includeContext({
      'should give a bundled link tag with version id': function(include) {
        var asFragment = include.group('stylesheets/all.css');
        assert(/"\/stylesheets\/bundled\/all-test2345678.css"/.test(asFragment), 'missing all.css');
        assert.equal(asFragment.match(/<link/g).length, 1);
        assert.equal(asFragment.match(/ crossorigin/g), null);
      }
    }, { bundled: true, cacheBoosters: true }),
    'in bundled mode as CSS with assets hosts': includeContext({
      'should give a bundled link tag with version id': function(include) {
        var asFragment = include.group('stylesheets/all.css');
        assert(/"\/\/assets0.goalsmashers.com\/stylesheets\/bundled\/all\.css\?\d+"/.test(asFragment), 'missing all.css');
        assert.equal(asFragment.match(/<link/g).length, 1);
        assert.equal(asFragment.match(/ href=/g).length, 1);
        assert.equal(asFragment.match(/ media=/g).length, 1);
        assert.equal(asFragment.match(/ rel=/g).length, 1);
        assert.equal(asFragment.match(/ crossorigin/g).length, 1);
      }
    }, { bundled: true, assetHosts: 'assets[0,1].goalsmashers.com' })
  },
  'scripts group': {
    'in plain (dev) mode': includeContext({
      'should give a list of script tags': function(include) {
        var asFragment = include.group('javascripts/all.js');
        assert(/\/javascripts\/one.js\?\d+/.test(asFragment), 'missing one.js');
        assert(/\/javascripts\/two.js\?\d+/.test(asFragment), 'missing two.js');
        assert(/\/javascripts\/three.js\?\d+/.test(asFragment), 'missing three.js');
        assert.equal(asFragment.match(/ (async|defer)>/g), null);
        assert.equal(asFragment.match(/<script/g).length, 3);
      }
    }),
    'in plain (dev) mode with deferred loading': includeContext({
      'should give a list of script tags': function(include) {
        var asFragment = include.group('javascripts/all.js');
        assert(/\/javascripts\/one.js\?\d+/.test(asFragment), 'missing one.js');
        assert(/\/javascripts\/two.js\?\d+/.test(asFragment), 'missing two.js');
        assert(/\/javascripts\/three.js\?\d+/.test(asFragment), 'missing three.js');
        assert.equal(asFragment.match(/<script/g).length, 3);
        assert.equal(asFragment.match(/ async>/g), null);
        assert.equal(asFragment.match(/ defer>/g).length, 3);
      }
    }, { loadingMode: 'defer' }),
    'in plain (dev) mode with async loading': includeContext({
      'should give a list of script tags': function(include) {
        var asFragment = include.group('javascripts/all.js');
        assert(/\/javascripts\/one.js\?\d+/.test(asFragment), 'missing one.js');
        assert(/\/javascripts\/two.js\?\d+/.test(asFragment), 'missing two.js');
        assert(/\/javascripts\/three.js\?\d+/.test(asFragment), 'missing three.js');
        assert.equal(asFragment.match(/<script/g).length, 3);
        assert.equal(asFragment.match(/ async>/g).length, 3);
        assert.equal(asFragment.match(/ defer>/g), null);
      }
    }, { loadingMode: 'async' }),
    'in bundled (prod) mode': includeContext({
      'should give a bundled script tag': function(include) {
        var asFragment = include.group('javascripts/all.js');
        assert(/\/javascripts\/bundled\/all\.js\?\d+/.test(asFragment), 'missing all.js');
        assert.equal(asFragment.match(/<script/g).length, 1);
        assert.equal(asFragment.match(/ (async|defer)>/g), null);
      }
    }, { bundled: true }),
    'in bundled (prod) mode with cache boosters': includeContext({
      'should give a bundled script tag': function(include) {
        var asFragment = include.group('javascripts/all.js');
        assert(/"\/javascripts\/bundled\/all\-test1234567\.js"/.test(asFragment), 'missing all.js');
        assert.equal(asFragment.match(/<script/g).length, 1);
        assert.equal(asFragment.match(/ crossorigin /g), null);
        assert.equal(asFragment.match(/ (async|defer)>/g), null);
      }
    }, { bundled: true, cacheBoosters: true }),
    'in bundled (prod) mode with assets hosts': includeContext({
      'should give a bundled script tag': function(include) {
        var asFragment = include.group('javascripts/all.js');
        assert(/"\/\/assets0.goalsmashers.com\/javascripts\/bundled\/all\.js\?\d+"/.test(asFragment), 'missing all.js');
        assert.equal(asFragment.match(/<script/g).length, 1);
        assert.equal(asFragment.match(/ crossorigin/g).length, 1);
        assert.equal(asFragment.match(/ (async|defer)>/g), null);
      }
    }, { bundled: true, assetHosts: 'assets0.goalsmashers.com' }),
    'in bundled (prod) mode with deferred loading': includeContext({
      'should give a bundled script tag': function(include) {
        var asFragment = include.group('javascripts/all.js');
        assert(/\/javascripts\/bundled\/all\.js\?\d+/.test(asFragment), 'missing all.js');
        assert.equal(asFragment.match(/<script/g).length, 1);
        assert.equal(asFragment.match(/ async>/g), null);
        assert.equal(asFragment.match(/ defer>/g).length, 1);
      }
    }, { bundled: true, loadingMode: 'defer' }),
    'in bundled (prod) mode with async loading': includeContext({
      'should give a bundled script tag': function(include) {
        var asFragment = include.group('javascripts/all.js');
        assert(/\/javascripts\/bundled\/all\.js\?\d+/.test(asFragment), 'missing all.js');
        assert.equal(asFragment.match(/<script/g).length, 1);
        assert.equal(asFragment.match(/ async>/g).length, 1);
        assert.equal(asFragment.match(/ defer>/g), null);
      }
    }, { bundled: true, loadingMode: 'async' })
  },
  'custom': {
    'with absolute path': includeContext({
      'should process like with relative': function(include) {
        var asFragment = include.group('javascripts/all.js');
        assert.equal(asFragment.match(/<script/g).length, 3);
      }
    }, { root: path.join(process.cwd(), 'test', 'data', 'public') })
  }
});

exports.listSuite = vows.describe('list').addBatch({
  'list of stylesheets': {
    'in plain (dev) mode as CSS': includeContext({
      'should give list of stylesheets': function(include) {
        var list = include.list('stylesheets/all.css');
        assert(/\/stylesheets\/one\.css\?\d+/.test(list[0]), 'missing one.css');
        assert(/\/stylesheets\/two\.css\?\d+/.test(list[1]), 'missing two.css');
        assert(/\/stylesheets\/three\.css\?\d+/.test(list[2]), 'missing three.css');
      }
    }),
    'in plain (dev) mode as LESS': includeContext({
      'should give list of stylesheets': function(include) {
        var list = include.list('stylesheets/all.less');
        assert.equal(list.length, 3);
        assert(/\/stylesheets\/one\.less\?\d+/.test(list[0]), 'missing one.less');
        assert(/\/stylesheets\/two\.less\?\d+/.test(list[1]), 'missing two.less');
        assert(/\/stylesheets\/three\.less\?\d+/.test(list[2]), 'missing three.less');
      }
    }),
    'in bundled (prod) mode as CSS': includeContext({
      'should give one stylesheet': function(include) {
        var list = include.list('stylesheets/all.css');
        assert.equal(list.length, 1);
        assert(/\/stylesheets\/bundled\/all\.css\?\d+/.test(list[0]), 'missing all.less');
      }
    }, { bundled: true }),
    'in bundled (prod) mode as CSS with cache boosters': includeContext({
      'should give one stylesheet': function(include) {
        var list = include.list('stylesheets/all.css');
        assert.equal(list.length, 1);
        assert(/\/stylesheets\/bundled\/all-test2345678.css/.test(list[0]), 'missing all.less');
      }
    }, { bundled: true, cacheBoosters: true }),
    'in bundled (prod) mode as CSS with assets hosts': includeContext({
      'should give one stylesheet': function(include) {
        var list = include.list('stylesheets/all.css');
        assert.equal(list.length, 1);
        assert(/\/\/na.test.com\/stylesheets\/bundled\/all\.css\?\d+/.test(list[0]), 'missing all.less');
      }
    }, { bundled: true, assetHosts: 'n[a,b].test.com' })
  },
  'list of scripts': {
    'in plain (dev) mode': includeContext({
      'should give list of scripts': function(include) {
        var list = include.list('javascripts/all.js');
        assert(/\/javascripts\/one.js\?\d+/.test(list[0]), 'missing one.js');
        assert(/\/javascripts\/two.js\?\d+/.test(list[1]), 'missing two.js');
        assert(/\/javascripts\/three.js\?\d+/.test(list[2]), 'missing three.js');
      }
    }),
    'in bundled (prod) mode': includeContext({
      'should give one stylesheet': function(include) {
        var list = include.list('javascripts/all.js');
        assert.equal(list.length, 1);
        assert(/\/javascripts\/bundled\/all.js\?\d+/.test(list[0]), 'missing all.js');
      }
    }, { bundled: true }),
    'in bundled (prod) mode with cache boosters': includeContext({
      'should give one stylesheet': function(include) {
        var list = include.list('javascripts/all.js');
        assert.equal(list.length, 1);
        assert(/\/javascripts\/bundled\/all-test1234567.js/.test(list[0]), 'missing all.js');
      }
    }, { bundled: true, cacheBoosters: true }),
    'in bundled (prod) mode with assets hosts': includeContext({
      'should give one stylesheet': function(include) {
        var list = include.list('javascripts/all.js');
        assert.equal(list.length, 1);
        assert(/\/\/goalsmashers.com\/javascripts\/bundled\/all\.js\?\d+/.test(list[0]), 'missing all.js');
      }
    }, { bundled: true, assetHosts: 'goalsmashers.com' })
  }
});

exports.inlineSuite = vows.describe('inline').addBatch({
  'inline stylesheets': {
    'in plain (dev) mode as CSS': includeContext({
      'should give list of link tags': function(include) {
        var asFragment = include.inline('stylesheets/all.css');
        assert(/\/stylesheets\/one.css\?\d+/.test(asFragment), 'missing one.css');
        assert(/\/stylesheets\/two.css\?\d+/.test(asFragment), 'missing two.css');
        assert(/\/stylesheets\/three.css\?\d+/.test(asFragment), 'missing three.css');
        assert.equal(asFragment.match(/link/g).length, 3);
      }
    }),
    'in plain (dev) mode as LESS': includeContext({
      'should give list of link tags': function(include) {
        var asFragment = include.inline('stylesheets/all.less');
        assert(/\/stylesheets\/one.less\?\d+/.test(asFragment), 'missing one.less');
        assert(/\/stylesheets\/two.less\?\d+/.test(asFragment), 'missing two.less');
        assert(/\/stylesheets\/three.less\?\d+/.test(asFragment), 'missing three.less');
        assert.equal(asFragment.match(/<link/g).length, 3);
      }
    }),
    'in bundled (prod) mode as CSS': includeContext({
      'should give list of link tags': function(include) {
        var asFragment = include.inline('stylesheets/all.css');
        assert.equal('<style type="text/css">.one{}.two{}.three{}</style>', asFragment);
      }
    }, { bundled: true }),
    'in bundled (prod) mode as CSS with cache boosters': includeContext({
      'should give list of link tags': function(include) {
        var asFragment = include.inline('stylesheets/all.css');
        assert.equal('<style type="text/css">.one{}.two{}.three{}-booster</style>', asFragment);
      }
    }, { bundled: true, cacheBoosters: true }),
    'in bundled (prod) mode as CSS with asset hosts': includeContext({
      'should give list of link tags': function(include) {
        var asFragment = include.inline('stylesheets/all.css');
        assert.equal('<style type="text/css">.one{}.two{}.three{}</style>', asFragment);
      }
    }, { bundled: true, assetHosts: '[0,1].goalsmashers.com' })
  },
  'inline scripts': {
    'in plain (dev) mode': includeContext({
      'should give a list of script tags': function(include) {
        var asFragment = include.inline('javascripts/all.js');
        assert(/\/javascripts\/one.js\?\d+/.test(asFragment), 'missing one.js');
        assert(/\/javascripts\/two.js\?\d+/.test(asFragment), 'missing two.js');
        assert(/\/javascripts\/three.js\?\d+/.test(asFragment), 'missing three.js');
        assert.equal(asFragment.match(/<script/g).length, 3);
      }
    }),
    'in bundled (prod) mode': includeContext({
      'should give a bundled script tag': function(include) {
        var asFragment = include.inline('javascripts/all.js');
        assert.equal('<script>123</script>', asFragment);
      }
    }, { bundled: true }),
    'in bundled (prod) mode with cache boosters': includeContext({
      'should give a bundled script tag': function(include) {
        var asFragment = include.inline('javascripts/all.js');
        assert.equal('<script>123-booster</script>', asFragment);
      }
    }, { bundled: true, cacheBoosters: true }),
    'in bundled (prod) mode with asset hosts': includeContext({
      'should give a bundled script tag': function(include) {
        var asFragment = include.inline('javascripts/all.js');
        assert.equal('<script>123</script>', asFragment);
      }
    }, { bundled: true, assetHosts: 'goalsmashers.com' }),
    'in bundled (prod) mode with cache boosters and asset hosts': includeContext({
      'should give a bundled script tag': function(include) {
        var asFragment = include.inline('javascripts/all.js');
        assert.equal('<script>123-booster</script>', asFragment);
      }
    }, { bundled: true, cacheBoosters: true, assetHosts: 'goalsmashers.com' })
  }
});
