const mongoose = require('mongoose');

const DepositSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    method: { type: String, required: true }, // bkash, nagad, binance
    senderId: { type: String, required: true }, // 🔥 ইউজারের পাঠানো নম্বর বা বিন্যান্স আইডি
    trxId: { type: String, required: true }, // ট্রানজেকশন আইডি
    amount: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Deposit', DepositSchema);