-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.4 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table gayafusionall.tblcasting
CREATE TABLE IF NOT EXISTS `tblcasting` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `CastingCode` varchar(10) NOT NULL,
  `CastingDescription` varchar(100) NOT NULL,
  `CastingDate` date NOT NULL DEFAULT '0000-00-00',
  `CastingTechDraw` varchar(50) DEFAULT NULL,
  `CastingPhoto1` varchar(300) DEFAULT NULL,
  `CastingPhoto2` varchar(300) DEFAULT NULL,
  `CastingPhoto3` varchar(300) DEFAULT NULL,
  `CastingPhoto4` varchar(300) DEFAULT NULL,
  `CastingNotes` text,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `CastingCode` (`CastingCode`)
) ENGINE=MyISAM AUTO_INCREMENT=77 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblclay
CREATE TABLE IF NOT EXISTS `tblclay` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `ClayCode` varchar(10) NOT NULL,
  `ClayDescription` varchar(100) NOT NULL,
  `ClayDate` date NOT NULL DEFAULT '0000-00-00',
  `ClayTechDraw` varchar(50) DEFAULT NULL,
  `ClayPhoto1` varchar(300) DEFAULT NULL,
  `ClayPhoto2` varchar(300) DEFAULT NULL,
  `ClayPhoto3` varchar(300) DEFAULT NULL,
  `ClayPhoto4` varchar(300) DEFAULT NULL,
  `ClayNotes` text,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `ClayCode` (`ClayCode`)
) ENGINE=MyISAM AUTO_INCREMENT=74 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblcollect_category
CREATE TABLE IF NOT EXISTS `tblcollect_category` (
  `CategoryCode` varchar(3) NOT NULL,
  `CategoryName` varchar(50) NOT NULL,
  PRIMARY KEY (`CategoryCode`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblcollect_color
CREATE TABLE IF NOT EXISTS `tblcollect_color` (
  `ColorCode` varchar(3) NOT NULL,
  `ColorName` varchar(100) NOT NULL,
  PRIMARY KEY (`ColorCode`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblcollect_design
CREATE TABLE IF NOT EXISTS `tblcollect_design` (
  `DesignCode` varchar(2) NOT NULL,
  `DesignName` varchar(100) NOT NULL,
  PRIMARY KEY (`DesignCode`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblcollect_master
CREATE TABLE IF NOT EXISTS `tblcollect_master` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `CollectCode` varchar(15) NOT NULL,
  `DesignCode` varchar(2) NOT NULL,
  `NameCode` varchar(2) NOT NULL,
  `CategoryCode` varchar(3) NOT NULL,
  `SizeCode` varchar(2) NOT NULL,
  `TextureCode` varchar(2) NOT NULL,
  `ColorCode` varchar(3) NOT NULL,
  `MaterialCode` varchar(2) NOT NULL,
  `ClientCode` varchar(20) DEFAULT NULL,
  `ClientDescription` varchar(50) DEFAULT NULL,
  `CollectDate` date DEFAULT '0000-01-01',
  `TechDraw` varchar(300) DEFAULT NULL,
  `Photo1` varchar(300) DEFAULT NULL,
  `Photo2` varchar(300) DEFAULT NULL,
  `Photo3` varchar(300) DEFAULT NULL,
  `Photo4` varchar(300) DEFAULT NULL,
  `RefID` int DEFAULT NULL,
  `Clay` int DEFAULT NULL,
  `ClayKG` decimal(10,2) DEFAULT '0.00',
  `ClayNote` text,
  `BuildTech` varchar(50) DEFAULT NULL,
  `BuildTechNote` text,
  `Rim` varchar(50) DEFAULT NULL,
  `Feet` varchar(30) DEFAULT NULL,
  `Casting1` int DEFAULT NULL,
  `Casting2` int DEFAULT NULL,
  `Casting3` int DEFAULT NULL,
  `Casting4` int DEFAULT NULL,
  `CastingNote` text,
  `Estruder1` int DEFAULT NULL,
  `Estruder2` int DEFAULT NULL,
  `Estruder3` int DEFAULT NULL,
  `Estruder4` int DEFAULT NULL,
  `EstruderNote` text,
  `Texture1` int DEFAULT NULL,
  `Texture2` int DEFAULT NULL,
  `Texture3` int DEFAULT NULL,
  `Texture4` int DEFAULT NULL,
  `TextureNote` text,
  `Tools1` int DEFAULT NULL,
  `Tools2` int DEFAULT NULL,
  `Tools3` int DEFAULT NULL,
  `Tools4` int DEFAULT NULL,
  `ToolsNote` text,
  `Engobe1` int DEFAULT NULL,
  `Engobe2` int DEFAULT NULL,
  `Engobe3` int DEFAULT NULL,
  `Engobe4` int DEFAULT NULL,
  `EngobeNote` text,
  `BisqueTemp` int NOT NULL DEFAULT '900',
  `BisqueTempNote` text,
  `StainOxide1` int DEFAULT NULL,
  `StainOxide2` int DEFAULT NULL,
  `StainOxide3` int DEFAULT NULL,
  `StainOxide4` int DEFAULT NULL,
  `StainOxideNote` text,
  `Lustre1` int DEFAULT NULL,
  `Lustre2` int DEFAULT NULL,
  `Lustre3` int DEFAULT NULL,
  `Lustre4` int DEFAULT NULL,
  `LustreNote` text,
  `LustreTemp` int DEFAULT '0',
  `LustreTempNote` text,
  `Glaze1` int DEFAULT NULL,
  `Glaze2` int DEFAULT NULL,
  `Glaze3` int DEFAULT NULL,
  `Glaze4` int DEFAULT NULL,
  `GlazeDensity1` varchar(10) DEFAULT NULL,
  `GlazeDensity2` varchar(10) DEFAULT NULL,
  `GlazeDensity3` varchar(10) DEFAULT NULL,
  `GlazeDensity4` varchar(10) DEFAULT NULL,
  `GlazeTechnique` varchar(100) DEFAULT NULL,
  `GlazeNote` text,
  `GlazeTemp` int DEFAULT '0',
  `GlazeTempNote` text,
  `Firing` varchar(10) DEFAULT NULL,
  `FiringNote` text,
  `Width` decimal(10,2) DEFAULT NULL,
  `Height` decimal(10,2) DEFAULT NULL,
  `Length` decimal(10,2) DEFAULT NULL,
  `Diameter` decimal(10,2) DEFAULT NULL,
  `SampCeramicVolume` decimal(10,2) DEFAULT '0.00',
  `FinalSizeNote` text,
  `DesignMat1` int DEFAULT NULL,
  `DesignMat2` int DEFAULT NULL,
  `DesignMat3` int DEFAULT NULL,
  `DesignMat4` int DEFAULT NULL,
  `DesignMatQty1` int DEFAULT NULL,
  `DesignMatQty2` int DEFAULT NULL,
  `DesignMatQty3` int DEFAULT NULL,
  `DesignMatQty4` int DEFAULT NULL,
  `DesignMatNote` text,
  `History` text,
  `ClayType` varchar(50) DEFAULT NULL,
  `ClayPreparationMinute` int DEFAULT '0',
  `WheelMinute` int DEFAULT '0',
  `SlabMinute` int DEFAULT '0',
  `CastingMinute` int DEFAULT '0',
  `FinishingMinute` int DEFAULT '0',
  `GlazingMinute` int DEFAULT '0',
  `StandardBisqueLoading` int DEFAULT '0',
  `StandardGlazeLoading` int DEFAULT '0',
  `RakuBisqueLoading` int DEFAULT '0',
  `RakuGlazeLoading` int DEFAULT '0',
  `MovementMinute` int DEFAULT '0',
  `PackagingWorkMinute` int DEFAULT '0',
  `ClayPreparationPPH` int NOT NULL DEFAULT '0',
  `WheelPPH` int NOT NULL DEFAULT '0',
  `SlabPPH` int NOT NULL DEFAULT '0',
  `CastingPPH` int NOT NULL DEFAULT '0',
  `FinishingPPH` int NOT NULL DEFAULT '0',
  `GlazingPPH` int NOT NULL DEFAULT '0',
  `MovementPPH` int NOT NULL DEFAULT '0',
  `PackagingWorkPPH` int NOT NULL DEFAULT '0',
  `RealSellingPrice` double NOT NULL DEFAULT '0',
  `LastUpdate` date NOT NULL DEFAULT '0000-00-00',
  `PriceDollar` decimal(10,2) NOT NULL DEFAULT '0.00',
  `PriceEuro` decimal(10,2) NOT NULL DEFAULT '0.00',
  `unit` varchar(20) DEFAULT NULL,
  `cat` varchar(2) DEFAULT NULL,
  `CompanyCode` varchar(10) DEFAULT NULL,
  `SupplierCode` varchar(10) DEFAULT NULL,
  `Description` varchar(200) DEFAULT NULL,
  `RCProcessSub` int DEFAULT NULL,
  `RCProcessType` varchar(50) DEFAULT NULL,
  `RCClay` int DEFAULT NULL,
  `RCClayCost` double(12,2) DEFAULT NULL,
  `RCClayPreparationCost` double(12,2) DEFAULT NULL,
  `RCWheelCost` double(12,2) DEFAULT NULL,
  `RCSlabCost` double(12,2) DEFAULT NULL,
  `RCFinishingCost` double(12,2) DEFAULT NULL,
  `RCGlazeCost` double(12,2) DEFAULT NULL,
  `RCFiring` double(12,2) DEFAULT NULL,
  `RCBisqueLoadCost` double(12,2) DEFAULT NULL,
  `RCGlazeLoadCost` double(12,2) DEFAULT NULL,
  `RCMovementCost` double(12,2) DEFAULT NULL,
  `RCPackCost` double(12,2) DEFAULT NULL,
  `RealCost` double(12,2) DEFAULT NULL,
  `RCClayPrice` double(12,2) DEFAULT NULL,
  `lockmode` tinyint(1) DEFAULT NULL,
  `rc` tinyint(1) DEFAULT NULL,
  `dlid` int DEFAULT NULL,
  `nw` tinyint(1) DEFAULT NULL,
  `Template` longtext,
  `TemplateNote` longtext,
  `BisqueNote` longtext,
  `GlazeThickness1` double(8,2) DEFAULT NULL,
  `GlazeThickness2` double(8,2) DEFAULT NULL,
  `GlazeThickness3` double(8,3) DEFAULT NULL,
  `GlazeThickness4` double(8,4) DEFAULT NULL,
  `Cone` int DEFAULT NULL,
  `FiringPosition` longtext,
  `RCCastCost` double(12,2) DEFAULT NULL,
  `shop` tinyint(1) DEFAULT NULL,
  `shopcategory` tinyint(1) DEFAULT NULL,
  `shoptechnique` tinyint(1) DEFAULT NULL,
  `oo` tinyint(1) DEFAULT NULL,
  `shopprice` double(12,2) DEFAULT NULL,
  `stock` int DEFAULT NULL,
  `shopname` varchar(200) DEFAULT NULL,
  `shopdesc` varchar(200) DEFAULT NULL,
  `act` int DEFAULT '1',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `CollectCode` (`CollectCode`)
) ENGINE=MyISAM AUTO_INCREMENT=11247 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblcollect_material
CREATE TABLE IF NOT EXISTS `tblcollect_material` (
  `MaterialCode` varchar(2) NOT NULL,
  `MaterialName` varchar(50) NOT NULL,
  PRIMARY KEY (`MaterialCode`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblcollect_name
CREATE TABLE IF NOT EXISTS `tblcollect_name` (
  `NameCode` varchar(2) NOT NULL,
  `NameDesc` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`NameCode`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblcollect_size
CREATE TABLE IF NOT EXISTS `tblcollect_size` (
  `SizeCode` varchar(2) NOT NULL,
  `SizeName` varchar(50) NOT NULL,
  PRIMARY KEY (`SizeCode`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblcollect_texture
CREATE TABLE IF NOT EXISTS `tblcollect_texture` (
  `TextureCode` varchar(2) NOT NULL,
  `TextureName` varchar(50) NOT NULL,
  PRIMARY KEY (`TextureCode`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblengobe
CREATE TABLE IF NOT EXISTS `tblengobe` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `EngobeCode` varchar(10) NOT NULL,
  `EngobeDescription` varchar(100) NOT NULL,
  `EngobeDate` date NOT NULL DEFAULT '0000-00-00',
  `EngobeTechDraw` varchar(300) DEFAULT NULL,
  `EngobePhoto1` varchar(300) DEFAULT NULL,
  `EngobePhoto2` varchar(300) DEFAULT NULL,
  `EngobePhoto3` varchar(300) DEFAULT NULL,
  `EngobePhoto4` varchar(300) DEFAULT NULL,
  `EngobeNotes` text,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `EngobeCode` (`EngobeCode`)
) ENGINE=MyISAM AUTO_INCREMENT=97 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblestruder
CREATE TABLE IF NOT EXISTS `tblestruder` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `EstruderCode` varchar(10) NOT NULL,
  `EstruderDescription` varchar(100) NOT NULL,
  `EstruderDate` date NOT NULL DEFAULT '0000-00-00',
  `EstruderTechDraw` varchar(300) DEFAULT NULL,
  `EstruderPhoto1` varchar(300) DEFAULT NULL,
  `EstruderPhoto2` varchar(300) DEFAULT NULL,
  `EstruderPhoto3` varchar(300) DEFAULT NULL,
  `EstruderPhoto4` varchar(300) DEFAULT NULL,
  `EstruderNotes` text,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `EstruderCode` (`EstruderCode`)
) ENGINE=MyISAM AUTO_INCREMENT=176 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblglaze
CREATE TABLE IF NOT EXISTS `tblglaze` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `GlazeCode` varchar(10) NOT NULL,
  `GlazeDescription` varchar(100) NOT NULL,
  `GlazeDate` date NOT NULL DEFAULT '0000-00-00',
  `GlazeTechDraw` varchar(300) DEFAULT NULL,
  `GlazePhoto1` varchar(300) DEFAULT NULL,
  `GlazePhoto2` varchar(300) DEFAULT NULL,
  `GlazePhoto3` varchar(300) DEFAULT NULL,
  `GlazePhoto4` varchar(300) DEFAULT NULL,
  `GlazeNotes` text,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `GlazeCode` (`GlazeCode`)
) ENGINE=MyISAM AUTO_INCREMENT=703 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tbllustre
CREATE TABLE IF NOT EXISTS `tbllustre` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `LustreCode` varchar(10) NOT NULL,
  `LustreDescription` varchar(200) NOT NULL,
  `LustreDate` date NOT NULL DEFAULT '0000-00-00',
  `LustreTechDraw` varchar(100) DEFAULT NULL,
  `LustrePhoto1` varchar(100) DEFAULT NULL,
  `LustrePhoto2` varchar(100) DEFAULT NULL,
  `LustrePhoto3` varchar(100) DEFAULT NULL,
  `LustrePhoto4` varchar(100) DEFAULT NULL,
  `LustreNotes` text,
  PRIMARY KEY (`ID`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblstainoxide
CREATE TABLE IF NOT EXISTS `tblstainoxide` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `StainOxideCode` varchar(10) NOT NULL,
  `StainOxideDescription` varchar(100) NOT NULL,
  `StainOxideDate` date NOT NULL DEFAULT '0000-00-00',
  `StainOxideTechDraw` varchar(300) DEFAULT NULL,
  `StainOxidePhoto1` varchar(300) DEFAULT NULL,
  `StainOxidePhoto2` varchar(300) DEFAULT NULL,
  `StainOxidePhoto3` varchar(300) DEFAULT NULL,
  `StainOxidePhoto4` varchar(300) DEFAULT NULL,
  `StainOxideNotes` text,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `stainoxideCode` (`StainOxideCode`)
) ENGINE=MyISAM AUTO_INCREMENT=83 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tbltexture
CREATE TABLE IF NOT EXISTS `tbltexture` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `TextureCode` varchar(10) NOT NULL,
  `TextureDescription` varchar(100) NOT NULL,
  `TextureDate` date NOT NULL DEFAULT '0000-00-00',
  `TextureTechDraw` varchar(300) DEFAULT NULL,
  `TexturePhoto1` varchar(300) DEFAULT NULL,
  `TexturePhoto2` varchar(300) DEFAULT NULL,
  `TexturePhoto3` varchar(300) DEFAULT NULL,
  `TexturePhoto4` varchar(300) DEFAULT NULL,
  `TextureNotes` text,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `TextureCode` (`TextureCode`)
) ENGINE=MyISAM AUTO_INCREMENT=108 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tbltools
CREATE TABLE IF NOT EXISTS `tbltools` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `ToolsCode` varchar(10) NOT NULL,
  `ToolsDescription` varchar(100) NOT NULL,
  `ToolsDate` date NOT NULL DEFAULT '0000-00-00',
  `ToolsTechDraw` varchar(300) DEFAULT NULL,
  `ToolsPhoto1` varchar(300) DEFAULT NULL,
  `ToolsPhoto2` varchar(300) DEFAULT NULL,
  `ToolsPhoto3` varchar(300) DEFAULT NULL,
  `ToolsPhoto4` varchar(300) DEFAULT NULL,
  `ToolsNotes` text,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `ToolsCode` (`ToolsCode`)
) ENGINE=MyISAM AUTO_INCREMENT=1136 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table gayafusionall.tblunit
CREATE TABLE IF NOT EXISTS `tblunit` (
  `UnitID` varchar(2) NOT NULL,
  `UnitValue` varchar(30) NOT NULL,
  PRIMARY KEY (`UnitID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
