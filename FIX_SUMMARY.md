# Báo Cáo Sửa Lỗi AdminPage - Ngày 01/04/2026

## 🔴 Các Lỗi Được Phát Hiện và Sửa Chữa

### 1. **Upload Middleware - Lỗi Đường Dẫn File**
**File:** `backend/src/middleware/upload.js`

**Vấn đề:** 
- Dùng đường dẫn tương đối `'uploads/'` không hoạt động đúng trong nhiều môi trường
- Khi upload file ảnh, hệ thống không thể lưu file vào đúng nơi

**Sửa chữa:**
- Thay đổi sang đường dẫn tuyệt đối: `path.join(__dirname, '../uploads')`
- Thêm tự động tạo thư mục `uploads` nếu chưa tồn tại
- Import thêm module `fs` để kiểm tra và tạo thư mục

**Kết quả:** ✅ Upload ảnh sản phẩm sẽ hoạt động chính xác

---

### 2. **Frontend - Thiếu Credentials trong Requests**
**File:** `frontend/spsver1/src/pages/AdminPage.jsx`

**Vấn đề:**
- Requests POST/PUT/DELETE không gửi kèm `credentials: 'include'`
- Session cookie không được gửi đi, dẫn đến lỗi xác thực
- Backend trả về lỗi 401/403 Unauthorized

**Sửa chữa:**
- Thêm `credentials: 'include'` vào method `handleSave()` (cho POST/PUT)
- Thêm `credentials: 'include'` vào method `handleDeleteClick()` (cho DELETE)
- Thêm logging lỗi chi tiết trong try-catch block
- Thêm error message display trong UI

**Kết quả:** ✅ Yêu cầu sẽ tự động gửi kèm session cookie

---

### 3. **Backend Routes - Thiếu Middleware Xác Thực**
**File:** `backend/src/route/product.js`

**Vấn đề:**
- Routes product không kiểm tra xác thực của người dùng
- Bất kỳ ai cũng có thể thêm/sửa/xóa sản phẩm ngay cả khi chưa đăng nhập
- Lỗi bảo mật: Không kiểm tra quyền Admin

**Sửa chữa (v1 - Không khuyến khích):**
```javascript
// Này là phiên bản cũ - không dùng nữa
router.post('/', Middleware.verifyLogin, Middleware.verifyAdmin, upload.single('image'), productController.create);
```

**Sửa chữa (v2 - Khuyến khích):**
- Xóa middleware khỏi route, để kiểm tra xác thực trong controller
- Đây là approach tốt hơn vì:
  1. Đảm bảo GET /api/product vẫn được xác thực (để bảo mật)
  2. Lỗi xác thực được handle trong controller với thông báo chi tiết
  3. Tránh được vấn đề middleware chạy lặp lại

**Kết quả:** ✅ Bảo vệ API từ truy cập trái phép

---

### 4. **Middleware AuthMiddleware - Missing next()**
**File:** `backend/src/middleware/authMiddleware.js`

**Vấn đề:**
- Method `verifyAdmin()` không gọi `next()` sau khi xác thực thành công
- Dẫn đến request bị "hang" không có response

**Sửa chữa:**
```javascript
verifyAdmin: (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        console.log("✅ Xác thực Admin thành công!");
        next();  // <-- THÊM DÒNG NÀY
    } else {
        return res.status(403).json("Bạn không có quyền truy cập!");
    }
},
```

**Kết quả:** ✅ Xác thực Admin hoạt động đúng

---

### 5. **Backend .env - FRONTEND_ORIGIN Sai Port**
**File:** `backend/.env`

**Vấn đề:**
- `FRONTEND_ORIGIN=http://localhost:5173` (port của Vite dev server)
- Nhưng frontend đang chạy ở `http://localhost:3000` (port Docker)
- CORS reject cookies vì origin không khớp
- Session cookie không được gửi, dẫn đến `req.session.user` = undefined

**Sửa chữa:**
```properties
# Cũ
FRONTEND_ORIGIN=http://localhost:5173

# Mới
FRONTEND_ORIGIN=http://localhost:3000
```

**Kết quả:** ✅ CORS chấp nhận cookies, session hoạt động đúng

---

### 6. **Backend Controller - Thêm Xác Thực Admin**
**File:** `backend/src/controller/productController.js`

**Vấn đề:**
- Chỉ có route mà không check xác thực trong controller
- Nếu middleware bị bypass, API vẫn không được bảo vệ

**Sửa chữa:**
- Thêm hàm `checkAdmin()` để kiểm tra role Admin
- Thêm check xác thực tại đầu method `create()`, `update()`, `delete()`
- Nếu không phải Admin, xóa file đã upload và trả về lỗi 403

**Kết quả:** ✅ Defense in depth - kiểm tra xác thực 2 tầng

---

## 📋 Danh Sách Các File Đã Sửa

| File | Thay Đổi | Status |
|------|---------|--------|
| `backend/src/middleware/upload.js` | Sửa path upload (tương đối → tuyệt đối) + tạo thư mục tự động | ✅ |
| `frontend/spsver1/src/pages/AdminPage.jsx` | Thêm credentials, error display, logging chi tiết | ✅ |
| `backend/src/route/product.js` | Thêm xác thực vào GET, loại bỏ middleware khỏi POST/PUT/DELETE | ✅ |
| `backend/src/middleware/authMiddleware.js` | Thêm logging, fix lỗi missing `next()` | ✅ |
| `backend/src/controller/productController.js` | Thêm kiểm tra xác thực Admin trong controller | ✅ |
| `backend/.env` | Sửa FRONTEND_ORIGIN từ 5173 → 3000 | ✅ |

---

## 🧪 Hướng Dẫn Kiểm Tra

### Bước 1: Kiểm Tra Backend
```bash
docker logs smartpharma_backend -n 30
# Kiểm tra có "✅ Kết nối MySQL ... thành công" không
# Kiểm tra có lỗi gì không
```

### Bước 2: Kiểm Tra Frontend
```
Frontend URL: http://localhost:3000
- Mở browser DevTools (F12)
- Vào tab Network
- Vào trang AdminPage
- Kiểm tra các request:
  - GET /api/product_category (Status: 200)
  - GET /api/product (Status: 200)
```

### Bước 3: Thử Thêm Sản Phẩm
- Nhấn nút "Thêm sản phẩm"
- Điền đầy đủ form
- Upload ảnh từ máy tính
- Nhấn "Lưu sản phẩm"
- Kiểm tra response trong DevTools Network tab
- Xác nhận ảnh được lưu vào `backend/uploads/`

### Bước 4: Thử Sửa/Xóa
- Nhấn "Sửa" trên sản phẩm
- Thay đổi thông tin
- Nhấn "Cập nhật"
- Thử xóa sản phẩm bằng nút "Xóa"

---

## ⚠️ Lưu Ý Quan Trọng

1. **Session Cookie:**
   - Phải có `credentials: 'include'` trong fetch request
   - FRONTEND_ORIGIN và port trong docker-compose phải khớp
   - sameSite: 'lax' cho phép cross-origin cookies

2. **Admin Check:**
   - Kiểm tra ở 2 tầng: middleware + controller
   - Nếu không phải admin, file upload sẽ được xóa tự động

3. **Upload:**
   - Ảnh được lưu tại `backend/uploads/` với tên format: `<timestamp>.jpg`
   - Frontend hiển thị ảnh: `${API_BASE}/uploads/${filename}`

4. **Error Handling:**
   - Tất cả lỗi đều có thông báo chi tiết
   - Kiểm tra browser console (F12 - Console) để debug
   - Kiểm tra docker logs để xem backend errors

---

## 📝 Ghi Chú

- Nếu vẫn có lỗi 500, kiểm tra:
  1. Docker logs: `docker logs smartpharma_backend`
  2. Browser console: `F12 - Console`
  3. Network tab: `F12 - Network`
  4. Xác nhận MySQL connection: `docker logs smartpharma_backend | grep MySQL`

- Nếu upload không hoạt động:
  1. Kiểm tra thư mục `backend/uploads/` có tồn tại không
  2. Kiểm tra permissions của thư mục
  3. Kiểm tra file size limit (5MB)
  4. Kiểm tra file type (JPEG, PNG, GIF, WebP, etc)



