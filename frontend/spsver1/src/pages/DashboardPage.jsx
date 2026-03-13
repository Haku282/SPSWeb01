import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Chatbot from '../components/Chatbot';
import SalesChart from '../components/SalesChart';

const DashboardPage = () => {
  // Quản lý trạng thái Chatbot (Tái sử dụng logic cũ)
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [fefoData, setFefoData] = useState([]);
  const [isLoadingFefo, setIsLoadingFefo] = useState(true);
  const [fefoError, setFefoError] = useState('');

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  useEffect(() => {
    const loadFefo = async () => {
      try {
        setIsLoadingFefo(true);
        setFefoError('');

        const response = await fetch('http://localhost:8000/api/v1/inventory-recommendation/from-db');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        setFefoData(result.recommendations || []);
      } catch {
        setFefoError('Không thể tải dữ liệu FEFO từ AI Service (localhost:8000).');
        setFefoData([]);
      } finally {
        setIsLoadingFefo(false);
      }
    };

    loadFefo();
  }, []);

  const getRiskStyle = (riskLevel) => {
    if (riskLevel === 'EXPIRED') {
      return { backgroundColor: '#fdecea', color: '#c0392b' };
    }
    if (riskLevel === 'HIGH') {
      return { backgroundColor: '#ffe9e4', color: '#d35400' };
    }
    if (riskLevel === 'MEDIUM') {
      return { backgroundColor: '#fff6db', color: '#b7791f' };
    }
    return { backgroundColor: '#e8f7ee', color: '#1e8449' };
  };

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="admin-body">
      {/* Tái sử dụng Sidebar */}
      <Sidebar toggleChat={toggleChat} />

      <div className="main-admin">
        <div className="header-title" style={{ marginBottom: '25px' }}>
          <h1 style={{ color: 'var(--primary-blue)' }}>Tổng quan báo cáo</h1>
          <p style={{ color: 'var(--text-gray)', fontSize: '14px' }}>Cập nhật dữ liệu thời gian thực</p>
        </div>

        {/* Bốn thẻ thống kê */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Doanh thu tuần</h3>
            <p>450.200.000đ</p>
          </div>
          <div className="stat-card">
            <h3>Sản phẩm sắp hết hạn</h3>
            <p style={{ color: 'var(--danger)' }}>12</p>
          </div>
          <div className="stat-card">
            <h3>Đơn hàng mới</h3>
            <p>38</p>
          </div>
          <div className="stat-card">
            <h3>Nhập kho (Tháng)</h3>
            <p>1.540 SP</p>
          </div>
        </div>

        {/* Biểu đồ */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '16px' }}>Lượng hàng đã bán theo tuần</h3>
          <SalesChart />
        </div>

        {/* Hai bảng dữ liệu */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>
          
          {/* Bảng 1: FEFO Priority */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '16px' }}><i className="fa fa-sort" style={{ color: 'var(--success)' }}></i> Ưu tiên xuất hàng (FEFO)</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Thứ tự</th>
                  <th>Tên thuốc</th>
                  <th>SL</th>
                  <th>Hạn dùng</th>
                  <th>Ngày còn lại</th>
                  <th>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingFefo && (
                  <tr>
                    <td colSpan="6">Đang tải dữ liệu FEFO...</td>
                  </tr>
                )}
                {!isLoadingFefo && fefoError && (
                  <tr>
                    <td colSpan="6" style={{ color: 'var(--danger)' }}>{fefoError}</td>
                  </tr>
                )}
                {!isLoadingFefo && !fefoError && fefoData.length === 0 && (
                  <tr>
                    <td colSpan="6">Không có lô hàng khả dụng để đề xuất FEFO.</td>
                  </tr>
                )}
                {!isLoadingFefo && !fefoError && fefoData.map((item) => (
                  <tr key={`${item.lot_id || item.product_id || item.priority}-${item.priority}`}>
                    <td>{item.priority}</td>
                    <td>{item.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>{formatDate(item.expiry_date)}</td>
                    <td>{item.days_to_expiry}</td>
                    <td>
                      <span
                        style={{
                          ...getRiskStyle(item.risk_level),
                          borderRadius: '999px',
                          padding: '4px 10px',
                          fontWeight: 700,
                          fontSize: '12px',
                          display: 'inline-block',
                        }}
                      >
                        {item.risk_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bảng 2: Cảnh báo */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '16px' }}><i className="fa fa-clock" style={{ color: 'var(--warning)' }}></i> Cảnh báo hạn dùng</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Hạn dùng</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Paracetamol</td>
                  <td>15/03/2026</td>
                  <td><span className="badge badge-danger">Gần hết hạn</span></td>
                </tr>
                <tr>
                  <td>Cetaphil 500ml</td>
                  <td>20/05/2026</td>
                  <td><span className="badge badge-warning">Sắp hết hạn</span></td>
                </tr>
                <tr>
                  <td>Bio-Acimin</td>
                  <td>12/06/2026</td>
                  <td><span className="badge badge-warning">Sắp hết hạn</span></td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* Tái sử dụng Chatbot */}
      <Chatbot isOpen={isChatOpen} toggleChat={toggleChat} />
    </div>
  );
};

export default DashboardPage;