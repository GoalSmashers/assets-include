var vows = require('vows'),
  assert = require('assert'),
  AssetsInclude = require('../index');

var includeContext = function(definition, type, productionMode) {
  definition.topic = function() {
    var options = { root: 'test/data/public' };
    options.type = type;
    options.bundled = productionMode;
    return new AssetsInclude('test/data/config.yml', options);
  };
  return definition;
};

exports.groupSuite = vows.describe('group').addBatch({
  'unknown type': includeContext({
    'should give empty result': function(include) {
      assert.throws(function() {
        include.group('unknown/xyz');
      });
    }
  }, 'css'),
  'unknown group': includeContext({
    'should give empty result': function(include) {
      assert.throws(function() {
        include.group('stylesheets/xyz');
      });
    }
  }, 'css'),
  'stylesheets group': {
    'in dev mode (as CSS)': includeContext({
      'should give list of styles': function(include) {
        var asFragment = include.group('stylesheets/all');
        assert(/\/stylesheets\/one.css\?\d+/.test(asFragment), 'missing one.css');
        assert(/\/stylesheets\/two.css\?\d+/.test(asFragment), 'missing two.css');
        assert(/\/stylesheets\/three.css\?\d+/.test(asFragment), 'missing three.css');
        assert.equal(asFragment.match(/link/g).length, 3);
      }
    }, 'css'),
    'in prod mode (as CSS)': includeContext({
      'should give list of styles': function(include) {
        var asFragment = include.group('stylesheets/all');
        assert(/\/stylesheets\/bundled\/all.css\?\d+/.test(asFragment), 'missing all.css');
        assert.equal(asFragment.match(/<link/g).length, 1);
      }
    }, 'css', true),
    'in dev mode (as LESS)': includeContext({
      'should give list of styles': function(include) {
        var asFragment = include.group('stylesheets/all');
        assert(/\/stylesheets\/one.less\?\d+/.test(asFragment), 'missing one.less');
        assert(/\/stylesheets\/two.less\?\d+/.test(asFragment), 'missing two.less');
        assert(/\/stylesheets\/three.less\?\d+/.test(asFragment), 'missing three.less');
        assert.equal(asFragment.match(/<link/g).length, 3);
      }
    }, 'less')
  },
  'scripts group': {
    'in dev mode': includeContext({
      'should give list of styles': function(include) {
        var asFragment = include.group('javascripts/all');
        assert(/\/javascripts\/one.js\?\d+/.test(asFragment), 'missing one.js');
        assert(/\/javascripts\/two.js\?\d+/.test(asFragment), 'missing two.js');
        assert(/\/javascripts\/three.js\?\d+/.test(asFragment), 'missing three.js');
        assert.equal(asFragment.match(/<script/g).length, 3);
      }
    }, 'js'),
    'in prod mode': includeContext({
      'should give list of styles': function(include) {
        var asFragment = include.group('javascripts/all');
        assert(/\/javascripts\/bundled\/all.js\?\d+/.test(asFragment), 'missing all.js');
        assert.equal(asFragment.match(/<script/g).length, 1);
      }
    }, 'js', true)
  }
});


