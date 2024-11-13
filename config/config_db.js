const mongoose=require('mongoose');


let connectToDB = (listen) => {
    return mongoose.connect(process.env.DB, {
  serverSelectionTimeoutMS: 5000, // 5 seconds
  socketTimeoutMS: 45000, // 45 seconds
}).then(() => {
        console.log("DATABASE connected ...");
        listen()
    }).catch((err)=> rejectError(req , res , err))
}

module.exports=connectToDB
