if(process.env.NODE_ENV != "production"){
require("dotenv").config();
}



const express=require("express");
const app=express();
const path =require("path");
const methodoverride=require("method-override");
const mongoose=require("mongoose");
const ejsMate=require("ejs-mate");
const expressError=require("./utils/expressError.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const dbUrl=process.env.ATLASDB_URL;

const listingRoute=require("./routes/listing.js");
const  reviewRoute=require("./routes/review.js");
const userRoute=require("./routes/user.js");


main().then(()=>{
    console.log("connected to db");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);

}

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.use(methodoverride("_method"));
app.engine("ejs",ejsMate);

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
          secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on("err",()=>{
    console.log("Error in mongo session store",err);
});

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookies:{
        expires: Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
}


app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
 res.locals.success=req.flash("success");
 res.locals.error=req.flash("error");
 res.locals.currUser=req.user;
 next();
});



app.use("/listings",listingRoute);
app.use("/listings/:id/review",reviewRoute);
app.use("/",userRoute);



app.all("*",(req,res,next)=>{
    next(new expressError(404,"Page not found!"));
});

app.use((err,req,res,next)=>{
    let{statusCode=500,message="something went wrong"}=err;
    res.status(statusCode).render("error.ejs",{err});
});

app.listen(8080,()=>{
   console.log("listening to the port 8080");
});