const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    bkash: { type: Array, default: [] }, 
    nagad: { type: Array, default: [] }, 
    binance: { type: Array, default: [] },
    telegram: { type: Array, default: [] },
    headline: { type: String, default: "Welcome!" },
    telegramLink: { type: String, default: "" },
    
    // স্পিন প্রাইস লিস্ট (অ্যাডমিন সেট করবে)
    spinPrizes: { type: Array, default: [10, 20, 50, 100, 0, 5, 200, 500] }
});

module.exports = mongoose.model('Settings', SettingsSchema);