from fastapi import FastAPI, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.sql import text

from database import get_db
from models import Cliente, Servicio, Cita, Usuario
import crud
import schemas  # Esquemas Pydantic para validación de datos

app = FastAPI()
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Puedes cambiar "*" por la URL exacta de tu frontend
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos los headers
)

@app.get("/")
def serve_index():
    return FileResponse("frontend/index.html")

# ---------------------- CLIENTES ----------------------
@app.post("/clientes/")
def crear_cliente(cliente: schemas.ClienteCreate, db: Session = Depends(get_db)):
    return crud.crear_cliente(db, cliente)

@app.get("/clientes/")
def obtener_clientes(db: Session = Depends(get_db)):
    return crud.obtener_clientes(db)

@app.get("/clientes/{id}")
def obtener_cliente_por_id(id: str, db: Session = Depends(get_db)):
    cliente = crud.obtener_cliente_id(db, id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente

# ---------------------- SERVICIOS ----------------------
@app.post("/servicios/")
def crear_servicio(servicio: schemas.ServicioCreate, db: Session = Depends(get_db)):
    return crud.crear_servicio(db, servicio)

@app.get("/servicios")
def obtener_servicios(db: Session = Depends(get_db)):
    servicios = db.execute(text("SELECT * FROM Servicio")).fetchall()
    print("SERVICIOS ENCONTRADOS:", servicios)  # 🛑 Depuración
    return servicios

@app.get("/servicios/{id}")
def obtener_servicio_por_id(id: int, db: Session = Depends(get_db)):
    servicio = crud.obtener_servicio_id(db, id)
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return servicio

# ---------------------- CITAS ----------------------
@app.post("/citas/")
def crear_cita(cita: schemas.CitaCreate, db: Session = Depends(get_db)):
    return crud.crear_cita(db, cita)

@app.get("/citas/")
def obtener_citas(db: Session = Depends(get_db)):
    return crud.obtener_citas(db)

@app.get("/citas/cliente/{id_cliente}")
def obtener_citas_por_cliente(id_cliente: str, db: Session = Depends(get_db)):
    return crud.obtener_citas_cliente(db, id_cliente)

# ---------------------- AUTENTICACIÓN USUARIOS ----------------------
@app.post("/usuarios/login")
def login_usuario(usuario: schemas.UsuarioLogin, db: Session = Depends(get_db)):
    user = crud.autenticar_usuario(db, usuario.username, usuario.contrasena)
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    return {"mensaje": "Inicio de sesión exitoso"}
