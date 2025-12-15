import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [user, setUser] = useState({});
    const [packages, setPackages] = useState([]);
    const [myPlans, setMyPlans] = useState([]); 
    const [headline, setHeadline] = useState('Welcome');
    const [telegramLink, setTelegramLink] = useState('');
    const [telegramIds, setTelegramIds] = useState([]);
    
    // লোকাল স্টোরেজ থেকে ইউজার আইডি নেওয়া
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();

    // 🔥 API BASE URL - আপনার Render এর লিংকটি এখানে বসান
    const API_BASE = "https://earning-api.onrender.com"; 

    useEffect(() => {
        // ইউজার লগইন না থাকলে লগইন পেজে পাঠাবে
        if(!userId) {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                // ১. ইউজার ডাটা
                const u = await axios.get(`${API_BASE}/user/${userId}`);
                setUser(u.data);

                // ২. প্যাকেজ লিস্ট
                const t = await axios.get(`${API_BASE}/tasks`);
                setPackages(t.data);

                // ৩. সেটিংস (হেডলাইন, টেলিগ্রাম)
                const p = await axios.get(`${API_BASE}/user/payment-methods`);
                if(p.data.headline) setHeadline(p.data.headline);
                if(p.data.telegramLink) setTelegramLink(p.data.telegramLink);
                if(p.data.telegram) setTelegramIds(p.data.telegram);
                
                // ৪. অ্যাক্টিভ প্ল্যানস
                const h = await axios.get(`${API_BASE}/user/my-plans/${userId}`);
                setMyPlans(h.data);

            } catch (err) {
                console.log("Error loading data", err);
            }
        };
        fetchData();
    }, [userId, navigate]);

    // প্যাকেজ কেনার ফাংশন
    const buyPackage = (pkg) => {
        if(user.balance < pkg.price) return alert("Insufficient Balance!");
        
        if(window.confirm(`Confirm Buy ${pkg.title}?`)) {
            axios.post(`${API_BASE}/buy-package`, { userId, packageId: pkg._id })
            .then(res => {
                alert(res.data.message);
                if(res.data.success) window.location.reload();
            })
            .catch(() => alert("Server Error"));
        }
    };

    // লাইভ চ্যাট (র‍্যান্ডম)
    const openLiveChat = () => {
        if(!telegramIds || telegramIds.length === 0) return alert("Support Offline");
        const randomId = telegramIds[Math.floor(Math.random() * telegramIds.length)];
        window.open(`https://t.me/${randomId}`, '_blank');
    };

    // অফিসিয়াল চ্যানেল
    const openTelegram = () => {
        if(telegramLink) window.open(telegramLink, '_blank');
        else alert("Telegram Link Not Set");
    };

    const handleLogout = () => {
        if(window.confirm("Logout?")) { 
            localStorage.removeItem('userId'); 
            navigate('/'); 
        }
    };

    return (
        <div className="container" style={{background:'#f5f7fa', minHeight:'100vh', paddingBottom:'80px', fontFamily:'sans-serif'}}>
            
            {/* --- HEADER SECTION --- */}
            <div className="header-card" style={{
                position:'relative', 
                paddingBottom:'40px', 
                background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color:'white', 
                padding:'20px', 
                borderRadius:'0 0 25px 25px', 
                boxShadow:'0 4px 15px rgba(0,0,0,0.2)'
            }}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <div style={{width:'45px', height:'45px', background:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#764ba2', fontWeight:'bold', fontSize:'20px'}}>
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                            <h3 style={{margin:0, fontSize:'16px'}}>{user.name}</h3>
                            <small style={{opacity:0.8}}>{user.mobile}</small>
                        </div>
                    </div>
                    
                    <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                        {/* Notification Bell */}
                        <div onClick={() => navigate('/notifications')} style={{position: 'relative', cursor: 'pointer'}}>
                            <span style={{fontSize:'24px'}}>🔔</span>
                            {user.notifications && user.notifications.length > 0 && (
                                <div style={{
                                    position: 'absolute', top: -5, right: -2,
                                    background: 'red', color: 'white', borderRadius: '50%',
                                    width: '18px', height: '18px', fontSize: '10px', fontWeight: 'bold',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid white'
                                }}>
                                    {user.notifications.length}
                                </div>
                            )}
                        </div>

                        <button onClick={handleLogout} style={{background:'rgba(255,255,255,0.2)', border:'none', color:'white', padding:'6px 12px', borderRadius:'20px', cursor:'pointer', fontSize:'12px'}}>
                            Logout ⏻
                        </button>
                    </div>
                </div>

                <div style={{textAlign:'center', marginTop:'25px', marginBottom:'15px'}}>
                    <span style={{fontSize:'13px', opacity:0.9}}>Asset Balance</span>
                    <h1 style={{margin:'5px 0', fontSize:'32px'}}>৳ {user.balance?.toFixed(2)}</h1>
                </div>

                {/* Headline */}
                <div style={{position:'absolute', bottom:0, left:0, width:'100%', background:'rgba(0,0,0,0.3)', padding:'8px 0', borderRadius:'0 0 25px 25px'}}>
                    {/* eslint-disable-next-line jsx-a11y/no-distracting-elements */}
                    <marquee behavior="scroll" direction="left" style={{fontSize:'13px', color:'white', padding:'0 10px'}}>{headline}</marquee>
                </div>
            </div>

            {/* --- ACTION BUTTONS (With Review Task & Bind Wallet) --- */}
            <div style={{display:'flex', gap:'10px', padding:'15px 20px 0 20px', flexWrap:'wrap'}}>
                
                <div onClick={()=>navigate('/profile')} style={actionBtn}>
                    <span style={{fontSize:'20px'}}>👤</span> Profile
                </div>
                
                <div onClick={()=>navigate('/history')} style={actionBtn}>
                    <span style={{fontSize:'20px'}}>📜</span> History
                </div>
                
                <div onClick={()=>navigate('/spin')} style={{...actionBtn, background:'#fff3e0', border:'1px solid #ffe0b2'}}>
                    <span style={{fontSize:'20px'}}>🎡</span> Spin
                </div>

                <div onClick={()=>navigate('/toss')} style={{...actionBtn, background:'#e8f5e9', border:'1px solid #c8e6c9'}}>
                    <span style={{fontSize:'20px'}}>🪙</span> Toss
                </div>

                {/* 🔥 REVIEW TASK BUTTON ADDED 🔥 */}
                <div onClick={()=>navigate('/review-task')} style={{...actionBtn, background:'#e0f7fa', border:'1px solid #b2ebf2'}}>
                    <span style={{fontSize:'20px'}}>⭐</span> Review
                </div>

                {/* 🔥 BIND WALLET BUTTON ADDED (NEW) 🔥 */}
                <div onClick={()=>navigate('/bind-wallet')} style={{...actionBtn, background:'#f3e5f5', border:'1px solid #e1bee7'}}>
                    <span style={{fontSize:'20px'}}>💳</span> Bind Wallet
                </div>
                
                <div onClick={openLiveChat} style={actionBtn}>
                    <span style={{fontSize:'20px'}}>💬</span> Support
                </div>
                
                <div onClick={openTelegram} style={{...actionBtn, background:'#e1f5fe', border:'1px solid #b3e5fc'}}>
                    <span style={{fontSize:'20px'}}>✈️</span> Channel
                </div>
            </div>

            {/* --- ACTIVE PLANS --- */}
            <div style={{padding:'20px 20px 0'}}>
                <h4 style={{margin:'0 0 10px 0', color:'#444', borderLeft:'4px solid #764ba2', paddingLeft:'10px'}}>📂 Active Plans</h4>
                
                {myPlans.length === 0 ? (
                    <p style={{fontSize:'12px', color:'#999', fontStyle:'italic'}}>No active plans found.</p>
                ) : (
                    <div style={{display:'flex', gap:'10px', overflowX:'auto', paddingBottom:'10px', scrollbarWidth:'none'}}>
                        {myPlans.map(plan => (
                            <div key={plan._id} style={{
                                minWidth:'150px', 
                                background:'white', 
                                padding:'12px', 
                                borderRadius:'12px', 
                                border:'1px solid #e0e0e0',
                                boxShadow:'0 2px 5px rgba(0,0,0,0.05)'
                            }}>
                                <b style={{color:'#764ba2', display:'block', marginBottom:'5px'}}>{plan.packageName}</b>
                                <div style={{fontSize:'11px', color:'#555'}}>Profit: ৳{plan.profitAmount}</div>
                                <div style={{fontSize:'10px', color:'green', marginTop:'5px'}}>● Running</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- PACKAGES --- */}
            <div style={{padding:'10px 20px'}}>
                <h3 style={{color:'#333', margin:'15px 0', borderLeft:'4px solid #ff9800', paddingLeft:'10px'}}>💎 VIP Packages</h3>
                
                {packages.map(pkg => (
                    <div key={pkg._id} style={{
                        background:'white', 
                        borderRadius:'15px', 
                        padding:'15px', 
                        marginBottom:'15px', 
                        boxShadow:'0 2px 8px rgba(0,0,0,0.05)',
                        display:'flex', 
                        alignItems:'center', 
                        gap:'15px', 
                        border:'1px solid #f0f0f0'
                    }}>
                        <div style={{width:'60px', height:'60px', borderRadius:'10px', overflow:'hidden', background:'#f5f5f5', flexShrink:0}}>
                            {pkg.image ? (
                                <img src={pkg.image} alt="icon" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                            ) : (
                                <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px'}}>🎁</div>
                            )}
                        </div>

                        <div style={{flex:1}}>
                            <h4 style={{margin:'0 0 5px 0', color:'#333'}}>
                                {pkg.title} <span style={{fontSize:'10px', background:'#e3f2fd', color:'#1565c0', padding:'2px 6px', borderRadius:'4px'}}>Lvl {pkg.level}</span>
                            </h4>
                            <div style={{fontSize:'12px', color:'#666'}}>
                                Daily: <b style={{color:'#2e7d32'}}>৳{pkg.dailyIncome}</b>
                            </div>
                        </div>

                        <button onClick={()=>buyPackage(pkg)} style={{
                            background:'linear-gradient(45deg, #ff9800, #f57c00)',
                            color:'white', border:'none', padding:'6px 15px', 
                            borderRadius:'20px', fontSize:'12px', cursor:'pointer', fontWeight:'bold'
                        }}>
                            Buy ৳{pkg.price}
                        </button>
                    </div>
                ))}
            </div>

            {/* --- BOTTOM MENU --- */}
            <div className="menu-bar">
                <div className="menu-item" onClick={()=>navigate('/dashboard')}>
                    <span style={{fontSize:'20px'}}>🏠</span>
                    <span style={{fontSize:'12px'}}>Home</span>
                </div>
                <div className="menu-item" onClick={()=>navigate('/deposit')}>
                    <span style={{fontSize:'20px'}}>💰</span>
                    <span style={{fontSize:'12px'}}>Deposit</span>
                </div>
                <div className="menu-item" onClick={()=>navigate('/withdraw')}>
                    <span style={{fontSize:'20px'}}>🏦</span>
                    <span style={{fontSize:'12px'}}>Withdraw</span>
                </div>
            </div>
        </div>
    );
}

const actionBtn = {
    flex: '1 1 30%', 
    background: 'white', 
    padding: '10px', 
    borderRadius: '10px', 
    textAlign: 'center', 
    fontSize: '12px', 
    fontWeight: 'bold', 
    color: '#555', 
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)', 
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px'
};

export default Dashboard;