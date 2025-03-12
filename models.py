from pydantic import BaseModel
from datetime import date

class Cliente(BaseModel):
    id: int #cedula
    nombre: str
    telefono: str
    correo: str



class Servicio(BaseModel):
    nombre: str
    descripcion: str
    costo: float
    duracion: int

class Cita(BaseModel):
    id_cliente: int
    id_servicio: int
    total: float
    duracion_total: int
    fecha: date

class CitaRequest(BaseModel):
    id_cliente: int
    id_servicio: int
    total: float
    duracion_total: int
    fecha: str  # O datetime si lo manejas así en models.py




