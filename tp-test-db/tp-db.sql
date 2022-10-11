-- MySQL dump 10.19  Distrib 10.3.34-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: 10.10.10.65    Database: tp
-- ------------------------------------------------------
-- Server version	10.7.3-MariaDB-1:10.7.3+maria~focal

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `AllowedCompanies`
--

DROP TABLE IF EXISTS `AllowedCompanies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AllowedCompanies` (
  `ID` char(36) NOT NULL,
  `companyCode` varchar(255) NOT NULL,
  `company` varchar(255) NOT NULL,
  `personInCharge` varchar(255) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `companyCode` (`companyCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AllowedCompanies`
--

LOCK TABLES `AllowedCompanies` WRITE;
/*!40000 ALTER TABLE `AllowedCompanies` DISABLE KEYS */;
/*!40000 ALTER TABLE `AllowedCompanies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `BannedUsers`
--

DROP TABLE IF EXISTS `BannedUsers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `BannedUsers` (
  `ID` char(36) NOT NULL,
  `userID` char(36) NOT NULL,
  `reason` text NOT NULL,
  `startDateTime` datetime NOT NULL,
  `endDateTime` datetime NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `userID` (`userID`),
  CONSTRAINT `BannedUsersUser` FOREIGN KEY (`userID`) REFERENCES `Users` (`ID`),
  CONSTRAINT `noEndBeforeStart` CHECK (`startDateTime` <= `endDateTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `BannedUsers`
--

LOCK TABLES `BannedUsers` WRITE;
/*!40000 ALTER TABLE `BannedUsers` DISABLE KEYS */;
INSERT INTO `BannedUsers` VALUES ('587e3fec-6fbb-4136-a062-774255ef4fcf','b90d3ba7-281a-496d-9495-33c419920374','Test','2022-01-24 14:52:50','2025-01-21 16:52:52');
/*!40000 ALTER TABLE `BannedUsers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `BannedVehicles`
--

DROP TABLE IF EXISTS `BannedVehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `BannedVehicles` (
  `ID` char(36) NOT NULL,
  `licensePlate` varchar(16) NOT NULL,
  `reason` text NOT NULL,
  `startDateTime` datetime NOT NULL,
  `endDateTime` datetime NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `licensePlate` (`licensePlate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `BannedVehicles`
--

LOCK TABLES `BannedVehicles` WRITE;
/*!40000 ALTER TABLE `BannedVehicles` DISABLE KEYS */;
INSERT INTO `BannedVehicles` VALUES ('89c9f5a9-dad6-11ec-a83b-0242ac1a0002','DNS-101','abc','2022-05-22 23:25:30','2022-05-24 23:25:30'),('89c9f5a9-dad6-11ec-a83b-0242ac1a0003','TRG-802','abc2','2022-05-21 23:25:30','2022-05-22 23:25:30');
/*!40000 ALTER TABLE `BannedVehicles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ParkingEvents`
--

DROP TABLE IF EXISTS `ParkingEvents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ParkingEvents` (
  `ID` char(36) NOT NULL,
  `userID` char(36) NOT NULL,
  `licensePlate` varchar(16) NOT NULL,
  `startDateTime` datetime NOT NULL DEFAULT current_timestamp(),
  `endDateTime` datetime DEFAULT NULL,
  `expiryDateTime` datetime NOT NULL,
  `licensePlateMatches` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`ID`),
  KEY `userID` (`userID`,`ID`),
  CONSTRAINT `ParkingEventsUser` FOREIGN KEY (`userID`) REFERENCES `Users` (`ID`),
  CONSTRAINT `noEndBeforeStart` CHECK (`startDateTime` <= `endDateTime`),
  CONSTRAINT `noExpiryBeforeStart` CHECK (`startDateTime` <= `expiryDateTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ParkingEvents`
--

LOCK TABLES `ParkingEvents` WRITE;
/*!40000 ALTER TABLE `ParkingEvents` DISABLE KEYS */;
INSERT INTO `ParkingEvents` VALUES ('2ad2e6aa-2fa9-40d2-a217-95d8bc78e57b','897a859e-b84c-4be6-9baa-78c674594662','TRG-802','2022-05-23 21:15:38','2022-05-23 21:15:41','2022-05-23 22:15:38',0),('5ac98556-26ee-4073-b1f7-98887ab05b5b','f91b1e22-c051-49c9-8fbb-f6f45ad7f1ef','TKK-1','2022-01-24 10:56:41','2022-01-24 23:56:41','2022-01-25 16:56:41',1),('8cde326a-1dfc-4128-8039-efff454b5430','f91b1e22-c051-49c9-8fbb-f6f45ad7f1ef','HEH-333','2021-12-01 17:42:20','2021-12-02 17:42:20','2021-12-02 17:42:20',1),('a16e1ebf-4f24-47b3-b16d-c466d395d0fc','f91b1e22-c051-49c9-8fbb-f6f45ad7f1ef','TKK-1','2022-01-04 17:00:10','2022-01-04 23:00:10','2022-01-05 17:00:10',1),('a954ae00-7342-4385-b74f-b76a4b4d8bc5','897a859e-b84c-4be6-9baa-78c674594662','TRG-802','2022-01-24 10:04:48','2022-05-23 20:44:33','2022-01-25 07:04:48',0),('acecea01-58a0-4fd9-9c31-4bc70b54bb24','897a859e-b84c-4be6-9baa-78c674594662','DNS-101','2021-12-24 11:04:01','2021-12-24 15:26:37','2021-12-24 18:04:01',1),('b4e7ffd6-5927-474e-ba86-1e2e810b7890','f91b1e22-c051-49c9-8fbb-f6f45ad7f1ef','HIH-111','2022-01-10 17:00:10','2022-01-10 23:36:19','2022-01-11 17:00:10',0),('fa8ea426-7201-4d41-b526-fc7efe4dd383','f91b1e22-c051-49c9-8fbb-f6f45ad7f1ef','AKU-313','2022-01-24 10:56:34','2022-01-25 18:56:41','2022-01-25 16:56:41',1);
/*!40000 ALTER TABLE `ParkingEvents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `UserStatus`
--

DROP TABLE IF EXISTS `UserStatus`;
/*!50001 DROP VIEW IF EXISTS `UserStatus`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `UserStatus` (
  `ID` tinyint NOT NULL,
  `banEnd` tinyint NOT NULL,
  `parkingEnd` tinyint NOT NULL,
  `parkingExpiry` tinyint NOT NULL,
  `cooldownTime` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Users` (
  `ID` char(36) NOT NULL,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `phoneNumber` varchar(32) NOT NULL,
  `emailAddress` varchar(255) NOT NULL,
  `company` varchar(255) NOT NULL,
  `registerDateTime` datetime NOT NULL DEFAULT current_timestamp(),
  `lastLoginDateTime` datetime NOT NULL DEFAULT current_timestamp(),
  `passwordHash` char(95) NOT NULL,
  `confirmationCode` char(6) DEFAULT NULL,
  `confirmationCodeCreateDateTime` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `emailAddress` (`emailAddress`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES ('02aab478-782e-4000-92d9-c143ee366878','Mikael','Alander','+358408237137','mikke.alander@gmail.com','Asennus Alander Oy','2022-05-28 23:28:04','2022-05-28 23:28:04','$argon2i$v=19$m=4096,t=3,p=1$R1uTZDRyQnqS5cFXDpLhQw$BmJlR8dYSadQICU9X/ovJZRSkwnxW8sFA5qQu788xw0',NULL,NULL),('897a859e-b84c-4be6-9baa-78c674594662','Benjamin','Pettinen','+358443312279','benjamin@yobitti.fi','YO-bitti Oy','2021-11-22 12:33:13','2022-05-29 23:41:16','$argon2i$v=19$m=4096,t=3,p=1$vCxHYDkZHWoI+VoYyaXzJQ$Azttbg9r5fMMmdnnsh0Im3K+2ey92b9TRKoubuNtW+Y',NULL,NULL),('b90d3ba7-281a-496d-9495-33c419920374','Banned','Tester','+5555555','banned@tester.com','Banned','2022-01-24 14:52:36','2022-01-24 14:52:36','$argon2i$v=19$m=4096,t=3,p=1$yjnZCIg/UvQ0JAO1mejZjw$93kN0voM2WclhNrgw5YHQgT3Fh46S+SrniT8SxXy7TU',NULL,NULL),('c378271b-2032-41d3-8af6-f405428ef917','John','Example','+358123456789','john@example.com','Example Inc.','2022-01-24 14:47:18','2022-01-24 14:47:18','$argon2i$v=19$m=4096,t=3,p=1$g1rmSxWUmggpEv5DwrW7ww$wrSDD7OIXEbGxuLPIBzC9gloMC0OFImTYVpLOUwD5NM',NULL,NULL),('f91b1e22-c051-49c9-8fbb-f6f45ad7f1ef','A','A','+55555555','a@a','','2022-01-24 14:49:12','2022-05-25 07:12:44','$argon2i$v=19$m=4096,t=3,p=1$Q8h/27IypdzSZ+B/5gEjqg$rTCB0ZqOFH+82tFOSjjnmsclzlr/HqbXga0dG9sVXDc',NULL,NULL);
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `UserStatus`
--

/*!50001 DROP TABLE IF EXISTS `UserStatus`*/;
/*!50001 DROP VIEW IF EXISTS `UserStatus`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`tp`@`%` SQL SECURITY INVOKER */
/*!50001 VIEW `UserStatus` AS select `Users`.`ID` AS `ID`,(select max(`BannedUsers`.`endDateTime`) from `BannedUsers` where `BannedUsers`.`userID` = `Users`.`ID` and `BannedUsers`.`startDateTime` <= current_timestamp() and `BannedUsers`.`endDateTime` > current_timestamp()) AS `banEnd`,(select max(`ParkingEvents`.`endDateTime`) from `ParkingEvents` where `ParkingEvents`.`userID` = `Users`.`ID`) AS `parkingEnd`,(select max(`ParkingEvents`.`expiryDateTime`) from `ParkingEvents` where `ParkingEvents`.`userID` = `Users`.`ID` and `ParkingEvents`.`endDateTime` is null) AS `parkingExpiry`,(select timestampdiff(SECOND,ifnull(max(`ParkingEvents`.`endDateTime`),from_unixtime(0)),current_timestamp()) from `ParkingEvents` where `ParkingEvents`.`userID` = `Users`.`ID`) AS `cooldownTime` from `Users` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-05-30  2:46:28
