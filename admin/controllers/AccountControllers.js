const User = require("../../models/UserSchema");
const rejectError = require("../../mainUtils/rejectError")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const { generateToken, sendConfirmationEmail, verifyToken, forgotPasswordEmail } = require("../utils/accountUtils");
const { removeFile } = require("../utils/mediaUtils");
const Joi = require("joi");
const Store = require("../../models/StoreSettingsSchema");
const { checkStore } = require("../utils/slugifyUtils");
const Shipping = require("../../models/ShippingSchema");

let accountControllers = {}

accountControllers.account_post_register = async (req, res, next) => {
    let {userName, email, password, storeName} = req.body
    try {
      console.log("before find user")
      // Check if a user with the given email already exists
      const existingUser = await User.findOne({ email });
      console.log("after find user : ", existingUser)
      
      if (existingUser) {
        // Check if the user is active
        if (!existingUser.isActive) {
          // Remove inactive user and associated store
          await User.findByIdAndDelete(existingUser._id);
          await Store.findOneAndDelete({ _id: existingUser.storeOwner });
          await Shipping.deleteMany({ userId: existingUser._id });
        } else {
          return rejectError(req, res, null, "User is already registered.")
        }
      }
      
      console.log("before checkStore")
      // Check Store Name
      let storeAfterChecked = await checkStore(storeName)
      console.log("after checkStore: ", storeAfterChecked)
      // Create new Store
      console.log("before new store")
      new Store({name: storeAfterChecked}).save().then(async newStore => {
        console.log("after new store : ", newStore)
        
        let storeOwner = newStore._id
        console.log("before hashPass",password,+process.env.PASSWORD_KEY)
       let hashPass = await bcrypt.hashSync(password, +process.env.PASSWORD_KEY)        
        console.log("after hashPass : ", hashPass)
        let activationCode = await generateToken(req.body.email);
        console.log("after activationCode : " , activationCode)
        
        // Create New User
        new User({
          userName, email,
          password: hashPass,
          storeOwner,
          activationCode,
        }).save().then(user => {
          console.log("after new user : " , user)
          // Inser User id in Store
          newStore.userId = user._id
          newStore.save().then(async _ => {
            console.log("after update store : " , _)
            try {
              // Create default shipping method
              console.log(req.userId)
              await new Shipping({
                userId: user._id,
                name: "free shipping",
                type: "fixed",
                rangeAmount: {
                  min_amount: null,
                  cost: null
                },
                cost: 0,
                estimated_delivery: "5 - 10 day for delivery",
                publish: true
              }).save()

              // Send confirmation email to user from email address
              await sendConfirmationEmail(req.body.email, activationCode);
              return res.status(200).json({message: "Please check your email for confirmation", data:{email: req.body.email}});
              } catch (err) {
              return rejectError(req, res, err, "Oops!, Please try again.", 500)
            }
            // return rejectError(req, res, null , "Oops! Something")
          }).catch(err => rejectError(req, res, err))
        }).catch(err => rejectError(req, res, err))

      }).catch(err => rejectError(req, res, err))
    } catch (err) {
      return rejectError(req, res, err)
    }
}
accountControllers.account_post_activationCode = async (req, res) => {
    let tokenResult = await verifyToken(req.params.activationCode)
    User.findOne({activationCode : req.params.activationCode, isActive: null}).then((user) => {
      console.log(user,2)
      if(user && tokenResult?.email === user.email) {
          user.isActive = true
          user.activationCode = null
          user.save().then((docs) => {
              return res.status(200).json({message: "Account has been confirmed successfully.", email: user.email});
          }).catch(err => rejectError(req , res , err))
      }else{
          return rejectError(req , res , null , "This confirmation code is invalid")
      }
  }).catch(err => rejectError(req , res , err))
}
accountControllers.account_post_resendEmail = async (req, res) => {
    let activationCode = await generateToken(req.body.email)
    User.findOne({email : req.body.email, isActive: null}).then((user) => {
      if(user){
          user.activationCode = activationCode
          user.save().then(async (docs) => {
            try {
              await sendConfirmationEmail(req.body.email, activationCode);
              return res.status(200).json({message: "Please check your email."});
            } catch (err) {
              return rejectError(req , res , err , "Oops!, Please try again.", 500)
            }
          }).catch(err => rejectError(req , res , err))
      }else{
          return rejectError(req , res , null , "This email is not exist")
      }
  }).catch(err => rejectError(req , res , err))
}
accountControllers.account_post_login = (req , res) => {
    User.findOne({email : req.body.email , isActive: true}).populate("storeOwner", ["name"]).then((user) => {
        if(user){
            bcrypt.compare(req.body.password , user.password ).then(async (pass) =>{
                if(pass){
                    const token = await jwt.sign(
                        {_id: user._id},
                        process.env.JWT_SECRET,
                        {expiresIn:"1d"}
                    );
                    res.cookie("_auth", token, {
                      maxAge: 24 * 60 * 60 * 1000,
                      withCredentials: true,
                      httpOnly: false,
                    })
                    
                    const {_id, email, userName, avatar,phone, storeOwner} = user
                    return res.status(200).json({user: {_id, email, userName, avatar,phone, storeOwner}, token})
                }else{
                    return rejectError(req , res , null , "Email or password is invalid", 401)
                }
            }).catch(err => rejectError(req , res , err, "Email or password is invalid", 401))
        }else{
            return rejectError(req , res , null , "Email or password is invalid", 401)
        }
    }).catch(err => rejectError(req , res , err))
    
}
accountControllers.account_post_forgotPassword = async (req, res) => {
    let forgotPasswordCode = await generateToken(req.body.email)
    User.findOne({email : req.body.email, isActive: true}).then((user) => {
      if(user){
          user.forgotPasswordCode = forgotPasswordCode
          user.save().then(async () => {
            try {
              await forgotPasswordEmail(req.body.email, forgotPasswordCode)
              return res.status(200).json({message: "Please check your email."})
            } catch (err) {
              return rejectError(req, res, err, "Oops!, Please try again.", 500)
            }
          }).catch(err => rejectError(req, res, err))
      }else{
          return rejectError(req , res , null , "This email is not exist.")
      }
  }).catch(err => rejectError(req, res, err))
}
accountControllers.account_post_forgotPasswordCode = async (req, res) => { 
    let tokenResult = await verifyToken(req.params.forgotPasswordCode)
    User.findOne({forgotPasswordCode : req.params.forgotPasswordCode}).then((user) => {
      if(user && tokenResult?.email === user.email){
          bcrypt.hash(req.body.password , +process.env.PASSWORD_KEY).then((hashPass) => {
              User.updateOne({forgotPasswordCode : req.params.forgotPasswordCode},{
                  password: hashPass,
                  forgotPasswordCode: null
              }).then(async (docs) => {
                  return res.status(200).json({message: "Your password has been changed."});
              }).catch(err => rejectError(req, res, err))
          }).catch(err => rejectError(req , res , err))
      }else{
          return rejectError(req , res , null , "This link is not available!")
      }
  }).catch(err => rejectError(req, res, err))
}
accountControllers.account_get_addAuthToState = async (req , res) => {
  const {_id} = await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
  User.findById(_id,{userName: true, email: true, avatar: true, phone: true}).populate("storeOwner", ["name"]).then((user) => {
      console.log(user)
      if(user){
          return res.status(200).json({user , token: req.cookies?._auth})
      }else{
          rejectError(req , res , null , "PLease Login In Your Account")
      }
  }).catch(err => rejectError(req , res ,err))
}

accountControllers.account_put_updateProfile = async (req , res) => {
      if(req.body.userName || req.body.userName === ""){
          try {
              await Joi.object({
                  userName: Joi.string().min(3).max(20).required(),
                  oldAvatar: Joi.any()
                }).validateAsync(req.body);
          } catch (err) {
            return rejectError(req, res, err)
          }
      }
      if(req.body.email){
          try {
              await Joi.object({
                  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com'] } }).required(),
                  oldAvatar: Joi.any()
                }).validateAsync(req.body);
          } catch (err) {
            return rejectError(req, res, err)
          }
      }
          User.updateOne({_id: req.userId}, {...req.body, avatar: req.body?.emptyAvatar ? "" : req.file?.filename}).then(docs => {
      if (req.body?.oldAvatar) {
          // SERVER_DOMAIN/media/
          let fileName = req.body?.oldAvatar.split(`${req.headers.host}/media/`,2)[1]
          if(fileName) removeFile(fileName)
      }
      if(!docs.acknowledged && !req.file?.filename && !req.body.emptyAvatar){
          return rejectError(req , res , null , "PLease Change Informations")
      }
      res.json({message: "The profile has been updated", data: {...req.body , emptyAvatar: req.body?.emptyAvatar  , avatar: req.body?.emptyAvatar ? undefined : req.file?.filename}})
  }).catch(err => console.log(err))
}
accountControllers.account_patch_changePassword = (req, res) => {
  let { current_password, password } = req.body
  User.findById(req.userId).select(["password"]).then(user => {
    bcrypt.compare(current_password , user.password ).then((pass) =>{
      if(pass){
        bcrypt.hash(password, +process.env.PASSWORD_KEY).then((hashPass) => {
            user.password = hashPass
            user.save()
            .then(() => {
              return res.status(200).json({message: "Your password has been changed"})
            }).catch((err) => rejectError(req, res, err));
        }).catch((err) => rejectError(req, res, err));
      }else{
        return rejectError(req , res , null , "Your current password is incorrect", 401)
      }
  }).catch(err => rejectError(req, res, err))
  }).catch(err => rejectError(req, res, err))
}

module.exports = accountControllers
