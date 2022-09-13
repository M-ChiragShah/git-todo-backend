const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const app = express();
const _ = require("lodash");
app.use(bodyparser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://chiragshah:7y3it8Qnf2wT2YpX@cluster0.xlcy7h2.mongodb.net/todolistDB",
  { useNewUrlParser: true }
);

const taskSchema = {
  taskname: String,
};

const listSchema = {
  name: String,
  list: [taskSchema],
};

const Task = mongoose.model("Task", taskSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Task({
  taskname: "Welcome to your todo-list",
});

const item2 = new Task({
  taskname: "Hit + to add a new item",
});
const item3 = new Task({
  taskname: "<-- Hit this to delete an item ",
});

const dbItems = [item1, item2, item3];

let items = [];
let worklist = [];

app.get("/", function (req, res) {
  let date = new Date();
  const options = {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  let day = "Today";

  Task.find(function (err, results) {
    if (results.length === 0) {
      Task.insertMany(dbItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Items saved successfully");
        }
      });
    } else {
      //console.log(results)
    }
    res.render("list", { kindofday: day, listitem: results });
  });
});

app.post("/", function (req, res) {
  const newitem = req.body.todoinp;
  const listname = req.body.list;
  // items.push(newitem)
  // console.log(req.body)

  const task = new Task({
    taskname: newitem,
  });

  if (listname === "Today") {
    task.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listname }, function (err, foundlist) {
      console.log("list found");
      foundlist.list.push(task);
      foundlist.save();
      res.redirect("/" + listname);
    });
  }

  // if (req.body.list === "Work List") {
  //   worklist.push(newitem);
  //   res.redirect("/work");
  // } else {
  //   res.redirect("/");
  //   items.push(newitem);
  // }
});

app.post("/delete", function (req, res) {
  let itemid = req.body.checkbox;
  let listname = req.body.listname;

  if (listname === "Today") {
    Task.deleteOne({ _id: itemid }, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Deleted item Successfully");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listname },
      { $pull: { list: { _id: itemid } } },
      function (err) {
        if (!err) {
          res.redirect("/" + listname);
        }
      }
    );
  }
});
// app.post("/",function(req,res){

//     var inpday = req.body.dayname
//     var day = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
//     var whatday = ""
//     if (inpday==day[0]||inpday==day[6]) {
//         whatday="WEEKEND"
//     }
//     else{
//         whatday="WEEKDAY"
//     }

//     res.render("list",{kindofday:whatday})
// })

app.get("/:customlistname", function (req, res) {
  let customlistname = _.capitalize(req.params.customlistname);
  //console.log(req.params);
  if (customlistname === "Favicon.ico") {
    customlistname = null;
  }
  console.log(customlistname);
  List.findOne({ name: customlistname }, function (err, founditem) {
    if (!err) {
      if (!founditem) {
        console.log("doesnt exist");
        const list = new List({
          name: customlistname,
          list: dbItems,
        });
        list.save();
        res.redirect("/" + customlistname);
      } else {
        res.render("list", {
          kindofday: customlistname,
          listitem: founditem.list,
        });
        console.log("exist");
      }
    }
  });
});

//

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started at 3000");
});
