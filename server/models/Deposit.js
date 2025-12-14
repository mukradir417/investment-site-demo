const mongoose = require('mongoose');

const DepositSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    method: { type: String, required: true }, // bkash, nagad, binance
    amount: { type: Number, required: true },
    
    // 🔥 এই দুটি ফিল্ড খুবই জরুরি (নতুন আপডেটের জন্য)
    senderId: { type: String, required: true }, // ইউজার যে নম্বর থেকে টাকা পাঠিয়েছে
    trxId: { type: String, required: true },    // ট্রানজেকশন আইডি

    status: { type: String, default: 'pending' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Deposit', DepositSchema);