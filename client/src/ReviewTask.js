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
    
    // 🔥 আপডেট: ইউজারের টাস্ক লিমিট দেখার জন্য স্টেট
    const [userData, setUserData] = useState({ dailyTaskCount: 0, taskLimit: 5 });

    // 🔥 প্রোডাকশন ব্যাকএন্ড ইউআরএল (Render URL)
    const API_BASE = "https://earning-api.onrender.com"; 

    useEffect(() => {
        if(!userId) {
            navigate('/');
        } else {
            fetchUserStatus(); // 🔥 পেজ লোড হলে স্ট্যাটাস চেক করবে
        }
    }, [userId, navigate]);

    // 🔥 ১. ইউজারের বর্তমান অবস্থা (কয়টা টাস্ক করেছে) জানার ফাংশন
    const fetchUserStatus = async () => {
        try {
            const res = await axios.get(`${API_BASE}/user/${userId}`);
            setUserData(res.data);
        } catch (e) {
            console.log("Error loading user data");
        }
    };

    // ২. র‍্যান্ডম টাস্ক আনা এবং শুরু করা
    const startTask = async () => {
        // 🔥 চেক: যদি লিমিট শেষ হয়ে যায়
        if (userData.dailyTaskCount >= userData.taskLimit) {
            return alert("✅ Daily Task Limit Reached! Come back tomorrow.");
        }

        setLoading(true);
        try {
            // 🔥 userId কুয়েরি প্যারামিটার হিসেবে পাঠানো হচ্ছে লিমিট চেক করার জন্য
            const res = await axios.get(`${API_BASE}/user/get-random-task?userId=${userId}`);
            
            if(res.data.success) {
                const task = res.data.task;
                setCurrentTask(task);
                
                // ৩. নতুন ট্যাবে গুগল ম্যাপ লিংক ওপেন করা
                window.open(task.link, '_blank');
                
                // ৪. টাইমার শুরু (১০ সেকেন্ড)
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
                // যদি টাস্ক লিমিট শেষ হয়ে যায় বা কোনো টাস্ক না থাকে
                alert(res.data.message || "No tasks available right now!");
            }
        } catch(e) { 
            alert("Error starting task. Please try again."); 
        }
        setLoading(false);
    };

    // ৫. টাকা ক্লেইম করা
    const claimReward = async () => {
        try {
            const res = await axios.post(`${API_BASE}/user/claim-review-reward`, {
                userId,
                amount: currentTask.reward
            });
            if(res.data.success) {
                alert(`Congratulation! You earned ৳${currentTask.reward}`);
                
                // 🔥 আপডেট: ক্লেইম করার পর ডাটা রিফ্রেশ এবং রিসেট
                setIsClaimable(false);
                setCurrentTask(null);
                fetchUserStatus(); // কাউন্টার আপডেট হবে
            } else {
                alert(res.data.message || "Claim failed");
            }
        } catch(e) { 
            alert("Connection Error during claim"); 
        }
    };

    return (
        <div style={{minHeight:'100vh', background:'#f4f6f8', padding:'20px', textAlign:'center', fontFamily:'sans-serif'}}>
            
            {/* ব্যাক বাটন */}
            <div style={{textAlign:'left'}}>
                 <button onClick={()=>navigate('/dashboard')} style={{border:'none', background:'transparent', fontSize:'20px', cursor:'pointer', color:'#555'}}>⬅ Back</button>
            </div>

            <h2 style={{color:'#333', marginTop:'10px'}}>Daily Review Task</h2>
            
            {/* 🔥 টাস্ক কাউন্টার শো করা */}
            <div style={{background:'#e0f7fa', padding:'10px', borderRadius:'8px', display:'inline-block', margin:'10px 0', color:'#006064', fontWeight:'bold'}}>
                Task Completed: {userData.dailyTaskCount} / {userData.taskLimit}
            </div>

            <div style={{background:'white', padding:'30px', borderRadius:'10px', boxShadow:'0 5px 15px rgba(0,0,0,0.1)', maxWidth:'400px', margin:'30px auto'}}>
                
                {/* আইকন বা ইমেজ */}
                <div style={{fontSize:'50px', marginBottom:'20px'}}>⭐</div>
                
                <h3>Earn Money by Reviewing</h3>
                <p style={{color:'#666'}}>Click start, give a 5-star review, wait 10 seconds, and verify.</p>

                {/* যদি সব টাস্ক শেষ হয়ে যায় */}
                {userData.dailyTaskCount >= userData.taskLimit ? (
                    <div style={{color:'green', fontWeight:'bold', fontSize:'18px', padding:'20px', border:'2px dashed green', borderRadius:'10px'}}>
                        🎉 All Tasks Done for Today!
                    </div>
                ) : (
                    <>
                        {!currentTask && (
                            <button onClick={startTask} disabled={loading} style={btnStyle}>
                                {loading ? "Loading..." : "🚀 START TASK NOW"}
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
                                    💰 CLAIM ৳{currentTask.reward}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
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