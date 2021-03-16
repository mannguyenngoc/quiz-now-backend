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
  const { userId } = req;
  let { page } = req.params;
  let { limitItems } = req.params;

  limitItems = parseInt(limitItems);
  page = parseInt(page);
  const skip = (page - 1) * limitItems;

  Bank.aggregate([
    {
      $match: {
        idOwner: userId,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limitItems,
    },
  ]).exec((err, banks) => {
    if (banks.length > 0) {
      res.status(200).send({
        success: true,
        message: "[SUCCESS] User  has banks",
        data: banks,
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
  const { userId } = req;

  Bank.findOne({ _id: id, idOwner: userId }).exec((err, bank) => {
    if (bank) {
      console.log(bank);
      Question.aggregate([
        {
          $match: {
            idBank: id,
          },
        },
        {
          $project: {
            level: 1,
          },
        },
        {
          $group: {
            _id: "$level",
            qty: { $sum: 1 },
          },
        },
      ]).exec((err, questions) => {
        let bankRes = {
          ...bank._doc,
        };

        for (q of questions) {
          q._id === "hard"
            ? (bankRes.numberOfHardQuestions = q.qty)
            : q._id === "normal"
            ? (bankRes.numberOfNormalQuestions = q.qty)
            : (bankRes.numberOfEasyQuestions = q.qty);
        }

        res.status(200).send({
          success: true,
          message: "[SUCCESS] Get bank info",
          data: bankRes,
        });
      });
    } else {
      res.status(202).send({
        success: false,
        message: "[ERROR] Id is not existed",
      });
    }
  });
  // Bank.findOne({ _id: id, idOwner: userId }).exec(async (err, bank) => {
  //   let bankRes = {};
  //   let numberOfEasyQuestions = 0;
  //   let numberOfNormalQuestions = 0;
  //   let numberOfHardQuestions = 0;
  //   let forPromise = new Promise(async (resolve1, reject1) => {
  //     for (let question of bank.idQuestions) {
  //       let promise = new Promise((resolve, reject) => {
  //         Question.findOne({ _id: question }).exec((err, question) => {
  //           if (question) {
  //             question.level === "easy"
  //               ? resolve("easy")
  //               : question.level === "normal"
  //               ? resolve("normal")
  //               : resolve("hard");
  //           }
  //         });
  //       });
  //       await promise
  //         .then((res) => {
  //           res == "easy"
  //             ? numberOfEasyQuestions++
  //             : res == "normal"
  //             ? numberOfNormalQuestions++
  //             : numberOfHardQuestions++;
  //         })
  //         .catch((err) => {
  //           console.log(err);
  //         });
  //     }
  //     resolve1({
  //       numberOfEasyQuestions: numberOfEasyQuestions,
  //       numberOfNormalQuestions: numberOfNormalQuestions,
  //       numberOfHardQuestions: numberOfHardQuestions,
  //     });
  //   });
  //   let obj = {};

  //   await forPromise.then((res) => {
  //     obj = res;
  //   });

  //   bankRes = {
  //     ...bank._doc,
  //     numberOfEasyQuestions: obj.numberOfEasyQuestions,
  //     numberOfNormalQuestions: obj.numberOfNormalQuestions,
  //     numberOfHardQuestions: obj.numberOfHardQuestions,
  //   };

  //   if (bank) {
  //     res.status(200).send({
  //       success: true,
  //       message: "[SUCCESS] Get bank info",
  //       data: bankRes,
  //     });
  //   } else {
  //     res.status(202).send({
  //       success: false,
  //       message: "[ERROR] Id is not existed",
  //     });
  //   }
  // });
};
module.exports.postBank = (req, res) => {
  // console.log(req.userId);
  let idQuestions = [];

  const { questions } = req.body;
  const { userId } = req;

  let newBank = new Bank({
    title: req.body.title,
    idOwner: userId,
  });

  for (let question of questions) {
    // let count = 0;
    // // console.log(question.answers.answers);
    // for (let answer of question.answers.answers) {
    //   if (answer.isTrue) count++;
    // }

    const count = question.answers.answers.filter((answer) => answer.isTrue)
      .length;

    console.log(count);
    const newQuestion = new Question({
      title: question.title,
      level: question.level,
      answers: question.answers.answers,
      isManyAnswers: count >= 2,
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
  const { userId } = req;

  Bank.findByIdAndDelete({ _id: id, userId: userId }).exec((err, bank) => {
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
  const { userId } = req;
  const { name } = req.body;
  let { page } = req.body;
  page = +(page);

  Bank.find({ idOwner: userId }).exec((err, banks) => {
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
  const { userId } = req;

  let results = Question.aggregate([
    {
      $set: {
        res: {
          $indexOfCP: ["$title", name],
        },
      },
    },
    {
      $match: {
        res: {
          $gt: -1,
        },
      },
    },
    {
      $set: {
        idBank: {
          $toObjectId: "$idBank",
        },
      },
    },
    {
      $lookup: {
        from: "banks",
        localField: "idBank",
        foreignField: "_id",
        as: "bankInfo",
      },
    },
    {
      $set: {
        bankInfo: "$bankInfo.idOwner",
      },
    },
    {
      $match: {
        bankInfo: {
          $eq: userId,
        },
      },
    },
  ]);
  results.exec((err, questions) => {
    res.status(200).send({
      success: true,
      message: "Search questions",
      data: questions,
    });
  });
};
module.exports.getQuestions = (req, res) => {
  const { id } = req.body;
  let { limitItems } = req.body;

  const { userId } = req;

  const objectId = mongoose.Types.ObjectId(id);

  let { page } = req.body;

  page = +page;
  limitItems = +limitItems;

  Bank.aggregate([
    {
      $match: {
        _id: objectId,
        idOwner: userId,
      },
    },
  ]).exec((err, bank) => {
    if (bank) {
      const skip = (page - 1) * limitItems;

      Question.aggregate([
        {
          $match: {
            idBank: id,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limitItems,
        },
      ]).exec((err, questions) => {
        if (questions.length > 0) {
          res.status(200).send({
            success: true,
            message: "Get bank's questions by id",
            data: questions,
          });
        } else
          res.status(202).send({
            success: false,
            message: "Bank's questions is null",
            data: [],
          });
      });
    } else
      res.status(202).send({
        success: false,
        message: "Invalid id",
        data: [],
      });
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

  let newQuestion = new Question(
    ({ title, answers, level, isManyAnswers, idBank } = req.body)
  );
  newQuestion.save();
  console.log(newQuestion);

  Bank.findOne({ _id: req.body.idBank }).exec((err, bank) => {
    bank.idQuestions = [...bank.idQuestions, newQuestion._id];
    bank.save();
  });

  res.status(202).send({
    success: true,
    message: "Question is created",
    data: newQuestion,
  });
};
module.exports.updateQuestion = async (req, res) => {
  const count = req.body.answers.filter((answer) => answer.isTrue).length;
  const { _id } = req.body;
  const { userId } = req;

  if (count >= 2) {
    req.body.isManyAnswers = true;
  } else req.body.isManyAnswers = false;

  Question.findOne({ _id: _id }).exec((err, question) => {
    if (question) {
      if (!req.body.title) {
        Bank.findOne({ _id: question.idBank }).exec((err, bank) => {
          if (bank) {
            if (bank.idOwner === userId) {
              bank.idQuestions = bank.idQuestions.filter(
                (bank) => bank._id != _id
              );

              bank.save();

              Question.deleteOne({ _id: _id }).exec((err, success) => {
                if (success) {
                  res.status(200).send({
                    success: true,
                    message: "[DELETE] Delete question done",
                    data: Object.assign({ title: "" }, req.body),
                  });
                }
              });
            }
          }
          return;
        });
      } else {
        Question.findOneAndUpdate({ _id: _id }, req.body).exec(
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
    } else {
      res.status(202).send({
        success: false,
        message: "Id is invalid",
      });
    }
  });
};
module.exports.updateBank = (req, res) => {
  let { id, title } = req.body;

  let objectId = mongoose.Types.ObjectId(id);

  Bank.updateOne({ _id: id }, { title: title }).exec((err, success) => {
    if (success) {
      Bank.aggregate([
        {
          $match: {
            _id: objectId,
          },
        },
      ]).exec((err, bank) => {
        res.status(200).send({
          success: true,
          message: "Update finish",
          data: bank,
        });
      });
    }
  });
};
