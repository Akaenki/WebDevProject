var express = require("express"),
    User = require("../models/user"),
    passport = require("passport"),
    router = express.Router();

router.get("/", function(req, res){
    res.render("landing.ejs");
})

// AUTH ROUTES
router.get("/register", function(req, res){
    res.render("register.ejs",{page: 'register'});
})

router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp "+user.username);
            res.redirect("/campgrounds");
        })
    })
})

router.get("/login", function(req, res) {
    res.render("login.ejs", {page: "login"});
})

router.post("/login", passport.authenticate("local", {
    successRedirect:"/campgrounds",
    failureRedirect:"/login"
    }), function(req, res){
});

router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged You Out.");
    res.redirect("/campgrounds");
})

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Login First");
    res.redirect("/login");
}

module.exports = router;