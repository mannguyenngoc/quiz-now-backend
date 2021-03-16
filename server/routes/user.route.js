const express = require("express");
const router = express.Router();

const controller = require("../controllers/user.controller");
const checkIfAuthenticated = require("../../middlewares/checkIfAuthenticated");

const User = require("../models/User.model");

// const passport = require("passport"),
//   LocalStrategy = require("passport-local").Strategy;

const comparePassword = require("../../functions/comparePassword");

// passport.serializeUser((user, done) => {
//     console.log(user)
//     done(null, user.id)
//   })
// passport.deserializeUser(function(id, done) {
//     User.findById(id).then((user) => {
//         console.log(user);
//         done(null, user);
//     }).catch((err) => {
//         console.log(err)
//     })
// })
// passport.use(
//   new LocalStrategy((username, password, done) => {
//     User.findOne({ username: username }, (err, user) => {
//       //   console.log(password);
//       //   console.log(user.password);
//       //   console.log(comparePassword(password, user.password));

//       if (err) return done(err);
//       if (!user) {
//         return done(null, false, { message: "Incorrect username" });
//       }
//       if (!comparePassword(password, user.password)) {
//         return done(null, false, { message: "Incorrect password" });
//       }
//       console.log('right')
//       return done(null, user);
//     });
//   })
// );
router.post("/register", controller.postUser);
router.post("/login", controller.userLogin);
// router.post(
//   "/login",
//   passport.authenticate("local", {
//     successRedirect: "/",
//     failureRedirect: "/",
//     session: false,
//   })
// );

module.exports = router;
