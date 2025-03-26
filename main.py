from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.sql import text

from database import get_db
import schemas  # Esquemas Pydantic para validación de datos
import crud

app = FastAPI()

# Middleware para CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ruta para servir la página de inicio
@app.get("/")
def serve_index():
    return FileResponse("frontend/index.html")

# Función para obtener sesión de base de datos
def get_db_session():
    return next(get_db())

# ---------------------- CLIENTES ----------------------
@app.post("/clientes/")
def crear_cliente(cliente: schemas.ClienteCreate):
    db = get_db_session()
    nuevo_cliente = crud.crear_cliente(db, cliente)
    db.close()
    return nuevo_cliente

@app.get("/clientes/")
def obtener_clientes():
    db = get_db_session()
    clientes = crud.obtener_clientes(db)
    db.close()
    return clientes

@app.get("/clientes/{id}")
def obtener_cliente_por_id(id: int):
    db = get_db_session()
    cliente = crud.obtener_cliente_id(db, id)
    if not cliente:
        db.close()
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    db.close()
    return cliente

# ---------------------- SERVICIOS ----------------------
@app.post("/servicios/")
def crear_servicio(servicio: schemas.ServicioCreate):
    db = get_db_session()
    nuevo_servicio = crud.crear_servicio(db, servicio)
    db.close()
    return nuevo_servicio

@app.get("/servicios/")
def obtener_servicios():
    db = get_db_session()
    result = db.execute(text("SELECT * FROM Servicio"))
    servicios = result.fetchall()
    db.close()
    return [dict(row._mapping) for row in servicios]


@app.get("/servicios/{id}")
def obtener_servicio_por_id(id: int):
    db = get_db_session()
    servicio = crud.obtener_servicio_id(db, id)
    if not servicio:
        db.close()
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    db.close()
    return servicio
# ----- carros -----
@app.get("/carros/")
def obtener_carros():
    db = get_db_session()
    result = db.execute(text("SELECT * FROM Carro"))
    carros = result.fetchall()
    db.close()
    return [dict(row._mapping) for row in carros]

#obtener carro por placa
@app.get("/carros/{placa}")
def obtener_carro_por_placa(placa: str):
    db = get_db_session()
    carro = crud.obtener_carro_placa(db, placa)
    return carro










# ---------------------- CITAS ----------------------
@app.post("/citas/")
def crear_cita(cita: schemas.CitaCreate):
    db = get_db_session()
    nueva_cita = crud.crear_cita(db, cita)
    db.close()
    return nueva_cita

@app.get("/citas/")
def obtener_citas():
    db = get_db_session()
    citas = crud.obtener_citas(db)
    db.close()
    return citas

@app.get("/citas/cliente/{id_cliente}")
def obtener_citas_por_cliente(id_cliente: int):
    db = get_db_session()
    citas = crud.obtener_citas_cliente(db, id_cliente)
    if not citas:
        db.close()
        raise HTTPException(status_code=404, detail="No se encontraron citas para este cliente")
    db.close()
    return citas

# ---------------------- USUARIOS ----------------------
@app.post("/usuarios/login")
def login_usuario(usuario: schemas.UsuarioLogin):
    db = get_db_session()
    user = crud.autenticar_usuario(db, usuario.username, usuario.contrasena)
    if not user:
        db.close()
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    db.close()
    return {"mensaje": "Inicio de sesión exitoso"}


app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
