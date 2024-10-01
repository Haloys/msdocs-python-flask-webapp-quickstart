from flask import Blueprint, request, jsonify
from routes.auth import login_required
from routes.db import get_db_connection

labor_cost_bp = Blueprint('labor_cost', __name__)

# Function to calculate the unique identifier for a labor cost entry
def calculate_survey_year_origin_laborer_activity_name(survey_year, survey_origin, laborer_activity_name):
    return f"{survey_year}_{survey_origin}_{laborer_activity_name}"

# Route to get all labor costs
@labor_cost_bp.route('/get_labor_costs', methods=['GET'])
@login_required
def get_labor_costs():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT survey_origin, survey_year, laborer_activity_name, laborer_activity_cost_per_day
        FROM appLaborCostData
    ''')
    labor_costs = cursor.fetchall()
    conn.close()
    return jsonify([{
        'survey_origin': l[0],
        'survey_year': l[1],
        'laborer_activity_name': l[2],
        'laborer_activity_cost_per_day': l[3]
    } for l in labor_costs])

# Route to add a new labor cost entry
@labor_cost_bp.route('/add_labor_cost', methods=['POST'])
@login_required
def add_labor_cost():
    data = request.get_json()

    required_fields = ['survey_origin', 'survey_year', 'laborer_activity_name', 'laborer_activity_cost_per_day']
    if not all(data.get(field) for field in required_fields):
        return jsonify({'status': 'error', 'message': 'All fields are required'}), 400

    survey_origin = data['survey_origin']
    survey_year = data['survey_year']
    laborer_activity_name = data['laborer_activity_name']
    laborer_activity_cost_per_day = data['laborer_activity_cost_per_day']

    survey_year_origin_laborer_activity_name = calculate_survey_year_origin_laborer_activity_name(survey_year, survey_origin, laborer_activity_name)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO appLaborCostData (survey_origin, survey_year, laborer_activity_name, laborer_activity_cost_per_day, survey_year_origin_laborer_activity_name)
        VALUES (%s, %s, %s, %s, %s)
    ''', (survey_origin, survey_year, laborer_activity_name, laborer_activity_cost_per_day, survey_year_origin_laborer_activity_name))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to delete a labor cost entry
@labor_cost_bp.route('/delete_labor_cost', methods=['POST'])
@login_required
def delete_labor_cost():
    data = request.get_json()
    laborer_activity_name = data['laborer_activity_name']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        DELETE FROM appLaborCostData
        WHERE laborer_activity_name = %s
    ''', (laborer_activity_name,))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to update a labor cost entry
@labor_cost_bp.route('/update_labor_cost', methods=['POST'])
@login_required
def update_labor_cost():
    data = request.get_json()

    required_fields = ['survey_origin', 'survey_year', 'laborer_activity_name', 'laborer_activity_cost_per_day']
    if not all(data.get(field) for field in required_fields):
        return jsonify({'status': 'error', 'message': 'All fields are required'}), 400

    survey_origin = data['survey_origin']
    survey_year = data['survey_year']
    laborer_activity_name = data['laborer_activity_name']
    laborer_activity_cost_per_day = data['laborer_activity_cost_per_day']

    survey_year_origin_laborer_activity_name = calculate_survey_year_origin_laborer_activity_name(survey_year, survey_origin, laborer_activity_name)

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        IF NOT EXISTS (SELECT 1 FROM appLaborCostData WHERE laborer_activity_name = %s)
        BEGIN
            INSERT INTO appLaborCostData (survey_origin, survey_year, laborer_activity_name, laborer_activity_cost_per_day, survey_year_origin_laborer_activity_name)
            VALUES (%s, %s, %s, %s, %s)
        END
        ELSE
        BEGIN
            UPDATE appLaborCostData
            SET survey_origin = %s, survey_year = %s, laborer_activity_cost_per_day = %s, survey_year_origin_laborer_activity_name = %s
            WHERE laborer_activity_name = %s
        END
    ''', (laborer_activity_name, survey_origin, survey_year, laborer_activity_cost_per_day, survey_year_origin_laborer_activity_name,
            survey_origin, survey_year, laborer_activity_cost_per_day, survey_year_origin_laborer_activity_name, laborer_activity_name))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to ingest labor costs from another table
@labor_cost_bp.route('/ingest_labor_costs', methods=['POST'])
@login_required
def ingest_labor_costs():
    conn = get_db_connection()
    cursor = conn.cursor()

    laborer_activity_columns = [
        'laborers_fly_season_activity',
        'laborers_main_season_activity',
        'laborers_last_season_activity'
    ]

    for column in laborer_activity_columns:
        cursor.execute(f'SELECT DISTINCT survey_origin, survey_year, {column} FROM Survey_Standardized')
        labor_activities = cursor.fetchall()

        for labor_activity in labor_activities:
            if labor_activity[2]:
                survey_year_origin_laborer_activity_name = calculate_survey_year_origin_laborer_activity_name(labor_activity[1], labor_activity[0], labor_activity[2])
                cursor.execute('''
                    IF NOT EXISTS (SELECT 1 FROM appLaborCostData WHERE laborer_activity_name = %s)
                    BEGIN
                        INSERT INTO appLaborCostData (survey_origin, survey_year, laborer_activity_name, survey_year_origin_laborer_activity_name)
                        VALUES (%s, %s, %s, %s)
                    END
                ''', (labor_activity[2], labor_activity[0], labor_activity[1], labor_activity[2], survey_year_origin_laborer_activity_name))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})
