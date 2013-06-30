var Utils = require("../../utils");

exports.process = function (module, req, res, onDone) {
    var json = module.data || {};
    Utils.replacePlaceHolders(req, res, json, onDone);
};