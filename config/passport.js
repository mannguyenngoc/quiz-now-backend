const mongoose = require('mongoose');
// const passport = require('passport');
// const LocalStrategy = require('passport-local');

// const User = require("../models/User.model");

// passport.use(new LocalStrategy((username, password, done) => {
//     User.findOne({username}).then((err,user) => {
//         if (!user || !user.validatePassword(password)) {
//             return done(null, false, {errors: {'email or password': 'is invalid'}});
//         }

//         return done(null, user);
//     }).catch(done)
// }))