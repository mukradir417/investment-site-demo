import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Deposit() {
    const [method, setMethod] = useState('bkash');
    const [amount, setAmount] = useState('');
    const [trxId, setTrxId] = useState('');
    const [numbers, setNumbers] = useState({ bkash: 'Loading...', nagad: 'Loading...', binance: 'Loading...' });
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    // 🔥 প্রোডাকশন ব্যাকএন্ড ইউআরএল (Render URL)
    const API_BASE = "https://earning-api.onrender.com"; 

    useEffect(() => {
        if(!userId) navigate('/');
        
        // লোকালহোস্টের পরিবর্তে অনলাইন ব্যাকএন্ড থেকে পেমেন্ট মেথড আনা
        axios.get(`${API_BASE}/user/payment-methods`)
            .then(res => setNumbers(res.data))
            .catch(err => console.log(err));
    }, [userId, navigate, API_BASE]);

    const handleCopy = (text) => {
        if(!text || text === 'Loading...') return;
        navigator.clipboard.writeText(text.split(' ')[0]); 
        alert("Number Copied!");
    };

    const submitDeposit = () => {
        if (!amount || !trxId) return alert("Fill all fields");
        
        // লোকালহোস্টের পরিবর্তে অনলাইন ব্যাকএন্ডে রিকোয়েস্ট পাঠানো হচ্ছে
        axios.post(`${API_BASE}/deposit`, { 
            userId, 
            amount: Number(amount), 
            trxId, 
            method 
        })
        .then(res => { 
            alert(res.data.message); 
            if(res.data.success) navigate('/dashboard'); 
        })
        .catch(() => alert("Connection Error!"));
    };

    const currentNumber = numbers[method];

    return (
        <div className="container" style={{padding:'20px', maxWidth:'500px', margin:'0 auto', fontFamily:'sans-serif'}}>
            <h2 style={{textAlign:'center', color:'#2e7d32'}}>Add Money</h2>

            <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                <button onClick={()=>setMethod('bkash')} style={{flex:1, padding:'10px', background:method==='bkash'?'#e2136e':'#ddd', color:method==='bkash'?'white':'black', border:'none', borderRadius:'5px', cursor:'pointer'}}>Bkash</button>
                <button onClick={()=>setMethod('nagad')} style={{flex:1, padding:'10px', background:method==='nagad'?'#f44336':'#ddd', color:method==='nagad'?'white':'black', border:'none', borderRadius:'5px', cursor:'pointer'}}>Nagad</button>
                <button onClick={()=>setMethod('binance')} style={{flex:1, padding:'10px', background:method==='binance'?'#fcd535':'#ddd', color:'black', border:'none', borderRadius:'5px', cursor:'pointer'}}>Binance</button>
            </div>

            <div style={{background:'#f9f9f9', padding:'20px', textAlign:'center', borderRadius:'10px', border:'1px solid #ddd'}}>
                <p style={{margin:0, fontSize:'14px', color:'#666'}}>Send Money To ({method.toUpperCase()}):</p>
                <h3 style={{margin:'10px 0', color:'#333'}}>{currentNumber}</h3>
                <button onClick={()=>handleCopy(currentNumber)} style={{background:'#333', color:'white', padding:'5px 15px', borderRadius:'20px', border:'none', cursor:'pointer'}}>Copy</button>
            </div>

            <div style={{marginTop:'20px'}}>
                <input type="number" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} style={inputStyle} />
                <input placeholder="Transaction ID" value={trxId} onChange={e=>setTrxId(e.target.value)} style={inputStyle} />
                <button onClick={submitDeposit} style={btnConfirm}>Confirm Deposit</button>
            </div>
            
            <button onClick={()=>navigate('/dashboard')} style={{width:'100%', marginTop:'10px', background:'transparent', border:'none', cursor:'pointer', color:'#666'}}>Cancel</button>
        </div>
    );
}

const inputStyle = {
    width:'100%', 
    padding:'12px', 
    marginBottom:'15px', 
    border:'1px solid #ddd', 
    borderRadius:'8px', 
    boxSizing:'border-box'
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
    cursor:'pointer'
};

export default Deposit;