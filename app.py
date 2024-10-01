from flask import Flask, send_from_directory, redirect, url_for
from flask_cors import CORS

app = Flask(__name__, static_folder='static')

# Activer CORS
CORS(app, supports_credentials=True)

# Servir l'index.html pour l'application React
@app.route('/login', methods=['GET'])
def serve_login_page():
    return send_from_directory(app.static_folder + '/public', 'index.html')

# Rediriger l'URL racine vers /login
@app.route('/')
def redirect_to_login():
    return redirect(url_for('serve_login_page'))

if __name__ == '__main__':
    app.run(debug=True)
