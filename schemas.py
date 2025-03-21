from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Esquema para Cliente
class ClienteBase(BaseModel):
    id: str
    nombre: str
    telefono: str
    direccion: str

class ClienteCreate(ClienteBase):
    pass

class ClienteResponse(ClienteBase):
    class Config:
        from_attributes = True

# Esquema para Servicio
class ServicioBase(BaseModel):
    nombre: str
    descripcion: str
    costo: float

class ServicioCreate(ServicioBase):
    pass

class ServicioResponse(ServicioBase):
    id: int
    class Config:
        from_attributes = True

# Esquema para Carro
class CarroBase(BaseModel):
    modelo: str
    marca: str
    placa: str

class CarroCreate(CarroBase):
    pass

class CarroResponse(CarroBase):
    id: int
    class Config:
        from_attributes = True

# Esquema para Cita
class CitaBase(BaseModel):
    id_cliente: str
    id_servicio: int
    id_carro: int
    total: float
    duracion_total: int
    fecha: datetime

class CitaCreate(CitaBase):
    pass

class CitaResponse(CitaBase):
    id: int
    class Config:
        from_attributes = True

# Esquema para Usuario
class UsuarioBase(BaseModel):
    username: str
    tipo_usuario: str

class UsuarioCreate(UsuarioBase):
    contrasena: str

class UsuarioResponse(UsuarioBase):
    id: int
    class Config:
        from_attributes = True

class UsuarioLogin(BaseModel):
    username: str
    contrasena: str

class ServicioSchema(BaseModel):
    id: int
    nombre: str
    descripcion: str
    costo: float

    class Config:
        from_attributes = True  # Asegura compatibilidad con SQLAlchemy