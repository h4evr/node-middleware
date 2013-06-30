exports.index = function (req, res) {
    res.render('index', { title: 'Express' });
};

exports.services = require("./services");