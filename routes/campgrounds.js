var express = require("express"),
    Campground = require("../models/campground"),
    router = express.Router();
    
router.get("/", function(req, res){
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            require("error", err.message);
            res.redirect("back");
        } else{
            res.render("campgrounds/index.ejs", {campgrounds: allCampgrounds, page:'campgrounds'})
        }
    })
})

router.post("/", isLoggedIn, function(req, res){
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newcg = {
        name: req.body.name,
        image: req.body.image,
        price: req.body.price,
        description: req.body.description,
        author: author
    }
    Campground.create(newcg, function(err, cg){
        if(err){
            require("error", err.message);
            res.redirect("back");
        } else{
            res.redirect("/campgrounds");
        }
    })
})

router.get("/new", isLoggedIn, function(req, res){
    res.render("campgrounds/new.ejs")
})

router.get("/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, campground){
        if(err){
            require("error", err.message);
            res.redirect("back");
        } else{
            res.render("campgrounds/show.ejs",{campground: campground});
        }
    });
});

router.get("/:id/edit", checkOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            require("error", err.message);
            res.redirect("back");
        } else{
            res.render("./campgrounds/edit.ejs", {campground: campground});
        }
    })
})

router.put("/:id", checkOwnership, function(req, res){
    Campground.findByIdAndUpdate(req.params.id, req.body.data, function(err, campground){
        if(err){
            console.log(err);
            return res.redirect("/campgrounds");
        }
        res.redirect("/campgrounds/"+req.params.id);
    })
})

router.delete("/:id", checkOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash("error", error.message);
            return res.redirect("/campgrounds");
        }
        res.redirect("/campgrounds");
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
        Campground.findById(req.params.id, function(err, campground){
            if(err){
                req.flash("error", err.message)
                console.log(err);
                return res.redirect("back");
            }
            if(campground.author.id.equals(req.user._id) || req.user.isAdmin){
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