var express 	= require("express");
var router 		= express.Router({mergeParams: true});
var Item 		= require("../models/item");
var Review 		= require("../models/review");
var middleware 	= require("../middleware");


//===================
//REVIEW ROUTE
//===================

//INDEX - review index route
router.get("/", function(req, res){
	Item.findById(req.params.id).populate({
		path: "reviews",
		options: {sort: {createdAt: -1}} // sorting the populated reviews array to show the latest first
	}).exec(function(err, item){
		if(err || !item){
			req.flash("error", err.message);
			return res.redirect("back");
		}
		res.render("reviews/index", {item: item});
	});
});

//NEW - show form to create review
router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, function(req, res){
	// middleware.checkReviewExistence checks if a user already reviewed the item, only one review per user is allowed
	Item.findById(req.params.id, function(err, item){
		if(err) {
			req.flash("error", err.message);
			return res.redirect("back");
		}
		res.render("reviews/new", {item: item});
	});
})

//CREATE - add new review to DB
router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, function(req, res){
	// lookup item using ID
	Item.findById(req.params.id).populate("reviews").exec(function(err, item){
		if(err) {
			req.flash("error", err.message);
			return res.redirect("back");
		}
		Review.create(req.body.review, function(err, review){
			if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            //add author username/id and associated item to the review
            review.author.id = req.user._id;
            review.author.username = req.user.username;
            review.item = item;
            //save review
            review.save();
            item.reviews.push(review);
            // calculate the new average review for the item
            item.rating = calculateAverage(item.reviews);
            //save item
            item.save();
            req.flash("success", "Your have successfully added your review");
            res.redirect('/items/' + item._id);
		});
	});
});

//EDIT - edit review route
router.get("/:review_id/edit", middleware.checkReviewOwnership, function(req, res){
	Review.findById(req.params.review_id, function(err, foundReview){
		if(err) {
			req.flash("error", err.message);
            return res.redirect("back");
		} 
		res.render("reviews/edit", {item_id: req.params.id, review: foundReview});
	});
});

//UPDATE - update review route
router.put("/:review_id", middleware.checkReviewOwnership, function(req, res){
	Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true}, function(err, updatedReview){
		if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Item.findById(req.params.id).populate("reviews").exec(function (err, item) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate item average
            item.rating = calculateAverage(item.reviews);
            //save changes
            item.save();
            req.flash("success", "Your review was successfully edited.");
            res.redirect('/items/' + item._id);
        });
	});
});

//DELETE - delete review router
router.delete("/:review_id", middleware.checkReviewOwnership, function(req, res){
	Review.findByIdAndRemove(req.params.review_id, function(err){
		if(err) {
			req.flash("error", err.message);
			return res.redirect("back");
		}
		Item.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec(function (err, item) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate campground average
            item.rating = calculateAverage(item.reviews);
            //save changes
            item.save();
            req.flash("success", "You have successfully deleted your review");
            res.redirect("/items/" + req.params.id);
        });
	});
});

function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}

module.exports = router;