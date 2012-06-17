var vows = require('vows'),
  assert = require('assert'),
  AssetsInclude = require('../index');

var includeContext = function(definition, type) {
  definition.topic = function() {
    var options = { root: 'test/data/public' };
    options.type = type;
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
        include.group('javascripts/xyz');
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
    'in dev mode (as LESS)': includeContext({
      'should give list of styles': function(include) {
        var asFragment = include.group('stylesheets/all');
        assert(/\/stylesheets\/one.less\?\d+/.test(asFragment), 'missing one.less');
        assert(/\/stylesheets\/two.less\?\d+/.test(asFragment), 'missing two.less');
        assert(/\/stylesheets\/three.less\?\d+/.test(asFragment), 'missing three.less');
        assert.equal(asFragment.match(/link/g).length, 3);
      }
    }, 'less')
  }
});
