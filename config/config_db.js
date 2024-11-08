const mongoose=require('mongoose');


let connectToDB = (listen) => {
    return mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
        console.log("DATABASE connected ...");
        listen()
    }).catch((err)=> rejectError(req , res , err))
}

module.exports=connectToDB
