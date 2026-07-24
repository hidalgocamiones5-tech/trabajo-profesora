import pymysql

try:
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='Fran_P789@'
    )
    with connection.cursor() as cursor:
        cursor.execute("CREATE DATABASE IF NOT EXISTS prototipo_db;")
    connection.commit()
    print("Database prototipo_db created successfully or already exists.")
except Exception as e:
    print(f"Error creating database: {e}")
finally:
    if 'connection' in locals() and connection.open:
        connection.close()
