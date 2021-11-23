const express = require("express");
const parser = require("body-parser");
const https = require("https");
const ejs = require("ejs");
const mongoose = require('mongoose');
const _ = require('lodash');
const date = require(__dirname + "/date.js");
const credentials = require(__dirname + "/credentials");

const userName = credentials.userName;
const password = credentials.password;
const app = express();


// Open a connection to the "todoDB" database on our locally running instance of MongoDB.
mongoose.connect('mongodb+srv://' + userName + ':' + password + '@todolistcluster.9eixz.mongodb.net/todoDB', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});


app.use(parser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

// We've got a schema with one property, "todo", which will be a String. The next step is compiling our schema into a Model.
const todoSchema = new mongoose.Schema({todo: String});
const listSchema = new mongoose.Schema({
  name: String,
  items: [todoSchema]
});

// A model is a class with which we construct documents.
const Todo = mongoose.model("Todo", todoSchema);
const List = mongoose.model("List", listSchema);

//  Let's create a todo documents representing thigs we need to do.
const todo1 = new Todo({
  todo: "Welcome to your Todolist!"
});
const todo2 = new Todo({
  todo: "Hit the + button to add a new item."
});
const todo3 = new Todo({
  todo: "<-- Hit this to delete an item."
});
const defaultTodoList = [todo1, todo2, todo3]

const day = date.getDate();


app.get("/", (req, res) => {
  Todo.find({}, (err, foundTodo) => {
    if (err) {
      console.log(err);
    } else if (foundTodo.length === 0) {
      Todo.insertMany(defaultTodoList, (err) => {if(err){console.log(err)}});
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: day,
        item: foundTodo,
      });
    }
  });
});

app.get("/:customList", (req, res) => {
  const customList = _.capitalize(req.params.customList);

  List.findOne({name: customList}, (err, foundList) => {
    if (err) {
      console.log(err);
    } else if (!foundList) {
      const list = new List({
        name: customList,
        items: defaultTodoList
      });
      list.save((err) => {
        if (err) {
          console.log(err);
        }
      });
      res.redirect("/" + customList);
    }else {
      res.render("list", {
        listTitle: customList,
        item: foundList.items
      });
    }
  });
});

app.post("/", (req, res) => {
  const listTitle = req.body.button;
  const itemName = req.body.newItem;
  const item = new Todo({todo: itemName});

  if (listTitle == day) {
    item.save();
    res.redirect("/")
  } else {
    List.findOne({name: listTitle}, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listTitle);
    });
  }
});

app.post("/delete", (req, res) => {
  const itemId = req.body.checkbox;
  const listTitle =  req.body.listTitle;

  if (listTitle == day) {
    Todo.deleteOne({_id: itemId}, (err) => {
      if(err){console.log(err)}
      res.redirect("/")
    });
  } else {
    List.findOneAndUpdate({name:listTitle}, {$pull: {items: {_id: itemId}}}, (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/" + listTitle);
      }
    });
  }


});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, () => {
  console.log("Server is running on port: " + port);
});
