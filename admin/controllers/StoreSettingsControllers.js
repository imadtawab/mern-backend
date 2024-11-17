const rejectError = require("../../mainUtils/rejectError")
const Store = require("../../models/StoreSettingsSchema")
const { checkStore } = require("../utils/slugifyUtils")

let storeControllers = {}

storeControllers.store_get_storeDetails = (req, res) => {
    Store.findOne({userId: req.userId}).select(["name", "title", "email", "description"]).then(data => {
        res.status(200).json({data})
    }).catch(err => rejectError(req, res, err))
}
storeControllers.store_post_storeDetails = async (req, res) => {
    try {
        // Check Store Name
        let storeAfterChecked = await checkStore(req.body.storeName, req.userId)
        Store.updateOne({userId: req.userId}, {...req.body, name: storeAfterChecked}).then(_ => {
            res.status(200).json({message: "The store details has been updated .", data: {name: storeAfterChecked}}) 
        }).catch(err => rejectError(req, res, err))
    } catch (err) {
        return rejectError(req, res, err)
      }
}
storeControllers.store_get_socialMedia = (req, res) => {
    Store.findOne({userId: req.userId}).select("social_media").then(({social_media: data}) => {
        console.log(data)
        res.status(200).json({data})
    }).catch(err => rejectError(req, res, err))
}
storeControllers.store_post_socialMedia = (req, res) => {
    Store.updateOne({userId: req.userId}, {social_media: req.body}).then(_ => {
        res.status(200).json({message: "The social media links has been updated .", data: req.body}) 
    }).catch(err => rejectError(req, res, err))
}
storeControllers.store_get_address = (req, res) => {
    Store.findOne({userId: req.userId}).select("address").then(({address: data}) => {
        console.log(data)
        res.status(200).json({data})
    }).catch(err => rejectError(req, res, err))
}
storeControllers.store_post_address = (req, res) => {
    Store.updateOne({userId: req.userId}, {address: req.body}).then(_ => {
        res.status(200).json({message: "The address has been updated .", data: req.body}) 
    }).catch(err => rejectError(req, res, err))
}

module.exports = storeControllers