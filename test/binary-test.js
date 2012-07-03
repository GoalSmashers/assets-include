var vows = require('vows'),
  assert = require('assert'),
  exec = require('child_process').exec;

var binaryContext = function(options, context) {
  context.topic = function() {
    exec("cd test; ../bin/assetsinc " + options, this.callback);
  };
  return context;
};

exports.commandsSuite = vows.describe('binary commands').addBatch({
  'no options': binaryContext('', {
    'should output help': function(error, stdout) {
      assert.equal(/usage:/.test(stdout), true);
    }
  }),
  'help option': binaryContext('-h', {
    'should output help': function(error, stdout) {
      assert.equal(/usage:/.test(stdout), true);
    }
  }),
  'version option': binaryContext('-v', {
    'should output version': function(error, stdout) {
      var version = JSON.parse(require('fs').readFileSync('./package.json')).version;
      assert.equal(stdout, version + "\n");
    }
  }),
  'plain scripts': binaryContext('-r ./data/public -c ./data/config.yml javascripts/all.js', {
    'must give script inclusions': function(error, stdout) {
      assert.equal(stdout.match(/<script/g).length, 3);
      assert.equal(stdout.match(/(one|two|three)\.js\?\d+/g).length, 3);
    }
  }),
  'bundled scripts': binaryContext('-b -r ./data/public -c ./data/config.yml javascripts/all.js', {
    'must give bundled script inclusion': function(error, stdout) {
      assert.equal(stdout.match(/<script/g).length, 1);
      assert.equal(stdout.match(/all\.js\?\d+/g).length, 1);
    }
  }),
  'bundled scripts with cache boosters': binaryContext('-b -s -r ./data/public -c ./data/config.yml javascripts/all.js', {
    'must give bundled script inclusion': function(error, stdout) {
      assert.equal(stdout.match(/<script/g).length, 1);
      assert.equal(stdout.match(/"\/javascripts\/bundled\/all-test1234567\.js"/g).length, 1);
    }
  }),
  'bundled and inlined scripts': binaryContext('-b -i -r ./data/public -c ./data/config.yml javascripts/all.js', {
    'must give bundled script inclusion': function(error, stdout) {
      assert.equal(stdout, "<script>123</script>\n");
    }
  }),
  'plain lists': binaryContext('-l -r ./data/public -c ./data/config.yml javascripts/all.js', {
    'must give bundled script inclusion': function(error, stdout) {
      assert(/^\/javascripts\/one\.js\?\d+,\/javascripts\/two\.js\?\d+,\/javascripts\/three\.js\?\d+$/.test(stdout))
    }
  }),
  'bundled plain lists': binaryContext('-l -b -r ./data/public -c ./data/config.yml javascripts/all.js', {
    'must give bundled script inclusion': function(error, stdout) {
      assert(/^\/javascripts\/bundled\/all\.js\?\d+$/.test(stdout))
    }
  })
});