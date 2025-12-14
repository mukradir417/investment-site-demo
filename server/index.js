const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');

// Models
const User = require('./models/User');
const Task = require('./models/Task');
const Withdraw = require('./models/Withdraw');
const Deposit = require('./models/Deposit');
const Settings = require('./models/Settings');
const Investment = require('./models/Investment');
const ReviewTask = require('./models/ReviewTask');

const app = express();

// 🔥 প্রোডাকশনের জন্য CORS এবং JSON লিমিট বাড়ানো হয়েছে
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json({ limit: '10mb' })); 

// ============================================
// 🔥 MONGODB ATLAS CONNECTION 🔥
// ============================================
const MONGO_URI = "mongodb+srv://admin:Muktadir417@cluster0.h5gp0hh.mongodb.net/earning_pro_db?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
.then(async () => {
    console.log("✅ MongoDB Atlas Connected!");
    try {
        // 🔥 ফিক্স: সেটিংস আছে কিনা চেক করবে, না থাকলে তৈরি করবে
        let count = await Settings.countDocuments();
        if (count === 0) {
            await new Settings().save();
            console.log("⚙️ Default Settings Created");
        }
    } catch (e) { console.log(e); }
}).catch(err => console.log("❌ MongoDB Atlas Error:", err));

// ⏰ Auto Update (Daily Reset at 6 AM)
cron.schedule('0 6 * * *', async () => {
    try {
        const investments = await Investment.find({ status: 'running' });
        for (const inv of investments) {
            const user = await User.findById(inv.userId);
            if (user) { 
                user.balance += inv.profitAmount; 
                await user.save(); 
            }
        }
        
        const users = await User.find({ level: { $gte: 2 } });
        for (const u of users) {
            if(u.spinsLeft < 10) { u.spinsLeft = 10; await u.save(); }
        }
        await User.updateMany({}, { tossesLeft: 2, dailyTaskCount: 0 });

        console.log("✅ Daily Updates Done!");
    } catch (err) { console.log(err); }
});

// ============================================
// 🔥 REVIEW TASK API
// ============================================

app.post('/admin/add-review-task', async (req, res) => {
    try {
        const { link, reward } = req.body;
        await new ReviewTask({ link, reward }).save();
        res.json({ success: true, message: "Task Added!" });
    } catch (err) { res.json({ success: false, message: "Error" }); }
});

app.get('/admin/review-tasks', async (req, res) => {
    const tasks = await ReviewTask.find({});
    res.json(tasks);
});

app.post('/admin/delete-review-task', async (req, res) => {
    await ReviewTask.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Deleted" });
});

app.post('/admin/set-task-limit', async (req, res) => {
    const { userId, limit } = req.body;
    try {
        await User.findByIdAndUpdate(userId, { taskLimit: Number(limit) });
        res.json({ success: true, message: `User limit set to ${limit} tasks!` });
    } catch (e) { res.json({ success: false, message: "Error" }); }
});

app.get('/user/get-random-task', async (req, res) => {
    const { userId } = req.query;
    try {
        const user = await User.findById(userId);
        if (!user) return res.json({ success: false, message: "User not found" });

        if (user.dailyTaskCount >= user.taskLimit) {
            return res.json({ success: false, message: "Daily Task Completed! Come back tomorrow." });
        }

        const task = await ReviewTask.aggregate([
            { $match: { active: true } }, 
            { $sample: { size: 1 } }      
        ]);
        
        if (task.length > 0) {
            res.json({ success: true, task: task[0], completed: user.dailyTaskCount, total: user.taskLimit });
        } else {
            res.json({ success: false, message: "No tasks available" });
        }
    } catch (err) { res.json({ success: false }); }
});

app.post('/user/claim-review-reward', async (req, res) => {
    const { userId, amount } = req.body;
    try {
        const user = await User.findById(userId);
        if (user.dailyTaskCount >= user.taskLimit) return res.json({ success: false, message: "Limit over!" });

        user.balance += Number(amount);
        user.dailyTaskCount += 1;
        user.notifications.push({ text: `Task Reward: ৳${amount}`, date: new Date() });
        
        await user.save();
        res.json({ success: true, message: "Reward Added!" });
    } catch (err) { res.json({ success: false }); }
});

// ============================================
// 🔥 GAME API
// ============================================

app.post('/admin/set-toss-result', async (req, res) => {
    const { userId, result } = req.body;
    try { 
        await User.findByIdAndUpdate(userId, { nextTossResult: result }); 
        res.json({ success: true, message: "Toss Result Set!" }); 
    } catch (err) { res.json({ error: "Error" }); }
});

app.post('/user/toss', async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (user.tossesLeft <= 0) return res.json({ success: false, message: "No tosses left today!" });

        let result = user.nextTossResult || (Math.random() < 0.5 ? 'HEAD' : 'TAIL');
        user.nextTossResult = null;

        const winAmount = (result === 'HEAD') ? 5 : 10;
        user.balance += winAmount;
        user.tossesLeft -= 1;
        await user.save();

        res.json({ success: true, result, winAmount, tossesLeft: user.tossesLeft });
    } catch (err) { res.json({ success: false, message: "Error" }); }
});

app.post('/admin/gift-spins', async (req, res) => {
    const { userId, spins } = req.body;
    try { 
        await User.findByIdAndUpdate(userId, { $inc: { spinsLeft: Number(spins) } }); 
        res.json({ success: true, message: "Gifted!" }); 
    } catch (err) { res.json({error:"Error"}); }
});

app.post('/admin/set-user-win', async (req, res) => {
    const { userId, amount } = req.body;
    try { await User.findByIdAndUpdate(userId, { nextSpinWin: Number(amount) }); res.json({ success: true, message: "Set!" }); } catch (err) { res.json({error:"Error"}); }
});

app.post('/user/spin', async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (user.level < 2) return res.json({ success: false, message: "Level 2 Required!" });
        if (user.spinsLeft <= 0) return res.json({ success: false, message: "No spins left!" });
        
        let winAmount = user.nextSpinWin !== null ? user.nextSpinWin : [0, 5, 10, 20][Math.floor(Math.random() * 4)];
        user.nextSpinWin = null;
        
        user.balance += winAmount; 
        user.spinsLeft -= 1; 
        await user.save();
        res.json({ success: true, winAmount, spinsLeft: user.spinsLeft });
    } catch (err) { res.json({ success: false, message: "Error" }); }
});

// ============================================
// 🔥 GENERAL API & ADMIN CONTROLS
// ============================================

app.post('/register', async(req,res)=>{try{await new User(req.body).save();res.json({success:true,message:"Created"});}catch(e){res.json({success:false,message:"Exists"});}});
app.post('/login', async(req,res)=>{const u=await User.findOne({email:req.body.email,password:req.body.password});if(u)res.json({success:true,user:u});else res.json({success:false});});
app.get('/user/:id', async(req,res)=>{const u=await User.findById(req.params.id);res.json(u);});

app.get('/admin/settings', async (req, res) => { 
    try { 
        // 🔥 ফিক্স: সবসময় প্রথম সেটিংস ডকুমেন্টটি আনবে
        let s = await Settings.findOne(); 
        if(!s) { s = new Settings(); await s.save(); }
        res.json(s); 
    } catch (e) { res.json({}); } 
});

app.post('/admin/update-settings', async (req, res) => { 
    // 🔥 ফিক্স: নতুন ডকুমেন্ট তৈরি না করে পুরানোটাই আপডেট করবে
    let s = await Settings.findOne();
    if(!s) s = new Settings();
    s.headline = req.body.headline;
    s.telegramLink = req.body.telegramLink;
    await s.save();
    res.json({ success: true, message: "Updated" }); 
});

app.post('/admin/add-number', async (req, res) => { 
    const { method, number, type } = req.body; 
    let s = await Settings.findOne(); 
    if(!s) s = new Settings(); 
    
    // 🔥 ফিক্স: প্রতিটি নম্বরের জন্য ইউনিক আইডি জেনারেট করা হচ্ছে
    const newEntry = { number: number, type: type || 'personal', _id: new mongoose.Types.ObjectId() };
    
    if(method=='bkash') s.bkash.push(newEntry); 
    if(method=='nagad') s.nagad.push(newEntry); 
    if(method=='binance') s.binance.push({ address: number, _id: new mongoose.Types.ObjectId() }); 
    
    await s.save(); 
    res.json({ success: true, message: "Added" }); 
});

app.post('/admin/delete-number', async (req, res) => { 
    const { method, numberId } = req.body; 
    let s = await Settings.findOne(); 
    
    // 🔥 ফিক্স: স্ট্রিং বা অবজেক্ট আইডি চেক করে সঠিকভাবে ডিলিট করা হচ্ছে
    if(method=='bkash') s.bkash = s.bkash.filter(n => (n._id ? n._id.toString() !== numberId : n !== numberId)); 
    if(method=='nagad') s.nagad = s.nagad.filter(n => (n._id ? n._id.toString() !== numberId : n !== numberId)); 
    if(method=='binance') s.binance = s.binance.filter(n => (n._id ? n._id.toString() !== numberId : n !== numberId)); 
    
    await s.save(); 
    res.json({ success: true, message: "Deleted" }); 
});

app.get('/admin/users', async(req,res)=>{const u=await User.find({});res.json(u);});
app.post('/admin/update-balance', async(req,res)=>{const u=await User.findById(req.body.userId);u.balance+=Number(req.body.amount);await u.save();res.json({success:true,message:"Updated"});});
app.delete('/admin/user/:id', async(req,res)=>{await User.findByIdAndDelete(req.params.id);res.json({success:true,message:"Deleted"});});
app.post('/admin/send-bonus', async(req,res)=>{await User.updateMany({},{$inc:{balance:Number(req.body.amount)}});res.json({success:true,message:"Sent"});});

app.post('/admin/send-notification', async (req, res) => { 
    const { type, userId, message } = req.body; 
    const notif = { text: message, date: new Date() }; 
    try {
        if (type === 'global') await User.updateMany({}, { $push: { notifications: notif } }); 
        else await User.findByIdAndUpdate(userId, { $push: { notifications: notif } }); 
        res.json({ success: true, message: "Sent" }); 
    } catch (e) { res.json({ success: false }); }
});

app.post('/admin/update-user-profile', async (req, res) => {
    const { userId, password, withdrawPin } = req.body;
    try {
        const updateData = {};
        if (password) updateData.password = password;
        if (withdrawPin) updateData.withdrawPin = withdrawPin;
        await User.findByIdAndUpdate(userId, updateData);
        res.json({ success: true, message: "User Data Updated!" });
    } catch (e) { res.json({ success: false }); }
});

// Admin Approve Requests
app.get('/admin/deposits', async(req,res)=>{const d=await Deposit.find({status:'pending'});res.json(d);});
app.get('/admin/withdrawals', async(req,res)=>{const w=await Withdraw.find({status:'pending'});res.json(w);});
app.post('/admin/approve-deposit', async(req,res)=>{const d=await Deposit.findById(req.body.depositId);if(d.status==='approved')return;d.status='approved';await d.save();const u=await User.findById(d.userId);u.balance+=d.amount;if(d.amount>=500){u.spinsLeft+=10;u.notifications.push({text:"Bonus 10 Spins!",date:new Date()})}await u.save();res.json({success:true,message:"Approved"});});
app.post('/admin/approve-withdraw', async(req,res)=>{const w=await Withdraw.findById(req.body.withdrawId);w.status='approved';await w.save();res.json({success:true,message:"Paid"});});

// User Actions
app.post('/deposit', async(req,res)=>{
    const { userId, amount, trxId, method, senderId } = req.body;
    try {
        const u = await User.findById(userId);
        await new Deposit({
            userId: u._id,
            userName: u.name,
            amount: Number(amount),
            trxId: trxId,
            method: method,
            senderId: senderId
        }).save();
        res.json({success:true, message:"Submitted"});
    } catch (e) { res.json({success:false}); }
});

app.post('/withdraw', async(req, res) => {
    const { userId, amount, number, method, pin } = req.body;
    try {
        const user = await User.findById(userId);
        if (user.dailyTaskCount < user.taskLimit) return res.json({ success: false, message: `Complete tasks first!` });
        if (amount < 300) return res.json({ success: false, message: "Min 300 Tk" });
        if (user.withdrawPin !== pin) return res.json({ success: false, message: "Wrong PIN" });
        if (user.balance < amount) return res.json({ success: false, message: "Insufficient Balance" });
        user.balance -= amount; await user.save();
        await new Withdraw({ userId, userName: user.name, method, number, amount }).save();
        res.json({ success: true, message: "Submitted!" });
    } catch (e) { res.json({ success: false }); }
});

// 🔥 FIXED PAYMENT METHODS ENDPOINT
app.get('/user/payment-methods', async(req,res)=>{ 
    try { 
        // ডাটাবেস থেকে সেটিংস লোড করা
        let s = await Settings.findOne(); 
        
        // যদি সেটিংস না থাকে, খালি পাঠান
        if(!s) return res.json({bkash: "N/A", nagad: "N/A", binance: "N/A"}); 
        
        const r = (list) => {
            // লিস্ট খালি হলে N/A রিটার্ন করুন
            if(!list || !Array.isArray(list) || list.length === 0) return "N/A";
            
            // র্যান্ডমলি নম্বর সিলেক্ট করা
            const i = list[Math.floor(Math.random() * list.length)];
            
            // 🔥 গুরুত্বপূর্ণ ফিক্স: নম্বর টেক্সট হোক বা অবজেক্ট, দুটোই হ্যান্ডেল করবে
            if (typeof i === 'string') return i; // যদি পুরোনো ডাটা (String) হয়
            
            // যদি নতুন ডাটা (Object) হয়
            let displayValue = i.number || i.address || "N/A";
            return i.type ? `${displayValue} (${i.type})` : displayValue;
        }; 
        
        res.json({
            bkash: r(s.bkash),
            nagad: r(s.nagad),
            binance: r(s.binance), 
            headline: s.headline,
            telegramLink: s.telegramLink
        }); 
    } catch(e){ 
        console.error(e);
        res.json({bkash: "N/A", nagad: "N/A", binance: "N/A"}); 
    } 
});

app.get('/tasks', async(req,res)=>{const t=await Task.find({}).sort({level:1});res.json(t);});

app.post('/buy-package', async(req,res)=>{
    const u=await User.findById(req.body.userId);
    const p=await Task.findById(req.body.packageId);
    if(u.balance>=p.price){
        u.balance-=p.price;
        u.level = p.level; 
        if(p.level > 0){ u.spinsLeft += 10; }
        await u.save();
        const e=new Date();e.setHours(e.getHours()+24);
        await new Investment({userId:u._id,packageName:p.title,investAmount:p.price,profitAmount:p.dailyIncome,endTime:e}).save();
        res.json({success:true,message:`Bought! Updated to Level ${u.level}`});
    }else{
        res.json({success:false,message:"Low Balance"});
    }
});

app.get('/user/my-plans/:userId', async (req, res) => { try { const p = await Investment.find({ userId: req.params.userId }).sort({_id:-1}); res.json(p); } catch(e) { res.json([]); } });

// Full History
app.get('/user/history/:id', async (req, res) => { 
    try { 
        const u=req.params.id; 
        const d=await Deposit.find({userId:u}).lean(); 
        const w=await Withdraw.find({userId:u}).lean(); 
        const i=await Investment.find({userId:u}).lean(); 
        const h=[...d.map(x=>({...x,type:'Deposit'})),...w.map(x=>({...x,type:'Withdraw'})),...i.map(x=>({...x,type:'Package',amount:x.investAmount}))].sort((a,b)=>new Date(b._id.getTimestamp())-new Date(a._id.getTimestamp())); 
        res.json(h); 
    } catch(e){res.json([])} 
});

// VIP Package Control for Admin
app.post('/admin/add-task', async (req, res) => {
    try {
        const { title, price, dailyIncome, level, image } = req.body;
        await new Task({ title, price: Number(price), dailyIncome: Number(dailyIncome), level: Number(level), image }).save();
        res.json({ success: true, message: "Added" });
    } catch (err) { res.json({ success: false }); }
});
app.post('/admin/delete-task', async (req, res) => {
    try { await Task.findByIdAndDelete(req.body.id); res.json({ success: true }); } catch (err) { res.json({ success: false }); }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server Running on ${PORT}`));