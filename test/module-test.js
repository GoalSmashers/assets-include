var vows = require('vows');
var assert = require('assert');
var path = require('path');
var AssetsInclude = require('../index');

exports.suite = vows.describe('module tests').addBatch({
  'without options': {
    topic: function() {
      return new AssetsInclude(path.join('test', 'data', 'config.yml'));
    },
    'should default root to ./public under config ': function(includer) {
      assert.equal(includer.options.root, path.join(process.cwd(), 'test', 'data', 'public'));
    },
    'should not resolve stylesheets correctly': function(includer) {
      assert.equal(includer.group('stylesheets/all.css').match(/<link/g).length, 3);
    }
  }
});
