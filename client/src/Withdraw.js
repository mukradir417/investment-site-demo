import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Withdraw = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");
    const API_BASE = "https://earning-api.onrender.com"; 

    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);

    // Bind Wallet States
    const [bindMethod, setBindMethod] = useState("Bkash");
    const [bindNumber, setBindNumber] = useState("");

    // Withdraw States
    const [amount, setAmount] = useState("");
    const [pin, setPin] = useState("");
    const [withdrawMethod, setWithdrawMethod] = useState(""); // অটো সিলেক্ট হবে

    useEffect(() => {
        if (!userId) {
            navigate('/');
            return;
        }
        fetchUserData();
    }, [userId, navigate]);

    const fetchUserData = async () => {
        try {
            const res = await axios.get(`${API_BASE}/user/${userId}`);
            setUser(res.data);
            
            // যদি আগে থেকেই বাইন্ড করা থাকে, মেথড অটো সিলেক্ট করে দাও
            if (res.data.bkashNumber) setWithdrawMethod("Bkash");
            else if (res.data.nagadNumber) setWithdrawMethod("Nagad");
            else if (res.data.binanceId) setWithdrawMethod("Binance");
            
            setLoading(false);
        } catch (err) {
            console.log(err);
        }
    };

    // 🔥 ১. ওয়ালেট বাইন্ডিং ফাংশন (Bind Wallet Function)
    const handleBindWallet = async () => {
        if (!bindNumber) return alert("Please enter your wallet number!");

        const confirm = window.confirm(`Are you sure you want to set ${bindMethod} number: ${bindNumber}? You CANNOT change it later.`);
        if (!confirm) return;

        // ডাটা রেডি করা
        const payload = { userId };
        if (bindMethod === "Bkash") payload.bkash = bindNumber;
        if (bindMethod === "Nagad") payload.nagad = bindNumber;
        if (bindMethod === "Binance") payload.binance = bindNumber;

        try {
            const res = await axios.post(`${API_BASE}/user/bind-wallet`, payload);
            if (res.data.success) {
                alert("✅ Wallet Linked Successfully!");
                fetchUserData(); // পেজ রিফ্রেশ না করে ডাটা আপডেট হবে
            } else {
                alert("Failed to bind wallet.");
            }
        } catch (e) {
            alert("Server Error. Try again.");
        }
    };

    // 🔥 ২. টাকা উইথড্র করার ফাংশন (Withdraw Function)
    const handleWithdraw = async () => {
        if (!amount || !pin) return alert("Please fill all fields!");
        if (Number(amount) < 300) return alert("Minimum withdraw is 300 Tk");

        // অটোমেটিক সেভ করা নম্বর নেওয়া
        let targetNumber = "";
        if(withdrawMethod === 'Bkash') targetNumber = user.bkashNumber;
        if(withdrawMethod === 'Nagad') targetNumber = user.nagadNumber;
        if(withdrawMethod === 'Binance') targetNumber = user.binanceId;

        try {
            const res = await axios.post(`${API_BASE}/withdraw`, {
                userId,
                amount: Number(amount),
                number: targetNumber, // অটোমেটিক যাবে
                method: withdrawMethod,
                pin
            });

            if (res.data.success) {
                alert("✅ Withdraw Request Sent!");
                navigate('/dashboard');
            } else {
                alert("❌ " + res.data.message);
            }
        } catch (e) {
            alert("Server Error");
        }
    };

    if (loading) return <div style={{padding:'20px'}}>Loading...</div>;

    // চেক করা হচ্ছে ইউজার নম্বর সেট করেছে কি না
    const isWalletBound = user.bkashNumber || user.nagadNumber || user.binanceId;

    return (
        <div style={{minHeight: '100vh', background: '#f4f6f8', padding: '20px', fontFamily: 'Segoe UI'}}>
            <button onClick={() => navigate('/dashboard')} style={{border: 'none', background: 'transparent', fontSize: '20px', cursor: 'pointer', marginBottom: '15px'}}>⬅ Back</button>
            
            <h2 style={{textAlign:'center', color:'#2c3e50'}}>Withdraw Money</h2>

            {/* 🔥 কন্ডিশন: যদি ওয়ালেট সেট করা না থাকে, তাহলে এই ফর্ম দেখাবে */}
            {!isWalletBound ? (
                <div style={cardStyle}>
                    <div style={{background:'#fff3cd', padding:'10px', borderRadius:'5px', border:'1px solid #ffeeba', color:'#856404', marginBottom:'15px'}}>
                        <strong>⚠️ Bind Wallet First</strong> <br/>
                        <small>Note: You can add only ONE number. Can't change later.</small>
                    </div>

                    <label style={labelStyle}>Select Method</label>
                    <select value={bindMethod} onChange={e=>setBindMethod(e.target.value)} style={inputStyle}>
                        <option value="Bkash">Bkash</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Binance">Binance</option>
                    </select>

                    <label style={labelStyle}>Wallet Number/Address</label>
                    <input 
                        value={bindNumber} 
                        onChange={e=>setBindNumber(e.target.value)} 
                        placeholder={bindMethod === 'Binance' ? "Wallet Address" : "017xxxxxxxx"} 
                        style={inputStyle} 
                    />

                    <button onClick={handleBindWallet} style={{...btnStyle, background:'#e67e22'}}>
                        Bind Wallet Now
                    </button>
                </div>
            ) : (
                /* 🔥 যদি ওয়ালেট সেট করা থাকে, তাহলে উইথড্র ফর্ম দেখাবে */
                <div style={cardStyle}>
                    <div style={{textAlign:'center', marginBottom:'20px'}}>
                        <p style={{margin:0, color:'#555'}}>Your Current Balance</p>
                        <h1 style={{margin:'5px 0', color:'#27ae60'}}>৳ {user.balance}</h1>
                    </div>

                    {/* কোন মেথডে টাকা যাবে তা অটোমেটিক দেখাবে */}
                    <div style={{background:'#e8f5e9', padding:'15px', borderRadius:'10px', marginBottom:'20px', border:'1px solid #c8e6c9'}}>
                        <span style={{display:'block', fontSize:'12px', color:'#2e7d32', fontWeight:'bold'}}>RECEIVING ACCOUNT ({withdrawMethod.toUpperCase()})</span>
                        <span style={{fontSize:'18px', fontWeight:'bold', color:'#333'}}>
                            {withdrawMethod === 'Bkash' ? user.bkashNumber : withdrawMethod === 'Nagad' ? user.nagadNumber : user.binanceId}
                        </span>
                    </div>

                    <label style={labelStyle}>Amount (Min 300)</label>
                    <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount" style={inputStyle} />

                    <label style={labelStyle}>Withdraw PIN</label>
                    <input type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="Enter PIN" style={inputStyle} />

                    <button onClick={handleWithdraw} style={btnStyle}>Confirm Withdraw</button>
                </div>
            )}
        </div>
    );
};

// Styles
const cardStyle = { background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', maxWidth:'500px', margin:'auto' };
const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#444' };
const inputStyle = { width: '100%', padding: '14px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '16px' };
const btnStyle = { width: '100%', padding: '15px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' };

export default Withdraw;