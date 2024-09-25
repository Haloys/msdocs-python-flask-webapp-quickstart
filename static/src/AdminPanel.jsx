import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';

function AdminPanel() {
    const [users, setUsers] = useState({});
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        fetchUsers(); // Fetch the list of users when the component mounts
    }, []);

    const fetchUsers = () => {
        axios.get('http://localhost:5000/users', { withCredentials: true }) // Make a GET request to fetch the users
            .then(response => setUsers(response.data)) // Update the users state with the response data
            .catch(error => console.error('Error fetching users:', error)); // Log any errors that occur
    };

    const handleAddUser = () => {
        if (username.trim() === '' || password.trim() === '') {
            alert('Username and password are required'); // Show an alert if the username or password is empty
            return;
        }

        if (username.length > 40 || password.length > 40) {
            alert('Username and password must not exceed 40 characters'); // Show an alert if the username or password exceeds 40 characters
            return;
        }

        axios.post('http://localhost:5000/users', { username, password }, { withCredentials: true }) // Make a POST request to add a new user
            .then(response => {
                fetchUsers(); // Fetch the updated list of users
                setUsername(''); // Clear the username input field
                setPassword(''); // Clear the password input field
            })
            .catch(error => console.error('Error adding user:', error)); // Log any errors that occur
    };

    const handleDeleteUser = (user) => {
        axios.delete('http://localhost:5000/users', { data: { username: user }, withCredentials: true }) // Make a DELETE request to delete a user
            .then(response => fetchUsers()) // Fetch the updated list of users
            .catch(error => console.error('Error deleting user:', error)); // Log any errors that occur
    };

    return (
        <div className="admin-panel">
            <h2>Admin Panel</h2>
            <div>
                <h3>Add User</h3>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    maxLength="40"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    maxLength="40"
                />
                <button onClick={handleAddUser}>Add User</button>
            </div>
            <div>
                <h3>Existing Users</h3>
                <ul>
                    {Object.keys(users).map(user => (
                        <li key={user}>
                            {user}
                            <button className="delete-button" onClick={() => handleDeleteUser(user)}>Delete</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default AdminPanel;
