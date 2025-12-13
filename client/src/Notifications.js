import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifs, setNotifs] = useState([]);
    const userId = localStorage.getItem('userId');

    // 🔥 প্রোডাকশন ব্যাকএন্ড ইউআরএল (Render URL)
    const API_BASE = "https://earning-api.onrender.com"; 

    useEffect(() => {
        if(!userId) {
            navigate('/');
            return;
        }
        
        // লোকালহোস্টের পরিবর্তে অনলাইন ব্যাকএন্ডে রিকোয়েস্ট পাঠানো হচ্ছে
        axios.get(`${API_BASE}/user/${userId}`)
        .then(res => {
            if(res.data && res.data.notifications) {
                // নতুন মেসেজ সবার উপরে দেখাবে (reverse)
                setNotifs(res.data.notifications.reverse());
            }
        })
        .catch(err => console.log("Error fetching notifications", err));
    }, [userId, navigate, API_BASE]);

    return (
        <div style={{background:'#f4f6f8', minHeight:'100vh', padding:'20px', fontFamily:'sans-serif'}}>
            {/* Header */}
            <div style={{display:'flex', alignItems:'center', marginBottom:'20px'}}>
                <button onClick={()=>navigate('/dashboard')} style={{border:'none', background:'none', fontSize:'24px', cursor:'pointer'}}>⬅️</button>
                <h2 style={{margin:'0 0 0 10px', color:'#333'}}>Notifications</h2>
            </div>

            {/* List */}
            {notifs.length === 0 ? (
                <div style={{textAlign:'center', color:'#888', marginTop:'50px'}}>No notifications yet.</div>
            ) : (
                notifs.map((n, i) => (
                    <div key={i} style={{background:'white', padding:'15px', borderRadius:'10px', marginBottom:'10px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)', borderLeft:'4px solid #764ba2'}}>
                        <p style={{margin:'0 0 5px 0', fontSize:'15px', color:'#333'}}>{n.text}</p>
                        <small style={{color:'#888', fontSize:'11px'}}>
                            {new Date(n.date).toLocaleString()}
                        </small>
                    </div>
                ))
            )}
        </div>
    );
};

export default Notifications;