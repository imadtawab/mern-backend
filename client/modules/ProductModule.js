const express = require("express");
const { product_get_products, product_get_product, product_get_wishList, product_post_addReview } = require("../controllers/ProductControllers");
const productModule = express.Router();

// /client/products

// GET all products
productModule.get("/", product_get_products)
productModule.post("/wishlist", product_get_wishList)
productModule.post("/reviews/:id", product_post_addReview)
productModule.get("/:slug", product_get_product)

module.exports = productModule