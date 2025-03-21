from database import get_db
from sqlalchemy.sql import text
from fastapi import Depends

def test_connection():
    db = Depends(get_db)  # Obtiene la sesión de la BD
    try:
        result = db.execute(text("SELECT DATABASE();"))  # Verifica si la BD responde
        print("✅ Conectado a la base de datos:", result.fetchone()[0])
        result = db.execute(text("SHOW TABLES;"))  # Muestra las tablas de la BD
        print("Tablas de la base de datos:")
        for table in result.fetchall():
            print(table[0])
        result = db.execute(text("SELECT * FROM Servicio;"))  # Muestra los registros de la tabla Cliente
        print("Registros de la tabla Servicio:")
        for record in result.fetchall():
            print(record)
    except Exception as e:
        print("❌ Error de conexión:", e)
    finally:
        db.close()

test_connection()