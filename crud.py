from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from models import Cliente, Servicio, Cita, Carro
from schemas import ClienteCreate, ServicioCreate, CitaCreate, ServicioSchema

# ---------------- CLIENTES ----------------
def crear_cliente(db: Session, cliente: ClienteCreate):
    nuevo_cliente = Cliente(**cliente.dict())
    db.add(nuevo_cliente)
    db.commit()
    db.refresh(nuevo_cliente)
    return nuevo_cliente

def obtener_clientes(db: Session):
    return db.query(Cliente).all()

def obtener_cliente_id(db: Session, id: int):
    return db.query(Cliente).filter(Cliente.id == id).first()

# ---------------- SERVICIOS ----------------
def crear_servicio(db: Session, servicio: ServicioCreate):
    nuevo_servicio = Servicio(**servicio.dict())
    db.add(nuevo_servicio)
    db.commit()
    db.refresh(nuevo_servicio)
    return nuevo_servicio

def get_servicios(db: Session):
    return db.query(Servicio).all()

def obtener_servicio_id(db: Session, id: int):
    return db.query(Servicio).filter(Servicio.id == id).first()

# ---------------- CITAS ----------------
def verificar_disponibilidad(db: Session, fecha: str):
    count = db.query(Cita).filter(Cita.fecha == fecha).count()
    return count < 12

def crear_cita(db: Session, cita: CitaCreate):
    if not verificar_disponibilidad(db, cita.fecha):
        return {"error": "No se pueden agendar más citas en este horario."}
    
    cliente = obtener_cliente_id(db, cita.id_cliente)
    if not cliente:
        return {"error": "Cliente no encontrado"}
    
    nueva_cita = Cita(**cita.dict())
    db.add(nueva_cita)
    db.commit()
    db.refresh(nueva_cita)
    return nueva_cita

def obtener_citas(db: Session):
    return db.query(Cita).all()

def obtener_citas_cliente(db: Session, id_cliente: int):
    return db.query(Cita).filter(Cita.id_cliente == id_cliente).all()

def obtener_citas_fecha(db: Session, fecha: str):
    return db.query(Cita).filter(func.date(Cita.fecha) == fecha).all()

# ----- carros
def obtener_carro_id(db: Session, id: int):
    return db.query(Carro).filter(Carro.id == id).first()

def obtener_carro_placa(db: Session, placa: str):
    return db.query(Carro).filter(Carro.placa == placa).first()

