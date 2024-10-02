from flask import Flask, send_from_directory, redirect, url_for
from flask_cors import CORS
import secrets
from backend.routes.auth import auth_bp
from backend.routes.fertilizer import fertilizer_bp
from backend.routes.fertilizer_cost_data import fertilizer_cost_bp
from backend.routes.agrochemical import agrochemical_bp
from backend.routes.agrochemical_cost_data import agrochemical_cost_bp
from backend.routes.seedling_cost_data import seedling_cost_bp
from backend.routes.labor_cost_data import labor_cost_bp
from backend.routes.unit_conversion_data import unit_conversion_bp
from backend.routes.origin_economics_data import origin_economics_bp
from backend.routes.survey_master_data import survey_master_bp
from backend.routes.real_time_info import real_time_info_bp
from backend.routes.status import status_bp

app = Flask(__name__, static_folder='static')

# Enable Cross-Origin Resource Sharing (CORS)
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

@app.route('/login')
def serve_login_page():
    return send_from_directory(app.static_folder + '/public', 'index.html')

# Route to serve public files (like logo.png)
@app.route('/<path:path>')
def serve_public_files(path):
    return send_from_directory('frontend/public', path)

@app.route('/static/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder + '/static', path)

@app.route('/')
def redirect_to_login():
    return redirect(url_for('serve_login_page'))

if __name__ == '__main__':
    app.run(debug=True)