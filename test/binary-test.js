var vows = require('vows');
var assert = require('assert');
var exec = require('child_process').exec;

var isWindows = process.platform == 'win32';

var binaryContext = function(options, context) {
  context.topic = function() {
    if (isWindows)
      exec('cd test & node ..\\bin\\assetsinc ' + options, this.callback);
    else
      exec('cd test; ../bin/assetsinc ' + options, this.callback);
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
      assert.equal(stdout, version + '\n');
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
      assert.equal(stdout.match(/ (async|defer)>/g), null);
      assert.equal(stdout.match(/all\.js\?\d+/g).length, 1);
    }
  }),
  'bundled scripts with loading mode': binaryContext('-b -r ./data/public -c ./data/config.yml -m async javascripts/all.js', {
    'must give bundled script inclusion': function(error, stdout) {
      assert.equal(stdout.match(/<script/g).length, 1);
      assert.equal(stdout.match(/ async>/g).length, 1);
      assert.equal(stdout.match(/all\.js\?\d+/g).length, 1);
    }
  }),
  'bundled scripts with asset hosts': binaryContext('-b -a assets[0,1].goalsmashers.com -r ./data/public -c ./data/config.yml javascripts/all.js', {
    'must give bundled script inclusion': function(error, stdout) {
      assert.equal(stdout.match(/<script/g).length, 1);
      assert.equal(stdout.match(/\/\/assets0.goalsmashers.com\/javascripts\/bundled\/all\.js\?\d+/g).length, 1);
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
      assert.equal(stdout, '<script>123</script>\n');
    }
  }),
  'plain lists': binaryContext('-l -r ./data/public -c ./data/config.yml javascripts/all.js', {
    'must give bundled script inclusion': function(error, stdout) {
      assert(/^\/javascripts\/one\.js\?\d+,\/javascripts\/two\.js\?\d+,\/javascripts\/three\.js\?\d+$/.test(stdout));
    }
  }),
  'bundled plain lists': binaryContext('-l -b -r ./data/public -c ./data/config.yml javascripts/all.js', {
    'must give bundled script inclusion': function(error, stdout) {
      assert(/^\/javascripts\/bundled\/all\.js\?\d+$/.test(stdout));
    }
  }),
  'bundled plain lists with asset hosts': binaryContext('-l -b -a assets[3,2,1].goalsmashers.com -r ./data/public -c ./data/config.yml javascripts/all.js', {
    'must give bundled script inclusion': function(error, stdout) {
      assert(/^\/\/assets3.goalsmashers.com\/javascripts\/bundled\/all\.js\?\d+$/.test(stdout));
    }
  }),
  'inline with cache boosters': binaryContext('-i -b -s -r ./data/public -c ./data/config.yml javascripts/all.js', {
    'must give bundled script inclusion': function(error, stdout) {
      assert.equal('<script>123-booster</script>\n', stdout);
    }
  })
});
