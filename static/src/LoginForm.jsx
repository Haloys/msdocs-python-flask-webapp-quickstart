import React, { useState } from 'react';
import axios from 'axios';
import './LoginForm.css';
import logo from './assets/logo.png';

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState(''); // State variable to store the username
  const [password, setPassword] = useState(''); // State variable to store the password
  const [error, setError] = useState(null); // State variable to store any login errors

  const handleLogin = () => {
    // Send a POST request to the server to perform login
    axios.post('http://localhost:5000/login', { username, password }, { withCredentials: true })
      .then(response => {
        // If login is successful, call the onLogin function passed as a prop
        onLogin(username);
      })
      .catch(error => {
        // If login fails, set the error state variable to display an error message
        setError('Invalid credentials');
      });
  };

  return (
    <div className="login-container">
      <img src={logo} alt="Logo" className="login-logo" />
      <h1 className="text-2xl font-bold mb-4">Welcome</h1>
      {error && <div className="alert bg-red-500 text-white p-2 mb-4 rounded">{error}</div>}
      <div className="mb-4">
        <label className="block text-gray-700">Username</label>
        <input 
          type="text" 
          className="w-full p-2 border border-gray-300 rounded mt-2"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Password</label>
        <input 
          type="password" 
          className="w-full p-2 border border-gray-300 rounded mt-2"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      <div className="flex justify-center">
        <button 
          type="button" 
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200 mt-4" 
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default LoginForm;
