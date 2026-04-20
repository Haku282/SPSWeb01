import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import các trang
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage'; 
import HistoryPage from './pages/History';
import SystemAdminPage from './pages/SystemAdminPage';
import UserPage from './pages/UserPage';
import ProfilePage from './pages/ProfilePage';
import PurchaseHistoryPage from './pages/PurchaseHistoryPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Điều hướng mặc định - về trang UserPage */}
        <Route path="/" element={<Navigate to="/user" replace />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/history" element={<HistoryPage />} />
        
        {/* Cả 2 menu đều dẫn về AdminPage, logic hiển thị tab sẽ do AdminPage tự xử lý */}
        <Route path="/qlhh" element={<AdminPage />} />
        <Route path="/qlnhapkho" element={<AdminPage />} />
        <Route path="/qlxuatkho" element={<AdminPage />} /> {/* Thêm dòng này */}
        
        <Route path="/system-admin" element={<SystemAdminPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/purchase-history" element={<PurchaseHistoryPage />} />
      </Routes>
    </Router>
  );
}

export default App;