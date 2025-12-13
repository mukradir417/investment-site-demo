import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Deposit() {
    const [method, setMethod] = useState('bkash');
    const [amount, setAmount] = useState('');
    const [trxId, setTrxId] = useState('');
    // ইনিশিয়াল ভ্যালু খালি অবজেক্ট রাখা হয়েছে যাতে এরর না আসে
    const [numbers, setNumbers] = useState({ bkash: '', nagad: '', binance: '', headline: '' });
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    // 🔥 প্রোডাকশন ব্যাকএন্ড ইউআরএল (Render URL)
    const API_BASE = "https://earning-api.onrender.com"; 

    useEffect(() => {
        if (!userId) {
            navigate('/');
            return;
        }
        
        const fetchMethods = async () => {
            try {
                // অনলাইন ব্যাকএন্ড থেকে পেমেন্ট মেথড (Randomized numbers) আনা
                const res = await axios.get(`${API_BASE}/user/payment-methods`);
                setNumbers(res.data);
            } catch (err) {
                console.error("Error loading payment methods:", err);
            }
        };
        fetchMethods();
    }, [userId, navigate, API_BASE]); // ডিপেন্ডেন্সি লিস্ট ঠিক করা হয়েছে

    const handleCopy = (text) => {
        if (!text || text === 'N/A' || text === 'Loading...') return;
        // নম্বর থেকে শুধু ডিজিট কপি করার জন্য স্প্লিট করা হয়েছে (পার্সোনাল লেখা থাকলে বাদ যাবে)
        navigator.clipboard.writeText(text.split(' ')[0]); 
        alert("Copied to clipboard!");
    };

    const submitDeposit = () => {
        if (!amount || !trxId) return alert("Please fill all fields");
        
        axios.post(`${API_BASE}/deposit`, { 
            userId, 
            amount: Number(amount), 
            trxId, 
            method 
        })
        .then(res => { 
            alert(res.data.message); 
            if (res.data.success) navigate('/dashboard'); 
        })
        .catch(() => alert("Connection Error! Please try again."));
    };

    // বর্তমান মেথড অনুযায়ী নম্বর সিলেক্ট করা
    const currentNumber = numbers[method] || "N/A";

    return (
        <div className="container" style={{padding:'20px', maxWidth:'500px', margin:'0 auto', fontFamily:'sans-serif'}}>
            <h2 style={{textAlign:'center', color:'#2e7d32'}}>Add Money</h2>

            {/* পেমেন্ট মেথড বাটন */}
            <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                <button onClick={()=>setMethod('bkash')} style={{flex:1, padding:'10px', background:method==='bkash'?'#e2136e':'#ddd', color:method==='bkash'?'white':'black', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>Bkash</button>
                <button onClick={()=>setMethod('nagad')} style={{flex:1, padding:'10px', background:method==='nagad'?'#f44336':'#ddd', color:method==='nagad'?'white':'black', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>Nagad</button>
                <button onClick={()=>setMethod('binance')} style={{flex:1, padding:'10px', background:method==='binance'?'#fcd535':'#ddd', color:'black', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>Binance</button>
            </div>

            {/* নম্বর ডিসপ্লে সেকশন */}
            <div style={{background:'#f9f9f9', padding:'20px', textAlign:'center', borderRadius:'10px', border:'1px solid #ddd', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
                <p style={{margin:0, fontSize:'14px', color:'#666'}}>Send Money To ({method.toUpperCase()}):</p>
                <h3 style={{margin:'10px 0', color:'#333', wordBreak:'break-all'}}>{currentNumber}</h3>
                {currentNumber !== "N/A" && (
                    <button onClick={()=>handleCopy(currentNumber)} style={{background:'#333', color:'white', padding:'5px 15px', borderRadius:'20px', border:'none', cursor:'pointer'}}>Copy</button>
                )}
            </div>

            {/* ইনপুট ফর্ম */}
            <div style={{marginTop:'20px'}}>
                <label style={{fontSize:'14px', color:'#555'}}>Amount:</label>
                <input type="number" placeholder="Enter Amount" value={amount} onChange={e=>setAmount(e.target.value)} style={inputStyle} />
                
                <label style={{fontSize:'14px', color:'#555'}}>Transaction ID:</label>
                <input placeholder="Enter TrxID" value={trxId} onChange={e=>setTrxId(e.target.value)} style={inputStyle} />
                
                <button onClick={submitDeposit} style={btnConfirm}>Confirm Deposit</button>
            </div>
            
            <button onClick={()=>navigate('/dashboard')} style={{width:'100%', marginTop:'10px', background:'transparent', border:'none', cursor:'pointer', color:'#666'}}>Cancel</button>
        </div>
    );
}

const inputStyle = {
    width:'100%', 
    padding:'12px', 
    marginTop:'5px',
    marginBottom:'15px', 
    border:'1px solid #ddd', 
    borderRadius:'8px', 
    boxSizing:'border-box',
    fontSize:'16px'
};

const btnConfirm = {
    width:'100%',
    padding:'12px', 
    background:'#2e7d32', 
    color:'white', 
    border:'none', 
    borderRadius:'8px', 
    fontSize:'16px', 
    fontWeight:'bold', 
    cursor:'pointer',
    boxShadow:'0 4px 6px rgba(0,0,0,0.1)'
};

export default Deposit;