    // express
    const express = require("express")
const categoryModule = require("../client/modules/CategoryModule")
const productModule = require("../client/modules/ProductModule")
const customerModule = require("../client/modules/CustomerModule")
const attributeModule = require("../client/modules/AttributeModule")
const shippingModule = require("../client/modules/shippingModule")
const couponModule = require("../client/modules/CouponModule")
const storeModule = require("../client/modules/storeSettingsModule")
const Order = require("../models/OrderSchema")
const rejectError = require("../mainUtils/rejectError")
const clientRouter = express.Router()
       
    // "/client/"
    clientRouter.use("/categories", categoryModule)
    clientRouter.use("/attributes", attributeModule)
    clientRouter.use("/products", productModule)
    clientRouter.use("/customers", customerModule)
    clientRouter.use("/shipping-methods", shippingModule)
    clientRouter.use("/coupons", couponModule)
    clientRouter.use("/store-settings", storeModule)


    
    module.exports = clientRouter