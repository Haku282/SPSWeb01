# 📊 Phân Tích Chi Tiết Schema Database - Pharmacy Management System

## 🏗️ KIẾN TRÚC DATABASE TỔNG QUÁT

Database `pharmacymanagement` có **11 bảng chính**:

```
┌─────────────────────────────────────────────────────────────┐
│                    PHARMACY MANAGEMENT DB                    │
├─────────────────────────────────────────────────────────────┤
│ 1. user                    (Người dùng hệ thống)             │
│ 2. product_category        (Danh mục sản phẩm)               │
│ 3. unit                    (Đơn vị tính)                     │
│ 4. supplier                (Nhà cung cấp)                    │
│ 5. product                 (Sản phẩm)                        │
│ 6. product_batch           (Lô hàng nhập kho)                │
│ 7. product_batch_detail    (Chi tiết lô hàng)               │
│ 8. export_ticket           (Phiếu xuất kho)                  │
│ 9. export_ticket_detail    (Chi tiết phiếu xuất)            │
│ 10. user_history           (Lịch sử mua hàng)                │
│ 11. history_activity       (Nhật ký hoạt động hệ thống)     │
│ 12. sessions               (Session đăng nhập)               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 CHI TIẾT TỪNG BẢNG

### **1️⃣ Bảng `user` - Người Dùng Hệ Thống**

```sql
CREATE TABLE `user` (
  `user_id` int(11) PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(50) UNIQUE,           -- Tên đăng nhập
  `password` varchar(255),                  -- Mật khẩu (mã hóa bcrypt)
  `full_name` varchar(150),                 -- Họ tên
  `role` enum('admin','staff','user') DEFAULT 'user',  -- Vai trò
  `created_at` timestamp DEFAULT current_timestamp()
);
```

**Dữ liệu mẫu:**
| user_id | username | role | full_name |
|---------|----------|------|-----------|
| 4 | admin | admin | NULL |
| 8 | user | staff | lucas |
| 11 | minh | user | minh |

**Quyền hạn:**
- **admin**: Quản lý toàn hệ thống (nhập kho, xuất kho, sản phẩm, người dùng)
- **staff**: Quản lý nhập/xuất kho
- **user**: Xem thông tin cơ bản

---

### **2️⃣ Bảng `product_category` - Danh Mục Sản Phẩm**

```sql
CREATE TABLE `product_category` (
  `category_id` int(11) PRIMARY KEY AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,   -- Tên danh mục
  `description` text                        -- Mô tả
);
```

**Dữ liệu mẫu:**
| category_id | category_name | description |
|-------------|---------------|-------------|
| 1 | Thuốc kháng sinh | Các loại thuốc tiêu diệt vi khuẩn |
| 2 | Thuốc giảm đau - hạ sốt | Danh mục các loại thuốc giảm đau |
| 3 | Thực phẩm chức năng | Vitamin và bổ sung sức khỏe |
| 4 | Dụng cụ y tế | Khẩu trang, bông băng, máy đo |

---

### **3️⃣ Bảng `unit` - Đơn Vị Tính**

```sql
CREATE TABLE `unit` (
  `unit_id` int(11) PRIMARY KEY AUTO_INCREMENT,
  `unit_name` varchar(255) NOT NULL       -- Tên đơn vị: Viên, Hộp, Chai...
);
```

**Dữ liệu mẫu:**
| unit_id | unit_name |
|---------|-----------|
| 1 | Viên |
| 2 | Hộp (10 vỉ) |
| 3 | Chai |
| 4 | Lọ |
| 7 | Vỉ |

---

### **4️⃣ Bảng `supplier` - Nhà Cung Cấp**

```sql
CREATE TABLE `supplier` (
  `supplier_id` int(11) PRIMARY KEY AUTO_INCREMENT,
  `supplier_name` varchar(150) NOT NULL,  -- Tên nhà cung cấp
  `phone` varchar(20),                     -- Điện thoại
  `email` varchar(100),                    -- Email
  `address` varchar(255)                   -- Địa chỉ
);
```

**Dữ liệu mẫu:**
| supplier_id | supplier_name | phone | address |
|-------------|---------------|-------|---------|
| 1 | Dược phẩm Hậu Giang | 02923891433 | Cần Thơ |
| 2 | Traphaco | 18006612 | Hoàng Mai, Hà Nội |
| 3 | Phân phối Pharmadic | 02838330105 | Quận 10, TP.HCM |

---

### **5️⃣ Bảng `product` - Sản Phẩm**

```sql
CREATE TABLE `product` (
  `product_id` int(11) PRIMARY KEY AUTO_INCREMENT,
  `product_code` varchar(50) UNIQUE,       -- Mã sản phẩm
  `product_name` varchar(200) NOT NULL,    -- Tên sản phẩm
  `category_id` int(11) FK,                -- Danh mục
  `selling_price` decimal(10,2),           -- Giá bán
  `image` varchar(255),                    -- Đường dẫn ảnh
  `description` text,                      -- Mô tả
  `created_at` timestamp,
  `active_ingredient` varchar(255),        -- Hoạt chất
  `storage_condition` varchar(255),        -- Điều kiện bảo quản
  `unit_id` int(11) FK,                    -- Đơn vị tính
  `supplier_id` int(11) FK                 -- Nhà cung cấp
);
```

**Dữ liệu mẫu:**
| product_id | product_code | product_name | selling_price | unit_id |
|------------|--------------|--------------|---------------|---------|
| 1 | NULL | Paracetamol 500mg | 3500.00 | NULL |
| 8 | SP001 | Thuốc Cảm Xuyên Hương | 45000.00 | 2 |
| 11 | DHG-001 | Hapacol 650 | 35000.00 | 1 |
| 14 | sp01 | Betaloc Zok 50mg | 210000.00 | 7 |

---

### **6️⃣ Bảng `product_batch` - Lô Hàng Nhập Kho**

```sql
CREATE TABLE `product_batch` (
  `batch_id` int(11) PRIMARY KEY AUTO_INCREMENT,
  `batch_number` varchar(100),             -- Mã lô (VD: PN-2024-002)
  `user_id` int(11) FK,                    -- Admin tạo phiếu
  `total_price` decimal(12,2) DEFAULT 0,   -- Tổng giá trị nhập
  `create_date` timestamp DEFAULT now(),   -- Ngày tạo
  `supplier_id` int(11) FK                 -- Nhà cung cấp
);
```

**Dữ liệu mẫu:**
| batch_id | batch_number | user_id | total_price | create_date |
|----------|--------------|---------|-------------|-------------|
| 9 | PN-2024-002 | 4 | 12250000.00 | 2026-04-01 |
| 10 | PN-2024-003 | 4 | 45000000.00 | 2026-04-01 |
| 11 | PN-2024-004 | 4 | 15500000.00 | 2026-04-01 |

---

### **7️⃣ Bảng `product_batch_detail` - Chi Tiết Lô Hàng**

```sql
CREATE TABLE `product_batch_detail` (
  `batch_detail_id` int(11) PRIMARY KEY AUTO_INCREMENT,
  `batch_id` int(11) FK,                   -- Mã lô hàng
  `product_id` int(11) FK,                 -- Sản phẩm
  `manufacture_date` date,                 -- Ngày sản xuất
  `expiry_date` date,                      -- Ngày hết hạn
  `import_price` decimal(12,2),            -- Giá nhập
  `quantity` int(11) NOT NULL,             -- Số lượng
  `unit_id` int(11) FK,                    -- Đơn vị
  `create_date` timestamp
);
```

**Dữ liệu mẫu:**
| batch_detail_id | batch_id | product_id | quantity | import_price | expiry_date |
|-----------------|----------|------------|----------|--------------|-------------|
| 1 | 9 | 11 | 300 | 25000.00 | 2027-03-01 |
| 2 | 9 | 12 | 50 | 95000.00 | 2026-02-15 |
| 3 | 10 | 13 | 100 | 300000.00 | 2026-10-01 |
| 4 | 10 | 14 | 83 | 180000.00 | 2027-01-15 |

---

### **8️⃣ Bảng `export_ticket` - Phiếu Xuất Kho**

```sql
CREATE TABLE `export_ticket` (
  `ticket_id` int(11) PRIMARY KEY AUTO_INCREMENT,
  `total_price` decimal(12,2),             -- Tổng giá trị xuất
  `note` text,                             -- Ghi chú
  `created_at` timestamp DEFAULT now(),    -- Ngày tạo phiếu
  `user_id` int(11) FK,                    -- Nhân viên xuất
  `customer` varchar(255)                  -- Tên khách hàng
);
```

**Dữ liệu mẫu:**
| ticket_id | total_price | note | customer | user_id | created_at |
|-----------|------------|------|----------|---------|------------|
| 1 | 3250000.00 | Xuất kho bán lẻ ca sáng ngày 02/04 | NULL | 4 | 2026-04-01 |
| 2 | 3250000.00 | Xuất kho bán sỉ theo đơn Zalo | Nhà thuốc An Khang | 4 | 2026-04-01 |
| 3 | 3250000.00 | Xuất kho bán sỉ theo đơn Zalo | Nhà thuốc An Khang | 4 | 2026-04-01 |

---

### **9️⃣ Bảng `export_ticket_detail` - Chi Tiết Phiếu Xuất**

```sql
CREATE TABLE `export_ticket_detail` (
  `detail_id` int(11) PRIMARY KEY AUTO_INCREMENT,
  `ticket_id` int(11) FK,                  -- Phiếu xuất
  `batch_id` int(11) FK,                   -- Lô hàng (FEFO)
  `export_quantity` int(11) NOT NULL,      -- Số lượng xuất
  `export_price` decimal(10,2),            -- Giá xuất
  `unit_id` int(11) FK                     -- Đơn vị
);
```

**Dữ liệu mẫu:**
| detail_id | ticket_id | batch_id | export_quantity | export_price | unit_id |
|-----------|-----------|----------|-----------------|--------------|---------|
| 1 | 1 | 1 | 50 | 15000.00 | NULL |
| 2 | 1 | 2 | 10 | 250000.00 | NULL |
| 3 | 2 | 1 | 50 | 15000.00 | NULL |
| 5 | 3 | 1 | 50 | 15000.00 | 2 |
| 6 | 3 | 2 | 10 | 250000.00 | 1 |

---

### **🔟 Bảng `user_history` - Lịch Sử Mua Hàng**

```sql
CREATE TABLE `user_history` (
  `user_history_id` int(11) PRIMARY KEY AUTO_INCREMENT,
  `user_id` int(11) FK,                    -- Người mua
  `product_id` int(11) FK,                 -- Sản phẩm
  `unit_id` int(11) FK,                    -- Đơn vị
  `quantity` int(11) NOT NULL,             -- Số lượng
  `date` datetime DEFAULT now(),           -- Ngày mua
  `address` text,                          -- Địa chỉ giao hàng
  `payment` varchar(100)                   -- Phương thức thanh toán
);
```

**Hiện tại chưa có dữ liệu (auto_increment = 0)**

---

### **1️⃣1️⃣ Bảng `history_activity` - Nhật Ký Hoạt Động**

```sql
CREATE TABLE `history_activity` (
  `id` int(11) PRIMARY KEY AUTO_INCREMENT,
  `user_id` int(11) FK,                    -- Người thực hiện
  `action` varchar(20),                    -- Loại hành động (CREATE, UPDATE, DELETE...)
  `entity` varchar(50),                    -- Đối tượng (product, user, export_ticket...)
  `entity_id` int(11),                     -- ID của đối tượng
  `description` text,                      -- Mô tả chi tiết
  `ip` varchar(45),                        -- IP địa chỉ
  `user_agent` text,                       -- Thông tin trình duyệt
  `created_at` datetime DEFAULT now()
);
```

**Dữ liệu mẫu (67 bản ghi):**
- Login/Logout
- CREATE/UPDATE/DELETE sản phẩm
- Tạo phiếu xuất (CREATE export_ticket)
- Tạo phiếu nhập (CREATE product_batch)
- Backup database

---

### **1️⃣2️⃣ Bảng `sessions` - Session Đăng Nhập**

```sql
CREATE TABLE `sessions` (
  `session_id` varchar(128) PRIMARY KEY,    -- ID session
  `expires` int(11) UNSIGNED,               -- Thời gian hết hạn (Unix timestamp)
  `data` mediumtext                         -- Dữ liệu session (JSON)
);
```

**Dữ liệu mẫu:**
```json
{
  "cookie": {
    "originalMaxAge": 86400000,    // 24 giờ
    "expires": "2026-04-03T09:46:34.288Z",
    "secure": false,
    "httpOnly": true
  },
  "user": {
    "id": 11,
    "username": "minh",
    "role": "user",
    "full_name": "minh"
  }
}
```

---

## 🔗 MỐI QUAN HỆ GIỮA CÁC BẢNG

```
┌────────────────────────────────────────────────────────────┐
│                    NHẬP KHO (IMPORT)                       │
├────────────────────────────────────────────────────────────┤

user (Admin tạo)
   ↓
product_batch (Phiếu nhập - PN-2024-002)
   ↓
product_batch_detail (Chi tiết từng sản phẩm)
   ├─→ product (Sản phẩm: Hapacol 650)
   ├─→ unit (Đơn vị: Viên)
   └─→ expiry_date (Thời gian sử dụng)

supplier (Nhà cung cấp)
   ↑
   └─ product_batch.supplier_id
```

```
┌────────────────────────────────────────────────────────────┐
│                    XUẤT KHO (EXPORT) - FEFO                │
├────────────────────────────────────────────────────────────┤

user (Staff tạo)
   ↓
export_ticket (Phiếu xuất - PX-1)
   ↓
export_ticket_detail (Chi tiết xuất)
   ├─→ product_batch (Lô cũ nhất - FEFO)
   │      ↓
   │      expiry_date (Hạn sử dụng sớm nhất)
   │
   ├─→ product (Sản phẩm)
   └─→ unit (Đơn vị: Viên, Hộp...)
```

---

## 📊 LUỒNG DỮ LIỆU CHÍNH

### **1. NHẬP KHO (Import)**

```
Frontend (AdminPage)
    ↓ POST /api/import_batch
Backend (import_batchController)
    ↓
1. INSERT INTO product_batch (PN-2024-002)
2. INSERT INTO product_batch_detail (Chi tiết từng sản phẩm)
3. Ghi log vào history_activity
    ↓
Database
```

**Ví dụ:**
```
Phiếu PN-2024-002 (12,250,000 VNĐ):
- Hapacol 650: 300 viên × 25,000/viên = 7,500,000 VNĐ
- Klamentin: 50 hộp × 95,000/hộp = 4,750,000 VNĐ
```

### **2. XUẤT KHO (Export) - FEFO**

```
Frontend (AdminPage)
    ↓ POST /api/export
Backend (export_batchController)
    ↓
1. INSERT INTO export_ticket (PX-1)
2. FOR EACH product:
   - Query product_batch ORDER BY expiry_date ASC
   - Lấy từ lô cũ nhất (sớm hết hạn trước)
   - UPDATE product_batch SET quantity = quantity - export_qty
   - INSERT INTO export_ticket_detail
3. Ghi log vào history_activity
    ↓
Database
```

**Ví dụ FEFO:**
```
Muốn xuất 50 viên Hapacol 650:

Lô 1: 300 viên, HSD: 2027-03-01
Lô 2: 100 viên, HSD: 2026-09-01 ← Cũ hơn

Backend sắp xếp:
Lô 2 (2026-09-01) → 50 viên ✓ Xong
     ↓
UPDATE product_batch SET quantity = 50 WHERE batch_id = 2
```

### **3. HIỂN THỊ LỊCH SỬ XUẤT**

```
Frontend GET /api/export
    ↓
SELECT et.*, u.full_name 
FROM export_ticket et
JOIN user u ON et.user_id = u.user_id
ORDER BY et.created_at DESC
    ↓
Hiển thị bảng với: Mã phiếu, Khách hàng, Tổng giá, Người xuất, Ngày
```

---

## 💾 THỐNG KÊ DATABASE HIỆN TẠI

| Bảng | Số bản ghi | Ghi chú |
|------|-----------|--------|
| user | 11 | 4 admin/staff, 1 user |
| product | 18 | Các loại thuốc và dụng cụ y tế |
| product_category | 6 | 6 danh mục |
| unit | 12 | 12 đơn vị tính |
| supplier | 5 | 5 nhà cung cấp |
| product_batch | 12 | 12 phiếu nhập |
| product_batch_detail | 8 | Chi tiết từng sản phẩm nhập |
| export_ticket | 3 | 3 phiếu xuất đã tạo |
| export_ticket_detail | 6 | Chi tiết phiếu xuất |
| user_history | 0 | Chưa có lịch sử mua hàng |
| history_activity | 67 | 67 bản ghi nhật ký |
| sessions | 3 | 3 session đang hoạt động |

---

## 🔐 KHÓA NGOẠI (Foreign Keys)

```
product → product_category
product → unit
product → supplier
product_batch → user
product_batch → supplier
product_batch_detail → product_batch (CASCADE DELETE)
product_batch_detail → product
product_batch_detail → unit
export_ticket → user (CASCADE DELETE)
export_ticket_detail → export_ticket (CASCADE DELETE)
export_ticket_detail → product_batch
export_ticket_detail → unit
history_activity → user (CASCADE DELETE)
user_history → user
user_history → product
user_history → unit
```

---

## 📈 HIỂU NGUYÊN LÝ HOẠT ĐỘNG

### **Ví dụ Xuất Kho Thực Tế:**

**Bước 1: Admin tạo phiếu xuất (Frontend)**
```javascript
// AdminPage.jsx
const payload = {
  customer: "Nhà thuốc An Khang",
  note: "Xuất theo đơn Zalo",
  products: [
    {
      product_id: 11,        // Hapacol 650
      export_quantity: 50,   // Xuất 50 viên
      export_price: 35000,   // Giá bán 35,000/viên
      unit_id: 1             // Viên
    }
  ],
  user_id: 4                 // Admin ID
};
```

**Bước 2: Backend nhận yêu cầu**
```javascript
// Backend: export_batchController.js
const { user_id, customer, note, products } = req.body;
let total_price = 0;

// Tính tổng giá
for (const item of products) {
  total_price += item.export_quantity * item.export_price;
  // 50 × 35,000 = 1,750,000 VNĐ
}

// Tạo phiếu xuất
INSERT INTO export_ticket VALUES (
  NULL,              // ticket_id (auto)
  1750000.00,        // total_price
  "Xuất theo đơn Zalo",  // note
  NOW(),             // created_at
  4,                 // user_id (admin)
  "Nhà thuốc An Khang"   // customer
);
// ✓ Tạo ticket_id = 3
```

**Bước 3: Backend áp dụng FEFO**
```javascript
// Tìm lô Hapacol 650 sắp hết hạn trước
SELECT batch_id, quantity, expiry_date
FROM product_batch pb
JOIN product_batch_detail pbd ON pb.batch_id = pbd.batch_id
WHERE pbd.product_id = 11
ORDER BY pbd.expiry_date ASC;

// Kết quả:
// batch_id = 9, quantity = 300, expiry_date = 2027-03-01
// batch_id = 10, quantity = 100, expiry_date = 2026-02-15 ← Cũ hơn

// Lấy từ batch 10 (cũ hơn)
UPDATE product_batch_detail
SET quantity = 50
WHERE batch_detail_id = 2;
// 100 - 50 = 50 viên còn lại

// Lưu chi tiết xuất
INSERT INTO export_ticket_detail VALUES (
  NULL,      // detail_id (auto)
  3,         // ticket_id
  10,        // batch_id (lô cũ nhất)
  50,        // export_quantity
  35000.00,  // export_price
  1          // unit_id (Viên)
);
```

**Bước 4: Frontend nhận thông báo thành công**
```
✓ Xuất kho thành công!
- Phiếu xuất: PX-3
- Khách: Nhà thuốc An Khang
- Tổng: 1,750,000 VNĐ
- Lô được xuất: Cũ nhất (2026-02-15)
```

---

## 🎯 KẾT LUẬN

Database này được thiết kế rất tốt với:

1. ✅ **Chuẩn hóa dữ liệu** - Tránh trùng lặp thông tin
2. ✅ **Khóa ngoại** - Đảm bảo tính toàn vẹn dữ liệu
3. ✅ **FEFO Logic** - Xuất hàng cũ nhất trước (theo HSD)
4. ✅ **Audit Trail** - Ghi log tất cả hoạt động
5. ✅ **Cascade Delete** - Xóa phiếu tự động xóa chi tiết

**Frontend đang gọi đúng API và gửi đúng dữ liệu mà Backend yêu cầu!** ✅

