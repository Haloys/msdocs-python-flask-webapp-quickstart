from flask import Blueprint, request, jsonify
from routes.auth import login_required
from routes.db import get_db_connection

agrochemical_bp = Blueprint('agrochemical', __name__)

# Route to get all agrochemicals
@agrochemical_bp.route('/get_agrochemicals', methods=['GET'])
@login_required
def get_agrochemicals():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT reported_agrochemical_name, agrochemical_type, agrochemical_active_ingredient_count, agrochemical_active_ingredient_name, agrochemical_active_ingredient_percentage FROM appAgrochemicalData')
    agrochemicals = cursor.fetchall()
    conn.close()
    return jsonify([{
        'agrochemical_name': a[0],
        'agrochemical_type': a[1],
        'active_ingredient_count': a[2],
        'active_ingredient_name': a[3],
        'active_ingredient_percentage': a[4]
    } for a in agrochemicals])

# Route to add a new agrochemical
@agrochemical_bp.route('/add_agrochemical', methods=['POST'])
@login_required
def add_agrochemical():
    data = request.get_json()

    required_fields = ['agrochemical_name', 'agrochemical_type', 'active_ingredient_count', 'active_ingredient_name', 'active_ingredient_percentage']
    if not all(data.get(field) for field in required_fields):
        return jsonify({'status': 'error', 'message': 'All fields are required'}), 400

    agrochemical_name = data['agrochemical_name']
    agrochemical_type = data['agrochemical_type']
    active_ingredient_count = data['active_ingredient_count']
    active_ingredient_name = data['active_ingredient_name']
    active_ingredient_percentage = data['active_ingredient_percentage']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO appAgrochemicalData (reported_agrochemical_name, agrochemical_type, agrochemical_active_ingredient_count, agrochemical_active_ingredient_name, agrochemical_active_ingredient_percentage)
        VALUES (%s, %s, %s, %s, %s)
    ''', (agrochemical_name, agrochemical_type, active_ingredient_count, active_ingredient_name, active_ingredient_percentage))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to delete an agrochemical
@agrochemical_bp.route('/delete_agrochemical', methods=['POST'])
@login_required
def delete_agrochemical():
    data = request.get_json()
    agrochemical_name = data['agrochemical_name']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        DELETE FROM appAgrochemicalData
        WHERE reported_agrochemical_name = %s
    ''', (agrochemical_name,))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to update an agrochemical
@agrochemical_bp.route('/update_agrochemical', methods=['POST'])
@login_required
def update_agrochemical():
    data = request.get_json()

    required_fields = ['agrochemical_name', 'agrochemical_type', 'active_ingredient_count', 'active_ingredient_name', 'active_ingredient_percentage']
    if not all(data.get(field) for field in required_fields):
        return jsonify({'status': 'error', 'message': 'All fields are required'}), 400

    agrochemical_name = data['agrochemical_name']
    agrochemical_type = data['agrochemical_type']
    active_ingredient_count = data['active_ingredient_count']
    active_ingredient_name = data['active_ingredient_name']
    active_ingredient_percentage = data['active_ingredient_percentage']

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        IF NOT EXISTS (SELECT 1 FROM appAgrochemicalData WHERE reported_agrochemical_name = %s)
        BEGIN
            INSERT INTO appAgrochemicalData (reported_agrochemical_name, agrochemical_type, agrochemical_active_ingredient_count, agrochemical_active_ingredient_name, agrochemical_active_ingredient_percentage)
            VALUES (%s, %s, %s, %s, %s)
        END
        ELSE
        BEGIN
            UPDATE appAgrochemicalData
            SET agrochemical_type = %s, agrochemical_active_ingredient_count = %s, agrochemical_active_ingredient_name = %s, agrochemical_active_ingredient_percentage = %s
            WHERE reported_agrochemical_name = %s
        END
    ''', (agrochemical_name, agrochemical_name, agrochemical_type, active_ingredient_count, active_ingredient_name, active_ingredient_percentage,
            agrochemical_type, active_ingredient_count, active_ingredient_name, active_ingredient_percentage, agrochemical_name))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to ingest agrochemicals from a survey
@agrochemical_bp.route('/ingest_agrochemicals', methods=['POST'])
@login_required
def ingest_agrochemicals():
    conn = get_db_connection()
    cursor = conn.cursor()

    agrochemical_columns = [
        'agrochemicals_applied_1_name',
        'agrochemicals_applied_2_name',
        'agrochemicals_applied_3_name'
    ]

    for column in agrochemical_columns:
        cursor.execute(f'SELECT DISTINCT {column} FROM Survey_Standardized')
        agrochemicals = cursor.fetchall()

        for agrochemical in agrochemicals:
            if agrochemical[0]:
                cursor.execute('''
                    IF NOT EXISTS (SELECT 1 FROM appAgrochemicalData WHERE reported_agrochemical_name = %s)
                    BEGIN
                        INSERT INTO appAgrochemicalData (reported_agrochemical_name)
                        VALUES (%s)
                    END
                ''', (agrochemical[0], agrochemical[0]))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})
