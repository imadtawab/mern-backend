const rejectError = require("../../mainUtils/rejectError");
const Product = require("../../models/ProductSchema");
const Review = require("../../models/ReviewSchema");

let productControllers = {}

productControllers.product_get_products = (req, res) => {
    let {categories, min, max, attributes} = req.query
    let filters = {publish: true, userOwner: req.userId}
    
    if(categories) filters.categoryOwner = {
        $in: categories.split(",")
    }
    if (min || max) {
        const priceFilter = {};
        if (min) priceFilter.$gte = +min;
        if (max) priceFilter.$lte = +max;
        filters.$or = [
            { "prices.salePrice": priceFilter },
            { "prices.originalPrice": priceFilter }
        ];
    }
    if(attributes) filters["variantsOwner.option_array"] = {
        $elemMatch: {
            $elemMatch: { $in: attributes.split(",") }
          }
    }
    Product.find(filters)
    .populate("categoryOwner", ["name"])
    .populate("reviewsOwner", ["rating"])
    .then( products => {
//         Product.aggregate([
//   {
//     $group: {
//       _id: null,
//       maxSalePrice: { $max: "$prices.salePrice" },  // Get the maximum salePrice
//       minSalePrice: { $min: "$prices.salePrice" }   // Get the minimum salePrice
//     }
//   }
// ])
        res.status(200).json({data: products, query: req.query});
    }).catch((err) => rejectError(req, res, err))
}
productControllers.product_get_wishList = (req, res) => {
    Product.find({publish: true, _id: req.body.wishlist, userOwner: req.userId})
    .populate("categoryOwner", ["name"])
    .then( products => {
        res.status(200).json({data: products});
    }).catch((err) => rejectError(req, res, err, null, 400))
}
productControllers.product_post_addReview = (req, res) => {
  new Review(req.body).save()
  .then(review => {
    Product.updateOne({_id: req.params.id}, {
      $push: {reviewsOwner: review._id}
  }).then(docs => {
    res.status(200).json({data: review, message: "Thanks, your review has been added."});
  }).catch((err) => rejectError(req, res, err, null, 400))
  })
  .catch((err) => rejectError(req, res, err, null, 400))
}
productControllers.product_get_product = async (req, res) => {
    try {
        const productData = await Product.findOne({ slug: req.params.slug, userOwner: req.userId })
          .populate('categoryOwner', 'name')
          .populate({
            path: 'options.attributeOwner',
            populate: {
              path: 'valuesOwner',
              model: 'attribute_value' // Ensure this is the correct model name
            }
          })
          .populate('variantsOwner')
          .populate('reviewsOwner')
    
        if (!productData) {
            return rejectError(req, res, null, 'Product not found', 404)
        }
        
        let product = productData.toObject();
console.log(product)
    
        // Process options with nested attribute values
        product.options = product.options.map((attr) => {
          const { _id, public_name, valuesOwner, type } = attr.attributeOwner;
          const basicValues = attr.values;
    
          return {
            _id,
            type,
            public_name,
            values: valuesOwner.filter((v) => basicValues.includes(v._id.toString()))
          };
        });
    
        // Process variants and create readable names
        product.variantsOwner = product.variantsOwner.map((v) => {
          const name = v.option_array.map((o) => {
            const option = product.options.find((opt) => opt._id.toString() === o[0]);
            const value = option?.values.find((val) => val._id.toString() === o[1]);
            return value ? value.name : null;
          }).filter(Boolean); // Remove any null values from the array
    
          return {
            ...v,
            name: name.join(' - ')
          };
        });
    
        res.status(200).json({ data: product });
      } catch (err) {
        console.error("Error fetching product:", err);
        return rejectError(req, res, null, 'Failed to fetch product', 404)
      }
    //   Product.findOne({slug: req.params.slug, userOwner: req.userId})
    //   .populate('categoryOwner', ["name"])
    //   .populate({
    //       path: 'options.attributeOwner', // populate the attributeOwner field
    //       populate: {
    //         path: 'valuesOwner', // nested populate for valuesOwner within attributeOwner
    //         model: 'attribute_value' // specify the model to populate
    //       }
    //     })
    //   .populate("variantsOwner")
    //     .then( prod => {
    //       let product = prod.toObject();
    //       product.options = product.options.map(attr => {
    //           let basicValues = attr.values
    //           let {_id, public_name, valuesOwner, type} = attr.attributeOwner
    //           return {
    //               _id,
    //               type,
    //               public_name,
    //               values: valuesOwner.filter(v => basicValues.indexOf(v._id.toString()) !== -1)
    //           }
    //       })
    //       product.variantsOwner = product.variantsOwner.map(v => {
    //           let name = []
    //           v.option_array.forEach(o => {
    //               return name.push(product.options.find(opt => opt._id.toString() === o[0]).values.find(val => val._id.toString() === o[1]).name)
    //           })
    //           return {
    //               ...v,
    //               name: name.join(" - ")
    //           }
    //       })
    //       res.status(200).json({data: product});
    //   }).catch((err) => rejectError(req, res, err, null, 400))
}
module.exports = productControllers