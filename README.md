Faye Comet Server
==================

Comet server based on [faye](http://faye.jcoglan.com/). Server work via SSL in production mode and use tokens for subscribing and publishing.

### Installation and configuration

1. To install dependencies:
  $ npm install
2. Change production or/and developemnt settings in *config/production.json* and *config/development.json*
3. App use [forever](https://github.com/nodejitsu/forever) for monitoring, so install it globally:
  $ sudo npm install forever -g
4. Copy upstart script from *upstart* directory to */etc/init*
5. Start server:
  * System wide: $ sudo start faye_comet_server
  * In development: $ node server.js
  * In production: $ NODE_ENV=production node server.js

### Publishing from Ruby

```ruby
def broadcast(channel, data)
  message = {:channel => channel, :data => data, :ext => { :publish_token => FAYE_SECRET } }

  url = URI.parse(FAYE_URL)

  form = Net::HTTP::Post.new(url.path)
  form.set_form_data(:message => message.to_json)

  http = Net::HTTP.new(url.host, url.port)

  http.use_ssl = (url.scheme == "https")
  # turn off certificate validation because of "certificate verify failed" error
  http.verify_mode = OpenSSL::SSL::VERIFY_NONE if http.use_ssl?

  http.start { |h| h.request(form) }
end
```

### Subscribing from JavaScript

```JavaScript
var clientAuth = {
  outgoing: function(message, callback) {
    // do not touch non-subscribe messages
    if( message.channel !== '/meta/subscribe' ) {
      return callback(message);
    }

    if( !message.ext ) message.ext = {};
    message.ext.auth_token = 'AUTH_TOKEN';
    message.ext.timestamp = 'TIMESTAMP';

    callback(message);
  }
};

var client = new Faye.Client('FAYE_URL');
client.addExtension(clientAuth);

client.subscribe('CHANNEL', function(data) {
  console.log(data);
});
```
