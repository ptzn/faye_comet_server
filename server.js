var http = require('http');
var faye = require('faye');
var crypto = require('crypto');

var config = require('./config/config.js');

var server = new faye.NodeAdapter({mount: '/notifications', timeout: 45});

var secret_token = config.get('secret_token');

var serverAuth = {
  incoming: function(message, callback) {
    if( message.channel === '/meta/subscribe' ) {
      if( !this.canSubscribe(message) ) {
        message.error = '403::Authentication required';
      }
    } else if( !message.channel.match(/^\/meta\//) ) {
      if( !this.authorized(message) ) {
        message.error = '403::Publish token required';
      }
    }
    callback(message);
  },

  outgoing: function(message, callback) {
    // delete the secret from the message to prevent leaking it to clients
    if( message.ext ) delete message.ext.publish_token;
    callback(message);
  },

  authorized: function(message) {
    return message.ext && message.ext.publish_token && (message.ext.publish_token === secret_token);
  },

  canSubscribe: function(message) {
    if( !this.messageSigned(message) ) return false;

    var signature = crypto.createHash('sha256').update(secret_token + message.subscription + message.ext.timestamp).digest('hex');
    return message.ext.auth_token === signature;
  },

  messageSigned: function(message) {
    return message.ext && message.ext.auth_token && message.ext.timestamp;
  }
};

server.addExtension(serverAuth);

if( config.get('debug') ) {
  server.bind('publish', function(clientId, channel, data) {
    console.log('client #' + clientId + " publish on channel '" + channel + "' message: " + data);
  });

  server.bind('subscribe', function(clientId, channel) {
    console.log('client #' + clientId + " subscribed to channel '" + channel + "'");
  });
}

if( config.isProduction() ) {
  server.listen(config.get('port'), {
    key: config.get('ssl_key'),
    cert: config.get('ssl_cert')
  });
} else {
  server.listen(config.get('port'));
}
