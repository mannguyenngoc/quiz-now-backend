const jwt = require("jsonwebtoken");

const User = require("../server/models/User.model");

const SECRET_KEY = "hello-jwt";

const checkIfAuthenticated = (req, res, next) => {
  const token = req.headers.authorization;

  if (token)
    jwt.verify(token, SECRET_KEY, function (err, decoded) {
      if (err) {
        console.log('expired');
      }
      if (decoded) {
        const { userID } = decoded;

        User.findOne({ _id: userID }, function (err, user) {
          if (user) {
            req.userId = userID;
            next();
          } else res.redirect("back");
        });
      }
    });
};

module.exports = checkIfAuthenticated;
