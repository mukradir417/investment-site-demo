const mongoose = require('mongoose');

const DepositSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    method: { type: String, required: true }, 
    amount: { type: Number, required: true },
    
    senderId: { type: String, required: true }, // ইউজার যে নম্বর থেকে পাঠিয়েছে
    trxId: { type: String, required: true },
    
    // 🔥 নতুন লাইন: ইউজার আপনার কোন নম্বরে টাকা পাঠিয়েছে তা এখানে সেভ হবে
    receiverNumber: { type: String }, 

    status: { type: String, default: 'pending' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Deposit', DepositSchema);