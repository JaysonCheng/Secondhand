var express 	= require("express");
var app 		= express();
var bodyParser 	= require("body-parser");
var mongoose 	= require("mongoose");
var flash 		= require("connect-flash");
var passport 	= require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");

var Item = require("./models/item");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds");

// requiring routes
var itemRoutes = require("./routes/items")
var commentRoutes = require("./routes/comments");
var authRoutes = require("./routes/index");


mongoose.connect("mongodb://localhost:27017/secondhand", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB();

// PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "Once again what happened",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// pass in current user to every route
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	res.locals.warning = req.flash("warning");
	next();
});

app.use(authRoutes);
app.use("/items", itemRoutes);
app.use("/items/:id/comments", commentRoutes);


app.listen(process.env.PORT || 5000, process.env.IP, function(){
    console.log("SECONDHAND IS RUNNING!");
});