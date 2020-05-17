var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Item = require("../models/item");


//===================
//LANDING PAGE
//===================

//root route
router.get("/", function(req, res){
    res.render("landing");
});

//===================
//AUTHENTICATION ROUTE
//===================

// show register form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});

// handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User(
		{
			username: req.body.username, 
			firstName:req.body.firstName, 
			lastName: req.body.lastName, 
			email: req.body.email,
			avatar: req.body.avatar
		});
	if(req.body.adminCode === "adminpassword123"){
		newUser.isAdmin = true;
	}
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "Welcome to Secondhand, " + user.username + "!");
           res.redirect("/items"); 
        });
    });
});

// show login form
router.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});

// handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/items",
        failureRedirect: "/login"
    }), function(req, res){
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "You have successfully logged out");
   res.redirect("/items");
});

// User profile
router.get("/users/:id", function(req, res){
	User.findById(req.params.id, function(err, foundUser){
		if(err){
			req.flash("error", "Something went wrong");
			return res.redirect("/");
		}
		Item.find().where('author.id').equals(foundUser._id).exec(function(err, items){
		if(err){
			req.flash("error", "Something went wrong");
			return res.redirect("/");
		}
		res.render("users/show", {user: foundUser, items: items});
		});
	});
});

module.exports = router;