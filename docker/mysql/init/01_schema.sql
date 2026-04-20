-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 01, 2026 at 02:25 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pharmacymanagement`
--

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `full_name` varchar(150) DEFAULT NULL,
  `role` enum('admin','staff','user') NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `username`, `password`, `full_name`, `role`, `created_at`) VALUES
(3, 'duocsi_01', '$2b$10$UOLjhQCkprlSpAWiIHyD8O1dTo5srWtHB0GDP3JfBgLWfvX2kvjx.', 'Dược Sĩ Nguyễn Văn B', 'admin', '2026-03-05 09:44:14'),
(4, 'admin', '$2b$10$ddFauftQonj8Ix9T.LvRJ.oQpsrJM.r6REmiyV8EcjEqXNw3Qe8/2', NULL, 'admin', '2026-03-09 09:50:32'),
(5, 'tin', '$2b$10$4TqyrDtKveys3UStq/okpO7u85WpMQ17smDBHQtM44P1Krs1lbIUK', NULL, 'staff', '2026-03-09 11:55:49'),
(6, 'lucas', '$2b$10$gCDLXLfyuvWuXeovKcma1.1mq95Pyd886ZvFJuc4iAGv3W0peUXnu', NULL, 'staff', '2026-03-09 13:01:54'),
(7, 'staff', '$2b$10$7C8eFrgyf12XT2ro7IS94.CeW8ExWk7lnfAXBB5Tq1ZR6xVDdJhga', NULL, 'staff', '2026-03-18 11:50:45'),
(8, 'user', '$2b$10$zXwJJggmlk2U/RLf5KBG5.4ERpym7AjhuQpVQrCkeI37A0I9RPTNC', 'lucas', 'staff', '2026-03-30 05:40:59'),
(15, 'user2', '$2b$10$dVOzkZd7j/dQvWOJYG.7sur0BYfZiUiNXPhlXH48k9ryjCbH0kHNq', 'minh', 'user', '2026-04-01 09:50:11');

-- --------------------------------------------------------

--
-- Table structure for table `product_category`
--

CREATE TABLE IF NOT EXISTS `product_category` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_category`
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
-- Table structure for table `unit`
--

CREATE TABLE IF NOT EXISTS `unit` (
  `unit_id` int(11) NOT NULL AUTO_INCREMENT,
  `unit_name` varchar(255) NOT NULL,
  PRIMARY KEY (`unit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `unit`
--

INSERT INTO `unit` (`unit_id`, `unit_name`) VALUES
(1, 'Hộp'),
(2, 'Viên'),
(3, 'Tuýp'),
(4, 'Lọ'),
(5, 'Chai');

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE IF NOT EXISTS `product` (
  `product_id` int(11) NOT NULL AUTO_INCREMENT,
  `product_code` varchar(50) DEFAULT NULL,
  `product_name` varchar(200) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `purchase_price` decimal(10,2) DEFAULT NULL,
  `selling_price` decimal(10,2) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `active_ingredient` varchar(255) DEFAULT NULL,
  `manufacturer` varchar(255) DEFAULT NULL,
  `packing_style` varchar(255) DEFAULT NULL,
  `storage_condition` varchar(255) DEFAULT NULL,
  `unit_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `product_code` (`product_code`),
  KEY `category_id` (`category_id`),
  KEY `fk_product_unit` (`unit_id`),
  CONSTRAINT `product_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `product_category` (`category_id`),
  CONSTRAINT `fk_product_unit` FOREIGN KEY (`unit_id`) REFERENCES `unit` (`unit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`product_id`, `product_code`, `product_name`, `category_id`, `purchase_price`, `selling_price`, `image`, `description`, `created_at`, `active_ingredient`, `manufacturer`, `packing_style`, `storage_condition`, `unit_id`) VALUES
(1, NULL, 'Paracetamol 500mg', 1, 2500.00, 3500.00, 'paracetamol.jpg', 'Thuốc giảm đau hạ sốt cập nhật', '2026-03-09 13:15:42', NULL, NULL, NULL, NULL, NULL),
(2, NULL, 'Paracetamol 500mg', 2, 5000.00, 8000.00, NULL, 'Giảm đau hạ sốt nhanh', '2026-03-09 13:15:42', NULL, NULL, NULL, NULL, NULL),
(3, NULL, 'Vitamin C 1000mg', 3, 35000.00, 50000.00, NULL, 'Viên sủi tăng sức đề kháng', '2026-03-09 13:15:42', NULL, NULL, NULL, NULL, NULL),
(4, NULL, 'Khẩu trang N95', 4, 150000.00, 200000.00, NULL, 'Khẩu trang lọc bụi mịn và vi khuẩn', '2026-03-09 13:15:42', NULL, NULL, NULL, NULL, NULL),
(5, NULL, 'Paracetamol', 1, 2000.00, 3000.00, 'paracetamol.jpg', 'Thuốc giảm đau hạ sốt', '2026-03-11 14:49:08', NULL, NULL, NULL, NULL, NULL),
(6, 'THUOC001', 'Paracetamol 500mg', 1, 2000.00, 3000.00, 'paracetamol.jpg', 'Thuốc giảm đau hạ sốt', '2026-03-11 15:07:05', NULL, NULL, NULL, NULL, NULL),
(7, 'K002', 'Test2', 1, 2500.00, 3500.00, 'paracetamol.jpg', 'Test2', '2026-03-11 15:07:42', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_batch`
--

CREATE TABLE IF NOT EXISTS `product_batch` (
  `batch_id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `batch_number` varchar(100) DEFAULT NULL,
  `manufacture_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `import_price` decimal(10,2) DEFAULT NULL,
  `current_quantity` int(11) DEFAULT NULL,
  PRIMARY KEY (`batch_id`),
  KEY `fk_product_batch_product` (`product_id`),
  CONSTRAINT `fk_product_batch_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_export`
--

CREATE TABLE IF NOT EXISTS `product_export` (
  `export_id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `export_price` decimal(15,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  PRIMARY KEY (`export_id`),
  KEY `fk_product_export` (`product_id`),
  CONSTRAINT `fk_product_export` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_image`
--

CREATE TABLE IF NOT EXISTS `product_image` (
  `image_id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`image_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_image_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `history_activity`
--

CREATE TABLE IF NOT EXISTS `history_activity` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `action` varchar(20) NOT NULL,
  `entity` varchar(50) NOT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `history_activity_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_history`
--

CREATE TABLE IF NOT EXISTS `user_history` (
  `user_history_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `date` datetime DEFAULT current_timestamp(),
  `address` text DEFAULT NULL,
  `payment` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`user_history_id`),
  KEY `fk_history_user` (`user_id`),
  KEY `fk_history_product` (`product_id`),
  KEY `fk_history_unit` (`unit_id`),
  CONSTRAINT `fk_history_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  CONSTRAINT `fk_history_unit` FOREIGN KEY (`unit_id`) REFERENCES `unit` (`unit_id`),
  CONSTRAINT `fk_history_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supplier`
--

CREATE TABLE IF NOT EXISTS `supplier` (
  `supplier_id` int(11) NOT NULL AUTO_INCREMENT,
  `supplier_name` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`supplier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `supplier`
--

INSERT INTO `supplier` (`supplier_id`, `supplier_name`, `phone`, `email`, `address`) VALUES
(1, 'Dược phẩm Hậu Giang', '02923891433', 'dhgpharma@dhgpharma.com.vn', 'Cần Thơ, Việt Nam'),
(2, 'Traphaco', '18006612', 'info@traphaco.com.vn', 'Hoàng Mai, Hà Nội'),
(3, 'Phân phối Pharmadic', '02838330105', 'contact@pharmadic.vn', 'Quận 10, TP.HCM'),
(4, 'Thiết bị y tế Vinamed', '0243823567', 'vinamed@vnn.vn', 'Đống Đa, Hà Nội');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
