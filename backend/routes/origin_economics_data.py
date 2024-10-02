from flask import Blueprint, request, jsonify
from backend.routes.auth import login_required
from backend.routes.db import get_db_connection

origin_economics_bp = Blueprint('origin_economics', __name__)

# Function to calculate the survey year and origin combination
def calculate_survey_year_origin(survey_year, survey_origin):
    return f"{survey_year}_{survey_origin}"

# Route to get origin economics data
@origin_economics_bp.route('/get_origin_economics_data', methods=['GET'])
@login_required
def get_origin_economics_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT survey_origin, survey_year, origin_living_income_benchmark_lc, origin_currency, origin_currency_to_usd 
        FROM appOriginEconomicsData
    ''')
    origin_economics_data = cursor.fetchall()
    conn.close()
    return jsonify([{
        'survey_origin': o[0],
        'survey_year': o[1],
        'origin_living_income_benchmark_lc': o[2],
        'origin_currency': o[3],
        'origin_currency_to_usd': o[4]
    } for o in origin_economics_data])

# Route to add origin economics data
@origin_economics_bp.route('/add_origin_economics_data', methods=['POST'])
@login_required
def add_origin_economics_data():
    data = request.get_json()

    required_fields = ['survey_origin', 'survey_year', 'origin_living_income_benchmark_lc', 'origin_currency', 'origin_currency_to_usd']
    if not all(data.get(field) for field in required_fields):
        return jsonify({'status': 'error', 'message': 'All fields are required'}), 400

    survey_origin = data['survey_origin']
    survey_year = data['survey_year']
    origin_living_income_benchmark_lc = data['origin_living_income_benchmark_lc']
    origin_currency = data['origin_currency']
    origin_currency_to_usd = data['origin_currency_to_usd']

    survey_year_origin = calculate_survey_year_origin(survey_year, survey_origin)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO appOriginEconomicsData (survey_origin, survey_year, origin_living_income_benchmark_lc, origin_currency, origin_currency_to_usd, survey_year_origin)
        VALUES (%s, %s, %s, %s, %s, %s)
    ''', (survey_origin, survey_year, origin_living_income_benchmark_lc, origin_currency, origin_currency_to_usd, survey_year_origin))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to delete origin economics data
@origin_economics_bp.route('/delete_origin_economics_data', methods=['POST'])
@login_required
def delete_origin_economics_data():
    data = request.get_json()
    survey_year_origin = data['survey_year_origin']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        DELETE FROM appOriginEconomicsData
        WHERE survey_year_origin = %s
    ''', (survey_year_origin,))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to update origin economics data
@origin_economics_bp.route('/update_origin_economics_data', methods=['POST'])
@login_required
def update_origin_economics_data():
    data = request.get_json()

    required_fields = ['survey_origin', 'survey_year', 'origin_living_income_benchmark_lc', 'origin_currency', 'origin_currency_to_usd']
    if not all(data.get(field) for field in required_fields):
        return jsonify({'status': 'error', 'message': 'All fields are required'}), 400

    survey_origin = data['survey_origin']
    survey_year = data['survey_year']
    origin_living_income_benchmark_lc = data['origin_living_income_benchmark_lc']
    origin_currency = data['origin_currency']
    origin_currency_to_usd = data['origin_currency_to_usd']

    survey_year_origin = calculate_survey_year_origin(survey_year, survey_origin)

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        IF NOT EXISTS (SELECT 1 FROM appOriginEconomicsData WHERE survey_year_origin = %s)
        BEGIN
            INSERT INTO appOriginEconomicsData (survey_origin, survey_year, origin_living_income_benchmark_lc, origin_currency, origin_currency_to_usd, survey_year_origin)
            VALUES (%s, %s, %s, %s, %s, %s)
        END
        ELSE
        BEGIN
            UPDATE appOriginEconomicsData
            SET survey_origin = %s, survey_year = %s, origin_living_income_benchmark_lc = %s, origin_currency = %s, origin_currency_to_usd = %s
            WHERE survey_year_origin = %s
        END
    ''', (survey_year_origin, survey_origin, survey_year, origin_living_income_benchmark_lc, origin_currency, origin_currency_to_usd, survey_year_origin,
            survey_origin, survey_year, origin_living_income_benchmark_lc, origin_currency, origin_currency_to_usd, survey_year_origin))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to ingest origin economics data
@origin_economics_bp.route('/ingest_origin_economics_data', methods=['POST'])
@login_required
def ingest_origin_economics_data():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT DISTINCT survey_origin, survey_year FROM Survey_Standardized')
    surveys = cursor.fetchall()

    for survey in surveys:
        survey_origin = survey[0]
        survey_year = survey[1]
        if survey_origin and survey_year:
            survey_year_origin = calculate_survey_year_origin(survey_year, survey_origin)
            cursor.execute('''
                IF NOT EXISTS (SELECT 1 FROM appOriginEconomicsData WHERE survey_year_origin = %s)
                BEGIN
                    INSERT INTO appOriginEconomicsData (survey_origin, survey_year, survey_year_origin)
                    VALUES (%s, %s, %s)
                END
            ''', (survey_year_origin, survey_origin, survey_year, survey_year_origin))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})
