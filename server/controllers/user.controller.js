const User = require("../models/User.model");

const jwt = require("jsonwebtoken");

const hashPassword = require("../../functions/hashPassword");
const comparePassword = require("../../functions/comparePassword");

module.exports.postUser = (req, res) => {
  User.findOne({ username: req.body.username }).exec((err, user) => {
    try {
      if (!user) {
        User.findOne({ mail: req.body.mail }).exec((err, user) => {
          if (!user) {
            User.findOne({ msv: req.body.msv }).exec((err, user) => {
              if (!user) {
                const newUser = new User({
                  name: req.body.name,
                  username: req.body.username,
                  password: hashPassword(req.body.password),
                  avatarUrl: req.body.avatarUrl,
                  msv: req.body.msv,
                  mail: req.body.mail,
                  listOfResults: [],
                });
                newUser.save();
                res.status(201).send({
                  success: true,
                  message: "Register successfully",
                  data: newUser,
                });
              } else {
                res.status(202).send({
                  success: false,
                  message: "Student ID is existed",
                });
              }
            });
          } else {
            res.status(202).send({
              success: false,
              message: "Mail is existed",
            });
          }
        });
      } else {
        res.status(202).send({
          success: false,
          message: "Username is existed",
        });
      }
    } catch (err) {
      console.log(err);
    }
  });
};

module.exports.userLogin = (req, res) => {
  // console.log(req.headers);
  const { username, password } = req.body;

  User.findOne({ username: username }).exec((err, user) => {
    if (user) {
      if (comparePassword(password, user.password)) {
        let token = jwt.sign({ userID: user._id }, "hello-jwt", {
          expiresIn: "7200000",
        });

        res.status(200).send({
          success: true,
          message: "Login successfully",
          token: token,
          expiresIn: "3600000",
          username: username,
          name: user.name,
        });

      } else {
        res.status(202).send({
          success: false,
          message: "Password is incorrect",
        });
      }
    } else {
      res.status(202).send({
        success: false,
        message: "Account is not existed",
      });
    }
  });
};
