CREATE DATABASE IF NOT EXISTS TallerDB;
USE TallerDB;
CREATE TABLE Cliente (
    id VARCHAR(15) PRIMARY KEY,  -- Cédula como ID
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(100) NOT NULL
);

CREATE TABLE Servicio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    costo FLOAT NOT NULL,
    duracion INT NOT NULL
);

CREATE TABLE Cita (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente VARCHAR(15) NOT NULL,
    id_servicio INT NOT NULL,
    total FLOAT NOT NULL,
    duracion_total INT NOT NULL,
    fecha DATETIME NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id) ON DELETE CASCADE,
    FOREIGN KEY (id_servicio) REFERENCES Servicio(id) ON DELETE CASCADE
);
