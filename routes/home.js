var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    return res.render('home');
});
router.post('/', function (req, res, next) {
    //todo : add auth
    return res.render('home');
});

module.exports = router;
