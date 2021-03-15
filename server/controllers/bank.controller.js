const Bank = require("../models/Bank.model");
const Question = require("../models/Question.model");

const mongoose = require("mongoose");

module.exports.getPage = (req, res) => {
  const userId = req.userId;

  const { limitItems } = req.params;

  Bank.find({ idOwner: userId }).exec((err, banks) => {
    res.status(200).send({
      message: "[PAGES] Get pages",
      data: Math.ceil(banks.length / limitItems),
    });
  });
};
module.exports.getBanks = (req, res) => {
  const userId = req.userId;
  let { page } = req.params;
  let { limitItems } = req.params;

  page = parseInt(page);

  Bank.find({ idOwner: userId }).exec((err, bank) => {
    if (bank) {
      result = bank.slice((page - 1) * limitItems, page * limitItems);
      res.status(200).send({
        success: true,
        message: "[SUCCESS] User has banks",
        data: result,
      });
    } else {
      res.status(202).send({
        success: true,
        message: "[SUCCESS] User hasn't bank",
        data: [],
      });
    }
  });
};
module.exports.getOneBank = (req, res) => {
  const { id } = req.params;

  Bank.findOne({ _id: id }).exec(async (err, bank) => {
    let bankRes = {};
    let numberOfEasyQuestions = 0;
    let numberOfNormalQuestions = 0;
    let numberOfHardQuestions = 0;
    let forPromise = new Promise(async (resolve1, reject1) => {
      for (let question of bank.idQuestions) {
        let promise = new Promise((resolve, reject) => {
          Question.findOne({ _id: question }).exec((err, question) => {
            if (question) {
              question.level === "easy"
                ? resolve("easy")
                : question.level === "normal"
                ? resolve("normal")
                : resolve("hard");
            }
          });
        });
        await promise
          .then((res) => {
            res == "easy"
              ? numberOfEasyQuestions++
              : res == "normal"
              ? numberOfNormalQuestions++
              : numberOfHardQuestions++;
          })
          .catch((err) => {
            console.log(err);
          });
      }
      resolve1({
        numberOfEasyQuestions: numberOfEasyQuestions,
        numberOfNormalQuestions: numberOfNormalQuestions,
        numberOfHardQuestions: numberOfHardQuestions,
      });
    });
    let obj = {};

    await forPromise.then((res) => {
      obj = res;
    });

    bankRes = {
      ...bank._doc,
      numberOfEasyQuestions: obj.numberOfEasyQuestions,
      numberOfNormalQuestions: obj.numberOfNormalQuestions,
      numberOfHardQuestions: obj.numberOfHardQuestions,
    };

    // console.log(bankRes);
    if (bank) {
      res.status(200).send({
        success: true,
        message: "[SUCCESS] Get bank info",
        data: bankRes,
      });
    } else {
      res.status(202).send({
        success: false,
        message: "[ERROR] Id is not existed",
      });
    }
  });
};
module.exports.postBank = (req, res) => {
  // console.log(req.userId);
  let idQuestions = [];

  const { questions } = req.body;

  let newBank = new Bank({
    title: req.body.title,
    idOwner: req.userId,
  });

  for (let question of questions) {
    let count = 0;
    // console.log(question.answers.answers);
    for (let answer of question.answers.answers) {
      if (answer.isTrue) count++;
    }

    let newQuestion = new Question({
      title: question.title,
      level: question.level,
      answers: question.answers.answers,
      isManyAnswers: count >= 2 ? true : false,
      idBank: newBank._id,
    });

    newQuestion.save();

    idQuestions.push(newQuestion._id);
  }

  newBank.idQuestions = idQuestions;

  newBank.save();
  res.status(201).send({
    success: true,
    message: "Bank is created",
    data: newBank,
  });
};
module.exports.deleteBank = (req, res) => {
  const { id } = req.params;

  Bank.findByIdAndDelete({ _id: id }).exec((err, bank) => {
    if (bank) {
      for (let idQuestion of bank.idQuestions) {
        Question.findByIdAndDelete({ _id: idQuestion }).exec(
          (err, question) => {
            console.log(question);
          }
        );
      }
      res.status(202).send({
        success: true,
        message: "Bank is deleted",
        data: id,
      });
    } else
      res.status(202).send({
        success: false,
        message: "Bank isn't deleted",
      });
  });
};
module.exports.searchBank = (req, res) => {
  const {userId} = req;
  const { name } = req.body;
  let { page } = req.body;
  page = parseInt(page);

  console.log(name);
  console.log(page);
  Bank.find({idOwner: userId}).exec((err, banks) => {
    let results = [];
    if (banks) {
      for (let bank of banks) {
        if (~bank.title.toLowerCase().indexOf(name.toLowerCase()))
          results.push(bank);
      }
      // console.log(results);
      res.send({
        success: true,
        message: "Search bank",
        data: results.slice((page - 1) * 5, page * 5),
        pages: Math.ceil(results.length / 5),
      });
    } else
      res.send({
        success: false,
        message: "Search bank not found",
        data: [],
        pages: 0,
      });
  });
};
module.exports.searchQuestion = (req, res) => {
  const { name } = req.params;

  let results = Question.aggregate([
    {
      $set: {
        res: {
          $indexOfCP: ["$title", name],
        },
      },
    },
  ]);
  results.exec((err, questions) => {
    console.log(questions);
    res.status(200).send({
      success: true,
      message: "Search questions",
      data: questions.filter((question) => question.res != -1),
    });
  });
};
module.exports.getQuestions = (req, res) => {
  const { id } = req.body;
  const { limitItems } = req.body;

  let { page } = req.body;

  page = parseInt(page);

  if (id)
    Question.find({ idBank: id }).exec((err, questions) => {
      let result = questions.slice((page - 1) * limitItems, page * limitItems);

      if (questions.length > 0) {
        res.status(200).send({
          success: true,
          message: "Get bank's questions by id",
          data: result,
        });
      }
    });
};
module.exports.getQuestionPages = (req, res) => {
  const { id } = req.params;
  const { limitItems } = req.params;

  Question.find({ idBank: id }).exec((err, questions) => {
    res.status(200).send({
      success: true,
      message: "Get question pages",
      data: Math.ceil(questions.length / limitItems),
    });
  });
};
module.exports.getQuestion = (req, res) => {
  const { id } = req.params;
  console.log(id);
  Question.findOne({ _id: id }).exec((err, question) => {
    if (question) {
      res.status(200).send({
        success: true,
        message: "Get one question by id",
        data: question,
      });
    }
  });
};

module.exports.postQuestion = (req, res) => {
  console.log(req.body);
  let count = 0;
  let isManyAnswers = false;

  for (let i = 0; i < req.body.answers.length; i++) {
    if (req.body.answers[i].isTrue) count++;
  }

  if (count > 1) isManyAnswers = true;

  let newQuestion = new Question({
    title: req.body.title,
    answers: req.body.answers,
    level: req.body.level,
    isManyAnswers: isManyAnswers,
    idBank: req.body.idBank,
  });

  newQuestion.save();
  console.log(newQuestion);

  Bank.findOne({ _id: req.body.idBank }).exec((err, bank) => {
    // console.log(bank);
    bank.idQuestions = [...bank.idQuestions, newQuestion._id];
    bank.save();
  });

  res.status(202).send({
    success: true,
    message: "Question is created",
    data: newQuestion,
  });
};
module.exports.updateQuestion = (req, res) => {
  let count = 0;

  for (let answer of req.body.answers) {
    if (answer.isTrue) count++;
  }

  if (count >= 2) {
    req.body.isManyAnswers = true;
  } else req.body.isManyAnswers = false;

  if (!req.body.title) {
    Question.findOne({ _id: req.body._id }).exec((err, question) => {
      Bank.findOne({ _id: question.idBank }).exec((err, bank) => {
        bank.idQuestions = bank.idQuestions.filter(
          (bank) => bank._id != req.body._id
        );
        console.log(bank.idQuestions);
        bank.save();
      });
    });
    Question.deleteOne({ _id: req.body._id }).exec((err, question) => {});

    res.status(200).send({
      success: true,
      message: "[DELETE] Delete question done",
      data: Object.assign({ title: "" }, req.body),
    });
  } else {
    Question.findOneAndUpdate({ _id: req.body._id }, req.body).exec(
      (err, question) => {
        if (question) {
          res.status(200).send({
            success: true,
            message: "[UPDATE] Update question done",
            data: req.body,
          });
        }
      }
    );
  }
};
module.exports.updateBank = (req, res) => {
  let { id, title } = req.body;

  let objectId = mongoose.Types.ObjectId(id);

  Bank.updateOne({ _id: id }, { title: title }).exec((err, bank) => {
    if (bank) {
      Bank.aggregate([
        {
          $match: {
            _id: objectId,
          },
        },
      ]).exec((err, bank) => {
        console.log(bank);
        res.status(200).send({
          success: true,
          message: "Update finish",
          data: bank,
        });
      });
    }
  });
};
