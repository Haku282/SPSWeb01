import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Thêm Navigate vào đây
import './App.css';

// Import các trang (Bạn có thể xóa import HomePage nếu không còn dùng nữa)
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Khi người dùng vào đường dẫn gốc "/", hệ thống tự động đẩy sang "/login" */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/qlhh" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;