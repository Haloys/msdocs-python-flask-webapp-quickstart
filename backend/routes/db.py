import pymssql

# Database connection details
server = 'sucafina-we-impact-sqlsrv-01.database.windows.net'
database = 'sucafina-we-impact-db-01'
username = 'impactsqladm'
password = """zzkp'"7)B4d:2;mC"""

def get_db_connection():
    # Establish a connection to the database
    conn = pymssql.connect(server=server, user=username, password=password, database=database)
    return conn