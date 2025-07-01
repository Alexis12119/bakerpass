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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approval_status`
--

LOCK TABLES `approval_status` WRITE;
/*!40000 ALTER TABLE `approval_status` DISABLE KEYS */;
INSERT INTO `approval_status` VALUES (1,'Approved'),(3,'Blocked'),(4,'Cancelled'),(6,'Nurse Approved'),(7,'Partial Approved'),(2,'Waiting For Approval');
/*!40000 ALTER TABLE `approval_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,'Hello','2025-06-19 03:59:15'),(2,'Good','2025-06-19 13:17:41');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
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
  `first_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `profile_image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_department` (`department_id`),
  CONSTRAINT `fk_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'Alexis','Corporal','corporal461@gmail.com','$2b$10$3/tkpZpIf/GDRo79Qk/Tg.JXqNezNO/bRCX/JkpMEU91hZ.AbOxIu',NULL,2,'https://res.cloudinary.com/dclud1dt9/image/upload/v1750956425/employees_profiles/ckfcuscfbbxdtpx3ruvj.jpg'),(2,'Ethan','Castro','ethan.castro@example.com','password123',NULL,1,NULL),(3,'Sophia','Reyes','sophia.reyes@example.com','password123',NULL,2,NULL),(4,'Liam','Gonzales','liam.gonzales@example.com','password123',NULL,3,NULL),(5,'Olivia','Martinez','olivia.martinez@example.com','password123',NULL,4,NULL),(6,'Noah','Santos','noah.santos@example.com','password123',NULL,5,NULL),(7,'Isabella','Lopez','isabella.lopez@example.com','password123',NULL,1,NULL),(8,'Mason','Torres','mason.torres@example.com','password123',NULL,2,NULL),(9,'Ava','Cruz','ava.cruz@example.com','password123',NULL,3,NULL),(10,'Elijah','Ramirez','elijah.ramirez@example.com','password123',NULL,4,NULL),(11,'Charlotte','Flores','charlotte.flores@example.com','password123',NULL,5,NULL),(12,'James','Morales','james.morales@example.com','password123',NULL,1,NULL),(13,'Amelia','Ortega','amelia.ortega@example.com','password123',NULL,2,NULL),(14,'Benjamin','Delgado','benjamin.delgado@example.com','password123',NULL,3,NULL),(15,'Mia','Gutierrez','mia.gutierrez@example.com','password123',NULL,4,NULL),(16,'Lucas','Navarro','lucas.navarro@example.com','password123',NULL,5,NULL),(17,'Harper','Ramos','harper.ramos@example.com','password123',NULL,1,NULL),(18,'Henry','Mendoza','henry.mendoza@example.com','password123',NULL,2,NULL),(19,'Evelyn','Jimenez','evelyn.jimenez@example.com','password123',NULL,3,NULL),(20,'Alexander','Hernandez','alexander.hernandez@example.com','password123',NULL,4,NULL),(21,'Scarlett','Vega','scarlett.vega@example.com','password123',NULL,5,NULL),(22,'Hype','Beast','hype@gmail.com','hype1234',NULL,4,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `high_care_prohibited_items`
--

LOCK TABLES `high_care_prohibited_items` WRITE;
/*!40000 ALTER TABLE `high_care_prohibited_items` DISABLE KEYS */;
INSERT INTO `high_care_prohibited_items` VALUES (1,1,0,1,0,0,0,NULL,0,0,0,0,0),(2,2,1,0,0,0,0,NULL,0,0,0,0,0),(3,4,1,0,0,0,0,NULL,0,0,0,0,0),(4,6,0,0,0,0,0,NULL,0,0,0,0,0),(5,8,0,0,0,0,0,NULL,0,0,0,0,0),(6,10,0,0,0,0,0,NULL,0,0,0,0,0),(7,12,1,0,0,0,0,NULL,0,0,0,0,0),(8,14,1,0,0,0,0,NULL,0,0,0,0,0),(9,15,1,1,1,1,1,'Facemask',0,0,0,0,0),(10,18,1,1,1,1,1,'sdfsdf',1,0,1,1,1),(11,19,1,1,1,1,1,'dsfsdfds',1,0,1,1,1),(12,22,1,1,1,1,1,'sdfsdf',1,1,1,1,1),(13,23,0,0,0,0,0,'f',0,0,0,0,0),(14,26,0,0,0,0,0,NULL,1,0,1,1,1),(15,27,1,1,1,1,1,NULL,1,0,1,1,1),(16,30,0,1,1,1,1,NULL,1,1,1,1,0),(17,31,1,1,1,1,1,'sdfsdfsdf',1,1,1,1,1),(18,34,1,0,0,0,0,'sdfsd',0,0,0,0,0),(19,36,0,0,0,0,0,'sdfsdf',0,0,0,1,0),(20,38,0,0,1,0,0,NULL,1,0,0,0,0),(21,40,0,0,0,0,0,'sdfsdfsd',0,0,0,1,0),(22,42,1,0,0,0,0,'ss',0,0,0,0,0),(23,44,1,0,1,0,0,NULL,0,0,0,0,0),(24,46,0,1,0,0,0,'dsafadsf',0,0,0,0,0),(25,48,1,0,0,0,0,'sdfsadf',0,0,0,0,0),(26,50,0,0,1,0,0,'sdfasdf',0,1,0,0,0),(27,52,1,0,0,0,0,'sdafsadfsd',0,0,0,0,1),(31,57,1,0,0,0,0,'adsfsadf',0,0,0,0,0),(37,67,0,0,1,0,0,'asdfsadf',0,1,0,0,0),(38,68,0,0,1,0,0,'a',0,0,0,0,0),(39,69,0,0,1,0,0,'adsfasdf',0,1,0,0,0),(40,70,1,1,0,0,0,'asdfsadf',0,0,0,0,0),(41,71,0,0,1,0,0,'asdfdsaf',1,0,0,0,0),(42,72,1,0,0,0,0,'asdfsadf',0,0,0,0,1),(43,73,0,0,1,0,0,'asdfasdf',0,1,0,0,0),(44,74,0,0,1,0,0,'asdfasdf',0,1,0,0,0),(45,77,0,1,0,0,0,'asdfs',0,0,0,0,0),(46,78,0,0,0,0,0,'sdfsadf',1,0,0,0,0),(47,79,0,1,0,0,0,'sadfads',0,0,0,0,0),(48,80,0,0,1,0,0,'asdfasdf',0,0,0,0,0),(49,81,1,0,0,0,0,'asdfsadf',1,0,0,0,0),(50,82,0,1,0,0,0,'sdfasdf',0,0,0,0,0),(51,83,1,0,0,0,1,'asdfasdf',0,0,0,0,0),(52,84,0,1,0,0,0,'asdfsdaf',0,0,0,0,0),(53,85,0,1,0,0,0,'adsfasdf',0,0,0,0,0),(54,86,0,1,0,0,0,'asdfsadf',0,0,0,0,0),(55,87,0,0,1,0,0,'asdfasdf',0,0,0,0,0),(56,88,0,0,1,0,0,'adsfasd',0,0,0,0,0),(57,89,0,1,0,0,0,'adsfsadf',0,0,0,0,0),(58,90,1,0,0,0,0,'dsafasdf',0,0,0,0,0),(59,91,0,0,0,0,0,'asdfasdf',0,0,0,1,0);
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
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `high_care_requests`
--

LOCK TABLES `high_care_requests` WRITE;
/*!40000 ALTER TABLE `high_care_requests` DISABLE KEYS */;
INSERT INTO `high_care_requests` VALUES (1,48,2,1,'2025-05-19 10:10:39',NULL,NULL,NULL,NULL,'2025-05-19 10:09:28'),(2,49,2,1,'2025-05-19 10:34:10',NULL,NULL,NULL,NULL,'2025-05-19 10:26:39'),(3,49,2,1,'2025-05-19 10:34:10','[\"DC\",\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL',NULL,'2025-05-19 10:34:10'),(4,50,2,1,'2025-05-19 12:22:27',NULL,NULL,NULL,NULL,'2025-05-19 12:21:13'),(5,50,2,1,'2025-05-19 12:22:28','[\"DC\",\"VCO\",\"PPI\",\"FSP\"]','[\"Gloves\",\"Facemask\",\"Coat\"]','CLEAR WITH RECTAL',NULL,'2025-05-19 12:22:28'),(6,51,2,1,'2025-05-19 14:02:06',NULL,NULL,NULL,NULL,'2025-05-19 14:01:05'),(7,51,2,1,'2025-05-19 14:02:06','[\"DC\",\"VCO\",\"FSP\"]','[\"Gloves\",\"Facemask\"]','CLEAR WITH RECTAL',NULL,'2025-05-19 14:02:06'),(8,52,2,1,'2025-05-19 15:59:29',NULL,NULL,NULL,NULL,'2025-05-19 15:58:01'),(9,52,2,1,'2025-05-19 15:59:30','[\"DC\",\"VCO\",\"FSP\"]','[\"Gloves\"]','CLEAR WITH RECTAL',NULL,'2025-05-19 15:59:30'),(10,53,2,1,'2025-05-19 16:13:52',NULL,NULL,NULL,NULL,'2025-05-19 16:11:27'),(11,53,2,1,'2025-05-19 16:13:53','[\"CWC\",\"FSP\"]','[]','CLEAR WITH RECTAL',NULL,'2025-05-19 16:13:53'),(12,56,2,1,'2025-05-20 07:05:53',NULL,NULL,NULL,NULL,'2025-05-20 07:05:14'),(13,56,2,1,'2025-05-20 07:05:53','[\"DC\"]','[\"Gloves\"]','CLEAR WITH RECTAL',NULL,'2025-05-20 07:05:53'),(14,57,2,1,'2025-05-20 23:13:04',NULL,NULL,NULL,NULL,'2025-05-20 23:10:17'),(15,58,2,1,'2025-05-20 23:13:06',NULL,NULL,NULL,NULL,'2025-05-20 23:11:45'),(16,57,2,1,'2025-05-20 23:13:04','[\"CWC\"]','[]','CLEAR WITH RECTAL',NULL,'2025-05-20 23:13:04'),(17,58,2,1,'2025-05-20 23:13:06','[]','[]','CLEAR WITH RECTAL',NULL,'2025-05-20 23:13:06'),(18,59,2,1,'2025-05-20 23:19:08',NULL,NULL,NULL,NULL,'2025-05-20 23:14:03'),(19,60,2,1,'2025-05-20 23:19:09',NULL,NULL,NULL,NULL,'2025-05-20 23:18:02'),(20,59,2,1,'2025-05-20 23:19:08','[]','[]','CLEAR WITH RECTAL',NULL,'2025-05-20 23:19:08'),(21,60,2,1,'2025-05-20 23:19:09','[]','[]','CLEAR WITH RECTAL',NULL,'2025-05-20 23:19:09'),(22,61,2,1,'2025-05-20 23:42:33',NULL,NULL,NULL,NULL,'2025-05-20 23:19:56'),(23,62,2,1,'2025-05-20 23:42:35',NULL,NULL,NULL,NULL,'2025-05-20 23:38:14'),(24,61,2,1,'2025-05-20 23:42:33','[]','[]','CLEAR WITH RECTAL',NULL,'2025-05-20 23:42:33'),(25,62,2,1,'2025-05-20 23:42:35','[]','[]','CLEAR WITH RECTAL',NULL,'2025-05-20 23:42:35'),(26,63,2,1,'2025-05-20 23:52:50',NULL,NULL,NULL,NULL,'2025-05-20 23:44:24'),(27,64,2,1,'2025-05-20 23:52:52',NULL,NULL,NULL,NULL,'2025-05-20 23:50:37'),(28,63,2,1,'2025-05-20 23:52:50','[]','[\"Gloves\"]','CLEAR WITH RECTAL',NULL,'2025-05-20 23:52:50'),(29,64,2,1,'2025-05-20 23:52:53','[]','[]','CLEAR WITH RECTAL',NULL,'2025-05-20 23:52:53'),(30,65,2,1,'2025-05-21 00:15:27',NULL,NULL,NULL,NULL,'2025-05-21 00:03:25'),(31,66,2,1,'2025-05-21 00:15:23',NULL,NULL,NULL,NULL,'2025-05-21 00:12:20'),(32,66,2,1,'2025-05-21 00:15:23','[\"CWC\"]','[]','CLEAR WITH RECTAL',NULL,'2025-05-21 00:15:23'),(33,65,2,1,'2025-05-21 00:15:27','[]','[]','CLEAR WITH RECTAL',NULL,'2025-05-21 00:15:27'),(34,72,2,1,'2025-05-21 07:27:18',NULL,NULL,NULL,NULL,'2025-05-21 07:26:48'),(35,72,2,1,'2025-05-21 07:27:18','[\"DC\"]','[]','CLEAR WITH RECTAL',NULL,'2025-05-21 07:27:18'),(36,73,2,1,'2025-05-21 07:33:26',NULL,NULL,NULL,NULL,'2025-05-21 07:31:48'),(37,73,2,1,'2025-05-21 07:33:26','[\"DC\"]','[\"Gloves\"]','CLEAR WITH RECTAL',NULL,'2025-05-21 07:33:26'),(38,74,2,1,'2025-05-21 10:17:01',NULL,NULL,NULL,NULL,'2025-05-21 07:36:05'),(39,74,2,1,'2025-05-21 10:17:01','[]','[]','CLEAR WITH RECTAL',NULL,'2025-05-21 10:17:01'),(40,94,2,1,'2025-05-21 10:17:44',NULL,NULL,NULL,NULL,'2025-05-21 10:17:23'),(41,94,2,1,'2025-05-21 10:17:44','[]','[]','CLEAR WITH RECTAL',NULL,'2025-05-21 10:17:44'),(42,98,2,1,'2025-06-01 04:05:05',NULL,NULL,NULL,NULL,'2025-05-22 14:47:16'),(43,98,2,1,'2025-06-01 04:05:05','[]','[\"Gloves\"]','CLEAR WITH RECTAL',NULL,'2025-06-01 04:05:05'),(44,109,2,1,'2025-06-03 01:37:53',NULL,NULL,NULL,NULL,'2025-06-03 01:15:59'),(45,109,2,1,'2025-06-03 01:37:53','[]','[\"Gloves\"]','CLEAR WITH RECTAL',NULL,'2025-06-03 01:37:53'),(46,132,2,1,'2025-06-03 14:30:45',NULL,NULL,NULL,NULL,'2025-06-03 14:30:12'),(47,132,2,1,'2025-06-03 14:30:45','[\"CWC\"]','[\"Gloves\"]','CLEAR WITH URINE',NULL,'2025-06-03 14:30:45'),(48,134,2,1,'2025-06-12 03:10:56',NULL,NULL,NULL,NULL,'2025-06-12 03:09:50'),(49,134,2,1,'2025-06-12 03:10:56','[\"CWC\"]','[\"Gloves\"]','CLEAR WITH RECTAL',NULL,'2025-06-12 03:10:56'),(50,137,2,1,'2025-06-19 22:42:07',NULL,NULL,NULL,NULL,'2025-06-19 22:41:27'),(51,137,2,1,'2025-06-19 22:42:07','[\"CWC\",\"DC\"]','[\"Gloves\"]','CLEAR WITH RECTAL','sdfasdfs','2025-06-19 22:42:07'),(52,139,2,1,'2025-06-20 06:47:23',NULL,NULL,NULL,NULL,'2025-06-20 06:45:04'),(53,139,2,1,'2025-06-20 06:47:23','[\"DC\"]','[\"Facemask\",\"Gloves\"]','CLEAR WITH RECTAL','hello','2025-06-20 06:47:23'),(57,150,2,1,'2025-06-24 15:16:56',NULL,NULL,NULL,NULL,'2025-06-24 15:13:57'),(58,150,2,1,'2025-06-24 15:16:56','[\"CWC\"]','[\"Gloves\"]','CLEAR WITHOUT TEST','asdfsadf','2025-06-24 15:16:56'),(67,156,2,1,NULL,'[\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','asdfasdf','2025-06-25 14:21:42'),(68,157,2,1,NULL,'[\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','aa','2025-06-25 14:27:36'),(69,158,2,1,NULL,'[\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','','2025-06-25 14:36:08'),(70,160,2,1,NULL,'[\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','','2025-06-25 14:38:50'),(71,161,2,1,NULL,'[\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','asdfasdf','2025-06-25 14:47:18'),(72,164,2,1,NULL,'[\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','adsfsadf','2025-06-25 15:49:55'),(73,167,2,1,NULL,'[\"CWC\"]','[\"Facemask\"]','CLEAR WITH RECTAL','asdf','2025-06-25 16:36:06'),(74,168,2,1,NULL,'[\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','sdfasf','2025-06-25 16:44:14'),(75,169,2,1,NULL,'[\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','asddsaaf','2025-06-25 16:52:58'),(76,169,2,1,NULL,'[\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','asddsaaf','2025-06-25 16:53:05'),(77,169,2,1,NULL,'[\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','asddsaaf','2025-06-25 16:53:11'),(78,169,2,1,NULL,'[\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','asdf','2025-06-25 16:54:26'),(79,170,2,1,NULL,'[\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','asdf','2025-06-25 17:00:05'),(80,171,2,1,NULL,'[\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','sdfasdf','2025-06-25 17:02:41'),(81,172,2,1,NULL,'[\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','sdafsdf','2025-06-26 07:40:20'),(82,173,2,1,NULL,'[\"CWC\",\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','asdfsadf','2025-06-26 14:43:12'),(83,174,2,1,NULL,'[\"CWC\",\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','adsf','2025-06-26 15:21:52'),(84,185,2,1,NULL,'[\"CWC\",\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','asdfsad','2025-06-26 17:20:31'),(85,186,2,1,NULL,'[\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','','2025-06-26 18:07:48'),(86,187,2,1,NULL,'[\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','','2025-06-26 18:19:20'),(87,189,2,1,NULL,'[\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','','2025-06-28 12:41:15'),(88,189,2,1,NULL,'[\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','sadfas','2025-06-28 12:42:12'),(89,190,2,1,NULL,'[\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','asdfasf','2025-06-28 12:59:59'),(90,191,2,1,NULL,'[\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','','2025-06-29 11:24:29'),(91,192,2,1,NULL,'[\"FSP\"]','[\"Facemask\"]','CLEAR WITH RECTAL','','2025-06-29 11:25:49');
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
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `high_care_symptoms`
--

LOCK TABLES `high_care_symptoms` WRITE;
/*!40000 ALTER TABLE `high_care_symptoms` DISABLE KEYS */;
INSERT INTO `high_care_symptoms` VALUES (1,1,1,0,0,0,NULL,'Cebu',0,0,0,0),(2,2,1,0,0,0,NULL,'Davao City',0,0,0,0),(3,4,1,0,0,0,NULL,'Manila, Cebu, Batangas',0,0,0,0),(4,6,0,0,0,0,NULL,NULL,0,0,0,0),(5,8,0,0,0,0,NULL,NULL,0,0,0,0),(6,10,0,0,0,0,NULL,NULL,0,0,0,0),(7,12,1,0,0,0,'aa','bb',0,0,0,0),(8,14,1,0,0,0,NULL,'Batanes',0,0,0,0),(9,15,1,1,1,1,'Air','Davao',0,0,0,0),(10,18,1,1,1,1,'sdfsdf','dsfsdf',1,1,1,1),(11,19,1,1,1,1,'aaasd','dfsdfds',1,1,1,1),(12,22,1,1,1,1,'sdfsdfsd','sdfsdf',1,1,1,1),(13,23,0,0,0,0,'sdfsdfsdfsd','fdsfsdfsdf',0,0,0,0),(14,26,1,1,1,1,'sdfsdf','dsfdsf',1,1,1,1),(15,27,1,1,1,1,'sdfdsf','sdfsd',1,1,1,1),(16,30,0,0,0,0,'sdfds','sdfaa',0,0,1,1),(17,31,1,1,1,1,'dsfsd','fsdfsdf',1,1,1,1),(18,34,1,0,0,0,'sdfsdf','sdfsdf',1,0,0,0),(19,36,0,1,1,0,'sdfsdf','sdfsdfsd',0,0,0,0),(20,38,1,0,1,0,'sdfsdfs','sdfsdf',1,0,0,0),(21,40,0,0,0,0,'sd','dsfsdf',1,0,1,0),(22,42,1,0,0,0,'ds','dfssd',0,0,0,0),(23,44,1,0,0,0,'sdfasd','sdafsad',0,0,0,0),(24,46,1,0,0,0,'dsafas','dfasd',0,0,0,0),(25,48,1,0,0,0,'sdfasd','fsdaf',0,0,0,0),(26,50,1,1,0,0,'dsfasd','fsadfsadf',0,0,0,0),(27,52,1,0,0,0,'sdfasdf','sdfasdf',0,0,0,0),(31,57,1,0,1,0,'sadfsadf','adsfdsaf',0,0,0,0),(37,67,1,0,1,0,'asdfsadf','asdfasdf',0,0,0,0),(38,68,1,0,1,0,'adsfasdf','asdfasdf',0,0,0,0),(39,69,1,0,0,0,'asdfsdaf','asdfsadf',0,0,0,0),(40,70,1,0,0,0,'dsafsad','fsadfsdaf',1,0,0,0),(41,71,1,0,0,0,'adsfas','dfsadfa',0,0,0,0),(42,72,1,0,0,0,'adsf','sadfsadf',0,0,0,0),(43,73,0,1,0,0,'a','dsafasdf',0,0,0,0),(44,74,1,1,0,0,'asdfsd','fsadf',0,0,0,0),(45,77,1,1,0,0,'asdfsa','aa',0,0,0,0),(46,78,0,0,1,0,'sdaf','sdfsadf',0,0,0,0),(47,79,1,0,0,0,'asdf','asdf',0,0,0,0),(48,80,0,0,1,0,'fasdf','asdfds',0,0,0,0),(49,81,1,0,0,0,'sdfsadf','sdfsadfs',0,0,0,0),(50,82,1,0,0,0,'sdfsad','sdafsadf',0,0,0,0),(51,83,1,0,0,0,'asdfsad','fsadf',0,0,0,0),(52,84,1,0,0,1,'asdfsad','asdfsadf',0,0,0,0),(53,85,1,0,0,0,'adsfsda','sadfsadfsadf',0,0,0,0),(54,86,1,0,0,0,'adsfasd','sdafsadf',0,0,0,0),(55,87,1,0,0,0,'a','asdfsadf',0,0,0,0),(56,88,1,0,0,1,'asdfasdf','asdfsadf',0,0,0,0),(57,89,1,0,1,0,'dfasdf','dafasdf',0,0,0,0),(58,90,1,1,0,0,'sadfsadf','adsfsadf',0,0,0,0),(59,91,0,0,1,0,'asdfsadf','asdfasdf',1,0,0,0);
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
  `first_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `human_resources`
--

LOCK TABLES `human_resources` WRITE;
/*!40000 ALTER TABLE `human_resources` DISABLE KEYS */;
INSERT INTO `human_resources` VALUES (1,'Sarha','Goco','sarha@gmail.com','$2a$10$xYGMMOnXI3OQ7dRe/BXPLO31H5pwME6nwFa1iKEc3OZsg5AQPqEqy',NULL,'https://res.cloudinary.com/dclud1dt9/image/upload/v1749038965/human_resources_profiles/buyjbdk6cujn326zgqan.jpg');
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
  `first_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nurses`
--

LOCK TABLES `nurses` WRITE;
/*!40000 ALTER TABLE `nurses` DISABLE KEYS */;
INSERT INTO `nurses` VALUES (2,'Sarah','Cruz','sarah.cruz@hospital.com','$2a$10$VvJ/a3rsHgS6klyyWo3nLuBIN5L0QigvCKiScGwwdNWegJmPVkbW.',NULL,'https://res.cloudinary.com/dclud1dt9/image/upload/v1749037453/nurses_profiles/jfrzao5riloxvnljqxar.jpg');
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
-- Table structure for table `security_guards`
--

DROP TABLE IF EXISTS `security_guards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `security_guards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `security_guards`
--

LOCK TABLES `security_guards` WRITE;
/*!40000 ALTER TABLE `security_guards` DISABLE KEYS */;
INSERT INTO `security_guards` VALUES (1,'Jiro Luis','Manalo','jiro@gmail.com','$2a$10$hPNSO0fptp7Aj2teqbAJZO1QsnC8AqAZ98kS3kFN0G4gNOVaFBNS2',NULL,'https://res.cloudinary.com/dclud1dt9/image/upload/v1750629733/security_guards_profiles/hhwclmsvjdyk3v8b8oph.jpg'),(2,'Ha','Ah','testing@gmail.com','$2b$10$YvN0Ctp9RLyto6260tcolOZcEc87abp3gY51i/LmM3QCL1WYXksNG',NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `time_slots`
--

LOCK TABLES `time_slots` WRITE;
/*!40000 ALTER TABLE `time_slots` DISABLE KEYS */;
INSERT INTO `time_slots` VALUES (3,1,'09:01:00','10:01:00'),(4,1,'10:00:00','11:00:00'),(5,1,'13:00:00','14:00:00'),(6,1,'11:20:00','12:25:00'),(7,1,'14:23:00','15:26:00');
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
  `first_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otp` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=157 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visitors`
--

LOCK TABLES `visitors` WRITE;
/*!40000 ALTER TABLE `visitors` DISABLE KEYS */;
INSERT INTO `visitors` VALUES (1,'john.doe@example.com','password123','John','Doe','09171234567','123 Main St, Quezon City',NULL,NULL),(2,'jasper1@example.com','password123','Jasper','Velasco','09281234567','456 Elm St, Makati',NULL,NULL),(3,'alexis2@example.com','$2a$10$ZTp4aO3GOjoW0b9yI1gRQOyEiUU5vjpRpYewwKn83j5iUV7Shfa0y','Alexiss','Corporal','09301234567','789 Pine St, Taguig',NULL,'https://res.cloudinary.com/dclud1dt9/image/upload/v1750867003/visitors_profiles/hhnsbmqiukghfi0toixh.jpg'),(4,'jiro3@example.com','password123','Jiro Luis','Manalo','09421234567','101 Maple St, Pasig',NULL,NULL),(5,'kimberly4@example.com','password123','Kimberly','Caguite','09531234567','202 Oak St, Mandaluyong',NULL,NULL),(6,'sarha5@example.com','password123','Sarha','Goco','09641234567','303 Birch St, Paranaque',NULL,NULL),(7,'alyssa6@example.com','password123','Alyssa','Urrera','09751234567','404 Cedar St, Makati',NULL,NULL),(8,'jasper7@example.com','password123','Jasper','Velasco','09861234567','505 Pine St, Quezon City',NULL,NULL),(9,'alexis8@example.com','password123','Alexis','Corporal','09971234567','606 Oak St, Taguig',NULL,NULL),(10,'jiro9@example.com','password123','Jiro Luis','Manalo','09181234567','707 Elm St, Pasig',NULL,NULL),(11,'kimberly10@example.com','password123','Kimberly','Caguite','09291234567','808 Birch St, Mandaluyong',NULL,NULL),(12,'sarha11@example.com','password123','Sarha','Goco','09301234567','909 Maple St, Paranaque',NULL,NULL),(13,'alyssa12@example.com','password123','Alyssa','Urrera','09411234567','101 Cedar St, Makati',NULL,NULL),(14,'jasper13@example.com','password123','Jasper','Velasco','09521234567','202 Pine St, Quezon City',NULL,NULL),(15,'alexis14@example.com','password123','Alexis','Corporal','09631234567','303 Oak St, Taguig',NULL,NULL),(16,'jiro15@example.com','password123','Jiro Luis','Manalo','09741234567','404 Elm St, Pasig',NULL,NULL),(17,'kimberly16@example.com','password123','Kimberly','Caguite','09851234567','505 Birch St, Mandaluyong',NULL,NULL),(18,'sarha17@example.com','password123','Sarha','Goco','09961234567','606 Maple St, Paranaque',NULL,NULL),(19,'alyssa18@example.com','password123','Alyssa','Urrera','09171234567','707 Cedar St, Makati',NULL,NULL),(20,'jasper19@example.com','password123','Jasper','Velasco','09281234567','808 Pine St, Quezon City',NULL,NULL),(21,'alexis20@example.com','password123','Alexis','Corporal','09301234567','909 Oak St, Taguig',NULL,NULL),(60,'test.ing}@walkin.local','','Test','Ing','','',NULL,NULL),(61,'hello.wora@walkin.local','','Hello','Wora','','',NULL,NULL),(62,'alexis.corporal@walkin.local','','Alexis','Corporal','','',NULL,NULL),(63,'kim.gerald@walkin.local','','Kim','Gerald','','',NULL,NULL),(64,'louven.alinea@walkin.local','','Louven','Alinea','','',NULL,NULL),(65,'arkyn .corporal@walkin.local','','Arkyn ','Corporal','','',NULL,NULL),(66,'alrich.corporal@walkin.local','','Alrich','Corporal','','',NULL,NULL),(67,'ka.muning@walkin.local','','Ka','Muning','','',NULL,NULL),(76,'how.to@walkin.local','','How','To','','',NULL,NULL),(77,'test.aa@walkin.local','','test','aa','','',NULL,NULL),(78,'to.how@walkin.local','','To','How','','',NULL,NULL),(79,'ha.ah@walkin.local','','Ha','aH','','',NULL,NULL),(80,'baka.akab@walkin.local','','Baka','akab','','',NULL,NULL),(81,'aabb.bbbbb@walkin.local','','aabb','bbbbb','','',NULL,NULL),(82,'asdfsd.dsdsfsdf@walkin.local','','asdfsd','dsdsfsdf','','',NULL,NULL),(83,'sdfsdf.sdfsdf@walkin.local','','sdfsdf','sdfsdf','','',NULL,NULL),(84,'tesss.ingggg@walkin.local','','tesss','ingggg','','',NULL,NULL),(85,'sdfsdf.dsfsdf@walkin.local','','sdfsdf','dsfsdf','','',NULL,NULL),(86,'sdfsdf.dsf@walkin.local','','sdfsdf','dsf','','',NULL,NULL),(87,'aa.aa@walkin.local','','aa','aa','','',NULL,NULL),(88,'aasdfsadf.dsfsadf@walkin.local','','aasdfsadf','dsfsadf','','',NULL,NULL),(89,'adsfsdf.sdfsadf@walkin.local','','adsfsdf','sdfsadf','','',NULL,NULL),(90,'sdfadsfas.dfasdfasd@walkin.local','','sdfadsfas','dfasdfasd','','',NULL,NULL),(91,'asdfaad.adsfadafsdf@walkin.local','','asdfaad','adsfadafsdf','','',NULL,NULL),(92,'asdfasd.fsadfasd@walkin.local','','asdfasd','fsadfasd','','',NULL,NULL),(93,'adfsadf.sdfsadfasdf@walkin.local','','adfsadf','sdfsadfasdf','','',NULL,NULL),(94,'asdfasdf.asdfasdf@walkin.local','','asdfasdf','asdfasdf','','',NULL,NULL),(95,'adsfasd.fasdfasdf@walkin.local','','adsfasd','fasdfasdf','','',NULL,NULL),(96,'asdfasd.fsdafasd@walkin.local','','asdfasd','fsdafasd','','',NULL,NULL),(97,'asdfads.f@walkin.local','','asdfads','f','','',NULL,NULL),(98,'adsfasd.fsadfsadf@walkin.local','','adsfasd','fsadfsadf','','',NULL,NULL),(99,'asdfsda.fasdf@walkin.local','','asdfsda','fasdf','','',NULL,NULL),(100,'asdfa.dsfasdf@walkin.local','','asdfa','dsfasdf','','',NULL,NULL),(101,'dafasdf.asdfsadf@walkin.local','','dafasdf','asdfsadf','','',NULL,NULL),(102,'dsafsdfa.sdfa@walkin.local','','dsafsdfa','sdfa','','',NULL,NULL),(103,'sdfas.dfasdf@walkin.local','','sdfas','dfasdf','','',NULL,NULL),(104,'sdfsadf.dsfasdf@walkin.local','','sdfsadf','dsfasdf','','',NULL,NULL),(105,'sdfsdafsad.sdfsadfdsaf@walkin.local','','sdfsdafsad','sdfsadfdsaf','','',NULL,NULL),(106,'asdfsd.fsdf@walkin.local','','asdfsd','fsdf','','',NULL,NULL),(107,'asdfsadf.sdfasdf@walkin.local','','asdfsadf','sdfasdf','','',NULL,NULL),(108,'sdfsda.fdsafsad@walkin.local','','sdfsda','fdsafsad','','',NULL,NULL),(109,'sdfsdf.sdfsadf@walkin.local','','sdfsdf','sdfsadf','','',NULL,NULL),(110,'sdfsdf.sadfsadf@walkin.local','','sdfsdf','sadfsadf','','',NULL,NULL),(111,'asdfasdf.asdaaa@walkin.local','','asdfasdf','asdaaa','','',NULL,NULL),(112,'adsf.sadfasdf@walkin.local','','adsf','sadfasdf','','',NULL,NULL),(113,'asd.aa@walkin.local','','asd','aa','','',NULL,NULL),(114,'sadfa.dfasdfsa@walkin.local','','sadfa','dfasdfsa','','',NULL,NULL),(115,'dfsadf.dfasdfsadf@walkin.local','','dfsadf','dfasdfsadf','','',NULL,NULL),(116,'sdfasdf.sadfsdf@walkin.local','','sdfasdf','sadfsdf','','',NULL,NULL),(117,'asdfsad.fsadf@walkin.local','','asdfsad','fsadf','','',NULL,NULL),(118,'jiro.manalo@walkin.local','','Jiro','Manalo','','',NULL,NULL),(119,'sdfasdf.asdfsadf@walkin.local','','sdfasdf','asdfsadf','','',NULL,NULL),(120,'aa.bbb@walkin.local','','Aa','BBB','','',NULL,NULL),(121,'aaa.aa@walkin.local','','aaa','aa','','',NULL,NULL),(122,'aa.cca@walkin.local','','aa','cca','','',NULL,NULL),(123,'aa.bb@walkin.local','','AA','bb','','',NULL,NULL),(124,'aaca.adsfsdafasdf@walkin.local','','aaca','adsfsdafasdf','','',NULL,NULL),(125,'asdfasd.faaa@walkin.local','','asdfasd','faaa','','',NULL,NULL),(126,'adfasd.fsad@walkin.local','','adfasd','fsad','','',NULL,NULL),(127,'adsfds.fsdfasda@walkin.local','','adsfds','fsdfasda','','',NULL,NULL),(128,'asd.fasdfasd@walkin.local','','asd','fasdfasd','','',NULL,NULL),(132,'hop.joe@walkin.local','','Hop','Joe','','',NULL,NULL),(133,'ad.da@walkin.local','','ad','da','','',NULL,NULL),(134,'al.ex@walkin.local','','Al','ex','','',NULL,NULL),(135,'ads.aa@walkin.local','','ads','aa','','',NULL,NULL),(136,'aaa.bbbasdf@walkin.local','','aaa','bbbasdf','','',NULL,NULL),(137,'adfasd.f@walkin.local','','adfasd','f','','',NULL,NULL),(138,'asdfsad.fsdf@walkin.local','','asdfsad','fsdf','','',NULL,NULL),(139,'asdfa.sdfasdf@walkin.local','','asdfa','sdfasdf','','',NULL,NULL),(140,'asdfasdfsadfsdafsd.dsfasdfsd@walkin.local','','asdfasdfsadfsdafsd','dsfasdfsd','','',NULL,NULL),(141,'sarha.g@walkin.local','','Sarha','G','','',NULL,NULL),(142,'adsfsadf.sdafsadf@walkin.local','','adsfsadf','sdafsadf','','',NULL,NULL),(143,'adsfasd.asdfsadf@walkin.local','','adsfasd','asdfsadf','','',NULL,NULL),(144,'adsfasd.asdfsadfaa@walkin.local','','adsfasd','asdfsadfaa','','',NULL,NULL),(145,'sadasd.sadfasdf@walkin.local','','sadasd','sadfasdf','','',NULL,NULL),(146,'asdfs.addsafasd@walkin.local','','asdfs','addsafasd','','',NULL,NULL),(147,'ads.a@walkin.local','','ads','a','','',NULL,NULL),(148,'adsfasdf.sdfasdf@walkin.local','','adsfasdf','sdfasdf','','',NULL,NULL),(149,'asdfsa.asdf@walkin.local','','asdfsa','asdf','','',NULL,NULL),(150,'dfsadf.asdfsa@walkin.local','','dfsadf','asdfsa','','',NULL,NULL),(151,'adsfasdf.asdf@walkin.local','','adsfasdf','asdf','','',NULL,NULL),(152,'adfasdf.asdfsa@walkin.local','','adfasdf','asdfsa','','',NULL,NULL),(153,'aasdfsa.fasdf@walkin.local','','aasdfsa','fasdf','','',NULL,NULL),(154,'asdf.dsafasdfsdaf@walkin.local','','asdf','dsafasdfsdaf','','',NULL,NULL),(155,'sdafsadf.dsfsad@walkin.local','','sdafsadf','dsfsad','','',NULL,NULL),(156,'asdfsadfasdf.asdfasdfsad@walkin.local','','asdfsadfasdf','asdfasdfsad','','',NULL,NULL);
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
  `purpose_id` int DEFAULT NULL,
  `approval_status_id` int DEFAULT '2',
  `time_slot_id` int DEFAULT NULL,
  `valid_id_type_id` int DEFAULT NULL,
  `status_id` int DEFAULT '1',
  `comment_id` int DEFAULT NULL,
  `device_type` text,
  `device_brand` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `visitor_id` (`visitor_id`),
  KEY `visited_employee_id` (`visited_employee_id`),
  KEY `fk_purpose` (`purpose_id`),
  KEY `fk_approval` (`approval_status_id`),
  KEY `fk_time_slot` (`time_slot_id`),
  KEY `fk_valid_id_type` (`valid_id_type_id`),
  KEY `fk_visit_status` (`status_id`),
  KEY `fk_comment` (`comment_id`),
  CONSTRAINT `fk_approval` FOREIGN KEY (`approval_status_id`) REFERENCES `approval_status` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_comment` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_purpose` FOREIGN KEY (`purpose_id`) REFERENCES `purposes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_time_slot` FOREIGN KEY (`time_slot_id`) REFERENCES `time_slots` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_valid_id_type` FOREIGN KEY (`valid_id_type_id`) REFERENCES `valid_id_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_visit_status` FOREIGN KEY (`status_id`) REFERENCES `visit_statuses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `visits_ibfk_2` FOREIGN KEY (`visited_employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=193 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visits`
--

LOCK TABLES `visits` WRITE;
/*!40000 ALTER TABLE `visits` DISABLE KEYS */;
INSERT INTO `visits` VALUES (1,1,2,'2025-05-10','15:28:10','15:28:12','8:00 AM - 9:00 AM',1,1,NULL,3,1,NULL,NULL,NULL),(2,2,3,'2025-05-10','17:59:19','17:59:20','11:00 AM - 12:00 PM',2,1,NULL,6,1,NULL,NULL,NULL),(3,3,4,'2025-05-11','15:18:47',NULL,'2:00 PM - 3:00 PM',3,1,NULL,NULL,1,NULL,NULL,NULL),(4,4,5,'2025-05-11','15:19:37',NULL,'5:00 PM - 6:00 PM',4,1,NULL,NULL,1,NULL,NULL,NULL),(5,5,6,'2025-05-11','15:23:24',NULL,'8:00 AM - 9:00 AM',5,1,NULL,3,1,NULL,NULL,NULL),(6,6,7,'2025-05-12','15:09:12',NULL,'11:00 AM - 12:00 PM',1,1,NULL,NULL,1,NULL,NULL,NULL),(7,7,8,'2025-05-12','18:48:14','10:14:18','2:00 PM - 3:00 PM',2,1,NULL,6,2,NULL,NULL,NULL),(8,8,9,'2025-05-12','15:13:28',NULL,'5:00 PM - 6:00 PM',3,1,NULL,NULL,1,NULL,NULL,NULL),(9,9,10,'2025-05-12','12:27:45','12:27:47','8:00 AM - 9:00 AM',4,1,NULL,NULL,1,NULL,NULL,NULL),(10,10,11,'2025-05-12','18:25:10','18:32:56','11:00 AM - 12:00 PM',5,1,NULL,NULL,1,NULL,NULL,NULL),(11,11,12,'2025-05-12',NULL,NULL,'2:00 PM - 3:00 PM',1,3,NULL,NULL,1,NULL,NULL,NULL),(12,12,13,'2025-05-12',NULL,NULL,'5:00 PM - 6:00 PM',2,4,NULL,NULL,1,NULL,NULL,NULL),(13,13,14,'2025-05-12',NULL,NULL,'8:00 AM - 9:00 AM',3,3,NULL,NULL,1,NULL,NULL,NULL),(14,14,15,'2025-05-12','18:26:01','18:32:51','11:00 AM - 12:00 PM',4,1,NULL,NULL,1,NULL,NULL,NULL),(15,15,16,'2025-05-12','18:30:14','18:32:53','2:00 PM - 3:00 PM',5,1,NULL,NULL,1,NULL,NULL,NULL),(16,26,30,'2025-05-12',NULL,NULL,'5:00 PM - 6:00 PM',1,2,NULL,NULL,1,NULL,NULL,NULL),(17,27,31,'2025-05-13',NULL,NULL,'8:00 AM - 9:00 AM',2,2,NULL,NULL,1,NULL,NULL,NULL),(20,37,1,'2025-05-13',NULL,NULL,'7:00 PM - 8:00 PM',5,4,NULL,NULL,1,NULL,NULL,NULL),(21,38,2,'2025-05-13',NULL,NULL,'11:00 AM - 12:00 PM',3,1,NULL,NULL,1,NULL,NULL,NULL),(22,39,6,'2025-05-13',NULL,NULL,'7:00 PM - 8:00 PM',3,2,NULL,NULL,1,NULL,NULL,NULL),(47,64,1,'2025-05-19',NULL,NULL,'9:01 AM - 10:01 AM',3,4,NULL,NULL,1,NULL,NULL,NULL),(48,65,1,'2025-05-19','18:14:28','10:14:08','9:01 AM - 10:01 AM',1,1,NULL,6,2,NULL,NULL,NULL),(49,66,1,'2025-05-19',NULL,NULL,'9:01 AM - 10:01 AM',3,4,NULL,NULL,1,NULL,NULL,NULL),(50,67,1,'2025-05-19','20:23:41','20:23:44','9:01 AM - 10:01 AM',5,1,NULL,6,1,NULL,NULL,NULL),(51,3,1,'2025-05-19','23:12:18','23:12:19','9:01 AM - 10:01 AM',1,1,NULL,6,1,NULL,NULL,NULL),(52,3,1,'2025-05-19',NULL,NULL,'9:01 AM - 10:01 AM',5,4,NULL,NULL,1,NULL,NULL,NULL),(53,3,1,'2025-05-19',NULL,NULL,'9:01 AM - 10:01 AM',1,3,NULL,NULL,1,NULL,NULL,NULL),(54,3,1,'2025-05-19','00:14:49','00:14:50','9:01 AM - 10:01 AM',4,1,NULL,2,1,NULL,NULL,NULL),(55,76,1,'2025-05-20','10:25:47','10:26:16','9:01 AM - 10:01 AM',3,1,NULL,3,2,NULL,NULL,NULL),(56,77,1,'2025-05-20','15:06:16','15:06:18','9:01 AM - 10:01 AM',4,1,NULL,3,2,NULL,NULL,NULL),(57,78,1,'2025-05-20',NULL,NULL,'9:01 AM - 10:01 AM',3,4,NULL,NULL,1,NULL,NULL,NULL),(58,79,1,'2025-05-20',NULL,NULL,'10:00 AM - 11:00 AM',3,4,NULL,NULL,1,NULL,NULL,NULL),(59,80,1,'2025-05-20',NULL,NULL,'9:01 AM - 10:01 AM',2,3,NULL,NULL,1,NULL,NULL,NULL),(60,81,1,'2025-05-20',NULL,NULL,'10:00 AM - 11:00 AM',3,3,NULL,NULL,1,NULL,NULL,NULL),(61,82,1,'2025-05-20',NULL,NULL,'9:01 AM - 10:01 AM',3,4,NULL,NULL,1,NULL,NULL,NULL),(62,3,1,'2025-05-20',NULL,NULL,'10:00 AM - 11:00 AM',4,3,NULL,NULL,1,NULL,NULL,NULL),(63,3,1,'2025-05-20',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1,NULL,NULL,NULL),(64,3,1,'2025-05-20',NULL,NULL,'10:00 AM - 11:00 AM',2,4,NULL,NULL,1,NULL,NULL,NULL),(65,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',2,4,NULL,NULL,1,NULL,NULL,NULL),(66,3,1,'2025-05-21',NULL,NULL,'10:00 AM - 11:00 AM',2,4,NULL,NULL,1,NULL,NULL,NULL),(67,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,3,NULL,NULL,1,NULL,NULL,NULL),(68,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,3,NULL,NULL,1,NULL,NULL,NULL),(69,3,1,'2025-05-21',NULL,NULL,'10:00 AM - 11:00 AM',2,3,NULL,NULL,1,NULL,NULL,NULL),(70,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',2,4,NULL,NULL,1,NULL,NULL,NULL),(71,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1,NULL,NULL,NULL),(72,83,1,'2025-05-21','15:28:33','15:28:35','9:01 AM - 10:01 AM',3,1,NULL,6,2,NULL,NULL,NULL),(73,3,1,'2025-05-21','15:34:36','15:34:45','9:01 AM - 10:01 AM',2,1,NULL,6,2,NULL,NULL,NULL),(74,84,1,'2025-05-21',NULL,NULL,'10:00 AM - 11:00 AM',4,4,NULL,NULL,1,NULL,NULL,NULL),(75,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',2,4,NULL,NULL,1,NULL,NULL,NULL),(76,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1,NULL,NULL,NULL),(77,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1,NULL,NULL,NULL),(78,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',2,4,NULL,NULL,1,NULL,NULL,NULL),(79,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',2,4,NULL,NULL,1,NULL,NULL,NULL),(80,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',2,4,NULL,NULL,1,NULL,NULL,NULL),(81,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1,NULL,NULL,NULL),(82,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',2,4,NULL,NULL,1,NULL,NULL,NULL),(83,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1,NULL,NULL,NULL),(84,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',2,4,NULL,NULL,1,NULL,NULL,NULL),(85,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1,NULL,NULL,NULL),(86,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1,NULL,NULL,NULL),(87,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1,NULL,NULL,NULL),(88,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,3,NULL,NULL,1,NULL,NULL,NULL),(89,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1,NULL,NULL,NULL),(90,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1,NULL,NULL,NULL),(91,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',2,4,NULL,NULL,1,NULL,NULL,NULL),(92,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',2,4,NULL,NULL,1,NULL,NULL,NULL),(93,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',2,4,NULL,NULL,1,NULL,NULL,NULL),(94,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1,NULL,NULL,NULL),(95,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',4,4,NULL,NULL,1,NULL,NULL,NULL),(96,3,1,'2025-05-21',NULL,NULL,'9:01 AM - 10:01 AM',5,3,3,NULL,1,NULL,NULL,NULL),(97,85,1,'2025-05-22',NULL,NULL,'10:00 AM - 11:00 AM',3,4,NULL,NULL,1,NULL,NULL,NULL),(98,86,1,'2025-05-22',NULL,NULL,'10:00 AM - 11:00 AM',3,4,NULL,NULL,1,NULL,NULL,NULL),(99,3,1,'2025-06-01',NULL,NULL,'10:00 AM - 11:00 AM',4,4,NULL,NULL,1,NULL,NULL,NULL),(100,87,1,'2025-06-01','12:07:23','12:07:26','10:00 AM - 11:00 AM',2,1,NULL,6,2,NULL,NULL,NULL),(101,87,1,'2025-06-02','23:10:23','23:10:23','10:00 AM - 11:00 AM',2,1,NULL,1,2,NULL,NULL,NULL),(102,88,1,'2025-06-02','23:11:06','23:11:07','10:00 AM - 11:00 AM',4,1,NULL,2,2,NULL,NULL,NULL),(103,89,1,'2025-06-02','23:14:06','23:14:07','10:00 AM - 11:00 AM',2,1,NULL,4,2,NULL,NULL,NULL),(104,90,1,'2025-06-02','23:18:01','23:18:28','10:00 AM - 11:00 AM',3,1,NULL,1,2,NULL,NULL,NULL),(105,91,1,'2025-06-02','23:19:12','23:19:20','10:00 AM - 11:00 AM',3,1,NULL,2,2,NULL,NULL,NULL),(106,92,1,'2025-06-03','09:02:46','09:02:51','10:00 AM - 11:00 AM',3,1,NULL,2,2,NULL,NULL,NULL),(107,93,1,'2025-06-03','09:08:52','09:08:56','10:00 AM - 11:00 AM',2,1,NULL,1,2,NULL,NULL,NULL),(108,94,1,'2025-06-03','09:15:43','09:15:44','10:00 AM - 11:00 AM',2,1,NULL,1,2,NULL,NULL,NULL),(109,95,1,'2025-06-03','09:39:12','09:39:16','10:00 AM - 11:00 AM',3,1,NULL,1,2,NULL,NULL,NULL),(110,96,1,'2025-06-03','09:41:31','09:41:38','10:00 AM - 11:00 AM',3,1,NULL,1,2,NULL,NULL,NULL),(111,97,1,'2025-06-03','09:42:24','09:42:28','10:00 AM - 11:00 AM',2,1,NULL,1,2,NULL,NULL,NULL),(112,98,1,'2025-06-03',NULL,NULL,'10:00 AM - 11:00 AM',3,3,NULL,NULL,1,NULL,NULL,NULL),(113,99,1,'2025-06-03',NULL,NULL,'10:00 AM - 11:00 AM',3,4,NULL,NULL,1,NULL,NULL,NULL),(114,100,1,'2025-06-03','10:07:26','10:07:28','10:00 AM - 11:00 AM',2,1,NULL,2,2,NULL,NULL,NULL),(115,101,1,'2025-06-03','10:28:38','10:29:17','10:00 AM - 11:00 AM',3,1,NULL,2,2,NULL,NULL,NULL),(116,102,1,'2025-06-03','10:30:00','10:51:13','10:00 AM - 11:00 AM',3,1,NULL,1,2,NULL,NULL,NULL),(117,103,1,'2025-06-03','11:04:59','11:06:17','10:00 AM - 11:00 AM',3,1,NULL,1,2,NULL,NULL,NULL),(118,104,1,'2025-06-03','11:18:34','11:18:39','10:00 AM - 11:00 AM',3,1,NULL,1,2,NULL,NULL,NULL),(119,105,1,'2025-06-03','13:05:40','13:05:42','10:00 AM - 11:00 AM',3,1,NULL,1,2,NULL,NULL,NULL),(120,3,1,'2025-06-03','17:36:51','17:36:53','10:00 AM - 11:00 AM',2,1,NULL,2,2,NULL,NULL,NULL),(121,3,1,'2025-06-03','17:48:59','17:49:00','10:00 AM - 11:00 AM',2,1,NULL,1,2,NULL,NULL,NULL),(122,3,1,'2025-06-03','17:55:01','17:55:02','10:00 AM - 11:00 AM',2,1,NULL,1,2,NULL,NULL,NULL),(123,106,1,'2025-06-03',NULL,NULL,'10:00 AM - 11:00 AM',3,3,NULL,NULL,1,NULL,NULL,NULL),(124,107,1,'2025-06-03',NULL,NULL,'10:00 AM - 11:00 AM',2,3,NULL,NULL,1,NULL,NULL,NULL),(125,108,1,'2025-06-03','19:07:42','19:07:44','10:00 AM - 11:00 AM',3,1,NULL,2,2,NULL,NULL,NULL),(126,109,1,'2025-06-03','20:43:59','20:44:00','10:00 AM - 11:00 AM',1,1,NULL,1,2,NULL,NULL,NULL),(127,110,1,'2025-06-03',NULL,NULL,'10:00 AM - 11:00 AM',3,3,NULL,NULL,1,NULL,NULL,NULL),(128,111,1,'2025-06-03',NULL,NULL,'10:00 AM - 11:00 AM',3,3,NULL,NULL,1,NULL,NULL,NULL),(129,3,1,'2025-06-03',NULL,NULL,'10:00 AM - 11:00 AM',4,3,NULL,NULL,1,1,NULL,NULL),(130,112,1,'2025-06-03',NULL,NULL,'10:00 AM - 11:00 AM',3,4,NULL,NULL,1,NULL,NULL,NULL),(131,113,1,'2025-06-03','20:55:44','20:56:02','10:00 AM - 11:00 AM',3,1,NULL,2,2,NULL,NULL,NULL),(132,114,1,'2025-06-03',NULL,NULL,'10:00 AM - 11:00 AM',4,3,NULL,NULL,1,NULL,NULL,NULL),(133,115,1,'2025-06-04',NULL,NULL,'10:00 AM - 11:00 AM',3,4,NULL,NULL,1,NULL,NULL,NULL),(134,116,1,'2025-06-12',NULL,NULL,'10:00 AM - 11:00 AM',3,3,NULL,NULL,1,NULL,NULL,NULL),(135,3,1,'2025-06-19','05:55:25','05:55:26','1:00 PM - 2:00 PM',2,1,NULL,2,2,2,NULL,NULL),(136,3,1,'2025-06-19','06:41:02','06:41:05','1:00 PM - 2:00 PM',4,1,NULL,1,2,NULL,NULL,NULL),(137,3,1,'2025-06-19','06:42:38','06:42:46','1:00 PM - 2:00 PM',4,1,NULL,1,2,NULL,NULL,NULL),(138,117,1,'2025-06-20',NULL,NULL,'1:00 PM - 2:00 PM',3,3,NULL,NULL,1,NULL,NULL,NULL),(139,118,1,'2025-06-20',NULL,NULL,'10:00 AM - 11:00 AM',3,4,NULL,NULL,1,NULL,NULL,NULL),(140,119,1,'2025-06-20','14:49:29','14:49:32','1:00 PM - 2:00 PM',3,1,NULL,6,2,NULL,NULL,NULL),(141,3,1,'2025-06-20',NULL,NULL,'1:00 PM - 2:00 PM',4,1,5,NULL,1,NULL,NULL,NULL),(142,121,1,'2025-06-22',NULL,NULL,'10:00 AM - 11:00 AM',3,3,NULL,NULL,1,NULL,'Laptop, Tablet','aadsf'),(143,122,1,'2025-06-22',NULL,NULL,'10:00 AM - 11:00 AM',4,3,NULL,NULL,1,NULL,'Laptop','aa'),(145,124,1,'2025-06-24',NULL,NULL,'10:00 AM - 11:00 AM',4,4,NULL,NULL,1,NULL,'Laptop','asdfsdaf'),(146,125,1,'2025-06-24',NULL,NULL,'10:00 AM - 11:00 AM',3,3,NULL,NULL,1,NULL,'Laptop','asdfsadf'),(149,128,1,'2025-06-24',NULL,NULL,'10:00 AM - 11:00 AM',2,4,NULL,NULL,1,NULL,NULL,NULL),(150,129,1,'2025-06-24',NULL,NULL,'10:00 AM - 11:00 AM',4,4,NULL,NULL,1,NULL,NULL,NULL),(151,130,1,'2025-06-24',NULL,NULL,'10:00 AM - 11:00 AM',3,3,NULL,NULL,1,NULL,NULL,NULL),(155,134,1,'2025-06-25','22:19:04','22:19:05','10:00 AM - 11:00 AM',4,1,NULL,2,2,NULL,'Laptop','ad'),(156,123,1,'2025-06-25','22:21:55','22:21:56','10:00 AM - 11:00 AM',2,6,NULL,2,2,NULL,'Phone, Laptop','asdfsadf'),(157,135,1,'2025-06-25','22:27:55','22:27:57','10:00 AM - 11:00 AM',1,6,NULL,2,2,NULL,'Laptop','a'),(158,136,1,'2025-06-25','22:37:18','22:37:22','10:00 AM - 11:00 AM',2,6,NULL,2,2,NULL,'Laptop','adsfasdf'),(159,137,1,'2025-06-25','22:37:47','22:37:48','10:00 AM - 11:00 AM',2,1,NULL,1,2,NULL,'Laptop','adsfasd'),(160,138,1,'2025-06-25','22:39:13','22:39:14','10:00 AM - 11:00 AM',4,6,NULL,3,2,NULL,'Laptop','asdfsadf'),(161,139,1,'2025-06-25','22:47:36','22:47:40','10:00 AM - 11:00 AM',5,6,NULL,3,2,NULL,'Laptop','asdfsadf'),(163,3,1,'2025-06-25',NULL,NULL,'10:00 AM - 11:00 AM',2,3,NULL,NULL,1,NULL,'Laptop','ssd'),(164,3,1,'2025-06-25','23:50:13','23:50:14','10:00 AM - 11:00 AM',2,6,NULL,2,2,NULL,'Laptop','assa'),(165,3,1,'2025-06-25','00:05:08','00:05:09','10:00 AM - 11:00 AM',4,1,NULL,2,2,NULL,'Tablet','sdff'),(166,3,1,'2025-06-25','00:20:46','00:20:47','10:00 AM - 11:00 AM',1,1,NULL,4,2,NULL,'Laptop','se'),(167,3,1,'2025-06-25','00:36:35','00:36:36','10:00 AM - 11:00 AM',4,6,NULL,2,2,NULL,'Tablet','ddr'),(168,3,1,'2025-06-25','00:46:09','00:46:11','10:00 AM - 11:00 AM',4,6,NULL,2,2,NULL,'Tablet','ddd'),(169,3,1,'2025-06-25','00:58:15','00:58:17','10:00 AM - 11:00 AM',4,6,NULL,1,2,NULL,'Laptop, Tablet','ddft'),(170,3,1,'2025-06-25','01:01:57','01:01:58','10:00 AM - 11:00 AM',4,6,NULL,2,2,NULL,'Tablet','srtt'),(171,3,1,'2025-06-25','10:15:52','10:15:53','10:00 AM - 11:00 AM',4,6,NULL,2,2,NULL,'Laptop, Tablet','sdf'),(172,140,1,'2025-06-26','15:40:36','15:40:37','11:20 AM - 12:25 PM',2,6,NULL,2,2,NULL,'Laptop','sadfsdfsdf'),(173,141,1,'2025-06-26','22:47:43','22:47:44','11:20 AM - 12:25 PM',1,6,NULL,1,2,NULL,'Laptop','Lenovo'),(174,142,1,'2025-06-26','23:22:04','23:22:05','11:20 AM - 12:25 PM',3,6,NULL,2,2,NULL,'Laptop','adsfasdf'),(175,143,1,'2025-06-26',NULL,NULL,'10:00 AM - 11:00 AM',3,3,NULL,NULL,1,NULL,'Laptop','asdfasdf'),(176,143,1,'2025-06-26',NULL,NULL,'10:00 AM - 11:00 AM',3,3,NULL,NULL,1,NULL,'Laptop','asdfasdf'),(177,143,1,'2025-06-26',NULL,NULL,'10:00 AM - 11:00 AM',3,3,NULL,NULL,1,NULL,'Laptop','asdfasdf'),(178,143,1,'2025-06-26',NULL,NULL,'10:00 AM - 11:00 AM',3,3,NULL,NULL,1,NULL,'Laptop, Tablet','asdfasdf'),(179,144,1,'2025-06-26',NULL,NULL,'10:00 AM - 11:00 AM',3,3,NULL,NULL,1,NULL,'Laptop, Tablet','asdfasdf'),(180,144,1,'2025-06-26',NULL,NULL,'10:00 AM - 11:00 AM',3,3,NULL,NULL,1,NULL,'Laptop, Tablet','asdfasdf'),(181,145,1,'2025-06-26',NULL,NULL,'10:00 AM - 11:00 AM',3,3,NULL,NULL,1,NULL,'Laptop','aaa'),(182,146,1,'2025-06-26',NULL,NULL,'11:20 AM - 12:25 PM',3,3,NULL,NULL,1,NULL,'Laptop','asdfasf'),(183,147,1,'2025-06-26',NULL,NULL,'11:20 AM - 12:25 PM',2,3,NULL,NULL,1,NULL,'Laptop','adf'),(184,148,1,'2025-06-26',NULL,NULL,'10:00 AM - 11:00 AM',2,3,NULL,NULL,1,NULL,'Tablet','asdfasdf'),(185,149,1,'2025-06-26','01:20:38','01:20:39','10:00 AM - 11:00 AM',3,6,NULL,2,2,NULL,'Tablet','asdfasdf'),(186,150,1,'2025-06-26','02:07:55','02:07:57','10:00 AM - 11:00 AM',3,6,NULL,1,2,NULL,'Laptop','asdfsadf'),(187,151,1,'2025-06-26','02:23:33','02:23:34','10:00 AM - 11:00 AM',3,6,NULL,1,2,NULL,'Laptop','asdfsadf'),(188,152,1,'2025-06-26',NULL,NULL,'10:00 AM - 11:00 AM',3,4,NULL,NULL,1,NULL,'Tablet','asdfasdf'),(189,153,1,'2025-06-28','20:53:38','20:58:51','10:00 AM - 11:00 AM',3,6,NULL,1,2,NULL,'Laptop','adfsadf'),(190,154,1,'2025-06-28','21:00:11','21:00:15','10:00 AM - 11:00 AM',3,6,NULL,1,2,NULL,'Laptop','asdfsadfasdf'),(191,155,1,'2025-06-29','19:24:45','19:24:49','10:00 AM - 11:00 AM',3,3,NULL,1,2,NULL,'Laptop','sadfsafd'),(192,156,1,'2025-06-29','19:25:54','19:25:55','10:00 AM - 11:00 AM',2,4,NULL,4,2,NULL,'Laptop','asdfsadf');
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

-- Dump completed on 2025-07-01  7:30:16
