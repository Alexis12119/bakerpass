-- MySQL dump 10.13  Distrib 8.4.4, for Linux (x86_64)
--
-- Host: localhost    Database: appointment_system
-- ------------------------------------------------------
-- Server version	8.4.4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `approval_status`
--

DROP TABLE IF EXISTS `approval_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approval_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approval_status`
--

LOCK TABLES `approval_status` WRITE;
/*!40000 ALTER TABLE `approval_status` DISABLE KEYS */;
INSERT INTO `approval_status` VALUES (1,'Approved'),(3,'Blocked'),(4,'Cancelled'),(2,'Waiting For Approval');
/*!40000 ALTER TABLE `approval_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (3,'Finance'),(1,'Human Resources'),(2,'IT'),(4,'Marketing'),(5,'Operations');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departmentId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_department` (`departmentId`),
  CONSTRAINT `fk_department` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'Alexis','Corporal','corporal461@gmail.com','Alexis-122',NULL,2),(2,'Ethan','Castro','ethan.castro@example.com','password123',NULL,1),(3,'Sophia','Reyes','sophia.reyes@example.com','password123',NULL,2),(4,'Liam','Gonzales','liam.gonzales@example.com','password123',NULL,3),(5,'Olivia','Martinez','olivia.martinez@example.com','password123',NULL,4),(6,'Noah','Santos','noah.santos@example.com','password123',NULL,5),(7,'Isabella','Lopez','isabella.lopez@example.com','password123',NULL,1),(8,'Mason','Torres','mason.torres@example.com','password123',NULL,2),(9,'Ava','Cruz','ava.cruz@example.com','password123',NULL,3),(10,'Elijah','Ramirez','elijah.ramirez@example.com','password123',NULL,4),(11,'Charlotte','Flores','charlotte.flores@example.com','password123',NULL,5),(12,'James','Morales','james.morales@example.com','password123',NULL,1),(13,'Amelia','Ortega','amelia.ortega@example.com','password123',NULL,2),(14,'Benjamin','Delgado','benjamin.delgado@example.com','password123',NULL,3),(15,'Mia','Gutierrez','mia.gutierrez@example.com','password123',NULL,4),(16,'Lucas','Navarro','lucas.navarro@example.com','password123',NULL,5),(17,'Harper','Ramos','harper.ramos@example.com','password123',NULL,1),(18,'Henry','Mendoza','henry.mendoza@example.com','password123',NULL,2),(19,'Evelyn','Jimenez','evelyn.jimenez@example.com','password123',NULL,3),(20,'Alexander','Hernandez','alexander.hernandez@example.com','password123',NULL,4),(21,'Scarlett','Vega','scarlett.vega@example.com','password123',NULL,5),(22,'Hype','Beast','hype@gmail.com','hype1234',NULL,4);
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `high_care_prohibited_items`
--

DROP TABLE IF EXISTS `high_care_prohibited_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `high_care_prohibited_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `high_care_request_id` int NOT NULL,
  `mobile_phone` tinyint(1) DEFAULT '0',
  `camera` tinyint(1) DEFAULT '0',
  `medicines` tinyint(1) DEFAULT '0',
  `notebook` tinyint(1) DEFAULT '0',
  `earrings` tinyint(1) DEFAULT '0',
  `other_prohibited_items` text,
  `ring` tinyint(1) DEFAULT '0',
  `id_card` tinyint(1) DEFAULT '0',
  `ballpen` tinyint(1) DEFAULT '0',
  `wristwatch` tinyint(1) DEFAULT '0',
  `necklace` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_items_request` (`high_care_request_id`),
  CONSTRAINT `fk_items_request` FOREIGN KEY (`high_care_request_id`) REFERENCES `high_care_requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `high_care_prohibited_items`
--

LOCK TABLES `high_care_prohibited_items` WRITE;
/*!40000 ALTER TABLE `high_care_prohibited_items` DISABLE KEYS */;
INSERT INTO `high_care_prohibited_items` VALUES (1,1,0,1,0,0,0,NULL,0,0,0,0,0),(2,2,1,0,0,0,0,NULL,0,0,0,0,0),(3,4,1,0,0,0,0,NULL,0,0,0,0,0),(4,6,0,0,0,0,0,NULL,0,0,0,0,0),(5,8,0,0,0,0,0,NULL,0,0,0,0,0),(6,10,0,0,0,0,0,NULL,0,0,0,0,0),(7,12,1,0,0,0,0,NULL,0,0,0,0,0),(8,14,1,0,0,0,0,NULL,0,0,0,0,0),(9,15,1,1,1,1,1,'Facemask',0,0,0,0,0),(10,18,1,1,1,1,1,'sdfsdf',1,0,1,1,1),(11,19,1,1,1,1,1,'dsfsdfds',1,0,1,1,1),(12,22,1,1,1,1,1,'sdfsdf',1,1,1,1,1),(13,23,0,0,0,0,0,'f',0,0,0,0,0),(14,26,0,0,0,0,0,NULL,1,0,1,1,1),(15,27,1,1,1,1,1,NULL,1,0,1,1,1),(16,30,0,1,1,1,1,NULL,1,1,1,1,0),(17,31,1,1,1,1,1,'sdfsdfsdf',1,1,1,1,1),(18,34,1,0,0,0,0,'sdfsd',0,0,0,0,0),(19,36,0,0,0,0,0,'sdfsdf',0,0,0,1,0),(20,38,0,0,1,0,0,NULL,1,0,0,0,0),(21,40,0,0,0,0,0,'sdfsdfsd',0,0,0,1,0),(22,42,1,0,0,0,0,'ss',0,0,0,0,0);
/*!40000 ALTER TABLE `high_care_prohibited_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `high_care_requests`
--

DROP TABLE IF EXISTS `high_care_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `high_care_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `visit_id` int NOT NULL,
  `approved_by_nurse_id` int DEFAULT NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT '0',
  `approved_at` datetime DEFAULT NULL,
  `areas` text,
  `equipment` text,
  `permission_type` varchar(50) DEFAULT NULL,
  `comments` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_highcare_visit` (`visit_id`),
  KEY `fk_approved_nurse` (`approved_by_nurse_id`),
  CONSTRAINT `fk_approved_nurse` FOREIGN KEY (`approved_by_nurse_id`) REFERENCES `nurses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_highcare_visit` FOREIGN KEY (`visit_id`) REFERENCES `visits` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `high_care_requests`
--

LOCK TABLES `high_care_requests` WRITE;
/*!40000 ALTER TABLE `high_care_requests` DISABLE KEYS */;
INSERT INTO `high_care_requests` VALUES (1,48,2,1,'2025-05-19 10:10:39',NULL,NULL,NULL,NULL,'2025-05-19 10:09:28'),(2,49,2,1,'2025-05-19 10:34:10',NULL,NULL,NULL,NULL,'2025-05-19 10:26:39'),(3,49,2,1,'2025-05-19 10:34:10','[\"DC\",\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','test','2025-05-19 10:34:10'),(4,50,2,1,'2025-05-19 12:22:27',NULL,NULL,NULL,NULL,'2025-05-19 12:21:13'),(5,50,2,1,'2025-05-19 12:22:28','[\"DC\",\"VCO\",\"PPI\",\"FSP\"]','[\"Gloves\",\"Facemask\",\"Coat\"]','CLEAR WITH RECTAL','Meow Meow','2025-05-19 12:22:28'),(6,51,2,1,'2025-05-19 14:02:06',NULL,NULL,NULL,NULL,'2025-05-19 14:01:05'),(7,51,2,1,'2025-05-19 14:02:06','[\"DC\",\"VCO\",\"FSP\"]','[\"Gloves\",\"Facemask\"]','CLEAR WITH RECTAL','','2025-05-19 14:02:06'),(8,52,2,1,'2025-05-19 15:59:29',NULL,NULL,NULL,NULL,'2025-05-19 15:58:01'),(9,52,2,1,'2025-05-19 15:59:30','[\"DC\",\"VCO\",\"FSP\"]','[\"Gloves\"]','CLEAR WITH RECTAL','test','2025-05-19 15:59:30'),(10,53,2,1,'2025-05-19 16:13:52',NULL,NULL,NULL,NULL,'2025-05-19 16:11:27'),(11,53,2,1,'2025-05-19 16:13:53','[\"CWC\",\"FSP\"]','[]','CLEAR WITH RECTAL','','2025-05-19 16:13:53'),(12,56,2,1,'2025-05-20 07:05:53',NULL,NULL,NULL,NULL,'2025-05-20 07:05:14'),(13,56,2,1,'2025-05-20 07:05:53','[\"DC\"]','[\"Gloves\"]','CLEAR WITH RECTAL','aa','2025-05-20 07:05:53'),(14,57,2,1,'2025-05-20 23:13:04',NULL,NULL,NULL,NULL,'2025-05-20 23:10:17'),(15,58,2,1,'2025-05-20 23:13:06',NULL,NULL,NULL,NULL,'2025-05-20 23:11:45'),(16,57,2,1,'2025-05-20 23:13:04','[\"CWC\"]','[]','CLEAR WITH RECTAL','','2025-05-20 23:13:04'),(17,58,2,1,'2025-05-20 23:13:06','[]','[]','CLEAR WITH RECTAL','','2025-05-20 23:13:06'),(18,59,2,1,'2025-05-20 23:19:08',NULL,NULL,NULL,NULL,'2025-05-20 23:14:03'),(19,60,2,1,'2025-05-20 23:19:09',NULL,NULL,NULL,NULL,'2025-05-20 23:18:02'),(20,59,2,1,'2025-05-20 23:19:08','[]','[]','CLEAR WITH RECTAL','','2025-05-20 23:19:08'),(21,60,2,1,'2025-05-20 23:19:09','[]','[]','CLEAR WITH RECTAL','','2025-05-20 23:19:09'),(22,61,2,1,'2025-05-20 23:42:33',NULL,NULL,NULL,NULL,'2025-05-20 23:19:56'),(23,62,2,1,'2025-05-20 23:42:35',NULL,NULL,NULL,NULL,'2025-05-20 23:38:14'),(24,61,2,1,'2025-05-20 23:42:33','[]','[]','CLEAR WITH RECTAL','','2025-05-20 23:42:33'),(25,62,2,1,'2025-05-20 23:42:35','[]','[]','CLEAR WITH RECTAL','','2025-05-20 23:42:35'),(26,63,2,1,'2025-05-20 23:52:50',NULL,NULL,NULL,NULL,'2025-05-20 23:44:24'),(27,64,2,1,'2025-05-20 23:52:52',NULL,NULL,NULL,NULL,'2025-05-20 23:50:37'),(28,63,2,1,'2025-05-20 23:52:50','[]','[\"Gloves\"]','CLEAR WITH RECTAL','','2025-05-20 23:52:50'),(29,64,2,1,'2025-05-20 23:52:53','[]','[]','CLEAR WITH RECTAL','','2025-05-20 23:52:53'),(30,65,2,1,'2025-05-21 00:15:27',NULL,NULL,NULL,NULL,'2025-05-21 00:03:25'),(31,66,2,1,'2025-05-21 00:15:23',NULL,NULL,NULL,NULL,'2025-05-21 00:12:20'),(32,66,2,1,'2025-05-21 00:15:23','[\"CWC\"]','[]','CLEAR WITH RECTAL','','2025-05-21 00:15:23'),(33,65,2,1,'2025-05-21 00:15:27','[]','[]','CLEAR WITH RECTAL','','2025-05-21 00:15:27'),(34,72,2,1,'2025-05-21 07:27:18',NULL,NULL,NULL,NULL,'2025-05-21 07:26:48'),(35,72,2,1,'2025-05-21 07:27:18','[\"DC\"]','[]','CLEAR WITH RECTAL','dsfsdfsdf','2025-05-21 07:27:18'),(36,73,2,1,'2025-05-21 07:33:26',NULL,NULL,NULL,NULL,'2025-05-21 07:31:48'),(37,73,2,1,'2025-05-21 07:33:26','[\"DC\"]','[\"Gloves\"]','CLEAR WITH RECTAL','sdfsdetet','2025-05-21 07:33:26'),(38,74,2,1,'2025-05-21 10:17:01',NULL,NULL,NULL,NULL,'2025-05-21 07:36:05'),(39,74,2,1,'2025-05-21 10:17:01','[]','[]','CLEAR WITH RECTAL','','2025-05-21 10:17:01'),(40,94,2,1,'2025-05-21 10:17:44',NULL,NULL,NULL,NULL,'2025-05-21 10:17:23'),(41,94,2,1,'2025-05-21 10:17:44','[]','[]','CLEAR WITH RECTAL','','2025-05-21 10:17:44'),(42,98,2,1,'2025-06-01 04:05:05',NULL,NULL,NULL,NULL,'2025-05-22 14:47:16'),(43,98,2,1,'2025-06-01 04:05:05','[]','[\"Gloves\"]','CLEAR WITH RECTAL','','2025-06-01 04:05:05');
/*!40000 ALTER TABLE `high_care_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `high_care_symptoms`
--

DROP TABLE IF EXISTS `high_care_symptoms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `high_care_symptoms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `high_care_request_id` int NOT NULL,
  `fever` tinyint(1) DEFAULT '0',
  `cough` tinyint(1) DEFAULT '0',
  `open_wound` tinyint(1) DEFAULT '0',
  `nausea` tinyint(1) DEFAULT '0',
  `other_allergies` text,
  `recent_places` text,
  `skin_boils` tinyint(1) DEFAULT '0',
  `skin_allergies` tinyint(1) DEFAULT '0',
  `diarrhea` tinyint(1) DEFAULT '0',
  `open_sores` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_symptoms_request` (`high_care_request_id`),
  CONSTRAINT `fk_symptoms_request` FOREIGN KEY (`high_care_request_id`) REFERENCES `high_care_requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `high_care_symptoms`
--

LOCK TABLES `high_care_symptoms` WRITE;
/*!40000 ALTER TABLE `high_care_symptoms` DISABLE KEYS */;
INSERT INTO `high_care_symptoms` VALUES (1,1,1,0,0,0,NULL,'Cebu',0,0,0,0),(2,2,1,0,0,0,NULL,'Davao City',0,0,0,0),(3,4,1,0,0,0,NULL,'Manila, Cebu, Batangas',0,0,0,0),(4,6,0,0,0,0,NULL,NULL,0,0,0,0),(5,8,0,0,0,0,NULL,NULL,0,0,0,0),(6,10,0,0,0,0,NULL,NULL,0,0,0,0),(7,12,1,0,0,0,'aa','bb',0,0,0,0),(8,14,1,0,0,0,NULL,'Batanes',0,0,0,0),(9,15,1,1,1,1,'Air','Davao',0,0,0,0),(10,18,1,1,1,1,'sdfsdf','dsfsdf',1,1,1,1),(11,19,1,1,1,1,'aaasd','dfsdfds',1,1,1,1),(12,22,1,1,1,1,'sdfsdfsd','sdfsdf',1,1,1,1),(13,23,0,0,0,0,'sdfsdfsdfsd','fdsfsdfsdf',0,0,0,0),(14,26,1,1,1,1,'sdfsdf','dsfdsf',1,1,1,1),(15,27,1,1,1,1,'sdfdsf','sdfsd',1,1,1,1),(16,30,0,0,0,0,'sdfds','sdfaa',0,0,1,1),(17,31,1,1,1,1,'dsfsd','fsdfsdf',1,1,1,1),(18,34,1,0,0,0,'sdfsdf','sdfsdf',1,0,0,0),(19,36,0,1,1,0,'sdfsdf','sdfsdfsd',0,0,0,0),(20,38,1,0,1,0,'sdfsdfs','sdfsdf',1,0,0,0),(21,40,0,0,0,0,'sd','dsfsdf',1,0,1,0),(22,42,1,0,0,0,'ds','dfssd',0,0,0,0);
/*!40000 ALTER TABLE `high_care_symptoms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `human_resources`
--

DROP TABLE IF EXISTS `human_resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `human_resources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `human_resources`
--

LOCK TABLES `human_resources` WRITE;
/*!40000 ALTER TABLE `human_resources` DISABLE KEYS */;
INSERT INTO `human_resources` VALUES (1,'Sarha','Goco','sarha@gmail.com','Sarha-121',NULL);
/*!40000 ALTER TABLE `human_resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nurses`
--

DROP TABLE IF EXISTS `nurses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nurses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nurses`
--

LOCK TABLES `nurses` WRITE;
/*!40000 ALTER TABLE `nurses` DISABLE KEYS */;
INSERT INTO `nurses` VALUES (2,'Sarah','Cruz','sarah.cruz@hospital.com','password123',NULL);
/*!40000 ALTER TABLE `nurses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purposes`
--

DROP TABLE IF EXISTS `purposes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purposes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purposes`
--

LOCK TABLES `purposes` WRITE;
/*!40000 ALTER TABLE `purposes` DISABLE KEYS */;
INSERT INTO `purposes` VALUES (3,'Delivery'),(2,'Interview'),(4,'Maintenance'),(1,'Meeting'),(5,'Personal Visit');
/*!40000 ALTER TABLE `purposes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ratings`
--

DROP TABLE IF EXISTS `ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ratings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rated_employee_id` int NOT NULL,
  `rated_by_employee_id` int NOT NULL,
  `rating` tinyint DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `rated_employee_id` (`rated_employee_id`),
  KEY `rated_by_employee_id` (`rated_by_employee_id`),
  CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`rated_employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`rated_by_employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ratings`
--

LOCK TABLES `ratings` WRITE;
/*!40000 ALTER TABLE `ratings` DISABLE KEYS */;
INSERT INTO `ratings` VALUES (1,1,2,5,'2025-05-12 10:03:44'),(2,1,3,4,'2025-05-12 10:03:44'),(3,1,4,5,'2025-05-12 10:03:44'),(4,1,5,4,'2025-05-12 10:03:44'),(5,1,6,5,'2025-05-12 10:03:44'),(6,1,7,4,'2025-05-12 10:03:44');
/*!40000 ALTER TABLE `ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `security_guards`
--

DROP TABLE IF EXISTS `security_guards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `security_guards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `security_guards`
--

LOCK TABLES `security_guards` WRITE;
/*!40000 ALTER TABLE `security_guards` DISABLE KEYS */;
INSERT INTO `security_guards` VALUES (1,'Jiro Luis','Manalo','jiro@gmail.com','Jiro-121',NULL);
/*!40000 ALTER TABLE `security_guards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `time_slots`
--

DROP TABLE IF EXISTS `time_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `time_slots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_employee` (`employee_id`),
  CONSTRAINT `fk_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `time_slots`
--

LOCK TABLES `time_slots` WRITE;
/*!40000 ALTER TABLE `time_slots` DISABLE KEYS */;
INSERT INTO `time_slots` VALUES (3,1,'09:01:00','10:01:00'),(4,1,'10:00:00','11:00:00');
/*!40000 ALTER TABLE `time_slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `valid_id_types`
--

DROP TABLE IF EXISTS `valid_id_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `valid_id_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `valid_id_types`
--

LOCK TABLES `valid_id_types` WRITE;
/*!40000 ALTER TABLE `valid_id_types` DISABLE KEYS */;
INSERT INTO `valid_id_types` VALUES (1,'Driver\'s License'),(2,'Passport'),(4,'PhilHealth ID'),(3,'SSS ID'),(6,'Student ID'),(5,'UMID');
/*!40000 ALTER TABLE `valid_id_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visit_statuses`
--

DROP TABLE IF EXISTS `visit_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visit_statuses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visit_statuses`
--

LOCK TABLES `visit_statuses` WRITE;
/*!40000 ALTER TABLE `visit_statuses` DISABLE KEYS */;
INSERT INTO `visit_statuses` VALUES (1,'Checked In'),(2,'Checked Out'),(3,'Ongoing');
/*!40000 ALTER TABLE `visit_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visitors`
--

DROP TABLE IF EXISTS `visitors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visitors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `firstName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contactNumber` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otp` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visitors`
--

LOCK TABLES `visitors` WRITE;
/*!40000 ALTER TABLE `visitors` DISABLE KEYS */;
INSERT INTO `visitors` VALUES (1,'john.doe@example.com','password123','John','Doe','09171234567','123 Main St, Quezon City',NULL),(2,'jasper1@example.com','password123','Jasper','Velasco','09281234567','456 Elm St, Makati',NULL),(3,'alexis2@example.com','password123','Alexiss','Corporal','09301234567','789 Pine St, Taguig',NULL),(4,'jiro3@example.com','password123','Jiro Luis','Manalo','09421234567','101 Maple St, Pasig',NULL),(5,'kimberly4@example.com','password123','Kimberly','Caguite','09531234567','202 Oak St, Mandaluyong',NULL),(6,'sarha5@example.com','password123','Sarha','Goco','09641234567','303 Birch St, Paranaque',NULL),(7,'alyssa6@example.com','password123','Alyssa','Urrera','09751234567','404 Cedar St, Makati',NULL),(8,'jasper7@example.com','password123','Jasper','Velasco','09861234567','505 Pine St, Quezon City',NULL),(9,'alexis8@example.com','password123','Alexis','Corporal','09971234567','606 Oak St, Taguig',NULL),(10,'jiro9@example.com','password123','Jiro Luis','Manalo','09181234567','707 Elm St, Pasig',NULL),(11,'kimberly10@example.com','password123','Kimberly','Caguite','09291234567','808 Birch St, Mandaluyong',NULL),(12,'sarha11@example.com','password123','Sarha','Goco','09301234567','909 Maple St, Paranaque',NULL),(13,'alyssa12@example.com','password123','Alyssa','Urrera','09411234567','101 Cedar St, Makati',NULL),(14,'jasper13@example.com','password123','Jasper','Velasco','09521234567','202 Pine St, Quezon City',NULL),(15,'alexis14@example.com','password123','Alexis','Corporal','09631234567','303 Oak St, Taguig',NULL),(16,'jiro15@example.com','password123','Jiro Luis','Manalo','09741234567','404 Elm St, Pasig',NULL),(17,'kimberly16@example.com','password123','Kimberly','Caguite','09851234567','505 Birch St, Mandaluyong',NULL),(18,'sarha17@example.com','password123','Sarha','Goco','09961234567','606 Maple St, Paranaque',NULL),(19,'alyssa18@example.com','password123','Alyssa','Urrera','09171234567','707 Cedar St, Makati',NULL),(20,'jasper19@example.com','password123','Jasper','Velasco','09281234567','808 Pine St, Quezon City',NULL),(21,'alexis20@example.com','password123','Alexis','Corporal','09301234567','909 Oak St, Taguig',NULL),(60,'test.ing}@walkin.local','','Test','Ing','','',NULL),(61,'hello.wora@walkin.local','','Hello','Wora','','',NULL),(62,'alexis.corporal@walkin.local','','Alexis','Corporal','','',NULL),(63,'kim.gerald@walkin.local','','Kim','Gerald','','',NULL),(64,'louven.alinea@walkin.local','','Louven','Alinea','','',NULL),(65,'arkyn .corporal@walkin.local','','Arkyn ','Corporal','','',NULL),(66,'alrich.corporal@walkin.local','','Alrich','Corporal','','',NULL),(67,'ka.muning@walkin.local','','Ka','Muning','','',NULL),(76,'how.to@walkin.local','','How','To','','',NULL),(77,'test.aa@walkin.local','','test','aa','','',NULL),(78,'to.how@walkin.local','','To','How','','',NULL),(79,'ha.ah@walkin.local','','Ha','aH','','',NULL),(80,'baka.akab@walkin.local','','Baka','akab','','',NULL),(81,'aabb.bbbbb@walkin.local','','aabb','bbbbb','','',NULL),(82,'asdfsd.dsdsfsdf@walkin.local','','asdfsd','dsdsfsdf','','',NULL),(83,'sdfsdf.sdfsdf@walkin.local','','sdfsdf','sdfsdf','','',NULL),(84,'tesss.ingggg@walkin.local','','tesss','ingggg','','',NULL),(85,'sdfsdf.dsfsdf@walkin.local','','sdfsdf','dsfsdf','','',NULL),(86,'sdfsdf.dsf@walkin.local','','sdfsdf','dsf','','',NULL),(87,'aa.aa@walkin.local','','aa','aa','','',NULL);
/*!40000 ALTER TABLE `visitors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visits`
--

DROP TABLE IF EXISTS `visits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `visitor_id` int DEFAULT NULL,
  `visited_employee_id` int NOT NULL,
  `visit_date` date NOT NULL,
  `time_in` time DEFAULT NULL,
  `time_out` time DEFAULT NULL,
  `expected_time` varchar(20) DEFAULT NULL,
  `purposeid` int DEFAULT NULL,
  `approval_status_id` int DEFAULT '2',
  `time_slot_id` int DEFAULT NULL,
  `valid_id_type_id` int DEFAULT NULL,
  `status_id` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `visitor_id` (`visitor_id`),
  KEY `visited_employee_id` (`visited_employee_id`),
  KEY `fk_purpose` (`purposeid`),
  KEY `fk_approval` (`approval_status_id`),
  KEY `fk_time_slot` (`time_slot_id`),
  KEY `fk_valid_id_type` (`valid_id_type_id`),
  KEY `fk_visit_status` (`status_id`),
  CONSTRAINT `fk_approval` FOREIGN KEY (`approval_status_id`) REFERENCES `approval_status` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_purpose` FOREIGN KEY (`purposeid`) REFERENCES `purposes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_time_slot` FOREIGN KEY (`time_slot_id`) REFERENCES `time_slots` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_valid_id_type` FOREIGN KEY (`valid_id_type_id`) REFERENCES `valid_id_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_visit_status` FOREIGN KEY (`status_id`) REFERENCES `visit_statuses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `visits_ibfk_2` FOREIGN KEY (`visited_employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visits`
--

LOCK TABLES `visits` WRITE;
/*!40000 ALTER TABLE `visits` DISABLE KEYS */;
INSERT INTO `visits` VALUES (1,1,2,'2025-05-10','15:28:10','15:28:12','8:00 AM - 9:00 AM',1,1,NULL,3,1),(2,2,3,'2025-05-10','17:59:19','17:59:20','11:00 AM - 12:00 PM',2,1,NULL,6,1),(3,3,4,'2025-05-11','15:18:47',NULL,'2:00 PM - 3:00 PM',3,1,NULL,NULL,1),(4,4,5,'2025-05-11','15:19:37',NULL,'5:00 PM - 6:00 PM',4,1,NULL,NULL,1),(5,5,6,'2025-05-11','15:23:24',NULL,'8:00 AM - 9:00 AM',5,1,NULL,3,1),(6,6,7,'2025-05-12','15:09:12',NULL,'11:00 AM - 12:00 PM',1,1,NULL,NULL,1),(7,7,8,'2025-05-12','18:48:14','10:14:18','2:00 PM - 3:00 PM',2,1,NULL,6,2),(8,8,9,'2025-05-12','15:13:28',NULL,'5:00 PM - 6:00 PM',3,1,NULL,NULL,1),(9,9,10,'2025-05-12','12:27:45','12:27:47','8:00 AM - 9:00 AM',4,1,NULL,NULL,1),(10,10,11,'2025-05-12','18:25:10','18:32:56','11:00 AM - 12:00 PM',5,1,NULL,NULL,1),(11,11,12,'2025-05-12',NULL,NULL,'2:00 PM - 3:00 PM',1,3,NULL,NULL,1),(12,12,13,'2025-05-12',NULL,NULL,'5:00 PM - 6:00 PM',2,4,NULL,NULL,1),(13,13,14,'2025-05-12',NULL,NULL,'8:00 AM - 9:00 AM',3,3,NULL,NULL,1),(14,14,15,'2025-05-12','18:26:01','18:32:51','11:00 AM - 12:00 PM',4,1,NULL,NULL,1),(15,15,16,'2025-05-12','18:30:14','18:32:53','2:00 PM - 3:00 PM',5,1,NULL,NULL,1),(16,26,30,'2025-05-12',NULL,NULL,'5:00 PM - 6:00 PM',1,2,NULL,NULL,1),(17,27,31,'2025-05-13',NULL,NULL,'8:00 AM - 9:00 AM',2,2,NULL,NULL,1),(20,37,1,'2025-05-13',NULL,NULL,'7:00 PM - 8:00 PM',5,4,NULL,NULL,1),(21,38,2,'2025-05-13',NULL,NULL,'11:00 AM - 12:00 PM',3,1,NULL,NULL,1),(22,39,6,'2025-05-13',NULL,NULL,'7:00 PM - 8:00 PM',3,2,NULL,NULL,1),(47,64,1,'2025-05-19',NULL,NULL,'9:01 AM - 10:01 AM',3,4,NULL,NULL,1),(48,65,1,'2025-05-19','18:14:28','10:14:08','9:01 AM - 10:01 AM',1,1,NULL,6,2),(49,66,1,'2025-05-19',NULL,NULL,'9:01 AM - 10:01 AM',3,4,NULL,NULL,1),(50,67,1,'2025-05-19','20:23:41','20:23:44','9:01 AM - 10:01 AM',5,1,NULL,6,1),(51,3,1,'2025-05-19','23:12:18','23:12:19','9:01 AM - 10:01 AM',1,1,NULL,6,1),(52,3,1,'2025-05-19',NULL,NULL,'9:01 AM - 10:01 AM',5,4,NULL,NULL,1),(53,3,1,'2025-05-19',NULL,NULL,'9:01 AM - 10:01 AM',1,3,NULL,NULL,1),(54,3,1,'2025-05-19','00:14:49','00:14:50','9:01 AM - 10:01 AM',4,1,NULL,2,1),(55,76,1,'2025-05-20','10:25:47','10:26:16','9:01 AM - 10:01 AM',3,1,NULL,3,2),(56,77,1,'2025-05-20','15:06:16','15:06:18','9:01 AM - 10:01 AM',4,1,NULL,3,2),(57,78,1,'2025-05-20',NULL,NULL,'9:01 AM - 10:01 AM',3,4,NULL,NULL,1),(58,79,1,'2025-05-20',NULL,NULL,'10:00 AM - 11:00 AM',3,4,NULL,NULL,1),(59,80,1,'2025-05-20',NULL,NULL,'9:01 AM - 10:01 AM',2,3,NULL,NULL,1),(60,81,1,'2025-05-20',NULL,NULL,'10:00 AM - 11:00 AM',3,3,NULL,NULL,1),(61,82,1,'2025-05-20',NULL,NULL,'9:01 AM - 10:01 AM',3,4,NULL,NULL,1),(62,3,1,'2025-05-20',NULL,NULL,'10:00 AM - 11:00 AM',4,3,NULL,NULL,1),(63,3,1,'2025-05-20',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1),(64,3,1,'2025-05-20',NULL,NULL,'10:00 AM - 11:00 AM',2,4,NULL,NULL,1),(65,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',2,4,NULL,NULL,1),(66,3,1,'2025-05-21',NULL,NULL,'10:00 AM - 11:00 AM',2,4,NULL,NULL,1),(67,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,3,NULL,NULL,1),(68,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,3,NULL,NULL,1),(69,3,1,'2025-05-21',NULL,NULL,'10:00 AM - 11:00 AM',2,3,NULL,NULL,1),(70,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',2,4,NULL,NULL,1),(71,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1),(72,83,1,'2025-05-21','15:28:33','15:28:35','9:01 AM - 10:01 AM',3,1,NULL,6,2),(73,3,1,'2025-05-21','15:34:36','15:34:45','9:01 AM - 10:01 AM',2,1,NULL,6,2),(74,84,1,'2025-05-21',NULL,NULL,'10:00 AM - 11:00 AM',4,4,NULL,NULL,1),(75,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',2,4,NULL,NULL,1),(76,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1),(77,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1),(78,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',2,4,NULL,NULL,1),(79,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',2,4,NULL,NULL,1),(80,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',2,4,NULL,NULL,1),(81,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1),(82,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',2,4,NULL,NULL,1),(83,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1),(84,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',2,4,NULL,NULL,1),(85,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1),(86,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1),(87,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1),(88,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,3,NULL,NULL,1),(89,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1),(90,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1),(91,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',2,4,NULL,NULL,1),(92,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',2,4,NULL,NULL,1),(93,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',2,4,NULL,NULL,1),(94,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1),(95,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1),(96,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',5,3,3,NULL,1),(97,85,1,'2025-05-22',NULL,NULL,'10:00 AM - 11:00 AM',3,4,NULL,NULL,1),(98,86,1,'2025-05-22',NULL,NULL,'10:00 AM - 11:00 AM',3,4,NULL,NULL,1),(99,3,1,'2025-06-01',NULL,NULL,'10:00 AM - 11:00 AM',4,4,NULL,NULL,1),(100,87,1,'2025-06-01','12:07:23','12:07:26','10:00 AM - 11:00 AM',2,1,NULL,6,2);
/*!40000 ALTER TABLE `visits` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-02 14:39:11
