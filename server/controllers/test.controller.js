const Test = require("../models/Test.model");
const Bank = require("../models/Bank.model");
const Question = require("../models/Question.model");
const Result = require("../models/Result.model");

const shortid = require("shortid");

const convertToDate = require("../../functions/convertToDate");

module.exports.getPage = (req, res) => {
  const { idBank } = req.params;
  Test.find({ source: idBank }).exec((err, tests) => {
    res.status(200).send({
      message: "[PAGES] Get pages tests",
      data: Math.ceil(tests.length / 5),
    });
  });
};
module.exports.createTest = (req, res) => {
  let newTest = new Test({
    title: req.body.title,
    code: req.body.code,
    link: `http://localhost:4200/test/access/${shortid.generate()}`,
    time: req.body.time,
    requireInfo: req.body.requireInfo,
    knowTheResult: req.body.knowTheResult,
    owner: req.userId,
    numberOfEasyQuestions: req.body.numberOfEasyQuestions,
    numberOfNormalQuestions: req.body.numberOfNormalQuestions,
    numberOfHardQuestions: req.body.numberOfHardQuestions,
    source: req.body.source,
  });
  console.log(req.body.numberOfEasyQuestions);
  console.log(req.body.numberOfNormalQuestions);
  console.log(req.body.numberOfHardQuestions);

  let promise = new Promise((resolve, reject) => {
    for (let j = 0; j < 3; j++) {
      let levelType;
      let numberQuestions;

      // console.log(req.body);
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
      Question.find({ idBank: req.body.source, level: levelType }).exec(
        (err, questions) => {
          let listQuestions = questions;
          let idQuestions = [];

          for (let i = 1; i <= numberQuestions; i++) {
            let indexRandom;
            while (true) {
              indexRandom = Math.floor(Math.random() * listQuestions.length);
              if (listQuestions[indexRandom]) {
                break;
              }
            }
            idQuestions.push(listQuestions[indexRandom]);
            listQuestions[indexRandom] = 0;
          }
          newTest.questions = newTest.questions.concat(idQuestions);
          // console.log(j + ": ", listQuestions);
          if (j == 2) resolve(newTest.questions);
        }
      );
    }
  }).then((result) => {
    // console.log('result is: ', result);
    newTest.questions = result;
    newTest.save();
  });

  Bank.findOne({ _id: req.body.source }, (err, bank) => {
    bank.idTests.push(newTest._id);

    bank.save();
  });
  res.status(200).send({
    success: true,
    message: "[SUCCESS] Generate new test",
    data: newTest,
  });
};
module.exports.getOneQuestionInTest = (req, res) => {
  const link = `http://localhost:4200/test/access/${req.body.shortId}`;

  Test.findOne({ link: link }).exec((err, test) => {
    if (test) {
      for (let question of test.questions) {
        if (question)
          for (let answer of question.answers) {
            answer.isTrue = undefined;
          }
      }
      console.log(req.body.number);
      console.log(test.questions[+req.body.number - 1]);
      res.status(200).send({
        success: true,
        message: "Get question by scroll",
        data: test.questions[+req.body.number - 1],
      });
    }
  });
};
module.exports.accessTest = (req, res) => {
  const link = `http://localhost:4200/test/access/${req.params.shortId}`;

  Test.findOne({ link: link }).exec((err, test) => {
    if (test) {
      for (let question of test.questions) {
        if (question)
          for (let answer of question.answers) {
            answer.isTrue = undefined;
          }
      }
      // console.log(test.questions[0].answers);
      if (test) {
        test.code = undefined;
        // test.questions = test.questions.slice(0, 10);
        res.status(200).send({
          success: true,
          message: "[SUCCESS] Test detail",
          data: test,
        });
      }
    }
  });
};
module.exports.allTest = async (req, res) => {
  let { page } = req.body;
  const { id } = req.body;
  page = parseInt(page);

  const listResults = await Test.aggregate([
    {
      $project: {
        _id: {
          $toString: "$_id",
          
        },
        title: 1
      },
    },  
    {
      $lookup: {
        from: "results",
        localField: "_id",
        foreignField: "idTest",
        as: "testInfo",
      },
    },
    { $limit: 1 },
  ]);
  console.log(listResults);

  Test.find({ source: id }).exec((err, tests) => {
    if (tests) {
      result = tests.slice((page - 1) * 5, page * 5);
      res.status(200).send({
        success: true,
        message: "[SUCCESS] Get all test by page",
        data: result,
      });
    }
  });
};
module.exports.detailTest = (req, res) => {
  Test.findOne({ _id: req.params.idTest }).exec((err, test) => {
    if (test) {
      res.status(200).send({
        success: true,
        message: "[TEST] Get test ok",
        data: test,
      });
    }
  });
};
module.exports.submitTest = (req, res) => {
  Test.findOne({ _id: req.body.testId }).exec((err, test) => {
    let score = 0;
    let numberOfEasyQuestions = 0;
    let numberOfNormalQuestions = 0;
    let numberOfHardQuestions = 0;

    let userAnswers = [];

    for (let i = 0; i < test.questions.length; i++) {
      let flag = 0;
      let state = false;
      let count = test.questions[i].answers.filter((answer) => answer.isTrue)
        .length;

      for (let answer of test.questions[i].answers) {
        if (test.questions[i].isManyAnswers) {
          if (~req.body.answers[i].indexOf(answer.title) && answer.isTrue) {
            flag++;
            console.log(answer.title, count, flag);
            console.log(req.body.answers.length);

            if (flag === count && req.body.answers[i].length <= count) {
              test.questions[i].level === "easy"
                ? numberOfEasyQuestions++
                : test.questions[i].level === "normal"
                ? numberOfNormalQuestions++
                : numberOfHardQuestions++;

              score++;
              state = true;
            }
          }
        } else if (
          ~req.body.answers[i].indexOf(answer.title) &&
          answer.isTrue
        ) {
          test.questions[i].level === "easy"
            ? numberOfEasyQuestions++
            : test.questions[i].level === "normal"
            ? numberOfNormalQuestions++
            : numberOfHardQuestions++;
          score++;
          state = true;
        }
      }
      let object = { answers: req.body.answers[i], isTrue: state };
      userAnswers.push(object);
    }
    let SCORE = score / test.questions.length;

    console.log("easy: ", numberOfEasyQuestions);
    console.log("normal: ", numberOfNormalQuestions);
    console.log("hard: ", numberOfHardQuestions);

    Result.findOne({ idUser: req.userId, idTest: req.body.testId }).exec(
      (err, result) => {
        if (result) {
          result.count++;
          result.numberOfEasyQuestions = numberOfEasyQuestions;
          result.numberOfNormalQuestions = numberOfNormalQuestions;
          result.numberOfHardQuestions = numberOfHardQuestions;
          result.userAnswers = userAnswers;
          result.score = SCORE;
          result.save();
        } else {
          const result = new Result({
            idTest: req.body.testId,
            idUser: req.userId,
            numberOfEasyQuestions: numberOfEasyQuestions,
            numberOfNormalQuestions: numberOfNormalQuestions,
            numberOfHardQuestions: numberOfHardQuestions,
            count: 1,
            infos: req.body.info,
            userAnswers: userAnswers,
            score: SCORE,
            time: Date.now(),
          });
          console.log(result);
          result.save();
        }
      }
    );
    if (test.knowTheResult) {
      res.status(201).send({
        success: "true",
        message: "[TEST] Finish test",
        data: SCORE,
      });
    } else {
      res.status(201).send({
        success: "true",
        message: "[TEST] Finish test",
      });
    }
  });
};
module.exports.checkCode = (req, res) => {
  const { idTest, code } = req.body;
  Test.findOne({ _id: idTest }).exec((err, test) => {
    if (code === test.code) {
      res.status(200).send({
        success: true,
        message: "CODE IS ACCEPTED",
      });
    } else
      res.status(200).send({
        success: false,
        message: "CODE IS WRONG",
      });
  });
};
