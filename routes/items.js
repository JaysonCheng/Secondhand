var express = require("express");
var router = express.Router();
var Item = require("../models/item");


// =====================
// ITEMS ROUTE
// =====================

// INDEX - display items
router.get("/", function(req, res){
	// Get all items from database
	Item.find({}, function(err, allItems){
		if(err) {
			console.log(err);
		} else {
			res.render("items/index", {items: allItems});
		}
	});
});

// CREATE - add item to database
router.post("/", isLoggedIn, function(req, res){
	// get data from form and add to items array
	var name =req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var price = req.body.price;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	var newItem = {name: name, image: image, description: desc, price : price, author: author};
	// Create new item and save to Database
	Item.create(newItem, function(err, newlyCreated){
		if(err) {
			console.log(err);
		} else {
			// redirect back to items page
			res.redirect("/items");
		}
	});
});

// NEW - display form to create new item
router.get("/new", isLoggedIn, function(req, res){
	res.render("items/new");
})

// SHOW - display info about a certain item
router.get("/:id", function(req, res){
	Item.findById(req.params.id).populate("comments").exec(function(err, foundItem){
		if(err) {
			console.log(err);
		} else {
			// render shows template with that item
			res.render("items/show", {item: foundItem});
		}
	});
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} 
	res.redirect("/login");
}

module.exports = router;