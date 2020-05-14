var express = require("express");
var router  = express.Router();
var Item = require("../models/item");
var middleware = require("../middleware");


//===================
//ITEMS ROUTE
//===================

//INDEX - show all items
router.get("/", function(req, res){
	var noMatch = null;
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		// Get fuzzy search campgrounds from DB
		Item.find({name: regex}, function(err, allItems){
		   if(err){
			   console.log(err);
			   req.flash("error", "The item does not exist")
		   } else {
			   if(allItems.length < 1){
				   noMatch = "No results found";
			   }
			   res.render("items/index", {items: allItems, noMatch: noMatch});
		   }
    	});
	} else {
		// Get all items from DB
		Item.find({}, function(err, allItems){
		   if(err){
			   console.log(err);
			   req.flash("error", "Something went wrong");
		   } else {
			  res.render("items/index", {items: allItems, noMatch: noMatch});
		   }
		});
	}
});

//CREATE - add new item to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to items array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
	var price = req.body.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newItem = {name: name, image: image, description: desc, author: author, price: price}
    // Create a new item and save to DB
    Item.create(newItem, function(err, newlyCreated){
        if(err){
            console.log(err);
			req.flash("error", "Something went wrong");
        } else {
            //redirect back to items page
            console.log(newlyCreated);
			req.flash("success", "You have successfully added your item");
            res.redirect("/items");
        }
    });
});

//NEW - show form to create new item
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("items/new"); 
});

// SHOW - shows more info about one item
router.get("/:id", function(req, res){
    //find the item with provided ID
    Item.findById(req.params.id).populate("comments").exec(function(err, foundItem){
        if(err || !foundItem){
            console.log(err);
			req.flash("error", "Something went wrong");
        } else {
            console.log(foundItem);
            //render show template with that item
            res.render("items/show", {item: foundItem});
        }
    });
});

// EDIT - edit item route
router.get("/:id/edit", middleware.checkItemOwnership, function(req, res){
    Item.findById(req.params.id, function(err, foundItem){
		if(err) {
			req.flash("error", "Something went wrong");
		} else {
			res.render("items/edit", {item: foundItem});
		} 
    });
});

// UPDATE - update item route
router.put("/:id", middleware.checkItemOwnership, function(req, res){
    // find and update the correct campground
    Item.findByIdAndUpdate(req.params.id, req.body.item, function(err, updatedItem){
       if(err){
		   req.flash("error", "Something went wrong");
           res.redirect("/items");
       } else {
           //redirect somewhere(show page)
		   req.flash("success", "You have successfully updated your item");
           res.redirect("/items/" + req.params.id);
       }
    });
});

// DESTROY - delete item route
router.delete("/:id", middleware.checkItemOwnership, function(req, res){
   Item.findByIdAndRemove(req.params.id, function(err){
      if(err){
		  req.flash("error", "Something went wrong");
          res.redirect("/items");
      } else {
		  req.flash("success", "You have successfully deleted your item");
          res.redirect("/items");
      }
   });
});

function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;