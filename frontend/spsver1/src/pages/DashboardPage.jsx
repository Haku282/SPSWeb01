import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Chatbot from '../components/Chatbot';

const DashboardPage = () => {
  // Quản lý trạng thái Chatbot (Tái sử dụng logic cũ)
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [fefoData, setFefoData] = useState([]);
  const [isLoadingFefo, setIsLoadingFefo] = useState(true);
  const [fefoError, setFefoError] = useState('');
  const [summary, setSummary] = useState({
    stats: {
      expiring_products: 0,
      new_orders: 0,
      monthly_import: 0,
    },
    chart: {
      labels: [],
      values: [],
      label: 'Số đơn nhập/xuất theo ngày',
    },
    expiry_alerts: [],
  });
  const [importCount, setImportCount] = useState(0);
  const [exportCount, setExportCount] = useState(0);
  const [summaryError, setSummaryError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const BACKEND_URL =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL)
      ? import.meta.env.VITE_BACKEND_URL
      : 'http://localhost:5000';

  const AI_URL =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_AI_URL)
      ? import.meta.env.VITE_AI_URL
      : 'http://localhost:8000';

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  // Hàm tính Risk Level
  const getRiskLevel = (daysLeft) => {
    if (daysLeft < 0) return 'EXPIRED';
    if (daysLeft <= 30) return 'HIGH';
    if (daysLeft <= 90) return 'MEDIUM';
    return 'LOW';
  };

  // Hàm lấy dữ liệu từ product_batch_detail
  const getFefoData = async () => {
    try {
      setIsLoadingFefo(true);
      setFefoError('');

      // Lấy tất cả product_batch_detail có quantity > 0
      const response = await fetch(`${BACKEND_URL}/api/import_batch`, { credentials: 'include' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const batches = await response.json();
      const batchArray = Array.isArray(batches) ? batches : batches.data || [];

      const allDetails = [];
      let priority = 1;

      // Fetch chi tiết từng batch và lấy ra những sản phẩm có qty > 0
      for (const batch of batchArray) {
        try {
          const detailRes = await fetch(`${BACKEND_URL}/api/import_batch/${batch.batch_id}`, {
            credentials: 'include',
          });
          if (!detailRes.ok) continue;

          const details = await detailRes.json();
          const detailArray = Array.isArray(details) ? details : details.data || [];

          detailArray.forEach((detail) => {
            // Chỉ lấy những sản phẩm còn hàng (quantity > 0) và có hạn dùng
            if (detail.quantity > 0 && detail.expiry_date) {
              const today = new Date();
              const expiryDate = new Date(detail.expiry_date);
              const daysLeft = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
              
              allDetails.push({
                priority: priority++,
                lot_id: detail.batch_detail_id,
                product_id: detail.product_id,
                product_name: detail.product_name || 'N/A',
                quantity: detail.quantity,
                expiry_date: detail.expiry_date,
                days_to_expiry: daysLeft,
                risk_level: getRiskLevel(daysLeft),
              });
            }
          });
        } catch (err) {
          console.error(`Lỗi fetch batch ${batch.batch_id}:`, err);
        }
      }

      // Sắp xếp theo ngày hết hạn (FEFO - sớm hết hạn trước)
      allDetails.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));

      // Gán lại priority theo thứ tự FEFO
      allDetails.forEach((item, idx) => {
        item.priority = idx + 1;
      });

      console.log('FEFO Data:', allDetails);
      setFefoData(allDetails.slice(0, 10)); // Lấy top 10
    } catch (err) {
      console.error('Lỗi getFefoData:', err);
      setFefoError('Không thể tải dữ liệu FEFO từ kho hàng.');
      setFefoData([]);
    } finally {
      setIsLoadingFefo(false);
    }
  };

  // Hàm lấy cảnh báo hạn dùng
  const getExpiryAlerts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/import_batch`, { credentials: 'include' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const batches = await response.json();
      const batchArray = Array.isArray(batches) ? batches : batches.data || [];

      const alerts = [];

      for (const batch of batchArray) {
        try {
          const detailRes = await fetch(`${BACKEND_URL}/api/import_batch/${batch.batch_id}`, {
            credentials: 'include',
          });
          if (!detailRes.ok) continue;

          const details = await detailRes.json();
          const detailArray = Array.isArray(details) ? details : details.data || [];

          detailArray.forEach((detail) => {
            if (detail.quantity > 0 && detail.expiry_date) {
              const today = new Date();
              const expiryDate = new Date(detail.expiry_date);
              const daysLeft = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));

              // Chỉ thêm nếu sắp hết hạn (trong 90 ngày)
              if (daysLeft <= 90) {
                alerts.push({
                  product_id: detail.product_id,
                  product_name: detail.product_name || 'N/A',
                  expiry_date: detail.expiry_date,
                  days_left: daysLeft,
                  risk_level: getRiskLevel(daysLeft),
                });
              }
            }
          });
        } catch (err) {
          console.error(`Lỗi fetch batch ${batch.batch_id}:`, err);
        }
      }

      // Sắp xếp theo ngày hết hạn gần nhất
      alerts.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));

      return alerts.slice(0, 10); // Top 10 cảnh báo
    } catch (err) {
      console.error('Lỗi getExpiryAlerts:', err);
      return [];
    }
  };

  // Hàm lấy dữ liệu biểu đồ NHẬP KHO (số đơn nhập theo ngày)
  // Logic: 1 batch_id = 1 đơn nhập
  const getImportChartData = async () => {
    try {
      const toLocalYYYYMMDD = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };

      const byDay = new Map();

      console.log('🔄 Đang lấy dữ liệu nhập kho...');
      try {
        const importRes = await fetch(`${BACKEND_URL}/api/import_batch`, { credentials: 'include' });
        console.log('📦 Import API Response Status:', importRes.status);
        
        if (importRes.ok) {
          const imports = await importRes.json();
          
          const importArray = Array.isArray(imports) ? imports : imports.data || [];
          console.log('📦 Total import batches:', importArray.length);

          // 1 batch_id = 1 đơn nhập
          importArray.forEach((batch) => {
            if (batch.create_date) {
              const dateStr = batch.create_date.split(' ')[0]; // yyyy-mm-dd
              const count = byDay.get(dateStr) || 0;
              byDay.set(dateStr, count + 1);
              console.log(`  � Batch ID ${batch.batch_id} - Ngày: ${dateStr} (Total này: ${count + 1})`);
            }
          });
        } else {
          console.error('❌ Import API response không OK:', importRes.status);
        }
      } catch (err) {
        console.error('❌ Lỗi lấy import batch:', err);
      }

      // Xây dựng labels và values cho 7 ngày gần nhất
      const chartLabels = [];
      const chartValues = [];

      console.log('📊 Import By Day Map:', Object.fromEntries(byDay));

      for (let i = 6; i >= 0; i -= 1) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = toLocalYYYYMMDD(d);
        chartLabels.push(d.toLocaleDateString('vi-VN', { weekday: 'short' }));
        const value = byDay.get(key) || 0;
        chartValues.push(value);
        console.log(`  📈 ${key} (${d.toLocaleDateString('vi-VN', { weekday: 'short' })}): ${value} đơn nhập`);
      }

      console.log('✅ Import Chart Data:', { chartLabels, chartValues });
      return { labels: chartLabels, values: chartValues };
    } catch (err) {
      console.error('❌ Lỗi getImportChartData:', err);
      return { labels: [], values: [] };
    }
  };

  // Hàm lấy dữ liệu biểu đồ XUẤT KHO (số đơn xuất theo ngày)
  // Logic: 1 ticket_id = 1 đơn xuất
  const getExportChartData = async () => {
    try {
      const toLocalYYYYMMDD = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };

      const byDay = new Map();

      console.log('🔄 Đang lấy dữ liệu xuất kho...');
      try {
        const exportRes = await fetch(`${BACKEND_URL}/api/export_batch`, { credentials: 'include' });
        console.log('📤 Export API Response Status:', exportRes.status);
        
        if (exportRes.ok) {
          const exports = await exportRes.json();
          
          const exportArray = exports.data || [];
          console.log('📤 Total export tickets:', exportArray.length);

          // 1 ticket_id = 1 đơn xuất
          exportArray.forEach((ticket) => {
            if (ticket.created_at) {
              const dateStr = ticket.created_at.split(' ')[0]; // yyyy-mm-dd
              const count = byDay.get(dateStr) || 0;
              byDay.set(dateStr, count + 1);
              console.log(`  � Ticket ID ${ticket.ticket_id} - Ngày: ${dateStr} (Total này: ${count + 1})`);
            }
          });
        } else {
          console.error('❌ Export API response không OK:', exportRes.status);
        }
      } catch (err) {
        console.error('❌ Lỗi lấy export batch:', err);
      }

      // Xây dựng labels và values cho 7 ngày gần nhất
      const chartLabels = [];
      const chartValues = [];

      console.log('📊 Export By Day Map:', Object.fromEntries(byDay));

      for (let i = 6; i >= 0; i -= 1) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = toLocalYYYYMMDD(d);
        chartLabels.push(d.toLocaleDateString('vi-VN', { weekday: 'short' }));
        const value = byDay.get(key) || 0;
        chartValues.push(value);
        console.log(`  📈 ${key} (${d.toLocaleDateString('vi-VN', { weekday: 'short' })}): ${value} đơn xuất`);
      }

      console.log('✅ Export Chart Data:', { chartLabels, chartValues });
      return { labels: chartLabels, values: chartValues };
    } catch (err) {
      console.error('❌ Lỗi getExportChartData:', err);
      return { labels: [], values: [] };
    }
  };

  // Hàm đơn giản: Lấy số lượng đơn nhập (1 batch_id = 1 đơn nhập)
  const getImportCount = async () => {
    try {
      const importRes = await fetch(`${BACKEND_URL}/api/import_batch`, { credentials: 'include' });
      if (importRes.ok) {
        const imports = await importRes.json();
        const importArray = Array.isArray(imports) ? imports : imports.data || [];
        console.log('📦 Tổng đơn nhập:', importArray.length);
        return importArray.length;
      }
      return 0;
    } catch (err) {
      console.error('❌ Lỗi getImportCount:', err);
      return 0;
    }
  };

  // Hàm đơn giản: Lấy số lượng đơn xuất (1 ticket_id = 1 đơn xuất)
  const getExportCount = async () => {
    try {
      const exportRes = await fetch(`${BACKEND_URL}/api/export_batch`, { credentials: 'include' });
      if (exportRes.ok) {
        const exports = await exportRes.json();
        const exportArray = exports.data || [];
        console.log('📤 Tổng đơn xuất:', exportArray.length);
        return exportArray.length;
      }
      return 0;
    } catch (err) {
      console.error('❌ Lỗi getExportCount:', err);
      return 0;
    }
  };

  // Hàm lấy dữ liệu biểu đồ (số đơn nhập/xuất theo ngày) - GIỮ LẠI CHO TƯƠNG THÍCH
  const getChartData = async () => {
    try {
      const toLocalYYYYMMDD = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };

      const byDay = new Map();

      // Lấy dữ liệu nhập từ phiếu nhập (product_batch header)
      console.log('🔄 Đang lấy dữ liệu nhập kho...');
      try {
        const importRes = await fetch(`${BACKEND_URL}/api/import_batch`, { credentials: 'include' });
        
        if (importRes.ok) {
          const imports = await importRes.json();
          const importArray = Array.isArray(imports) ? imports : imports.data || [];
          console.log('📦 Import batches:', importArray.length);

          // 1 batch_id = 1 đơn nhập
          importArray.forEach((batch) => {
            if (batch.create_date) {
              const dateStr = batch.create_date.split(' ')[0];
              const count = byDay.get(dateStr) || 0;
              byDay.set(dateStr, count + 1);
            }
          });
        }
      } catch (err) {
        console.error('❌ Lỗi lấy import batch:', err);
      }

      // Lấy dữ liệu từ export_batch (phiếu xuất)
      console.log('🔄 Đang lấy dữ liệu xuất kho...');
      try {
        const exportRes = await fetch(`${BACKEND_URL}/api/export_batch`, { credentials: 'include' });
        
        if (exportRes.ok) {
          const exports = await exportRes.json();
          const exportArray = exports.data || [];
          console.log('📤 Export tickets:', exportArray.length);

          // 1 ticket_id = 1 đơn xuất
          exportArray.forEach((ticket) => {
            if (ticket.created_at) {
              const dateStr = ticket.created_at.split(' ')[0];
              const count = byDay.get(dateStr) || 0;
              byDay.set(dateStr, count + 1);
            }
          });
        }
      } catch (err) {
        console.error('❌ Lỗi lấy export batch:', err);
      }

      // Xây dựng labels và values cho 7 ngày gần nhất
      const chartLabels = [];
      const chartValues = [];

      for (let i = 6; i >= 0; i -= 1) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = toLocalYYYYMMDD(d);
        chartLabels.push(d.toLocaleDateString('vi-VN', { weekday: 'short' }));
        chartValues.push(byDay.get(key) || 0);
      }

      console.log('✅ Total Chart Data:', { total: chartValues.reduce((a, b) => a + b, 0), chartLabels, chartValues });
      return { labels: chartLabels, values: chartValues };
    } catch (err) {
      console.error('❌ Lỗi getChartData:', err);
      return { labels: [], values: [] };
    }
  };

  // Hàm fetch tất cả dữ liệu
  const fetchData = useCallback(async () => {
    try {
      // Lấy số đơn nhập/xuất
      const importNum = await getImportCount();
      const exportNum = await getExportCount();
      setImportCount(importNum);
      setExportCount(exportNum);

      // Lấy alerts
      const alerts = await getExpiryAlerts();

      // Lấy FEFO
      await getFefoData();

      // Cập nhật summary
      setSummary((prev) => ({
        ...prev,
        chart: {
          labels: [],
          values: [],
          label: 'Số đơn nhập/xuất',
        },
        expiry_alerts: alerts,
      }));

      setSummaryError('');
    } catch (err) {
      console.error('Lỗi fetchData:', err);
      setSummaryError('Lỗi khi tải dữ liệu dashboard.');
    }
  }, [BACKEND_URL]);

  useEffect(() => {
    fetchData();
    // load current user for small personal info (staff)
    const loadUser = async () => {
      try {
        const API_BASE =
          (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL)
            ? import.meta.env.VITE_BACKEND_URL
            : 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        setCurrentUser(data.user || null);
      } catch (e) {
        setCurrentUser(null);
      }
    };
    loadUser();
  }, [fetchData]);

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

  const formatCurrency = (value) => Number(value || 0).toLocaleString('vi-VN');

  const getAlertBadge = (riskLevel) => {
    if (riskLevel === 'EXPIRED' || riskLevel === 'HIGH') return 'badge badge-danger';
    if (riskLevel === 'MEDIUM') return 'badge badge-warning';
    return 'badge badge-success';
  };

  const getAlertLabel = (riskLevel, daysLeft) => {
    if (riskLevel === 'EXPIRED') return `Đã hết hạn (${Math.abs(daysLeft)} ngày)`;
    if (riskLevel === 'HIGH') return 'Gần hết hạn';
    if (riskLevel === 'MEDIUM') return 'Sắp hết hạn';
    return 'Ổn định';
  };

  return (
    <div className="admin-body">
      {/* Tái sử dụng Sidebar */}
      <Sidebar toggleChat={toggleChat} />

      <div className="main-admin">
        <div className="header-title" style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: 'var(--primary-blue)' }}>Tổng quan báo cáo</h1>
            <p style={{ color: 'var(--text-gray)', fontSize: '14px' }}>Cập nhật dữ liệu thời gian thực</p>
          </div>
          {currentUser && currentUser.role === 'staff' && (
            <div style={{ textAlign: 'right', color: '#333' }}>
              <div style={{ fontWeight: 700 }}>{currentUser.full_name || currentUser.username}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>{currentUser.role}</div>
            </div>
          )}
          <button 
            onClick={fetchData} 
            style={{ 
              background: 'white', 
              color: 'var(--primary-blue)', 
              border: '1px solid var(--primary-blue)',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="fa fa-sync-alt"></i> Làm mới
          </button>
        </div>

        {/* Bốn thẻ thống kê */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>⏰ Sản phẩm sắp hết hạn</h3>
            <p style={{ color: 'var(--danger)' }}>{summary.expiry_alerts.length}</p>
          </div>
          <div className="stat-card">
            <h3>📦 FEFO ưu tiên</h3>
            <p style={{ color: 'var(--success)' }}>{fefoData.length}</p>
          </div>
          <div className="stat-card">
            <h3>📥 Đơn nhập</h3>
            <p style={{ color: '#70AD47' }}>{importCount} đơn</p>
          </div>
          <div className="stat-card">
            <h3>📤 Đơn xuất</h3>
            <p style={{ color: '#C00000' }}>{exportCount} đơn</p>
          </div>
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
                {summary.expiry_alerts.length === 0 && (
                  <tr>
                    <td colSpan="3">Không có cảnh báo hạn dùng.</td>
                  </tr>
                )}
                {summary.expiry_alerts.map((item) => (
                  <tr key={`alert-${item.product_id}`}>
                    <td>{item.product_name}</td>
                    <td>{formatDate(item.expiry_date)}</td>
                    <td><span className={getAlertBadge(item.risk_level)}>{getAlertLabel(item.risk_level, item.days_left)}</span></td>
                  </tr>
                ))}
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