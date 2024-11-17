const mongoose = require('mongoose');

const connectToDB = async (listen) => {
    try {
        await mongoose.connect(process.env.DB);
        console.log("DATABASE connected ...");
        listen()
    } catch (err) {
        console.error("DATABASE connection error:", err.message);
        throw err; // Let the caller handle errors
    }
};

module.exports = connectToDB;
