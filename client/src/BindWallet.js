import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BindWallet = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");
    
    // 🔥 আপনার API লিংক
    const API_BASE = "https://earning-api.onrender.com"; 

    const [bkash, setBkash] = useState("");
    const [nagad, setNagad] = useState("");
    const [binance, setBinance] = useState("");

    // পেজ লোড হলে আগের সেভ করা নাম্বার দেখাবে
    useEffect(() => {
        if(!userId) {
            navigate('/');
        } else {
            axios.get(`${API_BASE}/user/${userId}`)
                .then(res => {
                    if(res.data) {
                        setBkash(res.data.bkashNumber || "");
                        setNagad(res.data.nagadNumber || "");
                        setBinance(res.data.binanceId || "");
                    }
                })
                .catch(err => console.log(err));
        }
    }, [userId, navigate]);

    // সেভ বাটন ফাংশন
    const handleBind = async () => {
        if(!bkash && !nagad && !binance) {
            return alert("Please enter at least one number!");
        }
        
        try {
            const res = await axios.post(`${API_BASE}/user/bind-wallet`, {
                userId, 
                bkash, 
                nagad, 
                binance
            });

            if(res.data.success) {
                alert("✅ Wallet Linked Successfully!");
                navigate('/dashboard'); // সেভ হওয়ার পর ড্যাশবোর্ডে নিয়ে যাবে
            } else {
                alert("Failed to bind wallet.");
            }
        } catch(e) { 
            alert("Server Error!"); 
        }
    };

    return (
        <div style={{padding:'20px', maxWidth:'500px', margin:'auto', fontFamily:'Segoe UI', background:'#f4f6f8', minHeight:'100vh'}}>
            
            {/* ব্যাক বাটন */}
            <button onClick={()=>navigate('/dashboard')} style={{border:'none', background:'transparent', fontSize:'20px', cursor:'pointer', marginBottom:'20px', color:'#555'}}>
                ⬅ Back to Dashboard
            </button>
            
            <div style={{background:'white', padding:'30px', borderRadius:'15px', boxShadow:'0 5px 20px rgba(0,0,0,0.05)'}}>
                <h2 style={{textAlign:'center', color:'#2c3e50', marginBottom:'30px'}}>Link Your Wallet</h2>
                
                {/* Bkash Input */}
                <div style={{marginBottom:'20px'}}>
                    <label style={{display:'block', fontWeight:'bold', color:'#e2136e', marginBottom:'8px'}}>Bkash Personal Number</label>
                    <input 
                        value={bkash} 
                        onChange={e=>setBkash(e.target.value)} 
                        placeholder="Ex: 017xxxxxxxx" 
                        type="number"
                        style={inputStyle} 
                    />
                </div>

                {/* Nagad Input */}
                <div style={{marginBottom:'20px'}}>
                    <label style={{display:'block', fontWeight:'bold', color:'#f68c1f', marginBottom:'8px'}}>Nagad Personal Number</label>
                    <input 
                        value={nagad} 
                        onChange={e=>setNagad(e.target.value)} 
                        placeholder="Ex: 016xxxxxxxx" 
                        type="number"
                        style={inputStyle} 
                    />
                </div>

                {/* Binance Input */}
                <div style={{marginBottom:'30px'}}>
                    <label style={{display:'block', fontWeight:'bold', color:'#f3ba2f', marginBottom:'8px'}}>Binance Pay ID / TRC20</label>
                    <input 
                        value={binance} 
                        onChange={e=>setBinance(e.target.value)} 
                        placeholder="Paste Wallet Address" 
                        style={inputStyle} 
                    />
                </div>

                <button onClick={handleBind} style={btnStyle}>Save Wallet Info</button>
            </div>
        </div>
    );
};

// স্টাইল
const inputStyle = { 
    width:'100%', 
    padding:'15px', 
    borderRadius:'8px', 
    border:'1px solid #ddd', 
    boxSizing:'border-box', 
    fontSize:'16px', 
    outline:'none', 
    background:'#f9f9f9' 
};

const btnStyle = { 
    width:'100%', 
    padding:'15px', 
    background:'linear-gradient(45deg, #11998e, #38ef7d)', 
    color:'white', 
    border:'none', 
    borderRadius:'10px', 
    cursor:'pointer', 
    fontSize:'18px', 
    fontWeight:'bold',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
};

export default BindWallet;