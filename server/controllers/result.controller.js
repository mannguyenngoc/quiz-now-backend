const Result = require("../models/Result.model");
const Test = require("../models/Test.model");
const Bank = require("../models/Bank.model");
const User = require("../models/User.model");

const mongoose = require("mongoose");

const changeTimestamp = require("../../functions/changeTimestamp");

module.exports.getPage = (req, res) => {
  const { userId } = req;

  Result.find({ idUser: userId }).exec((err, results) => {
    res.status(202).send({
      success: true,
      message: "[PAGES] Get pages result",
      data: Math.ceil(results.length / 10),
      number: results.length,
    });
  });
};
module.exports.getResultsByIdUser = (req, res) => {
  const { userId } = req;
  let { page } = req.params;
  let numberOfResults = 0;

  page = parseInt(page);

  Result.aggregate([
    {
      $match: {
        idUser: userId,
      },
    },
    {
      $count: "total",
    },
  ]).exec((err, results) => {
    if (results.length > 0) numberOfResults = results[0].total;
  });

  Result.aggregate([
    {
      $match: {
        idUser: userId,
      },
    },
    {
      $sort: {
        time: -1,
      },
    },
    {
      $project: {
        time: {
          $toDate: "$time",
        },
        score: {
          $round: [{ $multiply: ["$score", 10] }, 2],
        },
        idTest: {
          $toObjectId: "$idTest",
        },
        userAnswers: 1,
      },
    },
    {
      $set: {
        time: {
          $dateToString: {
            format: "%Y/%m/%d - %H:%M:%S",
            date: "$time",
          },
        },
      },
    },
    {
      $lookup: {
        from: "tests",
        localField: "idTest",
        foreignField: "_id",
        as: "test",
      },
    },
    {
      $set: {
        test: "$test.title",
      },
    },
  ]).exec((err, results) => {
    results = results.slice((page - 1) * 10, page * 10);
    if (results) {
      res.status(200).send({
        success: true,
        message: "[SUCCESSFUL] Get user's results by page",
        data: results,
        numberOfResults: numberOfResults,
      });
    }
  });
  // Result.find({ idUser: userId }).exec((err, results) => {
  //   if (res) {
  //     const numberOfResults = results.length;

  //     results = results.slice((page - 1) * 5, page * 5);
  //     res.status(200).send({
  //       success: true,
  //       message: "[SUCCESSFUL] GET user results finish",
  //       data: results,
  //       number: numberOfResults,
  //     });
  //   }
  // });
};
module.exports.getResultsAndAnalyze = (req, res) => {
  const idUser = req.userId;

  Result.aggregate([
    {
      $match: {
        idUser: idUser,
      },
    },
    {
      $project: {
        score: 1,
      },
    },
    {
      $sort: {
        score: 1,
      },
    },
    {
      $group: {
        _id: "score",
        ave: { $avg: "$score" },
        min: { $min: "$score" },
        max: { $max: "$score" },
        scores: { $push: { score: "$score" } },
      },
    },
  ]).exec((err, result) => {
    if (result) {
      console.log(result);
      res.status(200).send({
        success: true,
        message: "Calculate average score",
        data: {
          aveScore: result.length > 0 ? result[0].ave : 0,
          minScore: result.length > 0 ? result[0].min : 0,
          maxScore: result.length > 0 ? result[0].max : 0,
          scores: result.length > 0 ? result[0].scores : 0,
        },
      });
    }
  });
};
module.exports.analyzeWithScore = (req, res) => {
  let { id, time } = req.params;
  time = +time;

  let timestamp = new Date();

  timestamp = Date.parse(timestamp) - time * 3600 * 1000 * 24;
  Result.aggregate([
    {
      $match: {
        idTest: id,
        time: {
          $gte: timestamp,
        },
      },
    },
    {
      $project: {
        score: 1,
        time: 1,
      },
    },
    {
      $group: {
        _id: "$score",
        count: {
          $sum: 1,
        },
      },
    },
    {
      $set: {
        _id: {
          $multiply: ["$_id", 10],
        },
      },
    },
    {
      $set: {
        _id: {
          $round: ["$_id", 2],
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]).exec((err, results) => {
    console.log(results.length);
    res.status(200).send({
      success: true,
      message: "[SUCCESS] Analyze results with score",
      data: results,
    });
  });
};
module.exports.analyzeScoreWithPieChart = (req, res) => {
  let { id, time } = req.params;
  time = +time;

  let timestamp = new Date();
  timestamp = Date.parse(timestamp) - 3600 * 1000 * 24 * time;

  Result.aggregate([
    {
      $match: {
        idTest: id,
        time: {
          $gte: timestamp,
        },
      },
    },
    {
      $project: {
        kind: {
          $cond: {
            if: {
              $gte: ["$score", 0.9],
            },
            then: 3,
            else: {
              $cond: {
                if: {
                  $gt: ["$score", 0.65],
                },
                then: 2,
                else: {
                  $cond: {
                    if: {
                      $gte: ["$score", 0.5],
                    },
                    then: 1,
                    else: 0,
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: "$kind",
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]).exec((err, results) => {
    console.log(results);
    res.status(200).send({
      success: true,
      message: "[SUCCESS] Analyze score with pie chart",
      data: results,
    });
  });
};
module.exports.analyzeTimeWithLineChart = (req, res) => {
  let { id, time } = req.params;

  time = +time;

  let timestamp = new Date();
  timestamp = Date.parse(timestamp) - time * 3600 * 1000 * 24;

  Result.aggregate([
    {
      $match: {
        idTest: id,
        time: {
          $gte: timestamp,
        },
      },
    },
    {
      $project: {
        time: 1,
      },
    },
    {
      $sort: {
        time: 1,
      },
    },
  ]).exec((err, results) => {
    res.status(200).send({
      success: true,
      message: "[SUCCESS] Analyze time with line chart",
      data: results,
    });
  });
};
module.exports.analyzeWithBankId = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  let listTests = [];
  let title = "";

  Bank.findOne({ _id: id }).exec((err, bank) => {
    title = bank.title;
  });

  let testAggregate = await Test.aggregate([
    {
      $match: {
        source: id,
      },
    },
    {
      $project: {
        _id: {
          $toString: "$_id",
        },
        title: 1,
      },
    },
    {
      $lookup: {
        from: "results",
        localField: "_id",
        foreignField: "idTest",
        as: "listResults",
      },
    },
    {
      $project: {
        // score: "$listResults.score",
        total: {
          $cond: {
            if: { $isArray: "$listResults.score" },
            then: { $size: "$listResults.score" },
            else: "N/A",
          },
        },
        score: {
          $reduce: {
            input: "$listResults.score",
            initialValue: 0,
            in: {
              $sum: ["$$value", "$$this"],
            },
          },
        },
        title: 1,
      },
    },
  ]);
  console.log(testAggregate.map((test) => test.score));
  await res.status(200).send({
    success: true,
    message: "[DONE] Get data to analyze",
    data: Object.assign(
      { title: title },
      { id: id },
      { results: testAggregate }
    ),
  });
};
module.exports.getResultsByIdTest = (req, res) => {
  let { id, page, limitItem } = req.params;
  page = +page;
  limitItem = +limitItem;

  console.log(id, page, limitItem);
  Result.aggregate([
    {
      $match: {
        idTest: id,
      },
    },
    {
      $project: {
        score: 1,
        time: {
          $toDate: "$time",
        },
        idUser: {
          $toObjectId: "$idUser",
        },
        userAnswers: 1,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "idUser",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $project: {
        score: {
          $round: ["$score", 2],
        },
        day: {
          $dayOfMonth: "$time",
        },
        hour: {
          $hour: "$time",
        },
        minutes: {
          $minute: "$time",
        },
        month: {
          $month: "$time",
        },
        year: {
          $year: "$time",
        },
        name: "$user.name",
        idUser: 1,
        userAnswers: 1,
      },
    },
    {
      $sort: {
        score: -1,
      },
    },
  ]).exec((err, results) => {
    const pages = Math.ceil(results.length / limitItem)

    results = results.slice((page - 1) * limitItem, limitItem * page)
    res.status(200).send({
      success: true,
      message: "[SUCCESS] Get results from id tests",
      data: results.map((result) => {
        return {
          ...result,
          name: result.name[0],
        };
      }),
      pages: pages,
    });
  });
};
module.exports.getResultsByIdTestAndIdUser = (req, res) => {
  const { idTest, idUser } = req.params;

  Result.aggregate([
    {
      $match: {
        idUser: idUser,
        idTest: idTest,
      },
    },
    {
      $project: {
        userAnswers: 1,
        score: 1,
        time: 1,
        idUser: {
          $toObjectId: "$idUser",
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "idUser",
        foreignField: "_id",
        as: "userName",
      },
    },
    {
      $set: {
        name: "$userName.name",
      },
    },
    {
      $unset: ["idUser", "userName"],
    },
  ]).exec((err, results) => {
    console.log(results);
    res.status(200).send({
      success: true,
      message: "[SUCCESS] Get result by id test and id user",
      data: results,
    });
  });
};
module.exports.getResultsByIdTestAndTime = (req, res) => {
  let { id } = req.body;
  let time = +req.body.time;
  let totalResults = 0;

  let objectId = mongoose.Types.ObjectId(id);

  let timestamp = new Date();
  if (time != 0) timestamp = Date.parse(timestamp) - 3600 * 1000 * 24 * time;
  else timestamp = 3600 * 1000 * 24;

  const { userId } = req;

  Result.aggregate([
    {
      $match: {
        idTest: id,
      },
    },
    {
      $count: "totalResults",
    },
  ]).exec((err, results) => {
    if (results[0]) totalResults = results[0].totalResults;
  });

  Result.aggregate([
    {
      $match: {
        idTest: id,
        time: {
          $gte: timestamp,
        },
      },
    },
    {
      $project: {
        score: 1,
        time: 1,
        idUser: {
          $toObjectId: "$idUser",
        },
        userAnswers: 1,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "idUser",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $set: {
        user: "$user.name",
      },
    },
    {
      $sort: {
        score: -1,
      },
    },
  ]).exec((err, results) => {
    console.log(results);
    if (results.length > 0) {
      res.status(200).send({
        success: true,
        message: "Get results by id",
        data: results,
        totalResults: totalResults,
      });
    } else
      res.status(200).send({
        success: true,
        message: "No results found",
        data: [],
        totalResults: totalResults,
      });
  });
};
module.exports.getResultByIdResult = (req, res) => {
  const { id } = req.params;

  Result.findOne({ _id: id }).exec((err, result) => {
    if (result) {
      result.score = result.score * 10;
      res.status(200).send({
        success: true,
        message: "[SUCCESS] Get result by id result",
        data: result,
      });
    } else
      res.status(202).send({
        success: false,
        message: "[FAIL] Get result by id result",
        data: null,
      });
  });
};
module.exports.getUserName = (req, res) => {
  const { id } = req.params;

  User.findOne({ _id: id }).exec((err, user) => {
    if (user) {
      res.status(200).send({ name: user.name });
    } else res.status(202).send("");
  });
};
