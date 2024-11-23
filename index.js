/**************************** */
/*******   Settings  ******** */
/**************************** */
// express
const express = require("express")
const app = express()

// .env
require('dotenv').config();

// cors
const cors = require('cors')
app.use(cors({
    origin: [
        /^http:\/\/localhost:3000/,
        /^http:\/\/[a-z0-9]+\.localhost:3000/
    ],
    // origin: [process.env.CLIENT_DOMAINE],
    methods: ["GET","POST","PUT","PATCH","DELETE"],
    credentials: true
}))

// cookiesParser
const cookieParser = require("cookie-parser")
app.use(cookieParser())

// json
app.use(express.urlencoded({ extended: true}))
app.use(express.json());

// static folder
const path = require("path")
app.use(express.static(path.join(__dirname,"./public")))

// Use multer for multipart/form-data
// app.use(upload.none());

// Connect to mongodb
const connectToDB = require("./config/config_db")
connectToDB(() => app.listen(process.env.PORT,() => console.log("Server Started : http://localhost:"+process.env.PORT)))


const authClient = async (req, res, next) => {
    let storeExists = await Store.findOne({name: req.headers.subdomain}).select(["userId","number_of_orders"])
    if(storeExists) {
            req.userId = storeExists.userId
            req.currentOrderRef = storeExists.number_of_orders + 1
            return next()
    }
    return rejectError(req, res, null, "Sorry..., The store is not available")
    // User.find().populate("storeOwner", ["name","number_of_orders"]).then(user => {
    //     console.log("user :::" ,user)
    //     if(user) {
    //         req.userId = user._id
    //         req.currentOrderRef = user.storeOwner.number_of_orders + 1
    //         return next()
    //     }
    //     return rejectError(req, res, null, "Sorry..., The store is not available")
    // }).catch(err => rejectError(req, res, err))
}
// Routers
const adminRouter = require("./routers/AdminRouter");
const clientRouter = require("./routers/ClientRouter");
const User = require("./models/UserSchema");
const rejectError = require("./mainUtils/rejectError");
const Store = require("./models/StoreSettingsSchema");
app.use("/admin", adminRouter)
app.use("/client", authClient, clientRouter)

app.get("/media/:img" , (req , res) => {
    res.sendFile(path.join(__dirname,"public/uploads",req.params.img))
})

// 404 
app.all("*", (req,res)=>{
    return res.status(404).json({
        message: "Page Not Found!!"
    })
});
