var express = require("express");
var app = express();





app.set("view engine", "ejs");

// ROOT ROUTE
// LANDING PAGE
app.get("/", function(req, res){
	res.render("landing");
});


// ITEMS ROUTE
app.get("/items", function(req, res){
	res.render("items");
});


app.listen(process.env.PORT || 5000, process.env.IP, function(){
    console.log("SECONDHAND IS RUNNING!");
});