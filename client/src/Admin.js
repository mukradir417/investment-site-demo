import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Admin = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('requests'); 

    // 🔥 PROD URL
    const API_BASE = "https://earning-api.onrender.com"; 

    // --- STATES ---
    const [headline, setHeadline] = useState("");
    const [telegramLink, setTelegramLink] = useState("");
    const [bkashNumbers, setBkashNumbers] = useState([]); 
    const [nagadNumbers, setNagadNumbers] = useState([]);
    const [binanceAddress, setBinanceAddress] = useState([]);
    
    // Inputs for Settings
    const [newBkash, setNewBkash] = useState("");
    const [newBkashType, setNewBkashType] = useState("Personal"); 

    const [newNagad, setNewNagad] = useState("");
    const [newNagadType, setNewNagadType] = useState("Personal");

    const [newBinance, setNewBinance] = useState("");

    // Users & Requests
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ name: '', mobile: '', email: '', password: '' });
    
    // Edit User States
    const [editingUser, setEditingUser] = useState(null); 
    const [editPass, setEditPass] = useState("");
    const [editPin, setEditPin] = useState("");
    
    // 🔥 NEW STATE: Permission Checkbox
    const [canBypass, setCanBypass] = useState(false);

    const [deposits, setDeposits] = useState([]);
    const [withdraws, setWithdraws] = useState([]);

    // 🔥 VIP PACKAGE STATES
    const [packages, setPackages] = useState([]);
    const [newPackage, setNewPackage] = useState({ title: '', price: '', dailyIncome: '', level: 1, image: '' });

    // Notification & Games
    const [notifMessage, setNotifMessage] = useState("");
    const [targetUserId, setTargetUserId] = useState("");
    const [globalBonus, setGlobalBonus] = useState(0);
    const [giftSpins, setGiftSpins] = useState(0);
    const [spinWinAmount, setSpinWinAmount] = useState(0);
    const [tossResult, setTossResult] = useState("Head");

    // Review Task
    const [reviewLink, setReviewLink] = useState("");
    const [reviewReward, setReviewReward] = useState(5);
    const [reviewTasks, setReviewTasks] = useState([]);
    const [manualLimit, setManualLimit] = useState(""); 

    // --- INIT ---
    useEffect(() => {
        const isAuthenticated = localStorage.getItem('adminAuth');
        if (isAuthenticated !== 'true') {
            navigate('/admin-login');
        } else {
            if(activeTab === 'requests') fetchRequests();
            if(activeTab === 'users') fetchUsers();
            if(activeTab === 'payment' || activeTab === 'general') fetchSettings();
            if(activeTab === 'reviews') fetchReviewTasks(); 
            if(activeTab === 'packages') fetchPackages();
        }
    }, [navigate, activeTab]);

    // --- FETCH FUNCTIONS ---
    const fetchSettings = async () => {
        try {
            const res = await axios.get(`${API_BASE}/admin/settings`);
            if(res.data) {
                setHeadline(res.data.headline || "");
                setTelegramLink(res.data.telegramLink || "");
                setBkashNumbers(res.data.bkash || []); 
                setNagadNumbers(res.data.nagad || []);
                setBinanceAddress(res.data.binance || []);
            }
        } catch (e) { }
    };
    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_BASE}/admin/users`);
            setUsers(res.data.reverse());
        } catch (e) { }
    };
    const fetchRequests = async () => {
        try {
            const d = await axios.get(`${API_BASE}/admin/deposits`);
            setDeposits(d.data);
            const w = await axios.get(`${API_BASE}/admin/withdrawals`);
            setWithdraws(w.data);
        } catch (e) { }
    };
    const fetchPackages = async () => {
        try {
            const res = await axios.get(`${API_BASE}/tasks`);
            setPackages(res.data);
        } catch (e) { }
    };
    const fetchReviewTasks = async () => {
        try {
            const res = await axios.get(`${API_BASE}/admin/review-tasks`);
            setReviewTasks(res.data);
        } catch (e) { }
    };

    // --- HANDLERS ---
    
    // 🔥 VIP PACKAGE HANDLERS
    const handleAddPackage = async () => {
        if(!newPackage.title || !newPackage.price) return alert("Title and Price required");
        try {
            await axios.post(`${API_BASE}/admin/add-task`, newPackage); 
            alert("Package Added!");
            setNewPackage({ title: '', price: '', dailyIncome: '', level: 1, image: '' });
            fetchPackages();
        } catch(e) { alert("Failed to add package"); }
    };

    const deletePackage = async (id) => {
        if(window.confirm("Delete this package?")) {
            await axios.post(`${API_BASE}/admin/delete-task`, { id });
            fetchPackages();
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewPackage({ ...newPackage, image: reader.result });
        };
        if(file) reader.readAsDataURL(file);
    };

    const startEditUser = (user) => {
        setEditingUser(user);
        setEditPass(user.password); 
        setEditPin(user.withdrawPin);
        // 🔥 পারমিশন লোড করা হচ্ছে
        setCanBypass(user.canWithdrawWithoutTasks || false);
        window.scrollTo(0,0);
    };

    const saveUserEdit = async () => {
        if(!editingUser) return;
        try {
            await axios.post(`${API_BASE}/admin/update-user-profile`, {
                userId: editingUser._id,
                password: editPass,
                withdrawPin: editPin,
                // 🔥 পারমিশন পাঠানো হচ্ছে
                canWithdrawWithoutTasks: canBypass 
            });
            alert("✅ User Info Updated!");
            setEditingUser(null);
            fetchUsers();
        } catch(e) { alert("Failed to update"); }
    };

    const handleDeposit = async (id, action) => {
        const url = action === 'approve' ? 'approve-deposit' : 'reject-deposit';
        if(window.confirm(`Confirm ${action}?`)) {
            await axios.post(`${API_BASE}/admin/${url}`, { depositId: id });
            fetchRequests();
        }
    };

    const handleWithdraw = async (id, action) => {
        const url = action === 'approve' ? 'approve-withdraw' : 'reject-withdraw';
        if(window.confirm(`Confirm ${action}?`)) {
            await axios.post(`${API_BASE}/admin/${url}`, { withdrawId: id });
            fetchRequests();
        }
    };

    const sendNotification = async (type) => {
        if(!notifMessage) return alert("Empty Message!");
        await axios.post(`${API_BASE}/admin/send-notification`, { type, userId: targetUserId, message: notifMessage });
        alert("Sent!"); setNotifMessage("");
    };

    const sendGlobalBonus = async () => {
        if(window.confirm(`Give ৳${globalBonus} to ALL users?`)) {
            await axios.post(`${API_BASE}/admin/send-bonus`, { amount: globalBonus });
            alert("Bonus Sent!"); setGlobalBonus(0);
        }
    };

    // 🔥 UPDATED PAYMENT HANDLERS
    const addNumber = async (method, number, type) => {
        if(!number) return alert("Enter number/address");
        try {
            const res = await axios.post(`${API_BASE}/admin/add-number`, { method, number, type });
            if(res.data.success) {
                alert("Successfully Added!");
                if(method==='bkash') setNewBkash(""); 
                if(method==='nagad') setNewNagad(""); 
                if(method==='binance') setNewBinance("");
                fetchSettings();
            }
        } catch(e) { alert("Error adding number"); }
    };

    const deleteNumber = async (method, id) => {
        if(window.confirm("Delete this number?")) {
            try {
                const res = await axios.post(`${API_BASE}/admin/delete-number`, { method, numberId: id });
                if(res.data.success) fetchSettings();
                else alert("Delete Failed");
            } catch(e) { alert("Error deleting"); }
        }
    };

    const updateGeneral = async () => {
        await axios.post(`${API_BASE}/admin/update-settings`, { headline, telegramLink });
        alert("Settings Updated!");
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        const res = await axios.post(`${API_BASE}/admin/create-user`, newUser);
        if(res.data.success) { alert("Created!"); setNewUser({ name: '', mobile: '', email: '', password: '' }); fetchUsers(); }
    };

    const handleUpdateBalance = async (userId, amount) => {
        const val = prompt(`Enter Amount to ADD (use - for cut). Current: ${amount}`);
        if(val) { await axios.post(`${API_BASE}/admin/update-balance`, { userId, amount: val }); fetchUsers(); }
    };

    const handleDeleteUser = async (id) => {
        if(window.confirm("Delete User?")) { await axios.delete(`${API_BASE}/admin/user/${id}`); fetchUsers(); }
    };
    
    const handleGameAction = async (action) => {
        if(!targetUserId) return alert("Enter User ID");
        let url = action === 'spin' ? 'gift-spins' : action === 'win' ? 'set-user-win' : 'set-toss-result';
        let body = { userId: targetUserId };
        if(action === 'spin') body.spins = giftSpins;
        if(action === 'win') body.amount = spinWinAmount;
        if(action === 'toss') body.result = tossResult;
        await axios.post(`${API_BASE}/admin/${url}`, body);
        alert("Success!");
    };

    const addReviewTask = async () => {
        if(!reviewLink) return alert("Enter Link");
        await axios.post(`${API_BASE}/admin/add-review-task`, { link: reviewLink, reward: reviewReward });
        alert("Task Added!"); setReviewLink(""); fetchReviewTasks();
    };

    const deleteReviewTask = async (id) => {
        if(window.confirm("Delete?")) { await axios.post(`${API_BASE}/admin/delete-review-task`, { id }); fetchReviewTasks(); }
    };

    const handleSetTaskLimit = async () => {
        if(!targetUserId || !manualLimit) return alert("Enter User ID and Limit Amount");
        try {
            await axios.post(`${API_BASE}/admin/set-task-limit`, { userId: targetUserId, limit: manualLimit });
            alert(`✅ User limit set to ${manualLimit}!`); setManualLimit("");
        } catch (e) { alert("Failed to set limit"); }
    };
    
    const handleLogout = () => { localStorage.removeItem('adminAuth'); navigate('/admin-login'); };


    return (
        <div style={{fontFamily:'Segoe UI, sans-serif', display:'flex', height:'100vh', overflow:'hidden', background:'#f4f6f8'}}>
            
            {/* SIDEBAR */}
            <div style={{width:'260px', background:'#1e272e', color:'white', padding:'20px', display:'flex', flexDirection:'column', flexShrink:0}}>
                <h2 style={{textAlign:'center', color:'#ffdd59', marginBottom:'30px', borderBottom:'1px solid #444', paddingBottom:'20px'}}>ADMIN PANEL</h2>
                
                <button onClick={()=>setActiveTab('requests')} style={activeTab==='requests'?activeBtn:inactiveBtn}>📝 Requests {deposits.length+withdraws.length > 0 && <span style={badge}>{deposits.length+withdraws.length}</span>}</button>
                <button onClick={()=>setActiveTab('notifications')} style={activeTab==='notifications'?activeBtn:inactiveBtn}>🔔 Notify & Gift</button>
                <button onClick={()=>setActiveTab('users')} style={activeTab==='users'?activeBtn:inactiveBtn}>👥 Users</button>
                <button onClick={()=>setActiveTab('packages')} style={activeTab==='packages'?activeBtn:inactiveBtn}>💎 VIP Packages</button>
                <button onClick={()=>setActiveTab('payment')} style={activeTab==='payment'?activeBtn:inactiveBtn}>💰 Payment</button>
                <button onClick={()=>setActiveTab('games')} style={activeTab==='games'?activeBtn:inactiveBtn}>🎮 Games</button>
                <button onClick={()=>setActiveTab('reviews')} style={activeTab==='reviews'?activeBtn:inactiveBtn}>⭐ Review Tasks</button> 
                <button onClick={()=>setActiveTab('general')} style={activeTab==='general'?activeBtn:inactiveBtn}>⚙️ Settings</button>
                
                <button onClick={handleLogout} style={{marginTop:'auto', background:'#e55039', ...btnBase}}>Logout</button>
            </div>

            {/* CONTENT AREA */}
            <div style={{flex:1, padding:'40px', overflowY:'auto'}}>
                
                {/* --- TAB: VIP PACKAGES --- */}
                {activeTab === 'packages' && (
                    <div>
                        <h1>Manage VIP Packages</h1>
                        <div style={cardStyle}>
                            <h3>➕ Add New VIP Package</h3>
                            <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                                <input placeholder="Title (VIP 1)" value={newPackage.title} onChange={e=>setNewPackage({...newPackage, title:e.target.value})} style={bigInput} />
                                
                                <div style={{width:'100%'}}>
                                    <label style={{fontWeight:'bold', color:'#555'}}>Select Level:</label>
                                    <select 
                                        value={newPackage.level} 
                                        onChange={e=>setNewPackage({...newPackage, level: Number(e.target.value)})} 
                                        style={{...bigInput, cursor:'pointer', border:'2px solid #ff9800'}}
                                    >
                                        {[...Array(21).keys()].map((num) => (
                                            <option key={num} value={num}>VIP Level {num}</option>
                                        ))}
                                    </select>
                                </div>

                                <input placeholder="Price (৳)" type="number" value={newPackage.price} onChange={e=>setNewPackage({...newPackage, price:e.target.value})} style={bigInput} />
                                <input placeholder="Daily Income (৳)" type="number" value={newPackage.dailyIncome} onChange={e=>setNewPackage({...newPackage, dailyIncome:e.target.value})} style={bigInput} />
                                
                                <div style={{width:'100%', marginBottom:'10px'}}>
                                    <label>Package Image:</label><br/>
                                    <input type="file" onChange={handleImageUpload} accept="image/*" />
                                </div>
                                <button onClick={handleAddPackage} style={{...bigBtn, background:'#ff9800', width:'100%'}}>Save VIP Package</button>
                            </div>
                        </div>

                        <div style={{marginTop:'30px'}}>
                            <h3>Active VIP List</h3>
                            {packages.map(pkg => (
                                <div key={pkg._id} style={listItem}>
                                    <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                                        <img src={pkg.image} alt="vip" style={{width:'50px', height:'50px', borderRadius:'8px', objectFit:'cover', background:'#eee'}} />
                                        <div>
                                            <b style={{color:'#d35400'}}>VIP {pkg.level}</b> - <b>{pkg.title}</b> <br/>
                                            Price: ৳{pkg.price} | Daily: ৳{pkg.dailyIncome}
                                        </div>
                                    </div>
                                    <button onClick={()=>deletePackage(pkg._id)} style={delBtn}>Remove</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- TAB: USERS --- */}
                {activeTab === 'users' && (
                    <div>
                        <h1>User Management</h1>
                        {editingUser && (
                            <div style={{background:'#fff3cd', padding:'30px', borderRadius:'10px', marginBottom:'30px', border:'2px solid #ffecb5', boxShadow:'0 5px 15px rgba(0,0,0,0.1)'}}>
                                <h3 style={{color:'#856404', marginTop:0}}>✏️ Reset Pass/PIN for: {editingUser.name}</h3>
                                <div style={{display:'flex', gap:'20px'}}>
                                    <div style={{flex:1}}>
                                        <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>New Password:</label>
                                        <input value={editPass} onChange={e=>setEditPass(e.target.value)} style={bigInput} />
                                    </div>
                                    <div style={{flex:1}}>
                                        <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Withdraw PIN:</label>
                                        <input value={editPin} onChange={e=>setEditPin(e.target.value)} style={bigInput} />
                                    </div>
                                </div>

                                {/* 🔥 NEW: Permission Checkbox Added Here */}
                                <div style={{marginTop:'15px', background:'white', padding:'10px', borderRadius:'5px', border:'1px solid #ddd'}}>
                                    <label style={{cursor:'pointer', display:'flex', alignItems:'center', gap:'10px', fontWeight:'bold', fontSize:'16px', color:'#d35400'}}>
                                        <input 
                                            type="checkbox" 
                                            checked={canBypass} 
                                            onChange={e=>setCanBypass(e.target.checked)} 
                                            style={{width:'20px', height:'20px'}}
                                        />
                                        Allow Withdraw Without Completing Tasks?
                                    </label>
                                </div>

                                <div style={{marginTop:'20px', display:'flex', gap:'15px'}}>
                                    <button onClick={saveUserEdit} style={{...bigBtn, background:'#28a745'}}>SAVE CHANGES</button>
                                    <button onClick={()=>setEditingUser(null)} style={{...bigBtn, background:'#6c757d'}}>CANCEL</button>
                                </div>
                            </div>
                        )}
                        <div style={cardStyle}>
                            <h3>➕ Create User</h3>
                            <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                                <input placeholder="Name" value={newUser.name} onChange={e=>setNewUser({...newUser, name:e.target.value})} style={bigInput} />
                                <input placeholder="Mobile" value={newUser.mobile} onChange={e=>setNewUser({...newUser, mobile:e.target.value})} style={bigInput} />
                                <input placeholder="Email" value={newUser.email} onChange={e=>setNewUser({...newUser, email:e.target.value})} style={bigInput} />
                                <input placeholder="Pass" value={newUser.password} onChange={e=>setNewUser({...newUser, password:e.target.value})} style={bigInput} />
                                <button onClick={handleCreateUser} style={{...bigBtn, background:'#00b894', width:'100%'}}>Create Account</button>
                            </div>
                        </div>
                        <div style={{marginTop:'20px'}}>
                            {users.map(u=>(
                                <div key={u._id} style={{...listItem, borderLeft:'6px solid #764ba2', background:'white'}}>
                                    <div style={{flex:1}}>
                                        <b>{u.name}</b> ({u.mobile}) <br/>
                                        <div style={{marginTop:'10px', background:'#f8f9fa', padding:'10px', borderRadius:'8px', display:'inline-block', border:'1px dashed #ccc'}}>
                                            🔑 <b>Pass:</b> <span style={{color:'blue'}}>{u.password}</span> | 🔒 <b>PIN:</b> <span style={{color:'red'}}>{u.withdrawPin}</span> | 💰 <b>Bal:</b> <span style={{color:'green'}}>৳{u.balance}</span>
                                        </div> <br/>
                                        <small style={{color:'#999'}}>ID: {u._id}</small>
                                        
                                        {/* Show Badge if allowed */}
                                        {u.canWithdrawWithoutTasks && (
                                            <span style={{marginLeft:'10px', background:'#27ae60', color:'white', padding:'2px 5px', borderRadius:'3px', fontSize:'10px'}}>
                                                NO TASK LIMIT
                                            </span>
                                        )}
                                    </div>
                                    <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
                                        <button onClick={()=>startEditUser(u)} style={{...actionBtn, background:'#f39c12'}}>Edit</button>
                                        <button onClick={()=>handleUpdateBalance(u._id, u.balance)} style={actionBtn}>Fund</button>
                                        <button onClick={()=>handleDeleteUser(u._id)} style={{...actionBtn, background:'red'}}>Del</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- TAB: REQUESTS --- */}
                {activeTab === 'requests' && (
                    <div>
                        <h1>Pending Requests</h1>
                        <div style={cardStyle}>
                            <h3 style={{color:'#27ae60'}}>📥 Deposits ({deposits.length})</h3>
                            {deposits.length===0 ? <p>No deposits.</p> : deposits.map(d=>(
                                <div key={d._id} style={listItem}>
                                    <div>
                                        <b>{d.userName}</b> sent <b style={{color:'green'}}>৳{d.amount}</b> via {d.method} <br/>
                                        <small>Trx: {d.trxId}</small> <br/>
                                        <div style={{marginTop:'5px', background:'#eee', padding:'5px', borderRadius:'5px', fontSize:'13px'}}>
                                            📩 From: <b>{d.senderId || "Not Provided"}</b>
                                        </div>
                                    </div>
                                    <div>
                                        <button onClick={()=>handleDeposit(d._id,'approve')} style={{...actionBtn, background:'#27ae60'}}>✔</button>
                                        <button onClick={()=>handleDeposit(d._id,'reject')} style={{...actionBtn, background:'#e74c3c'}}>✘</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{...cardStyle, marginTop:'20px'}}>
                            <h3 style={{color:'#c0392b'}}>📤 Withdraws ({withdraws.length})</h3>
                            {withdraws.length===0 ? <p>No withdrawals.</p> : withdraws.map(w=>(
                                <div key={w._id} style={listItem}>
                                    <div><b>{w.userName}</b> wants <b style={{color:'red'}}>৳{w.amount}</b> to {w.method} <br/><small>Num: {w.number}</small></div>
                                    <div>
                                        <button onClick={()=>handleWithdraw(w._id,'approve')} style={{...actionBtn, background:'#27ae60'}}>Pay</button>
                                        <button onClick={()=>handleWithdraw(w._id,'reject')} style={{...actionBtn, background:'#e74c3c'}}>Return</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- TAB: NOTIFICATIONS --- */}
                {activeTab === 'notifications' && (
                    <div>
                        <h1>Notify & Bonus</h1>
                        <div style={cardStyle}>
                            <h3>🔔 Send Message</h3>
                            <textarea value={notifMessage} onChange={e=>setNotifMessage(e.target.value)} placeholder="Type message..." style={{...bigInput, height:'100px'}} />
                            <div style={{marginTop:'15px'}}><input value={targetUserId} onChange={e=>setTargetUserId(e.target.value)} placeholder="User ID (Optional)" style={bigInput} /></div>
                            <div style={{marginTop:'15px', display:'flex', gap:'10px'}}>
                                <button onClick={()=>sendNotification('single')} style={{...bigBtn, background:'#0984e3'}}>Send One</button>
                                <button onClick={()=>sendNotification('global')} style={{...bigBtn, background:'#e17055'}}>Send ALL</button>
                            </div>
                        </div>
                        <div style={{...cardStyle, marginTop:'20px', borderLeft:'5px solid #8e44ad'}}>
                            <h3 style={{color:'#8e44ad'}}>🎁 Global Money Gift</h3>
                            <div style={{display:'flex', gap:'10px'}}>
                                <input type="number" value={globalBonus} onChange={e=>setGlobalBonus(e.target.value)} placeholder="Amount (Tk)" style={bigInput} />
                                <button onClick={sendGlobalBonus} style={{...bigBtn, background:'#8e44ad'}}>SEND TO EVERYONE</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: PAYMENT (UPDATED UI WITH TYPE SELECTOR) --- */}
                {activeTab === 'payment' && (
                    <div>
                        <h1 style={{color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px'}}>💳 Payment Settings</h1>
                        
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px'}}>
                            
                            {/* BKASH CARD */}
                            <div style={paymentCardStyle}>
                                <div style={{background: '#e2136e', padding: '15px', borderRadius: '10px 10px 0 0', color: 'white', display:'flex', justifyContent:'space-between'}}>
                                    <h3 style={{margin:0}}>🚀 Bkash</h3>
                                    <span>{bkashNumbers.length} Active</span>
                                </div>
                                <div style={{padding: '20px'}}>
                                    <div style={{display:'flex', gap:'5px', marginBottom:'15px'}}>
                                        {/* 🔥 বড় ইনপুট */}
                                        <input 
                                            value={newBkash} 
                                            onChange={e=>setNewBkash(e.target.value)} 
                                            placeholder="017xxxxxxxx" 
                                            style={giantInput} 
                                        />
                                        {/* 🔥 নতুন ড্রপডাউন */}
                                        <select 
                                            value={newBkashType} 
                                            onChange={e=>setNewBkashType(e.target.value)} 
                                            style={giantSelect}
                                        >
                                            <option value="Personal">Personal</option>
                                            <option value="Agent">Agent</option>
                                            <option value="Merchant">Merchant</option>
                                            <option value="Cashout">Cashout</option>
                                        </select>
                                        <button onClick={()=>addNumber('bkash',newBkash, newBkashType)} style={addBtn}>+</button>
                                    </div>
                                    <div style={listContainer}>
                                        {bkashNumbers.map((n, i) => (
                                            <div key={n._id || i} style={paymentItem}>
                                                <div>
                                                    <span style={{fontWeight:'bold', color:'#333', fontSize:'18px'}}>{n.number || n}</span>
                                                    {n.type && <span style={{marginLeft:'8px', fontSize:'12px', background:'#eee', padding:'2px 6px', borderRadius:'4px'}}>{n.type}</span>}
                                                </div>
                                                <button onClick={()=>deleteNumber('bkash', n._id)} style={trashBtn}>🗑️</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* NAGAD CARD */}
                            <div style={paymentCardStyle}>
                                <div style={{background: '#f68c1f', padding: '15px', borderRadius: '10px 10px 0 0', color: 'white', display:'flex', justifyContent:'space-between'}}>
                                    <h3 style={{margin:0}}>🔥 Nagad</h3>
                                    <span>{nagadNumbers.length} Active</span>
                                </div>
                                <div style={{padding: '20px'}}>
                                    <div style={{display:'flex', gap:'5px', marginBottom:'15px'}}>
                                        {/* 🔥 বড় ইনপুট */}
                                        <input 
                                            value={newNagad} 
                                            onChange={e=>setNewNagad(e.target.value)} 
                                            placeholder="018xxxxxxxx" 
                                            style={giantInput} 
                                        />
                                        {/* 🔥 নতুন ড্রপডাউন */}
                                        <select 
                                            value={newNagadType} 
                                            onChange={e=>setNewNagadType(e.target.value)} 
                                            style={giantSelect}
                                        >
                                            <option value="Personal">Personal</option>
                                            <option value="Agent">Agent</option>
                                            <option value="Merchant">Merchant</option>
                                            <option value="Cashout">Cashout</option>
                                        </select>
                                        <button onClick={()=>addNumber('nagad',newNagad, newNagadType)} style={addBtn}>+</button>
                                    </div>
                                    <div style={listContainer}>
                                        {nagadNumbers.map((n, i) => (
                                            <div key={n._id || i} style={paymentItem}>
                                                <div>
                                                    <span style={{fontWeight:'bold', color:'#333', fontSize:'18px'}}>{n.number || n}</span>
                                                    {n.type && <span style={{marginLeft:'8px', fontSize:'12px', background:'#eee', padding:'2px 6px', borderRadius:'4px'}}>{n.type}</span>}
                                                </div>
                                                <button onClick={()=>deleteNumber('nagad', n._id)} style={trashBtn}>🗑️</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* BINANCE CARD */}
                            <div style={paymentCardStyle}>
                                <div style={{background: '#f3ba2f', padding: '15px', borderRadius: '10px 10px 0 0', color: 'black', display:'flex', justifyContent:'space-between'}}>
                                    <h3 style={{margin:0}}>🔶 Binance</h3>
                                    <span>{binanceAddress.length} Active</span>
                                </div>
                                <div style={{padding: '20px'}}>
                                    <div style={{display:'flex', gap:'5px', marginBottom:'15px'}}>
                                        <input value={newBinance} onChange={e=>setNewBinance(e.target.value)} placeholder="Wallet Address" style={giantInput} />
                                        <button onClick={()=>addNumber('binance',newBinance, 'Wallet')} style={addBtn}>+</button>
                                    </div>
                                    <div style={listContainer}>
                                        {binanceAddress.map((n, i) => (
                                            <div key={n._id || i} style={paymentItem}>
                                                <span style={{fontWeight:'bold', color:'#333', fontSize:'12px', wordBreak:'break-all'}}>{n.address || n}</span>
                                                <button onClick={()=>deleteNumber('binance', n._id)} style={trashBtn}>🗑️</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {activeTab === 'general' && (
                    <div>
                        <h1>App Settings</h1>
                        <div style={cardStyle}>
                            <label style={{fontSize:'18px', fontWeight:'bold'}}>News Headline:</label>
                            <input value={headline} onChange={e=>setHeadline(e.target.value)} style={{...bigInput, marginTop:'10px'}} />
                            <label style={{marginTop:'20px', display:'block', fontSize:'18px', fontWeight:'bold'}}>Telegram Link:</label>
                            <input value={telegramLink} onChange={e=>setTelegramLink(e.target.value)} style={{...bigInput, marginTop:'10px'}} />
                            <button onClick={updateGeneral} style={{...bigBtn, marginTop:'25px', background:'#2c3e50', width:'100%'}}>Save All Settings</button>
                        </div>
                    </div>
                )}

                {/* --- TAB: GAMES --- */}
                {activeTab === 'games' && (
                    <div>
                        <h1>Game Control</h1>
                        <div style={cardStyle}>
                            <label>Target User ID:</label>
                            <input value={targetUserId} onChange={e=>setTargetUserId(e.target.value)} placeholder="Paste User ID Here" style={bigInput} />
                            
                            <div style={{marginTop:'20px', border:'1px solid #ddd', padding:'20px', borderRadius:'10px', background:'#fff9c4'}}>
                                <h3>🪙 Set Toss Result</h3>
                                <div style={{display:'flex', gap:'10px'}}>
                                    <select value={tossResult} onChange={e=>setTossResult(e.target.value)} style={bigInput}>
                                        <option value="Head">Head (Win)</option>
                                        <option value="Tail">Tail (Lose)</option>
                                    </select>
                                    <button onClick={()=>handleGameAction('toss')} style={{...bigBtn, background:'#f1c40f', color:'black'}}>Set Toss</button>
                                </div>
                            </div>

                            <div style={{display:'flex', gap:'20px', marginTop:'20px'}}>
                                <div style={{flex:1, background:'#e1f5fe', padding:'20px', borderRadius:'10px'}}>
                                    <h4>🎡 Gift Spins</h4>
                                    <input type="number" value={giftSpins} onChange={e=>setGiftSpins(e.target.value)} style={bigInput} placeholder="Qty" />
                                    <button onClick={()=>handleGameAction('spin')} style={{...bigBtn, width:'100%', marginTop:'10px'}}>Send Spins</button>
                                </div>
                                <div style={{flex:1, background:'#fce4ec', padding:'20px', borderRadius:'10px'}}>
                                    <h4>🎯 Set Next Spin Win</h4>
                                    <input type="number" value={spinWinAmount} onChange={e=>setSpinWinAmount(e.target.value)} style={bigInput} placeholder="Amount" />
                                    <button onClick={()=>handleGameAction('win')} style={{...bigBtn, width:'100%', marginTop:'10px', background:'#d81b60'}}>Set Win</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: REVIEWS --- */}
                {activeTab === 'reviews' && (
                    <div>
                        <h1>Manage Review Tasks</h1>
                        <div style={cardStyle}>
                            <h3>➕ Add Map Link</h3>
                            <input value={reviewLink} onChange={e=>setReviewLink(e.target.value)} placeholder="Paste Link" style={bigInput} />
                            <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                                <input type="number" value={reviewReward} onChange={e=>setReviewReward(e.target.value)} style={bigInput} />
                                <button onClick={addReviewTask} style={bigBtn}>Add Task</button>
                            </div>
                        </div>
                        <div style={{...cardStyle, marginTop:'20px', borderLeft:'5px solid #e67e22'}}>
                            <h3>⚡ Set User Task Limit</h3>
                            <input value={targetUserId} onChange={e=>setTargetUserId(e.target.value)} placeholder="User ID" style={bigInput} />
                            <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                                <input type="number" value={manualLimit} onChange={e=>setManualLimit(e.target.value)} placeholder="Qty" style={bigInput} />
                                <button onClick={handleSetTaskLimit} style={{...bigBtn, background:'#e67e22'}}>Set Limit</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

// --- STYLES ---
const btnBase = { border:'none', padding:'12px', cursor:'pointer', borderRadius:'5px', color:'white', fontWeight:'bold', fontSize:'15px' };
const activeBtn = { ...btnBase, background:'#34495e', borderLeft:'5px solid #ffdd59', textAlign:'left', marginBottom:'5px', width:'100%' };
const inactiveBtn = { ...btnBase, background:'transparent', color:'#ccc', textAlign:'left', marginBottom:'5px', width:'100%' };
const badge = { background:'#e55039', color:'white', padding:'2px 8px', borderRadius:'10px', fontSize:'12px', float:'right' };
const cardStyle = { background:'white', padding:'30px', borderRadius:'10px', boxShadow:'0 5px 15px rgba(0,0,0,0.05)' };
const bigInput = { width: '100%', padding: '15px 20px', fontSize: '18px', borderRadius: '8px', border: '2px solid #dfe6e9', outline: 'none', marginBottom: '5px', color: '#333', boxSizing:'border-box' };
const bigBtn = { ...btnBase, padding: '15px 25px', fontSize: '16px', background: '#0984e3' };
const listItem = { padding:'20px', background:'#f1f2f6', borderBottom:'1px solid #dfe6e9', display:'flex', justifyContent:'space-between', alignItems:'center', borderRadius:'8px', marginBottom:'15px' };
const delBtn = { padding:'8px 15px', background:'#e74c3c', color:'white', border:'none', borderRadius:'5px', cursor:'pointer' };
const actionBtn = { padding:'8px 15px', margin:'0 5px', border:'none', borderRadius:'5px', cursor:'pointer', color:'white', background:'#0984e3', fontSize:'13px', width:'100px' };

// 🔥 NEW PAYMENT STYLES
const paymentCardStyle = { background: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' };
// বড় ইনপুট বক্স
const giantInput = { flex: 2, padding: '15px', border: '2px solid #ddd', borderRadius: '5px', outline: 'none', fontSize: '20px', height: '55px', boxSizing: 'border-box' };
// ড্রপডাউন স্টাইল
const giantSelect = { flex: 1, padding: '10px', border: '2px solid #ddd', borderRadius: '5px', outline: 'none', fontSize: '16px', height: '55px', cursor: 'pointer', background: '#f9f9f9' };
const modernInput = { flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '5px', outline: 'none', fontSize: '18px' };
const addBtn = { padding: '10px 15px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '20px', height: '55px' };
const listContainer = { maxHeight: '250px', overflowY: 'auto' };
const paymentItem = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa', padding: '10px', borderRadius: '5px', marginBottom: '8px', borderLeft: '4px solid #bdc3c7' };
const trashBtn = { background: '#ff7675', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' };

export default Admin;