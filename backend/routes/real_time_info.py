from flask import Blueprint, jsonify
from backend.routes.auth import login_required
from backend.routes.db import get_db_connection

real_time_info_bp = Blueprint('real_time_info', __name__)

# Define the tables and their column names and types
TABLES = {
    'appFertilizerData': {'fertilizer_reported_name': 'text', 'fertilizer_n_content': 'numeric', 'fertilizer_p_content': 'numeric', 'fertilizer_k_content': 'numeric', 'fertilizer_type': 'text'},
    'appAgrochemicalData': {'reported_agrochemical_name': 'text', 'agrochemical_type': 'text', 'agrochemical_active_ingredient_count': 'numeric', 'agrochemical_active_ingredient_name': 'text', 'agrochemical_active_ingredient_percentage': 'numeric'},
    'appUnitConversionData': {'reported_unit_name': 'text', 'reported_unit_amount': 'numeric', 'reported_unit_type': 'text'},
    'appAgrochemicalCostData': {'survey_origin': 'text', 'survey_year': 'numeric', 'agrochemical_item_name': 'text', 'agrochemical_item_price_lc': 'numeric', 'agrochemical_item_price_unit': 'text', 'survey_year_origin_agrochemical_item_name': 'text'},
    'appFertilizerCostData': {'survey_origin': 'text', 'survey_year': 'numeric', 'fertilizer_item_name': 'text', 'fertilizer_item_price_lc': 'numeric', 'fertilizer_item_price_unit': 'text', 'survey_year_origin_fertilizer_item_name': 'text'},
    'appLaborCostData': {'survey_origin': 'text', 'survey_year': 'numeric', 'laborer_activity_name': 'text', 'laborer_activity_cost_per_day': 'numeric', 'survey_year_origin_laborer_activity_name': 'text'},
    'appSeedlingCostData': {'survey_origin': 'text', 'survey_year': 'numeric', 'seedling_item_name': 'text', 'seedling_item_price_lc': 'numeric', 'survey_year_origin_seedling_item_name': 'text'},
    'appSurveyMasterData': {'survey_origin': 'text', 'survey_coffee_type': 'text', 'survey_supply_chain': 'text', 'survey_year': 'numeric', 'total_number_of_farmers_in_the_supply_chain': 'numeric', 'number_of_survey_plots_part_of_deforestation_analysis': 'numeric', 'survey_id': 'text'}
}

@real_time_info_bp.route('/real_time_info', methods=['GET'])
@login_required
def real_time_info():
    # Establish a database connection
    conn = get_db_connection()
    cursor = conn.cursor()

    # Initialize variables to track missing data
    total_missing_data = 0
    table_with_most_missing_data = None
    max_missing_count = 0

    # Iterate over each table and its columns
    for table, columns in TABLES.items():
        table_missing_count = 0
        for column, column_type in columns.items():
            # Check if the column type is numeric
            if column_type == 'numeric':
                # Execute a SQL query to count the number of rows with NULL or 0 values in the column
                cursor.execute(f"SELECT COUNT(*) FROM {table} WHERE {column} IS NULL OR {column} = 0")
            else:
                # Execute a SQL query to count the number of rows with NULL values in the column
                cursor.execute(f"SELECT COUNT(*) FROM {table} WHERE {column} IS NULL")

            # Get the count of missing values for the column
            column_missing = cursor.fetchone()[0]
            table_missing_count += column_missing

        # Update the total missing data count
        total_missing_data += table_missing_count

        # Check if the current table has more missing data than the previous maximum
        if table_missing_count > max_missing_count:
            max_missing_count = table_missing_count
            table_with_most_missing_data = table

    # Close the database connection
    conn.close()

    # Return the missing data information as JSON response
    return jsonify({
        'total_missing_data': total_missing_data,
        'table_with_most_missing_data': table_with_most_missing_data,
        'max_missing_count': max_missing_count
    })
