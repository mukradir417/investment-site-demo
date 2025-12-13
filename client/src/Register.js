import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
    const [form, setForm] = useState({ 
        name: '', email: '', mobile: '', telegram: '', password: '', withdrawPin: '' 
    });
    
    const [agree, setAgree] = useState(false);
    const navigate = useNavigate();

    // 🔥 প্রোডাকশন ব্যাকএন্ড ইউআরএল (Render URL)
    const API_BASE = "https://earning-api.onrender.com"; 

    const handleReg = async () => {
        if (!agree) return alert("শর্তাবলী (Terms) মেনে নিন!");
        if(!form.name || !form.email || !form.mobile || !form.telegram || !form.password || !form.withdrawPin){
            return alert("সব ঘর পূরণ করুন!");
        }

        try {
            // লোকালহোস্টের পরিবর্তে অনলাইন ব্যাকএন্ডে রিকোয়েস্ট পাঠানো হচ্ছে
            const res = await axios.post(`${API_BASE}/register`, form);
            if(res.data.success) {
                alert("Account Created! Please Login.");
                navigate('/');
            } else { 
                alert(res.data.message || "Registration Failed"); 
            }
        } catch (err) {
            alert("Server Error! Make sure Backend is running.");
        }
    };

    return (
        <div className="container" style={{padding:'30px', maxWidth:'400px', margin:'20px auto', background:'white', borderRadius:'10px', boxShadow:'0 0 10px #ddd'}}>
            <h2 style={{color:'#2575fc', textAlign:'center'}}>Create Account 🇮🇳</h2>
            
            <input placeholder="Full Name" style={inputStyle} onChange={e => setForm({...form, name: e.target.value})} />
            <input placeholder="Phone Number" style={inputStyle} onChange={e => setForm({...form, mobile: e.target.value})} />
            <input placeholder="Email Address" style={inputStyle} onChange={e => setForm({...form, email: e.target.value})} />
            <input placeholder="Telegram Username" style={inputStyle} onChange={e => setForm({...form, telegram: e.target.value})} />
            <input type="password" placeholder="Password" style={inputStyle} onChange={e => setForm({...form, password: e.target.value})} />
            <input type="number" placeholder="Set 4-Digit PIN" style={inputStyle} onChange={e => setForm({...form, withdrawPin: e.target.value})} />

            <div style={{margin:'15px 0'}}>
                <input type="checkbox" onChange={(e) => setAgree(e.target.checked)} />
                <span> I agree to Terms & Conditions</span>
            </div>

            <button onClick={handleReg} style={{width:'100%', padding:'12px', background: agree?'#2575fc':'grey', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>
                Register Now
            </button>

            <Link to="/" style={{display:'block', textAlign:'center', marginTop:'15px', textDecoration:'none', color:'#2575fc'}}>Login Here</Link>
        </div>
    );
}

const inputStyle = { width: '100%', padding: '10px', margin: '5px 0', border: '1px solid #ddd', borderRadius: '5px', boxSizing:'border-box' };

export default Register;