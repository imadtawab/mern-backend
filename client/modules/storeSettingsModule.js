// express
const express = require("express");
const { store_get_settings } = require("../controllers/StoreSettingdControllers");
const storeModule = express.Router();

storeModule.get("/", store_get_settings)



module.exports = storeModule