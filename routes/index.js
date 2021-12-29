var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  return res.render('index', {phase: 'login', details : {}});
});


router.post('/', function (req, res, next) {
  const phase = req.body.phase;
  const {email, firstName, lastName} = req.body

  switch (phase) {
    case "needToRegister":
      return res.render('index', {phase: "needToRegister", details : {}});
    case "finishedReg1":
      return res.render('index', {phase: "choosePassword", details : {email, firstName, lastName}});
    case "added":
      return res.render('index', {phase: "added", details : {}});
    default:
      return res.render('index', {phase: "default", details : {}});
  }

});
module.exports = router;
