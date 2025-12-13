import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function MyPlans() {
    const [plans, setPlans] = useState([]);
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    const API_BASE = "https://earning-api.onrender.com"; 

    useEffect(() => {
        if (!userId) {
            navigate('/');
            return;
        }
        
        // ব্যাকএন্ড থেকে ইউজারের কেনা সব প্যাকেজ আনা
        axios.get(`${API_BASE}/user/my-plans/${userId}`)
            .then(res => setPlans(res.data))
            .catch(err => console.error("Error loading plans:", err));
    }, [userId, navigate]);

    return (
        <div style={{padding:'20px', maxWidth:'600px', margin:'0 auto', fontFamily:'sans-serif'}}>
            <button onClick={()=>navigate('/dashboard')} style={{marginBottom:'20px', padding:'10px 20px', background:'#333', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>← Back</button>
            <h2 style={{textAlign:'center', color:'#2c3e50'}}>💎 My Active Packages</h2>

            {plans.length === 0 ? (
                <p style={{textAlign:'center', color:'#888', marginTop:'50px'}}>You don't have any active packages yet.</p>
            ) : (
                plans.map((p, i) => (
                    <div key={i} style={{background:'#fff', border:'1px solid #ddd', padding:'15px', borderRadius:'10px', marginBottom:'15px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <b style={{fontSize:'18px', color:'#2ecc71'}}>{p.packageName}</b>
                            <span style={{background:'#e8f5e9', color:'#2e7d32', padding:'4px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'bold'}}>
                                {p.status.toUpperCase()}
                            </span>
                        </div>
                        <hr style={{border:'0.5px solid #eee', margin:'10px 0'}} />
                        <div style={{fontSize:'14px', color:'#555'}}>
                            <p style={{margin:'5px 0'}}>💰 Invested: ৳{p.investAmount}</p>
                            <p style={{margin:'5px 0'}}>📈 Daily Profit: ৳{p.profitAmount}</p>
                            <p style={{margin:'5px 0'}}>📅 Purchased: {new Date(p.purchaseDate).toLocaleDateString()}</p>
                            <p style={{margin:'5px 0', color:'#e67e22'}}>⌛ Ends: {new Date(p.endTime).toLocaleString()}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default MyPlans;