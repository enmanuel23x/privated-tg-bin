SET NAMES utf8 ;
DROP DATABASE IF exists app;
CREATE DATABASE IF NOT EXISTS app;
USE app;
SET character_set_client = utf8mb4 ;
/*Tabla usuario*/
CREATE TABLE IF NOT EXISTS `usuario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombres` varchar(30) NOT NULL,
  `apellidos` varchar(30) NOT NULL,
  `correo` varchar(30) NOT NULL,
  `contraseña` varchar(30) NOT NULL,
  `rol` int(2) NOT NULL,
  `inicializado` int(2) NOT NULL,
  PRIMARY KEY (`id`)
  )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*Tabla organizacion*/
CREATE TABLE IF NOT EXISTS `organizacion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `id_jefe` int(11) NOT NULL,
  FOREIGN KEY (`id_jefe`) REFERENCES `usuario` (`id`),
  PRIMARY KEY (`id`)
  )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*Tabla integrantes_organizacion*/
CREATE TABLE IF NOT EXISTS `integrantes_organizacion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `nombres` varchar(40) NOT NULL,
  `id_organizacion` int(11) NOT NULL,
  `rol` varchar(30) NOT NULL,
  `activo` int(2) NOT NULL,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`),
  FOREIGN KEY (`id_organizacion`) REFERENCES `organizacion` (`id`),
  PRIMARY KEY (`id`)
  )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*Tabla aptitudes*/
CREATE TABLE IF NOT EXISTS `aptitudes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  /*Aptidudes*/
  `dev_quality` int(4) NOT NULL, 
  `dev_exp` int(4) NOT NULL,  
  `dev_on_time` int(4) NOT NULL,  
  `team_chemistry` int(4) NOT NULL,  
  `dev_errors` int(4) NOT NULL,  
  `exp_python` int(4) NOT NULL,  
  `exp_java` int(4) NOT NULL, 
  `exp_c++` int(4) NOT NULL, 
  `exp_php` int(4) NOT NULL, 
  `exp_c` int(4) NOT NULL,  
  `exp_ruby` int(4) NOT NULL,
  `exp_objective` int(4) NOT NULL,
  `exp_go` int(4) NOT NULL,
  `exp_visual` int(4) NOT NULL,
  `exp_scala` int(4) NOT NULL,
  `exp_sql` int(4) NOT NULL,
  `exp_nosql` int(4) NOT NULL,
  `exp_kotlin` int(4) NOT NULL, 
  `exp_r` int(4) NOT NULL,
  `exp_swift` int(4) NOT NULL, 
  `exp_clojure` int(4) NOT NULL, 
  `exp_perl` int(4) NOT NULL,
  `exp_rust` int(4) NOT NULL, 
  `exp_html_css`  int(4) NOT NULL,
  /*/Aptitudes*/
  FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`),
  PRIMARY KEY (`id`)
  )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*Tabla proyecto*/
CREATE TABLE IF NOT EXISTS `proyecto` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_lider` int(11) NOT NULL,
  `id_organizacion`int(11) NOT NULL,
  `tipo` int(4) NOT NULL,
  `status` int(4) NOT NULL,
  /*Requerimientos*/ 
  `python` int(4) NOT NULL,  
  `java` int(4) NOT NULL, 
  `c++` int(4) NOT NULL, 
  `php` int(4) NOT NULL, 
  `c` int(4) NOT NULL,  
  `ruby` int(4) NOT NULL,
  `objective` int(4) NOT NULL,
  `go` int(4) NOT NULL,
  `visual` int(4) NOT NULL,
  `scala` int(4) NOT NULL,
  `sql` int(4) NOT NULL,
  `nosql` int(4) NOT NULL,
  `kotlin` int(4) NOT NULL, 
  `r` int(4) NOT NULL,
  `swift` int(4) NOT NULL, 
  `clojure` int(4) NOT NULL, 
  `perl` int(4) NOT NULL,
  `rust` int(4) NOT NULL, 
  `html_css`  int(4) NOT NULL,
  /*/Requerimientos*/
  FOREIGN KEY (`id_lider`) REFERENCES `usuario` (`id`),
  FOREIGN KEY (`id_organizacion`) REFERENCES `organizacion` (`id`),
  PRIMARY KEY (`id`)
  )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*Tabla integrantes_proyectos*/
CREATE TABLE IF NOT EXISTS `integrantes_proyectos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `id_proyecto` int(11) NOT NULL,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`),
  FOREIGN KEY (`id_proyecto`) REFERENCES `proyecto` (`id`),
  PRIMARY KEY (`id`)
  )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  /*Tabla notificaciones*/
CREATE TABLE IF NOT EXISTS `notificaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_user_emisor` int(11) NOT NULL,
  `nombre_emisor` varchar(40) NOT NULL,
  `id_user_receptor` int(11) NOT NULL,
  `nombre_receptor` varchar(40) NOT NULL,
  `tipo` int(4) NOT NULL,
  `status` int(4) NOT NULL,
  `fecha` varchar(30) NOT NULL,
  `hora` varchar(30) NOT NULL,
  FOREIGN KEY (`id_user_emisor`) REFERENCES `usuario` (`id`),
  FOREIGN KEY (`id_user_receptor`) REFERENCES `usuario` (`id`),
  PRIMARY KEY (`id`)
  )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;