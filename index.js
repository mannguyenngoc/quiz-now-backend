const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const url = "mongodb://localhost:27017/quiznow";
const url = "mongodb://database/quiznow";
// const url = "mongodb://192.168.0.101:27017/quiznow";

const cors = require("cors");


// routes
const userRoutes = require("./server/routes/user.route");
const bankRoutes = require("./server/routes/bank.route");
const testRoutes = require("./server/routes/test.route");
const resultRoutes = require("./server/routes/result.route");

const checkIfAuthenticated = require("./middlewares/checkIfAuthenticated");

// const passport = require("passport");
const expressSession = require('express-session')
const cookieParser = require('cookie-parser')

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cors());

app.use(cookieParser());
app.use(
  expressSession({
    secret: "5om35ecr37",
    resave: false,
    saveUninitialized: false,
  })
);
// app.use(passport.initialize());
// app.use(passport.session());
// config
require("./config/passport");

// using routes
app.use("/api/user", userRoutes);
app.use("/bank", bankRoutes);
app.use("/test", testRoutes);
app.use("/result", resultRoutes);

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection
  .once("open", () => console.log("Database is ready"))
  .on("error", (error) => {
    console.log("Error: ", error);
  });

mongoose.set("useFindAndModify", false);

app.get("/", checkIfAuthenticated, (req, res) => {
  console.log('hello')
  res.status(200).send({
    isLogin: true,
    message: "This request is authenticated",
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
