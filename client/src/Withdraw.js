import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Withdraw() {
    const [user, setUser] = useState({});
    const [amount, setAmount] = useState('');
    const [pin, setPin] = useState('');
    
    // Binding States
    const [bindNumber, setBindNumber] = useState('');
    const [bindMethod, setBindMethod] = useState('Bkash');

    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    // 🔥 প্রোডাকশন ব্যাকএন্ড ইউআরএল (Render URL)
    const API_BASE = "https://earning-api.onrender.com"; 

    useEffect(() => {
        if(!userId) {
            navigate('/');
            return;
        }
        axios.get(`${API_BASE}/user/${userId}`).then(res => setUser(res.data));
    }, [userId, navigate, API_BASE]);

    // নাম্বার বাইন্ড ফাংশন
    const handleBind = () => {
        if(!bindNumber) return alert("Enter Number!");
        if(window.confirm("Are you sure? You cannot change this number later!")) {
            axios.post(`${API_BASE}/user/bind-number`, { userId, number: bindNumber, method: bindMethod })
                 .then(res => {
                     alert(res.data.message);
                     if(res.data.success) window.location.reload();
                 });
        }
    };

    // উইথড্র ফাংশন
    const handleWithdraw = () => {
        if(!amount || !pin) return alert("All fields required");
        
        axios.post(`${API_BASE}/withdraw`, {
            userId,
            amount: Number(amount),
            number: user.boundNumber, // সেভ করা নাম্বার অটোমেটিক যাবে
            method: user.boundMethod,
            pin
        }).then(res => {
            alert(res.data.message);
            if(res.data.success) navigate('/dashboard');
        }).catch(() => {
            alert("Connection Error!");
        });
    };

    return (
        <div className="container" style={{padding:'20px', maxWidth:'500px', margin:'0 auto', fontFamily:'sans-serif'}}>
            <h2 style={{textAlign:'center', color:'#e65100'}}>Withdraw Money</h2>

            {/* যদি নাম্বার বাইন্ড না করা থাকে */}
            {!user.boundNumber ? (
                <div style={{background:'#fff3e0', padding:'20px', borderRadius:'10px', border:'1px solid #ffb74d'}}>
                    <h3 style={{marginTop:0}}>⚠️ Bind Wallet First</h3>
                    <p style={{fontSize:'12px', color:'red'}}>Note: You can add only ONE number. Can't change later.</p>
                    
                    <label>Select Method</label>
                    <select value={bindMethod} onChange={e=>setBindMethod(e.target.value)} style={inp}>
                        <option value="Bkash">Bkash</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Binance">Binance</option>
                    </select>

                    <label>Wallet Number/Address</label>
                    <input placeholder="017..." value={bindNumber} onChange={e=>setBindNumber(e.target.value)} style={inp} />
                    
                    <button onClick={handleBind} style={btnBind}>Bind Wallet Now</button>
                </div>
            ) : (
                /* যদি নাম্বার বাইন্ড করা থাকে */
                <div style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 0 10px #eee'}}>
                    <div style={{background:'#e8f5e9', padding:'10px', borderRadius:'5px', marginBottom:'20px'}}>
                        <p style={{margin:0, fontSize:'12px', color:'#2e7d32'}}>Linked Wallet:</p>
                        <h3 style={{margin:'5px 0'}}>{user.boundMethod}: {user.boundNumber}</h3>
                        <small>Locked 🔒</small>
                    </div>

                    <label>Withdraw Amount (Min 300)</label>
                    <input type="number" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} style={inp} />

                    <label>Withdraw PIN</label>
                    <input type="password" placeholder="4 Digit PIN" value={pin} onChange={e=>setPin(e.target.value)} style={inp} />

                    <button onClick={handleWithdraw} style={btnWithdraw}>Confirm Withdraw</button>
                </div>
            )}
            
            <button onClick={()=>navigate('/dashboard')} style={{width:'100%', marginTop:'15px', background:'transparent', border:'none', cursor:'pointer', color:'#666'}}>Cancel</button>
        </div>
    );
}

const inp = {width:'100%', padding:'12px', marginBottom:'15px', border:'1px solid #ddd', borderRadius:'5px', boxSizing:'border-box'};
const btnBind = {width:'100%', padding:'12px', background:'#e65100', color:'white', border:'none', borderRadius:'5px', fontWeight:'bold', cursor:'pointer'};
const btnWithdraw = {width:'100%', padding:'12px', background:'#2e7d32', color:'white', border:'none', borderRadius:'5px', fontSize:'16px', fontWeight:'bold', cursor:'pointer'};

export default Withdraw;