exports.process = function (service, res, statusCode, resp) {
    res.json(statusCode, resp);
};