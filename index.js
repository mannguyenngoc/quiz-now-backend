const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/quiznow";
const cors = require("cors");

// routes
const userRoutes = require("./server/routes/user.route");
const bankRoutes = require("./server/routes/bank.route");
const testRoutes = require("./server/routes/test.route");
const resultRoutes = require("./server/routes/result.route");

const checkIfAuthenticated = require("./middlewares/checkIfAuthenticated");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(cors());

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
  res.status(200).send({
    isLogin: true,
    message: "This request is authenticated",
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
