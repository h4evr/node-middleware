exports.process = function (module, req, res, onDone) {
    var ret;

    try {
        var fn = new Function("params", "res", module.script); //eval
        ret = fn.call(null, req.locals, res);
    } catch (e) {
        onDone({
            statusCode: 500,
            error: e
        });
    }

    if (ret === false) {
        onDone(res);
    } else {
        onDone(null, res);
    }
};