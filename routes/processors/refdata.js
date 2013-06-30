var Db = require('../../database'),
    db = null;

/* START: Database initialization. */
Db.open(function (err, newDb) {
    if (err) {
        console.error(err);
    } else {
        db = newDb;
    }
});
/* END: Database initialization. */

exports.getRefData = function (keys, callback) {
    db.collection('referencedata', function (err, collection) {
        if (err) {
            callback(err, null);
        } else {
            collection.find({ name: { $in : keys} }).toArray(function (err, results) {
                if (err) {
                    callback(err);
                } else {
                    var res = {}, item;

                    for (var i = 0, len = results.length; i < len; ++i) {
                        item = results[i];
                        res[item.name] = item.data;
                    }

                    callback(null, res);
                }
            });
        }
    });
};