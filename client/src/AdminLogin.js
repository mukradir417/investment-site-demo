import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        // ডিবাগিং-এর জন্য: কনসোলে দেখাবে আপনি কি টাইপ করছেন
        console.log("Typing User:", username);
        console.log("Typing Pass:", password);

        // সহজ লগইন ক্রিডেনশিয়াল (আপনি চাইলে পরে চেঞ্জ করতে পারেন)
        // User: admin
        // Pass: 1234
        if (username === 'sabir417' && password === 'sabir417') {
            localStorage.setItem('adminAuth', 'true');
            alert("✅ Login Successful!");
            navigate('/admin');
        } 
        // আপনার আগের বড় আইডির জন্য ব্যাকআপ অপশন
        else if (username === '01734574721' && password === 'Muktadir417') {
            localStorage.setItem('adminAuth', 'true');
            alert("✅ Login Successful!");
            navigate('/admin');
        }
        else {
            alert("❌ Wrong Credentials! Check Console for details.");
        }
    };

    return (
        <div style={{minHeight:'100vh', display:'flex', justifyContent:'center', alignItems:'center', background:'#e0e5ec'}}>
            <form onSubmit={handleLogin} style={{background:'white', padding:'40px', borderRadius:'10px', boxShadow:'0 10px 25px rgba(0,0,0,0.1)', width:'300px'}}>
                <h2 style={{textAlign:'center', color:'#333'}}>Admin Access</h2>
                
                <div style={{marginBottom: '15px'}}>
                    <label style={{display:'block', marginBottom:'5px', fontSize:'14px'}}>Username</label>
                    <input 
                        type="text" 
                        placeholder="Type: admin" 
                        value={username} 
                        onChange={(e)=>setUsername(e.target.value)}
                        style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ccc', boxSizing:'border-box'}} 
                        required
                    />
                </div>

                <div style={{marginBottom: '20px'}}>
                    <label style={{display:'block', marginBottom:'5px', fontSize:'14px'}}>Password</label>
                    <input 
                        type="password" 
                        placeholder="Type: 1234" 
                        value={password} 
                        onChange={(e)=>setPassword(e.target.value)}
                        style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ccc', boxSizing:'border-box'}} 
                        required
                    />
                </div>

                <button type="submit" style={{width:'100%', padding:'10px', background:'#667eea', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold', fontSize:'16px'}}>
                    Login
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;