from database import get_db
from sqlalchemy.sql import text

def test_connection():
    # Obtiene la sesión de la base de datos
    db = next(get_db())  # Llama a la sesión directamente fuera de Depends
    
    try:
        # Verifica si la base de datos responde
        result = db.execute(text("SELECT DATABASE();"))
        print("✅ Conectado a la base de datos:", result.fetchone()[0])

        # Muestra las tablas de la base de datos
        result = db.execute(text("SHOW TABLES;"))
        print("Tablas de la base de datos:")
        for table in result.fetchall():
            print(table[0])

        # Muestra los registros de la tabla Servicio
        result = db.execute(text("SELECT * FROM Servicio;"))
        print("Registros de la tabla Servicio:")
        for record in result.fetchall():
            print(record)

    except Exception as e:
        print("❌ Error de conexión:", e)
    
    finally:
        # Cierra la sesión de la base de datos
        db.close()

test_connection()
