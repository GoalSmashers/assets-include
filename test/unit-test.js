var vows = require('vows'),
  assert = require('assert'),
  AssetsInclude = require('../index');

var includeContext = function(definition, options) {
  definition.topic = function() {
    options = options || {};
    if (!options.root)
      options.root = 'test/data/public';

    return new AssetsInclude('test/data/config.yml', options);
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
      }
    }),
    'in plain (dev) mode as LESS': includeContext({
      'should give a list of link tags': function(include) {
        var asFragment = include.group('stylesheets/all.less');
        assert(/\/stylesheets\/one.less\?\d+/.test(asFragment), 'missing one.less');
        assert(/\/stylesheets\/two.less\?\d+/.test(asFragment), 'missing two.less');
        assert(/\/stylesheets\/three.less\?\d+/.test(asFragment), 'missing three.less');
        assert.equal(asFragment.match(/<link/g).length, 3);
      }
    }),
    'in bundled (prod) mode as CSS': includeContext({
      'should give a bundled link tag': function(include) {
        var asFragment = include.group('stylesheets/all.css');
        assert(/\/stylesheets\/bundled\/all.css\?\d+/.test(asFragment), 'missing all.css');
        assert.equal(asFragment.match(/<link/g).length, 1);
      }
    }, { bundled: true })
  },
  'scripts group': {
    'in plain (dev) mode': includeContext({
      'should give a list of script tags': function(include) {
        var asFragment = include.group('javascripts/all.js');
        assert(/\/javascripts\/one.js\?\d+/.test(asFragment), 'missing one.js');
        assert(/\/javascripts\/two.js\?\d+/.test(asFragment), 'missing two.js');
        assert(/\/javascripts\/three.js\?\d+/.test(asFragment), 'missing three.js');
        assert.equal(asFragment.match(/<script/g).length, 3);
      }
    }),
    'in bundled (prod) mode': includeContext({
      'should give a bundled script tag': function(include) {
        var asFragment = include.group('javascripts/all.js');
        assert(/\/javascripts\/bundled\/all.js\?\d+/.test(asFragment), 'missing all.js');
        assert.equal(asFragment.match(/<script/g).length, 1);
      }
    }, { bundled: true })
  },
  'custom': {
    'with absolute path': includeContext({
      'should process like with relative': function(include) {
        var asFragment = include.group('javascripts/all.js');
        assert.equal(asFragment.match(/<script/g).length, 3);
      }
    }, { root: process.cwd() + '/test/data/public' })
  }
});

exports.listSuite = vows.describe('list').addBatch({
  'list of stylesheets': {
    'in plain (dev) mode as CSS': includeContext({
      'should give list of stylesheets': function(include) {
        var list = include.list('stylesheets/all.css');
        assert(/\/stylesheets\/one\.css\?\d+/.test(list[0]), 'missing one.css')
        assert(/\/stylesheets\/two\.css\?\d+/.test(list[1]), 'missing two.css')
        assert(/\/stylesheets\/three\.css\?\d+/.test(list[2]), 'missing three.css')
      }
    }),
    'in plain (dev) mode as LESS': includeContext({
      'should give list of stylesheets': function(include) {
        var list = include.list('stylesheets/all.less');
        assert.equal(list.length, 3);
        assert(/\/stylesheets\/one\.less\?\d+/.test(list[0]), 'missing one.less')
        assert(/\/stylesheets\/two\.less\?\d+/.test(list[1]), 'missing two.less')
        assert(/\/stylesheets\/three\.less\?\d+/.test(list[2]), 'missing three.less')
      }
    }),
    'in bundled (prod) mode as CSS': includeContext({
      'should give one stylesheet': function(include) {
        var list = include.list('stylesheets/all.css');
        assert.equal(list.length, 1);
        assert(/\/stylesheets\/bundled\/all\.css\?\d+/.test(list[0]), 'missing all.less')
      }
    }, { bundled: true })
  },
  'list of scripts': {
    'in plain (dev) mode': includeContext({
      'should give list of scripts': function(include) {
        var list = include.list('javascripts/all.js');
        assert(/\/javascripts\/one.js\?\d+/.test(list[0]), 'missing one.js')
        assert(/\/javascripts\/two.js\?\d+/.test(list[1]), 'missing two.js')
        assert(/\/javascripts\/three.js\?\d+/.test(list[2]), 'missing three.js')
      }
    }),
    'in bundled (prod) mode': includeContext({
      'should give one stylesheet': function(include) {
        var list = include.list('javascripts/all.js');
        assert.equal(list.length, 1);
        assert(/\/javascripts\/bundled\/all.js\?\d+/.test(list[0]), 'missing all.js')
      }
    }, { bundled: true })
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
        assert.equal("<style type=\"text/css\">.one{}.two{}.three{}</style>", asFragment);
      }
    }, { bundled: true })
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
        assert.equal("<script>123</script>", asFragment);
      }
    }, { bundled: true })
  }
});
