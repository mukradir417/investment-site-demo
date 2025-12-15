const mongoose = require('mongoose');

const ReviewTaskSchema = new mongoose.Schema({
    link: { type: String, required: true }, // গুগল ম্যাপ লিংক
    reward: { type: Number, required: true, default: 5 }, // কত টাকা পাবে
    title: { type: String, default: "Google Map Review" }, // টাস্কের টাইটেল
    active: { type: Boolean, default: true }, // টাস্ক চালু আছে কিনা
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ReviewTask', ReviewTaskSchema);