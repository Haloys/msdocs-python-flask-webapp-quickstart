from flask import Blueprint, request, jsonify, session
import pymssql
from routes.db import get_db_connection
import bcrypt

auth_bp = Blueprint('auth', __name__)

# Fetches the users from the database
def fetch_users_from_db():
    conn = get_db_connection()
    cursor = conn.cursor(as_dict=True)
    cursor.execute('SELECT username, password FROM users')
    users = {row['username']: row['password'] for row in cursor.fetchall()}
    conn.close()
    return users

# Adds a user to the database
def add_user_to_db(username, password):
    conn = get_db_connection()
    cursor = conn.cursor()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    cursor.execute('INSERT INTO users (username, password) VALUES (%s, %s)', (username, hashed_password))
    conn.commit()
    conn.close()

# Deletes a user from the database
def delete_user_from_db(username):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM users WHERE username = %s', (username,))
    conn.commit()
    conn.close()

# Handles the login route
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = data.get('username')
    passwd = data.get('password')
    users = fetch_users_from_db()
    if user in users and bcrypt.checkpw(passwd.encode('utf-8'), users[user].encode('utf-8')):
        session['user'] = user
        return jsonify({'message': 'Login successful'}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

# Handles the logout route
@auth_bp.route('/logout', methods=['POST'])
def logout():
    user = session.pop('user', None)
    if user:
        return jsonify({'message': 'Logged out'}), 200
    return jsonify({'message': 'No user logged in'}), 400

# Handles the manage users route
@auth_bp.route('/users', methods=['GET', 'POST', 'DELETE'])
def manage_users():
    if 'user' not in session or session['user'] != 'admin':
        return jsonify({'message': 'Unauthorized'}), 401

    if request.method == 'GET':
        users = fetch_users_from_db()
        return jsonify(users)

    data = request.get_json()
    if request.method == 'POST':
        username = data.get('username')
        password = data.get('password')
        add_user_to_db(username, password)
        return jsonify({'message': 'User added successfully'}), 200

    if request.method == 'DELETE':
        username = data.get('username')
        delete_user_from_db(username)
        return jsonify({'message': 'User deleted successfully'}), 200

# Decorator function to check if user is logged in
def login_required(f):
    def wrapper(*args, **kwargs):
        if 'user' not in session:
            return jsonify({'message': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper
