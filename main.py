from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from models import Cliente, Servicio, Cita, CitaRequest
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

import crud

app = FastAPI()
app.mount("/static", StaticFiles(directory="frontend", html=True), name="frontend")

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

@app.post("/clientes/")
async def api_crear_cliente(cliente: Cliente):
    resultado = crud.crear_cliente(cliente.id, cliente.nombre, cliente.telefono, cliente.correo)
    
    if resultado is None:
        return {"mensaje": "No se pudo crear el cliente"}
    
    return {"mensaje": "Cliente creado con éxito", "id": resultado}

#buscar cliente por id
@app.get("/clientes/{id}")
def buscar_cliente_por_id(id: int):
    cliente = crud.obtener_cliente_id(id)
    if cliente is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente


@app.get("/clientes/")
def obtener_clientes():
    return crud.obtener_clientes()

# Rutas para Servicios
@app.post("/servicios/")
def crear_servicio(servicio: Servicio):
    return {"id": crud.crear_servicio(servicio)}

@app.get("/servicios/")
def obtener_servicios():
    return crud.obtener_servicios()

@app.get("/servicios/{id}")
def obtener_servicio_por_id(id: int):
    servicio = crud.obtener_servicio_id(id)
    if servicio is None:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return servicio




@app.post("/citas/")
def crear_cita(cita: CitaRequest):

    resultado = crud.crear_cita(
        cita.id_cliente, cita.id_servicio, cita.total, cita.duracion_total, cita.fecha
    )
    if "error" in resultado:
        raise HTTPException(status_code=400, detail=resultado["error"])
    return resultado

# Obtener todas las citas
@app.get("/citas/")
def obtener_citas():
    return crud.obtener_citas()


# Obtener citas por cliente
@app.get("/citas/cliente/{id_cliente}")
def obtener_citas_por_cliente(id_cliente: int):
    return crud.obtener_citas_cliente(id_cliente)






   