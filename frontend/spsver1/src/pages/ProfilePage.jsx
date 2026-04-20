import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

function ProfilePage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) 
    ? import.meta.env.VITE_BACKEND_URL 
    : 'http://localhost:5000';

  // Form states
  const [editForm, setEditForm] = useState({
    full_name: '',
    username: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    document.title = "Trang cá nhân - PharmacyShop";
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/me`, { withCredentials: true });
      if (res.data && res.data.user) {
        setCurrentUser(res.data.user);
        setEditForm({
          full_name: res.data.user.full_name || '',
          username: res.data.user.username || ''
        });
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Lỗi tải thông tin user:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUpdateProfile = async () => {
    if (!editForm.full_name.trim()) {
      return showMessage('Tên đầy đủ không được để trống!', 'error');
    }

    try {
      // Lấy user_id từ response auth/me (có thể là user_id hoặc id)
      const userId = currentUser.user_id || currentUser.id;
      if (!userId) {
        return showMessage('Lỗi: Không tìm thấy ID user!', 'error');
      }

      await axios.put(
        `${API_BASE}/api/user/${userId}`,
        {
          full_name: editForm.full_name,
          role: currentUser.role
        },
        { withCredentials: true }
      );

      setCurrentUser({
        ...currentUser,
        full_name: editForm.full_name
      });

      showMessage('✅ Cập nhật thông tin thành công!', 'success');
      setIsEditing(false);
    } catch (error) {
      console.error('Lỗi cập nhật thông tin:', error);
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật!';
      showMessage(errorMsg, 'error');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current_password.trim()) {
      return showMessage('Vui lòng nhập mật khẩu hiện tại!', 'error');
    }

    if (!passwordForm.new_password.trim()) {
      return showMessage('Vui lòng nhập mật khẩu mới!', 'error');
    }

    if (passwordForm.new_password.length < 6) {
      return showMessage('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return showMessage('Mật khẩu mới không trùng khớp!', 'error');
    }

    try {
      const userId = currentUser.user_id || currentUser.id;
      if (!userId) {
        return showMessage('Lỗi: Không tìm thấy ID user!', 'error');
      }

      await axios.put(
        `${API_BASE}/api/user/${userId}`,
        {
          password: passwordForm.new_password,
          full_name: currentUser.full_name,
          role: currentUser.role
        },
        { withCredentials: true }
      );

      showMessage('✅ Đổi mật khẩu thành công!', 'success');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setIsChangingPassword(false);
    } catch (error) {
      console.error('Lỗi đổi mật khẩu:', error);
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu!';
      showMessage(errorMsg, 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px' }}>
        ⏳ Đang tải...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px' }}>
        ❌ Vui lòng đăng nhập
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button 
          className="back-btn" 
          onClick={() => navigate('/user')}
        >
          <i className="fa-solid fa-arrow-left"></i> Quay lại
        </button>
        <h1>👤 Trang cá nhân</h1>
      </div>

      {message && (
        <div className={`message-alert ${messageType}`}>
          {message}
        </div>
      )}

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-section">
            <h2>📋 Thông tin cá nhân</h2>
            
            {!isEditing ? (
              <div className="profile-info">
                <div className="info-group">
                  <label>Tên đầy đủ:</label>
                  <p>{currentUser.full_name || 'Chưa cập nhật'}</p>
                </div>
                <div className="info-group">
                  <label>Tên đăng nhập:</label>
                  <p>{currentUser.username}</p>
                </div>
                <div className="info-group">
                  <label>Quyền hạn:</label>
                  <p>
                    {currentUser.role === 'admin' ? '👨‍💼 Quản trị viên' 
                     : currentUser.role === 'staff' ? '👨‍💻 Nhân viên'
                     : '👤 Khách hàng'}
                  </p>
                </div>
                <button 
                  className="btn-edit"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fa-solid fa-pen-to-square"></i> Chỉnh sửa
                </button>
              </div>
            ) : (
              <div className="profile-edit-form">
                <div className="form-group">
                  <label>Tên đầy đủ *</label>
                  <input 
                    type="text" 
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    placeholder="Nhập tên đầy đủ"
                  />
                </div>
                <div className="form-group">
                  <label>Tên đăng nhập</label>
                  <input 
                    type="text" 
                    value={editForm.username}
                    disabled
                    placeholder="Không thể thay đổi"
                    style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                  />
                </div>
                <div className="form-actions">
                  <button 
                    className="btn-cancel"
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        full_name: currentUser.full_name || '',
                        username: currentUser.username || ''
                      });
                    }}
                  >
                    ❌ Hủy
                  </button>
                  <button 
                    className="btn-save"
                    onClick={handleUpdateProfile}
                  >
                    ✅ Lưu thay đổi
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="profile-section">
            <h2>🔒 Bảo mật</h2>
            
            {!isChangingPassword ? (
              <div style={{ padding: '15px 0' }}>
                <p style={{ marginBottom: '15px', color: '#666' }}>
                  Đổi mật khẩu để bảo vệ tài khoản của bạn
                </p>
                <button 
                  className="btn-change-password"
                  onClick={() => setIsChangingPassword(true)}
                >
                  <i className="fa-solid fa-key"></i> Đổi mật khẩu
                </button>
              </div>
            ) : (
              <div className="password-form">
                <div className="form-group">
                  <label>Mật khẩu hiện tại *</label>
                  <input 
                    type="password" 
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>
                <div className="form-group">
                  <label>Mật khẩu mới *</label>
                  <input 
                    type="password" 
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  />
                </div>
                <div className="form-group">
                  <label>Xác nhận mật khẩu mới *</label>
                  <input 
                    type="password" 
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
                <div className="form-actions">
                  <button 
                    className="btn-cancel"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordForm({
                        current_password: '',
                        new_password: '',
                        confirm_password: ''
                      });
                    }}
                  >
                    ❌ Hủy
                  </button>
                  <button 
                    className="btn-save"
                    onClick={handleChangePassword}
                  >
                    ✅ Cập nhật mật khẩu
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
