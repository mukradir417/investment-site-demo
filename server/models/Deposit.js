const mongoose = require('mongoose');

const DepositSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    method: { type: String, required: true },
    trxId: { type: String, required: true }, // ট্রানজেকশন আইডি
    amount: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Deposit', DepositSchema);