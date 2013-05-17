var convict = require('convict');

// define a schema
var config = convict({
  env: {
    doc: 'The applicaton environment.',
    format: ['production', 'development'],
    default: 'development',
    env: 'NODE_ENV'
  },

  debug: {
    doc: 'Turn on debugging output.',
    default: false
  }
});

config.isProduction = function() {
  return this.get('env') == 'production';
};

// load environment dependent configuration
config.loadFile('./config/' + config.get('env') + '.json');

// perform validation
config.validate();

module.exports = config;
