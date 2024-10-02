from flask import Blueprint, request, jsonify
from backend.routes.auth import login_required
from backend.routes.db import get_db_connection

agrochemical_cost_bp = Blueprint('agrochemical_cost', __name__)

# Function to calculate the unique identifier for agrochemical cost data
def calculate_survey_year_origin_agrochemical_item_name(survey_year, survey_origin, agrochemical_item_name):
    return f"_{survey_year}_{survey_origin}_{agrochemical_item_name}"

# Route to get all agrochemical costs
@agrochemical_cost_bp.route('/get_agrochemical_costs', methods=['GET'])
@login_required
def get_agrochemical_costs():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT survey_origin, survey_year, agrochemical_item_name, agrochemical_item_price_lc, agrochemical_item_price_unit
        FROM appAgrochemicalCostData
    ''')
    agrochemical_costs = cursor.fetchall()
    conn.close()
    return jsonify([{
        'survey_origin': a[0],
        'survey_year': a[1],
        'agrochemical_item_name': a[2],
        'agrochemical_item_price_lc': a[3],
        'agrochemical_item_price_unit': a[4]
    } for a in agrochemical_costs])

# Route to add a new agrochemical cost
@agrochemical_cost_bp.route('/add_agrochemical_cost', methods=['POST'])
@login_required
def add_agrochemical_cost():
    data = request.get_json()

    required_fields = ['survey_origin', 'survey_year', 'agrochemical_item_name', 'agrochemical_item_price_lc', 'agrochemical_item_price_unit']
    if not all(data.get(field) for field in required_fields):
        return jsonify({'status': 'error', 'message': 'All fields are required'}), 400

    survey_origin = data['survey_origin']
    survey_year = data['survey_year']
    agrochemical_item_name = data['agrochemical_item_name']
    agrochemical_item_price_lc = data['agrochemical_item_price_lc']
    agrochemical_item_price_unit = data['agrochemical_item_price_unit']

    survey_year_origin_agrochemical_item_name = calculate_survey_year_origin_agrochemical_item_name(survey_year, survey_origin, agrochemical_item_name)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO appAgrochemicalCostData (survey_origin, survey_year, agrochemical_item_name, agrochemical_item_price_lc, agrochemical_item_price_unit, survey_year_origin_agrochemical_item_name)
        VALUES (%s, %s, %s, %s, %s, %s)
    ''', (survey_origin, survey_year, agrochemical_item_name, agrochemical_item_price_lc, agrochemical_item_price_unit, survey_year_origin_agrochemical_item_name))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to delete an agrochemical cost
@agrochemical_cost_bp.route('/delete_agrochemical_cost', methods=['POST'])
@login_required
def delete_agrochemical_cost():
    data = request.get_json()
    agrochemical_item_name = data['agrochemical_item_name']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        DELETE FROM appAgrochemicalCostData
        WHERE agrochemical_item_name = %s
    ''', (agrochemical_item_name,))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to update an agrochemical cost
@agrochemical_cost_bp.route('/update_agrochemical_cost', methods=['POST'])
@login_required
def update_agrochemical_cost():
    data = request.get_json()

    required_fields = ['survey_origin', 'survey_year', 'agrochemical_item_name', 'agrochemical_item_price_lc', 'agrochemical_item_price_unit']
    if not all(data.get(field) for field in required_fields):
        return jsonify({'status': 'error', 'message': 'All fields are required'}), 400

    survey_origin = data['survey_origin']
    survey_year = data['survey_year']
    agrochemical_item_name = data['agrochemical_item_name']
    agrochemical_item_price_lc = data['agrochemical_item_price_lc']
    agrochemical_item_price_unit = data['agrochemical_item_price_unit']

    survey_year_origin_agrochemical_item_name = calculate_survey_year_origin_agrochemical_item_name(survey_year, survey_origin, agrochemical_item_name)

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        IF NOT EXISTS (SELECT 1 FROM appAgrochemicalCostData WHERE agrochemical_item_name = %s)
        BEGIN
            INSERT INTO appAgrochemicalCostData (survey_origin, survey_year, agrochemical_item_name, agrochemical_item_price_lc, agrochemical_item_price_unit, survey_year_origin_agrochemical_item_name)
            VALUES (%s, %s, %s, %s, %s, %s)
        END
        ELSE
        BEGIN
            UPDATE appAgrochemicalCostData
            SET survey_origin = %s, survey_year = %s, agrochemical_item_price_lc = %s, agrochemical_item_price_unit = %s, survey_year_origin_agrochemical_item_name = %s
            WHERE agrochemical_item_name = %s
        END
    ''', (agrochemical_item_name, survey_origin, survey_year, agrochemical_item_price_lc, agrochemical_item_price_unit, survey_year_origin_agrochemical_item_name,
            survey_origin, survey_year, agrochemical_item_price_lc, agrochemical_item_price_unit, survey_year_origin_agrochemical_item_name, agrochemical_item_name))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to ingest agrochemical costs from a survey
@agrochemical_cost_bp.route('/ingest_agrochemical_costs', methods=['POST'])
@login_required
def ingest_agrochemical_costs():
    conn = get_db_connection()
    cursor = conn.cursor()

    agrochemical_columns = [
        'agrochemicals_applied_1_name',
        'agrochemicals_applied_2_name',
        'agrochemicals_applied_3_name'
    ]

    for column in agrochemical_columns:
        cursor.execute(f'SELECT DISTINCT survey_origin, survey_year, {column} FROM Survey_Standardized')
        agrochemicals = cursor.fetchall()

        for agrochemical in agrochemicals:
            if agrochemical[2]:
                survey_year_origin_agrochemical_item_name = calculate_survey_year_origin_agrochemical_item_name(agrochemical[1], agrochemical[0], agrochemical[2])
                cursor.execute('''
                    IF NOT EXISTS (SELECT 1 FROM appAgrochemicalCostData WHERE agrochemical_item_name = %s)
                    BEGIN
                        INSERT INTO appAgrochemicalCostData (survey_origin, survey_year, agrochemical_item_name, survey_year_origin_agrochemical_item_name)
                        VALUES (%s, %s, %s, %s)
                    END
                ''', (agrochemical[2], agrochemical[0], agrochemical[1], agrochemical[2], survey_year_origin_agrochemical_item_name))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})
