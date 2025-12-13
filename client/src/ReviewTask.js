import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ReviewTask = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0); // কাউন্টডাউন টাইমার
    const [currentTask, setCurrentTask] = useState(null);
    const [isClaimable, setIsClaimable] = useState(false);

    // 🔥 প্রোডাকশন ব্যাকএন্ড ইউআরএল (Render URL)
    const API_BASE = "https://earning-api.onrender.com"; 

    useEffect(() => {
        if(!userId) navigate('/');
    }, [userId, navigate]);

    // ১. র‍্যান্ডম টাস্ক আনা এবং শুরু করা
    const startTask = async () => {
        setLoading(true);
        try {
            // 🔥 userId কুয়েরি প্যারামিটার হিসেবে পাঠানো হচ্ছে লিমিট চেক করার জন্য
            const res = await axios.get(`${API_BASE}/user/get-random-task?userId=${userId}`);
            
            if(res.data.success) {
                const task = res.data.task;
                setCurrentTask(task);
                
                // ২. নতুন ট্যাবে গুগল ম্যাপ লিংক ওপেন করা
                window.open(task.link, '_blank');
                
                // ৩. টাইমার শুরু (১০ সেকেন্ড)
                setTimer(10);
                let timeLeft = 10;
                const interval = setInterval(() => {
                    timeLeft--;
                    setTimer(timeLeft);
                    if(timeLeft <= 0) {
                        clearInterval(interval);
                        setIsClaimable(true); // ১০ সেকেন্ড পর ক্লেইম বাটন আসবে
                    }
                }, 1000);
            } else {
                // যদি টাস্ক লিমিট শেষ হয়ে যায় বা কোনো টাস্ক না থাকে
                alert(res.data.message || "No tasks available right now!");
            }
        } catch(e) { 
            alert("Error starting task. Please try again."); 
        }
        setLoading(false);
    };

    // ৪. টাকা ক্লেইম করা
    const claimReward = async () => {
        try {
            const res = await axios.post(`${API_BASE}/user/claim-review-reward`, {
                userId,
                amount: currentTask.reward
            });
            if(res.data.success) {
                alert(`Congratulation! You earned ৳${currentTask.reward}`);
                navigate('/dashboard'); // ড্যাশবোর্ডে ফেরত
            } else {
                alert(res.data.message || "Claim failed");
            }
        } catch(e) { 
            alert("Connection Error during claim"); 
        }
    };

    return (
        <div style={{minHeight:'100vh', background:'#f4f6f8', padding:'20px', textAlign:'center', fontFamily:'sans-serif'}}>
            <h2 style={{color:'#333'}}>Google Map Review</h2>
            <div style={{background:'white', padding:'30px', borderRadius:'10px', boxShadow:'0 5px 15px rgba(0,0,0,0.1)', maxWidth:'400px', margin:'50px auto'}}>
                
                {/* আইকন বা ইমেজ */}
                <div style={{fontSize:'50px', marginBottom:'20px'}}>⭐</div>
                
                <h3>Earn Money by Reviewing</h3>
                <p style={{color:'#666'}}>Click start, give a 5-star review, wait 10 seconds, and verify.</p>

                {!currentTask && (
                    <button onClick={startTask} disabled={loading} style={btnStyle}>
                        {loading ? "Loading..." : "START TASK NOW"}
                    </button>
                )}

                {currentTask && timer > 0 && (
                    <div style={{marginTop:'20px'}}>
                        <h2 style={{color:'#e67e22'}}>Wait: {timer}s</h2>
                        <p>Checking your review...</p>
                    </div>
                )}

                {isClaimable && (
                    <div style={{marginTop:'20px'}}>
                        <h3 style={{color:'green'}}>Task Completed!</h3>
                        <button onClick={claimReward} style={{...btnStyle, background:'#27ae60'}}>
                            CLAIM ৳{currentTask.reward}
                        </button>
                    </div>
                )}
            </div>
            
            <button onClick={()=>navigate('/dashboard')} style={{marginTop:'20px', background:'none', border:'none', cursor:'pointer', color:'#555', fontSize:'16px'}}>⬅ Back to Home</button>
        </div>
    );
};

const btnStyle = {
    padding: '15px 30px',
    fontSize: '18px',
    background: '#2980b9',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    width: '100%',
    fontWeight: 'bold',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
};

export default ReviewTask;