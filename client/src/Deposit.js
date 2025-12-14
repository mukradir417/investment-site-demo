import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Deposit = () => {
    const navigate = useNavigate();
    
    const [methods, setMethods] = useState({ bkash: "Loading...", nagad: "Loading...", binance: "Loading..." });
    const [amount, setAmount] = useState('');
    const [trxId, setTrxId] = useState('');
    const [sender, setSender] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('bkash'); 

    const userId = localStorage.getItem("userId"); 
    const API_BASE = "https://earning-api.onrender.com"; 

    useEffect(() => {
        axios.get(`${API_BASE}/user/payment-methods`)
            .then(res => {
                const data = res.data;
                setMethods({
                    bkash: data.bkash || "N/A",
                    nagad: data.nagad || "N/A",
                    binance: data.binance || "N/A"
                });
            })
            .catch(() => setMethods({ bkash: "N/A", nagad: "N/A", binance: "N/A" }));
    }, []);

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
                navigate('/dashboard'); 
            } else {
                alert("Failed to submit.");
            }
        } catch (error) {
            alert("Server Error. Try again.");
        }
    };

    return (
        <div style={{minHeight: '100vh', background: '#f8f9fa', padding: '20px', fontFamily: 'Segoe UI, sans-serif'}}>
            
            <div style={{maxWidth: '500px', margin: 'auto', background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}}>
                
                {/* 🔥 BEAUTIFUL HEADER WITH BACK BUTTON */}
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px'}}>
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        style={{
                            background: '#f1f2f6', 
                            border: 'none', 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            cursor: 'pointer', 
                            fontSize: '18px',
                            marginRight: '15px',
                            transition: '0.2s'
                        }}
                    >
                        ⬅
                    </button>
                    <h2 style={{margin: 0, fontSize: '22px', color: '#2c3e50'}}>Deposit Money</h2>
                </div>

                {/* পেমেন্ট মেথড বাটন */}
                <div style={{display:'flex', justifyContent:'space-between', gap:'10px', marginBottom:'25px'}}>
                    <button onClick={()=>setSelectedMethod('bkash')} style={selectedMethod==='bkash' ? activeBtn : inactiveBtn}>Bkash</button>
                    <button onClick={()=>setSelectedMethod('nagad')} style={selectedMethod==='nagad' ? activeBtn : inactiveBtn}>Nagad</button>
                    <button onClick={()=>setSelectedMethod('binance')} style={selectedMethod==='binance' ? activeBtn : inactiveBtn}>Binance</button>
                </div>

                {/* নম্বর ডিসপ্লে কার্ড */}
                <div style={cardStyle}>
                    <h4 style={{margin:'0 0 10px 0', color:'#555', fontSize:'14px'}}>Send Money To ({selectedMethod.toUpperCase()}):</h4>
                    <div style={{background:'#f3f4f6', padding:'15px', borderRadius:'10px', textAlign:'center', border:'2px dashed #ccc'}}>
                        <h2 style={{margin:0, color:'#e2136e', wordBreak:'break-all', fontSize:'24px'}}>
                            {selectedMethod === 'bkash' ? methods.bkash : 
                             selectedMethod === 'nagad' ? methods.nagad : 
                             methods.binance}
                        </h2>
                        <small style={{color:'red', display:'block', marginTop:'5px', fontWeight:'bold'}}>* Only Send Money / Cash Out</small>
                    </div>
                </div>

                {/* ডিপোজিট ফর্ম */}
                <div style={{marginTop:'25px'}}>
                    <div style={{marginBottom:'15px'}}>
                        <label style={labelStyle}>Amount (Min 300 ৳)</label>
                        <input type="number" placeholder="Example: 500" value={amount} onChange={e=>setAmount(e.target.value)} style={inputStyle} />
                    </div>

                    <div style={{marginBottom:'15px'}}>
                        <label style={labelStyle}>Sender Number / Wallet ID</label>
                        <input type="text" placeholder="017xxxxxxxx" value={sender} onChange={e=>setSender(e.target.value)} style={inputStyle} />
                    </div>

                    <div style={{marginBottom:'25px'}}>
                        <label style={labelStyle}>Transaction ID (TrxID)</label>
                        <input type="text" placeholder="Paste TrxID here" value={trxId} onChange={e=>setTrxId(e.target.value)} style={inputStyle} />
                    </div>

                    <button onClick={handleSubmit} style={submitBtn}>Confirm Deposit</button>
                </div>

            </div>
        </div>
    );
};

// --- CSS Styles ---
const activeBtn = { flex: 1, padding:'12px', background:'#27ae60', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', fontSize:'14px', transition: '0.3s' };
const inactiveBtn = { flex: 1, padding:'12px', background:'#eee', color:'#555', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'14px' };
const cardStyle = { background:'white', padding:'5px 0' };
const inputStyle = { width:'100%', padding:'14px', marginTop:'5px', borderRadius:'8px', border:'1px solid #ddd', boxSizing:'border-box', fontSize:'16px', outline: 'none', background: '#fcfcfc' };
const labelStyle = { fontWeight:'600', color:'#444', display:'block', fontSize:'14px' };
const submitBtn = { width:'100%', padding:'16px', background:'#2c3e50', color:'white', border:'none', borderRadius:'10px', fontSize:'18px', cursor:'pointer', fontWeight:'bold', boxShadow: '0 4px 10px rgba(44, 62, 80, 0.2)' };

export default Deposit;