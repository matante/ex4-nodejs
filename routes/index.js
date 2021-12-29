var express = require('express');
var router = express.Router();

const db = require('../models'); //contain the User model, which is accessible via db.User

/* GET home page. */
router.get('/', function (req, res, next) {
    return res.render('index', {phase: 'login', details: {}});
});

router.get('/findall', (req, res) => {
    return db.User.findAll()
        .then((alldata) => {
            res.send(alldata)
        })
        .catch((err) => {
            console.log(`error`, JSON.stringify(err))
            return res.send({message: err})
        });
});

const validateEmail = (email) => {
    return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

router.post('/', function (req, res, next) {
    const phase = req.body.phase;
    const {email, firstName, lastName} = req.body

    switch (phase) {
        case "needToRegister":
            return res.render('index', {phase: "needToRegister", details: {duplicate: false, inFormat: true}});

        case "finishedReg1":

            let duplicate = false;
            db.User.findOne({
                where: {email: email},
            }).then(user => {
                if (user) { // already exist
                    duplicate = true;
                }
            }).catch(() => {
                console.log("in catch :(");
            });

            if (duplicate) {
                return res.render('index', {
                    phase: "needToRegister",
                    details: {duplicate: true, email, firstName, lastName}
                });

            } else {
                return res.render('index', {
                    phase: "choosePassword", details: {
                        email, firstName, lastName,
                        matching: true, isLongEnough: true
                    }
                });
            }


        case "entered2Passwords":
            const LENGTH = 8;
            const {pass1, pass2} = req.body
            const matching = pass1 === pass2;
            const isLongEnough = pass1.length === LENGTH && pass2.length === LENGTH


            if (matching && isLongEnough) {
                return db.User.create({email, firstName, lastName, password: pass1})
                    .then((user) => {
                        return res.render('index', {phase: "added", details: {}});
                    })
                    .catch((err) => {
                        console.log('*** error creating a user', err.message)
                        return res.status(400).send(err)
                    })

            } else if (!matching && !isLongEnough) {
                return res.render('index', {phase: "choosePassword", details: {matching: false, isLongEnough: false}});
            } else if (matching && !isLongEnough) {
                return res.render('index', {phase: "choosePassword", details: {matching: true, isLongEnough: false}});
            } else if (!matching && isLongEnough) {
                return res.render('index', {phase: "choosePassword", details: {matching: false, isLongEnough: true}});
            }

        default:
            return res.render('index', {phase: "default", details: {}});
    }

});
module.exports = router;
