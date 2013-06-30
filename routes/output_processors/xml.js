var Utils = require("../../utils"),
    xml2json = require("xml2json");

var convertObjectToXml = function (obj) {
    if (obj === null || obj === undefined) {
        return "";
    }

    var output = "";

    if (Utils.isArray(obj)) {
        for (var i = 0, len = obj.length; i < len; ++i) {
            output += "<item id=\"" + i + "\">" + convertObjectToXml(obj[i]) + "</item>";
        }
    } else if (Utils.isObject(obj)) {
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                if (k === '_id') {
                    output += "<id>" + convertObjectToXml(obj[k]) + "</id>";
                } else {
                    output += "<" + k + ">" + convertObjectToXml(obj[k]) + "</" + k + ">";
                }
            }
        }
    } else {
        output += obj.toString();
    }

    return output;
};

exports.process = function (service, res, statusCode, resp) {
    var output = "<result>";
    output += convertObjectToXml(resp);
    output += "</result>";

    if (!res.headerSent) {
        res.set("Content-Type", "text/xml");
    }
    res.send(statusCode, output);
};

exports.toJSON = function (string) {
    if (!string) {
        return null;
    }

    if (typeof(string) !== 'string') {
        return string;
    }

    try {
        return xml2json.toJson(string, { object: true });
    } catch (e) {
        return string;
    }
};