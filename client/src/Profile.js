import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const [user, setUser] = useState({});
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    // 🔥 প্রোডাকশন ব্যাকএন্ড ইউআরএল (Render URL)
    const API_BASE = "https://earning-api.onrender.com"; 

    useEffect(() => {
        if (!userId) {
            navigate('/');
            return;
        }
        // লোকালহোস্টের পরিবর্তে অনলাইন ব্যাকএন্ডে রিকোয়েস্ট পাঠানো হচ্ছে
        axios.get(`${API_BASE}/user/${userId}`)
            .then(res => setUser(res.data))
            .catch(err => console.log("Error fetching profile", err));
    }, [userId, navigate, API_BASE]);

    return (
        <div style={{padding:'20px', fontFamily:'sans-serif', textAlign:'center', maxWidth:'500px', margin:'0 auto'}}>
             <button onClick={()=>navigate('/dashboard')} style={{float:'left', padding:'10px', background:'#333', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>← Back</button>
             <br/><br/>
             
             <div style={{width:'80px', height:'80px', background:'#667eea', borderRadius:'50%', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'30px', fontWeight:'bold'}}>
                 {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
             </div>
             
             <h2>{user.name}</h2>
             <p style={{color:'#666'}}>{user.mobile}</p>
             
             <div style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 10px #eee', marginTop:'20px', textAlign:'left'}}>
                 <p style={{borderBottom:'1px solid #f0f0f0', paddingBottom:'10px'}}><b>Email:</b> {user.email}</p>
                 <p style={{borderBottom:'1px solid #f0f0f0', paddingBottom:'10px'}}><b>Balance:</b> <span style={{color:'green', fontWeight:'bold'}}>৳{user.balance?.toFixed(2)}</span></p>
                 <p style={{borderBottom:'1px solid #f0f0f0', paddingBottom:'10px'}}><b>Withdraw PIN:</b> {user.withdrawPin}</p>
                 <p><b>Bound Wallet:</b> {user.boundNumber ? `${user.boundMethod} (${user.boundNumber})` : <span style={{color:'red'}}>Not Bound</span>}</p>
             </div>

             <p style={{marginTop:'30px', fontSize:'12px', color:'#999'}}>User ID: {user._id}</p>
        </div>
    );
}

export default Profile;