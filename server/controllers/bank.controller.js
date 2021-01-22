const Bank = require("../models/Bank.model");
const Question = require("../models/Question.model");

module.exports.getBank = (req, res) => {
  const userId = req.userId;

  Bank.find({ owner: userId }).exec((err, bank) => {
    console.log(bank);

    if (bank) {
      res.status(200).send({
        success: true,
        message: "[SUCCESS] User has banks",
        data: bank,
      })
    } else {
        res.status(202).send({
            success: true,
            message: "[SUCCESS] User hasn't bank",
            data: []
        })
    }
  });
};
module.exports.getOneBank = (req, res) => {
    const {id} = req.params;

    Bank.findOne({_id: id}).exec((err, bank) => {
        if (bank) {
            res.status(200).send({
                success: true,
                message: "[SUCCESS] Get bank info",
                data: bank
            })
        } else {
            res.status(202).send({
                success: false,
                message: "[ERROR] Id is not existed"
            })
        }
     })
}
module.exports.postBank = (req, res) => {
  // console.log(req.userId);
  let idQuestions = [];

  const { questions } = req.body;

  let newBank = new Bank({
    title: req.body.title,
    owner: req.userId,
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
      bank: newBank._id,
    });

    // console.log(newQuestion);
    newQuestion.save();

    idQuestions.push(newQuestion._id);
  }

  newBank.questions = idQuestions;

  newBank.save();
  // console.log(newBank);

  res.status(201).send({
    success: true,
    message: "Bank is created",
  });
};
