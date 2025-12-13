const mongoose = require('mongoose');

const ReviewTaskSchema = new mongoose.Schema({
    link: { type: String, required: true }, // গুগল ম্যাপ লিংক
    reward: { type: Number, default: 5 },   // কত টাকা পাবে
    title: { type: String, default: "Google Map Review" },
    active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ReviewTask', ReviewTaskSchema);