var AssetsInclude = function(pathToConfig, options) {
  this.pathToConfig = pathToConfig;
  this.options = options;

  // if (!this)
};

AssetsInclude.prototype = {
  group: function(groupName) {
    var tokens = groupName.split('/'),
      type = tokens[0],
      name = tokens[1];
  },

  inline: function(groupName) {

  }
};

module.exports = AssetsInclude;