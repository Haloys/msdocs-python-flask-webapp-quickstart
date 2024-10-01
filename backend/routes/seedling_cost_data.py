from flask import Blueprint, request, jsonify
from routes.auth import login_required
from routes.db import get_db_connection

seedling_cost_bp = Blueprint('seedling_cost', __name__)

# Function to calculate the unique identifier for a seedling cost entry
def calculate_survey_year_origin_seedling_item_name(survey_year, survey_origin, seedling_item_name):
    return f"{survey_year}_{survey_origin}_{seedling_item_name}"

# Route to get all seedling costs
@seedling_cost_bp.route('/get_seedling_costs', methods=['GET'])
@login_required
def get_seedling_costs():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT survey_origin, survey_year, seedling_item_name, seedling_item_price_lc
        FROM appSeedlingCostData
    ''')
    seedling_costs = cursor.fetchall()
    conn.close()
    return jsonify([{
        'survey_origin': s[0],
        'survey_year': s[1],
        'seedling_item_name': s[2],
        'seedling_item_price_lc': s[3]
    } for s in seedling_costs])

# Route to add a new seedling cost entry
@seedling_cost_bp.route('/add_seedling_cost', methods=['POST'])
@login_required
def add_seedling_cost():
    data = request.get_json()

    required_fields = ['survey_origin', 'survey_year', 'seedling_item_name', 'seedling_item_price_lc']
    if not all(data.get(field) for field in required_fields):
        return jsonify({'status': 'error', 'message': 'All fields are required'}), 400

    survey_origin = data['survey_origin']
    survey_year = data['survey_year']
    seedling_item_name = data['seedling_item_name']
    seedling_item_price_lc = data['seedling_item_price_lc']

    survey_year_origin_seedling_item_name = calculate_survey_year_origin_seedling_item_name(survey_year, survey_origin, seedling_item_name)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO appSeedlingCostData (survey_origin, survey_year, seedling_item_name, seedling_item_price_lc, survey_year_origin_seedling_item_name)
        VALUES (%s, %s, %s, %s, %s)
    ''', (survey_origin, survey_year, seedling_item_name, seedling_item_price_lc, survey_year_origin_seedling_item_name))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to delete a seedling cost entry
@seedling_cost_bp.route('/delete_seedling_cost', methods=['POST'])
@login_required
def delete_seedling_cost():
    data = request.get_json()
    seedling_item_name = data['seedling_item_name']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        DELETE FROM appSeedlingCostData
        WHERE seedling_item_name = %s
    ''', (seedling_item_name,))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to update a seedling cost entry
@seedling_cost_bp.route('/update_seedling_cost', methods=['POST'])
@login_required
def update_seedling_cost():
    data = request.get_json()

    required_fields = ['survey_origin', 'survey_year', 'seedling_item_name', 'seedling_item_price_lc']
    if not all(data.get(field) for field in required_fields):
        return jsonify({'status': 'error', 'message': 'All fields are required'}), 400

    survey_origin = data['survey_origin']
    survey_year = data['survey_year']
    seedling_item_name = data['seedling_item_name']
    seedling_item_price_lc = data['seedling_item_price_lc']

    survey_year_origin_seedling_item_name = calculate_survey_year_origin_seedling_item_name(survey_year, survey_origin, seedling_item_name)

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        IF NOT EXISTS (SELECT 1 FROM appSeedlingCostData WHERE seedling_item_name = %s)
        BEGIN
            INSERT INTO appSeedlingCostData (survey_origin, survey_year, seedling_item_name, seedling_item_price_lc, survey_year_origin_seedling_item_name)
            VALUES (%s, %s, %s, %s, %s)
        END
        ELSE
        BEGIN
            UPDATE appSeedlingCostData
            SET survey_origin = %s, survey_year = %s, seedling_item_price_lc = %s, survey_year_origin_seedling_item_name = %s
            WHERE seedling_item_name = %s
        END
    ''', (seedling_item_name, survey_origin, survey_year, seedling_item_price_lc, survey_year_origin_seedling_item_name,
            survey_origin, survey_year, seedling_item_price_lc, survey_year_origin_seedling_item_name, seedling_item_name))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to ingest seedling costs from a survey
@seedling_cost_bp.route('/ingest_seedling_costs', methods=['POST'])
@login_required
def ingest_seedling_costs():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT DISTINCT survey_origin, survey_year, seedlings_bought_last_year_type FROM Survey_Standardized')
    seedlings = cursor.fetchall()

    for seedling in seedlings:
        if seedling[2]:
            survey_year_origin_seedling_item_name = calculate_survey_year_origin_seedling_item_name(seedling[1], seedling[0], seedling[2])
            cursor.execute('''
                IF NOT EXISTS (SELECT 1 FROM appSeedlingCostData WHERE seedling_item_name = %s)
                BEGIN
                    INSERT INTO appSeedlingCostData (survey_origin, survey_year, seedling_item_name, survey_year_origin_seedling_item_name)
                    VALUES (%s, %s, %s, %s)
                END
            ''', (seedling[2], seedling[0], seedling[1], seedling[2], survey_year_origin_seedling_item_name))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})
