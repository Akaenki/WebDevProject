var express = require("express"),
    Campground = require("../models/campground"),
    Comment = require("../models/comment"),
    router = express.Router({mergeParams: true});
    
router.get("/new", isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else{
            res.render("comments/new.ejs", {campground: campground});
        }
    })
})

router.post("/", isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            req.flash("error", err);
            res.redirect("/campgrounds");
        } else{
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                } else{
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Successfully add the comment");
                    res.redirect("/campgrounds/"+campground._id);
                }
            });
        }
    });
});

router.get("/:cid/edit", checkOwnership, function(req, res){
    Comment.findById(req.params.cid, function(err, comment){
        if(err){
            console.log(err);
        } else{
            res.render("./comments/edit.ejs", {sid: req.params.id, comment: comment});
        }
    });
})

router.put("/:cid", checkOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.cid, req.body.comment, function(err, comment){
        if(err){
            req.flash("error", err);
            res.redirect("back");
        } else{
            res.redirect("/campgrounds/"+req.params.id);
        }
    })
})

router.delete("/:cid", checkOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.cid, function(err){
        if(err){
            req.flash("error", err);
            res.redirect("back");
        } else{
            req.flash("success", "Comment Deleted.");
            res.redirect("/campgrounds/"+req.params.id);
        }
    })
})

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Login First");
    res.redirect("/login");
}

function checkOwnership(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.cid, function(err, comment){
            if(err){
                req.flash("error", err)
                console.log(err);
                return res.redirect("back");
            }
            if(comment.author.id.equals(req.user._id)||req.user.isAdmin){
                return next();
            }
            req.flash("error", "You do not have permission to do that.")
            res.redirect("back");
        });
    } else{
        req.flash("error", "You need to be logged in to do that.");
        res.redirect("back");
    }
}

module.exports = router;