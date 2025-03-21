from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL de conexión a Railway (ajusta según tu configuración)
DATABASE_URL = "mysql+pymysql://root:zjzzCmEWWERQBsnAHLVDqKZirTcCdgBX@shortline.proxy.rlwy.net:48150/railway"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

Base = declarative_base()  # 👈 ESTA LÍNEA ES CLAVE