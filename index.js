const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/quiznow";
const cors = require('cors');

// routes
const userRoutes = require("./server/routes/user.route");

const checkIfAuthenticated = require('./middlewares/checkIfAuthenticated');

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(cors());

// using routes
app.use("/api/user", userRoutes);

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection
  .once("open", () => console.log("Database is ready"))
  .on("error", (error) => {
    console.log("Error: ", error);
  });

app.get("/", checkIfAuthenticated, (req, res) => {
  res.status(200).send({
    isLogin: true,
    message: "This request is authenticated"
  })
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
