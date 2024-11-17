const rejectError = require("../../mainUtils/rejectError")
const Store = require("../../models/StoreSettingsSchema")
const User = require("../../models/UserSchema")

let slugifyUtils = {}

slugifyUtils.slugify = (req, res, next) => {
    let regExp = new RegExp(/^[a-zA-Z0-9 \-]*$/)

    if(req.body.slug === "") return res.status(200).json({message: 'Slug is required.', checked: false})
    
    if(!regExp.test(req.body.slug)) return res.status(200).json({message: 'Slug matches not contain special characters.', checked: false})

    req.slugify =  req.body.slug ? req.body.slug.toLowerCase().split(/\s+|\W+|_/).filter(l => l.trim() !== "").join("-") : null
    next()
  }

  // slugifyUtils.checkStore = async (req, res, next) => {
  //   let regExp = new RegExp(/^[a-zA-Z0-9]*$/)
  //   if(!req.body.storeName) return rejectError(req, res, null, 'Please enter a store name.')
  //   if(!regExp.test(req.body.storeName)) return rejectError(req, res, null, 'StoreName matches not contain special characters.')
  
  //   req.checkStore =  req.body.storeName ? req.body.storeName.toLowerCase() : null
  
  //   try {
  //     let store = await Store.findOne({ name: req.checkStore})
  //     if(store) {
  //       return rejectError(req, res, null, "This store name is already exists.");
  //     }
  //   }
  //   catch (err) {
  //     return rejectError(req, res, err)
  //   }
    
  //   if(next) next()
  // }
  slugifyUtils.checkStore = async (storeName, userId) => {
    let regExp = new RegExp(/^[a-zA-Z0-9]*$/)
    if(!storeName) throw new Error("Please enter a store name.");
      // if(!storeName) return rejectError(req, res, null, 'Please enter a store name.')
    if(!regExp.test(storeName)) throw new Error("StoreName matches not contain special characters.");
      // if(!regExp.test(storeName)) return rejectError(req, res, null, 'StoreName matches not contain special characters.')
  
    let storeHandler = storeName.toLowerCase()
    // req.checkStore =  req.body.storeName ? req.body.storeName.toLowerCase() : null
    try {
      let store = await Store.findOne({ name: storeHandler})
      if(store && store.userId !== userId) {
        throw new Error("This store name is already exists.");
        // return rejectError(req, res, null, "This store name is already exists.");
      }
      return storeHandler
    }
    catch (err) {
      throw new Error(err);
    }
    
    if(next) next()
  }

module.exports = slugifyUtils