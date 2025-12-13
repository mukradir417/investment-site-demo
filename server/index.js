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
app.use(cors());
app.use(express.json());

// ============================================
// 🔥 MONGODB ATLAS CONNECTION (UPDATED) 🔥
// ============================================
// Database Name set to 'earning_pro_db'
const MONGO_URI = "mongodb+srv://admin:Muktadir417@cluster0.h5gp0hh.mongodb.net/earning_pro_db?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
.then(async () => {
    console.log("✅ MongoDB Atlas Connected!");
    try {
        let set = await Settings.findOne();
        if (!set) await new Settings().save();
    } catch (e) { console.log(e); }
}).catch(err => console.log("❌ MongoDB Atlas Error:", err));

// ⏰ Auto Update (Daily Reset at 6 AM)
cron.schedule('0 6 * * *', async () => {
    try {
        // 1. Profit Distribution
        const investments = await Investment.find({ status: 'running' });
        for (const inv of investments) {
            const user = await User.findById(inv.userId);
            if (user) { 
                user.balance += inv.profitAmount; 
                await user.save(); 
            }
        }
        
        // 2. Reset Spins & Toss
        const users = await User.find({ level: { $gte: 2 } });
        for (const u of users) {
            if(u.spinsLeft < 10) { u.spinsLeft = 10; await u.save(); }
        }
        await User.updateMany({}, { tossesLeft: 2 });

        // 3. Reset Daily Task Count
        await User.updateMany({}, { dailyTaskCount: 0 });

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

        let result = '';
        if (user.nextTossResult) {
            result = user.nextTossResult;
            user.nextTossResult = null; 
        } else {
            result = Math.random() < 0.5 ? 'HEAD' : 'TAIL';
        }

        const winAmount = (result === 'HEAD') ? 5 : 10;
        user.balance += winAmount;
        user.tossesLeft -= 1;
        await user.save();

        res.json({ success: true, result, winAmount, tossesLeft: user.tossesLeft });
    } catch (err) { res.json({ success: false, message: "Error" }); }
});

app.post('/admin/gift-spins', async (req, res) => {
    const { userId, spins } = req.body;
    try { await User.findByIdAndUpdate(userId, { $inc: { spinsLeft: Number(spins) } }); res.json({ success: true, message: "Gifted!" }); } catch (err) { res.json({error:"Error"}); }
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
        
        let winAmount;
        if (user.nextSpinWin !== null && user.nextSpinWin !== undefined) { 
            winAmount = user.nextSpinWin; 
            user.nextSpinWin = null; 
        } else { 
            const chances = [0, 5, 0, 5, 0, 5, 10, 0, 5]; 
            winAmount = chances[Math.floor(Math.random() * chances.length)]; 
        }
        
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

app.get('/admin/settings', async (req, res) => { try { let s = await Settings.findOne(); if(!s) s = new Settings(); res.json(s); } catch (e) { res.json({}); } });
app.post('/admin/update-settings', async (req, res) => { await Settings.findOneAndUpdate({}, req.body, { upsert: true }); res.json({ success: true, message: "Updated" }); });
app.post('/admin/add-number', async (req, res) => { const { method, number, type } = req.body; let s = await Settings.findOne(); if(!s) s=new Settings(); if(method=='bkash') s.bkash.push({number,type}); if(method=='nagad') s.nagad.push({number,type}); if(method=='binance') s.binance.push({address:number}); await s.save(); res.json({ success: true, message: "Added" }); });
app.post('/admin/delete-number', async (req, res) => { const { method, numberId } = req.body; let s = await Settings.findOne(); if(method=='bkash') s.bkash=s.bkash.filter(n=>n._id!=numberId); if(method=='nagad') s.nagad=s.nagad.filter(n=>n._id!=numberId); if(method=='binance') s.binance=s.binance.filter(n=>n._id!=numberId); await s.save(); res.json({ success: true, message: "Deleted" }); });

app.get('/admin/users', async(req,res)=>{const u=await User.find({});res.json(u);});
app.post('/admin/create-user', async(req,res)=>{try{await new User(req.body).save();res.json({success:true,message:"Created"});}catch(e){res.json({success:false,message:"Exists"});}});
app.post('/admin/update-balance', async(req,res)=>{const u=await User.findById(req.body.userId);u.balance+=Number(req.body.amount);await u.save();res.json({success:true,message:"Updated"});});
app.delete('/admin/user/:id', async(req,res)=>{await User.findByIdAndDelete(req.params.id);res.json({success:true,message:"Deleted"});});
app.post('/admin/send-bonus', async(req,res)=>{await User.updateMany({},{$inc:{balance:Number(req.body.amount)}});res.json({success:true,message:"Sent"});});
app.post('/admin/send-notification', async (req, res) => { const { type, userId, message } = req.body; const notif = { text: message, date: new Date() }; if (type === 'global') await User.updateMany({}, { $push: { notifications: notif } }); else await User.findByIdAndUpdate(userId, { $push: { notifications: notif } }); res.json({ success: true, message: "Sent" }); });

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

// Requests
app.get('/admin/deposits', async(req,res)=>{const d=await Deposit.find({status:'pending'});res.json(d);});
app.get('/admin/withdrawals', async(req,res)=>{const w=await Withdraw.find({status:'pending'});res.json(w);});
app.post('/admin/approve-deposit', async(req,res)=>{const d=await Deposit.findById(req.body.depositId);if(d.status==='approved')return;d.status='approved';await d.save();const u=await User.findById(d.userId);u.balance+=d.amount;if(d.amount>=500){u.spinsLeft+=10;u.notifications.push({text:"Bonus 10 Spins!",date:new Date()})}await u.save();res.json({success:true,message:"Approved"});});
app.post('/admin/reject-deposit', async(req,res)=>{await Deposit.findByIdAndDelete(req.body.depositId);res.json({success:true,message:"Deleted"});});
app.post('/admin/approve-withdraw', async(req,res)=>{const w=await Withdraw.findById(req.body.withdrawId);w.status='approved';await w.save();res.json({success:true,message:"Paid"});});
app.post('/admin/reject-withdraw', async(req,res)=>{const w=await Withdraw.findById(req.body.withdrawId);w.status='rejected';await w.save();const u=await User.findById(w.userId);u.balance+=w.amount;await u.save();res.json({success:true,message:"Refunded"});});

// User Actions
app.post('/deposit', async(req,res)=>{const u=await User.findById(req.body.userId);await new Deposit({userId:u._id,userName:u.name,amount:req.body.amount,trxId:req.body.trxId,method:req.body.method}).save();res.json({success:true,message:"Submitted"});});
app.post('/withdraw', async(req, res) => {
    const { userId, amount, number, method, pin } = req.body;
    try {
        const user = await User.findById(userId);
        if (user.dailyTaskCount < user.taskLimit) {
            const pending = user.taskLimit - user.dailyTaskCount;
            return res.json({ success: false, message: `⚠️ Complete ${pending} more tasks to withdraw!` });
        }
        if (amount < 300) return res.json({ success: false, message: "Min 300 Tk" });
        if (user.withdrawPin !== pin) return res.json({ success: false, message: "Wrong PIN" });
        if (user.balance < amount) return res.json({ success: false, message: "Insufficient Balance" });
        user.balance -= amount;
        await user.save();
        await new Withdraw({ userId, userName: user.name, method, number, amount }).save();
        res.json({ success: true, message: "Submitted!" });
    } catch (e) { res.json({ success: false }); }
});

app.get('/user/payment-methods', async(req,res)=>{ try { let s=await Settings.findOne(); if(!s) return res.json({}); const r=(l)=>{if(!Array.isArray(l)||l.length===0)return"N/A";const i=l[Math.floor(Math.random()*l.length)];return i.type?`${i.number} (${i.type})`:i.address}; res.json({bkash:r(s.bkash),nagad:r(s.nagad),binance:r(s.binance),headline:s.headline,telegramLink:s.telegramLink}); } catch(e){ res.json({}); } });
app.get('/tasks', async(req,res)=>{const t=await Task.find({}).sort({level:1});res.json(t);});
app.post('/buy-package', async(req,res)=>{const u=await User.findById(req.body.userId);const p=await Task.findById(req.body.packageId);if(u.balance>=p.price){u.balance-=p.price;if(p.level>u.level){u.level=p.level;u.spinsLeft=10;}await u.save();const e=new Date();e.setHours(e.getHours()+24);await new Investment({userId:u._id,packageName:p.title,investAmount:p.price,profitAmount:p.dailyIncome,endTime:e}).save();res.json({success:true,message:`Bought! Level ${u.level}`});}else{res.json({success:false,message:"Low Balance"});}});
app.get('/user/my-plans/:userId', async (req, res) => { try { const p = await Investment.find({ userId: req.params.userId }).sort({_id:-1}); res.json(p); } catch(e) { res.json([]); } });
app.get('/user/history/:id', async (req, res) => { try { const u=req.params.id; const d=await Deposit.find({userId:u}).lean(); const w=await Withdraw.find({userId:u}).lean(); const i=await Investment.find({userId:u}).lean(); const h=[...d.map(x=>({...x,type:'Deposit'})),...w.map(x=>({...x,type:'Withdraw'})),...i.map(x=>({...x,type:'Package',amount:x.investAmount}))].sort((a,b)=>new Date(b._id.getTimestamp())-new Date(a._id.getTimestamp())); res.json(h); } catch(e){res.json([])} });

app.listen(5000, () => console.log("🚀 Server Running on 5000"));