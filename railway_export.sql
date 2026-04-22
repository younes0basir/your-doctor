-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: switchyard.proxy.rlwy.net    Database: railway
-- ------------------------------------------------------
-- Server version	9.3.0

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
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (1,'admin@admin','$2b$10$.Z6Lns4jG.Dv3mduvbxTi.8PmqdwcG23rSueUiSUFmEEE3vw77p5u','2025-05-01 17:57:39');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `appointment_date` datetime NOT NULL,
  `type` enum('physical','video') NOT NULL,
  `status` enum('pending','confirmed','in_progress','completed','canceled') DEFAULT 'pending',
  `meeting_link` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `queue_position` int DEFAULT NULL,
  `is_in_queue` enum('not_inqueue','pending','in_queue') DEFAULT 'not_inqueue',
  `payment_status` enum('paid','not_paid') DEFAULT 'not_paid',
  PRIMARY KEY (`id`),
  KEY `idx_appointments_doctor` (`doctor_id`),
  KEY `idx_appointments_patient` (`patient_id`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`id`),
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (27,1,2,'2025-05-17 08:15:00','video','canceled',NULL,'2025-05-01 08:50:33','2025-05-26 19:18:16',NULL,'not_inqueue','paid'),(28,1,2,'2025-05-02 09:30:00','video','completed',NULL,'2025-05-01 09:49:07','2025-05-01 17:20:46',NULL,'not_inqueue','not_paid'),(29,1,2,'2025-05-23 15:30:00','physical','completed',NULL,'2025-05-23 13:21:23','2025-05-23 13:22:05',NULL,'not_inqueue','not_paid'),(30,1,2,'2025-05-23 15:00:00','physical','completed',NULL,'2025-05-23 13:39:49','2025-05-23 13:48:50',NULL,'not_inqueue','not_paid'),(31,1,2,'2025-05-23 17:45:00','physical','completed',NULL,'2025-05-23 13:56:00','2025-05-23 13:58:20',NULL,'not_inqueue','not_paid'),(32,1,2,'2025-05-23 17:30:00','physical','completed',NULL,'2025-05-23 13:56:10','2025-05-23 15:34:07',NULL,'not_inqueue','not_paid'),(33,1,2,'2025-05-23 18:30:00','physical','completed',NULL,'2025-05-23 13:56:22','2025-05-23 14:02:02',NULL,'not_inqueue','not_paid'),(34,1,2,'2025-05-23 18:15:00','physical','completed',NULL,'2025-05-23 15:32:25','2025-05-23 15:34:21',NULL,'not_inqueue','not_paid'),(35,1,2,'2025-05-24 13:45:00','physical','completed',NULL,'2025-05-24 12:25:37','2025-05-26 20:35:16',NULL,'not_inqueue','paid'),(36,1,2,'2025-05-24 15:00:00','physical','completed',NULL,'2025-05-24 13:12:28','2025-05-26 17:12:36',NULL,'not_inqueue','paid'),(37,1,2,'2025-05-26 18:45:00','physical','completed',NULL,'2025-05-26 16:48:32','2025-05-26 17:12:43',NULL,'not_inqueue','paid'),(38,1,2,'2025-05-26 18:30:00','physical','pending',NULL,'2025-05-26 17:03:44','2025-05-26 17:14:40',NULL,'not_inqueue','paid'),(39,1,3,'2025-05-28 17:15:00','video','completed',NULL,'2025-05-27 18:06:53','2025-05-30 08:32:07',NULL,'not_inqueue','paid'),(40,1,3,'2025-07-29 14:00:00','video','completed',NULL,'2025-05-28 10:49:51','2025-05-30 08:32:12',NULL,'not_inqueue','not_paid'),(41,1,4,'2025-05-30 10:45:00','video','completed',NULL,'2025-05-30 08:34:51','2025-05-30 08:37:07',NULL,'not_inqueue','not_paid'),(42,1,5,'2025-06-02 14:45:00','video','completed',NULL,'2025-05-31 19:09:54','2025-06-01 22:19:46',NULL,'not_inqueue','not_paid'),(43,1,3,'2025-06-17 08:30:00','video','confirmed',NULL,'2025-06-01 21:37:56','2025-06-03 09:02:50',NULL,'not_inqueue','not_paid'),(44,1,1,'2025-06-20 14:30:00','physical','completed',NULL,'2025-06-01 22:09:56','2025-06-01 22:19:49',NULL,'not_inqueue','not_paid'),(45,1,1,'2025-06-11 09:00:00','video','pending',NULL,'2025-06-01 22:20:15','2025-06-01 22:20:15',NULL,'not_inqueue','not_paid'),(46,1,4,'2025-06-20 09:30:00','video','completed',NULL,'2025-06-02 14:10:37','2025-06-07 17:17:27',NULL,'not_inqueue','not_paid'),(47,1,1,'2025-06-23 09:00:00','physical','confirmed',NULL,'2025-06-03 08:08:29','2025-06-03 09:01:55',NULL,'not_inqueue','not_paid'),(48,1,3,'2026-02-03 09:30:00','physical','confirmed',NULL,'2025-06-03 08:27:30','2025-06-03 09:08:15',NULL,'not_inqueue','not_paid'),(49,1,4,'2025-06-03 12:30:00','video','confirmed',NULL,'2025-06-03 08:58:50','2025-06-07 17:17:27',1,'in_queue','not_paid'),(50,1,8,'2025-06-26 18:42:00','video','pending',NULL,'2025-06-03 17:43:01','2025-06-03 17:43:01',NULL,'not_inqueue','not_paid'),(51,1,2,'2025-06-09 08:45:00','video','in_progress',NULL,'2025-06-07 17:14:44','2025-06-07 17:17:30',2,'in_queue','not_paid');
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assistant`
--

DROP TABLE IF EXISTS `assistant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assistant` (
  `id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `assistant_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assistant`
--

LOCK TABLES `assistant` WRITE;
/*!40000 ALTER TABLE `assistant` DISABLE KEYS */;
INSERT INTO `assistant` VALUES (1,1,'yassine@assistant','$2b$10$EK.gel70GWOE1utstesEVuV//xTmMHOur7eHZQBEmqCzvktiQmnJe','yassine','assistant','2025-05-16 21:15:41');
/*!40000 ALTER TABLE `assistant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctor`
--

DROP TABLE IF EXISTS `doctor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'doctor',
  `speciality_id` int NOT NULL,
  `experience_years` int NOT NULL,
  `consultation_fee` decimal(10,2) NOT NULL,
  `specialty_description` text,
  `degree` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `address` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `image_public_id` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('pending','approved','hidden') DEFAULT 'pending',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_doctor_email` (`email`),
  KEY `idx_doctor_speciality` (`speciality_id`),
  KEY `idx_doctor_city` (`city`),
  CONSTRAINT `fk_doctor_speciality` FOREIGN KEY (`speciality_id`) REFERENCES `specialities` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor`
--

LOCK TABLES `doctor` WRITE;
/*!40000 ALTER TABLE `doctor` DISABLE KEYS */;
INSERT INTO `doctor` VALUES (1,'yassine@doctor.com','$2b$10$jHLx1VIbb2gVDgGZMRBOl.ZFRhjLq5vOy/T.KRtIAdGg0W37spJF6','yassine','basir','doctor',10,2,199.00,'DNDNDNDN','PHD','Fes','DBDBBDBD','https://res.cloudinary.com/dsx5croh5/image/upload/v1740600952/doctor_profiles/swo12soj9zu4rxeqm7bu.jpg','doctor_profiles/swo12soj9zu4rxeqm7bu','2025-02-25 10:38:31','2025-06-03 09:13:45','approved'),(2,'doctor@test.com','$2b$10$VQtV0GtFG4rA8OSVwyl/uOK8uaop09t43dfoMuHAh74Krcknytjx.','doc','tor','doctor',10,5,16.00,'kiikiki','kki','Safi','DBDBBDBD','https://res.cloudinary.com/dsx5croh5/image/upload/v1740511157/doctor_profiles/k7fxk6y5j2xbrm20zzin.png','doctor_profiles/k7fxk6y5j2xbrm20zzin','2025-02-25 14:47:24','2025-05-30 08:28:57','approved');
/*!40000 ALTER TABLE `doctor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient`
--

DROP TABLE IF EXISTS `patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'user',
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(20) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `image_public_id` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `cin` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient`
--

LOCK TABLES `patient` WRITE;
/*!40000 ALTER TABLE `patient` DISABLE KEYS */;
INSERT INTO `patient` VALUES (1,'vodbo2001@gmail.com','basir2001','user','MRID','tor',NULL,NULL,NULL,NULL,'2025-02-25 12:00:37','2025-02-26 11:58:43','cd1'),(2,'sou@gmail.com','123456','user','sou','soum','0641674031',39,NULL,NULL,'2025-05-01 09:49:47','2025-05-23 18:05:51','cd2'),(3,'kenasaguri@gmail.com','basir2001','user','KEN','ASAGURI','+212641674031',27,NULL,NULL,'2025-05-27 19:06:21','2025-05-28 11:56:52','cd3'),(4,'ana@gmail.com','ana@gmail.com','user','Ana','Ana',NULL,NULL,NULL,NULL,'2025-05-30 09:34:17','2025-05-30 09:34:17','cd4'),(5,'Aaaa@aaaaa','Aaaa@aaaaa','user','Aaaa','Aaaa',NULL,NULL,NULL,NULL,'2025-05-31 20:08:58','2025-05-31 20:08:58','cd5'),(6,'machakil@patient','machakil@patient','user','mach','akil',NULL,NULL,NULL,NULL,'2025-06-03 16:47:11','2025-06-03 16:47:11','cd6'),(7,'uuyuyu@hjjhj',NULL,'user','huyuyu','yuyuyuyu','0222555',22,NULL,NULL,'2025-06-03 17:41:23','2025-06-03 17:41:23','cd258588'),(8,'hanafi@patient',NULL,'user','aymane','hanafi','060202025',20,NULL,NULL,'2025-06-03 17:42:51','2025-06-03 17:42:51','cd250');
/*!40000 ALTER TABLE `patient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_history`
--

DROP TABLE IF EXISTS `patient_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `doctor_id` int DEFAULT NULL,
  `appointment_id` int DEFAULT NULL,
  `diagnosis` text,
  `prescription_id` int DEFAULT NULL,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `prescription_id` (`prescription_id`),
  KEY `fk_patient_history_doctor` (`doctor_id`),
  CONSTRAINT `fk_patient_history_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`id`),
  CONSTRAINT `patient_history_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`),
  CONSTRAINT `patient_history_ibfk_2` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`),
  CONSTRAINT `patient_history_ibfk_3` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_history`
--

LOCK TABLES `patient_history` WRITE;
/*!40000 ALTER TABLE `patient_history` DISABLE KEYS */;
INSERT INTO `patient_history` VALUES (1,2,1,30,NULL,NULL,'2025-05-23 14:48:50'),(2,2,1,31,NULL,NULL,'2025-05-23 14:58:20'),(3,2,1,33,'test3',4,'2025-05-23 15:02:02'),(4,2,1,32,NULL,NULL,'2025-05-23 16:34:07'),(5,2,1,34,'ttttttt',5,'2025-05-23 16:34:18'),(6,2,1,34,'ttttttt',5,'2025-05-23 16:34:21'),(7,2,1,35,NULL,NULL,'2025-05-26 17:12:27'),(8,2,1,36,NULL,NULL,'2025-05-26 17:12:36'),(9,2,1,37,NULL,NULL,'2025-05-26 17:12:43'),(10,3,1,40,'MÉDICAMENTS PRESCRITS:\n\ncccccc cccccc:\n- Posologie: cccccc\n- Durée: cccccc\n- Remarques: ccccccc\n\n\nINSTRUCTIONS COMPLÉMENTAIRES:\nalksmxcldanvcjsvnfljvnfljvbfjbfvjsfbjnflnflbnnbbjlnbjlbjdsnjbjsbjsbjbvjsdbvsdjvbdjvbdjvbsdjvbdjvbsdjbvdjbvsdjvdjvdjvbdjvbsdjbdsjvb',7,'2025-05-28 22:56:57'),(11,3,1,39,'MÉDICAMENTS PRESCRITS:\n\ndoli 500:\n- Posologie: 3j\n- Durée: 10j\n- Remarques: jjjjjjj\n\n\nINSTRUCTIONS COMPLÉMENTAIRES:\nsedrftyuigytfredfghjkjhgfrdeedrftghjkjhygtrfederfgtujkkjuhygtrfedwsdefrghjk,l,kjhytgrfe3werfgthjkloikujyhgtrfe3drfgthjkl',9,'2025-05-29 13:13:49'),(12,3,1,39,'MÉDICAMENTS PRESCRITS:\n\ndoli 500:\n- Posologie: 3j\n- Durée: 10j\n- Remarques: jjjjjjj\n\n\nINSTRUCTIONS COMPLÉMENTAIRES:\nsedrftyuigytfredfghjkjhgfrdeedrftghjkjhygtrfederfgtujkkjuhygtrfedwsdefrghjk,l,kjhytgrfe3werfgthjkloikujyhgtrfe3drfgthjkl',9,'2025-05-30 08:32:08'),(13,3,1,40,'MÉDICAMENTS PRESCRITS:\n\ncccccc cccccc:\n- Posologie: cccccc\n- Durée: cccccc\n- Remarques: ccccccc\n\n\nINSTRUCTIONS COMPLÉMENTAIRES:\nalksmxcldanvcjsvnfljvnfljvbfjbfvjsfbjnflnflbnnbbjlnbjlbjdsnjbjsbjsbjbvjsdbvsdjvbdjvbdjvbsdjvbdjvbsdjbvdjbvsdjvdjvdjvbdjvbsdjbdsjvb',7,'2025-05-30 08:32:12'),(14,4,1,41,'MÉDICAMENTS PRESCRITS:\n\n\nINSTRUCTIONS COMPLÉMENTAIRES:\nzoux',10,'2025-05-30 08:37:01'),(15,4,1,41,'MÉDICAMENTS PRESCRITS:\n\n\nINSTRUCTIONS COMPLÉMENTAIRES:\nzoux',10,'2025-05-30 08:37:07'),(16,5,1,42,NULL,NULL,'2025-06-01 22:19:46'),(17,1,1,44,NULL,NULL,'2025-06-01 22:19:49'),(18,4,1,46,NULL,NULL,'2025-06-07 17:17:28');
/*!40000 ALTER TABLE `patient_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescriptions`
--

DROP TABLE IF EXISTS `prescriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `prescription_text` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `prescriptions_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`),
  CONSTRAINT `prescriptions_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`id`),
  CONSTRAINT `prescriptions_ibfk_3` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescriptions`
--

LOCK TABLES `prescriptions` WRITE;
/*!40000 ALTER TABLE `prescriptions` DISABLE KEYS */;
INSERT INTO `prescriptions` VALUES (1,28,1,2,'hhhhjh','2025-05-01 15:18:46'),(2,30,1,2,'test','2025-05-23 13:42:12'),(3,31,1,2,'test2','2025-05-23 13:58:15'),(4,33,1,2,'test3','2025-05-23 14:00:25'),(5,34,1,2,'ttttttt','2025-05-23 15:34:18'),(6,40,1,3,'dossssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss nnnnnnnsn                       ssccccccccccccccccssssssssscccccccccccccccccssssssssssssssssssccccccccccccc','2025-05-28 22:56:57'),(7,40,1,3,'MÉDICAMENTS PRESCRITS:\n\ncccccc cccccc:\n- Posologie: cccccc\n- Durée: cccccc\n- Remarques: ccccccc\n\n\nINSTRUCTIONS COMPLÉMENTAIRES:\nalksmxcldanvcjsvnfljvnfljvbfjbfvjsfbjnflnflbnnbbjlnbjlbjdsnjbjsbjsbjbvjsdbvsdjvbdjvbdjvbsdjvbdjvbsdjbvdjbvsdjvdjvdjvbdjvbsdjbdsjvb','2025-05-28 23:04:15'),(8,39,1,3,'MÉDICAMENTS PRESCRITS:\n\ndoli 500:\n- Posologie: 3j\n- Durée: 10j\n- Remarques: jjjjjjj\n\n\nINSTRUCTIONS COMPLÉMENTAIRES:\nsedrftyuigytfredfghjkjhgfrdeedrftghjkjhygtrfederfgtujkkjuhygtrfedwsdefrghjk,l,kjhytgrfe3werfgthjkloikujyhgtrfe3drfgthjkl','2025-05-29 13:13:49'),(9,39,1,3,'MÉDICAMENTS PRESCRITS:\n\ndoli 500:\n- Posologie: 3j\n- Durée: 10j\n- Remarques: jjjjjjj\n\n\nINSTRUCTIONS COMPLÉMENTAIRES:\nsedrftyuigytfredfghjkjhgfrdeedrftghjkjhygtrfederfgtujkkjuhygtrfedwsdefrghjk,l,kjhytgrfe3werfgthjkloikujyhgtrfe3drfgthjkl','2025-05-29 13:13:50'),(10,41,1,4,'MÉDICAMENTS PRESCRITS:\n\n\nINSTRUCTIONS COMPLÉMENTAIRES:\nzoux','2025-05-30 08:37:01');
/*!40000 ALTER TABLE `prescriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `specialities`
--

DROP TABLE IF EXISTS `specialities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `specialities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `specialities`
--

LOCK TABLES `specialities` WRITE;
/*!40000 ALTER TABLE `specialities` DISABLE KEYS */;
INSERT INTO `specialities` VALUES (1,'Cardiology','2025-02-25 10:36:09'),(2,'Dermatology','2025-02-25 10:36:09'),(3,'Neurology','2025-02-25 10:36:09'),(4,'Pediatrics','2025-02-25 10:36:09'),(5,'Orthopedics','2025-02-25 10:36:09'),(6,'Psychiatry','2025-02-25 10:36:09'),(7,'Gynecology','2025-02-25 10:36:09'),(8,'Ophthalmology','2025-02-25 10:36:09'),(9,'Dentistry','2025-02-25 10:36:09'),(10,'General Medicine','2025-02-25 10:36:09'),(11,'Endocrinology','2025-02-27 09:55:44'),(12,'Gastroenterology','2025-02-27 09:55:44'),(13,'Nephrology','2025-02-27 09:55:44'),(14,'Pulmonology','2025-02-27 09:55:44'),(15,'Rheumatology','2025-02-27 09:55:44'),(16,'Allergy and Immunology','2025-02-27 09:55:44'),(17,'Anesthesiology','2025-02-27 09:55:44'),(18,'Hematology','2025-02-27 09:55:44'),(19,'Infectious Disease','2025-02-27 09:55:44'),(20,'Plastic Surgery','2025-02-27 09:55:44'),(21,'Urology','2025-02-27 09:55:44'),(22,'Radiology','2025-02-27 09:55:44'),(23,'Sports Medicine','2025-02-27 09:55:44'),(24,'Emergency Medicine','2025-02-27 09:55:44'),(25,'Oncology','2025-02-27 09:55:44'),(26,'Geriatrics','2025-02-27 09:55:44'),(27,'Otolaryngology (ENT)','2025-02-27 09:55:44'),(28,'Pathology','2025-02-27 09:55:44'),(29,'Rehabilitation Medicine','2025-02-27 09:55:44');
/*!40000 ALTER TABLE `specialities` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-08 11:15:30
