from flask import Blueprint, jsonify
from routes.db import get_db_connection

status_bp = Blueprint('status', __name__)

# Define the tables and their corresponding columns
TABLES = {
    'appFertilizerData': ['fertilizer_reported_name', 'fertilizer_n_content', 'fertilizer_p_content', 'fertilizer_k_content', 'fertilizer_type'],
    'appAgrochemicalData': ['reported_agrochemical_name', 'agrochemical_type', 'agrochemical_active_ingredient_count', 'agrochemical_active_ingredient_name', 'agrochemical_active_ingredient_percentage'],
    'appUnitConversionData': ['reported_unit_name', 'reported_unit_amount', 'reported_unit_type'],
    'appAgrochemicalCostData': ['survey_origin', 'survey_year', 'agrochemical_item_name', 'agrochemical_item_price_lc', 'agrochemical_item_price_unit', 'survey_year_origin_agrochemical_item_name'],
    'appFertilizerCostData': ['survey_origin', 'survey_year', 'fertilizer_item_name', 'fertilizer_item_price_lc', 'fertilizer_item_price_unit', 'survey_year_origin_fertilizer_item_name'],
    'appLaborCostData': ['survey_origin', 'survey_year', 'laborer_activity_name', 'laborer_activity_cost_per_day', 'survey_year_origin_laborer_activity_name'],
    'appSeedlingCostData': ['survey_origin', 'survey_year', 'seedling_item_name', 'seedling_item_price_lc', 'survey_year_origin_seedling_item_name'],
    'appSurveyMasterData' : ['survey_origin', 'survey_coffee_type', 'survey_supply_chain', 'survey_year', 'total_number_of_farmers_in_the_supply_chain', 'number_of_survey_plots_part_of_deforestation_analysis', 'survey_id'],
}

@status_bp.route('/status', methods=['GET'])
def get_missing_data_counts():
    conn = get_db_connection()
    cursor = conn.cursor()

    missing_data_details = {}

    # Iterate over each table and its columns
    for table, columns in TABLES.items():
        total_missing = 0
        # Check for missing data in each column
        for column in columns:
            # Handle special case for fertilizer columns
            if column in ['fertilizer_n_content', 'fertilizer_p_content', 'fertilizer_k_content']:
                cursor.execute(f"SELECT {columns[0]}, {column} FROM {table} WHERE {column} IS NULL OR {column} = 0")
            else:
                cursor.execute(f"SELECT {columns[0]}, {column} FROM {table} WHERE {column} IS NULL")

            null_rows = cursor.fetchall()
            total_missing += len(null_rows)

        # Store the total missing data count for each table
        missing_data_details[table] = {
            "total_missing": total_missing,
        }

    conn.close()

    # Return the missing data details as JSON response
    return jsonify(missing_data_details)
