import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 

// Nhận prop toggleChat để mở chatbot và activePage để làm sáng menu
const Sidebar = ({ toggleChat, activePage }) => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('sps_user');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    // Confirm with backend session (authoritative) and keep cache in sync
    const load = async () => {
      try {
        const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL)
          ? import.meta.env.VITE_BACKEND_URL
          : 'http://localhost:5000';
          
        const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' });
        
        // Nếu API trả về lỗi (ví dụ 401: Chưa đăng nhập, session hết hạn), xóa luôn cache cũ
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('sps_user');
          }
          return;
        }
        
        const data = await res.json();
        setUser(data.user || null);
        try { localStorage.setItem('sps_user', JSON.stringify(data.user || {})); } catch (e) {}
      } catch (e) {
        // ignore, we may rely on cached value
      }
    };
    load();
  }, []);

  // Xử lý sự kiện đăng xuất
  const handleLogout = async (e) => {
    e.preventDefault(); // Ngăn chặn hành vi chuyển trang mặc định của thẻ <a>
    try {
      const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL)
        ? import.meta.env.VITE_BACKEND_URL
        : 'http://localhost:5000';
        
      // Gọi API logout để hủy session trên server
      await fetch(`${API_BASE}/api/auth/logout`, { 
        method: 'POST', // Chú ý: Backend của bạn đang cấu hình GET hay POST? Thường là POST, nhưng nếu GET thì đổi lại nhé
        credentials: 'include' 
      });
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    } finally {
      // Dù gọi API thành công hay thất bại, bắt buộc phải xóa localStorage
      localStorage.removeItem('sps_user');
      // Ép tải lại trang về trang chủ/đăng nhập để xóa sạch state
      window.location.href = '/'; 
    }
  };

  return (
    <div className="sidebar">
      <h2>Smart Pharma System</h2>
      
      <Link to="/dashboard" className={`menu-item ${activePage === 'dashboard' ? 'active' : ''}`}>
        <i className="fa fa-chart-line"></i> Dashboard
      </Link>
      
      <Link to="/qlhh" className={`menu-item ${activePage === 'qlhh' ? 'active' : ''}`}>
        <i className="fa fa-box"></i> Quản lý hàng hóa
      </Link>

      {user && user.role === 'admin' && (
        <Link to="/history" className={`menu-item ${activePage === 'history' ? 'active' : ''}`}>
          <i className="fa fa-history"></i> Lịch sử
        </Link>
      )}
      
      <hr style={{ opacity: 0.1, margin: '15px 0' }} />
      
      {/* Sửa lại nút Thoát để gọi hàm handleLogout */}
      <a href="/" onClick={handleLogout} className="menu-item" style={{ color: 'var(--danger)', cursor: 'pointer' }}>
        <i className="fa fa-sign-out-alt"></i> Thoát hệ thống
      </a>

      <div className="menu-item chatbot-btn" onClick={toggleChat} style={{ cursor: 'pointer' }}>
        <i className="fa fa-robot"></i> Hỗ trợ quản lý
      </div>

      {/* Hiển thị thông tin user cho cả Admin và Staff */}
      {user && (
        <div style={{ marginTop: '18px', padding: '10px', fontSize: '13px', color: '#aaa' }}>
          <div style={{ color: '#fff' }}><strong>{user.full_name || user.username}</strong></div>
          <div style={{ opacity: 0.85, textTransform: 'capitalize' }}>Vai trò: {user.role}</div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;