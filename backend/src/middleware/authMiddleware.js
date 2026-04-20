const authMiddleware = {
    // 1. Kiểm tra đã đăng nhập chưa (kiểm tra từ session HOẶC token trong header)
    verifyLogin: (req, res, next) => {
        // Ưu tiên kiểm tra req.session.user trước (server session)
        if (req.session && req.session.user) {
            console.log("✅ Session user:", req.session.user.full_name);
            return next();
        }
        
        // Nếu không có session, kiểm tra token từ Authorization header
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            console.log("✅ Token from header:", token);
            // Token tồn tại, cho phép truy cập (có thể decode token nếu cần)
            return next();
        }
        
        // Không có session và không có token
        console.log("❌ Không có session hoặc token");
        return res.status(401).json({ success: false, message: "Bạn chưa đăng nhập!" });
    },

    // 2. Kiểm tra Role (Admin mới được vào)
    verifyAdmin: (req, res, next) => {
        // Kiểm tra session trước
        if (req.session && req.session.user && req.session.user.role === 'admin') {
            console.log("✅ Xác thực Admin thành công!");
            return next();
        }
        
        console.log("❌ Lỗi: Không có quyền Admin. User role:", req.session?.user?.role);
        return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập (Yêu cầu Admin)!" });
    },

    // 3. Kiểm tra nhiều Role (Ví dụ: Cả admin và staff đều vào được)
    verifyAnyRole: (allowedRoles) => {
        return (req, res, next) => {
            if (req.session && req.session.user && allowedRoles.includes(req.session.user.role)) {
                next();
            } else {
                return res.status(403).json({ success: false, message: "Bạn không có quyền thực hiện hành động này!" });
            }
        };
    },
};

module.exports = authMiddleware;