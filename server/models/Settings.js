const mongoose = require('mongoose');

// 🔥 নতুন স্কিমা যা অবজেক্ট এবং স্ট্রিং দুটোই সাপোর্ট করবে
const SettingsSchema = new mongoose.Schema({
    headline: { type: String, default: "Welcome to our app!" },
    telegramLink: { type: String, default: "" },
    
    // Bkash array now supports objects
    bkash: [{
        number: String,
        type: { type: String, default: 'personal' }
    }],
    
    // Nagad array
    nagad: [{
        number: String,
        type: { type: String, default: 'personal' }
    }],
    
    // Binance array
    binance: [{
        address: String,
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true } // Unique ID for delete
    }]
});

module.exports = mongoose.model('Settings', SettingsSchema);