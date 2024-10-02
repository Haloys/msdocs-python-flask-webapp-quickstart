from flask import Blueprint, request, jsonify
from backend.routes.auth import login_required
from backend.routes.db import get_db_connection

fertilizer_bp = Blueprint('fertilizer', __name__)

# Route to get all fertilizers
@fertilizer_bp.route('/get_fertilizers', methods=['GET'])
##@login_required
def get_fertilizers():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT fertilizer_reported_name, fertilizer_n_content, fertilizer_p_content, fertilizer_k_content, fertilizer_type FROM appFertilizerData')
    fertilizers = cursor.fetchall()
    conn.close()
    return jsonify([{
        'fertilizer_name': f[0],
        'n_content': f[1],
        'p_content': f[2],
        'k_content': f[3],
        'f_type': f[4]
    } for f in fertilizers])

# Route to add a new fertilizer
@fertilizer_bp.route('/add_fertilizer', methods=['POST'])
##@login_required
def add_fertilizer():
    data = request.get_json()
    fertilizer_name = data['fertilizer_name']
    n_content = data['n_content'] or None
    p_content = data['p_content'] or None
    k_content = data['k_content'] or None
    f_type = data['f_type'] or None

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO appFertilizerData (fertilizer_reported_name, fertilizer_n_content, fertilizer_p_content, fertilizer_k_content, fertilizer_type)
        VALUES (%s, %s, %s, %s, %s)
    ''', (fertilizer_name, n_content, p_content, k_content, f_type))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to delete a fertilizer
@fertilizer_bp.route('/delete_fertilizer', methods=['POST'])
##@login_required
def delete_fertilizer():
    data = request.get_json()
    fertilizer_name = data['fertilizer_name']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        DELETE FROM appFertilizerData
        WHERE fertilizer_reported_name = %s
    ''', (fertilizer_name,))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to update a fertilizer
@fertilizer_bp.route('/update_fertilizer', methods=['POST'])
##@login_required
def update_fertilizer():
    data = request.get_json()
    fertilizer_name = data['fertilizer_name']
    n_content = data['n_content'] or None
    p_content = data['p_content'] or None
    k_content = data['k_content'] or None
    f_type = data['f_type'] or None

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        IF NOT EXISTS (SELECT 1 FROM appFertilizerData WHERE fertilizer_reported_name = %s)
        BEGIN
            INSERT INTO appFertilizerData (fertilizer_reported_name, fertilizer_n_content, fertilizer_p_content, fertilizer_k_content, fertilizer_type)
            VALUES (%s, %s, %s, %s, %s)
        END
        ELSE
        BEGIN
            UPDATE appFertilizerData
            SET fertilizer_n_content = %s, fertilizer_p_content = %s, fertilizer_k_content = %s, fertilizer_type = %s
            WHERE fertilizer_reported_name = %s
        END
    ''', (fertilizer_name, fertilizer_name, n_content, p_content, k_content, f_type,
            n_content, p_content, k_content, f_type, fertilizer_name))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to ingest fertilizers from a survey
@fertilizer_bp.route('/ingest_fertilizers', methods=['POST'])
##@login_required
def ingest_fertilizers():
    conn = get_db_connection()
    cursor = conn.cursor()

    fertilizer_columns = [
        'synthetic_fertilizer_last_year_1_name',
        'synthetic_fertilizer_last_year_2_name',
        'synthetic_fertilizer_last_year_3_name',
        'synthetic_fertilizer_last_year_4_name',
        'synthetic_fertilizer_last_year_other_name',
        'organic_fertilizer_last_year_1_name',
        'organic_fertilizer_last_year_2_name'
    ]

    for column in fertilizer_columns:
        cursor.execute(f'SELECT DISTINCT {column} FROM Survey_Standardized')
        fertilizers = cursor.fetchall()

        for fertilizer in fertilizers:
            if fertilizer[0]:
                cursor.execute('''
                    IF NOT EXISTS (SELECT 1 FROM appFertilizerData WHERE fertilizer_reported_name = %s)
                    BEGIN
                        INSERT INTO appFertilizerData (fertilizer_reported_name)
                        VALUES (%s)
                    END
                ''', (fertilizer[0], fertilizer[0]))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})
