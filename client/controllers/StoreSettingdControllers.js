const rejectError = require("../../mainUtils/rejectError")
const Store = require("../../models/StoreSettingsSchema")

let storeControllers = {}

storeControllers.store_get_settings = (req, res) => {
    Store.findOne({userId: req.userId}).select(["social_media"]).then(data => {
        res.status(200).json({data})
    }).catch(err => rejectError(req, res, err))
}
module.exports = storeControllers