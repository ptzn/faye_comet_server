Faye Comet Server
==================

Comet server based on [faye](http://faye.jcoglan.com/).

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
