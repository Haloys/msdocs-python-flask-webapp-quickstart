from flask import Flask, send_from_directory, redirect, url_for
from flask_cors import CORS
app = Flask(__name__, static_folder='static')

# Enable Cross-Origin Resource Sharing (CORS)
CORS(app, supports_credentials=True)

# Serve the index.html at the /login URL for frontend
@app.route('/login', methods=['GET'])
def serve_login_page():
    return send_from_directory(app.static_folder + '/public', 'index.html')

# Redirect root URL to /login
@app.route('/')
def redirect_to_login():
    return redirect(url_for('serve_login_page'))

if __name__ == '__main__':
    # Run the Flask application in debug mode
    app.run(debug=True)
