const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  // productId: {
  //   type: String,
  //   required: true,
  // }, 
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        required: true,
      },   
      name: {
        type: String,
        required: true,
      }, 
      email: {
        type: String,
        required: true,
      }, 
},
{
timestamps: true
});

const Review = mongoose.model("review", reviewSchema);

module.exports = Review;
