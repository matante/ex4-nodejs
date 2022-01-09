var express = require('express');
var router = express.Router();

const db = require('../models'); //contain the User model, which is accessible via db.User

router.get('/images', (req, res) => {
    return db.Image.findAll()
        .then((images) => res.send(images))
        .catch((err) => {
            console.log('There was an error querying contacts', JSON.stringify(err))
            err.error = 1; // some error code for client side
            return res.send(err)
        });
});
//
// router.post('/users', (req, res) => {
//     const {firstName, lastName, password} = req.body
//     const email = req.body.email.toLowerCase()
//
//     return db.User.create({email, firstName, lastName, password})
//         .then((user) => res.send(user))
//         .catch((err) => {
//             console.log('*** error creating a user', JSON.stringify(user))
//             return res.status(400).send(err)
//         })
// });
//
// router.get('/users/:email', function (req, res, next) {
//
//     const email = req.params.email.toLowerCase();
//
//     db.User.findOne({
//         where: {email: email},
//     }).then(user => {
//         if (!user){
//             return res.json({found: false})
//         }
//         return res.json({found: true})
//
//     }).catch (
//
//     );
//
// });

module.exports = router;
