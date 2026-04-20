import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
// Tạm tắt import Sidebar và Chatbot nếu bạn đang dùng Menu Sidebar tự viết bên dưới
// import Sidebar from "../components/Sidebar"; 
// import Chatbot from "../components/Chatbot";
import "./SystemAdminPage.css";

const SystemAdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('catalog');

  // ================= STATE DỮ LIỆU TỪ DATABASE =================
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [productHistoryLogs, setProductHistoryLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [errorStats, setErrorStats] = useState(null);
  const [errorLogs, setErrorLogs] = useState([]);
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  
  // Tạm ẩn các biến chưa dùng để tránh lỗi cảnh báo "assigned a value but never used"
  // const [productHistory, setProductHistory] = useState([]);

  // ================= STATE CHO FORM THÊM/SỬA =================
  const [catForm, setCatForm] = useState({ id: null, name: '', desc: '' });
  const [unitForm, setUnitForm] = useState({ id: null, name: '' });
  const [supplierForm, setSupplierForm] = useState({ id: null, name: '', phone: '', email: '', address: '' });
  const [userForm, setUserForm] = useState({ id: null, username: '', password: '', full_name: '', role: 'user' });
  const [isEditingUser, setIsEditingUser] = useState(false);

  // ĐỊA CHỈ BACKEND
  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) 
    ? import.meta.env.VITE_BACKEND_URL 
    : 'http://localhost:5000';

  // ================= LẤY DỮ LIỆU TỪ BACKEND =================
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/product_category`, { withCredentials: true });
      setCategories(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu danh mục:', error);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/unit`, { withCredentials: true });
      setUnits(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu đơn vị:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/supplier`, { withCredentials: true });
      setSuppliers(Array.isArray(res.data) ? res.data : res.data.data || []);
      console.log("✅ Lấy danh sách nhà cung cấp thành công, số bản ghi:", res.data?.length || 0);
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách nhà cung cấp:', error.response?.data || error.message);
    }
  };

  const fetchHistoryLogs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/history_activity`, { withCredentials: true });
      setHistoryLogs(Array.isArray(res.data) ? res.data : res.data.data || []);
      console.log("✅ Lấy lịch sử hoạt động thành công, số bản ghi:", res.data?.length || 0);
    } catch (error) {
      console.error('❌ Lỗi khi lấy lịch sử hoạt động:', error.response?.data || error.message);
      if (error.response?.status === 403) {
        alert('❌ Lỗi: Bạn không phải admin! Chỉ admin mới xem được lịch sử. Vui lòng đăng nhập bằng tài khoản admin.');
      } else if (error.response?.status === 401) {
        alert('❌ Lỗi: Bạn chưa đăng nhập. Vui lòng đăng nhập trước.');
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/user`, { withCredentials: true });
      setUsers(Array.isArray(res.data) ? res.data : res.data.data || []);
      console.log("✅ Lấy danh sách người dùng thành công, số bản ghi:", res.data?.length || 0);
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách người dùng:', error.response?.data || error.message);
    }
  };

  const fetchProductHistoryLogs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/history_activity/product-history/all`, { withCredentials: true });
      setProductHistoryLogs(Array.isArray(res.data) ? res.data : res.data.data || []);
      console.log("✅ Lấy lịch sử sản phẩm thành công, số bản ghi:", res.data?.length || 0);
    } catch (error) {
      console.error('❌ Lỗi khi lấy lịch sử sản phẩm:', error.response?.data || error.message);
    }
  };

  const fetchErrorStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/error_tracking/stats`, { withCredentials: true });
      setErrorStats(res.data);
      console.log("✅ Lấy thống kê lỗi thành công:", res.data);
    } catch (error) {
      console.error('❌ Lỗi khi lấy thống kê lỗi:', error.response?.data || error.message);
    }
  };

  const fetchErrorLogs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/error_tracking`, { withCredentials: true });
      setErrorLogs(Array.isArray(res.data) ? res.data : res.data.data || []);
      console.log("✅ Lấy danh sách lỗi thành công, số bản ghi:", res.data?.length || 0);
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách lỗi:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchUnits();
    fetchSuppliers();
    fetchHistoryLogs();
    fetchUsers();
    fetchProductHistoryLogs();
    fetchErrorStats();
    fetchErrorLogs();
  }, []);

  // ================= HÀM XỬ LÝ DANH MỤC =================
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (catForm.id) {
        await axios.put(
          `${API_BASE}/api/product_category/${catForm.id}`,
          { category_name: catForm.name, description: catForm.desc },
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${API_BASE}/api/product_category`,
          { category_name: catForm.name, description: catForm.desc },
          { withCredentials: true }
        );
      }
      fetchCategories(); 
      setCatForm({ id: null, name: "", desc: "" });
    } catch (error) {
      console.error("Lỗi khi lưu danh mục:", error);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa danh mục này?")) {
      try {
        await axios.delete(`${API_BASE}/api/product_category/${id}`, { withCredentials: true });
        fetchCategories(); 
      } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error);
      }
    }
  };

  const handleEditCategory = (cat) => setCatForm({
    id: cat.category_id || cat.id,
    name: cat.category_name || cat.name,
    desc: cat.description || cat.desc || ""
  });

  // ================= HÀM XỬ LÝ ĐƠN VỊ =================
  const handleSaveUnit = async (e) => {
    e.preventDefault();
    try {
      if (unitForm.id) {
        await axios.put(
          `${API_BASE}/api/unit/${unitForm.id}`,
          { unit_name: unitForm.name },
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${API_BASE}/api/unit`,
          { unit_name: unitForm.name },
          { withCredentials: true }
        );
      }
      fetchUnits();
      setUnitForm({ id: null, name: '' });
    } catch (error) {
      console.error("Lỗi khi lưu đơn vị:", error);
    }
  };

  const handleDeleteUnit = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa đơn vị này?')) {
      try {
        await axios.delete(`${API_BASE}/api/unit/${id}`, { withCredentials: true });
        fetchUnits();
      } catch (error) {
        console.error("Lỗi khi xóa đơn vị:", error);
      }
    }
  };

  const handleEditUnit = (unit) => setUnitForm({
    id: unit.unit_id || unit.id,
    name: unit.unit_name || unit.name
  });

  // ================= HÀM XỬ LÝ NHÀ CUNG CẤP =================
  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    try {
      if (!supplierForm.name || supplierForm.name.trim() === '') {
        alert('❌ Vui lòng nhập tên nhà cung cấp!');
        return;
      }

      if (supplierForm.id) {
        // UPDATE
        await axios.put(
          `${API_BASE}/api/supplier/${supplierForm.id}`,
          {
            supplier_name: supplierForm.name,
            phone: supplierForm.phone || null,
            email: supplierForm.email || null,
            address: supplierForm.address || null
          },
          { withCredentials: true }
        );
        alert('✅ Cập nhật nhà cung cấp thành công!');
      } else {
        // CREATE
        await axios.post(
          `${API_BASE}/api/supplier`,
          {
            supplier_name: supplierForm.name,
            phone: supplierForm.phone || null,
            email: supplierForm.email || null,
            address: supplierForm.address || null
          },
          { withCredentials: true }
        );
        alert('✅ Thêm nhà cung cấp thành công!');
      }
      
      fetchSuppliers();
      setSupplierForm({ id: null, name: '', phone: '', email: '', address: '' });
    } catch (error) {
      console.error('❌ Lỗi khi lưu nhà cung cấp:', error.response?.data);
      alert(`❌ Lỗi: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteSupplier = async (supplierId, supplierName) => {
    if (window.confirm(`Bạn có chắc muốn xóa nhà cung cấp "${supplierName}" không?`)) {
      try {
        await axios.delete(`${API_BASE}/api/supplier/${supplierId}`, { withCredentials: true });
        alert('✅ Xóa nhà cung cấp thành công!');
        fetchSuppliers();
      } catch (error) {
        console.error('❌ Lỗi khi xóa nhà cung cấp:', error.response?.data);
        alert(`❌ Lỗi: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleEditSupplier = (supplier) => {
    setSupplierForm({
      id: supplier.supplier_id || supplier.id,
      name: supplier.supplier_name || supplier.name,
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || ''
    });
  };

  const handleCancelEditSupplier = () => {
    setSupplierForm({ id: null, name: '', phone: '', email: '', address: '' });
  };

  // ================= HÀM XỬ LÝ NGƯỜI DÙNG =================
  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (!userForm.username || !userForm.full_name || !userForm.role) {
        alert('❌ Vui lòng điền đầy đủ các trường bắt buộc!');
        return;
      }

      if (isEditingUser) {
        // UPDATE - Chỉ gửi password nếu có thay đổi
        const updateData = {
          full_name: userForm.full_name,
          role: userForm.role
        };
        if (userForm.password) {
          updateData.password = userForm.password;
        }

        await axios.put(
          `${API_BASE}/api/user/${userForm.id}`,
          updateData,
          { withCredentials: true }
        );
        alert('✅ Cập nhật người dùng thành công!');
      } else {
        // CREATE - Bắt buộc phải có password
        if (!userForm.password) {
          alert('❌ Vui lòng nhập mật khẩu cho tài khoản mới!');
          return;
        }

        await axios.post(
          `${API_BASE}/api/user`,
          {
            username: userForm.username,
            password: userForm.password,
            full_name: userForm.full_name,
            role: userForm.role
          },
          { withCredentials: true }
        );
        alert('✅ Thêm người dùng thành công!');
      }

      fetchUsers();
      setUserForm({ id: null, username: '', password: '', full_name: '', role: 'user' });
      setIsEditingUser(false);
    } catch (error) {
      console.error('❌ Lỗi khi lưu người dùng:', error.response?.data);
      alert(`❌ Lỗi: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Bạn có chắc muốn xóa người dùng "${username}" không?`)) {
      try {
        await axios.delete(`${API_BASE}/api/user/${userId}`, { withCredentials: true });
        alert('✅ Xóa người dùng thành công!');
        fetchUsers();
      } catch (error) {
        console.error('❌ Lỗi khi xóa người dùng:', error.response?.data);
        alert(`❌ Lỗi: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleEditUser = (user) => {
    setUserForm({
      id: user.user_id || user.id,
      username: user.username,
      password: '',
      full_name: user.full_name || '',
      role: user.role || 'user'
    });
    setIsEditingUser(true);
  };

  const handleCancelEditUser = () => {
    setUserForm({ id: null, username: '', password: '', full_name: '', role: 'user' });
    setIsEditingUser(false);
  };
  
  const handleDeleteLog = async (logId) => {
    try {
      await axios.delete(`${API_BASE}/api/history_activity/${logId}`, { withCredentials: true });
      fetchHistoryLogs();
    } catch (error) {
      console.error("Lỗi khi xóa log:", error);
      alert('Xóa log thất bại!');
    }
  };

  const handleDeleteError = async (errorId) => {
    if (window.confirm('Bạn có chắc muốn xóa lỗi này không?')) {
      try {
        await axios.delete(`${API_BASE}/api/error_tracking/${errorId}`, { withCredentials: true });
        alert('✅ Xóa lỗi thành công!');
        fetchErrorLogs();
        fetchErrorStats();
      } catch (error) {
        console.error('❌ Lỗi khi xóa error:', error);
        alert('❌ Xóa lỗi thất bại!');
      }
    }
  };

  const handleResolveError = async (errorId) => {
    try {
      await axios.put(
        `${API_BASE}/api/error_tracking/${errorId}`,
        { status: 'resolved' },
        { withCredentials: true }
      );
      alert('✅ Đánh dấu lỗi đã giải quyết!');
      fetchErrorLogs();
      fetchErrorStats();
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật error:', error);
      alert('❌ Cập nhật thất bại!');
    }
  };

  // ==================== BACKUP DATABASE HANDLER ====================
  const handleBackupDatabase = async () => {
    if (window.confirm('🔄 Bạn muốn sao lưu cơ sở dữ liệu bây giờ?\n\nFile SQL sẽ được tải về máy của bạn.')) {
      setIsBackupLoading(true);
      try {
        // Sử dụng endpoint backup-alternative thay vì backup (mysqldump)
        const response = await axios.get(`${API_BASE}/api/admin/backup-alternative`, { 
          withCredentials: true,
          responseType: 'blob' // Để tải file
        });

        // Tạo URL blob từ response
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        // Lấy tên file từ header response hoặc tạo tên mặc định
        const contentDisposition = response.headers['content-disposition'];
        let fileName = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?([^"]+)"?/);
          if (match) fileName = match[1];
        }

        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);

        alert(`✅ Backup thành công!\nFile ${fileName} đã được tải về.`);
      } catch (error) {
        console.error('❌ Lỗi khi backup:', error);
        console.error('Error Response:', error.response);
        
        let errorMessage = 'Backup thất bại!';
        
        if (error.response?.status === 403) {
          errorMessage = '❌ Lỗi: Bạn không phải admin! Chỉ admin mới có thể backup cơ sở dữ liệu.';
        } else if (error.response?.status === 401) {
          errorMessage = '❌ Lỗi: Bạn chưa đăng nhập. Vui lòng đăng nhập lại.';
        } else if (error.response?.status === 500) {
          // Server error - show detailed message
          const errorDetails = error.response?.data?.message || error.response?.data?.error || 'Lỗi máy chủ nội bộ';
          errorMessage = `❌ Lỗi server 500:\n${errorDetails}\n\nKiểm tra:\n- MySQL có đang chạy?\n- Database có được kết nối?`;
        } else if (error.response) {
          errorMessage = `❌ Lỗi ${error.response.status}:\n${error.response?.data?.message || error.message}`;
        } else if (error.request) {
          errorMessage = '❌ Không thể kết nối đến server!\nKiểm tra backend có đang chạy không.';
        } else {
          errorMessage = `❌ Lỗi: ${error.message}`;
        }
        
        alert(errorMessage);
      } finally {
        setIsBackupLoading(false);
      }
    }
  };

  // ==================== LOGOUT HANDLER ====================
  const handleLogout = async () => {
    if (window.confirm('❓ Bạn có chắc muốn đăng xuất không?')) {
      try {
        // Gọi endpoint logout trên backend (nếu có)
        await axios.post(`${API_BASE}/api/auth/logout`, {}, { withCredentials: true });
      } catch (error) {
        console.error('Lỗi khi gọi logout API:', error);
        // Vẫn tiếp tục logout ngay cả khi API gặp lỗi
      } finally {
        // Xóa session/cookie bằng cách chuyển hướng về login
        navigate('/login');
        // Reload trang để đảm bảo state được reset
        window.location.reload();
      }
    }
  };

  // ================= RENDER CÁC TAB =================
  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <div className="admin-sidebar">
        <h2><i className="fa-solid fa-rocket"></i> Admin Control</h2>
        <ul className="admin-menu">
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            <i className="fa-solid fa-chart-pie"></i> Bảng điều khiển
          </li>
          <li className={activeTab === 'accounts' ? 'active' : ''} onClick={() => setActiveTab('accounts')}>
            <i className="fa-solid fa-users-gear"></i> Quản lý Tài khoản
          </li>
          <li className={activeTab === 'catalog' ? 'active' : ''} onClick={() => setActiveTab('catalog')}>
            <i className="fa-solid fa-sitemap"></i> Danh mục & Đơn vị
          </li>
          <li className={activeTab === 'supplier' ? 'active' : ''} onClick={() => setActiveTab('supplier')}>
            <i className="fa-solid fa-truck"></i> Quản lý Nhà cung cấp
          </li>
          <li className={activeTab === 'history_login' ? 'active' : ''} onClick={() => setActiveTab('history_login')}>
            <i className="fa-solid fa-arrow-right-to-bracket"></i> Lịch sử Đăng nhập
          </li>
          <li className={activeTab === 'history_product' ? 'active' : ''} onClick={() => setActiveTab('history_product')}>
            <i className="fa-solid fa-timeline"></i> Lịch sử Sản phẩm
          </li>
        </ul>
        
        {/* BACKUP DATABASE BUTTON - SPECIAL BUTTON */}
        <div style={{
          padding: '15px',
          margin: '10px 0',
          backgroundColor: '#FFF3CD',
          border: '2px solid #FFC107',
          borderRadius: '8px',
          textAlign: 'center',
          cursor: isBackupLoading ? 'not-allowed' : 'pointer',
          opacity: isBackupLoading ? 0.6 : 1,
          transition: 'all 0.3s ease'
        }}
        onClick={handleBackupDatabase}
        onMouseEnter={(e) => !isBackupLoading && (e.currentTarget.style.backgroundColor = '#FFE69C')}
        onMouseLeave={(e) => !isBackupLoading && (e.currentTarget.style.backgroundColor = '#FFF3CD')}
        >
          <i className={`fa-solid ${isBackupLoading ? 'fa-spinner fa-spin' : 'fa-database'}`}></i>
          <p style={{
            margin: '8px 0 0 0',
            fontWeight: 'bold',
            color: '#856404',
            fontSize: '0.9em'
          }}>
            {isBackupLoading ? '⏳ Đang backup...' : '🔄 Backup CSDL'}
          </p>
          <p style={{
            margin: '5px 0 0 0',
            color: '#856404',
            fontSize: '0.75em'
          }}>
            Tải file SQL
          </p>
        </div>

        <div className="logout-btn" onClick={handleLogout}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Đăng xuất
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="admin-content">
        
        {/* TAB: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="card">
            <h3>📊 Bảng điều khiển hệ thống</h3>
            
            {/* PHẦN THỐNG KÊ TỔNG QUÁT */}
            {errorStats && (
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '30px'}}>
                {/* Card 1: Tổng lỗi */}
                <div style={{
                  padding: '20px',
                  borderRadius: '8px',
                  backgroundColor: '#FFE5E5',
                  border: '2px solid #ff6b6b',
                  textAlign: 'center'
                }}>
                  <h4 style={{margin: '0 0 10px 0', color: '#ff6b6b', fontSize: '0.9em'}}>🚨 Tổng Lỗi</h4>
                  <div style={{fontSize: '2em', fontWeight: 'bold', color: '#ff6b6b'}}>
                    {errorStats.total_errors || 0}
                  </div>
                </div>

                {/* Card 2: Lỗi đang hoạt động */}
                <div style={{
                  padding: '20px',
                  borderRadius: '8px',
                  backgroundColor: '#FFD93D1a',
                  border: '2px solid #ffd93d',
                  textAlign: 'center'
                }}>
                  <h4 style={{margin: '0 0 10px 0', color: '#ff9800', fontSize: '0.9em'}}>⚠️ Lỗi Hoạt Động</h4>
                  <div style={{fontSize: '2em', fontWeight: 'bold', color: '#ff9800'}}>
                    {errorStats.active_errors || 0}
                  </div>
                </div>

                {/* Card 3: Lỗi đã giải quyết */}
                <div style={{
                  padding: '20px',
                  borderRadius: '8px',
                  backgroundColor: '#D4EDDA',
                  border: '2px solid #28a745',
                  textAlign: 'center'
                }}>
                  <h4 style={{margin: '0 0 10px 0', color: '#28a745', fontSize: '0.9em'}}>✅ Đã Giải Quyết</h4>
                  <div style={{fontSize: '2em', fontWeight: 'bold', color: '#28a745'}}>
                    {errorStats.resolved_errors || 0}
                  </div>
                </div>

                {/* Card 4: Trang bị ảnh hưởng */}
                <div style={{
                  padding: '20px',
                  borderRadius: '8px',
                  backgroundColor: '#D1ECF1',
                  border: '2px solid #17a2b8',
                  textAlign: 'center'
                }}>
                  <h4 style={{margin: '0 0 10px 0', color: '#17a2b8', fontSize: '0.9em'}}>📄 Trang Bị Ảnh Hưởng</h4>
                  <div style={{fontSize: '2em', fontWeight: 'bold', color: '#17a2b8'}}>
                    {errorStats.affected_pages || 0}
                  </div>
                </div>

                {/* Card 5: Người dùng bị ảnh hưởng */}
                <div style={{
                  padding: '20px',
                  borderRadius: '8px',
                  backgroundColor: '#E2E3E5',
                  border: '2px solid #6c757d',
                  textAlign: 'center'
                }}>
                  <h4 style={{margin: '0 0 10px 0', color: '#6c757d', fontSize: '0.9em'}}>👥 Người Dùng</h4>
                  <div style={{fontSize: '2em', fontWeight: 'bold', color: '#6c757d'}}>
                    {errorStats.affected_users || 0}
                  </div>
                </div>
              </div>
            )}

            {/* BẢNG DANH SÁCH LỖI */}
            <div style={{marginTop: '30px'}}>
              <h4>📋 Lỗi gần đây (Top 10)</h4>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Trang</th>
                    <th>Lỗi</th>
                    <th>Người dùng</th>
                    <th>Trạng thái</th>
                    <th>Thời gian</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {errorLogs.slice(0, 10).length > 0 ? errorLogs.slice(0, 10).map((log, index) => (
                    <tr key={log.id || index}>
                      <td>{log.id}</td>
                      <td><strong>{log.page}</strong></td>
                      <td style={{fontSize: '0.85em', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {log.message}
                      </td>
                      <td>{log.username || `User #${log.user_id}` || 'Guest'}</td>
                      <td>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.8em',
                          fontWeight: 'bold',
                          backgroundColor: log.status === 'active' ? '#ffdddd' : '#ddffdd',
                          color: log.status === 'active' ? '#ff6b6b' : '#28a745'
                        }}>
                          {log.status === 'active' ? '⚠️ Hoạt động' : '✅ Đã giải quyết'}
                        </span>
                      </td>
                      <td>{new Date(log.created_at).toLocaleString('vi-VN')}</td>
                      <td>
                        <div style={{display: 'flex', gap: '5px'}}>
                          {log.status === 'active' && (
                            <button 
                              onClick={() => handleResolveError(log.id)}
                              className="btn btn-success btn-sm"
                              style={{fontSize: '0.75em'}}
                            >
                              Giải quyết
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteError(log.id)}
                            className="btn btn-danger btn-sm"
                            style={{fontSize: '0.75em'}}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" style={{textAlign: "center"}}>✅ Không có lỗi nào được ghi nhận</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: TÀI KHOẢN */}
        {activeTab === 'accounts' && (
          <div className="card">
            <h3>Quản lý Tài khoản người dùng</h3>
            
            {/* FORM THÊM/SỬA */}
            <form className="admin-form" onSubmit={handleSaveUser} style={{marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px'}}>
                <input 
                  type="text" 
                  placeholder="Tên đăng nhập"
                  value={userForm.username}
                  onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                  disabled={isEditingUser}
                  required
                />
                <input 
                  type="password" 
                  placeholder="Mật khẩu (bỏ trống nếu không đổi)"
                  value={userForm.password}
                  onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                />
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '10px'}}>
                <input 
                  type="text" 
                  placeholder="Họ và tên"
                  value={userForm.full_name}
                  onChange={(e) => setUserForm({...userForm, full_name: e.target.value})}
                  required
                />
                <select 
                  value={userForm.role}
                  onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                  required
                  style={{padding: '8px', borderRadius: '4px', border: '1px solid #ddd'}}
                >
                  <option value="user">User</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div style={{display: 'flex', gap: '10px'}}>
                <button type="submit" className="btn btn-primary">
                  {isEditingUser ? 'Cập nhật' : 'Thêm người dùng'}
                </button>
                {isEditingUser && (
                  <button 
                    type="button" 
                    onClick={handleCancelEditUser}
                    className="btn btn-secondary"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>

            {/* BẢNG DANH SÁCH NGƯỜI DÙNG */}
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên đăng nhập</th>
                  <th>Họ và tên</th>
                  <th>Chức vụ</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? users.map((user, index) => (
                  <tr key={user.user_id || index}>
                    <td>{user.user_id}</td>
                    <td><strong>{user.username}</strong></td>
                    <td>{user.full_name || '-'}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.85em',
                        fontWeight: 'bold',
                        backgroundColor: user.role === 'admin' ? '#ff6b6b' : user.role === 'staff' ? '#4c6ef5' : '#748ffc',
                        color: 'white'
                      }}>
                        {user.role === 'admin' ? '🔐 Admin' : user.role === 'staff' ? '👤 Staff' : '👥 User'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleEditUser(user)} 
                          className="btn btn-secondary btn-sm"
                        >
                          Sửa
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.user_id, user.username)} 
                          className="btn btn-danger btn-sm"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" style={{textAlign: "center"}}>Chưa có người dùng nào trong Database</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: DANH MỤC VÀ ĐƠN VỊ */}
        {activeTab === 'catalog' && (
          <div className="catalog-grid">
            
            {/* BẢNG 1: QUẢN LÝ DANH MỤC */}
            <div className="card">
              <h3>Quản lý Danh mục sản phẩm</h3>
              <form className="admin-form" onSubmit={handleSaveCategory}>
                <input 
                  type="text" 
                  placeholder="Tên danh mục"
                  value={catForm.name}
                  onChange={(e) => setCatForm({...catForm, name: e.target.value})}
                  required
                />
                <input 
                  type="text" 
                  placeholder="Mô tả"
                  value={catForm.desc}
                  onChange={(e) => setCatForm({...catForm, desc: e.target.value})}
                />
                <button type="submit" className="btn btn-primary">{catForm.id ? 'Cập nhật' : 'Thêm'}</button>
              </form>
              <table className="admin-table mt-3">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên danh mục</th>
                    <th>Mô tả</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length > 0 ? categories.map((cat, index) => {
                    const id = cat.category_id || cat.id;
                    const name = cat.category_name || cat.name;
                    const desc = cat.description || cat.desc;
                    return (
                      <tr key={id || index}>
                        <td>{id}</td>
                        <td><strong>{name}</strong></td>
                        <td>{desc}</td>
                        <td>
                          <div className="action-buttons">
                            <button onClick={() => handleEditCategory(cat)} className="btn btn-secondary btn-sm">Sửa</button>
                            <button onClick={() => handleDeleteCategory(id)} className="btn btn-danger btn-sm">Xóa</button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan="4" style={{textAlign: "center"}}>Chưa có danh mục nào trong Database</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* BẢNG 2: QUẢN LÝ ĐƠN VỊ TÍNH */}
            <div className="card">
              <h3>Quản lý Đơn vị tính</h3>
              <form className="admin-form" onSubmit={handleSaveUnit}>
                <input 
                  type="text" 
                  placeholder="Tên đơn vị (Ví dụ: Hộp, Vỉ...)"
                  value={unitForm.name}
                  onChange={(e) => setUnitForm({...unitForm, name: e.target.value})}
                  required
                />
                <button type="submit" className="btn btn-primary">{unitForm.id ? 'Cập nhật' : 'Thêm'}</button>
              </form>
              <table className="admin-table mt-3">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên Đơn vị</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {units.length > 0 ? units.map((unit, index) => {
                    const id = unit.unit_id || unit.id;
                    const name = unit.unit_name || unit.name;
                    return (
                      <tr key={id || index}>
                        <td>{id}</td>
                        <td><strong>{name}</strong></td>
                        <td>
                          <div className="action-buttons">
                            <button onClick={() => handleEditUnit(unit)} className="btn btn-secondary btn-sm">Sửa</button>
                            <button onClick={() => handleDeleteUnit(id)} className="btn btn-danger btn-sm">Xóa</button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan="3" style={{textAlign: "center"}}>Chưa có đơn vị nào trong Database</td></tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB: QUẢN LÝ NHÀ CUNG CẤP */}
        {activeTab === 'supplier' && (
          <div className="card">
            <h3><i className="fa-solid fa-truck"></i> Quản lý Nhà cung cấp</h3>
            
            {/* FORM THÊM/SỬA */}
            <form className="admin-form" onSubmit={handleSaveSupplier} style={{marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px'}}>
                <input 
                  type="text" 
                  placeholder="Tên nhà cung cấp *"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({...supplierForm, name: e.target.value})}
                  required
                />
                <input 
                  type="tel" 
                  placeholder="Số điện thoại"
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({...supplierForm, phone: e.target.value})}
                />
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px'}}>
                <input 
                  type="email" 
                  placeholder="Email"
                  value={supplierForm.email}
                  onChange={(e) => setSupplierForm({...supplierForm, email: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="Địa chỉ"
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({...supplierForm, address: e.target.value})}
                />
              </div>

              <div style={{display: 'flex', gap: '10px'}}>
                <button type="submit" className="btn btn-primary">
                  {supplierForm.id ? '✏️ Cập nhật' : '➕ Thêm nhà cung cấp'}
                </button>
                {supplierForm.id && (
                  <button 
                    type="button" 
                    onClick={handleCancelEditSupplier}
                    className="btn btn-secondary"
                  >
                    ❌ Hủy
                  </button>
                )}
              </div>
            </form>

            {/* BẢNG DANH SÁCH NHÀ CUNG CẤP */}
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên nhà cung cấp</th>
                  <th>Số điện thoại</th>
                  <th>Email</th>
                  <th>Địa chỉ</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length > 0 ? suppliers.map((supplier, index) => (
                  <tr key={supplier.supplier_id || index}>
                    <td>{supplier.supplier_id}</td>
                    <td><strong>{supplier.supplier_name}</strong></td>
                    <td>{supplier.phone || '-'}</td>
                    <td>{supplier.email || '-'}</td>
                    <td>{supplier.address || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleEditSupplier(supplier)} 
                          className="btn btn-secondary btn-sm"
                        >
                          Sửa
                        </button>
                        <button 
                          onClick={() => handleDeleteSupplier(supplier.supplier_id, supplier.supplier_name)} 
                          className="btn btn-danger btn-sm"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" style={{textAlign: "center"}}>📭 Chưa có nhà cung cấp nào trong Database</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: LỊCH SỬ ĐĂNG NHẬP */}
        {activeTab === 'history_login' && (
          <div className="card">
            <h3>Lịch sử hoạt động hệ thống</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Người dùng</th>
                  <th>Hành động</th>
                  <th>Thực thể</th>
                  <th>Mô tả</th>
                  <th>IP</th>
                  <th>Thời gian</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {historyLogs.length > 0 ? historyLogs.map((log, index) => (
                  <tr key={log.id || index}>
                    <td>{log.id}</td>
                    <td><strong>{log.username || `User #${log.user_id}`}</strong></td>
                    <td>
                      <span className={`badge badge-${log.action === 'LOGIN' ? 'success' : log.action === 'LOGOUT' ? 'info' : log.action === 'DELETE' ? 'danger' : 'warning'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>{log.entity}</td>
                    <td style={{ fontSize: '0.85em', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.description || '-'}
                    </td>
                    <td>{log.ip || '-'}</td>
                    <td>{new Date(log.created_at).toLocaleString('vi-VN')}</td>
                    <td>
                      <button 
                        onClick={() => {
                          if (window.confirm('Bạn có chắc muốn xóa log này?')) {
                            handleDeleteLog(log.id);
                          }
                        }} 
                        className="btn btn-danger btn-sm"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="8" style={{textAlign: "center"}}>Chưa có lịch sử hoạt động nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: LỊCH SỬ HỆ THỐNG */}
        {activeTab === 'history_product' && (
          <div className="card">
            <h3>Lịch sử thay đổi sản phẩm</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Người dùng</th>
                  <th>Hành động</th>
                  <th>Loại sản phẩm</th>
                  <th>Entity ID</th>
                  <th>Mô tả</th>
                  <th>Thời gian</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {productHistoryLogs.length > 0 ? productHistoryLogs.map((log, index) => (
                  <tr key={log.id || index}>
                    <td>{log.id}</td>
                    <td><strong>{log.username || `User #${log.user_id}`}</strong></td>
                    <td>
                      <span className={`badge badge-${log.action === 'CREATE' ? 'success' : log.action === 'UPDATE' ? 'info' : log.action === 'DELETE' ? 'danger' : 'warning'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '0.8em',
                        fontWeight: 'bold',
                        backgroundColor: log.entity === 'product' ? '#87CEEB' : '#FFB6C1',
                        color: 'white'
                      }}>
                        {log.entity === 'product' ? '📦 Product' : '📥 Batch'}
                      </span>
                    </td>
                    <td>{log.entity_id || '-'}</td>
                    <td style={{ fontSize: '0.85em', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.description || '-'}
                    </td>
                    <td>{new Date(log.created_at).toLocaleString('vi-VN')}</td>
                    <td>
                      <button 
                        onClick={() => {
                          if (window.confirm('Bạn có chắc muốn xóa log này?')) {
                            handleDeleteLog(log.id);
                          }
                        }} 
                        className="btn btn-danger btn-sm"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="8" style={{textAlign: "center"}}>Chưa có lịch sử thay đổi sản phẩm nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default SystemAdminPage;