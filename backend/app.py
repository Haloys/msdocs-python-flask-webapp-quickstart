from flask import Flask, send_from_directory, redirect, url_for

app = Flask(__name__, static_folder='static')

# Servir les fichiers statiques (HTML, JS, CSS)
@app.route('/login')
def serve_login_page():
    return send_from_directory(app.static_folder + '/public', 'index.html')

@app.route('/static/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder + '/static', path)

@app.route('/')
def redirect_to_login():
    return redirect(url_for('serve_login_page'))

if __name__ == '__main__':
    app.run(debug=True)

