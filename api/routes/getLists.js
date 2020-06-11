var express = require("express");
var router = express.Router();

const { MongoClient } = require("mongodb");

/* MongoDB init */
const dbUser = "dbUser";
const dbPass = "P9HP4wGPK083cIec";
const uri =
  "mongodb+srv://" +
  dbUser +
  ":" +
  dbPass +
  "@cluster0-ajgge.azure.mongodb.net/<dbname>?retryWrites=true&w=majority";

router.post("/", (req, res, next) => {
  const username = req.body.username;

  try {
    MongoClient.connect(uri, { useUnifiedTopology: true }, (err, db) => {
      if (err) throw err;
      var dbo = db.db("Todolist");
      dbo
        .collection("Users")
        .find({ username: username })
        .toArray((err, result) => {
          if (err) throw err;
          if (result.length) {
            var lists = result[0].lists;
            for (let i = 0; i < lists.length; i++)
              lists[i].items.sort(sortListItems);
            res.send(JSON.stringify(lists));
          } else {
            res.send("Username not found.");
          }
          db.close();
        });
    });
  } catch (e) {
    console.error(e);
  }
});

function sortListItems(a, b) {
  if (a.completed && !b.completed) return 1;
  else if (!a.completed && b.completed) return -1;
  else {
    // both are either completed or incomplete
    if (a.dueDate === b.dueDate) {
      // sort items due on the same day by priority
      const priorities = ["low", "medium", "high"];
      const priorityA = priorities.indexOf(a.priority);
      const priorityB = priorities.indexOf(b.priority);
      return priorityB - priorityA;
    } else {
      // sort items based on date
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dateA - dateB;
    }
  }
}

module.exports = router;
