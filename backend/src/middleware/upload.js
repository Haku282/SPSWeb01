const multer = require('multer');
const path = require('path');

// Cấu hình lưu trữ
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ảnh sẽ được lưu vào thư mục 'uploads'
    },
    filename: (req, file, cb) => {
        // Đặt tên file: Thời gian hiện tại + tên gốc để tránh trùng lặp
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Kiểm tra định dạng file (chỉ cho phép ảnh)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép upload file ảnh!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
    fileFilter: fileFilter
});

module.exports = upload;