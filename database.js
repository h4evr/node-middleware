var mongo = require('mongodb'),
    Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure,
    serverData;

if (process && process.env.VCAP_SERVICES) {
    var env = JSON.parse(process.env.VCAP_SERVICES);
    serverData = env['mongodb-1.8'][0]['credentials'];
} else {
    serverData = {
        "hostname": "dharma.mongohq.com",
        "port": 10026,
        "username": "middleware",
        "password": "middleware123",
        "name": "",
        "db": "middleware"
    };
}

var server = new Server(serverData.hostname, serverData.port, { auto_reconnect: true }),
    db = new Db(serverData.db, server, { w: 1}),
    user = serverData.username,
    pass = serverData.password,
    status = 0,
    callbacks = [];

function openDb(cb) {
    if (status === 2) {
        cb(null, db);
    } else if (status === 1) {
        callbacks.push(cb);
    } else {
        status = 1;
        callbacks.push(cb);

        db.open(function (err, db) {
            if (!err) {
                db.authenticate(user, pass, function (err, result) {
                    status = 2;

                    if (!err && result === true) {
                        invokeCallbacks(null, db);
                    } else {
                        invokeCallbacks(err, db);
                    }
                })
            } else {
                cb(err, null);
            }
        });
    }
}

function invokeCallbacks(err, db) {
    for (var i = 0, ln = callbacks.length; i < ln; ++i) {
        callbacks[i](err, db);
    }
}

exports.open = openDb;
exports.BSON = BSON;