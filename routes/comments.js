var express = require("express");
var router  = express.Router({mergeParams: true});
var Item = require("../models/item");
var Comment = require("../models/comment");
var middleware = require("../middleware");


//===================
//COMMENT ROUTE
//===================

//NEW - show form to create new comment
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find item by id
    console.log(req.params.id);
    Item.findById(req.params.id, function(err, item){
        if(err){
            console.log(err);
			req.flash("error", "Something went wrong");
        } else {
             res.render("comments/new", {item: item});
        }
    })
});

//CREATE - add new comment to DB
router.post("/", middleware.isLoggedIn,function(req, res){
   // lookup item using ID
   Item.findById(req.params.id, function(err, item){
       if(err){
           console.log(err);
		   req.flash("error", "Something went wrong");
           res.redirect("/items");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               req.flash("error", "Something went wrong");
               console.log(err);
           } else {
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               item.comments.push(comment);
               item.save();
               console.log(comment);
               req.flash("success", "You have successfully added your comment");
               res.redirect('/items/' + item._id);
           }
        });
       }
   });
});

//EDIT - edit comment route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
   Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err || !foundComment){
          res.redirect("back");
		  req.flash("error", "Something went wrong");
      } else {
        res.render("comments/edit", {item_id: req.params.id, comment: foundComment});
      }
   });
});

//UPDATE - update comment route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err){
          res.redirect("back");
		  req.flash("error", "Something went wrong");
      } else {
		  req.flash("success", "You have successfully updated your comment")
          res.redirect("/items/" + req.params.id );
      }
   });
});

//DESTROY - delete comment route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
		   req.flash("error", "Something went wrong");
       } else {
           req.flash("success", "You have successfully deleted your comment");
           res.redirect("/items/" + req.params.id);
       }
    });
});

module.exports = router;