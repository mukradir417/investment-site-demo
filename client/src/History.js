import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function History() {
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    // 🔥 প্রোডাকশন ব্যাকএন্ড ইউআরএল (Render URL)
    const API_BASE = "https://earning-api.onrender.com"; 

    useEffect(() => {
        if(!userId) {
            navigate('/');
            return;
        }

        // লোকালহোস্টের পরিবর্তে অনলাইন ব্যাকএন্ডে রিকোয়েস্ট পাঠানো হচ্ছে
        axios.get(`${API_BASE}/user/history/${userId}`)
             .then(res => setHistory(res.data))
             .catch(err => console.log("Error fetching history", err));
    }, [userId, navigate, API_BASE]);

    return (
        <div style={{padding:'20px', fontFamily:'sans-serif', maxWidth:'600px', margin:'0 auto'}}>
            <button onClick={()=>navigate('/dashboard')} style={{marginBottom:'20px', padding:'10px', background:'#333', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>← Back</button>
            
            <h2>📜 Transaction History</h2>
            
            {history.length === 0 ? (
                <p style={{textAlign:'center', color:'#888', marginTop:'50px'}}>No transactions found.</p>
            ) : (
                <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                    {history.map((h, i) => (
                        <div key={i} style={{
                            background:'white', 
                            padding:'15px', 
                            borderRadius:'10px', 
                            boxShadow:'0 2px 5px #eee', 
                            borderLeft: h.type==='Deposit'?'5px solid green':h.type==='Withdraw'?'5px solid red':'5px solid blue'
                        }}>
                            <div style={{display:'flex', justifyContent:'space-between'}}>
                                <b>{h.type}</b>
                                <span style={{
                                    color: h.status==='approved' || h.status==='Success' ? 'green' : h.status==='rejected' ? 'red' : 'orange',
                                    fontWeight: 'bold',
                                    fontSize: '14px'
                                }}>
                                    {h.status || 'Pending'}
                                </span>
                            </div>
                            
                            <div style={{display:'flex', justifyContent:'space-between', marginTop:'5px', color:'#555'}}>
                                <span>{h.date ? new Date(h.date).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                                <b style={{fontSize:'16px', color: h.type==='Withdraw' ? '#d32f2f' : '#2e7d32'}}>
                                    {h.type==='Withdraw'?'-':'+'} ৳{h.amount}
                                </b>
                            </div>
                            
                            {h.method && <small style={{display:'block', color:'#777'}}>Method: {h.method}</small>}
                            <small style={{color:'#999'}}>{h.details}</small>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default History;