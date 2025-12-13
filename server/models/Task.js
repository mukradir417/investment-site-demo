const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: String,
    level: Number,
    price: Number,
    dailyIncome: Number,
    percent: String,
    image: String
});

module.exports = mongoose.model('Task', TaskSchema);