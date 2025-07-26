const Joi = require("joi");

const baseListing = {
  title: Joi.string().required(),
  description: Joi.string().required(),
  location: Joi.string().required(),
  country: Joi.string().required(),
  price: Joi.number().required().min(0),
  category: Joi.string().valid(
    'Trending',
    'Rooms',
    'Ionic cities',
    'Beaches',
    'Camping',
    'Architecture'
  ).required()
};

module.exports.listingCreateSchema = Joi.object({
  listing: Joi.object({
    ...baseListing,
    image: Joi.object({
      url: Joi.string().required(),
      filename: Joi.string().required()
    }).required()
  }).required()
});

module.exports.listingUpdateSchema = Joi.object({
  listing: Joi.object({
    ...baseListing,
    image: Joi.object({
      url: Joi.string(),
      filename: Joi.string()
    }).optional()  // optional editing
  }).required()
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required()
  }).required()
});
