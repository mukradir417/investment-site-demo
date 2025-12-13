import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Toss() {
    const [user, setUser] = useState({});
    const [tossing, setTossing] = useState(false);
    const [coinSide, setCoinSide] = useState('HEAD'); // HEAD or TAIL visual
    const [message, setMessage] = useState("");
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

    const handleToss = () => {
        if(user.tossesLeft <= 0) return alert("❌ No tosses left today!");
        
        setTossing(true);
        setMessage("");

        // Start random flipping animation
        const interval = setInterval(() => {
            setCoinSide(prev => prev === 'HEAD' ? 'TAIL' : 'HEAD');
        }, 100);

        // Call API
        axios.post(`${API_BASE}/user/toss`, { userId })
        .then(res => {
            setTimeout(() => {
                clearInterval(interval);
                setTossing(false);
                
                if(res.data.success) {
                    setCoinSide(res.data.result); // Show final result
                    setMessage(res.data.result === 'HEAD' 
                        ? `🎉 HEAD! You Won ৳5` 
                        : `🎉 TAIL! You Won ৳10`);
                    setUser({...user, balance: user.balance + res.data.winAmount, tossesLeft: res.data.tossesLeft});
                } else {
                    alert(res.data.message);
                }
            }, 2000); // 2 sec animation
        })
        .catch(() => { 
            clearInterval(interval); 
            setTossing(false); 
            alert("Connection Error!");
        });
    };

    return (
        <div style={{minHeight:'100vh', background:'#222', color:'white', textAlign:'center', fontFamily:'sans-serif', padding:'20px'}}>
            <button onClick={()=>navigate('/dashboard')} style={{float:'left', background:'#444', color:'white', border:'none', padding:'10px', borderRadius:'5px', cursor:'pointer'}}>← Back</button>
            <br/><br/>
            
            <h1 style={{color:'gold'}}>🪙 COIN TOSS</h1>
            <p>Tosses Left: <b>{user.tossesLeft}</b> (Daily Free: 2)</p>
            <p style={{fontSize:'12px', color:'#aaa'}}>HEAD = ৳5 | TAIL = ৳10</p>

            <div style={{margin:'50px auto', width:'150px', height:'150px', position:'relative', perspective:'1000px'}}>
                <div style={{
                    width:'100%', height:'100%', borderRadius:'50%', 
                    background: coinSide === 'HEAD' ? '#ffd700' : '#c0c0c0', 
                    border:'5px solid white', 
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'30px', fontWeight:'bold', color:'#333',
                    boxShadow:'0 0 20px rgba(255,255,255,0.2)',
                    transform: tossing ? 'rotateY(720deg)' : 'rotateY(0deg)',
                    transition: 'transform 0.5s',
                    textShadow: '1px 1px 0px white'
                }}>
                    {coinSide}
                </div>
            </div>

            <button onClick={handleToss} disabled={tossing || user.tossesLeft<=0} style={{
                background: tossing ? '#555' : 'linear-gradient(45deg, gold, orange)',
                border:'none', padding:'15px 40px', fontSize:'20px', fontWeight:'bold', 
                borderRadius:'30px', cursor: tossing?'not-allowed':'pointer', color:'black'
            }}>
                {tossing ? 'FLIPPING...' : 'FLIP COIN'}
            </button>

            {message && <div style={{marginTop:'20px', fontSize:'20px', color:'lightgreen', fontWeight:'bold'}}>{message}</div>}
        </div>
    );
}

export default Toss;