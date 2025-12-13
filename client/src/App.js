import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// Component Imports
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Deposit from './Deposit';
import Withdraw from './Withdraw';
import Admin from './Admin';
import History from './History';
import Profile from './Profile';
import Spin from './Spin';
import Toss from './Toss';
import AdminLogin from './AdminLogin'; 
import Notifications from './Notifications'; 
import ReviewTask from './ReviewTask'; // 🔥 Review Task Import Added

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/deposit" element={<Deposit />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Notification Route */}
        <Route path="/notifications" element={<Notifications />} />

        {/* Game & Task Routes */}
        <Route path="/toss" element={<Toss />} />
        <Route path="/spin" element={<Spin />} />
        
        {/* 🔥 Review Task Route Added */}
        <Route path="/review-task" element={<ReviewTask />} />

        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} /> 
        <Route path="/admin" element={<Admin />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;