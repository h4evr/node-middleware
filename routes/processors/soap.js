var Utils = require("../../utils"),
    soap = require("soap");

exports.process = function (module, req, res, onDone) {
    var soapInvocation = {
        service: module.service || {},
        method: module.method || "",
        params: module.params || []
    };

    Utils.replacePlaceHolders(req, res, soapInvocation, function (err, soapInvocation) {
        soap.createClient(soapInvocation.service.wsdl, function (err, client) {
            if (err) {
                onDone(err);
            } else {
                // Configure security
                if (soapInvocation.service.user !== undefined) {
                    client.setSecurity(new soap.WSSecurity(soapInvocation.service.user, soapInvocation.service.pass));
                }

                // Invoke the method
                client[soapInvocation.method](soapInvocation.params, function (err, result) {
                    if (err) {
                        onDone({ statusCode: 500, error : result.body, lastRequest: client.lastRequest });
                    } else {
                        onDone(null, result);
                    }
                });
            }
        });
    });
};