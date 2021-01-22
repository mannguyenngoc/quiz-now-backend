const Test = require("../models/Test.model");
const Bank = require("../models/Bank.model");
const Question = require("../models/Question.model");

const shortid = require('shortid');

module.exports.createTest = (req, res) => {
  //   console.log(req.body);
  // console.log(req.userId)

  let newTest = new Test({
    title: req.body.title,
    code: req.body.code,
    link: `http://localhost:4200/test/access/${shortid.generate()}`,
    time: req.body.time,
    requiredName: req.body.requiredName,
    requiredMsv: req.body.requiredMsv,
    knowTheResult: req.body.knowTheResult,
    owner: req.userId,
    numberOfEasyQuestions: req.body.numberOfEasyQuestions,
    numberOfNormalQuestions: req.body.numberOfNormalQuestions,
    numberOfHardQuestions: req.body.numberOfHardQuestions,
    source: req.body.source,
  });

  let promise = new Promise((resolve, reject) => {
    for (let j = 0; j < 3; j++) {
      let levelType;
      let numberQuestions;

      switch (j) {
        case 0:
          levelType = "easy";
          numberQuestions = req.body.numberOfEasyQuestions;
          break;
        case 1:
          levelType = "normal";
          numberQuestions = req.body.numberOfNormalQuestions;
          break;
        default:
          levelType = "hard";
          numberQuestions = req.body.numberOfHardQuestions;
          break;
      }
      Question.find({ bank: req.body.source, level: levelType }).exec(
        (err, questions) => {
          let listQuestions = questions;
          let idQuestions = [];

          for (let i = 1; i <= numberQuestions; i++) {
            let indexRandom = Math.floor(Math.random() * listQuestions.length);

            if (listQuestions[indexRandom] !== 0) {
              idQuestions.push(listQuestions[indexRandom]);
              listQuestions[indexRandom] = 0;
            }
          }

          newTest.questions = newTest.questions.concat(idQuestions);

          if (j == 2) resolve(newTest.questions);
        }
      );
    }
  }).then((result) => {
    newTest.questions = result;
    newTest.save();
  });

  Bank.findOne({ _id: req.body.source}, (err, bank) => {
      bank.test.push(newTest._id);

      bank.save();
  })
  res.status(200).send({
    success: true,
    message: "[SUCCESS] Generate new test",
    data: newTest._id,
  });
};

module.exports.accessTest = (req, res) => {
  console.log(req.params.shortId);
  const link = `http://localhost:4200/test/access/${req.params.shortId}`;

  Test.findOne({ link: link }).exec((err, test) => {
    if (test) {
      res.status(200).send({
          success: true,
          message: '[SUCCESS] Test detail',
          data: test
      });
    }
  });
};
module.exports.allTest = (req, res) => {
    Test.find({}).exec((err, tests) => {
        if (tests.length > 0) {
            res.status(200).send({
                success: true,
                message: '[SUCCESS] Get all test',
                data: tests
            })
        }
    })
}
