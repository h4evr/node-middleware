var processors = require('../output_processors');

exports.process = function (module, req, res, onDone) {
    if (module.action === 'remove') {
        if (module.key in res) {
            delete res[module.key];
        }
    } else if (module.action === 'add') {
        res[module.key] = module.value;
    } else if (module.action === 'move') {
        res[module.to] = res[module.from];
        delete res[module.from];
    } else if (module.action === 'root') {
        var newRoot = getValueFromObj(module.newRoot, res);
        onDone(null, newRoot);
        return;
    } else if (module.action === 'convertstring') {
        var processor = processors[module.from];
        if (processor && processor['to' + (module.to || "").toUpperCase()]) {
            var obj = getValueFromObj(module.key, res);
            setValueToObj(res, module.key, processor['to' + (module.to || "").toUpperCase()](obj));
            onDone(null, res);
        } else {
            onDone(null, res);
        }
    }

    onDone(null, res);
};

function getValueFromObj(compositeKey, obj) {
    var splitted = compositeKey.split(".");

    for (var i = 0, len = splitted.length; i < len && obj[splitted[i]]; ++i) {
        obj = obj[splitted[i]];
    }

    return obj;
}

function setValueToObj(obj, compositeKey, newValue) {
    var splitted = compositeKey.split("."),
        len = splitted.length;

    for (var i = 0; i < len - 1; ++i) {
        if (!obj[splitted[i]]) {
            obj[splitted[i]] = {};
        }

        obj = obj[splitted[i]];
    }

    obj[splitted[len - 1]] = newValue;

    return newValue;
}