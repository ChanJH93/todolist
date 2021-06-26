//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//setting up database using Mongoose
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb+srv://admin-JHChan:Chan8750!@cluster0.y2t5a.mongodb.net/todolistDB");

const itemSchema = {
  name: String
}

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your To Do List"
})

const item2 = new Item({
  name: "Hit the + button to add item"
})

const item3 = new Item({
  name: "<---- Hit this to delete item"
})

const defaultItem = [item1, item2, item3];

const listSchema ={
  name:String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItem) {

    if (foundItem.length === 0) {
      Item.insertMany(defaultItem, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully updated")
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItem
      });
    }

  });
})


app.get("/:customListName", function(req,res){
  const customList = _.capitalize(req.params.customListName);

  List.findOne({name:customList}, function(err, foundList){
    if (!err){
      if (!foundList){
        // create new list
        const list = new List({
          name: customList,
          items: defaultItem
        })

        list.save();
        res.redirect("/"+customList);
      } else {
        // show existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }

  });

})


app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

  if (listName === "Today"){

      item.save();
      res.redirect("/");
  } else {
    List.findOne({name:listName}, function(err, foundName){
      foundName.items.push(item);
      foundName.save();
      res.redirect("/"+ listName);
    })
  }

});

app.post("/delete", function(req,res){
  const checkedItemID = req.body.checkBox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemID, function(err){
      if (!err){
        console.log("successfully deleted the item");
      }
    })
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name:listName}, {$pull: {items:{_id:checkedItemID}}}, function(err, foundList){
      if (!err){
        res.redirect("/"+listName);
      }
    });
  }


})


app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started");
});
