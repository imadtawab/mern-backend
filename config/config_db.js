const mongoose=require('mongoose');
const rejectError = require('../mainUtils/rejectError');


let connectToDB = (listen) => {
    return mongoose.connect(process.env.DB).then(() => {
        console.log("DATABASE connected ...");
        listen()
    }).catch((err)=> {
        console.log(err, "error")
    })
}

module.exports=connectToDB
