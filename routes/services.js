var processors = require("./processors"),
    outputProcessors = require("./output_processors"),
    Db = require('../database'),
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

function processModule(module, req, res, onDone) {
    if (processors[module.type]) {
        processors[module.type](module, req, res, onDone);
    } else {
        for (var k in res) {
            if (res.hasOwnProperty(k)) {
                delete res[k];
            }
        }
        res.statusCode = 500;
        res.error = "Module type \"" + module.type + "\" is unknown.";
        onDone(res);
    }
}

function processPipeline(service, req, res) {
    var i = 0,
        len = service.pipeline.length;

    var onPipelineDone = function (resp) {
        var outputType = req.locals.output || 'json';

        if (outputProcessors[outputType]) {
            outputProcessors[outputType].process(service, res, resp.statusCode || 200, resp);
        } else {
            res.send(500, { statusCode: 500, error: "Unknown output format: " + outputType });
        }
    };

    var onModuleDone = function (err, moduleResp) {
        if (err) {
            res.send(500, { error: err });
        } else {
            if (++i < len) {
                if (err) {
                    onPipelineDone(err);
                } else {
                    processModule(service.pipeline[i], req, moduleResp, onModuleDone);
                }
            } else {
                onPipelineDone(moduleResp);
            }
        }
    };

    if (len > 0) {
        processModule(service.pipeline[0], req, {}, onModuleDone);
    }
}

exports.callService = function (req, res) {
    db.collection('modules', function (err, collection) {
        if (err) {
            res.send(500, err);
        } else {
            collection.findOne({
                httpMethod: req.method,
                service: req.params.service,
                method: req.params.method
            }, function (err, results) {
                if (err) {
                    res.send(500, err);
                } else {
                    if (results) {
                        processPipeline(results, req, res);
                    } else {
                        res.send(401, {
                            statusCode: 401,
                            error: "Service or method not found",
                            httpMethod: req.method,
                            service: req.params.service,
                            method: req.params.method
                        });
                    }
                }
            });
        }
    });
};
