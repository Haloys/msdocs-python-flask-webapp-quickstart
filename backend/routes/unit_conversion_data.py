from flask import Blueprint, request, jsonify
from backend.routes.auth import login_required
from backend.routes.db import get_db_connection

unit_conversion_bp = Blueprint('unit_conversion', __name__)

# Route to get unit conversion data
@unit_conversion_bp.route('/get_unit_conversion_data', methods=['GET'])
@login_required
def get_unit_conversion_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT reported_unit_name, reported_unit_amount, reported_unit_type
        FROM appUnitConversionData
    ''')
    unit_conversion_data = cursor.fetchall()
    conn.close()
    return jsonify([{
        'reported_unit_name': u[0],
        'reported_unit_amount': u[1],
        'reported_unit_type': u[2]
    } for u in unit_conversion_data])

# Route to add unit conversion data
@unit_conversion_bp.route('/add_unit_conversion_data', methods=['POST'])
@login_required
def add_unit_conversion_data():
    data = request.get_json()

    required_fields = ['reported_unit_name', 'reported_unit_amount', 'reported_unit_type']
    if not all(data.get(field) for field in required_fields):
        return jsonify({'status': 'error', 'message': 'All fields are required'}), 400

    reported_unit_name = data['reported_unit_name']
    reported_unit_amount = data['reported_unit_amount']
    reported_unit_type = data['reported_unit_type']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO appUnitConversionData (reported_unit_name, reported_unit_amount, reported_unit_type)
        VALUES (%s, %s, %s)
    ''', (reported_unit_name, reported_unit_amount, reported_unit_type))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to delete unit conversion data
@unit_conversion_bp.route('/delete_unit_conversion_data', methods=['POST'])
@login_required
def delete_unit_conversion_data():
    data = request.get_json()
    reported_unit_name = data['reported_unit_name']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        DELETE FROM appUnitConversionData
        WHERE reported_unit_name = %s
    ''', (reported_unit_name,))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to update unit conversion data
@unit_conversion_bp.route('/update_unit_conversion_data', methods=['POST'])
@login_required
def update_unit_conversion_data():
    data = request.get_json()

    required_fields = ['reported_unit_name', 'reported_unit_amount', 'reported_unit_type']
    if not all(data.get(field) for field in required_fields):
        return jsonify({'status': 'error', 'message': 'All fields are required'}), 400

    reported_unit_name = data['reported_unit_name']
    reported_unit_amount = data['reported_unit_amount']
    reported_unit_type = data['reported_unit_type']

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        IF NOT EXISTS (SELECT 1 FROM appUnitConversionData WHERE reported_unit_name = %s)
        BEGIN
            INSERT INTO appUnitConversionData (reported_unit_name, reported_unit_amount, reported_unit_type)
            VALUES (%s, %s, %s)
        END
        ELSE
        BEGIN
            UPDATE appUnitConversionData
            SET reported_unit_amount = %s, reported_unit_type = %s
            WHERE reported_unit_name = %s
        END
    ''', (reported_unit_name, reported_unit_name, reported_unit_amount, reported_unit_type,
            reported_unit_amount, reported_unit_type, reported_unit_name))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to ingest unit conversion data
@unit_conversion_bp.route('/ingest_unit_conversion_data', methods=['POST'])
@login_required
def ingest_unit_conversion_data():
    conn = get_db_connection()
    cursor = conn.cursor()

    unit_columns = [
        'synthetic_fertilizer_last_year_1_unit',
        'synthetic_fertilizer_last_year_2_unit',
        'synthetic_fertilizer_last_year_3_unit',
        'synthetic_fertilizer_last_year_4_unit',
        'synthetic_fertilizer_last_year_other_unit',
        'organic_fertilizer_last_year_1_unit',
        'organic_fertilizer_last_year_2_unit',
        'mulch_applied_unit',
        'agrochemicals_applied_1_unit',
        'agrochemicals_applied_2_unit',
        'agrochemicals_applied_3_unit'
    ]

    for column in unit_columns:
        cursor.execute(f'SELECT DISTINCT {column} FROM Survey_Standardized')
        units = cursor.fetchall()

        for unit in units:
            if unit[0]:
                cursor.execute('''
                    IF NOT EXISTS (SELECT 1 FROM appUnitConversionData WHERE reported_unit_name = %s)
                    BEGIN
                        INSERT INTO appUnitConversionData (reported_unit_name)
                        VALUES (%s)
                    END
                ''', (unit[0], unit[0]))

    cursor.execute('SELECT DISTINCT agrochemical_item_price_unit FROM appAgrochemicalCostData')
    agrochemical_units = cursor.fetchall()
    for unit in agrochemical_units:
        if unit[0]:
            cursor.execute('''
                IF NOT EXISTS (SELECT 1 FROM appUnitConversionData WHERE reported_unit_name = %s)
                BEGIN
                    INSERT INTO appUnitConversionData (reported_unit_name)
                    VALUES (%s)
                END
            ''', (unit[0], unit[0]))

    cursor.execute('SELECT DISTINCT fertilizer_item_price_unit FROM appFertilizerCostData')
    fertilizer_units = cursor.fetchall()
    for unit in fertilizer_units:
        if unit[0]:
            cursor.execute('''
                IF NOT EXISTS (SELECT 1 FROM appUnitConversionData WHERE reported_unit_name = %s)
                BEGIN
                    INSERT INTO appUnitConversionData (reported_unit_name)
                    VALUES (%s)
                END
            ''', (unit[0], unit[0]))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})
