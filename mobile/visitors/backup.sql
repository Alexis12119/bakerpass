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
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `human_resources`
--

LOCK TABLES `human_resources` WRITE;
/*!40000 ALTER TABLE `human_resources` DISABLE KEYS */;
INSERT INTO `human_resources` VALUES (1,'Sarha','Goco','sarha@gmail.com','Sarha-121');
/*!40000 ALTER TABLE `human_resources` ENABLE KEYS */;
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `security_guards`
--

LOCK TABLES `security_guards` WRITE;
/*!40000 ALTER TABLE `security_guards` DISABLE KEYS */;
INSERT INTO `security_guards` VALUES (1,'Jiro Luis','Manalo','jiro@gmail.com','Jiro-121');
/*!40000 ALTER TABLE `security_guards` ENABLE KEYS */;
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visitors`
--

LOCK TABLES `visitors` WRITE;
/*!40000 ALTER TABLE `visitors` DISABLE KEYS */;
INSERT INTO `visitors` VALUES (1,'john.doe@example.com','password123','John','Doe','09171234567','123 Main St, Quezon City'),(2,'jasper1@example.com','password123','Jasper','Velasco','09281234567','456 Elm St, Makati'),(3,'alexis2@example.com','password123','Alexis','Corporal','09301234567','789 Pine St, Taguig'),(4,'jiro3@example.com','password123','Jiro Luis','Manalo','09421234567','101 Maple St, Pasig'),(5,'kimberly4@example.com','password123','Kimberly','Caguite','09531234567','202 Oak St, Mandaluyong'),(6,'sarha5@example.com','password123','Sarha','Goco','09641234567','303 Birch St, Paranaque'),(7,'alyssa6@example.com','password123','Alyssa','Urrera','09751234567','404 Cedar St, Makati'),(8,'jasper7@example.com','password123','Jasper','Velasco','09861234567','505 Pine St, Quezon City'),(9,'alexis8@example.com','password123','Alexis','Corporal','09971234567','606 Oak St, Taguig'),(10,'jiro9@example.com','password123','Jiro Luis','Manalo','09181234567','707 Elm St, Pasig'),(11,'kimberly10@example.com','password123','Kimberly','Caguite','09291234567','808 Birch St, Mandaluyong'),(12,'sarha11@example.com','password123','Sarha','Goco','09301234567','909 Maple St, Paranaque'),(13,'alyssa12@example.com','password123','Alyssa','Urrera','09411234567','101 Cedar St, Makati'),(14,'jasper13@example.com','password123','Jasper','Velasco','09521234567','202 Pine St, Quezon City'),(15,'alexis14@example.com','password123','Alexis','Corporal','09631234567','303 Oak St, Taguig'),(16,'jiro15@example.com','password123','Jiro Luis','Manalo','09741234567','404 Elm St, Pasig'),(17,'kimberly16@example.com','password123','Kimberly','Caguite','09851234567','505 Birch St, Mandaluyong'),(18,'sarha17@example.com','password123','Sarha','Goco','09961234567','606 Maple St, Paranaque'),(19,'alyssa18@example.com','password123','Alyssa','Urrera','09171234567','707 Cedar St, Makati'),(20,'jasper19@example.com','password123','Jasper','Velasco','09281234567','808 Pine St, Quezon City'),(21,'alexis20@example.com','password123','Alexis','Corporal','09301234567','909 Oak St, Taguig'),(22,'ax.corporak_1747053776268@walkin.local','','Ax','corporak','',''),(23,'test.ing_1747055557716@walkin.local','','Test','Ing','',''),(24,'hello.word_1747056757826@walkin.local','','Hello','Word','',''),(25,'test.ing_1747059665849@walkin.local','','Test','Ing','',''),(26,'test.ing_1747059932233@walkin.local','','Test','Ing','',''),(27,'aaa.bbb_1747060839510@walkin.local','','aaa','bbb','',''),(28,'test.ing_1747061342417@walkin.local','','test','ing','',''),(29,'test.ing_1747061587063@walkin.local','','test','ing','',''),(30,'test.ing_1747062180918@walkin.local','','Test','Ing','',''),(31,'hello.world_1747096255801@walkin.local','','Hello','World','',''),(32,'hi.bye_1747110959988@walkin.local','','Hi','bye','',''),(33,'hi.bye_1747111086319@walkin.local','','Hi','bye','',''),(34,'hi.bye_1747111124675@walkin.local','','Hi','Bye','',''),(35,'hi.bye_1747111253825@walkin.local','','Hi','Bye','',''),(36,'alrich.corporal_1747117599931@walkin.local','','Alrich','Corporal','',''),(37,'alex.corporal_1747117698282@walkin.local','','Alex','Corporal','',''),(38,'test.ing_1747119130542@walkin.local','','Test','Ing','',''),(39,'hype.word_1747132061128@walkin.local','','Hype','Word','',''),(40,'ala.king_1747183004900@walkin.local','','Ala','King','','');
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
  `status` enum('Checked In','Checked Out','Ongoing') NOT NULL DEFAULT 'Checked In',
  `purposeId` int DEFAULT NULL,
  `approval_status_id` int DEFAULT '2',
  PRIMARY KEY (`id`),
  KEY `visitor_id` (`visitor_id`),
  KEY `visited_employee_id` (`visited_employee_id`),
  KEY `fk_purpose` (`purposeId`),
  KEY `fk_approval` (`approval_status_id`),
  CONSTRAINT `fk_approval` FOREIGN KEY (`approval_status_id`) REFERENCES `approval_status` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_purpose` FOREIGN KEY (`purposeId`) REFERENCES `purposes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `visits_ibfk_2` FOREIGN KEY (`visited_employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visits`
--

LOCK TABLES `visits` WRITE;
/*!40000 ALTER TABLE `visits` DISABLE KEYS */;
INSERT INTO `visits` VALUES (1,1,2,'2025-05-10',NULL,NULL,'8:00 AM - 9:00 AM','Checked In',1,2),(2,2,3,'2025-05-10',NULL,NULL,'11:00 AM - 12:00 PM','Checked In',2,2),(3,3,4,'2025-05-11',NULL,NULL,'2:00 PM - 3:00 PM','Checked In',3,2),(4,4,5,'2025-05-11',NULL,NULL,'5:00 PM - 6:00 PM','Checked In',4,2),(5,5,6,'2025-05-11',NULL,NULL,'8:00 AM - 9:00 AM','Checked In',5,2),(6,6,7,'2025-05-12',NULL,NULL,'11:00 AM - 12:00 PM','Checked In',1,2),(7,7,8,'2025-05-12',NULL,NULL,'2:00 PM - 3:00 PM','Checked In',2,2),(8,8,9,'2025-05-12',NULL,NULL,'5:00 PM - 6:00 PM','Checked In',3,2),(9,9,10,'2025-05-12',NULL,NULL,'8:00 AM - 9:00 AM','Checked In',4,2),(10,10,11,'2025-05-12',NULL,NULL,'11:00 AM - 12:00 PM','Checked In',5,2),(11,11,12,'2025-05-12',NULL,NULL,'2:00 PM - 3:00 PM','Checked In',1,2),(12,12,13,'2025-05-12',NULL,NULL,'5:00 PM - 6:00 PM','Checked In',2,2),(13,13,14,'2025-05-12',NULL,NULL,'8:00 AM - 9:00 AM','Checked In',3,2),(14,14,15,'2025-05-12',NULL,NULL,'11:00 AM - 12:00 PM','Checked In',4,2),(15,15,16,'2025-05-12',NULL,NULL,'2:00 PM - 3:00 PM','Checked In',5,2),(16,26,30,'2025-05-12',NULL,NULL,'5:00 PM - 6:00 PM','Checked In',1,2),(17,27,31,'2025-05-13',NULL,NULL,'8:00 AM - 9:00 AM','Checked In',2,2),(20,37,1,'2025-05-13',NULL,NULL,'7:00 PM - 8:00 PM','Checked In',5,4),(21,38,2,'2025-05-13',NULL,NULL,'11:00 AM - 12:00 PM','Checked In',3,2),(22,39,6,'2025-05-13',NULL,NULL,'7:00 PM - 8:00 PM','Checked In',3,2),(23,40,1,'2025-05-14','09:39:30','09:39:31','7:00 PM - 8:00 PM','Checked Out',4,1);
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

-- Dump completed on 2025-05-14  1:40:20
