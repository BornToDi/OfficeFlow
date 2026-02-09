-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Feb 09, 2026 at 12:06 PM
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
-- Database: `conveyance`
--

-- --------------------------------------------------------

--
-- Table structure for table `bill`
--

CREATE TABLE `bill` (
  `id` varchar(191) NOT NULL,
  `companyName` varchar(191) NOT NULL,
  `companyAddress` varchar(191) NOT NULL,
  `employeeId` varchar(191) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `amountInWords` varchar(191) NOT NULL,
  `status` enum('DRAFT','SUBMITTED','APPROVED_BY_SUPERVISOR','APPROVED_BY_ACCOUNTS','APPROVED_BY_MANAGEMENT','REJECTED_BY_SUPERVISOR','REJECTED_BY_ACCOUNTS','REJECTED_BY_MANAGEMENT','PAID') NOT NULL DEFAULT 'SUBMITTED',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `supervisorId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bill`
--

INSERT INTO `bill` (`id`, `companyName`, `companyAddress`, `employeeId`, `amount`, `amountInWords`, `status`, `createdAt`, `updatedAt`, `supervisorId`) VALUES
('cmh7d42mk0006tthwl5ot7eng', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh560lwv000httice83sp9ra', 1340.00, 'One Thousand Three Hundred Forty Taka Only', 'APPROVED_BY_ACCOUNTS', '2025-10-26 07:03:18.092', '2025-12-10 07:50:42.440', NULL),
('cmh7d5y4h000btthwo85saat5', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh560lwv000httice83sp9ra', 715.00, 'Seven Hundred Fifteen Taka Only', 'PAID', '2025-10-26 07:04:45.569', '2025-10-26 07:06:58.280', NULL),
('cmh7dxkv2000ptthwkvx9orv9', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh560lwv000httice83sp9ra', 60.00, 'Sixty Taka Only', 'APPROVED_BY_SUPERVISOR', '2025-10-26 07:26:14.750', '2025-12-10 08:15:58.552', NULL),
('cmh7elpt4000ttthwqup8sdbk', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh560lwv000httice83sp9ra', 7.00, 'Seven Taka Only', 'APPROVED_BY_SUPERVISOR', '2025-10-26 07:45:00.905', '2025-12-10 08:06:06.577', NULL),
('cmh7ewa7s000xtthwxm094gzl', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh560lwv000httice83sp9ra', 24.00, 'Twenty Four Taka Only', 'APPROVED_BY_SUPERVISOR', '2025-10-26 07:53:13.912', '2025-12-10 08:07:29.561', NULL),
('cmh7fgxsq0011tthwfat89jgm', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh560lwv000httice83sp9ra', 16.00, 'Sixteen Taka Only', 'APPROVED_BY_SUPERVISOR', '2025-10-26 08:09:17.594', '2025-12-10 07:56:58.753', NULL),
('cmh7h3nqe0015tthwtpsn0n97', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh560lwv000httice83sp9ra', 90.00, 'Ninety Taka Only', 'APPROVED_BY_SUPERVISOR', '2025-10-26 08:54:57.254', '2025-12-10 07:52:10.207', NULL),
('cmh7h6ghh001ltthwo3cyno5w', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh560lwv000httice83sp9ra', 90.00, 'Ninety Taka Only', 'PAID', '2025-10-26 08:57:07.830', '2025-12-10 11:57:40.004', 'cmipykw890000tti40dm8rhxe'),
('cmh7hi3i30020tthwomc8kjep', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh560lwv000httice83sp9ra', 90.00, 'Ninety Taka Only', 'REJECTED_BY_MANAGEMENT', '2025-10-26 09:06:10.875', '2025-10-30 21:28:37.638', NULL),
('cmh7jk382002stthw8shn28yr', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh7ijgst002qtthw0rzw9ti2', 230.00, 'Two Hundred Thirty Taka Only', 'PAID', '2025-10-26 10:03:43.058', '2025-10-26 10:08:40.364', NULL),
('cmh7k36340037tthwj2wye6hw', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh7iie8s002otthwsszfqgw5', 173.00, 'One Hundred Seventy Three Taka Only', 'REJECTED_BY_ACCOUNTS', '2025-10-26 10:18:33.232', '2025-10-26 10:24:21.421', NULL),
('cmh7k6c5q003dtthw0o882cds', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh7ijgst002qtthw0rzw9ti2', 10.00, 'Ten Taka Only', 'APPROVED_BY_ACCOUNTS', '2025-10-26 10:21:01.070', '2025-12-10 07:51:46.626', NULL),
('cmhc0m99n0002ttv0952adpqr', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmhc0lljx0000ttv0rqm0p5d8', 1610.00, 'One Thousand Six Hundred Ten Taka Only', 'APPROVED_BY_ACCOUNTS', '2025-10-29 13:12:22.380', '2025-12-10 07:51:40.242', NULL),
('cmhc16kvw0009ttv01d0xq5ro', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmhc1663u0007ttv0wsyun0b9', 1212.00, 'One Thousand Two Hundred Twelve Taka Only', 'APPROVED_BY_SUPERVISOR', '2025-10-29 13:28:10.556', '2025-10-29 13:28:37.594', NULL),
('cmhc18kau000gttv0vjylkov0', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmhc186na000ettv0kdovu3ha', 1231.00, 'One Thousand Two Hundred Thirty One Taka Only', 'APPROVED_BY_SUPERVISOR', '2025-10-29 13:29:43.110', '2025-10-29 13:29:43.110', NULL),
('cmhc1a8oz000lttv02c5xlz7x', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmhc0lljx0000ttv0rqm0p5d8', 890.00, 'Eight Hundred Ninety Taka Only', 'APPROVED_BY_ACCOUNTS', '2025-10-29 13:31:01.379', '2025-12-10 07:51:33.495', NULL),
('cmhc1b8ob000qttv0j9lm81es', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmhc0lljx0000ttv0rqm0p5d8', 5.00, 'Five Taka Only', 'APPROVED_BY_ACCOUNTS', '2025-10-29 13:31:48.011', '2025-12-10 07:51:37.083', NULL),
('cmhc1cu45000vttv0gajicoe5', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh7iie8s002otthwsszfqgw5', 8.00, 'Eight Taka Only', 'APPROVED_BY_ACCOUNTS', '2025-10-29 13:33:02.454', '2025-12-10 07:51:29.748', NULL),
('cmhd4n72t0012ttv0zl3mzjyb', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmhd4mqcj0010ttv09naa2nl7', 10101.00, 'Ten Thousand One Hundred One Taka Only', 'APPROVED_BY_SUPERVISOR', '2025-10-30 07:52:50.838', '2026-01-11 09:11:28.812', NULL),
('cmhd4nl590016ttv0u9tn0kgw', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmhd4mqcj0010ttv09naa2nl7', 20.00, 'Twenty Taka Only', 'APPROVED_BY_ACCOUNTS', '2025-10-30 07:53:09.069', '2025-12-10 07:51:26.028', NULL),
('cmhd4x543001cttv0uogzbxfi', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmhd4mqcj0010ttv09naa2nl7', 90.00, 'Ninety Taka Only', 'APPROVED_BY_ACCOUNTS', '2025-10-30 08:00:34.851', '2025-12-10 07:51:18.970', NULL),
('cmhd501gh001httv0skccgbgd', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmhd4mqcj0010ttv09naa2nl7', 99.00, 'Ninety Nine Taka Only', 'APPROVED_BY_SUPERVISOR', '2025-10-30 08:02:50.082', '2026-01-11 09:11:24.938', NULL),
('cmhd50xk7001lttv0ddfg7dj3', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmhd4mqcj0010ttv09naa2nl7', 11.00, 'Eleven Taka Only', 'APPROVED_BY_ACCOUNTS', '2025-10-30 08:03:31.687', '2025-12-10 07:51:22.375', NULL),
('cmhd51ovm001qttv0p0a8bu41', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh7ijgst002qtthw0rzw9ti2', 33.00, 'Thirty Three Taka Only', 'APPROVED_BY_ACCOUNTS', '2025-10-30 08:04:07.090', '2025-12-10 07:51:14.834', NULL),
('cmhd529xq001vttv0e2bvlgqt', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh7iie8s002otthwsszfqgw5', 22.00, 'Twenty Two Taka Only', 'APPROVED_BY_ACCOUNTS', '2025-10-30 08:04:34.382', '2025-12-10 07:51:09.818', NULL),
('cmhdfhzfz0020ttv0qtvgd4p0', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmhd4mqcj0010ttv09naa2nl7', 45.00, 'Forty Five Taka Only', 'APPROVED_BY_ACCOUNTS', '2025-10-30 12:56:43.439', '2025-12-10 07:51:06.388', NULL),
('cmhdfyzf30026ttv0lzoywa8w', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmhd4mqcj0010ttv09naa2nl7', 6.00, 'Six Taka Only', 'APPROVED_BY_SUPERVISOR', '2025-10-30 13:09:56.559', '2026-01-11 09:11:20.317', NULL),
('cmhdgjw0w002dttv0rw9195lx', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmhdgjk4w002bttv0wt80w3nf', 60000000.00, 'Sixty Million Taka Only', 'APPROVED_BY_ACCOUNTS', '2025-10-30 13:26:11.937', '2025-12-10 07:51:01.689', NULL),
('cmhdvu2th0003ttron404qncb', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh7ijgst002qtthw0rzw9ti2', 12.00, 'Twelve Taka Only', 'APPROVED_BY_SUPERVISOR', '2025-10-30 20:34:01.541', '2026-01-03 07:39:15.122', NULL),
('cmhdwk4kb0008ttrohgyxucs5', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmhd4mqcj0010ttv09naa2nl7', 78.00, 'Seventy Eight Taka Only', 'APPROVED_BY_SUPERVISOR', '2025-10-30 20:54:16.860', '2026-01-11 09:11:14.644', NULL),
('cmhdwkpof000dttroclfkd8od', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmhd4mqcj0010ttv09naa2nl7', 90.00, 'Ninety Taka Only', 'APPROVED_BY_SUPERVISOR', '2025-10-30 20:54:44.223', '2026-01-11 08:52:20.045', NULL),
('cmhdwr01j000ottrog5s681i2', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmhd4mqcj0010ttv09naa2nl7', 15.00, 'Fifteen Taka Only', 'APPROVED_BY_SUPERVISOR', '2025-10-30 20:59:37.591', '2026-01-03 07:38:07.108', NULL),
('cmi056w8a0001tt3wdfetzhbc', 'Mason and Bray LLC', 'Freeman and Bishop LLC', 'cmh560lwv000httice83sp9ra', 1.00, 'One Taka Only', 'APPROVED_BY_ACCOUNTS', '2025-11-15 10:26:51.945', '2025-12-10 07:50:57.235', NULL),
('cmi076arz000ott3wewtenkkg', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh560lwv000httice83sp9ra', 555651.00, 'Five Hundred Fifty Five Thousand Six Hundred Fifty One Taka Only', 'APPROVED_BY_ACCOUNTS', '2025-11-15 11:22:23.375', '2025-12-10 07:50:33.743', NULL),
('cmi07p01j0014tt3we52mcp7w', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh560lwv000httice83sp9ra', 31.00, 'Thirty One Taka Only', 'APPROVED_BY_ACCOUNTS', '2025-11-15 11:36:55.928', '2025-12-10 07:50:24.239', NULL),
('cmi07sby4001htt3wlh1hves7', 'Finley and Woodard Traders', 'Patterson Whitehead Plc', 'cmh560lwv000httice83sp9ra', 24.00, 'Twenty Four Taka Only', 'REJECTED_BY_SUPERVISOR', '2025-11-15 11:39:31.324', '2025-12-10 07:15:58.477', NULL),
('cmi07t43m001mtt3wxjs0ha4w', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh560lwv000httice83sp9ra', 81.00, 'Eighty One Taka Only', 'PAID', '2025-11-15 11:40:07.810', '2025-12-03 12:15:20.765', NULL),
('cmi1dri8q001rtt3w8wav99u7', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh55yupd000etticzq6943up', 30.00, 'Thirty Taka Only', 'SUBMITTED', '2025-11-16 07:14:36.698', '2025-11-16 07:14:36.698', NULL),
('cmi1elpqg0020tt3wrqa8bioq', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh55yupd000etticzq6943up', 80.00, 'Eighty Taka Only', 'APPROVED_BY_ACCOUNTS', '2025-11-16 07:38:06.089', '2025-12-10 07:50:52.125', NULL),
('cmi1f4xm3002ftt3w5gi022mz', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmi1f46q7002dtt3w9qojv0mn', 300.00, 'Three Hundred Taka Only', 'APPROVED_BY_ACCOUNTS', '2025-11-16 07:53:02.763', '2025-12-10 07:50:27.577', NULL),
('cmi1fvmhx002qtt3w08lf3kp5', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmi1f46q7002dtt3w9qojv0mn', 30.00, 'Thirty Taka Only', 'REJECTED_BY_SUPERVISOR', '2025-11-16 08:13:48.069', '2025-11-16 09:11:28.593', NULL),
('cmi1jkbso003btt3w5ah36ljl', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmi1f46q7002dtt3w9qojv0mn', 8100.00, 'Eight Thousand One Hundred Taka Only', 'APPROVED_BY_ACCOUNTS', '2025-11-16 09:56:59.449', '2025-12-10 07:50:20.417', NULL),
('cmipyr89a0003tti48ekevt95', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmipymhfv0001tti408jdcrnc', 845.00, 'Eight Hundred Forty Five Taka Only', 'SUBMITTED', '2025-12-03 12:08:43.918', '2025-12-03 12:08:43.918', NULL),
('cmipys28p0008tti4xga7b99t', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmipymhfv0001tti408jdcrnc', 17.00, 'Seventeen Taka Only', 'APPROVED_BY_ACCOUNTS', '2025-12-03 12:09:22.778', '2025-12-10 07:50:16.400', NULL),
('cmizoez070007ttd0jcd979om', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh560lwv000httice83sp9ra', 20.00, 'Twenty Taka Only', 'APPROVED_BY_ACCOUNTS', '2025-12-10 07:16:57.655', '2025-12-10 07:50:11.274', NULL),
('cmizzhu0q0001ttx476qnid2d', 'Networld Bangladesh Limited', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh560lwv000httice83sp9ra', 3.00, 'Three Taka Only', 'REJECTED_BY_SUPERVISOR', '2025-12-10 12:27:06.938', '2026-01-01 09:07:30.816', NULL),
('cmk9gkbpt0001ttzcx53vdxq2', 'Networld Bangladesh PLC', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh55yupd000etticzq6943up', 600.00, 'Six Hundred Taka Only', 'SUBMITTED', '2026-01-11 08:14:34.550', '2026-01-11 08:14:34.550', NULL),
('cmk9gnko60006ttzcfbcccc90', 'Networld Bangladesh PLC', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh560lwv000httice83sp9ra', 1234567890.00, 'One Billion Two Hundred Thirty Four Million Five Hundred Sixty Seven Thousand Eight Hundred Ninety Taka Only', 'APPROVED_BY_ACCOUNTS', '2026-01-11 08:17:06.150', '2026-01-11 08:19:05.112', 'cmh7iie8s002otthwsszfqgw5'),
('cmk9gqq1w000httzcniovqb45', 'Networld Bangladesh PLC', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh7iie8s002otthwsszfqgw5', 666.00, 'Six Hundred Sixty Six Taka Only', 'SUBMITTED', '2026-01-11 08:19:33.092', '2026-01-11 08:19:33.092', NULL),
('cmk9h76t0000mttzckq4y4i8r', 'Networld Bangladesh PLC', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh55yupd000etticzq6943up', 199.00, 'One Hundred Ninety Nine Taka Only', 'SUBMITTED', '2026-01-11 08:32:21.300', '2026-01-11 08:32:21.300', NULL),
('cmk9hc0no000sttzc04cu8m8y', 'Networld Bangladesh PLC', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmk9hbnvh000qttzco9o058r4', 200.00, 'Two Hundred Taka Only', 'SUBMITTED', '2026-01-11 08:36:06.612', '2026-01-11 08:36:06.612', NULL),
('cmk9hi75q000xttzctyvwwwte', 'Networld Bangladesh PLC', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh7iie8s002otthwsszfqgw5', 2.00, 'Two Taka Only', 'SUBMITTED', '2026-01-11 08:40:54.974', '2026-01-11 08:40:54.974', NULL),
('cmk9hjpqp0012ttzcwhmrdzfo', 'Networld Bangladesh PLC', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh7ijgst002qtthw0rzw9ti2', 3.00, 'Three Taka Only', 'APPROVED_BY_SUPERVISOR', '2026-01-11 08:42:05.714', '2026-01-11 08:43:08.153', 'cmh55yupd000etticzq6943up'),
('cmk9hwbbd001bttzcfbjp4oj3', 'Networld Bangladesh PLC', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh55yupd000etticzq6943up', 5.00, 'Five Taka Only', 'APPROVED_BY_SUPERVISOR', '2026-01-11 08:51:53.544', '2026-01-11 08:54:18.099', 'cmh7iie8s002otthwsszfqgw5'),
('cmk9hxg3w001kttzcgx4ndgqr', 'Networld Bangladesh PLC', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh7iie8s002otthwsszfqgw5', 1.00, 'One Taka Only', 'SUBMITTED', '2026-01-11 08:52:46.413', '2026-01-11 08:52:46.413', NULL),
('cmk9idlt9001rttzc5spzvhud', 'Networld Bangladesh PLC', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh55yupd000etticzq6943up', 10.00, 'Ten Taka Only', 'SUBMITTED', '2026-01-11 09:05:20.301', '2026-01-11 09:05:20.301', NULL),
('cmk9ijgsg001wttzcolzbw94f', 'Networld Bangladesh PLC', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh55yupd000etticzq6943up', 411.00, 'Four Hundred Eleven Taka Only', 'APPROVED_BY_SUPERVISOR', '2026-01-11 09:09:53.727', '2026-01-11 09:09:53.727', NULL),
('cmk9ik8j90022ttzcrk1j3t5k', 'Networld Bangladesh PLC', '57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka', 'cmh560lwv000httice83sp9ra', 551.00, 'Five Hundred Fifty One Taka Only', 'PAID', '2026-01-11 09:10:29.683', '2026-01-11 09:45:15.730', 'cmh7iie8s002otthwsszfqgw5');

-- --------------------------------------------------------

--
-- Table structure for table `billhistory`
--

CREATE TABLE `billhistory` (
  `id` varchar(191) NOT NULL,
  `billId` varchar(191) NOT NULL,
  `status` enum('DRAFT','SUBMITTED','APPROVED_BY_SUPERVISOR','APPROVED_BY_ACCOUNTS','APPROVED_BY_MANAGEMENT','REJECTED_BY_SUPERVISOR','REJECTED_BY_ACCOUNTS','REJECTED_BY_MANAGEMENT','PAID') NOT NULL,
  `actorId` varchar(191) DEFAULT NULL,
  `comment` longtext DEFAULT NULL,
  `timestamp` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `billhistory`
--

INSERT INTO `billhistory` (`id`, `billId`, `status`, `actorId`, `comment`, `timestamp`) VALUES
('cmh7d42mk0009tthwrile2n8g', 'cmh7d42mk0006tthwl5ot7eng', 'SUBMITTED', NULL, 'Submitted by employee', '2025-10-26 07:03:18.092'),
('cmh7d5y4h000dtthwts4u1m7w', 'cmh7d5y4h000btthwo85saat5', 'SUBMITTED', NULL, 'Submitted by employee', '2025-10-26 07:04:45.569'),
('cmh7d6jci000ftthwcc4lk47m', 'cmh7d5y4h000btthwo85saat5', 'APPROVED_BY_SUPERVISOR', 'cmh55yupd000etticzq6943up', NULL, '2025-10-26 07:05:13.074'),
('cmh7d78aj000htthw2l1pviqv', 'cmh7d5y4h000btthwo85saat5', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', NULL, '2025-10-26 07:05:45.404'),
('cmh7d7plh000jtthwd6dhk01t', 'cmh7d5y4h000btthwo85saat5', 'APPROVED_BY_MANAGEMENT', 'cmh7c1v1u0004tthwbzu6cqtd', NULL, '2025-10-26 07:06:07.830'),
('cmh7d88sf000ltthwlkx0jcml', 'cmh7d5y4h000btthwo85saat5', 'APPROVED_BY_MANAGEMENT', 'cmh5686f5000wtticun26uzcw', 'Payment requested from employee', '2025-10-26 07:06:32.703'),
('cmh7d8sj5000ntthw8kbpqyn5', 'cmh7d5y4h000btthwo85saat5', 'PAID', 'cmh560lwv000httice83sp9ra', 'Payment confirmed by employee.', '2025-10-26 07:06:58.289'),
('cmh7dxkv2000rtthww3zs96k7', 'cmh7dxkv2000ptthwkvx9orv9', 'SUBMITTED', NULL, 'Submitted by employee', '2025-10-26 07:26:14.750'),
('cmh7elpt5000vtthw1g4mdc49', 'cmh7elpt4000ttthwqup8sdbk', 'SUBMITTED', NULL, 'Submitted by employee', '2025-10-26 07:45:00.905'),
('cmh7ewa7s000ztthwwrgbtr2o', 'cmh7ewa7s000xtthwxm094gzl', 'SUBMITTED', NULL, 'Submitted by employee', '2025-10-26 07:53:13.912'),
('cmh7fgxsq0013tthwadf748f5', 'cmh7fgxsq0011tthwfat89jgm', 'SUBMITTED', NULL, 'Submitted by employee', '2025-10-26 08:09:17.594'),
('cmh7h3nqe0018tthw7n259f5k', 'cmh7h3nqe0015tthwtpsn0n97', 'DRAFT', 'cmh560lwv000httice83sp9ra', 'Draft created by employee', '2025-10-26 08:54:57.254'),
('cmh7h5p56001ctthwq07mvzww', 'cmh7h3nqe0015tthwtpsn0n97', 'DRAFT', 'cmh560lwv000httice83sp9ra', 'Finalized draft before submit', '2025-10-26 08:56:32.394'),
('cmh7h5p5t001etthwf9xwt3yi', 'cmh7h3nqe0015tthwtpsn0n97', 'SUBMITTED', 'cmh560lwv000httice83sp9ra', 'Submitted from draft', '2025-10-26 08:56:32.418'),
('cmh7h6ghi001otthw53zv4wjz', 'cmh7h6ghh001ltthwo3cyno5w', 'DRAFT', 'cmh560lwv000httice83sp9ra', 'Draft created by employee', '2025-10-26 08:57:07.830'),
('cmh7hfqs7001stthw7fsdgl7k', 'cmh7h6ghh001ltthwo3cyno5w', 'DRAFT', 'cmh560lwv000httice83sp9ra', 'Draft updated by user', '2025-10-26 09:04:21.079'),
('cmh7hh0i1001wtthw2bjngm0s', 'cmh7h6ghh001ltthwo3cyno5w', 'DRAFT', 'cmh560lwv000httice83sp9ra', 'Finalized draft before submit', '2025-10-26 09:05:20.329'),
('cmh7hh0iu001ytthwj68bjdmg', 'cmh7h6ghh001ltthwo3cyno5w', 'SUBMITTED', 'cmh560lwv000httice83sp9ra', 'Submitted from draft', '2025-10-26 09:05:20.358'),
('cmh7hi3i30023tthwiepzeffu', 'cmh7hi3i30020tthwomc8kjep', 'DRAFT', 'cmh560lwv000httice83sp9ra', 'Draft created by employee', '2025-10-26 09:06:10.875'),
('cmh7hlfrj0027tthw9os98efy', 'cmh7hi3i30020tthwomc8kjep', 'DRAFT', 'cmh560lwv000httice83sp9ra', 'Draft updated by user', '2025-10-26 09:08:46.735'),
('cmh7hx0xf002btthwdw3snu97', 'cmh7hi3i30020tthwomc8kjep', 'DRAFT', 'cmh560lwv000httice83sp9ra', 'Draft updated by user', '2025-10-26 09:17:47.380'),
('cmh7hzr3c002ftthwpbpc464z', 'cmh7hi3i30020tthwomc8kjep', 'DRAFT', 'cmh560lwv000httice83sp9ra', 'Finalized draft before submit', '2025-10-26 09:19:54.600'),
('cmh7hzr49002htthwf69ioktm', 'cmh7hi3i30020tthwomc8kjep', 'SUBMITTED', 'cmh560lwv000httice83sp9ra', 'Submitted from draft', '2025-10-26 09:19:54.634'),
('cmh7i08ti002jtthwc4ug339j', 'cmh7hi3i30020tthwomc8kjep', 'APPROVED_BY_SUPERVISOR', 'cmh55yupd000etticzq6943up', NULL, '2025-10-26 09:20:17.574'),
('cmh7i0sl9002ltthwv4ekv94v', 'cmh7hi3i30020tthwomc8kjep', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', NULL, '2025-10-26 09:20:43.197'),
('cmh7jk383002vtthwita7rxyy', 'cmh7jk382002stthw8shn28yr', 'SUBMITTED', NULL, 'Submitted by employee', '2025-10-26 10:03:43.058'),
('cmh7jmbt8002xtthwxbnx7be5', 'cmh7jk382002stthw8shn28yr', 'APPROVED_BY_SUPERVISOR', 'cmh7iie8s002otthwsszfqgw5', NULL, '2025-10-26 10:05:27.500'),
('cmh7johy8002ztthwwa9ldzp9', 'cmh7jk382002stthw8shn28yr', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', NULL, '2025-10-26 10:07:08.769'),
('cmh7jp9qy0031tthwp1nzz0iu', 'cmh7jk382002stthw8shn28yr', 'APPROVED_BY_MANAGEMENT', 'cmh7c1v1u0004tthwbzu6cqtd', NULL, '2025-10-26 10:07:44.795'),
('cmh7jpuvi0033tthwwxejwpot', 'cmh7jk382002stthw8shn28yr', 'APPROVED_BY_MANAGEMENT', 'cmh5686f5000wtticun26uzcw', 'Payment requested from employee', '2025-10-26 10:08:12.174'),
('cmh7jqgmw0035tthw6llnrkf5', 'cmh7jk382002stthw8shn28yr', 'PAID', 'cmh7ijgst002qtthw0rzw9ti2', 'Payment confirmed by employee.', '2025-10-26 10:08:40.377'),
('cmh7k3634003atthw06rltxuw', 'cmh7k36340037tthwj2wye6hw', 'SUBMITTED', NULL, 'Submitted by supervisor on behalf of employee', '2025-10-26 10:18:33.232'),
('cmh7k3634003btthw09ocsw0g', 'cmh7k36340037tthwj2wye6hw', 'APPROVED_BY_SUPERVISOR', NULL, 'Auto-approved by supervisor submit', '2025-10-26 10:18:33.232'),
('cmh7k6c5q003gtthwevt8v308', 'cmh7k6c5q003dtthw0o882cds', 'SUBMITTED', NULL, 'Submitted by supervisor on behalf of employee', '2025-10-26 10:21:01.070'),
('cmh7k6c5q003htthwnljf2x0g', 'cmh7k6c5q003dtthw0o882cds', 'APPROVED_BY_SUPERVISOR', NULL, 'Auto-approved by supervisor submit', '2025-10-26 10:21:01.070'),
('cmh7kamr7003jtthwo1z7qinr', 'cmh7k36340037tthwj2wye6hw', 'REJECTED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', 'too hight ammount', '2025-10-26 10:24:21.428'),
('cmhc0m99o0004ttv0hhrhokc0', 'cmhc0m99n0002ttv0952adpqr', 'SUBMITTED', NULL, 'Submitted by supervisor on behalf of employee', '2025-10-29 13:12:22.380'),
('cmhc0m99o0005ttv03w7rdt8j', 'cmhc0m99n0002ttv0952adpqr', 'APPROVED_BY_SUPERVISOR', NULL, 'Auto-approved by supervisor submit', '2025-10-29 13:12:22.380'),
('cmhc16kvw000bttv0rq5rmujm', 'cmhc16kvw0009ttv01d0xq5ro', 'SUBMITTED', NULL, 'Submitted by supervisor (awaiting higher supervisor approval)', '2025-10-29 13:28:10.556'),
('cmhc175r8000dttv0ih89dvui', 'cmhc16kvw0009ttv01d0xq5ro', 'APPROVED_BY_SUPERVISOR', 'cmh7iie8s002otthwsszfqgw5', NULL, '2025-10-29 13:28:37.605'),
('cmhc18kau000ittv066uk02v8', 'cmhc18kau000gttv0vjylkov0', 'SUBMITTED', NULL, 'Submitted by supervisor on behalf of employee / self (no higher supervisor)', '2025-10-29 13:29:43.110'),
('cmhc18kau000jttv0flvf8uti', 'cmhc18kau000gttv0vjylkov0', 'APPROVED_BY_SUPERVISOR', NULL, 'Auto-approved by supervisor submit', '2025-10-29 13:29:43.110'),
('cmhc1a8oz000nttv011lfsj5x', 'cmhc1a8oz000lttv02c5xlz7x', 'SUBMITTED', NULL, 'Submitted by supervisor on behalf of employee / self (no higher supervisor)', '2025-10-29 13:31:01.379'),
('cmhc1a8oz000ottv0ryb7azwv', 'cmhc1a8oz000lttv02c5xlz7x', 'APPROVED_BY_SUPERVISOR', NULL, 'Auto-approved by supervisor submit', '2025-10-29 13:31:01.379'),
('cmhc1b8ob000sttv0las43cxu', 'cmhc1b8ob000qttv0j9lm81es', 'SUBMITTED', NULL, 'Submitted by supervisor on behalf of employee / self (no higher supervisor)', '2025-10-29 13:31:48.011'),
('cmhc1b8ob000tttv0660hhj60', 'cmhc1b8ob000qttv0j9lm81es', 'APPROVED_BY_SUPERVISOR', NULL, 'Auto-approved by supervisor submit', '2025-10-29 13:31:48.011'),
('cmhc1cu46000xttv0l4teygb4', 'cmhc1cu45000vttv0gajicoe5', 'SUBMITTED', NULL, 'Submitted by supervisor on behalf of employee / self (no higher supervisor)', '2025-10-29 13:33:02.454'),
('cmhc1cu46000yttv0kl55z4mk', 'cmhc1cu45000vttv0gajicoe5', 'APPROVED_BY_SUPERVISOR', NULL, 'Auto-approved by supervisor submit', '2025-10-29 13:33:02.454'),
('cmhd4n72t0014ttv0b18u07s9', 'cmhd4n72t0012ttv0zl3mzjyb', 'SUBMITTED', NULL, 'Submitted by supervisor (awaiting higher supervisor approval)', '2025-10-30 07:52:50.838'),
('cmhd4nl590018ttv0x1oljua0', 'cmhd4nl590016ttv0u9tn0kgw', 'SUBMITTED', NULL, 'Submitted by supervisor (awaiting higher supervisor approval)', '2025-10-30 07:53:09.069'),
('cmhd4nwg3001attv0ach06jjm', 'cmhd4nl590016ttv0u9tn0kgw', 'APPROVED_BY_SUPERVISOR', 'cmhd4mqcj0010ttv09naa2nl7', NULL, '2025-10-30 07:53:23.715'),
('cmhd4x543001ettv0d9zhivxx', 'cmhd4x543001cttv0uogzbxfi', 'SUBMITTED', NULL, 'Submitted by supervisor on behalf of employee / self (no higher supervisor)', '2025-10-30 08:00:34.851'),
('cmhd4x543001fttv0z6kqhe1l', 'cmhd4x543001cttv0uogzbxfi', 'APPROVED_BY_SUPERVISOR', NULL, 'Auto-approved by supervisor submit', '2025-10-30 08:00:34.851'),
('cmhd501gi001jttv00iroq2i5', 'cmhd501gh001httv0skccgbgd', 'SUBMITTED', NULL, 'Submitted by supervisor (awaiting higher supervisor approval)', '2025-10-30 08:02:50.082'),
('cmhd50xk7001nttv0d3ma82zb', 'cmhd50xk7001lttv0ddfg7dj3', 'SUBMITTED', NULL, 'Submitted by supervisor on behalf of employee / self (no higher supervisor)', '2025-10-30 08:03:31.687'),
('cmhd50xk7001ottv02hinp1nl', 'cmhd50xk7001lttv0ddfg7dj3', 'APPROVED_BY_SUPERVISOR', NULL, 'Auto-approved by supervisor submit', '2025-10-30 08:03:31.687'),
('cmhd51ovm001sttv0pwst9t1k', 'cmhd51ovm001qttv0p0a8bu41', 'SUBMITTED', NULL, 'Submitted by supervisor on behalf of employee / self (no higher supervisor)', '2025-10-30 08:04:07.090'),
('cmhd51ovm001tttv05z7mzk4m', 'cmhd51ovm001qttv0p0a8bu41', 'APPROVED_BY_SUPERVISOR', NULL, 'Auto-approved by supervisor submit', '2025-10-30 08:04:07.090'),
('cmhd529xq001xttv0kxdsef4n', 'cmhd529xq001vttv0e2bvlgqt', 'SUBMITTED', NULL, 'Submitted by supervisor on behalf of employee / self (no higher supervisor)', '2025-10-30 08:04:34.382'),
('cmhd529xq001yttv01ubah92c', 'cmhd529xq001vttv0e2bvlgqt', 'APPROVED_BY_SUPERVISOR', NULL, 'Auto-approved by supervisor submit', '2025-10-30 08:04:34.382'),
('cmhdfhzfz0022ttv015ugul5v', 'cmhdfhzfz0020ttv0qtvgd4p0', 'SUBMITTED', NULL, 'Submitted by supervisor (awaiting higher supervisor approval)', '2025-10-30 12:56:43.439'),
('cmhdfjpha0024ttv02jyi6tr9', 'cmhdfhzfz0020ttv0qtvgd4p0', 'APPROVED_BY_SUPERVISOR', 'cmhd4mqcj0010ttv09naa2nl7', NULL, '2025-10-30 12:58:03.839'),
('cmhdfyzf30029ttv0ef60he1a', 'cmhdfyzf30026ttv0lzoywa8w', 'SUBMITTED', 'cmhd4mqcj0010ttv09naa2nl7', 'Submitted by supervisor on behalf of employee', '2025-10-30 13:09:56.559'),
('cmhdgjw0x002gttv0vhgcv5fu', 'cmhdgjw0w002dttv0rw9195lx', 'SUBMITTED', 'cmhdgjk4w002bttv0wt80w3nf', 'Submitted by employee', '2025-10-30 13:26:11.937'),
('cmhdgka12002ittv04gkin3qh', 'cmhdgjw0w002dttv0rw9195lx', 'APPROVED_BY_SUPERVISOR', 'cmhd4mqcj0010ttv09naa2nl7', NULL, '2025-10-30 13:26:30.087'),
('cmhdvu2ti0006ttrote0lomb7', 'cmhdvu2th0003ttron404qncb', 'SUBMITTED', 'cmhdvt8dd0001ttro4oz8at4c', 'Submitted by supervisor on behalf of employee', '2025-10-30 20:34:01.541'),
('cmhdwk4kb000bttroclmjanxk', 'cmhdwk4kb0008ttrohgyxucs5', 'SUBMITTED', 'cmhd4mqcj0010ttv09naa2nl7', 'Submitted by supervisor on behalf of employee', '2025-10-30 20:54:16.860'),
('cmhdwkpof000gttro2aknbzme', 'cmhdwkpof000dttroclfkd8od', 'DRAFT', 'cmhd4mqcj0010ttv09naa2nl7', 'Draft created by supervisor', '2025-10-30 20:54:44.223'),
('cmhdwp90x000kttroki1f6ltf', 'cmhdwkpof000dttroclfkd8od', 'DRAFT', 'cmhd4mqcj0010ttv09naa2nl7', 'Finalized draft before submit', '2025-10-30 20:58:15.922'),
('cmhdwp93n000mttrocqi9nfyl', 'cmhdwkpof000dttroclfkd8od', 'SUBMITTED', 'cmhd4mqcj0010ttv09naa2nl7', 'Submitted from draft', '2025-10-30 20:58:16.019'),
('cmhdwr01j000rttroiteqlyn8', 'cmhdwr01j000ottrog5s681i2', 'SUBMITTED', 'cmhd4mqcj0010ttv09naa2nl7', 'Submitted by supervisor on behalf of employee', '2025-10-30 20:59:37.591'),
('cmhdxsaod000tttroa49rvsqe', 'cmh7hi3i30020tthwomc8kjep', 'REJECTED_BY_MANAGEMENT', 'cmh7c1v1u0004tthwbzu6cqtd', 'nothing', '2025-10-30 21:28:37.646'),
('cmi056w8a0004tt3w5kiix4mg', 'cmi056w8a0001tt3wdfetzhbc', 'DRAFT', 'cmh560lwv000httice83sp9ra', 'Draft created by employee', '2025-11-15 10:26:51.945'),
('cmi05dkfk0008tt3w80msk8uw', 'cmi056w8a0001tt3wdfetzhbc', 'DRAFT', 'cmh560lwv000httice83sp9ra', 'Draft updated by user', '2025-11-15 10:32:03.249'),
('cmi05wne7000ctt3woa2sl6rk', 'cmi056w8a0001tt3wdfetzhbc', 'DRAFT', 'cmh560lwv000httice83sp9ra', 'Draft updated by user', '2025-11-15 10:46:53.551'),
('cmi06pk5f000gtt3w662s21e7', 'cmi056w8a0001tt3wdfetzhbc', 'DRAFT', 'cmh560lwv000httice83sp9ra', 'Draft updated by user', '2025-11-15 11:09:22.371'),
('cmi06plbs000ktt3w5c153fj4', 'cmi056w8a0001tt3wdfetzhbc', 'DRAFT', 'cmh560lwv000httice83sp9ra', 'Finalized draft before submit', '2025-11-15 11:09:23.897'),
('cmi06plcb000mtt3w6yhymq53', 'cmi056w8a0001tt3wdfetzhbc', 'SUBMITTED', 'cmh560lwv000httice83sp9ra', 'Submitted from draft', '2025-11-15 11:09:23.916'),
('cmi076arz000rtt3wh4bzijh3', 'cmi076arz000ott3wewtenkkg', 'DRAFT', 'cmh560lwv000httice83sp9ra', 'Draft created by employee', '2025-11-15 11:22:23.375'),
('cmi07jxrd0012tt3wwv13opdr', 'cmi076arz000ott3wewtenkkg', 'DRAFT', 'cmh560lwv000httice83sp9ra', 'Draft updated by user', '2025-11-15 11:32:59.690'),
('cmi07p01k0017tt3wfj4y8zvt', 'cmi07p01j0014tt3we52mcp7w', 'DRAFT', 'cmh560lwv000httice83sp9ra', 'Draft created by employee', '2025-11-15 11:36:55.928'),
('cmi07ppku001btt3wh3c5iy58', 'cmi07p01j0014tt3we52mcp7w', 'DRAFT', 'cmh560lwv000httice83sp9ra', 'Finalized draft before submit', '2025-11-15 11:37:29.023'),
('cmi07pplk001dtt3w4nt0v59j', 'cmi07p01j0014tt3we52mcp7w', 'SUBMITTED', 'cmh560lwv000httice83sp9ra', 'Submitted from draft', '2025-11-15 11:37:29.048'),
('cmi07r8fd001ftt3wl582rslw', 'cmi07p01j0014tt3we52mcp7w', 'REJECTED_BY_SUPERVISOR', 'cmh55yupd000etticzq6943up', 'too hight ammount', '2025-11-15 11:38:40.105'),
('cmi07sby4001ktt3wmvjkvfiz', 'cmi07sby4001htt3wlh1hves7', 'SUBMITTED', NULL, 'Submitted by employee', '2025-11-15 11:39:31.324'),
('cmi07t43m001ptt3wv8uwoad8', 'cmi07t43m001mtt3wxjs0ha4w', 'SUBMITTED', NULL, 'Submitted by employee', '2025-11-15 11:40:07.810'),
('cmi1dri8q001ytt3w6dqwewo1', 'cmi1dri8q001rtt3w8wav99u7', 'SUBMITTED', NULL, 'Submitted by supervisor on behalf of employee', '2025-11-16 07:14:36.698'),
('cmi1elpqh0023tt3wclwh1flh', 'cmi1elpqg0020tt3wrqa8bioq', 'DRAFT', 'cmh55yupd000etticzq6943up', 'Draft created by supervisor', '2025-11-16 07:38:06.089'),
('cmi1emn220027tt3w4n1shmtt', 'cmi1elpqg0020tt3wrqa8bioq', 'DRAFT', 'cmh55yupd000etticzq6943up', 'Finalized draft before submit', '2025-11-16 07:38:49.274'),
('cmi1emn2k0029tt3wndu4u0fw', 'cmi1elpqg0020tt3wrqa8bioq', 'SUBMITTED', 'cmh55yupd000etticzq6943up', 'Submitted from draft', '2025-11-16 07:38:49.292'),
('cmi1emn2x002btt3wnmd2gmt7', 'cmi1elpqg0020tt3wrqa8bioq', 'APPROVED_BY_SUPERVISOR', 'cmh55yupd000etticzq6943up', 'Auto-approved by supervisor submit', '2025-11-16 07:38:49.305'),
('cmi1f4xm3002itt3wef8kjo7s', 'cmi1f4xm3002ftt3w5gi022mz', 'DRAFT', 'cmi1f46q7002dtt3w9qojv0mn', 'Draft created by employee', '2025-11-16 07:53:02.763'),
('cmi1f5any002mtt3wotf8egft', 'cmi1f4xm3002ftt3w5gi022mz', 'DRAFT', 'cmi1f46q7002dtt3w9qojv0mn', 'Finalized draft before submit', '2025-11-16 07:53:19.678'),
('cmi1f5aot002ott3wppmvp4zs', 'cmi1f4xm3002ftt3w5gi022mz', 'SUBMITTED', 'cmi1f46q7002dtt3w9qojv0mn', 'Submitted from draft', '2025-11-16 07:53:19.709'),
('cmi1fvmhx002ttt3wnln2tvu8', 'cmi1fvmhx002qtt3w08lf3kp5', 'SUBMITTED', NULL, 'Submitted by employee', '2025-11-16 08:13:48.069'),
('cmi1hitw8002xtt3w9p9r7alc', 'cmi07p01j0014tt3we52mcp7w', 'DRAFT', 'cmh560lwv000httice83sp9ra', 'Finalized draft before submit', '2025-11-16 08:59:50.360'),
('cmi1hitx4002ztt3wrouwxx2s', 'cmi07p01j0014tt3we52mcp7w', 'SUBMITTED', 'cmh560lwv000httice83sp9ra', 'Submitted (resubmission)', '2025-11-16 08:59:50.393'),
('cmi1hr10o0035tt3wlpju24ww', 'cmi076arz000ott3wewtenkkg', 'DRAFT', 'cmh560lwv000httice83sp9ra', 'Finalized draft before submit', '2025-11-16 09:06:12.840'),
('cmi1hr11i0037tt3wgczcwa6q', 'cmi076arz000ott3wewtenkkg', 'SUBMITTED', 'cmh560lwv000httice83sp9ra', 'Submitted (resubmission)', '2025-11-16 09:06:12.871'),
('cmi1hxsnr0039tt3wt5iycqa0', 'cmi1fvmhx002qtt3w08lf3kp5', 'REJECTED_BY_SUPERVISOR', 'cmh55yupd000etticzq6943up', 'no', '2025-11-16 09:11:28.599'),
('cmi1jkbso003ett3wxybed4n6', 'cmi1jkbso003btt3w5ah36ljl', 'SUBMITTED', NULL, 'Submitted by employee', '2025-11-16 09:56:59.449'),
('cmi1jlwof003gtt3wdw0lhpbk', 'cmi1jkbso003btt3w5ah36ljl', 'APPROVED_BY_SUPERVISOR', 'cmh55yupd000etticzq6943up', NULL, '2025-11-16 09:58:13.167'),
('cmi1jm9f9003itt3wsmq7vj7v', 'cmi1jkbso003btt3w5ah36ljl', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', NULL, '2025-11-16 09:58:29.685'),
('cmi1jmksc003ktt3w8w5em0dt', 'cmi1jkbso003btt3w5ah36ljl', 'REJECTED_BY_MANAGEMENT', 'cmh7c1v1u0004tthwbzu6cqtd', 'no', '2025-11-16 09:58:44.412'),
('cmi1jo4no003ott3w9a2vh6n8', 'cmi1jkbso003btt3w5ah36ljl', 'DRAFT', 'cmi1f46q7002dtt3w9qojv0mn', 'Finalized draft before submit', '2025-11-16 09:59:56.820'),
('cmi1jo4p3003qtt3wncdks651', 'cmi1jkbso003btt3w5ah36ljl', 'SUBMITTED', 'cmi1f46q7002dtt3w9qojv0mn', 'Submitted (resubmission)', '2025-11-16 09:59:56.871'),
('cmipyr89b0006tti48metyrxx', 'cmipyr89a0003tti48ekevt95', 'SUBMITTED', NULL, 'Submitted by supervisor on behalf of employee', '2025-12-03 12:08:43.918'),
('cmipys28p000btti43i2mfe36', 'cmipys28p0008tti4xga7b99t', 'DRAFT', 'cmipymhfv0001tti408jdcrnc', 'Draft created by supervisor', '2025-12-03 12:09:22.778'),
('cmipysocx000htti4hgpkrn93', 'cmipys28p0008tti4xga7b99t', 'DRAFT', 'cmipymhfv0001tti408jdcrnc', 'Finalized draft before submit', '2025-12-03 12:09:51.441'),
('cmipysody000jtti4ajou9l66', 'cmipys28p0008tti4xga7b99t', 'SUBMITTED', 'cmipymhfv0001tti408jdcrnc', 'Submitted (resubmission)', '2025-12-03 12:09:51.478'),
('cmipysoee000ltti493b37ppz', 'cmipys28p0008tti4xga7b99t', 'APPROVED_BY_SUPERVISOR', 'cmipymhfv0001tti408jdcrnc', 'Auto-approved by supervisor submit', '2025-12-03 12:09:51.495'),
('cmipywj9a000ntti41ndnmhno', 'cmi07t43m001mtt3wxjs0ha4w', 'APPROVED_BY_SUPERVISOR', 'cmh55yupd000etticzq6943up', NULL, '2025-12-03 12:12:51.454'),
('cmipyxhyg000ptti4jyb0w2vd', 'cmi07t43m001mtt3wxjs0ha4w', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', NULL, '2025-12-03 12:13:36.424'),
('cmipyy13z000rtti44t7rrh08', 'cmi07t43m001mtt3wxjs0ha4w', 'APPROVED_BY_MANAGEMENT', 'cmh7c1v1u0004tthwbzu6cqtd', NULL, '2025-12-03 12:14:01.247'),
('cmipyzc5l000ttti424ya1bfn', 'cmi07t43m001mtt3wxjs0ha4w', 'APPROVED_BY_MANAGEMENT', 'cmh5686f5000wtticun26uzcw', 'Payment requested from employee', '2025-12-03 12:15:02.218'),
('cmipyzqh0000vtti4exza69mw', 'cmi07t43m001mtt3wxjs0ha4w', 'PAID', 'cmh560lwv000httice83sp9ra', 'Payment confirmed by employee.', '2025-12-03 12:15:20.772'),
('cmiznt3lw0001ttd0zl8m8gjj', 'cmi1jkbso003btt3w5ah36ljl', 'APPROVED_BY_SUPERVISOR', 'cmh55yupd000etticzq6943up', '', '2025-12-10 06:59:57.187'),
('cmizod71s0003ttd0t4ryn6v9', 'cmi1f4xm3002ftt3w5gi022mz', 'APPROVED_BY_SUPERVISOR', 'cmh55yupd000etticzq6943up', '', '2025-12-10 07:15:34.768'),
('cmizodpcj0005ttd099iqku51', 'cmi07sby4001htt3wlh1hves7', 'REJECTED_BY_SUPERVISOR', 'cmh55yupd000etticzq6943up', 'j', '2025-12-10 07:15:58.483'),
('cmizoez07000attd05jodergq', 'cmizoez070007ttd0jcd979om', 'SUBMITTED', NULL, 'Submitted by employee', '2025-12-10 07:16:57.655'),
('cmizok7xj000cttd0vklkvsff', 'cmizoez070007ttd0jcd979om', 'APPROVED_BY_SUPERVISOR', 'cmh55yupd000etticzq6943up', '', '2025-12-10 07:21:02.503'),
('cmizons4w000ettd02rr2anoh', 'cmi07p01j0014tt3we52mcp7w', 'APPROVED_BY_SUPERVISOR', 'cmh55yupd000etticzq6943up', '', '2025-12-10 07:23:48.657'),
('cmizoufvx000gttd0i90dy890', 'cmi076arz000ott3wewtenkkg', 'APPROVED_BY_SUPERVISOR', 'cmh55yupd000etticzq6943up', '', '2025-12-10 07:28:59.373'),
('cmizov67v000ittd0nslyldm4', 'cmi056w8a0001tt3wdfetzhbc', 'APPROVED_BY_SUPERVISOR', 'cmh55yupd000etticzq6943up', '', '2025-12-10 07:29:33.499'),
('cmizowx0v000kttd0z1b86x1o', 'cmh7d42mk0006tthwl5ot7eng', 'APPROVED_BY_SUPERVISOR', 'cmh55yupd000etticzq6943up', '', '2025-12-10 07:30:54.895'),
('cmizplpan000mttd0ocfeu7v7', 'cmizoez070007ttd0jcd979om', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', '', '2025-12-10 07:50:11.279'),
('cmizplt91000ottd09q6n1zw6', 'cmipys28p0008tti4xga7b99t', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', '', '2025-12-10 07:50:16.405'),
('cmizplwcl000qttd0zukync4x', 'cmi1jkbso003btt3w5ah36ljl', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', '', '2025-12-10 07:50:20.422'),
('cmizplzax000sttd0eq05vgdw', 'cmi07p01j0014tt3we52mcp7w', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', '', '2025-12-10 07:50:24.249'),
('cmizpm1vh000uttd0o2nbai8z', 'cmi1f4xm3002ftt3w5gi022mz', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', '', '2025-12-10 07:50:27.582'),
('cmizpm6ms000wttd0i9ewu3dt', 'cmi076arz000ott3wewtenkkg', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', '', '2025-12-10 07:50:33.749'),
('cmizpmdcp000yttd0ra9vio6x', 'cmh7d42mk0006tthwl5ot7eng', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', '', '2025-12-10 07:50:42.457'),
('cmizpmkte0010ttd0xcxtngfu', 'cmi1elpqg0020tt3wrqa8bioq', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', '', '2025-12-10 07:50:52.130'),
('cmizpmorb0012ttd0uuq9ld4e', 'cmi056w8a0001tt3wdfetzhbc', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', '', '2025-12-10 07:50:57.239'),
('cmizpms720014ttd00zuorlke', 'cmhdgjw0w002dttv0rw9195lx', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', '', '2025-12-10 07:51:01.694'),
('cmizpmvto0016ttd00f8fn4ph', 'cmhdfhzfz0020ttv0qtvgd4p0', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', '', '2025-12-10 07:51:06.396'),
('cmizpmygv0018ttd0nlmpnipe', 'cmhd529xq001vttv0e2bvlgqt', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', '', '2025-12-10 07:51:09.823'),
('cmizpn2cc001attd0ayi9hcph', 'cmhd51ovm001qttv0p0a8bu41', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', '', '2025-12-10 07:51:14.845'),
('cmizpn5j2001cttd08pcfvbiw', 'cmhd4x543001cttv0uogzbxfi', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', '', '2025-12-10 07:51:18.974'),
('cmizpn85p001ettd0x8xzj4bi', 'cmhd50xk7001lttv0ddfg7dj3', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', '', '2025-12-10 07:51:22.382'),
('cmizpnazp001gttd0vx3nex7b', 'cmhd4nl590016ttv0u9tn0kgw', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', '', '2025-12-10 07:51:26.053'),
('cmizpndv3001ittd05zku8o4g', 'cmhc1cu45000vttv0gajicoe5', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', '', '2025-12-10 07:51:29.776'),
('cmizpngqo001kttd0prt8r8aw', 'cmhc1a8oz000lttv02c5xlz7x', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', '', '2025-12-10 07:51:33.505'),
('cmizpnji8001mttd0uzgyql0v', 'cmhc1b8ob000qttv0j9lm81es', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', '', '2025-12-10 07:51:37.088'),
('cmizpnlxy001ottd0alhpbu2c', 'cmhc0m99n0002ttv0952adpqr', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', '', '2025-12-10 07:51:40.247'),
('cmizpnqvc001qttd0yzofuhi9', 'cmh7k6c5q003dtthw0o882cds', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', '', '2025-12-10 07:51:46.633'),
('cmizpo92b001sttd0xuf0ne04', 'cmh7h3nqe0015tthwtpsn0n97', 'APPROVED_BY_SUPERVISOR', 'cmh55yupd000etticzq6943up', '', '2025-12-10 07:52:10.212'),
('cmizpufpi001uttd0gle7cae1', 'cmh7fgxsq0011tthwfat89jgm', 'APPROVED_BY_SUPERVISOR', 'cmh55yupd000etticzq6943up', '', '2025-12-10 07:56:58.759'),
('cmizq66et001wttd0nwxmr4l5', 'cmh7elpt4000ttthwqup8sdbk', 'APPROVED_BY_SUPERVISOR', 'cmh55yupd000etticzq6943up', '', '2025-12-10 08:06:06.582'),
('cmizq7yfy001yttd0md2mr8i0', 'cmh7ewa7s000xtthwxm094gzl', 'APPROVED_BY_SUPERVISOR', 'cmh55yupd000etticzq6943up', '', '2025-12-10 08:07:29.567'),
('cmizqiv6m0020ttd0b5pkthqf', 'cmh7dxkv2000ptthwkvx9orv9', 'APPROVED_BY_SUPERVISOR', 'cmh55yupd000etticzq6943up', '', '2025-12-10 08:15:58.558'),
('cmizxloqe0001ttq4pi7rqmjz', 'cmh7h6ghh001ltthwo3cyno5w', 'SUBMITTED', 'cmh55yupd000etticzq6943up', 'Forwarded', '2025-12-10 11:34:07.478'),
('cmizxo4ry0003ttq4gvbnywt6', 'cmh7h6ghh001ltthwo3cyno5w', 'SUBMITTED', 'cmipymhfv0001tti408jdcrnc', 'Forwarded', '2025-12-10 11:36:01.583'),
('cmizxxk430005ttq4wuk9q45h', 'cmh7h6ghh001ltthwo3cyno5w', 'APPROVED_BY_SUPERVISOR', 'cmipykw890000tti40dm8rhxe', 'Approved', '2025-12-10 11:43:21.363'),
('cmizydxz10007ttq4nvnkp8gz', 'cmh7h6ghh001ltthwo3cyno5w', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', 'Approved', '2025-12-10 11:56:05.822'),
('cmizyemeb0009ttq44bnaqlf8', 'cmh7h6ghh001ltthwo3cyno5w', 'APPROVED_BY_MANAGEMENT', 'cmh7c1v1u0004tthwbzu6cqtd', 'Approved', '2025-12-10 11:56:37.475'),
('cmizyf0e4000bttq4esxjt3hw', 'cmh7h6ghh001ltthwo3cyno5w', 'APPROVED_BY_MANAGEMENT', 'cmh5686f5000wtticun26uzcw', 'Payment requested from employee', '2025-12-10 11:56:55.612'),
('cmizyfynk000dttq43bewdzda', 'cmh7h6ghh001ltthwo3cyno5w', 'PAID', 'cmh560lwv000httice83sp9ra', 'Payment confirmed by employee.', '2025-12-10 11:57:40.016'),
('cmizzhu0q0004ttx4mf5vunje', 'cmizzhu0q0001ttx476qnid2d', 'SUBMITTED', NULL, 'Submitted by employee', '2025-12-10 12:27:06.938'),
('cmjv81vv70001ttg4mbesxpma', 'cmizzhu0q0001ttx476qnid2d', 'REJECTED_BY_SUPERVISOR', 'cmh55yupd000etticzq6943up', 'no', '2026-01-01 09:07:30.834'),
('cmjxzqmj80003ttg47oyfvv3m', 'cmhdwr01j000ottrog5s681i2', 'APPROVED_BY_SUPERVISOR', 'cmh7iie8s002otthwsszfqgw5', 'Approved', '2026-01-03 07:38:07.124'),
('cmjxzs3090005ttg4wyevbz7g', 'cmhdvu2th0003ttron404qncb', 'APPROVED_BY_SUPERVISOR', 'cmh7iie8s002otthwsszfqgw5', 'Approved', '2026-01-03 07:39:15.129'),
('cmk9gkbpu0004ttzc7sqkzvap', 'cmk9gkbpt0001ttzcx53vdxq2', 'SUBMITTED', NULL, 'Submitted by supervisor on behalf of employee', '2026-01-11 08:14:34.550'),
('cmk9gnko60009ttzc9qw138rj', 'cmk9gnko60006ttzcfbcccc90', 'SUBMITTED', NULL, 'Submitted by employee', '2026-01-11 08:17:06.150'),
('cmk9gojsd000bttzc6de3bsv3', 'cmk9gnko60006ttzcfbcccc90', 'SUBMITTED', 'cmh55yupd000etticzq6943up', 'Forwarded', '2026-01-11 08:17:51.661'),
('cmk9gppw5000dttzcwetsqxrg', 'cmk9gnko60006ttzcfbcccc90', 'APPROVED_BY_SUPERVISOR', 'cmh7iie8s002otthwsszfqgw5', 'Approved', '2026-01-11 08:18:46.229'),
('cmk9gq4ha000fttzcjwrag7gb', 'cmk9gnko60006ttzcfbcccc90', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', 'Approved', '2026-01-11 08:19:05.134'),
('cmk9gqq1w000kttzc7y7gcib6', 'cmk9gqq1w000httzcniovqb45', 'SUBMITTED', NULL, 'Submitted by supervisor on behalf of employee', '2026-01-11 08:19:33.092'),
('cmk9h76t1000pttzcrijzf30y', 'cmk9h76t0000mttzckq4y4i8r', 'SUBMITTED', NULL, 'Submitted by supervisor on behalf of employee', '2026-01-11 08:32:21.300'),
('cmk9hc0np000vttzcvfei5zcu', 'cmk9hc0no000sttzc04cu8m8y', 'SUBMITTED', NULL, 'Submitted by supervisor on behalf of employee', '2026-01-11 08:36:06.612'),
('cmk9hi75q0010ttzce15mx79y', 'cmk9hi75q000xttzctyvwwwte', 'SUBMITTED', NULL, 'Submitted by supervisor on behalf of employee', '2026-01-11 08:40:54.974'),
('cmk9hjpqq0015ttzc805g69rs', 'cmk9hjpqp0012ttzcwhmrdzfo', 'SUBMITTED', NULL, 'Submitted by employee', '2026-01-11 08:42:05.714'),
('cmk9hkb850017ttzcb4rua4s2', 'cmk9hjpqp0012ttzcwhmrdzfo', 'SUBMITTED', 'cmh7iie8s002otthwsszfqgw5', 'Forwarded', '2026-01-11 08:42:33.557'),
('cmk9hl1xm0019ttzc3hdath3v', 'cmk9hjpqp0012ttzcwhmrdzfo', 'APPROVED_BY_SUPERVISOR', 'cmh55yupd000etticzq6943up', 'Approved', '2026-01-11 08:43:08.170'),
('cmk9hwbbe001ettzcwb7gdmua', 'cmk9hwbbd001bttzcfbjp4oj3', 'SUBMITTED', NULL, 'Submitted by supervisor on behalf of employee', '2026-01-11 08:51:53.544'),
('cmk9hwbc3001gttzcy9f56eh9', 'cmk9hwbbd001bttzcfbjp4oj3', 'SUBMITTED', 'cmh55yupd000etticzq6943up', 'Forwarded', '2026-01-11 08:51:53.572'),
('cmk9hwvs1001ittzc2q97w6n3', 'cmhdwkpof000dttroclfkd8od', 'APPROVED_BY_SUPERVISOR', 'cmh7iie8s002otthwsszfqgw5', 'Approved', '2026-01-11 08:52:20.063'),
('cmk9hxg3x001nttzccvtqx6o2', 'cmk9hxg3w001kttzcgx4ndgqr', 'SUBMITTED', NULL, 'Submitted by supervisor on behalf of employee', '2026-01-11 08:52:46.413'),
('cmk9hzeve001pttzcxj5tcwk1', 'cmk9hwbbd001bttzcfbjp4oj3', 'APPROVED_BY_SUPERVISOR', 'cmh7iie8s002otthwsszfqgw5', 'Approved', '2026-01-11 08:54:18.122'),
('cmk9idlta001uttzcu01yr365', 'cmk9idlt9001rttzc5spzvhud', 'SUBMITTED', NULL, 'Submitted by supervisor on behalf of employee', '2026-01-11 09:05:20.301'),
('cmk9ijgsg001zttzc2f3gkw0p', 'cmk9ijgsg001wttzcolzbw94f', 'SUBMITTED', 'cmh55yupd000etticzq6943up', 'Submitted by supervisor on behalf of employee', '2026-01-11 09:09:53.727'),
('cmk9ijgsg0020ttzcj4wf250g', 'cmk9ijgsg001wttzcolzbw94f', 'APPROVED_BY_SUPERVISOR', 'cmh55yupd000etticzq6943up', 'Auto-approved by supervisor submit', '2026-01-11 09:09:53.727'),
('cmk9ik8ja0025ttzc5em8tf6h', 'cmk9ik8j90022ttzcrk1j3t5k', 'SUBMITTED', NULL, 'Submitted by employee', '2026-01-11 09:10:29.683'),
('cmk9ikntr0027ttzchruu4n2x', 'cmk9ik8j90022ttzcrk1j3t5k', 'SUBMITTED', 'cmh55yupd000etticzq6943up', 'Forwarded', '2026-01-11 09:10:49.502'),
('cmk9il78n0029ttzc3jth6nj5', 'cmhdwk4kb0008ttrohgyxucs5', 'APPROVED_BY_SUPERVISOR', 'cmh7iie8s002otthwsszfqgw5', 'Approved', '2026-01-11 09:11:14.663'),
('cmk9ilbm5002bttzc6tmr9a1w', 'cmhdfyzf30026ttv0lzoywa8w', 'APPROVED_BY_SUPERVISOR', 'cmh7iie8s002otthwsszfqgw5', 'Approved', '2026-01-11 09:11:20.334'),
('cmk9ilf6q002dttzclw5dw8ao', 'cmhd501gh001httv0skccgbgd', 'APPROVED_BY_SUPERVISOR', 'cmh7iie8s002otthwsszfqgw5', 'Approved', '2026-01-11 09:11:24.960'),
('cmk9ili7k002fttzczo020o4o', 'cmhd4n72t0012ttv0zl3mzjyb', 'APPROVED_BY_SUPERVISOR', 'cmh7iie8s002otthwsszfqgw5', 'Approved', '2026-01-11 09:11:28.880'),
('cmk9jqmvb002httzcok3t3izp', 'cmk9ik8j90022ttzcrk1j3t5k', 'APPROVED_BY_SUPERVISOR', 'cmh7iie8s002otthwsszfqgw5', 'Approved', '2026-01-11 09:43:27.814'),
('cmk9jr48s002jttzcanjdrjfw', 'cmk9ik8j90022ttzcrk1j3t5k', 'APPROVED_BY_ACCOUNTS', 'cmh5686f5000wtticun26uzcw', 'Approved', '2026-01-11 09:43:50.332'),
('cmk9jrezs002lttzc7wyqf4x7', 'cmk9ik8j90022ttzcrk1j3t5k', 'APPROVED_BY_MANAGEMENT', 'cmh7c1v1u0004tthwbzu6cqtd', 'Approved', '2026-01-11 09:44:04.265'),
('cmk9jsams002nttzc8yjzqe2q', 'cmk9ik8j90022ttzcrk1j3t5k', 'APPROVED_BY_MANAGEMENT', 'cmh5686f5000wtticun26uzcw', 'Payment requested from employee', '2026-01-11 09:44:45.262'),
('cmk9jsy57002pttzcniv94jrp', 'cmk9ik8j90022ttzcrk1j3t5k', 'PAID', 'cmh560lwv000httice83sp9ra', 'Payment confirmed by employee.', '2026-01-11 09:45:15.740');

-- --------------------------------------------------------

--
-- Table structure for table `billitem`
--

CREATE TABLE `billitem` (
  `id` varchar(191) NOT NULL,
  `billId` varchar(191) NOT NULL,
  `date` datetime(3) NOT NULL,
  `from` varchar(191) NOT NULL,
  `to` varchar(191) NOT NULL,
  `transport` varchar(191) DEFAULT NULL,
  `purpose` varchar(191) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `attachmentUrl` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `billitem`
--

INSERT INTO `billitem` (`id`, `billId`, `date`, `from`, `to`, `transport`, `purpose`, `amount`, `attachmentUrl`) VALUES
('cmh7d42mk0007tthw86ncr989', 'cmh7d42mk0006tthwl5ot7eng', '2025-10-26 07:01:55.132', '11 pm', '124566', '__BILL4__', '{\"time\":\"11 pm\",\"incident\":\"124566\",\"purpose\":\"AIBL & AC\",\"food\":340,\"hotel\":500,\"others\":100,\"advance\":0,\"total\":940,\"net\":940,\"remarks\":\"naeem\"}', 940.00, NULL),
('cmh7d42mk0008tthwcxcu9xfv', 'cmh7d42mk0006tthwl5ot7eng', '2025-10-13 18:00:00.000', '8 pm', '7989798', '__BILL4__', '{\"time\":\"8 pm\",\"incident\":\"7989798\",\"purpose\":\"return\",\"food\":0,\"hotel\":0,\"others\":400,\"advance\":0,\"total\":400,\"net\":400,\"remarks\":\"naeem\"}', 400.00, NULL),
('cmh7d5y4h000ctthwn93xr0io', 'cmh7d5y4h000btthwo85saat5', '2025-10-26 07:04:15.061', 'October 26th, 2025', 'October 26th, 2025', '__BILL3__', '{\"name\":\"MD Zihadul Islam\",\"purpose\":\"meeting\",\"food\":670,\"hotel\":45,\"others\":0,\"advance\":0,\"total\":715,\"net\":715,\"remarks\":\"naeem\"}', 715.00, '/uploads/1761462285559_a371955a53bf.jpg'),
('cmh7dxkv2000qtthwz2bcamgv', 'cmh7dxkv2000ptthwkvx9orv9', '2025-10-26 07:25:37.174', '11 pm', '124566', '__BILL4__', '{\"time\":\"11 pm\",\"incident\":\"124566\",\"purpose\":\"hudai\",\"meal\":\"breakfast\",\"food\":60,\"hotel\":0,\"others\":0,\"advance\":0,\"total\":60,\"net\":60,\"remarks\":\"naeem\"}', 60.00, NULL),
('cmh7elpt5000utthw7t3rxq6k', 'cmh7elpt4000ttthwqup8sdbk', '2025-10-26 07:44:38.355', '11 pm', '124566', '__BILL4__', '{\"time\":\"11 pm\",\"incident\":\"124566\",\"purpose\":\"meeting\",\"meal\":\"breakfast\",\"food\":7,\"hotel\":0,\"others\":0,\"advance\":0,\"total\":7,\"net\":7,\"remarks\":\"0\"}', 7.00, NULL),
('cmh7ewa7s000ytthw97pq9neh', 'cmh7ewa7s000xtthwxm094gzl', '2025-10-26 07:52:49.134', '11 pm', '124566', '__BILL4__', '{\"time\":\"11 pm\",\"incident\":\"124566\",\"purpose\":\"meeting\",\"meal\":\"breakfast\",\"food\":9,\"hotel\":8,\"others\":7,\"advance\":0,\"total\":24,\"net\":24,\"remarks\":\"0\"}', 24.00, NULL),
('cmh7fgxsq0012tthw3dj1pua3', 'cmh7fgxsq0011tthwfat89jgm', '2025-10-26 08:08:54.537', '11 pm', '657743', '__BILL4__', '{\"time\":\"11 pm\",\"incident\":\"657743\",\"purpose\":\"3g\",\"meal\":\"breakfast\",\"food\":8,\"hotel\":0,\"others\":8,\"advance\":0,\"total\":16,\"net\":16,\"remarks\":\"naeem\"}', 16.00, '/uploads/1761466157583_97f8bbf70513.jpg'),
('cmh7h5p4w001atthwri8b7zsh', 'cmh7h3nqe0015tthwtpsn0n97', '2025-10-26 08:56:24.249', 'office', 'banani', 'rickhaw', 'hudai', 90.00, NULL),
('cmh7hh0hv001utthwchcbkfod', 'cmh7h6ghh001ltthwo3cyno5w', '2025-10-26 09:04:27.596', 'Ad eligendi necessit', 'Officia ut incidunt', 'cng', 'meeting', 90.00, NULL),
('cmh7hzr36002dtthwa3weiq2f', 'cmh7hi3i30020tthwomc8kjep', '2025-10-26 09:17:52.479', 'office', 'Officia ut incidunt', 'rickhaw', 'meeting', 90.00, NULL),
('cmh7jk382002ttthw15c74uyi', 'cmh7jk382002stthw8shn28yr', '2025-10-26 09:37:45.138', 'office', 'banani', 'rickhaw', 'meeting', 80.00, NULL),
('cmh7jk382002utthwgedczkp0', 'cmh7jk382002stthw8shn28yr', '2025-10-26 10:03:29.766', 'banani', 'office', 'pathao', 'return', 150.00, NULL),
('cmh7k36340038tthwmywurbhm', 'cmh7k36340037tthwj2wye6hw', '2025-10-01 18:00:00.000', 'October 2nd, 2025', 'October 3rd, 2025', '__BILL2__', '{\"name\":\"shayek\",\"purpose\":\"world runner\",\"local\":56,\"trip\":40,\"others\":11,\"advance\":100,\"total\":107,\"net\":7,\"remarks\":\"naeem\"}', 7.00, '/uploads/1761473913195_6bfdeb959d27.jpg'),
('cmh7k36340039tthw91sph2qr', 'cmh7k36340037tthwj2wye6hw', '2025-10-26 10:17:05.443', 'October 26th, 2025', 'October 26th, 2025', '__BILL2__', '{\"name\":\"naeem\",\"purpose\":\"meeting\",\"local\":67,\"trip\":55,\"others\":44,\"advance\":0,\"total\":166,\"net\":166,\"remarks\":\"sihab\"}', 166.00, '/uploads/1761473913202_da101a42d635.jpg'),
('cmh7k6c5q003etthwx6t4z6w2', 'cmh7k6c5q003dtthw0o882cds', '2025-10-26 10:19:41.507', 'October 26th, 2025', 'October 26th, 2025', '__BILL2__', '{\"name\":\"Naeem Bhai\",\"purpose\":\"meeting\",\"local\":5,\"trip\":5,\"others\":5,\"advance\":15,\"total\":15,\"net\":0,\"remarks\":\"naeem\"}', 0.00, NULL),
('cmh7k6c5q003ftthw3oswo8ur', 'cmh7k6c5q003dtthw0o882cds', '2025-10-26 10:20:03.416', 'October 26th, 2025', 'October 26th, 2025', '__BILL2__', '{\"name\":\"Cecilia Leblanc\",\"purpose\":\"meeting\",\"local\":6,\"trip\":4,\"others\":0,\"advance\":0,\"total\":10,\"net\":10,\"remarks\":\"sihab\"}', 10.00, NULL),
('cmhc0m99o0003ttv0i6hb1cu3', 'cmhc0m99n0002ttv0952adpqr', '2025-10-29 13:12:02.691', 'mohakhali', 'Officia ut incidunt', 'Qui maxime aliquid a', '3g', 1610.00, NULL),
('cmhc16kvw000attv0hbeybmyx', 'cmhc16kvw0009ttv01d0xq5ro', '2025-10-29 13:27:55.869', 'office', 'badda', 'rickhaw', 'meeting', 1212.00, NULL),
('cmhc18kau000httv0dbjiiyoa', 'cmhc18kau000gttv0vjylkov0', '2025-10-29 13:29:28.553', 'office', 'banani', 'cng', 'meeting', 1231.00, NULL),
('cmhc1a8oz000mttv0rq0qyqb6', 'cmhc1a8oz000lttv02c5xlz7x', '2025-10-29 13:30:37.249', 'office', 'banani', 'rickhaw', 'hudai', 890.00, NULL),
('cmhc1b8ob000rttv0yeb3971p', 'cmhc1b8ob000qttv0j9lm81es', '2025-10-29 13:31:32.379', 'mohakhali', 'karwan bazar', 'bus', 'Necessitatibus aliqu', 5.00, NULL),
('cmhc1cu46000wttv0g898ynst', 'cmhc1cu45000vttv0gajicoe5', '2025-10-29 13:32:41.708', 'office', 'Officia ut incidunt', 'rickhaw', 'hudai', 8.00, NULL),
('cmhd4n72t0013ttv06swgwpi0', 'cmhd4n72t0012ttv0zl3mzjyb', '2025-10-30 07:52:32.197', 'office', 'banani', 'rickhaw', 'meeting', 10101.00, NULL),
('cmhd4nl590017ttv06ubg0rz0', 'cmhd4nl590016ttv0u9tn0kgw', '2025-10-30 07:52:54.540', 'office', 'karwan bazar', 'bus', 'meeting', 20.00, NULL),
('cmhd4x543001dttv0kzmqq6tq', 'cmhd4x543001cttv0uogzbxfi', '2025-10-30 08:00:13.449', 'October 30th, 2025', 'October 30th, 2025', '__BILL2__', '{\"name\":\"naeem\",\"purpose\":\"meeting\",\"local\":88,\"trip\":2,\"others\":0,\"advance\":0,\"total\":90,\"net\":90,\"remarks\":\"naeem\"}', 90.00, NULL),
('cmhd501gi001ittv06ch1vyfe', 'cmhd501gh001httv0skccgbgd', '2025-10-30 08:02:32.046', 'office', 'badda', 'cng', 'meeting', 99.00, NULL),
('cmhd50xk7001mttv0f9dhmmo9', 'cmhd50xk7001lttv0ddfg7dj3', '2025-10-30 08:03:14.877', 'office', 'Officia ut incidunt', 'cng', 'meeting', 11.00, NULL),
('cmhd51ovm001rttv0hl5hv6r4', 'cmhd51ovm001qttv0p0a8bu41', '2025-10-30 08:03:51.549', 'office', 'banani', 'cng', 'meeting', 33.00, NULL),
('cmhd529xq001wttv04a43sph2', 'cmhd529xq001vttv0e2bvlgqt', '2025-10-30 08:04:19.377', 'Ad eligendi necessit', 'Officia ut incidunt', 'Dolores consectetur', 'meeting', 22.00, NULL),
('cmhdfhzfz0021ttv0l87r66i0', 'cmhdfhzfz0020ttv0qtvgd4p0', '2025-10-30 12:54:01.141', 'office', 'banani', 'rickhaw', 'meeting', 45.00, NULL),
('cmhdfyzf30027ttv07ip2694b', 'cmhdfyzf30026ttv0lzoywa8w', '2025-10-30 13:06:06.785', 'now', 'to', 'cycle', 'basa', 6.00, NULL),
('cmhdgjw0w002ettv02eyxj590', 'cmhdgjw0w002dttv0rw9195lx', '2025-10-30 13:25:59.603', 'office', 'banani', 'cng', '6', 60000000.00, NULL),
('cmhdvu2ti0004ttroo2ldiol4', 'cmhdvu2th0003ttron404qncb', '2025-10-30 20:33:25.682', 'office', 'banani', 'cng', 'meeting', 12.00, NULL),
('cmhdwk4kb0009ttroq1n8m947', 'cmhdwk4kb0008ttrohgyxucs5', '2025-10-30 20:54:01.705', 'office', 'Officia ut incidunt', 'bus', 'meeting', 78.00, NULL),
('cmhdwp90b000ittroeimmcxwl', 'cmhdwkpof000dttroclfkd8od', '2025-10-30 20:57:43.426', 'October 31st, 2025', 'October 31st, 2025', '__BILL2__', '{\"name\":\"Bashundhara Hotel\",\"purpose\":\"meeting\",\"local\":90,\"trip\":0,\"others\":0,\"advance\":0,\"total\":90,\"net\":90,\"remarks\":\"naeem\"}', 90.00, '/uploads/1761857895687_d1605cce8e52'),
('cmhdwr01j000pttronoqd2u0x', 'cmhdwr01j000ottrog5s681i2', '2025-10-30 20:59:08.222', 'October 31st, 2025', 'October 31st, 2025', '__BILL2__', '{\"name\":\"Cecilia Leblanc\",\"purpose\":\"meeting\",\"local\":5,\"trip\":5,\"others\":5,\"advance\":0,\"total\":15,\"net\":15,\"remarks\":\"naeem\"}', 15.00, '/uploads/1761857977560_f7b24de0b5cf.jpg'),
('cmi06plbo000itt3wl0fag6dm', 'cmi056w8a0001tt3wdfetzhbc', '2025-11-15 11:09:11.881', 'mohakhali', 'banani', 'rickhaw', 'world runner', 1.00, NULL),
('cmi07sby4001itt3w39d8g5xs', 'cmi07sby4001htt3wlh1hves7', '2025-11-15 11:39:05.926', 'November 15th, 2025', 'November 15th, 2025', '__BILL2__', '{\"name\":\"Naeem Bhai\",\"purpose\":\"world runner\",\"local\":7,\"trip\":8,\"others\":9,\"advance\":0,\"total\":24,\"net\":24,\"remarks\":\"naeem\"}', 24.00, '/uploads/1763206771310_03783976b5fd.jpg'),
('cmi07t43m001ntt3wozn9tubw', 'cmi07t43m001mtt3wxjs0ha4w', '2025-11-15 11:39:45.028', '11 pm', '124566', '__BILL4__', '{\"time\":\"11 pm\",\"incident\":\"124566\",\"purpose\":\"3g\",\"meal\":\"breakfast & lunch\",\"food\":6,\"hotel\":72,\"others\":3,\"advance\":0,\"total\":81,\"net\":81,\"remarks\":\"naeem\"}', 81.00, '/uploads/1763206807803_73cd5aab8bbc.jpg'),
('cmi1dri8q001stt3wsuorb7k9', 'cmi1dri8q001rtt3w8wav99u7', '2025-11-16 07:11:05.039', 'November 16th, 2025', 'November 16th, 2025', '__BILL2__', '{\"name\":\"westine\",\"purpose\":\"meeting\",\"local\":5,\"trip\":5,\"others\":5,\"advance\":15,\"total\":15,\"net\":0,\"remarks\":\"naeem\"}', 0.00, NULL),
('cmi1dri8q001ttt3w0rrjd6k0', 'cmi1dri8q001rtt3w8wav99u7', '2025-11-16 07:11:53.979', 'November 16th, 2025', 'November 16th, 2025', '__BILL2__', '{\"name\":\"yuyy\",\"purpose\":\"return\",\"local\":20,\"trip\":0,\"others\":0,\"advance\":20,\"total\":20,\"net\":0,\"remarks\":\"sihab\"}', 0.00, NULL),
('cmi1dri8q001utt3wt5ivwo5w', 'cmi1dri8q001rtt3w8wav99u7', '2025-11-16 07:12:44.266', 'November 16th, 2025', 'November 16th, 2025', '__BILL2__', '{\"name\":\"Westin Restaurant\",\"purpose\":\"7\",\"local\":0,\"trip\":8,\"others\":12,\"advance\":15,\"total\":20,\"net\":5,\"remarks\":\"9\"}', 5.00, NULL),
('cmi1dri8q001vtt3wcfmoyvf3', 'cmi1dri8q001rtt3w8wav99u7', '2025-11-16 07:13:21.835', 'November 16th, 2025', 'November 16th, 2025', '__BILL2__', '{\"name\":\"ggkaka\",\"purpose\":\"hh\",\"local\":10,\"trip\":0,\"others\":0,\"advance\":0,\"total\":10,\"net\":10,\"remarks\":\"kk\"}', 10.00, NULL),
('cmi1dri8q001wtt3w6j4ti5v0', 'cmi1dri8q001rtt3w8wav99u7', '2025-11-16 07:14:09.347', 'November 16th, 2025', 'November 16th, 2025', '__BILL2__', '{\"name\":\"Rahim Rice Supply\",\"purpose\":\"ghfg\",\"local\":15,\"trip\":0,\"others\":0,\"advance\":0,\"total\":15,\"net\":15,\"remarks\":\"ll\"}', 15.00, NULL),
('cmi1emn1y0025tt3w5raeygng', 'cmi1elpqg0020tt3wrqa8bioq', '2025-11-16 07:37:53.106', 'office', 'banani', 'cng', 'hudai', 80.00, NULL),
('cmi1f5anq002ktt3wp9fjxf92', 'cmi1f4xm3002ftt3w5gi022mz', '2025-11-16 07:52:37.573', 'mohakhali', 'banasree', 'pathao', 'meeting', 300.00, NULL),
('cmi1fvmhx002rtt3wxzpyk23g', 'cmi1fvmhx002qtt3w08lf3kp5', '2025-11-16 08:13:25.327', 'mohakhali', 'banasree', 'bus', 'world runner', 30.00, NULL),
('cmi1hitw1002vtt3w74c2zu4p', 'cmi07p01j0014tt3we52mcp7w', '2025-11-15 11:36:25.559', '11 pm', '124566', '__BILL4__', '{\"time\":\"11 pm\",\"incident\":\"124566\",\"purpose\":\"Necessitatibus aliqu\",\"meal\":\"breakfast\",\"food\":6,\"hotel\":7,\"others\":18,\"advance\":0,\"total\":31,\"net\":31,\"remarks\":\"naeem\"}', 31.00, NULL),
('cmi1hr10a0031tt3wfisjuqvr', 'cmi076arz000ott3wewtenkkg', '2025-11-15 11:22:12.181', 'mohakhali', 'Cum ut at deserunt t', 'pathao', '3g', 555555.00, NULL),
('cmi1hr10b0033tt3ws2z979vr', 'cmi076arz000ott3wewtenkkg', '2025-11-15 11:32:48.619', 'banani', 'h', 'cng', 'meeting', 96.00, NULL),
('cmi1jo4nj003mtt3wbkbu2bbw', 'cmi1jkbso003btt3w5ah36ljl', '2025-11-16 09:56:37.427', 'office', 'banani', 'cng', 'karwan bazar', 8100.00, NULL),
('cmipyr89a0004tti4uj5g0rkc', 'cmipyr89a0003tti48ekevt95', '2025-11-30 18:00:00.000', '6am', '1234', '__BILL4__', '{\"time\":\"6am\",\"incident\":\"1234\",\"purpose\":\"dispensure problem \",\"meal\":\"lunch\",\"food\":300,\"hotel\":500,\"others\":45,\"advance\":0,\"total\":845,\"net\":845,\"remarks\":\"ab bank\"}', 845.00, '/uploads/1764763723871_ad4eae75e12e.png'),
('cmipysocg000dtti4s2vy5d3u', 'cmipys28p0008tti4xga7b99t', '2025-12-03 12:08:58.894', 'office', 'badda', 'pathao', '3g', 9.00, NULL),
('cmipysoch000ftti4efunhc8u', 'cmipys28p0008tti4xga7b99t', '2025-12-03 12:09:42.505', 'h', 'h', 'cng', 'return', 8.00, NULL),
('cmizoez070008ttd0ia459hnu', 'cmizoez070007ttd0jcd979om', '2025-12-10 07:16:39.830', 'December 10th, 2025', 'December 10th, 2025', '__BILL2__', '{\"name\":\"Rahim Rice Supply\",\"purpose\":\"meeting\",\"local\":8,\"trip\":12,\"others\":0,\"advance\":0,\"total\":20,\"net\":20,\"remarks\":\"k\"}', 20.00, NULL),
('cmizzhu0q0002ttx45py2fc62', 'cmizzhu0q0001ttx476qnid2d', '2025-12-10 12:26:55.870', 'office', 'banani', 'cng', 'meeting', 3.00, NULL),
('cmk9gkbpu0002ttzcdamwwt61', 'cmk9gkbpt0001ttzcx53vdxq2', '2026-01-11 08:13:51.432', 'Ad eligendi necessit', 'Officia ut incidunt', 'cng', 'meeting', 600.00, NULL),
('cmk9gnko60007ttzc5qfpeamt', 'cmk9gnko60006ttzcfbcccc90', '2026-01-11 08:16:40.309', 'office', 'banani', 'cng', 'meeting', 1234567890.00, NULL),
('cmk9gqq1w000ittzcre7frn87', 'cmk9gqq1w000httzcniovqb45', '2026-01-11 08:19:19.778', 'mohakhali', 'Officia ut incidunt', 'cng', 'meeting', 666.00, NULL),
('cmk9h76t0000nttzc5qtk9vsk', 'cmk9h76t0000mttzckq4y4i8r', '2026-01-11 08:32:06.148', 'mohakhali', 'karwan bazar', 'bus', 'hudai', 199.00, NULL),
('cmk9hc0no000tttzcossbhfhn', 'cmk9hc0no000sttzc04cu8m8y', '2026-01-11 08:35:55.116', 'gulshan-1', 'karwan bazar', 'pathao', 'world runner', 200.00, NULL),
('cmk9hi75q000yttzckz2tn6r7', 'cmk9hi75q000xttzctyvwwwte', '2026-01-11 08:40:29.769', 'office', 'banani', 'Dolores consectetur', 'Necessitatibus aliqu', 2.00, NULL),
('cmk9hjpqp0013ttzcqrgqrbve', 'cmk9hjpqp0012ttzcwhmrdzfo', '2026-01-11 08:41:53.196', 'gulshan-1', 'banasree', 'pathao', 'hudai', 3.00, NULL),
('cmk9hwbbd001cttzcdipd742n', 'cmk9hwbbd001bttzcfbjp4oj3', '2026-01-11 08:51:38.602', 'office', 'banani', 'cng', 'meeting', 5.00, NULL),
('cmk9hxg3w001lttzcose6ons1', 'cmk9hxg3w001kttzcgx4ndgqr', '2026-01-11 08:52:34.802', 'mohakhali', 'karwan bazar', 'pathao', '3g', 1.00, NULL),
('cmk9idlt9001sttzcl1kfnftr', 'cmk9idlt9001rttzc5spzvhud', '2026-01-11 09:04:58.067', 'office', 'banani9', 'cng', 'meeting', 10.00, NULL),
('cmk9ijgsg001xttzcqv9pkfwb', 'cmk9ijgsg001wttzcolzbw94f', '2026-01-11 09:09:35.160', 'office', 'banasree', 'rickhaw', 'meeting', 411.00, NULL),
('cmk9ik8j90023ttzcc8ahati5', 'cmk9ik8j90022ttzcrk1j3t5k', '2026-01-11 09:10:16.694', 'mohakhali', 'badda', 'bus', 'hudai', 551.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `role` enum('employee','supervisor','accounts','management') NOT NULL DEFAULT 'employee',
  `designation` varchar(191) DEFAULT NULL,
  `supervisorId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `employeeCode` varchar(191) DEFAULT NULL,
  `passwordHash` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `name`, `email`, `role`, `designation`, `supervisorId`, `createdAt`, `updatedAt`, `employeeCode`, `passwordHash`) VALUES
('cmh55yupd000etticzq6943up', 'rizon', 'rizon@gmail.com', 'supervisor', 'SOftware Department', NULL, '2025-10-24 18:07:44.881', '2025-10-24 18:07:44.881', '10110', 's:52e9d897be63b6407db6db8b059070f2:226fe1fa8c626435b930ab37264dadceaa077c55f8c253bb70b9ebf929502ff4c21c0669648727174890cb708f9602f44742a8512b7c0d879172c85eb9848b45'),
('cmh560lwv000httice83sp9ra', 'naeem', 'naeem@gmail.com', 'employee', 'SOftware Department', 'cmh55yupd000etticzq6943up', '2025-10-24 18:09:06.799', '2025-10-24 18:09:06.799', '10166', 's:5f84d12bc12afb5022b7127a2cc56b77:7674b47d20f700eba1e5e08d55ab8652e76fdaabfd1a5450a9ea6236796b295d95c808f553e974cf3bda042992d35b6aa41f7b1de3603909bbd22886e1ab5c0c'),
('cmh5686f5000wtticun26uzcw', 'saidur', 'saidur@gmail.com', 'accounts', NULL, NULL, '2025-10-24 18:14:59.969', '2025-10-24 18:14:59.969', NULL, 's:512cd9dcb9d94b5363c65cdd5df8fcf8:59fde7afdc980d1894f9f14fa07440feb4323a75844e5f797fc36a494407bc9f97c975d4dd52e8176a1614df0f1c01883813a5a204368e990920001148fb0a30'),
('cmh7c1v1u0004tthwbzu6cqtd', 'sameer', 'sameer@gmail.com', 'management', NULL, NULL, '2025-10-26 06:33:35.347', '2025-10-26 06:33:35.347', NULL, 's:c7673a181ae99b89e1088d2aec344466:9adfbd0fb60dd02bb289394abf3e04f4019d231aff98c72fa3f1a8f534e0e66b09ca039bf0710657e08e3243f4e4d61744bc7423f2b341e37eca2be1c57ad968'),
('cmh7i7d13002ntthwoolhcy4a', 'sabbir', 'z.i.nayeem45@gmail.com', 'employee', 'software dept', 'cmh55yupd000etticzq6943up', '2025-10-26 09:25:49.623', '2025-10-26 09:25:49.623', '1222', 's:aebf39624679584e62c6d385bc1b9071:da7626411a5c172cf6f97805d59175cdf84ce5c2c3eaf3e6cbd230ef4a4149a8ca9bdbc83ad51766c21dc0ed3c30cc4bbbec466c4930fabf828359f23595b4d2'),
('cmh7iie8s002otthwsszfqgw5', 'shayek', 'shayek@gmail.com', 'supervisor', 'SOftware Department', NULL, '2025-10-26 09:34:24.412', '2025-10-26 09:34:24.412', '10150', 's:b9b512be82e960940d7b331d26f8801b:0cc625a2cef99eb1f89310f46e4b8befd08d57911a99896bfc3ce33a518da207f8c3f6bc35c54a3f5350b40b951c7016f0d3cb7b292241a0e70f3cf4966d9e50'),
('cmh7ijgst002qtthw0rzw9ti2', 'abir', 'abir@gmail.com', 'employee', 'SOftware Department', 'cmh7iie8s002otthwsszfqgw5', '2025-10-26 09:35:14.381', '2025-10-26 09:35:14.381', '10160', 's:cfa4118cdf22ad7caee8c759505ee373:66b1f56ece7bcec31538c64102dd28ce7d1dc705d068d63007ce1bd2367636b5a11597c4f7fae64d6aba3d61d6e45236e6d9c6019992012afac2711de5c1f9ce'),
('cmhc0lljx0000ttv0rqm0p5d8', 'hasan', 'hasan@gmail.com', 'supervisor', 'SOftware Department', NULL, '2025-10-29 13:11:51.645', '2025-10-29 13:11:51.645', '1610', 's:380720fd88ac32bd12c58a76692661e7:ad9d1e5070dc57adccb47d46a453d7d9987ae1ec21775d255b71f88475656891d68633e95c745682a6cb988b767249fc417236516e251d4ce6aeb15147897c22'),
('cmhc1663u0007ttv0wsyun0b9', 'nazib', 'nazib@gmail.com', 'supervisor', 'SOftware Department', 'cmh7iie8s002otthwsszfqgw5', '2025-10-29 13:27:51.402', '2025-10-29 13:27:51.402', '1000', 's:8b738d6aa83f31fde4445589523ffe3f:664f34ec61a339b77d999d66fefb0885055f9491ae4126cee5a654636cb19974373f6d3860c0069aa92b685272c33962ff0cdeef3b1eb311d2a0ede3bcb443c1'),
('cmhc186na000ettv0kdovu3ha', 'shayek salahuddin', 'salahuddin@gmail.com', 'supervisor', 'SOftware Department', NULL, '2025-10-29 13:29:25.415', '2025-10-29 13:29:25.415', '9999', 's:eb81ce20f6c8962a54f0185d78f5aad5:43899b48924c82bc80423cb873ef1fda8ac5337d5383d266109b8753d8c0a733d6de66ead602ed2e24e12ec68fbbe1dde569ee532330627cd164b3156f6bc5aa'),
('cmhd4mqcj0010ttv09naa2nl7', 'saifur', 'saifur@gmail.com', 'supervisor', 'SOftware Department', 'cmh7iie8s002otthwsszfqgw5', '2025-10-30 07:52:29.155', '2025-10-30 07:52:29.155', '10101', 's:05ff20244a4da22da3076322bedfbcd6:bc62b84221bca34649582cf0273ab7ef957bf60ed7a32c28a4073becd8b764c0094fe3e8baad99f8e58a51aafb4b7e44456469f6c915e5b0d484aa7aac78642e'),
('cmhdgjk4w002bttv0wt80w3nf', 'zihad', 'zihad@gmail.com', 'employee', 'SOftware Department', 'cmhd4mqcj0010ttv09naa2nl7', '2025-10-30 13:25:56.528', '2025-10-30 13:25:56.528', '11111', 's:de262379358cebe2a697285f2243f19b:b42004b963887cd1caec09f34e992d7872c7cb2aedff316f5f705f1af5602db25b656ebbc15218ae2de8b84661cb73946530b599a0e25ad6f57225d7eda5d488'),
('cmhdvlhll0000ttrosb8hd7vy', 'biplop', 'biplop@gmail.com', 'supervisor', 'accounts', NULL, '2025-10-30 20:27:20.793', '2025-10-30 20:27:20.793', '1234', 's:f6021b879a8b362e654ab5a96ca98d23:37868993f77e9a7e533ca05981eec2a5889348ac7a620992c6d65a2ab4982cf1fd19f0d5e181f886102219508a0af9f857fbe182611d29c74e2f96f00526750d'),
('cmhdvt8dd0001ttro4oz8at4c', 'omi', 'omi@gmail.com', 'supervisor', 'software dept', NULL, '2025-10-30 20:33:22.082', '2025-10-30 20:33:22.082', '12345', 's:4bc5cdded2f1448b3ebe944d7717a07c:5cdfde0abc4a700021de4bfc07c1bfc3b2fbe276cd883dbf4176d985b11883738e806d32dc0d5916436f1abc8909d006d51d7221d89b8dd39da81bc4614b0e63'),
('cmi1f46q7002dtt3w9qojv0mn', 'omee', 'omee@gmail.com', 'employee', 'software dept', 'cmh55yupd000etticzq6943up', '2025-11-16 07:52:27.919', '2025-11-16 07:52:27.919', '1999', 's:6ad04dd0a75b873e5388e779b76f84fe:56ede8ec6dcf693e01aeb094b96b407bc7047c1fb0992262e649fc6885ffb0fa45466af58f4d4b0cf5838db38572794ccb3b45b7603033321afae8600941c972'),
('cmipykw890000tti40dm8rhxe', 'GM', 'gm@gmail.com', 'supervisor', 'GM', NULL, '2025-12-03 12:03:48.393', '2025-12-03 12:03:48.393', '8888', 's:a9392355c74620510d8d0f2a07581f72:2b8dd0c69f7bc69ea9e1b7eef81385aa8a2341122a22fe927f884643e0db9b15372fb3ecfd250d0c9385c738cc898b53ddd5b40b43f90257cd041505fc9c3f33'),
('cmipymhfv0001tti408jdcrnc', 'khijir', 'khijir@gmail.com', 'supervisor', 'dept manager', NULL, '2025-12-03 12:05:02.539', '2025-12-03 12:05:02.539', '7777', 's:a128584aff0fe177f48ff77ad11522ea:b6f75dd6dc931dab526edc2be13930182d9823961982dd829622b16375e7101ae922af93fea8d2209a2853825e56823c9d94e6a40a70385f88281452e9e2a33c'),
('cmk9hbnvh000qttzco9o058r4', 'salahuddin', 'salah@gmail.com', 'supervisor', 'software dept', NULL, '2026-01-11 08:35:50.045', '2026-01-11 08:35:50.045', '6000', 's:0aedf2eeb1c80d1f248e83a7bff03c62:7e3fd394d1aaf0ee2544a9cfa7e81a3767def56d75592ed0701e070920754de6eea0e3ace47d8f1ecf8abd3a46d02a623b590027ae50c4f198a073bcddedf8cb'),
('cmkdvsxtd0000ttf8d6s28vzz', 'sabik Rahman', 'sabikrahman@gmail.com', 'management', NULL, NULL, '2026-01-14 10:32:15.409', '2026-01-14 10:32:15.409', NULL, 's:8b379767705e3a1ee97b97113c1d9419:d2c14b130c61f4530c8b97a37771316980c63bf599ec7621eeac5677e8e49593e8a6e354e06154645661da0ef8e0c191aa593535c2ba8c2d7a95a7b9d8809e30');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('3c8fb62f-2c00-4d51-aee9-6d6b2801f48e', '136b76a342ac0246ad0a243f7121b27ead3615fadd11f772f71ffde3c4250017', '2025-10-23 19:21:07.302', '20251023192107_add_user_employee_code', NULL, NULL, '2025-10-23 19:21:07.246', 1),
('a7ace02f-1e8e-4076-a424-94f74af9330f', 'c9f4f1055e1a21e5b3a46cb5b6756782733dfcc827bfa2be6f06a077639f8aea', '2025-10-23 20:52:49.030', '20251023205248_add_password_hash_to_user', NULL, NULL, '2025-10-23 20:52:49.014', 1),
('cb046af3-8579-4740-964a-b574ea5f90b1', '0aa68ede6a1aa2ec7de8eb4c0ca9090050002fa3bf642a2a65243fb0f4ec5951', '2025-10-23 19:16:25.464', '20251015090103_init', NULL, NULL, '2025-10-23 19:16:25.205', 1),
('cf6c6599-dae6-40eb-9024-125d1c09ae8d', '33519c25cf22c3e5186ef72af4ca8381f1aae6bc32926af9bd8f671e99e97034', '2025-10-23 19:16:25.707', '20251020111843_init', NULL, NULL, '2025-10-23 19:16:25.467', 1),
('fef98656-73bc-4cbc-a384-9ae67581cb50', 'e09b362a48cb12b97a86897378bff3501ca95146470c3707edc613c4536b5148', '2025-10-24 09:03:01.472', '20251024090301_bill_item_attachment_url', NULL, NULL, '2025-10-24 09:03:01.457', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bill`
--
ALTER TABLE `bill`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Bill_employeeId_idx` (`employeeId`),
  ADD KEY `Bill_supervisorId_idx` (`supervisorId`);

--
-- Indexes for table `billhistory`
--
ALTER TABLE `billhistory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `BillHistory_actorId_idx` (`actorId`),
  ADD KEY `BillHistory_billId_idx` (`billId`);

--
-- Indexes for table `billitem`
--
ALTER TABLE `billitem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `BillItem_date_idx` (`date`),
  ADD KEY `BillItem_billId_idx` (`billId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`),
  ADD UNIQUE KEY `User_employeeCode_key` (`employeeCode`),
  ADD KEY `User_supervisorId_idx` (`supervisorId`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bill`
--
ALTER TABLE `bill`
  ADD CONSTRAINT `Bill_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Bill_supervisorId_fkey` FOREIGN KEY (`supervisorId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `billhistory`
--
ALTER TABLE `billhistory`
  ADD CONSTRAINT `BillHistory_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `BillHistory_billId_fkey` FOREIGN KEY (`billId`) REFERENCES `bill` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `billitem`
--
ALTER TABLE `billitem`
  ADD CONSTRAINT `BillItem_billId_fkey` FOREIGN KEY (`billId`) REFERENCES `bill` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `User_supervisorId_fkey` FOREIGN KEY (`supervisorId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
