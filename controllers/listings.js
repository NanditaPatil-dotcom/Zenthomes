const Listing = require("../models/listing.js");
const geocodeLocation= require("../utils/geocodeMaptiler.js");


module.exports.index = async (req, res) => {
  const { category,search} = req.query;
  let allListings;
  let label="Explore";

  if(search){
    allListings=await Listing.find({
      title: { $regex: search, $options: "i" },
    });
    label="";
  }else if(category){
    allListings=await Listing.find({category});
    label=category;
  }else{
    allListings=await Listing.find({});
  }

  res.render("listings/index.ejs", { allListings, category: label,search });
};


module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(req.params.id)
    .select("+geometry")
    .populate({
        path: "reviews", 
        populate: {
            path: "author",
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error","listing you requested for doesn't exist");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});
};


module.exports.createListing = async (req, res, next) => {
  try {
    const { path: url, filename } = req.file;
    const listingData = req.body.listing;
    if (!listingData.location || listingData.location.trim() === "") {
  console.log("Empty location field");
  req.flash("error", "Location cannot be empty.");
  return res.redirect("/listings/new");
  }


    const geometry = await geocodeLocation(listingData.location);
    if (!geometry || !geometry.coordinates || geometry.coordinates.length === 0) {
  console.log("Geometry invalid:", geometry);
  req.flash("error", "Could not fetch coordinates. Try a different location.");
  return res.redirect("/listings/new");
    }

    const newListing = new Listing({
      ...listingData,
      owner: req.user._id,
      image: { url, filename },
      geometry,
    });

    await newListing.save();

    req.flash("success", "New listing created!");
    res.redirect("/listings");

  } catch (err) {
    console.error("Error creating listing:", err);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/listings/new");
  }
};


module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);

    let originalImageUrl= listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload" , "/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};


module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listingData = req.body.listing;

  if (listingData.location) {
    const geometry = await geocodeLocation(listingData.location);
    if (geometry) {
      listingData.geometry = geometry;
    } else {
      req.flash("error", "Location not found. Please enter a valid city.");
      return res.redirect(`/listings/${id}/edit`);
    }
  }

  const updatedListing = await Listing.findByIdAndUpdate(id, listingData, {
    new: true,
  });

  if (req.files && req.files.length) {
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    updatedListing.image = imgs[0]; // overwrite old image with new
  }

  await updatedListing.save();

  req.flash("success", "Successfully updated listing!");
  res.redirect(`/listings/${updatedListing._id}`);
};


module.exports.searchSuggestions = async (req, res) => {
  const { q } = req.query;

  if (!q) return res.json([]);

  const suggestions = await Listing.find({
    title: { $regex: q, $options: "i" }
  }).limit(5);

  const titles = suggestions.map(listing => listing.title);
  res.json(titles);
};



module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
};


