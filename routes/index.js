var express = require('express');
var router = express.Router();
const Cookies = require('cookies')
const keys = ['dragon leaf bike']


const db = require('../models');
const {maxAge} = require("express-session/session/cookie"); //contain the User model, which is accessible via db.User

/* GET home page. */
router.get('/', function (req, res, next) {

    if (req.session.email) {
        return res.render('home');
    }

    return res.render('index', {phase: 'login', details: {value: "", loginFailed: false}});


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


router.post('/', function (req, res, next) {
    const phase = req.body.phase;

    if (phase === "needToRegister") {
        return res.render('index', {
            phase: "needToRegister",
            details: {duplicate: false, inFormat: true, timedOut: false}
        });
    }

    const cookies = new Cookies(req, res, {keys: keys})
    const registrationCookie = cookies.get("registrationCookie", {signed: true})

    const {firstName, lastName} = req.body
    const email = req.body.email.toLowerCase()

    switch (phase) {

        case "finishedReg1":

            if (!registrationCookie) {
                cookies.set("registrationCookie", new Date().toISOString(), {signed: true, maxAge: 1000 * 60})
            }

            let duplicate = false;
            db.User.findOne({
                where: {email: email.toLowerCase()},
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
                    details: {duplicate: true, email, firstName, lastName, timedOut: false}
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
            if (!registrationCookie) {
                return res.render('index', {
                    phase: "needToRegister",
                    details: {email, firstName, lastName, duplicate: false, inFormat: true, timedOut: true}
                });
            }

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

        case "userLogged":

            const loginPassword = req.body.loginPassword

            db.User.findOne({
                where: {
                    email: email.toLowerCase(),
                    password: loginPassword
                }
            }).then(user => {

                if (user) { // exist
                    req.session.email = email.toLowerCase()
                    req.session.firstName = user.dataValues.firstName
                    req.session.lastName = user.dataValues.lastName

                    return res.redirect("/home")
                    //return res.render('homepage', {firstName: user.dataValues.firstName, lastName: user.dataValues.lastName});

                } else {
                    return res.render('index', {phase: "login", details: {value: email, loginFailed: true}});
                }

            }).catch(() => {
                console.log("in catch :(");
            });
            break; // to calm down the compiler


        default:
            return res.render('index', {phase: "default", details: {}});
    }

});
module.exports = router;
