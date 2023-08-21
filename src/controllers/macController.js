

exports.getMaclan = async (req, res, next) => {
    let mac = req.params.mac;
    console.log(mac)
    const models = require('../models/Mac')
    let data = await  models.get(mac)
    res.status(200).send(data);
};

exports.getMacwan = async (req, res, next) => {
    let mac = req.params.mac;
    const models = require('../models/Macwan')
    let data = await  models.get(mac)
    res.status(200).send(data);
};