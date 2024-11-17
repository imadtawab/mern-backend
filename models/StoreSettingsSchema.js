const mongoose = require("mongoose");

const storeSettingSchema = new mongoose.Schema({
    userId: String,
    name: {
        type: String,
        default: null,
    },
    title: {
        type: String,
        default: null,
    },
    email: {
        type: String,
        default: null,
    },
    description: {
        type: String,
        default: null,
    },
    logo: {
        type: String,
        default: null,
    },
    favicon: {
        type: String,
        default: null,
    },
    language: {
        type: String,
        default: null,
    },
    currency: {
        type: String,
        default: null,
    },
    social_media: {
        facebook_url: {
        type: String,
        default: null,
    },
        instagram_url: {
        type: String,
        default: null,
    },
        tiktok_url: {
        type: String,
        default: null,
    },
        twitter_url: {
        type: String,
        default: null,
    },
    },
    address: {
        country: {
        type: String,
        default: null,
    },
        city: {
        type: String,
        default: null,
    },
        zip_code: {
        type: String,
        default: null,
    },
        address_line_1: {
        type: String,
        default: null,
    },
        address_line_2: {
        type: String,
        default: null,
    },
    },
    number_of_orders: {
        type: Number,
        default: 0
    }
},
{
timestamps: true
});

const Store = mongoose.model("storeSetting", storeSettingSchema);

module.exports = Store;
