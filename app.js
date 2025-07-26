if(process.env.NODE_ENV != "production"){
   require('dotenv').config();
}


const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsmate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore=require("connect-mongo");
const flash = require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");


const listingRouter=require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter=require("./routes/user.js");

const DBurl=process.env.MONGO_URL;

main().then(()=>{
    console.log("connected to database");
})
.catch(err=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(DBurl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsmate);
app.use(express.static(path.join(__dirname,"/public")));

const store=MongoStore.create({
  mongoUrl: DBurl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 86400
});

store.on("error",()=>{
  console.log("ERROR IN MONGO SESSION",err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET, 
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize()); 
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); //storing the persons login 
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  res.locals.mapToken = process.env.MAP_TOKEN;
  next();
});

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});



app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);



app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});


app.use((err, req, res, next) => {
  console.log("ERROR:", err);
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs",{message});
  //res.status(statusCode).send(message);
});

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});


app.use((err, req, res, next) => {
  console.log("ERROR:", err);
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs",{message});
  //res.status(statusCode).send(message);
});


app.listen(8080,()=>{
    console.log("working");
});
