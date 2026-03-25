import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Chatbot from '../components/Chatbot';
import './AdminPage.css';

const AdminPage = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // LẤY THÔNG TIN USER ĐỂ KIỂM TRA QUYỀN
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('sps_user');
      if (cached) {
        const user = JSON.parse(cached);
        setIsAdmin(user.role === 'admin');
      }
    } catch (e) {
      console.error("Lỗi đọc user từ localStorage", e);
    }
  }, []);

  // STATE CHO FORM THÊM/SỬA
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // Để hiển thị ảnh tạm thời
  const [formData, setFormData] = useState({
    product_code: '', product_name: '', category_id: '', unit: '',
    purchase_price: '', selling_price: '', quantity: '', expiry_date: '',
    image: '', description: ''
  });

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  const API_BASE =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL)
      ? import.meta.env.VITE_BACKEND_URL
      : 'http://localhost:5000';

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`${API_BASE}/api/product`, { method: 'GET', credentials: 'include', headers: { Accept: 'application/json' } }),
        fetch(`${API_BASE}/api/product_category`, { method: 'GET', credentials: 'include', headers: { Accept: 'application/json' } })
      ]);

      if (!prodRes.ok) throw new Error(`Product API error ${prodRes.status}`);
      if (!catRes.ok) throw new Error(`Category API error ${catRes.status}`);

      const prodJson = await prodRes.json();
      const catJson = await catRes.json();

      const prodList = Array.isArray(prodJson) ? prodJson : prodJson.data || [];
      const catList = Array.isArray(catJson) ? catJson : catJson.data || [];

      const map = {};
      catList.forEach((c) => {
        const id = c.category_id ?? c.id;
        const name = c.category_name ?? c.name ?? '';
        const desc = c.description ?? '';
        if (id != null) map[id] = { name, description: desc };
      });
      setCategoriesMap(map);

      const normalized = prodList.map((p) => {
        const product_id = p.product_id ?? p.id ?? null;
        const category_id = p.category_id ?? p.category ?? null;
        const cat = map[category_id] || {};
        return {
          ...p,
          product_id,
          category_name: cat.name ?? (p.category_name ?? ''),
          expiry_date: p.expiry_date ? new Date(p.expiry_date).toISOString().split('T')[0] : '',
          // Logic hiển thị ảnh: Ưu tiên link từ server uploads nếu không phải link tuyệt đối
          displayImage: p.image 
            ? (p.image.startsWith('http') ? p.image : `${API_BASE}/uploads/${p.image}`) 
            : null
        };
      });

      setProducts(normalized);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải dữ liệu');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Xử lý chọn file ảnh
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file })); // Gán Object File vào formData
      setImagePreview(URL.createObjectURL(file)); // Tạo link preview
    }
  };

  // Giữ nguyên hiệu ứng nổ hạt của bạn
  const createExplosion = (el, color = '#ff5c5c', count = 12) => {
    if (!el) return;
    el.style.position = el.style.position || 'relative';
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'btn-particle';
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
      const distance = 60 + Math.random() * 60;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      const rot = Math.floor(Math.random() * 360);
      p.style.setProperty('--dx', `${dx}px`);
      p.style.setProperty('--dy', `${dy}px`);
      p.style.setProperty('--rot', `${rot}deg`);
      p.style.background = color;
      el.appendChild(p);
      p.addEventListener('animationend', () => p.remove(), { once: true });
    }
  };

  const handleDeleteClick = async (productId, e) => {
    const btn = e.currentTarget;

    try {
      const response = await fetch(`${API_BASE}/api/product/${productId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        createExplosion(btn, '#ff6b6b', 14);
        btn.classList.add('btn-exploding');
        
        setTimeout(() => {
          setProducts((prev) => prev.filter((p) => p.product_id !== productId));
          btn.classList.remove('btn-exploding');
        }, 520);
      } else {
        const result = await response.json();
        alert(result.message || "Xóa sản phẩm thất bại!");
      }
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      alert("Đã xảy ra lỗi kết nối!");
    }
  };

  const openModal = (product = null) => {
    setImagePreview(null);
    if (product) {
      setEditingId(product.product_id);
      // SỬA LỖI: Gán giá trị rỗng cho các trường null để tránh lỗi uncontrolled input
      setFormData({
        product_code: product.product_code || '',
        product_name: product.product_name || '',
        category_id: product.category_id || '',
        unit: product.unit || '',
        purchase_price: product.purchase_price || '',
        selling_price: product.selling_price || '',
        quantity: product.quantity || '',
        expiry_date: product.expiry_date || '',
        image: product.image || '',
        description: product.description || ''
      });
      if (product.displayImage) setImagePreview(product.displayImage);
    } else {
      setEditingId(null);
      
      // --- FIX CHO QUYỀN STAFF ---
      // Lấy ID của danh mục đầu tiên trong Database làm mặc định nếu là Staff
      const defaultCategory = !isAdmin && Object.keys(categoriesMap).length > 0 
                              ? Object.keys(categoriesMap)[0] 
                              : '';

      setFormData({
        product_code: '', 
        product_name: '', 
        category_id: defaultCategory, // Tự động gán category mặc định
        unit: '', 
        purchase_price: '', 
        selling_price: '', 
        quantity: '', 
        expiry_date: '',
        image: '', 
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      // SỬA LỖI: Tránh gửi chữ "null" hoặc "undefined" lên server
      const value = formData[key] === null || formData[key] === undefined ? '' : formData[key];
      data.append(key, value);
    });

    const url = editingId ? `${API_BASE}/api/product/${editingId}` : `${API_BASE}/api/product`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        body: data // Gửi FormData thay vì JSON
      });
      
      const result = await response.json();
      if (response.ok || response.status === 201) {
        setShowModal(false);
        fetchAll(); // Tải lại danh sách
      } else {
        alert(result.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      alert("Đã xảy ra lỗi kết nối!");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="admin-body">
      <Sidebar toggleChat={toggleChat} activePage="qlhh" />
      <div className="main-admin">
        <div className="header-row">
          <h1 className="page-title">Danh mục hàng hóa</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={fetchAll} 
              style={{ 
                background: 'white', 
                color: 'var(--primary-blue)', 
                border: '1px solid var(--primary-blue)',
                padding: '8px 16px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className="fa fa-sync-alt"></i> Làm mới
            </button>
            <button className="add-btn" onClick={() => openModal()}>+ Thêm sản phẩm</button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="products-table">
            <thead>
              <tr>
                <th>Ảnh</th><th>Mã</th><th>Tên</th><th>Danh mục</th><th>Đơn vị</th>
                <th>Giá nhập</th><th>Giá bán</th><th>Số lượng</th><th>Hạn dùng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.product_id}>
                  <td className="cell-center">
                    <img className="product-img" src={p.displayImage || '/placeholder.png'} alt="" />
                  </td>
                  <td>{p.product_code}</td>
                  <td>{p.product_name}</td>
                  <td>{p.category_name}</td>
                  <td>{p.unit}</td>
                  <td>{Number(p.purchase_price).toLocaleString()}</td>
                  <td>{Number(p.selling_price).toLocaleString()}</td>
                  <td>{p.quantity}</td>
                  <td>{p.expiry_date}</td>
                  <td>
                    <button className="action-btn edit" onClick={() => openModal(p)}>🔧 Sửa</button>
                    {/* Chỉ Admin mới được xóa sản phẩm */}
                    {isAdmin && (
                        <button className="action-btn delete" onClick={(e) => handleDeleteClick(p.product_id, e)}>🗑 Xóa</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Chatbot isOpen={isChatOpen} toggleChat={toggleChat} />

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSave} className="product-form">
              <div className="form-grid">
                
                {/* --- ĐÃ ĐƯA DANH MỤC LÊN ĐẦU VÀ KHÓA VỚI QUYỀN STAFF --- */}
                <div className="form-group">
                  <label>Danh mục:</label>
                  <select 
                    name="category_id" 
                    value={formData.category_id} 
                    onChange={handleInputChange} 
                    required={isAdmin} 
                    disabled={!isAdmin} 
                    style={{ 
                      backgroundColor: !isAdmin ? '#f0f0f0' : 'white', 
                      cursor: !isAdmin ? 'not-allowed' : 'pointer' 
                    }}
                  >
                    <option value="">-- Chọn --</option>
                    {Object.entries(categoriesMap).map(([id, cat]) => (
                      <option key={id} value={id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Các trường còn lại giữ nguyên thứ tự */}
                <div className="form-group">
                  <label>Mã SP:</label>
                  <input type="text" name="product_code" value={formData.product_code} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Tên SP:</label>
                  <input type="text" name="product_name" value={formData.product_name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Đơn vị:</label>
                  <input type="text" name="unit" value={formData.unit} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Giá nhập:</label>
                  <input type="number" name="purchase_price" value={formData.purchase_price} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Giá bán:</label>
                  <input type="number" name="selling_price" value={formData.selling_price} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Số lượng:</label>
                  <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Hạn dùng:</label>
                  <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleInputChange} />
                </div>

                <div className="form-group full-width">
                  <label>Hình ảnh sản phẩm:</label>
                  <div className="upload-section">
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                    <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>Hoặc dán link ảnh:</p>
                    <input type="text" name="image" value={typeof formData.image === 'string' ? formData.image : ''} 
                           onChange={handleInputChange} placeholder="https://..." />
                  </div>
                  {imagePreview && (
                    <div className="preview-container">
                      <img src={imagePreview} alt="Preview" className="img-preview-rect" />
                    </div>
                  )}
                </div>
                
                <div className="form-group full-width">
                  <label>Mô tả:</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="2"></textarea>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-submit">{editingId ? "Cập nhật" : "Lưu sản phẩm"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;