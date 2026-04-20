import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); // Thêm state để hiện lỗi từ server
  
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // Gọi API xuống Backend
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Nếu Backend trả về thành công (HTTP status 200)
        console.log("Đăng nhập thành công:", data);
        setHasError(false);
        // Lưu thông tin user vào localStorage
        try {
          if (data.user) {
            localStorage.setItem('sps_user', JSON.stringify(data.user));
            
            // Chuyển hướng dựa trên role
            switch (data.user.role) {
              case 'admin':
                window.location.href = '/system-admin';
                break;
              case 'staff':
                window.location.href = '/qlhh';
                break;
              case 'user':
                window.location.href = '/user';
                break;
              default:
                // Mặc định chuyển về trang dashboard nếu role không xác định
                window.location.href = '/dashboard';
            }
          }
        } catch (e) { 
          console.error("Lỗi khi xử lý thông tin user:", e);
          setHasError(true);
          setErrorMsg('Có lỗi xảy ra sau khi đăng nhập.');
        }
      } else {
        // Nếu sai tài khoản hoặc lỗi (HTTP status 400, 401...)
        setHasError(true);
        setErrorMsg(data.message || 'Thông tin không chính xác!');
      }
    } catch (error) {
      console.error("Lỗi kết nối server:", error);
      setHasError(true);
      setErrorMsg('Không thể kết nối đến máy chủ!');
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <h2>Đăng nhập Admin</h2>
        
        <input 
          type="text" 
          placeholder="Tài khoản" 
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if(hasError) setHasError(false);
          }}
        />
        
        <input 
          type="password" 
          placeholder="Mật khẩu" 
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if(hasError) setHasError(false);
          }}
        />
        
        {hasError && <p className="error-msg">{errorMsg}</p>}
        
        <button onClick={handleLogin}>Đăng nhập</button>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          Chưa có tài khoản? <Link to="/register" style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: 'bold' }}>Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;