import mysql.connector
#instalar pip install mysql-connector-phyton
#algunos ya puede que lo tengan instalados pero igual hagan el proceso


def conectar():
    try:
        conexion = mysql.connector.connect(
        #agregar los datos que tengan en su mysql workbech
        user='root',
        password='7894',
        host='127.0.0.1',
        database='tallerdb',
        port='3306'
            )
        print("Conexión correcta")
        return conexion
    except mysql.connector.Error as error:
        print("Error al conectarse a la base de datos: {}".format(error))
        return None 

print(conectar())