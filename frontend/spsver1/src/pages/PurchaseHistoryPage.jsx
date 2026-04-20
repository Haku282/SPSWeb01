import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './PurchaseHistoryPage.css';

function PurchaseHistoryPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) 
    ? import.meta.env.VITE_BACKEND_URL 
    : 'http://localhost:5000';

  useEffect(() => {
    document.title = "Lịch sử mua hàng - PharmacyShop";
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/me`, { withCredentials: true });
      if (res.data && res.data.user) {
        setCurrentUser(res.data.user);
        await fetchPurchaseHistory();
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Lỗi tải thông tin user:', error);
      navigate('/login');
    }
  };

  const fetchPurchaseHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/user_history`, { withCredentials: true });
      
      // Xử lý dữ liệu trả về từ backend
      let historyData = Array.isArray(res.data) ? res.data : res.data.data || [];
      
      // Sắp xếp theo ngày mua gần nhất
      historyData = historyData.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setPurchaseHistory(historyData);
    } catch (error) {
      console.error('Lỗi tải lịch sử mua hàng:', error);
      setMessage('❌ Không thể tải lịch sử mua hàng', 'error');
      setPurchaseHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return Number(price).toLocaleString('vi-VN');
  };

  const getTotalAmount = () => {
    return purchaseHistory.reduce((total, item) => total + Number(item.total_price), 0);
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
    <div className="history-container">
      <div className="history-header">
        <button 
          className="back-btn" 
          onClick={() => navigate('/user')}
        >
          <i className="fa-solid fa-arrow-left"></i> Quay lại
        </button>
        <h1>📦 Lịch sử mua hàng</h1>
      </div>

      {message && (
        <div className={`message-alert ${messageType}`}>
          {message}
        </div>
      )}

      <div className="history-content">
        {purchaseHistory.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-inbox"></i>
            <h3>Không có lịch sử mua hàng</h3>
            <p>Bạn chưa mua sản phẩm nào. Hãy khám phá cửa hàng của chúng tôi ngay!</p>
            <button 
              className="btn-shop"
              onClick={() => navigate('/user')}
            >
              🛒 Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <>
            <div className="history-stats">
              <div className="stat-card">
                <span className="stat-label">📊 Tổng đơn hàng</span>
                <span className="stat-value">{purchaseHistory.length}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">💰 Tổng tiền chi</span>
                <span className="stat-value">{formatPrice(getTotalAmount())} đ</span>
              </div>
            </div>

            <div className="history-list">
              {purchaseHistory.map((item, index) => (
                <div key={item.user_history_id || index} className="history-item">
                  <div className="item-header">
                    <span className="item-number">#{index + 1}</span>
                    <span className="item-date">
                      <i className="fa-solid fa-calendar"></i> {formatDate(item.date)}
                    </span>
                  </div>

                  <div className="item-details">
                    <div className="detail-group">
                      <label>📦 Sản phẩm:</label>
                      <p>{item.product_name || 'N/A'}</p>
                    </div>
                    <div className="detail-group">
                      <label>📊 Số lượng:</label>
                      <p>{item.quantity} {item.unit_name || 'cái'}</p>
                    </div>
                    <div className="detail-group">
                      <label>💰 Giá:</label>
                      <p className="price">{formatPrice(item.total_price)} đ</p>
                    </div>
                  </div>

                  <div className="item-footer">
                    <div className="detail-group">
                      <label>📍 Địa chỉ giao hàng:</label>
                      <p>{item.address}</p>
                    </div>
                    <div className="detail-group">
                      <label>💳 Phương thức thanh toán:</label>
                      <p>
                        {item.payment === 'Tiền mặt' && '💵 Tiền mặt'}
                        {item.payment === 'Chuyển khoản' && '🏦 Chuyển khoản'}
                        {item.payment === 'Thẻ tín dụng' && '💳 Thẻ tín dụng'}
                        {item.payment === 'Ví điện tử' && '📱 Ví điện tử'}
                        {!item.payment && 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="history-footer">
              <button 
                className="btn-shop-more"
                onClick={() => navigate('/user')}
              >
                <i className="fa-solid fa-cart-shopping"></i> Tiếp tục mua sắm
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PurchaseHistoryPage;
