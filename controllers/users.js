const User=require("../models/user.js");

module.exports.renderSignupForm=(req,res)=>{
    res.render("users/signup.ejs");
};

module.exports.signup=async(req,res)=>{
    try{
    let {username,email,password}=req.body;
    const newUser=new User({email,username});
    const registeredUser=await User.register(newUser,password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err);
        }
    req.flash("success","user is registered");
    res.redirect("/listings");
    });
    }catch(e){
        if (e.name === "UserExistsError") {
        req.flash("error", "Username already taken");
    } else {
        req.flash("error", e.message);
    }
    res.redirect("/signup");
    }
 };

module.exports.renderLoginForm=(req,res)=>{
    res.render("users/login.ejs");
};

module.exports.login=async(req,res)=>{
        req.flash("success","Welcome to Wanderlust! You are loggin in!");
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
};

module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","you have logged out successfully!");
        res.redirect("/listings");
    })
};