const mongoose = require('mongoose');

const WithdrawSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    method: { type: String, required: true },
    number: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Withdraw', WithdrawSchema);