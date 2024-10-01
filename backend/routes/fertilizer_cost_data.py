from flask import Blueprint, request, jsonify
from routes.auth import login_required
from routes.db import get_db_connection

fertilizer_cost_bp = Blueprint('fertilizer_cost', __name__)

# Function to calculate the unique identifier for a fertilizer cost entry
def calculate_survey_year_origin_fertilizer_item_name(survey_year, survey_origin, fertilizer_item_name):
    return f"_{survey_year}_{survey_origin}_{fertilizer_item_name}"

# Route to get all fertilizer costs
@fertilizer_cost_bp.route('/get_fertilizer_costs', methods=['GET'])
@login_required
def get_fertilizer_costs():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT survey_origin, survey_year, fertilizer_item_name, fertilizer_item_price_lc, fertilizer_item_price_unit 
        FROM appFertilizerCostData
    ''')
    fertilizer_costs = cursor.fetchall()
    conn.close()
    return jsonify([{
        'survey_origin': f[0],
        'survey_year': f[1],
        'fertilizer_item_name': f[2],
        'fertilizer_item_price_lc': f[3],
        'fertilizer_item_price_unit': f[4]
    } for f in fertilizer_costs])

# Route to add a new fertilizer cost entry
@fertilizer_cost_bp.route('/add_fertilizer_cost', methods=['POST'])
@login_required
def add_fertilizer_cost():
    data = request.get_json()

    required_fields = ['survey_origin', 'survey_year', 'fertilizer_item_name', 'fertilizer_item_price_lc', 'fertilizer_item_price_unit']
    if not all(data.get(field) for field in required_fields):
        return jsonify({'status': 'error', 'message': 'All fields are required'}), 400

    survey_origin = data['survey_origin']
    survey_year = data['survey_year']
    fertilizer_item_name = data['fertilizer_item_name']
    fertilizer_item_price_lc = data['fertilizer_item_price_lc']
    fertilizer_item_price_unit = data['fertilizer_item_price_unit']

    survey_year_origin_fertilizer_item_name = calculate_survey_year_origin_fertilizer_item_name(survey_year, survey_origin, fertilizer_item_name)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO appFertilizerCostData (survey_origin, survey_year, fertilizer_item_name, fertilizer_item_price_lc, fertilizer_item_price_unit, survey_year_origin_fertilizer_item_name)
        VALUES (%s, %s, %s, %s, %s, %s)
    ''', (survey_origin, survey_year, fertilizer_item_name, fertilizer_item_price_lc, fertilizer_item_price_unit, survey_year_origin_fertilizer_item_name))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to delete a fertilizer cost entry
@fertilizer_cost_bp.route('/delete_fertilizer_cost', methods=['POST'])
@login_required
def delete_fertilizer_cost():
    data = request.get_json()
    fertilizer_item_name = data['fertilizer_item_name']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        DELETE FROM appFertilizerCostData
        WHERE fertilizer_item_name = %s
    ''', (fertilizer_item_name,))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to update a fertilizer cost entry
@fertilizer_cost_bp.route('/update_fertilizer_cost', methods=['POST'])
@login_required
def update_fertilizer_cost():
    data = request.get_json()

    required_fields = ['survey_origin', 'survey_year', 'fertilizer_item_name', 'fertilizer_item_price_lc', 'fertilizer_item_price_unit']
    if not all(data.get(field) for field in required_fields):
        return jsonify({'status': 'error', 'message': 'All fields are required'}), 400

    survey_origin = data['survey_origin']
    survey_year = data['survey_year']
    fertilizer_item_name = data['fertilizer_item_name']
    fertilizer_item_price_lc = data['fertilizer_item_price_lc']
    fertilizer_item_price_unit = data['fertilizer_item_price_unit']

    survey_year_origin_fertilizer_item_name = calculate_survey_year_origin_fertilizer_item_name(survey_year, survey_origin, fertilizer_item_name)

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        IF NOT EXISTS (SELECT 1 FROM appFertilizerCostData WHERE fertilizer_item_name = %s)
        BEGIN
            INSERT INTO appFertilizerCostData (survey_origin, survey_year, fertilizer_item_name, fertilizer_item_price_lc, fertilizer_item_price_unit, survey_year_origin_fertilizer_item_name)
            VALUES (%s, %s, %s, %s, %s, %s)
        END
        ELSE
        BEGIN
            UPDATE appFertilizerCostData
            SET survey_origin = %s, survey_year = %s, fertilizer_item_price_lc = %s, fertilizer_item_price_unit = %s, survey_year_origin_fertilizer_item_name = %s
            WHERE fertilizer_item_name = %s
        END
    ''', (fertilizer_item_name, survey_origin, survey_year, fertilizer_item_price_lc, fertilizer_item_price_unit, survey_year_origin_fertilizer_item_name,
            survey_origin, survey_year, fertilizer_item_price_lc, fertilizer_item_price_unit, survey_year_origin_fertilizer_item_name, fertilizer_item_name))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to ingest fertilizer costs from a survey
@fertilizer_cost_bp.route('/ingest_fertilizer_costs', methods=['POST'])
@login_required
def ingest_fertilizer_costs():
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
        cursor.execute(f'SELECT DISTINCT survey_origin, survey_year, {column} FROM Survey_Standardized')
        fertilizers = cursor.fetchall()

        for fertilizer in fertilizers:
            if fertilizer[2]:
                survey_year_origin_fertilizer_item_name = calculate_survey_year_origin_fertilizer_item_name(fertilizer[1], fertilizer[0], fertilizer[2])
                cursor.execute('''
                    IF NOT EXISTS (SELECT 1 FROM appFertilizerCostData WHERE fertilizer_item_name = %s)
                    BEGIN
                        INSERT INTO appFertilizerCostData (survey_origin, survey_year, fertilizer_item_name, survey_year_origin_fertilizer_item_name)
                        VALUES (%s, %s, %s, %s)
                    END
                ''', (fertilizer[2], fertilizer[0], fertilizer[1], fertilizer[2], survey_year_origin_fertilizer_item_name))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})
