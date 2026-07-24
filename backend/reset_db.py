import pymysql

try:
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='Fran_P789@'
    )
    with connection.cursor() as cursor:
        cursor.execute("DROP DATABASE IF EXISTS prototipo_db;")
        cursor.execute("CREATE DATABASE prototipo_db;")
    connection.commit()
    print("Database prototipo_db reset successfully.")
except Exception as e:
    print(f"Error resetting database: {e}")
finally:
    if 'connection' in locals() and connection.open:
        connection.close()
