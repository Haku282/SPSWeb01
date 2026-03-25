const authMiddleware = {
    // 1. Kiểm tra đã đăng nhập chưa
    verifyLogin: (req, res, next) => {
        console.log("Dữ liệu Session hiện tại:", req.session.user); // <--- Log để xem
        if (req.session.user) {
            next();
        } else {
            return res.status(401).json("Bạn chưa đăng nhập!");
        }
    },

    // 2. Kiểm tra Role (Admin mới được vào)
    verifyAdmin: (req, res, next) => {
        // Chạy verifyLogin trước, sau đó mới check role
        if (req.session.user && req.session.user.role === 'admin') {
            next();
        } else {
            return res.status(403).json("Bạn không có quyền truy cập (Yêu cầu Admin)!");
        }
    },

};

module.exports = authMiddleware;