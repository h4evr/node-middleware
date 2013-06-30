var refData = require('./routes/processors/refdata');

var isArray = (function () {
    if (Array.isArray) {
        return Array.isArray;
    } else {
        return function (obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        };
    }
}());

var isObject = function (obj) {
    return typeof(obj) === 'object';
};


var paramRegExp = /\$\{([\w\.]+)\}/g;
var fullMatchParamRegExp = /^\$\{([\w\.]+)\}$/g;
var refDataKey = /^ref\./g;

function checkForParams(req, json, k, res, refDataKeys) {
    var val = json[k];

    if (typeof(val) === 'string') {
        var m, refKey;

        fullMatchParamRegExp.lastIndex = 0;
        paramRegExp.lastIndex = 0;

        if (m = fullMatchParamRegExp.exec(val)) {
            var paramName = m[1];
            refDataKey.lastIndex = 0;
            if (refDataKey.exec(paramName)) {
                refKey = paramName.replace(refDataKey, "");

                if (req.locals.ref && refKey in req.locals.ref) {
                    json[k] = req.locals.ref[refKey];
                } else {
                    refDataKeys.push(refKey);
                }
            } else {
                json[k] = req.locals[paramName] || res[paramName] || getValueFromObj(paramName, res, 0);
            }
        } else {
            json[k] = val.replace(paramRegExp, function (match, paramName) {
                refDataKey.lastIndex = 0;
                if (refDataKey.exec(paramName)) {
                    refKey = paramName.replace(refDataKey, "");

                    if (req.locals.ref && refKey in req.locals.ref) {
                        return req.locals.ref[refKey];
                    } else {
                        refDataKeys.push(refKey);
                        return match;
                    }
                } else {
                    return req.locals[paramName] || res[paramName] || getValueFromObj(paramName, res, 0);
                }
            });
        }
    } else if (isArray(val)) {
        for (var i = 0, len = val.length; i < len; ++i) {
            checkForParams(req, val, i, res, refDataKeys);
        }
    } else if (isObject(val)) {
        for (var k in val) {
            if (val.hasOwnProperty(k)) {
                checkForParams(req, val, k, res, refDataKeys);
            }
        }
    }
}

function replacePlaceHolders(req, res, obj, callback) {
    var refDataKeys = [];

    if (isArray(obj)) {
        for (var i = 0, len = obj.length; i < len; ++i) {
            checkForParams(req, obj, i, res, refDataKeys);
        }
    } else if (isObject(obj)) {
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                checkForParams(req, obj, k, res, refDataKeys);
            }
        }
    }

    if (refDataKeys.length == 0) {
        callback(null, obj);
    } else {
        getPlaceHolderValuesFromRefData(refDataKeys, function (err, values) {
            if (err) {
                callback(err);
            } else {
                req.locals.ref = values;
                replacePlaceHolders(req, res, obj, callback);
            }
        });
    }
}

function getPlaceHolderValuesFromRefData(refDataKeys, callback) {
    var refParentKeys = [];
    var subKeyParent = {},
        key, sep, parent;

    for (var i = 0, len = refDataKeys.length; i < len; ++i) {
        key = refDataKeys[i];
        sep = key.indexOf(".");
        if (sep === -1) {
            if (subKeyParent[key] === undefined) {
                subKeyParent[key] = key;
                refParentKeys.push(key);
            }
        } else {
            parent = key.substr(0, sep);
            if (subKeyParent[parent] === undefined) {
                subKeyParent[key] = parent;
                refParentKeys.push(parent);
            }
        }
    }

    refData.getRefData(refParentKeys, function (err, results) {
        if (err) {
            callback(err);
        } else {
            var finalValues = {};

            for (i = 0, len = refDataKeys.length; i < len; ++i) {
                finalValues[refDataKeys[i]] = getValueFromObj(refDataKeys[i], results[subKeyParent[refDataKeys[i]]] || {});
            }

            callback(null, finalValues);
        }
    });
}

function getValueFromObj(compositeKey, obj, startIndex) {
    var splitted = compositeKey.split(".");
    if (startIndex === undefined) {
        startIndex = 1;
    }

    // Starts at 1 to jump the root node, since obj should already be the contents of the root.
    for (var i = startIndex, len = splitted.length; i < len && obj[splitted[i]]; ++i) {
        obj = obj[splitted[i]];
    }

    return obj;
}

exports.replacePlaceHolders = replacePlaceHolders;
exports.isArray = isArray;
exports.isObject = isObject;