var express = require('express');
const db = require("../models");
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    return res.render('collection', {});
});

router.post('/', function (req, res, next) {
    //todo : add auth
    return res.render('collection');
});

router.get('/findall', (req, res) => {
    return db.Image.findAll()
        .then((alldata) => {
            res.send(alldata)
        })
        .catch((err) => {
            console.log(`error`, JSON.stringify(err))
            return res.send({message: err})
        });
});

module.exports = router;
