import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    // 🔥 প্রোডাকশন ব্যাকএন্ড ইউআরএল (Render URL)
    const API_BASE = "https://earning-api.onrender.com"; 

    const handleLogin = async () => {
        try {
            // লোকালহোস্টের পরিবর্তে অনলাইন ব্যাকএন্ডে রিকোয়েস্ট পাঠানো হচ্ছে
            const res = await axios.post(`${API_BASE}/login`, formData);
            if (res.data.success) {
                localStorage.setItem('userId', res.data.user._id);
                navigate('/dashboard');
            } else {
                alert(res.data.message || "Invalid credentials");
            }
        } catch (err) {
            alert("Server Error! Make sure Backend is running.");
        }
    };

    return (
        <div className="container" style={{padding:'40px 20px', textAlign:'center'}}>
            <h1 style={{color:'#2575fc'}}>Welcome Back!</h1>
            
            <input 
                placeholder="Email Address" 
                style={inputStyle} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
            />
            <input 
                type="password" 
                placeholder="Password" 
                style={inputStyle} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
            />

            <button onClick={handleLogin} style={btnStyle}>Login</button>

            <div style={{marginTop:'20px'}}>
                <span>Don't have an account? </span>
                <Link to="/register" style={{color:'blue', fontWeight:'bold'}}>Create Account</Link>
            </div>
        </div>
    );
}

const inputStyle = { width: '100%', padding: '12px', margin: '10px 0', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '12px', background: '#2575fc', color: 'white', border: 'none', borderRadius: '5px', cursor:'pointer' };

export default Login;