import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Deposit = () => {
    // পেমেন্ট মেথড লোড করার স্টেট
    const [methods, setMethods] = useState({ bkash: "Loading...", nagad: "Loading...", binance: "Loading..." });
    
    // ফর্ম ডাটা স্টেট
    const [amount, setAmount] = useState('');
    const [trxId, setTrxId] = useState('');
    const [sender, setSender] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('bkash'); // ডিফল্ট সিলেক্ট

    // ইউজারের ডাটা (লোকাল স্টোরেজ থেকে)
    const userId = localStorage.getItem("userId"); 
    const API_BASE = "https://earning-api.onrender.com"; 

    // ১. পেমেন্ট নম্বর লোড করা (আপনার সার্ভার ফিক্স অনুযায়ী)
    useEffect(() => {
        axios.get(`${API_BASE}/user/payment-methods`)
            .then(res => setMethods(res.data))
            .catch(() => setMethods({ bkash: "N/A", nagad: "N/A", binance: "N/A" }));
    }, []);

    // ২. ডিপোজিট রিকোয়েস্ট সাবমিট করা
    const handleSubmit = async () => {
        if (!amount || !trxId || !sender) return alert("Please fill all fields!");
        if (amount < 300) return alert("Minimum deposit 300 Tk");

        try {
            const res = await axios.post(`${API_BASE}/deposit`, {
                userId,
                amount,
                trxId,
                method: selectedMethod,
                senderId: sender
            });

            if (res.data.success) {
                alert("Deposit Submitted! Wait for approval.");
                setAmount('');
                setTrxId('');
                setSender('');
            } else {
                alert("Failed to submit.");
            }
        } catch (error) {
            alert("Server Error. Try again.");
        }
    };

    return (
        <div style={{padding:'20px', maxWidth:'500px', margin:'auto', fontFamily:'sans-serif'}}>
            <h2 style={{textAlign:'center', color:'#333'}}>Add Money</h2>
            
            {/* পেমেন্ট মেথড বাটন */}
            <div style={{display:'flex', justifyContent:'center', gap:'10px', marginBottom:'20px'}}>
                <button onClick={()=>setSelectedMethod('bkash')} style={selectedMethod==='bkash' ? activeBtn : inactiveBtn}>Bkash</button>
                <button onClick={()=>setSelectedMethod('nagad')} style={selectedMethod==='nagad' ? activeBtn : inactiveBtn}>Nagad</button>
                <button onClick={()=>setSelectedMethod('binance')} style={selectedMethod==='binance' ? activeBtn : inactiveBtn}>Binance</button>
            </div>

            {/* নম্বর ডিসপ্লে কার্ড (সার্ভার থেকে আসা ডাটা) */}
            <div style={cardStyle}>
                <h4 style={{margin:'0 0 10px 0', color:'#555'}}>Send Money To ({selectedMethod.toUpperCase()}):</h4>
                <div style={{background:'#f3f4f6', padding:'15px', borderRadius:'8px', textAlign:'center', border:'1px dashed #333'}}>
                    <h2 style={{margin:0, color:'#e2136e', wordBreak:'break-all'}}>
                        {selectedMethod === 'bkash' ? methods.bkash : 
                         selectedMethod === 'nagad' ? methods.nagad : 
                         methods.binance}
                    </h2>
                    <small style={{color:'red'}}>* Only Send Money / Cash Out</small>
                </div>
            </div>

            {/* ডিপোজিট ফর্ম */}
            <div style={{marginTop:'20px'}}>
                <label style={labelStyle}>Amount (Min 300):</label>
                <input type="number" placeholder="Enter amount" value={amount} onChange={e=>setAmount(e.target.value)} style={inputStyle} />

                <label style={labelStyle}>Sender Number / ID:</label>
                <input type="text" placeholder="Your number" value={sender} onChange={e=>setSender(e.target.value)} style={inputStyle} />

                <label style={labelStyle}>Transaction ID:</label>
                <input type="text" placeholder="TrxID (Copy & Paste)" value={trxId} onChange={e=>setTrxId(e.target.value)} style={inputStyle} />

                <button onClick={handleSubmit} style={submitBtn}>Confirm Deposit</button>
            </div>
        </div>
    );
};

// --- CSS Styles ---
const activeBtn = { padding:'10px 20px', background:'#27ae60', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold' };
const inactiveBtn = { padding:'10px 20px', background:'#ddd', color:'black', border:'none', borderRadius:'5px', cursor:'pointer' };
const cardStyle = { background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 10px rgba(0,0,0,0.1)' };
const inputStyle = { width:'100%', padding:'12px', marginTop:'5px', marginBottom:'15px', borderRadius:'5px', border:'1px solid #ccc', boxSizing:'border-box', fontSize:'16px' };
const labelStyle = { fontWeight:'bold', color:'#333', display:'block' };
const submitBtn = { width:'100%', padding:'15px', background:'#2c3e50', color:'white', border:'none', borderRadius:'8px', fontSize:'18px', cursor:'pointer', fontWeight:'bold' };

export default Deposit;