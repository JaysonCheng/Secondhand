var express = require("express");
var router  = express.Router();
var Item = require("../models/item");
var middleware = require("../middleware");
var Review = require("../models/review");


//===================
//ITEMS ROUTE
//===================

//INDEX - show all items
router.get("/", function(req, res){
	var perPage = 8;
	var pageQuery = parseInt(req.query.page);
	var pageNumber = pageQuery ? pageQuery : 1;
	var noMatch = null;
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		// Get fuzzy search campgrounds from DB
		Item.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allItems){
			Item.countDocuments({name: regex}).exec(function(err, count){
			if(err){
			   console.log(err);
			   req.flash("error", "The item does not exist");
			   res.redirect("back");
		   } else {
			   if(allItems.length < 1){
				   noMatch = "No results found";
			   }
			   res.render("items/index", {
				   items: allItems, 
				   noMatch: noMatch,
				   page: 'items',
			   	   pages: Math.ceil(count / perPage),
			  	   current: pageNumber,
			       search: req.query.search});
		   }
			});
    	});
	} else {
		// Get all items from DB
		Item.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allItems){
			Item.countDocuments().exec(function(err, count){
				if(err){
				   console.log(err);
				   req.flash("error", "Something went wrong");
				} else {
				  res.render("items/index", {
					  items: allItems, 
					  noMatch: noMatch, 
					  page: 'items',
					  pages: Math.ceil(count / perPage), 
					  current: pageNumber, 
					  search: false});
		   		}
			});
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
    Item.findById(req.params.id).populate("comments likes").populate({
		path: "reviews",
		options: {sort: {createdAt: -1}}
	}).exec(function(err, foundItem){
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
   Item.findById(req.params.id, function (err, item) {
        if (err) {
			req.flash("error", "Something went wrong");
            res.redirect("/items");
        } else {
            // deletes all comments associated with the item
            Comment.remove({"_id": {$in: item.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/items");
                }
                // deletes all reviews associated with the item
                Review.remove({"_id": {$in: item.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/items");
                    }
                    //  delete the item
                    item.remove();
                    req.flash("success", "You have successfully deleted your item");
                    res.redirect("/items");
                });
            });
        }
    });
});

// ITEM LIKE ROUTE
router.post("/:id/like", middleware.isLoggedIn, function (req, res) {
    Item.findById(req.params.id, function (err, foundItem) {
        if (err) {
            console.log(err);
            return res.redirect("/items");
        }

        // check if req.user._id exists in foundItem.likes
        var foundUserLike = foundItem.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundItem.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundItem.likes.push(req.user);
        }

        foundItem.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/items");
            }
            return res.redirect("/items/" + foundItem._id);
        });
    });
});

function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;