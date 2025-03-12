from db import conectar

# CRUD para Clientes
def crear_cliente(cedula: int, nombre: str, telefono: str, correo: str):
    conexion = conectar()
    cursor = conexion.cursor()

    try:
        # Intentar insertar el cliente
        sql = "INSERT INTO Cliente (id, nombre, telefono, correo) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (cedula, nombre, telefono, correo))
        conexion.commit()
        return cursor.lastrowid  # Devuelve el ID si se insertó correctamente
    except:
        return None  # Devuelve None si hubo algún problema
    finally:
        conexion.close()


def obtener_clientes():
    conexion = conectar()
    cursor = conexion.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Cliente")
    clientes = cursor.fetchall()
    conexion.close()
    return clientes



# CRUD para Servicios
def crear_servicio(servicio):
    conexion = conectar()
    cursor = conexion.cursor()
    sql = "INSERT INTO Servicio (nombre, descripcion, costo, duracion) VALUES (%s, %s, %s, %s)"
    cursor.execute(sql, (servicio.nombre, servicio.descripcion, servicio.costo, servicio.duracion))
    conexion.commit()
    conexion.close()
    return cursor.lastrowid

def obtener_servicio_id(id: int):
    conexion = conectar()
    cursor = conexion.cursor(dictionary=True)
    cursor.execute("SELECT * FROM servicio WHERE id = %s", (id,))
    servicio = cursor.fetchone()
    conexion.close()
    return servicio

def obtener_servicios():
    conexion = conectar()
    cursor = conexion.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Servicio")
    servicios = cursor.fetchall()
    conexion.close()
    return servicios

# Validar disponibilidad de citas (máximo 12)
def verificar_disponibilidad(fecha):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("SELECT COUNT(*) FROM Cita WHERE fecha = %s", (fecha,))
    count = cursor.fetchone()[0]
    conexion.close()
    return count < 12

# CRUD para Citas
def crear_cita(id_cliente, id_servicio,total,duracion_total,fecha):
    if not verificar_disponibilidad(fecha):
        return {"error": "No se pueden agendar más citas en este horario."}

    cliente = obtener_cliente_id(id_cliente)
    if cliente != None:
        conexion = conectar()
        cursor = conexion.cursor()
        sql = "INSERT INTO Cita (id_cliente, id_servicio, total, duracion_total, fecha) VALUES (%s, %s, %s, %s, %s)"
        cursor.execute(sql, (id_cliente, id_servicio,total,duracion_total,fecha))
        conexion.commit()
        conexion.close()
    else:
        return {"error": "Cliente no encontrado"}

    return {"mensaje": "Cita creada correctamente"}


def obtener_citas():
    conexion = conectar()
    cursor = conexion.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Cita")
    citas = cursor.fetchall()
    conexion.close()
    return citas

def obtener_citas_cliente(id_cliente):
    conexion = conectar()
    cursor = conexion.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Cita WHERE id_cliente = %s", (id_cliente,))
    citas = cursor.fetchall()
    conexion.close()
    return citas


def obtener_cliente_id(id):
    conexion = conectar()
    cursor = conexion.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Cliente WHERE id = %s",(id,))
    cliente = cursor.fetchone()
    if cliente is not None:
        return cliente
    else:
        return None


