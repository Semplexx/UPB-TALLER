from database import Base
from sqlalchemy import Column, Integer, String, Float, Text, Enum, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base

class Cliente(Base):
    __tablename__ = "Cliente"
    id = Column(String(15), primary_key=True)
    nombre = Column(String(100), nullable=False)
    telefono = Column(String(20), nullable=False)
    direccion = Column(String(100), nullable=False)

class Servicio(Base):
    __tablename__ = "Servicio"
    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=False)
    costo = Column(Float, nullable=False)

class Carro(Base):
    __tablename__ = "Carro"
    id = Column(Integer, primary_key=True, autoincrement=True)
    modelo = Column(String(15), nullable=False)
    marca = Column(String(15), nullable=False)
    placa = Column(String(6), nullable=False)

class Cita(Base):
    __tablename__ = "Cita"
    id = Column(Integer, primary_key=True, autoincrement=True)
    id_cliente = Column(String(15), ForeignKey("Cliente.id", ondelete="CASCADE"), nullable=False)
    id_servicio = Column(Integer, ForeignKey("Servicio.id", ondelete="CASCADE"), nullable=False)
    id_carro = Column(Integer, ForeignKey("Carro.id", ondelete="CASCADE"), nullable=False)
    total = Column(Float, nullable=False)
    duracion_total = Column(Integer, nullable=False)
    fecha = Column(DateTime, nullable=False)

class Usuario(Base):
    __tablename__ = "Usuario"
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    contrasena = Column(String(255), nullable=False)  # Contraseña hasheada
    tipo_usuario = Column(Enum('ADMIN', 'USER'), nullable=False)
