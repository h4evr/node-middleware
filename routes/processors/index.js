var javascript = require('./javascript'),
    manipulate = require('./manipulate'),
    json = require('./json'),
    soap = require('./soap');

exports.javascript = javascript.process;
exports.manipulate = manipulate.process;
exports.json = json.process;
exports.soap = soap.process;