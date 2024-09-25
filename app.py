from flask import Flask, send_from_directory, redirect, url_for
from flask_cors import CORS
import secrets
from routes.auth import auth_bp
from routes.fertilizer import fertilizer_bp
from routes.fertilizer_cost_data import fertilizer_cost_bp
from routes.agrochemical import agrochemical_bp
from routes.agrochemical_cost_data import agrochemical_cost_bp
from routes.seedling_cost_data import seedling_cost_bp
from routes.labor_cost_data import labor_cost_bp
from routes.unit_conversion_data import unit_conversion_bp
from routes.origin_economics_data import origin_economics_bp
from routes.survey_master_data import survey_master_bp
from routes.real_time_info import real_time_info_bp
from routes.status import status_bp

app = Flask(__name__, static_folder='static/public')

# Enable Cross-Origin Resource Sharing (CORS) to allow requests from different origins
CORS(app, supports_credentials=True)

# Generate a secret key for the application
app.secret_key = secrets.token_hex(16)

# Register blueprints for different routes
app.register_blueprint(auth_bp)
app.register_blueprint(fertilizer_bp)
app.register_blueprint(fertilizer_cost_bp)
app.register_blueprint(agrochemical_bp)
app.register_blueprint(agrochemical_cost_bp)
app.register_blueprint(seedling_cost_bp)
app.register_blueprint(labor_cost_bp)
app.register_blueprint(unit_conversion_bp)
app.register_blueprint(origin_economics_bp)
app.register_blueprint(survey_master_bp)
app.register_blueprint(real_time_info_bp)
app.register_blueprint(status_bp)

# Serve the index.html at the /login URL for frontend
@app.route('/login', methods=['GET'])
def serve_login_page():
    return send_from_directory(app.static_folder, 'index.html')

# Redirect root URL to /login
@app.route('/')
def redirect_to_login():
    return redirect(url_for('serve_login_page'))

if __name__ == '__main__':
    # Run the Flask application in debug mode
    app.run(debug=True)
