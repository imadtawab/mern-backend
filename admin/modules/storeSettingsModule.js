// express
const express = require("express");
const { store_get_storeDetails, store_post_storeDetails, store_get_socialMedia, store_post_socialMedia, store_get_address, store_post_address } = require("../controllers/StoreSettingsControllers");
const { checkStore } = require("../utils/slugifyUtils");
const storeModule = express.Router();

storeModule.get("/store-details", store_get_storeDetails)
storeModule.post("/store-details",
    // checkStore, 
    store_post_storeDetails)

storeModule.get("/social-media", store_get_socialMedia)
storeModule.post("/social-media", store_post_socialMedia)

storeModule.get("/address", store_get_address)
storeModule.post("/address", store_post_address)



module.exports = storeModule