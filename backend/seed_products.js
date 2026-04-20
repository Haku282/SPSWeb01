const db = require('./src/config/db');

async function seedProducts() {
  try {
    // Check existing categories
    const [categories] = await db.query('SELECT * FROM product_category LIMIT 1');
    if (categories.length === 0) {
      console.log('❌ Không có danh mục. Tạo danh mục mẫu...');
      await db.query(
        'INSERT INTO product_category (category_name, description) VALUES (?, ?)',
        ['Thuốc', 'Danh mục thuốc']
      );
    }

    // Check existing units
    const [units] = await db.query('SELECT * FROM unit LIMIT 1');
    if (units.length === 0) {
      console.log('❌ Không có đơn vị tính. Tạo đơn vị tính mẫu...');
      await db.query(
        'INSERT INTO unit (unit_name) VALUES (?)',
        ['Viên']
      );
    }

    // Get category and unit IDs
    const [cat] = await db.query('SELECT category_id FROM product_category LIMIT 1');
    const [un] = await db.query('SELECT unit_id FROM unit LIMIT 1');
    const category_id = cat[0].category_id;
    const unit_id = un[0].unit_id;

    // Insert products
    const products = [
      ['P001', 'Paracetamol 500mg', category_id, unit_id, 2000, 3000, 'Giảm đau hạ sốt'],
      ['P002', 'Vitamin C 1000mg', category_id, unit_id, 35000, 50000, 'Tăng sức đề kháng'],
      ['P003', 'Ibuprofen 400mg', category_id, unit_id, 5000, 8000, 'Giảm đau chỉnh sửa sốt'],
      ['P004', 'Khẩu trang N95', category_id, unit_id, 150000, 200000, 'Khẩu trang lọc bụi']
    ];

    for (const product of products) {
      await db.query(
        'INSERT INTO product (product_code, product_name, category_id, unit_id, purchase_price, selling_price, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
        product
      );
    }

    console.log('✅ Đã thêm 4 sản phẩm mẫu vào database!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

seedProducts();
