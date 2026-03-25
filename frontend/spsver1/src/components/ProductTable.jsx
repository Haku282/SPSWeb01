import React, { useState, useEffect } from 'react';

const ProductTable = () => {
  // 1. Khởi tạo state để chứa dữ liệu thật từ Backend
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Dùng useEffect để gọi API ngay khi component được hiển thị
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // GỌI API: Đã sửa lại cú pháp fetch chuẩn xác
        const response = await fetch('http://localhost:5000/api/product', {
          method: 'GET',
          credentials: 'include', // <<-- CỰC KỲ QUAN TRỌNG: Mảnh ghép để khớp với backend
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Không thể kết nối với server!');
        }
        
        const data = await response.json();
        setProducts(data); // Đổ dữ liệu thật vào state
        setIsLoading(false); // Tắt hiệu ứng tải
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []); // Mảng rỗng [] giúp lệnh này chỉ chạy đúng 1 lần lúc mở trang

  // Hàm định dạng tiền tệ VNĐ
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // 3. Xử lý giao diện khi đang tải hoặc có lỗi
  if (isLoading) return <div style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold' }}>Đang tải dữ liệu từ CSDL...</div>;
  if (error) return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>Lỗi: {error}</div>;

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
            <th>Ảnh</th>
            <th>Mã SP</th>
            <th>Tên sản phẩm</th>
            <th>Mô tả</th>
            <th>Giá bán</th>
            <th>Tồn kho</th>
            <th>Ngày tạo</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {/* 4. Render dữ liệu thật ra bảng */}
          {products.length > 0 ? products.map((product) => (
            <tr key={product.product_id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px 0' }}>
                <img 
                  src={product.image_url || 'https://via.placeholder.com/40'} 
                  alt={product.product_name} 
                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                />
              </td>
              <td>{product.product_id}</td>
              <td><b>{product.product_name}</b></td>
              <td style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {product.description}
              </td>
              <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{formatPrice(product.price)}</td>
              <td>
                <span className={`badge ${product.stock_quantity > 15 ? 'badge-success' : 'badge-warning'}`}>
                  {product.stock_quantity}
                </span>
              </td>
              <td>{product.created_at ? new Date(product.created_at).toLocaleDateString('vi-VN') : ''}</td>
              <td>
                <i className="fa fa-edit" style={{ color: 'var(--primary-blue)', cursor: 'pointer', marginRight: '15px', fontSize: '16px' }}></i>
                <i className="fa fa-trash" style={{ color: 'var(--danger)', cursor: 'pointer', fontSize: '16px' }}></i>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                Chưa có sản phẩm nào trong cơ sở dữ liệu.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;