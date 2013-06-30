/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();

var allowCrossDomain = function (req, res, next) {
    "use strict";
    res.header("Access-Control-Allow-Origin", req.header("Origin"));
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Credentials", "true");

    next();
};

function extend(dest) {
    var src;

    for (var i = 1, len = arguments.length; i < len; ++i)  {
        src = arguments[i];

        for (var k in src) {
            if (src.hasOwnProperty(k)) {
                dest[k] = src[k];
            }
        }
    }
    return dest;
}

var consolidateParams = function (req, res, next) {
    req.locals = extend(req.locals || {}, req.params || {}, req.query || {}, req.body || {});
    next();
};

// all environments
app.set('port', process.env.PORT || 9999);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(allowCrossDomain);
app.use(consolidateParams);
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/*
 * Respond to OPTIONS (HTTP Access Control)
 */
app.options("/*", function (req, res, next) {
    "use strict";
    res.send(200);
});

app.get('/', routes.index);
app.all('/service/:service/:method', routes.services.callService);

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
