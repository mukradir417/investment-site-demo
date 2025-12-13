const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    packageName: { type: String },
    investAmount: { type: Number },
    profitAmount: { type: Number }, // লাভ
    endTime: { type: Date }, // কখন লাভ যোগ হবে
    status: { type: String, default: 'running' } // running -> completed
});

module.exports = mongoose.model('Investment', InvestmentSchema);