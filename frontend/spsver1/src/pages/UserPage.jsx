import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserPage.css';
import viteLogo from '/vite.svg'; 
import { logErrorToBackend } from '../utils/errorTracking';

// Component Modal (Dùng chung cho Đăng nhập và Giỏ hàng)
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
};

// Component Main App
function UserPage() {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // ================= CART STATES =================
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('shopCart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('❌ Lỗi load giỏ hàng từ localStorage:', error);
      return [];
    }
  });

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    customer_address: '',
    payment_method: 'Tiền mặt'
  });
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);

  // ================= STATE DỮ LIỆU TỪ DATABASE =================
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // ĐỊA CHỈ BACKEND
  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) 
    ? import.meta.env.VITE_BACKEND_URL 
    : 'http://localhost:5000';

  // ================= SAVE CART TO LOCALSTORAGE =================
  useEffect(() => {
    try {
      localStorage.setItem('shopCart', JSON.stringify(cartItems));
      // FIX: Tính TỔNG SỐ LƯỢNG sản phẩm thay vì số LOẠI sản phẩm
      const totalCount = cartItems.reduce((total, item) => total + item.quantity, 0);
      setCartCount(totalCount);
    } catch (error) {
      console.error('❌ Lỗi khi lưu giỏ hàng:', error);
    }
  }, [cartItems]);

  // ================= LẤY DỮ LIỆU TỪ BACKEND =================
  useEffect(() => {
    document.title = "PharmacyShop";

    const fetchData = async () => {
      try {
        try {
          const sessionRes = await axios.get(`${API_BASE}/api/auth/me`, { withCredentials: true });
          if (sessionRes.data && sessionRes.data.user) {
            setIsLoggedIn(true);
            setCurrentUser(sessionRes.data.user);
          }
        } catch (sessionError) {
          console.log("⚠️ Người dùng chưa login");
        }

        const catRes = await axios.get(`${API_BASE}/api/product_category`);
        const catData = Array.isArray(catRes.data) ? catRes.data : catRes.data.data || [];
        setCategories(catData);

        const prodRes = await axios.get(`${API_BASE}/api/product`);
        const prodData = Array.isArray(prodRes.data) ? prodRes.data : prodRes.data.data || [];
        setProducts(prodData);
        setFilteredProducts(prodData);
      } catch (error) {
        console.error("❌ Lỗi khi tải dữ liệu từ Backend:", error);
        logErrorToBackend('UserPage', `Lỗi tải danh mục/sản phẩm: ${error.message}`);
      }
    };

    fetchData();
  }, [API_BASE]);

  // ================= HÀM TÌM KIẾM & LỌC =================
  const handleSearchInput = (keyword) => {
    setSearchKeyword(keyword);
  };

  const handleSearch = async (keyword) => {
    if (!keyword.trim()) {
      if (selectedCategory) {
        const filtered = products.filter(p => p.category_id == selectedCategory); // Dùng == để an toàn kiểu dữ liệu
        setFilteredProducts(filtered);
      } else {
        setFilteredProducts(products);
      }
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE}/api/product/search?keyword=${encodeURIComponent(keyword)}`,
        { withCredentials: true }
      );
      
      // FIX: Đảm bảo lấy đúng mảng data nếu backend bọc kết quả trong object
      let searchResults = Array.isArray(response.data) ? response.data : response.data.data || [];
      
      if (selectedCategory) {
        searchResults = searchResults.filter(p => p.category_id == selectedCategory);
      }
      
      setFilteredProducts(searchResults);
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
      logErrorToBackend('UserPage', `Lỗi tìm kiếm sản phẩm: ${error.message}`);
    }
  };

  const handleFilterByCategory = (categoryId) => {
    const isCurrentlySelected = categoryId === selectedCategory;
    const newSelectedCategory = isCurrentlySelected ? null : categoryId;
    
    setSelectedCategory(newSelectedCategory);
    
    if (newSelectedCategory === null) {
      if (searchKeyword.trim()) {
        handleSearch(searchKeyword);
      } else {
        setFilteredProducts(products);
      }
    } else {
      const filtered = products.filter(p => p.category_id == newSelectedCategory);
      
      if (searchKeyword.trim()) {
        const searched = filtered.filter(p => 
          p.product_name.toLowerCase().includes(searchKeyword.toLowerCase())
        );
        setFilteredProducts(searched);
      } else {
        setFilteredProducts(filtered);
      }
    }
  };

  const handleLogout = async () => {
    if (window.confirm('❓ Bạn có chắc muốn đăng xuất không?')) {
      try {
        await axios.post(`${API_BASE}/api/auth/logout`, {}, { withCredentials: true });
      } catch (error) {
        console.error('Lỗi khi logout:', error);
      } finally {
        setIsLoggedIn(false);
        setCurrentUser(null);
        navigate('/user');
      }
    }
  };

  const getImageUrl = (img) => {
    if (!img) return "https://via.placeholder.com/250x200.png?text=Chưa+có+ảnh";
    if (img.startsWith('http')) return img;
    return `${API_BASE}/uploads/${img}`;
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.category_id == categoryId);
    return cat ? cat.category_name : "Khác";
  };

  // ================= HÀM XỬ LÝ GIỎ HÀNG =================
  const handleAddToCart = (product) => {
    const existingItem = cartItems.find(item => item.product_id === product.product_id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.product_id === product.product_id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        product_id: product.product_id,
        product_name: product.product_name,
        selling_price: product.selling_price,
        image: product.image,
        quantity: 1
      }]);
    }
  };

  const handleRemoveFromCart = (product_id) => {
    setCartItems(cartItems.filter(item => item.product_id !== product_id));
  };

  const handleUpdateQuantity = (product_id, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(product_id);
      return;
    }
    setCartItems(cartItems.map(item =>
      item.product_id === product_id
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.selling_price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (!isLoggedIn || !currentUser) {
      alert('⚠️ Vui lòng đăng nhập để thanh toán!');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert('⚠️ Giỏ hàng trống!');
      return;
    }

    setIsCheckoutModalOpen(true);
  };

  const handleSubmitCheckout = async () => {
    if (!checkoutForm.customer_address.trim()) return alert('⚠️ Vui lòng nhập địa chỉ giao hàng!');

    setIsSubmittingCheckout(true);

    try {
      // Xử lý từng sản phẩm trong giỏ hàng: lưu vào user_history + trừ kho FEFO
      let successCount = 0;
      let failedItems = [];

      for (let item of cartItems) {
        try {
          // Gửi yêu cầu tới endpoint user_history
          // Backend sẽ:
          // 1. Lưu record vào user_history (lấy user_id từ session)
          // 2. Trừ kho từ product_batch_detail theo FEFO
          const purchaseData = {
            product_id: item.product_id,
            unit_name: 'cái', // Unit mặc định, bạn có thể lấy từ product data nếu cần
            quantity: item.quantity,
            address: checkoutForm.customer_address,
            total_price: item.selling_price * item.quantity,
            payment: checkoutForm.payment_method
          };

          const response = await axios.post(
            `${API_BASE}/api/user_history`,
            purchaseData,
            { withCredentials: true }
          );

          if (response.data.message && response.data.message.includes('thành công')) {
            successCount++;
          } else {
            failedItems.push(item.product_name);
          }
        } catch (itemError) {
          console.error(`Lỗi khi xử lý sản phẩm ${item.product_name}:`, itemError);
          failedItems.push(item.product_name);
        }
      }

      // Kiểm kết quả
      if (successCount === cartItems.length) {
        alert('✅ Thanh toán thành công! Tất cả sản phẩm đã được xử lý.');
        
        setCartItems([]);
        localStorage.removeItem('shopCart');
        setCheckoutForm({ customer_address: '', payment_method: 'Tiền mặt' });
        setIsCheckoutModalOpen(false);
        setIsCartOpen(false);

        logErrorToBackend('UserPage', `Thanh toán thành công. Tổng tiền: ${getTotalPrice()}`);
      } else if (successCount > 0) {
        alert(`⚠️ Thanh toán một phần thành công!\n✅ ${successCount}/${cartItems.length} sản phẩm\n❌ Lỗi: ${failedItems.join(', ')}`);
        
        // Xóa chỉ các sản phẩm thành công khỏi giỏ
        const remainingItems = cartItems.filter(item => failedItems.includes(item.product_name));
        setCartItems(remainingItems);
        setIsCheckoutModalOpen(false);
        
        logErrorToBackend('UserPage', `Thanh toán một phần. Thành công: ${successCount}, Lỗi: ${failedItems.join(', ')}`);
      } else {
        alert(`❌ Lỗi thanh toán: Không thể xử lý bất kỳ sản phẩm nào.\n${failedItems.join(', ')}`);
        logErrorToBackend('UserPage', `Thanh toán thất bại: ${failedItems.join(', ')}`);
      }
    } catch (error) {
      console.error('Lỗi checkout:', error);
      const errorMsg = error.response?.data?.message || error.message;
      alert('❌ Lỗi thanh toán: ' + errorMsg);
      logErrorToBackend('UserPage', `Lỗi checkout: ${errorMsg}`);
    } finally {
      setIsSubmittingCheckout(false);
    }
  }; 
  
  // ================= GIAO DIỆN (RENDER) =================
  return (
    <div>
      <header>
        <a href="/user" className="logo-link">
          <img src={viteLogo} alt="Pharmacy Logo" className="logo-img" />
          <span>PharmacyShop</span>
        </a>

        <div style={{ position: 'relative' }}>
          <button className="category-menu-btn" onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}>
            <i className="fa-solid fa-bars"></i> Danh mục
          </button>

          {isCategoryMenuOpen && (
            <div className="category-dropdown-menu">
              <div className="category-column">
                <a 
                  href="#" 
                  className={`category-item ${selectedCategory === null ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleFilterByCategory(null);
                    setIsCategoryMenuOpen(false);
                  }}
                  style={{
                    fontWeight: selectedCategory === null ? 'bold' : 'normal',
                    backgroundColor: selectedCategory === null ? '#f0f0f0' : 'transparent'
                  }}
                >
                  <i className="fa-solid fa-list"></i> Tất cả sản phẩm
                </a>
                {categories.length > 0 ? categories.map((cat) => (
                  <a 
                    href="#" 
                    className={`category-item ${selectedCategory === cat.category_id ? 'active' : ''}`}
                    key={cat.category_id}
                    onClick={(e) => {
                      e.preventDefault();
                      handleFilterByCategory(cat.category_id);
                      setIsCategoryMenuOpen(false);
                    }}
                    style={{
                      fontWeight: selectedCategory === cat.category_id ? 'bold' : 'normal',
                      backgroundColor: selectedCategory === cat.category_id ? '#f0f0f0' : 'transparent'
                    }}
                  >
                    <i className="fa-solid fa-pills"></i> {cat.category_name}
                  </a>
                )) : (
                  <p style={{ padding: '10px' }}>Đang tải danh mục...</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Tìm kiếm thuốc, triệu chứng, hoạt chất..." 
            value={searchKeyword}
            onChange={(e) => handleSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(searchKeyword);
              }
            }}
            style={{ color: '#212529' }}
          />
          <button onClick={() => handleSearch(searchKeyword)}>
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>

        <div className="actions">
          {isLoggedIn && currentUser ? (
            <div style={{ position: 'relative' }}>
              <button 
                className="btn-action" 
                style={{ color: '#28a745', fontWeight: 'bold' }}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <i className="fa-solid fa-check-circle"></i> {currentUser.full_name || currentUser.username}
                <i className="fa-solid fa-chevron-down" style={{ marginLeft: '8px', fontSize: '12px' }}></i>
              </button>
              
              {isUserMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                  minWidth: '200px',
                  zIndex: 1000,
                  marginTop: '5px'
                }}>
                  <button 
                    onClick={() => {
                      navigate('/profile');
                      setIsUserMenuOpen(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 15px',
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      borderBottom: '1px solid #eee',
                      color: '#333'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <i className="fa-solid fa-user-circle" style={{ marginRight: '8px' }}></i> Trang cá nhân
                  </button>
                  <button 
                    onClick={() => {
                      navigate('/purchase-history');
                      setIsUserMenuOpen(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 15px',
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      borderBottom: '1px solid #eee',
                      color: '#333'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <i className="fa-solid fa-history" style={{ marginRight: '8px' }}></i> Lịch sử mua hàng
                  </button>
                  <button 
                    onClick={handleLogout}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 15px',
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#dc3545'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket" style={{ marginRight: '8px' }}></i> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="btn-action" 
              onClick={() => navigate('/login')}
            >
              <i className="fa-regular fa-user"></i> Đăng nhập
            </button>
          )}
          <button className="btn-action cart-btn" onClick={() => setIsCartOpen(true)}>
            <i className="fa-solid fa-cart-shopping"></i> Giỏ hàng
            <span className="cart-count">{cartCount}</span>
          </button>
        </div>
      </header>

      <div className="banner">
        <div>
          <h1>Chăm sóc sức khỏe toàn diện</h1>
          <p>Thuốc chính hãng - Tư vấn tận tâm - Giao hàng siêu tốc 2h</p>
        </div>
      </div>

      <main>
        <h2 className="section-title">
          {selectedCategory 
            ? `${categories.find(c => c.category_id == selectedCategory)?.category_name || 'Sản phẩm'}` 
            : 'Sản phẩm nổi bật'}
          {searchKeyword && ` - Kết quả tìm kiếm: "${searchKeyword}"`}
        </h2>
        <div className="product-grid">
          {filteredProducts.length > 0 ? filteredProducts.map((product) => (
            <div className="product-card" key={product.product_id}>
              <img 
                src={getImageUrl(product.image)} 
                alt={product.product_name} 
                className="product-img" 
              />
              <p className="product-category">
                {product.category_name || getCategoryName(product.category_id)}
              </p>
              <h3 className="product-name">{product.product_name}</h3>
              <p className="product-price">
                {Number(product.selling_price).toLocaleString('vi-VN')} đ
              </p>
              <button 
                className="btn-add-cart"
                onClick={() => handleAddToCart(product)}
              >
                Thêm vào giỏ
              </button>
            </div>
          )) : (
            <p style={{ textAlign: "center", width: "100%" }}>
              {searchKeyword || selectedCategory ? '❌ Không tìm thấy sản phẩm nào' : '⏳ Đang tải sản phẩm...'}
            </p>
          )}
        </div>
      </main>

      {/* MODAL GIỎ HÀNG */}
      <Modal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} title="Giỏ hàng của bạn">
        {cartItems.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>
            🛒 Giỏ hàng trống
          </p>
        ) : (
          <>
            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px', border: '1px solid #eee', borderRadius: '8px', padding: '10px' }}>
              {cartItems.map((item) => (
                <div key={item.product_id} style={{ display: 'flex', gap: '15px', marginBottom: '15px', padding: '10px', border: '1px solid #f0f0f0', borderRadius: '6px', alignItems: 'center' }}>
                  <img 
                    src={getImageUrl(item.image)} 
                    alt={item.product_name}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0' }}>{item.product_name}</h4>
                    <p style={{ margin: '5px 0', color: '#dc3545', fontWeight: 'bold' }}>
                      {Number(item.selling_price).toLocaleString('vi-VN')} đ
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)} style={{ background: '#f0f0f0', border: '1px solid #ccc', padding: '4px 8px', cursor: 'pointer', borderRadius: '4px' }}>−</button>
                      <input type="number" min="1" value={item.quantity} onChange={(e) => handleUpdateQuantity(item.product_id, parseInt(e.target.value) || 1)} style={{ width: '40px', textAlign: 'center', border: '1px solid #ccc', padding: '4px', borderRadius: '4px' }} />
                      <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)} style={{ background: '#f0f0f0', border: '1px solid #ccc', padding: '4px 8px', cursor: 'pointer', borderRadius: '4px' }}>+</button>
                      <span style={{ marginLeft: 'auto', fontWeight: 'bold' }}>
                        {Number(item.selling_price * item.quantity).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveFromCart(item.product_id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
                    🗑️ Xóa
                  </button>
                </div>
              ))}
            </div>
            <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px', marginBottom: '20px', textAlign: 'right' }}>
              <p style={{ margin: '5px 0', fontSize: '16px' }}><strong>Tổng cộng:</strong> {Number(getTotalPrice()).toLocaleString('vi-VN')} đ</p>
              <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>({cartCount} sản phẩm)</p>
            </div>
            <button className="btn-submit" style={{ background: 'var(--secondary-color)', width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer' }} onClick={handleCheckout}>
              💳 Tiến hành thanh toán
            </button>
          </>
        )}
      </Modal>

      {/* MODAL CHECKOUT */}
      <Modal isOpen={isCheckoutModalOpen} onClose={() => setIsCheckoutModalOpen(false)} title="Thông tin thanh toán">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>📍 Địa chỉ giao hàng *</label>
            <input 
              type="text" 
              placeholder="Nhập địa chỉ giao hàng" 
              value={checkoutForm.customer_address} 
              onChange={(e) => setCheckoutForm({ ...checkoutForm, customer_address: e.target.value })} 
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} 
            />
          </div>
          
          <div>
            <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>💳 Phương thức thanh toán</label>
            <select 
              value={checkoutForm.payment_method} 
              onChange={(e) => setCheckoutForm({ ...checkoutForm, payment_method: e.target.value })} 
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
            >
              <option value="Tiền mặt">💵 Tiền mặt</option>
              <option value="Chuyển khoản">🏦 Chuyển khoản</option>
              <option value="Thẻ tín dụng">💳 Thẻ tín dụng</option>
              <option value="Ví điện tử">📱 Ví điện tử</option>
            </select>
          </div>
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px', textAlign: 'right' }}>
            <p style={{ margin: '5px 0', fontSize: '16px' }}><strong>Tổng tiền:</strong> {Number(getTotalPrice()).toLocaleString('vi-VN')} đ</p>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>({cartCount} sản phẩm)</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setIsCheckoutModalOpen(false)} style={{ flex: 1, padding: '12px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }} disabled={isSubmittingCheckout}>
              ❌ Hủy
            </button>
            <button onClick={handleSubmitCheckout} style={{ flex: 1, padding: '12px', background: 'var(--secondary-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: isSubmittingCheckout ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 'bold', opacity: isSubmittingCheckout ? 0.6 : 1 }} disabled={isSubmittingCheckout}>
              {isSubmittingCheckout ? '⏳ Đang xử lý...' : '✅ Xác nhận thanh toán'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default UserPage;