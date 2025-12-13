const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // --- Basic Info ---
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // --- Wallet & Security ---
    balance: { type: Number, default: 0 },
    withdrawPin: { type: String, default: "1234" }, // ডিফল্ট পিন
    
    // --- Saved Payment Details ---
    boundNumber: { type: String, default: "" }, // ইউজার যেই নাম্বারে টাকা নিবে
    boundMethod: { type: String, default: "" }, // Bkash/Nagad

    // --- System Role ---
    role: { type: String, default: 'user' }, // 'admin' or 'user'
    isBanned: { type: Boolean, default: false },

    // --- 🔔 NOTIFICATION SYSTEM ---
    notifications: [
        {
            text: String,
            date: { type: Date, default: Date.now }
        }
    ],

    // --- 🎡 SPIN GAME DATA ---
    level: { type: Number, default: 1 }, 
    spinsLeft: { type: Number, default: 0 }, 
    nextSpinWin: { type: Number, default: null }, // এডমিন ফিক্সড উইন

    // --- 🪙 TOSS GAME DATA ---
    tossesLeft: { type: Number, default: 2 }, // প্রতিদিন ২টা ফ্রি
    nextTossResult: { type: String, default: null }, // এডমিন ফিক্সড রেজাল্ট (Head/Tail)

    // --- ⭐ REVIEW TASK DATA (NEW) ---
    taskLimit: { type: Number, default: 5 }, // এডমিন সেট করবে (ডিফল্ট ৫টা)
    dailyTaskCount: { type: Number, default: 0 }, // আজকে কয়টা টাস্ক কমপ্লিট করেছে
    extraTaskLimit: { type: Number, default: 0 } // (অপশনাল) যদি বোনাস টাস্ক দিতে চান

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);