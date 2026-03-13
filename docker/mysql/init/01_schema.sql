CREATE TABLE IF NOT EXISTS user (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  product_code VARCHAR(100) UNIQUE,
  product_name VARCHAR(255) NOT NULL,
  category_id INT NULL,
  unit VARCHAR(50) NULL,
  purchase_price DECIMAL(15,2) DEFAULT 0,
  selling_price DECIMAL(15,2) DEFAULT 0,
  quantity INT NOT NULL DEFAULT 0,
  expiry_date DATE NULL,
  image VARCHAR(255) NULL,
  description TEXT NULL,
  status TINYINT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO product (product_code, product_name, quantity, expiry_date, status)
SELECT 'P001', 'Paracetamol 500mg', 120, DATE_ADD(CURDATE(), INTERVAL 8 DAY), 1
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_code = 'P001');

INSERT INTO product (product_code, product_name, quantity, expiry_date, status)
SELECT 'P002', 'Vitamin C 500mg', 200, DATE_ADD(CURDATE(), INTERVAL 45 DAY), 1
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_code = 'P002');

INSERT INTO product (product_code, product_name, quantity, expiry_date, status)
SELECT 'P003', 'Omega-3', 90, DATE_ADD(CURDATE(), INTERVAL 95 DAY), 1
WHERE NOT EXISTS (SELECT 1 FROM product WHERE product_code = 'P003');
