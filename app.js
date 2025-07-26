const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsmate=require("ejs-mate");

main().then(()=>{
    console.log("connected to database");
})
.catch(err=>{
    console.log(err);
});

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsmate);
app.use(express.static(path.join(__dirname,"/public")));


app.get("/",(req,res)=>{
    res.send("working");
});

//index route
app.get("/listings",async(req,res)=>{
   const allListings= await Listing.find({});
   res.render("listings/index.ejs",{allListings}); //rendering index.ejs and passing alllistings into ejs
});

//new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});

//show route
app.get("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
});

//create route
app.post("/listings", async(req,res)=>{
    const listingData=req.body.listing;
    listingData.image={
        filename:`listing_${Date.now()}`,
        url:listingData.image
    };
    const newListing=new Listing(listingData);
    await newListing.save();
    res.redirect("/listings");
});

//edit route
app.get("/listings/:id/edit",async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
});

//update route
app.put("/listings/:id", async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
});

//delete route
app.delete("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findOneAndDelete(id);
    res.redirect("/listings");
})

app.listen(8080,()=>{
    console.log("working");
});