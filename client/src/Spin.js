import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Spin() {
    const [user, setUser] = useState({});
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0); 
    const [resultMsg, setResultMsg] = useState("");
    
    // 🔥 প্রোডাকশন ব্যাকএন্ড ইউআরএল (Render URL)
    const API_BASE = "https://earning-api.onrender.com"; 

    // চাকার ডিজাইনের সেগমেন্টস
    const segments = [100, 200, 500, 0, 5, 10, 20, 50]; 
    const segmentAngle = 360 / segments.length; 

    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if(!userId) {
            navigate('/');
            return;
        }
        axios.get(`${API_BASE}/user/${userId}`).then(res => setUser(res.data));
    }, [userId, navigate, API_BASE]);

    const handleSpin = async () => {
        if(user.spinsLeft <= 0) return alert("❌ No spins left!");
        if(user.level < 2) return alert("🔒 Upgrade to Level 2!");

        setSpinning(true);
        setResultMsg("");

        try {
            // লোকালহোস্টের বদলে API_BASE ব্যবহার করা হয়েছে
            const res = await axios.post(`${API_BASE}/user/spin`, { userId });
            
            if(res.data.success) {
                const winAmount = res.data.winAmount;
                let winIndex = segments.indexOf(winAmount);
                if(winIndex === -1) winIndex = 0;

                const baseSpins = 3600; 
                const targetRotation = baseSpins + (360 - (winIndex * segmentAngle)) - (segmentAngle / 2);
                
                const currentRot = rotation % 360; 
                const finalRot = rotation + (targetRotation - currentRot);

                setRotation(finalRot);

                setTimeout(() => {
                    setSpinning(false);
                    setResultMsg(`🎉 You Won ৳${winAmount}!`);
                    setUser({...user, balance: user.balance + winAmount, spinsLeft: res.data.spinsLeft});
                }, 5000); 

            } else {
                setSpinning(false);
                alert(res.data.message);
            }
        } catch(err) {
            setSpinning(false);
            alert("Connection Error! Backend is probably sleeping.");
        }
    };

    return (
        <div style={{
            minHeight: '100vh', 
            background: '#1a2a6c', 
            display: 'flex', flexDirection: 'column', alignItems: 'center', 
            color: 'white', fontFamily: 'sans-serif', overflow: 'hidden'
        }}>
            
            <div style={{width: '100%', padding: '20px', display: 'flex', justifyContent: 'space-between'}}>
                <button onClick={()=>navigate('/dashboard')} style={{background:'rgba(255,255,255,0.2)', border:'none', color:'white', padding:'8px 15px', borderRadius:'20px', cursor:'pointer'}}>← Back</button>
                <div style={{background:'gold', color:'black', padding:'5px 15px', borderRadius:'20px', fontWeight:'bold'}}>৳ {user.balance?.toFixed(2)}</div>
            </div>

            <h1 style={{margin: '10px 0', color:'#ffd700', textShadow:'0 0 10px black'}}>LUCKY WHEEL</h1>
            <p>Spins Left: <b>{user.spinsLeft}</b></p>

            <div style={{position: 'relative', width: '300px', height: '300px', margin: '20px 0'}}>
                <div style={{
                    position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', 
                    zIndex: 20, width: '0', height: '0', 
                    borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderTop: '40px solid red',
                    filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))'
                }}></div>

                <div style={{
                    width: '100%', height: '100%', borderRadius: '50%', 
                    position: 'relative',
                    border: '5px solid white', 
                    boxShadow: '0 0 20px black',
                    background: 'conic-gradient(#42a5f5 0deg 45deg, #ab47bc 45deg 90deg, #ef5350 90deg 135deg, #78909c 135deg 180deg, #8d6e63 180deg 225deg, #ff7043 225deg 270deg, #fdd835 270deg 315deg, #9ccc65 315deg 360deg)',
                    transform: `rotate(${rotation}deg)`,
                    transition: 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)' 
                }}>
                    {segments.map((val, i) => (
                        <div key={i} style={{
                            position: 'absolute', top: '50%', left: '50%', width: '100%', height: '100%',
                            transform: `translate(-50%, -50%) rotate(${i * segmentAngle + (segmentAngle / 2)}deg)`,
                        }}>
                            <span style={{
                                position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', 
                                color: 'white', fontWeight: 'bold', textShadow: '1px 1px 2px black', fontSize: '18px'
                            }}>
                                {val}
                            </span>
                        </div>
                    ))}
                    <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', width:'50px', height:'50px', background:'white', borderRadius:'50%', boxShadow:'inset 0 0 5px black', display:'flex', alignItems:'center', justifyContent:'center'}}>★</div>
                </div>
            </div>

            <button onClick={handleSpin} disabled={spinning} style={{
                background: spinning?'gray':'linear-gradient(45deg, #ff3d00, #ff9100)', color:'white', border:'none', 
                padding:'12px 50px', borderRadius:'30px', fontSize:'20px', fontWeight:'bold', 
                boxShadow:'0 5px 10px rgba(0,0,0,0.3)', marginTop:'20px', width: '80%', cursor: spinning?'not-allowed':'pointer'
            }}>
                {spinning ? 'SPINNING...' : 'SPIN NOW'}
            </button>

            {resultMsg && (
                <div style={{
                    marginTop:'20px', padding:'10px 20px', background:'white', color:'black', 
                    borderRadius:'10px', fontWeight:'bold'
                }}>
                    {resultMsg}
                </div>
            )}
        </div>
    );
}

export default Spin;