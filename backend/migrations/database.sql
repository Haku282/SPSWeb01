-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th4 03, 2026 lúc 06:07 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `pharmacymanagement`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `error_logs`
--

CREATE TABLE `error_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `page` varchar(100) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `url` text DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `status` enum('active','resolved') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `error_logs`
--

INSERT INTO `error_logs` (`id`, `user_id`, `page`, `message`, `url`, `ip`, `user_agent`, `status`, `created_at`) VALUES
(1, 11, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:25:38'),
(2, 11, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:25:38'),
(3, 11, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:29:11'),
(4, 11, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:29:11'),
(5, 11, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:29:16'),
(6, 11, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:29:16'),
(7, 11, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:31:11'),
(8, 11, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:31:11'),
(9, 11, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:31:28'),
(10, 11, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:31:28'),
(11, 11, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:35:54'),
(12, 11, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:35:54'),
(13, 11, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:39:00'),
(14, 11, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:39:00'),
(15, 11, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:43:29'),
(16, 11, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:43:29'),
(17, 11, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:43:38'),
(18, 11, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:43:38'),
(19, NULL, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:44:23'),
(20, NULL, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:44:23'),
(21, 11, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:44:32'),
(22, 11, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:44:32'),
(23, 11, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:47:15'),
(24, 11, 'UserPage', 'Lỗi tải danh mục/sản phẩm: Request failed with status code 401', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 19:47:15'),
(25, 11, 'UserPage', 'Lỗi checkout: Request failed with status code 400', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 20:46:28'),
(26, 11, 'UserPage', 'Lỗi checkout: Request failed with status code 400', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 20:47:14'),
(28, 11, 'UserPage', 'Lỗi checkout: Request failed with status code 400', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 20:57:28'),
(29, 11, 'UserPage', 'Lỗi checkout: Request failed with status code 400', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 20:57:35'),
(30, 11, 'UserPage', 'Lỗi checkout: Request failed with status code 400', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 20:58:05'),
(31, 11, 'UserPage', 'Lỗi checkout: Request failed with status code 400', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-02 21:04:32'),
(32, 11, 'UserPage', 'Lỗi checkout: Unknown column \'quantity\' in \'field list\'', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-03 02:12:47'),
(33, 11, 'UserPage', 'Lỗi checkout: Unknown column \'quantity\' in \'field list\'', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-03 02:18:05'),
(34, 11, 'UserPage', 'Lỗi checkout: Unknown column \'quantity\' in \'field list\'', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-03 02:18:17'),
(35, 8, 'AdminPage', 'Lỗi tải chi tiết phiếu nhập: Failed to fetch', 'http://localhost:3000/qlnhapkho', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-03 03:11:44'),
(36, 11, 'UserPage', 'Lỗi checkout: Unknown column \'customer_phone\' in \'field list\'', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-03 03:47:06'),
(37, 11, 'UserPage', 'Lỗi checkout: Unknown column \'customer_phone\' in \'field list\'', 'http://localhost:3000/user', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'active', '2026-04-03 03:48:37');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `export_ticket`
--

CREATE TABLE `export_ticket` (
  `ticket_id` int(11) NOT NULL,
  `total_price` decimal(12,2) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` int(11) NOT NULL,
  `customer` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `export_ticket`
--

INSERT INTO `export_ticket` (`ticket_id`, `total_price`, `note`, `created_at`, `user_id`, `customer`) VALUES
(1, 3250000.00, 'Xuất kho bán lẻ ca sáng ngày 02/04', '2026-04-01 15:48:16', 4, NULL),
(2, 3250000.00, 'Xuất kho bán sỉ theo đơn đặt hàng qua Zalo', '2026-04-01 15:56:39', 4, 'Nhà thuốc An Khang - Chi nhánh Quận 1'),
(3, 3250000.00, 'Xuất kho bán sỉ theo đơn đặt hàng qua Zalo', '2026-04-01 16:02:37', 4, 'Nhà thuốc An Khang - Chi nhánh Quận 1');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `export_ticket_detail`
--

CREATE TABLE `export_ticket_detail` (
  `detail_id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `batch_id` int(11) NOT NULL,
  `export_quantity` int(11) NOT NULL,
  `export_price` decimal(10,2) DEFAULT NULL,
  `unit_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `export_ticket_detail`
--

INSERT INTO `export_ticket_detail` (`detail_id`, `ticket_id`, `batch_id`, `export_quantity`, `export_price`, `unit_id`) VALUES
(1, 1, 1, 50, 15000.00, NULL),
(2, 1, 2, 10, 250000.00, NULL),
(3, 2, 1, 50, 15000.00, NULL),
(4, 2, 2, 10, 250000.00, NULL),
(5, 3, 1, 50, 15000.00, 2),
(6, 3, 2, 10, 250000.00, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `history_activity`
--

CREATE TABLE `history_activity` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` varchar(20) NOT NULL,
  `entity` varchar(50) NOT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `history_activity`
--

INSERT INTO `history_activity` (`id`, `user_id`, `action`, `entity`, `entity_id`, `description`, `ip`, `user_agent`, `created_at`) VALUES
(1, 4, 'CREATE', 'product_category', 6, 'User admin created category \"Thuốc chóng say xe\" (category_id = 6)', NULL, NULL, '2026-03-23 21:25:28'),
(2, 4, 'LOGIN', 'auth', NULL, 'User admin logged in', NULL, NULL, '2026-03-30 12:40:20'),
(3, 4, 'LOGOUT', 'auth', NULL, 'User admin logged out', NULL, NULL, '2026-03-30 12:40:49'),
(4, 8, 'LOGIN', 'auth', NULL, 'User user logged in', NULL, NULL, '2026-03-30 12:41:06'),
(5, 8, 'LOGOUT', 'auth', NULL, 'User user logged out', NULL, NULL, '2026-03-30 12:44:32'),
(6, 4, 'LOGIN', 'auth', NULL, 'User admin logged in', NULL, NULL, '2026-03-30 12:44:36'),
(7, 4, 'LOGIN', 'auth', NULL, 'User admin logged in', NULL, NULL, '2026-03-30 13:21:55'),
(8, 4, 'LOGOUT', 'auth', NULL, 'User admin logged out', NULL, NULL, '2026-03-30 14:19:45'),
(9, 8, 'LOGIN', 'auth', NULL, 'User user logged in', NULL, NULL, '2026-03-30 14:19:50'),
(10, 8, 'LOGOUT', 'auth', NULL, 'User user logged out', NULL, NULL, '2026-03-30 14:23:09'),
(11, 4, 'LOGIN', 'auth', NULL, 'User admin logged in', NULL, NULL, '2026-03-30 14:23:13'),
(12, 4, 'LOGOUT', 'auth', NULL, 'User admin logged out', NULL, NULL, '2026-03-30 14:23:21'),
(13, 8, 'LOGIN', 'auth', NULL, 'User user logged in', NULL, NULL, '2026-03-30 14:23:26'),
(14, 8, 'LOGOUT', 'auth', NULL, 'User user logged out', NULL, NULL, '2026-03-30 14:28:24'),
(15, 4, 'LOGIN', 'auth', NULL, 'User admin logged in', NULL, NULL, '2026-03-30 14:28:29'),
(16, 4, 'LOGIN', 'auth', NULL, 'User admin logged in', NULL, NULL, '2026-03-31 19:10:15'),
(17, 4, 'LOGIN', 'auth', NULL, 'User admin logged in', NULL, NULL, '2026-04-01 16:07:07'),
(18, 4, 'LOGOUT', 'auth', NULL, 'User admin logged out', NULL, NULL, '2026-04-01 16:28:24'),
(19, 4, 'LOGIN', 'auth', NULL, 'User admin logged in', NULL, NULL, '2026-04-01 16:52:51'),
(20, 4, 'LOGIN', 'auth', NULL, 'User admin logged in', NULL, NULL, '2026-04-01 16:59:58'),
(21, 4, 'LOGIN', 'auth', NULL, 'User admin logged in', NULL, NULL, '2026-04-01 17:04:57'),
(22, 4, 'CREATE', 'user', 9, 'Admin created staff account: Stafff', NULL, NULL, '2026-04-01 17:07:06'),
(23, 4, 'LOGOUT', 'auth', NULL, 'User admin logged out', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 17:09:58'),
(24, 4, 'LOGIN', 'auth', NULL, 'User admin logged in', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 17:11:48'),
(25, 4, 'CREATE', 'user', 10, 'Admin created staff account: testtt', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 17:12:42'),
(26, 4, 'LOGOUT', 'auth', NULL, 'User admin logged out', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 17:13:05'),
(27, 4, 'LOGIN', 'auth', NULL, 'User admin logged in', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 19:13:24'),
(28, 4, 'CREATE', 'product_batch', 1, 'Imported new batch LOHANG_2024_001 for product: Paracetamol 500mg', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 19:14:01'),
(29, 4, 'UPDATE', 'product_batch', 1, 'Updated batch info. Old Batch No: LOHANG_2024_001 -> New: LOHANG_2024_001_FIXED', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 19:14:37'),
(30, 4, 'CREATE', 'product_batch', 4, 'Imported new batch LOHANG_2024_001 for product: Khẩu trang N95', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 19:25:56'),
(31, 4, 'LOGIN', 'auth', NULL, 'User admin logged in', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 19:33:10'),
(32, 4, 'CREATE', 'product_batch', 5, 'Imported new batch LOHANG_2024_001 for product: Vitamin C 1000mg', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 19:35:33'),
(33, 4, 'LOGIN', 'auth', NULL, 'User admin logged in', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 20:16:29'),
(34, 4, 'CREATE', 'product', 8, 'Created exact product snapshot: Thuốc Cảm Xuyên Hương', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 20:17:17'),
(35, 4, 'CREATE', 'product_batch', 6, 'Imported batch LOHANG-2024-001 for product ID 8', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 20:17:17'),
(36, 4, 'CREATE', 'product', 9, 'Created exact product snapshot: Kem bôi giảm mụn viêm', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 20:21:28'),
(37, 4, 'CREATE', 'product_batch', 7, 'Imported batch DERMA-24-B1 for product ID 9', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 20:21:28'),
(38, 4, 'CREATE', 'product', 10, 'Created exact product snapshot: Khẩu trang y tế kháng khuẩn 4 lớp', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 20:21:57'),
(39, 4, 'CREATE', 'product_batch', 8, 'Imported batch KT-032024-LOT1 for product ID 10', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 20:21:57'),
(40, 4, 'UPDATE', 'product_batch', 2, 'Updated batch & product info for batch_id 2 (Product: Thuốc Cảm Xuyên Hương (Mẫu Mới))', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 20:23:08'),
(41, 4, 'LOGIN', 'auth', NULL, 'User admin logged in', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 20:26:29'),
(42, 4, 'DELETE', 'product_batch', 5, 'Deleted batch LOHANG_2024_001 and its associated product: Vitamin C 1000mg', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 20:26:45'),
(43, 4, 'LOGIN', 'auth', NULL, 'User admin logged in', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 22:39:20'),
(44, 4, 'LOGIN', 'auth', NULL, 'User admin logged in', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 22:46:55'),
(45, 4, 'CREATE', 'export_ticket', 1, 'Tạo phiếu xuất kho ID: 1', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 22:48:16'),
(46, 4, 'CREATE', 'export_ticket', 2, 'Tạo phiếu xuất kho ID: 2 cho khách hàng: Nhà thuốc An Khang - Chi nhánh Quận 1', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 22:56:39'),
(47, 4, 'CREATE', 'export_ticket', 3, 'Tạo phiếu xuất kho ID: 3 cho khách hàng: Nhà thuốc An Khang - Chi nhánh Quận 1', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 23:02:37'),
(48, 4, 'CREATE', 'product_batch', 9, 'Tạo phiếu nhập kho số PN-2024-002 kèm theo 2 bản ghi sản phẩm mới', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 23:41:33'),
(49, 4, 'CREATE', 'product_batch', 10, 'Tạo phiếu nhập kho số PN-2024-003 kèm theo 2 bản ghi sản phẩm mới', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 23:46:10'),
(50, 4, 'CREATE', 'product_batch', 11, 'Tạo phiếu nhập kho số PN-2024-004 kèm theo 2 bản ghi sản phẩm mới', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 23:47:29'),
(51, 4, 'CREATE', 'product_batch', 12, 'Tạo phiếu nhập kho số PN-2024-005 kèm theo 2 bản ghi sản phẩm mới', '::1', 'PostmanRuntime/7.39.1', '2026-04-01 23:47:38'),
(52, 4, 'LOGIN', 'auth', NULL, 'User admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-02 14:21:08'),
(53, 4, 'BACKUP_FAILED', 'system', NULL, 'Failed to create backup: Command failed: mysqldump -h localhost -u root  pharmacymanagement > \"C:\\Users\\This PC\\OneDrive\\Máy tính\\Thực Hành PTPM\\SPSWeb01\\backend\\src\\backups\\backup-2026-04-02T07-23-24-226Z.sql\"\nmysqldump: Got error: 2002: \"Can\'t connect to server on \'localhost\' (10061)\" when trying to connect\n', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-02 14:23:29'),
(54, 4, 'BACKUP_FAILED', 'system', NULL, 'Failed to create backup: Command failed: mysqldump -h localhost -u root  pharmacymanagement > \"C:\\Users\\This PC\\OneDrive\\Máy tính\\Thực Hành PTPM\\SPSWeb01\\backend\\src\\backups\\backup-2026-04-02T07-26-28-763Z.sql\"\nmysqldump: Got error: 2002: \"Can\'t connect to server on \'localhost\' (10061)\" when trying to connect\n', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-02 14:26:32'),
(55, 4, 'BACKUP_SUCCESS', 'system', NULL, 'Admin created database backup file: backup-2026-04-02T07-31-31-610Z.sql', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-02 14:31:31'),
(56, 4, 'LOGIN', 'auth', NULL, 'User admin logged in', '::1', 'PostmanRuntime/7.39.1', '2026-04-02 14:43:52'),
(57, 4, 'UPDATE', 'unit', 2, 'Changed unit name from \'Hộp\' to \'Hộp (10 vỉ)\'', '::1', 'PostmanRuntime/7.39.1', '2026-04-02 14:45:24'),
(58, 8, 'LOGIN', 'auth', NULL, 'User user logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-02 14:57:46'),
(59, 4, 'LOGIN', 'auth', NULL, 'User admin logged in', '::1', 'PostmanRuntime/7.39.1', '2026-04-02 16:03:27'),
(60, 4, 'CREATE', 'supplier', 5, 'Thêm mới nhà cung cấp: Công ty Cổ phần Traphaco', '::1', 'PostmanRuntime/7.39.1', '2026-04-02 16:04:42'),
(61, 8, 'LOGOUT', 'auth', 8, 'User user logged out', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-02 16:54:42'),
(62, 11, 'LOGIN', 'auth', NULL, 'User user1 logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-02 16:55:17'),
(63, 4, 'LOGIN', 'auth', NULL, 'User admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-02 17:07:35'),
(64, 11, 'LOGIN', 'auth', NULL, 'User user1 logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-02 17:21:16'),
(65, 11, 'LOGIN', 'auth', NULL, 'User user1 logged in', '::1', 'PostmanRuntime/7.39.1', '2026-04-02 19:51:15'),
(66, 11, 'LOGIN', 'auth', NULL, 'User user1 logged in', '::1', 'PostmanRuntime/7.39.1', '2026-04-02 22:33:07'),
(67, 11, 'LOGIN', 'auth', NULL, 'User user1 logged in', '::1', 'PostmanRuntime/7.39.1', '2026-04-02 22:51:31'),
(68, 4, 'LOGIN', 'auth', NULL, 'User admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-02 23:27:49'),
(69, 11, 'LOGIN', 'auth', NULL, 'User user1 logged in', '::1', 'PostmanRuntime/7.39.1', '2026-04-03 10:22:36');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product`
--

CREATE TABLE `product` (
  `product_id` int(11) NOT NULL,
  `product_code` varchar(50) DEFAULT NULL,
  `product_name` varchar(200) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `selling_price` decimal(10,2) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `active_ingredient` varchar(255) DEFAULT NULL,
  `storage_condition` varchar(255) DEFAULT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `supplier_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `product`
--

INSERT INTO `product` (`product_id`, `product_code`, `product_name`, `category_id`, `selling_price`, `image`, `description`, `created_at`, `active_ingredient`, `storage_condition`, `unit_id`, `supplier_id`) VALUES
(1, NULL, 'Paracetamol 500mg', 1, 3500.00, 'paracetamol.jpg', 'Thuốc giảm đau hạ sốt cập nhật', '2026-03-09 13:15:42', NULL, NULL, NULL, NULL),
(2, 'SP001-UPDATED', 'Thuốc Cảm Xuyên Hương (Mẫu Mới)', 1, 50000.00, 'https://example.com/images/cam-xuyen-huong-new.jpg', 'Hỗ trợ giảm cảm cúm, ho, sổ mũi. Bao bì mới.', '2026-03-09 13:15:42', 'Xuyên khung, Bạch chỉ, Hương phụ', 'Nơi mát mẻ, dưới 30 độ C', 2, NULL),
(4, NULL, 'Khẩu trang N95', 4, 200000.00, NULL, 'Khẩu trang lọc bụi mịn và vi khuẩn', '2026-03-09 13:15:42', NULL, NULL, NULL, NULL),
(5, NULL, 'Paracetamol', 1, 3000.00, 'paracetamol.jpg', 'Thuốc giảm đau hạ sốt', '2026-03-11 14:49:08', NULL, NULL, NULL, NULL),
(6, 'THUOC001', 'Paracetamol 500mg', 1, 3000.00, 'paracetamol.jpg', 'Thuốc giảm đau hạ sốt', '2026-03-11 15:07:05', NULL, NULL, NULL, NULL),
(7, 'K002', 'Test2', 1, 3500.00, 'paracetamol.jpg', 'Test2', '2026-03-11 15:07:42', NULL, NULL, NULL, NULL),
(8, 'SP001', 'Thuốc Cảm Xuyên Hương', 1, 45000.00, 'https://example.com/images/cam-xuyen-huong.jpg', 'Hỗ trợ giảm cảm cúm, ho, sổ mũi.', '2026-04-01 13:17:17', 'Xuyên khung, Bạch chỉ, Hương phụ', 'Nơi khô ráo, tránh ánh sáng trực tiếp', 2, NULL),
(9, 'DERMA-002', 'Kem bôi giảm mụn viêm', 3, 150000.00, 'https://example.com/images/kem-tri-mun.png', 'Hỗ trợ giảm viêm, xẹp mụn nhanh chóng, không để lại sẹo thâm.', '2026-04-01 13:21:28', 'Salicylic Acid 2%, Niacinamide 5%', 'Nhiệt độ phòng, đậy kín nắp sau khi sử dụng', 3, NULL),
(10, 'VT-KT4L', 'Khẩu trang y tế kháng khuẩn 4 lớp', 2, 40000.00, 'https://example.com/images/khau-trang-xanh.jpg', 'Khẩu trang màu xanh, hộp 50 chiếc, quai thun co giãn tốt.', '2026-04-01 13:21:57', NULL, 'Nơi khô ráo, thoáng mát', 4, NULL),
(11, 'DHG-001', 'Hapacol 650', 1, 35000.00, NULL, NULL, '2026-04-01 16:41:33', 'Paracetamol 650mg', 'Nơi khô ráo, dưới 30 độ C', 1, NULL),
(12, 'DHG-002', 'Klamentin 875/125', 2, 120000.00, NULL, NULL, '2026-04-01 16:41:33', 'Amoxicillin 875mg, Clavulanic acid 125mg', 'Nơi nhiệt độ dưới 25 độ C', 1, NULL),
(13, 'AZ-001', 'Crestor 10mg', 3, 350000.00, NULL, NULL, '2026-04-01 16:46:10', 'Rosuvastatin 10mg', 'Nhiệt độ phòng, tránh ánh sáng trực tiếp', 1, NULL),
(14, 'AZ-002', 'Betaloc Zok 50mg', 3, 210000.00, NULL, NULL, '2026-04-01 16:46:10', 'Metoprolol tartrate 50mg', 'Dưới 30 độ C', 1, NULL),
(15, 'BM-001', 'Blackmores Fish Oil 1000mg', 4, 550000.00, NULL, NULL, '2026-04-01 16:47:29', 'Omega-3 marine triglycerides 300mg', 'Nơi khô ráo, tránh ánh nắng, dưới 30 độ C', 2, NULL),
(16, 'BM-002', 'Blackmores Glucosamine 1500mg', 4, 680000.00, NULL, NULL, '2026-04-01 16:47:29', 'Glucosamine sulfate 1500mg', 'Nơi thoáng mát', 2, NULL),
(17, 'VT-001', 'Nước muối sinh lý Natri Clorid 0.9% 500ml', 5, 5000.00, NULL, NULL, '2026-04-01 16:47:38', 'Natri Clorid 0.9%', 'Nhiệt độ phòng', 3, NULL),
(18, 'VT-002', 'Bông y tế Bạch Tuyết 100g', 5, 15000.00, NULL, NULL, '2026-04-01 16:47:38', '100% Cotton', 'Nơi khô ráo, sạch sẽ', 4, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_batch`
--

CREATE TABLE `product_batch` (
  `batch_id` int(11) NOT NULL,
  `batch_number` varchar(100) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `total_price` decimal(12,2) DEFAULT 0.00,
  `create_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `supplier_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `product_batch`
--

INSERT INTO `product_batch` (`batch_id`, `batch_number`, `user_id`, `total_price`, `create_date`, `supplier_id`) VALUES
(1, 'LOHANG_2024_001_FIXED', NULL, 0.00, '2026-04-01 16:43:33', NULL),
(2, 'LOHANG-2024-001-FIX', NULL, 0.00, '2026-04-01 16:43:33', NULL),
(4, 'LOHANG_2024_001', NULL, 0.00, '2026-04-01 16:43:33', NULL),
(6, 'LOHANG-2024-001', NULL, 0.00, '2026-04-01 16:43:33', NULL),
(7, 'DERMA-24-B1', NULL, 0.00, '2026-04-01 16:43:33', NULL),
(8, 'KT-032024-LOT1', NULL, 0.00, '2026-04-01 16:43:33', NULL),
(9, 'PN-2024-002', 4, 12250000.00, '2026-04-01 16:43:33', NULL),
(10, 'PN-2024-003', 4, 45000000.00, '2026-04-01 16:46:10', NULL),
(11, 'PN-2024-004', 4, 15500000.00, '2026-04-01 16:47:29', NULL),
(12, 'PN-2024-005', 4, 1250000.00, '2026-04-01 16:47:38', NULL),
(13, 'TEST_FEFO_01', 4, 10000.00, '2026-04-02 15:47:05', NULL),
(14, 'TEST_FEFO_02', 4, 100000.00, '2026-04-02 15:47:05', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_batch_detail`
--

CREATE TABLE `product_batch_detail` (
  `batch_detail_id` int(11) NOT NULL,
  `batch_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `manufacture_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `import_price` decimal(12,2) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `unit_id` int(11) NOT NULL,
  `create_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `product_batch_detail`
--

INSERT INTO `product_batch_detail` (`batch_detail_id`, `batch_id`, `product_id`, `manufacture_date`, `expiry_date`, `import_price`, `quantity`, `unit_id`, `create_date`) VALUES
(1, 9, 11, '2024-03-01', '2027-03-01', 25000.00, 295, 1, '2026-04-01 16:41:33'),
(2, 9, 12, '2024-02-15', '2026-02-15', 95000.00, 50, 1, '2026-04-01 16:41:33'),
(3, 10, 13, '2023-10-01', '2026-10-01', 300000.00, 100, 1, '2026-04-01 16:46:10'),
(4, 10, 14, '2024-01-15', '2027-01-15', 180000.00, 83, 1, '2026-04-01 16:46:10'),
(5, 11, 15, '2024-02-10', '2027-02-10', 420000.00, 20, 2, '2026-04-01 16:47:29'),
(6, 11, 16, '2023-11-20', '2026-11-20', 510000.00, 14, 2, '2026-04-01 16:47:29'),
(7, 12, 17, '2024-03-20', '2027-03-20', 3000.00, 250, 3, '2026-04-01 16:47:38'),
(8, 12, 18, '2024-01-05', '2029-01-05', 10000.00, 50, 4, '2026-04-01 16:47:38'),
(9, 13, 1, '2024-01-01', '2026-10-01', 2000.00, 0, 1, '2026-04-02 15:47:05'),
(10, 14, 6, '2024-02-01', '2026-11-01', 2500.00, 0, 1, '2026-04-02 15:47:05'),
(11, 13, 1, '2024-03-01', '2027-12-01', 2000.00, 18, 1, '2026-04-02 15:47:05');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_category`
--

CREATE TABLE `product_category` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `product_category`
--

INSERT INTO `product_category` (`category_id`, `category_name`, `description`) VALUES
(1, 'Thuốc kháng sinh', 'Các loại thuốc tiêu diệt hoặc kìm hãm sự phát triển của vi khuẩn'),
(2, 'Thuốc giảm đau - hạ sốt', 'Danh mục các loại thuốc giảm đau và hạ sốt'),
(3, 'Thực phẩm chức năng', 'Vitamin và các loại thực phẩm bổ sung sức khỏe'),
(4, 'Dụng cụ y tế', 'Khẩu trang, bông băng, máy đo huyết áp'),
(5, 'Thuốc giảm đau', 'Các loại thuốc giảm đau'),
(6, 'Thuốc chóng say xe', 'Nhóm thuốc chóng say xe');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('O9SKo-r1arOFQMV01n2rNgGTBnohWfN0', 1775235651, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2026-04-03T09:55:17.109Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"user\":{\"id\":4,\"username\":\"admin\",\"role\":\"admin\",\"full_name\":null}}'),
('ZqzZdyvVnZIxJkqAQ9P8zAi-48Ztp8IQ', 1775273345, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2026-04-02T12:13:24.184Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"user\":{\"id\":11,\"username\":\"user1\",\"role\":\"user\",\"full_name\":\"lúcá\"}}');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `supplier`
--

CREATE TABLE `supplier` (
  `supplier_id` int(11) NOT NULL,
  `supplier_name` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `supplier`
--

INSERT INTO `supplier` (`supplier_id`, `supplier_name`, `phone`, `email`, `address`) VALUES
(1, 'Dược phẩm Hậu Giang', '02923891433', 'dhgpharma@dhgpharma.com.vn', 'Cần Thơ, Việt Nam'),
(2, 'Traphaco', '18006612', 'info@traphaco.com.vn', 'Hoàng Mai, Hà Nội'),
(3, 'Phân phối Pharmadic', '02838330105', 'contact@pharmadic.vn', 'Quận 10, TP.HCM'),
(4, 'Thiết bị y tế Vinamed', '0243823567', 'vinamed@vnn.vn', 'Đống Đa, Hà Nội'),
(5, 'Công ty Cổ phần Traphaco', '18006612', 'info@traphaco.com.vn', '75 Yên Ninh, Ba Đình, Hà Nội');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `unit`
--

CREATE TABLE `unit` (
  `unit_id` int(11) NOT NULL,
  `unit_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `unit`
--

INSERT INTO `unit` (`unit_id`, `unit_name`) VALUES
(1, 'Viên'),
(2, 'Hộp (10 vỉ)'),
(3, 'Chai'),
(4, 'Lọ'),
(5, 'Gói'),
(6, 'Ống'),
(7, 'Vỉ'),
(8, 'Kg'),
(9, 'Gam'),
(10, 'Lít'),
(11, 'ml'),
(12, 'Thùng');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `full_name` varchar(150) DEFAULT NULL,
  `role` enum('admin','staff','user') NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `user`
--

INSERT INTO `user` (`user_id`, `username`, `password`, `full_name`, `role`, `created_at`) VALUES
(3, 'duocsi_01', '$2b$10$UOLjhQCkprlSpAWiIHyD8O1dTo5srWtHB0GDP3JfBgLWfvX2kvjx.', 'Dược Sĩ Nguyễn Văn B', 'admin', '2026-03-05 09:44:14'),
(4, 'admin', '$2b$10$ddFauftQonj8Ix9T.LvRJ.oQpsrJM.r6REmiyV8EcjEqXNw3Qe8/2', NULL, 'admin', '2026-03-09 09:50:32'),
(5, 'tin', '$2b$10$4TqyrDtKveys3UStq/okpO7u85WpMQ17smDBHQtM44P1Krs1lbIUK', NULL, 'staff', '2026-03-09 11:55:49'),
(6, 'lucas', '$2b$10$gCDLXLfyuvWuXeovKcma1.1mq95Pyd886ZvFJuc4iAGv3W0peUXnu', NULL, 'staff', '2026-03-09 13:01:54'),
(7, 'staff', '$2b$10$7C8eFrgyf12XT2ro7IS94.CeW8ExWk7lnfAXBB5Tq1ZR6xVDdJhga', NULL, 'staff', '2026-03-18 11:50:45'),
(8, 'user', '$2b$10$zXwJJggmlk2U/RLf5KBG5.4ERpym7AjhuQpVQrCkeI37A0I9RPTNC', 'lucas', 'staff', '2026-03-30 05:40:59'),
(9, 'Stafff', '$2b$10$NYqHw9xY.SJ1qBea.5bTsuF8cNypGRf2kZcg4aPrA94O/4QqG/ZTu', 'Lucas', 'staff', '2026-04-01 10:07:06'),
(10, 'testtt', '$2b$10$4UA1R9DDwFxF.t5HnF2A8eoBQBBhAJPVyxnNNb/zyK/cBMQFWsV7.', 'Kakaka', 'staff', '2026-04-01 10:12:42'),
(11, 'user1', '$2b$10$Iuo9UOQ.3IdboUN8KmPgNectY7yT.kJMuiSLOJCwpoIQPsL3o53bi', 'lúcá', 'user', '2026-04-02 09:55:10');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_history`
--

CREATE TABLE `user_history` (
  `user_history_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `unit_name` varchar(255) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `date` datetime DEFAULT current_timestamp(),
  `address` text DEFAULT NULL,
  `payment` varchar(100) DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `user_history`
--

INSERT INTO `user_history` (`user_history_id`, `user_id`, `product_id`, `unit_name`, `quantity`, `date`, `address`, `payment`, `total_price`) VALUES
(1, 11, 1, 'Viên', 7, '2026-04-02 22:49:37', '123 Đường Lê Lợi, Quận 1, TP.HCM', 'Chuyển khoản', 24500.00),
(2, 11, 6, 'Viên', 50, '2026-04-02 22:52:37', '456 Đường CMT8, Quận 3, TP.HCM', 'Tiền mặt', 175000.00);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `error_logs`
--
ALTER TABLE `error_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `export_ticket`
--
ALTER TABLE `export_ticket`
  ADD PRIMARY KEY (`ticket_id`),
  ADD KEY `fk_product_ticket_user` (`user_id`);

--
-- Chỉ mục cho bảng `export_ticket_detail`
--
ALTER TABLE `export_ticket_detail`
  ADD PRIMARY KEY (`detail_id`),
  ADD KEY `fk_export_detail_ticket` (`ticket_id`),
  ADD KEY `fk_export_detail_batch` (`batch_id`),
  ADD KEY `fk_export_ticket_detail_unit` (`unit_id`);

--
-- Chỉ mục cho bảng `history_activity`
--
ALTER TABLE `history_activity`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`product_id`),
  ADD UNIQUE KEY `product_code` (`product_code`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `fk_product_unit` (`unit_id`),
  ADD KEY `fk_product_supplier` (`supplier_id`);

--
-- Chỉ mục cho bảng `product_batch`
--
ALTER TABLE `product_batch`
  ADD PRIMARY KEY (`batch_id`),
  ADD KEY `fk_product_batch_user` (`user_id`),
  ADD KEY `fk_product_batch_supplier` (`supplier_id`);

--
-- Chỉ mục cho bảng `product_batch_detail`
--
ALTER TABLE `product_batch_detail`
  ADD PRIMARY KEY (`batch_detail_id`),
  ADD KEY `fk_detail_batch` (`batch_id`),
  ADD KEY `fk_detail_product` (`product_id`),
  ADD KEY `fk_detail_unit` (`unit_id`);

--
-- Chỉ mục cho bảng `product_category`
--
ALTER TABLE `product_category`
  ADD PRIMARY KEY (`category_id`);

--
-- Chỉ mục cho bảng `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Chỉ mục cho bảng `supplier`
--
ALTER TABLE `supplier`
  ADD PRIMARY KEY (`supplier_id`);

--
-- Chỉ mục cho bảng `unit`
--
ALTER TABLE `unit`
  ADD PRIMARY KEY (`unit_id`);

--
-- Chỉ mục cho bảng `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Chỉ mục cho bảng `user_history`
--
ALTER TABLE `user_history`
  ADD PRIMARY KEY (`user_history_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `error_logs`
--
ALTER TABLE `error_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT cho bảng `export_ticket`
--
ALTER TABLE `export_ticket`
  MODIFY `ticket_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `export_ticket_detail`
--
ALTER TABLE `export_ticket_detail`
  MODIFY `detail_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `history_activity`
--
ALTER TABLE `history_activity`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT cho bảng `product`
--
ALTER TABLE `product`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT cho bảng `product_batch`
--
ALTER TABLE `product_batch`
  MODIFY `batch_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT cho bảng `product_batch_detail`
--
ALTER TABLE `product_batch_detail`
  MODIFY `batch_detail_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `product_category`
--
ALTER TABLE `product_category`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `supplier`
--
ALTER TABLE `supplier`
  MODIFY `supplier_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `user_history`
--
ALTER TABLE `user_history`
  MODIFY `user_history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `error_logs`
--
ALTER TABLE `error_logs`
  ADD CONSTRAINT `error_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `export_ticket`
--
ALTER TABLE `export_ticket`
  ADD CONSTRAINT `fk_export_ticket_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_product_ticket_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `export_ticket_detail`
--
ALTER TABLE `export_ticket_detail`
  ADD CONSTRAINT `fk_export_detail_batch` FOREIGN KEY (`batch_id`) REFERENCES `product_batch` (`batch_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_export_detail_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `export_ticket` (`ticket_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_export_ticket_detail_unit` FOREIGN KEY (`unit_id`) REFERENCES `unit` (`unit_id`);

--
-- Các ràng buộc cho bảng `history_activity`
--
ALTER TABLE `history_activity`
  ADD CONSTRAINT `history_activity_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `fk_product_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`supplier_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_product_unit` FOREIGN KEY (`unit_id`) REFERENCES `unit` (`unit_id`),
  ADD CONSTRAINT `product_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `product_category` (`category_id`);

--
-- Các ràng buộc cho bảng `product_batch`
--
ALTER TABLE `product_batch`
  ADD CONSTRAINT `fk_product_batch_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`supplier_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_product_batch_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `product_batch_detail`
--
ALTER TABLE `product_batch_detail`
  ADD CONSTRAINT `fk_detail_batch` FOREIGN KEY (`batch_id`) REFERENCES `product_batch` (`batch_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_detail_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_detail_unit` FOREIGN KEY (`unit_id`) REFERENCES `unit` (`unit_id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `user_history`
--
ALTER TABLE `user_history`
  ADD CONSTRAINT `user_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  ADD CONSTRAINT `user_history_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
