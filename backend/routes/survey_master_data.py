from flask import Blueprint, request, jsonify
from backend.routes.auth import login_required
from backend.routes.db import get_db_connection

survey_master_bp = Blueprint('survey_master', __name__)

# Function to calculate the survey ID based on the provided parameters
def calculate_survey_id(survey_year, survey_origin, survey_coffee_type, survey_supply_chain):
    return f"{survey_origin}_{survey_year}_{survey_coffee_type}_{survey_supply_chain}"

# Route to get survey master data
@survey_master_bp.route('/get_survey_master_data', methods=['GET'])
@login_required
def get_survey_master_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT survey_origin, survey_coffee_type, survey_supply_chain, survey_year, total_number_of_farmers_in_the_supply_chain, number_of_survey_plots_part_of_deforestation_analysis 
        FROM appSurveyMasterData
    ''')
    survey_master_data = cursor.fetchall()
    conn.close()
    return jsonify([{
        'survey_origin': s[0],
        'survey_coffee_type': s[1],
        'survey_supply_chain': s[2],
        'survey_year': s[3],
        'total_number_of_farmers_in_the_supply_chain': s[4],
        'number_of_survey_plots_part_of_deforestation_analysis': s[5]
    } for s in survey_master_data])

# Route to add survey master data
@survey_master_bp.route('/add_survey_master_data', methods=['POST'])
@login_required
def add_survey_master_data():
    data = request.get_json()

    required_fields = ['survey_origin', 'survey_coffee_type', 'survey_supply_chain', 'survey_year', 'total_number_of_farmers_in_the_supply_chain', 'number_of_survey_plots_part_of_deforestation_analysis']
    if not all(data.get(field) for field in required_fields):
        return jsonify({'status': 'error', 'message': 'All fields are required'}), 400

    survey_origin = data['survey_origin']
    survey_coffee_type = data['survey_coffee_type']
    survey_supply_chain = data['survey_supply_chain']
    survey_year = data['survey_year']
    total_number_of_farmers_in_the_supply_chain = data['total_number_of_farmers_in_the_supply_chain']
    number_of_survey_plots_part_of_deforestation_analysis = data['number_of_survey_plots_part_of_deforestation_analysis']

    survey_id = calculate_survey_id(survey_year, survey_origin, survey_coffee_type, survey_supply_chain)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO appSurveyMasterData (survey_origin, survey_coffee_type, survey_supply_chain, survey_year, total_number_of_farmers_in_the_supply_chain, number_of_survey_plots_part_of_deforestation_analysis, survey_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    ''', (survey_origin, survey_coffee_type, survey_supply_chain, survey_year, total_number_of_farmers_in_the_supply_chain, number_of_survey_plots_part_of_deforestation_analysis, survey_id))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to delete survey master data
@survey_master_bp.route('/delete_survey_master_data', methods=['POST'])
@login_required
def delete_survey_master_data():
    data = request.get_json()
    survey_id = data['survey_id']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        DELETE FROM appSurveyMasterData
        WHERE survey_id = %s
    ''', (survey_id,))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to update survey master data
@survey_master_bp.route('/update_survey_master_data', methods=['POST'])
@login_required
def update_survey_master_data():
    data = request.get_json()

    required_fields = ['survey_origin', 'survey_coffee_type', 'survey_supply_chain', 'survey_year', 'total_number_of_farmers_in_the_supply_chain', 'number_of_survey_plots_part_of_deforestation_analysis']
    if not all(data.get(field) for field in required_fields):
        return jsonify({'status': 'error', 'message': 'All fields are required'}), 400

    survey_origin = data['survey_origin']
    survey_coffee_type = data['survey_coffee_type']
    survey_supply_chain = data['survey_supply_chain']
    survey_year = data['survey_year']
    total_number_of_farmers_in_the_supply_chain = data['total_number_of_farmers_in_the_supply_chain']
    number_of_survey_plots_part_of_deforestation_analysis = data['number_of_survey_plots_part_of_deforestation_analysis']

    survey_id = calculate_survey_id(survey_year, survey_origin, survey_coffee_type, survey_supply_chain)

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        IF NOT EXISTS (SELECT 1 FROM appSurveyMasterData WHERE survey_id = %s)
        BEGIN
            INSERT INTO appSurveyMasterData (survey_origin, survey_coffee_type, survey_supply_chain, survey_year, total_number_of_farmers_in_the_supply_chain, number_of_survey_plots_part_of_deforestation_analysis, survey_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        END
        ELSE
        BEGIN
            UPDATE appSurveyMasterData
            SET survey_origin = %s, survey_coffee_type = %s, survey_supply_chain = %s, survey_year = %s, total_number_of_farmers_in_the_supply_chain = %s, number_of_survey_plots_part_of_deforestation_analysis = %s
            WHERE survey_id = %s
        END
    ''', (survey_id, survey_origin, survey_coffee_type, survey_supply_chain, survey_year, total_number_of_farmers_in_the_supply_chain, number_of_survey_plots_part_of_deforestation_analysis,
            survey_origin, survey_coffee_type, survey_supply_chain, survey_year, total_number_of_farmers_in_the_supply_chain, number_of_survey_plots_part_of_deforestation_analysis, survey_id))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

# Route to ingest survey master data
@survey_master_bp.route('/ingest_survey_master_data', methods=['POST'])
@login_required
def ingest_survey_master_data():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT DISTINCT survey_origin, survey_year, survey_coffee_type, survey_supply_chain FROM Survey_Standardized')
    surveys = cursor.fetchall()

    for survey in surveys:
        if survey[2] and survey[3]:
            survey_id = calculate_survey_id(survey[1], survey[0], survey[2], survey[3])
            cursor.execute('''
                IF NOT EXISTS (SELECT 1 FROM appSurveyMasterData WHERE survey_id = %s)
                BEGIN
                    INSERT INTO appSurveyMasterData (survey_origin, survey_year, survey_coffee_type, survey_supply_chain, survey_id)
                    VALUES (%s, %s, %s, %s, %s)
                END
            ''', (survey_id, survey[0], survey[1], survey[2], survey[3], survey_id))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})
