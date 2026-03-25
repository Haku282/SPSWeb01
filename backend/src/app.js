require('dotenv').config();
const express = require("express");
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cookieParser = require('cookie-parser');
const cors = require("cors");
const path = require('path');

const db = require('./config/db'); 
const route = require("./route/index");

const app = express();
const port = process.env.PORT || 5000;

// SỬA BẪY 1: Đảm bảo Origin luôn đúng, fallback về localhost:3000 nếu .env lỗi
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 1. SỬA BẪY 2: Cấu hình Store độc lập để không bị xung đột với Promise Pool
const sessionOptions = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pharmacymanagement', // Sửa lại đúng tên DB của bạn
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 86400000,
    createDatabaseTable: true
};
// Không truyền biến `db` vào đây nữa
const sessionStore = new MySQLStore(sessionOptions); 

// 2. Cấu hình CORS
app.use(cors({
    origin: frontendOrigin,
    credentials: true // BẮT BUỘC
}));

app.use(express.json());
app.use(cookieParser());

// 3. Thiết lập Middleware Session
app.use(session({
    key: 'pharmacy_sid',
    secret: process.env.SESSION_SECRET || 'secret_mac_dinh_neu_thieu_env', 
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        secure: false, 
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    }
}));

// Khởi tạo các Route
route(app);

app.listen(port, () => {
    console.log(`🚀 Server pharmacy chạy tại http://localhost:${port}`);
});