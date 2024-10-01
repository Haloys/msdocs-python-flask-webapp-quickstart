import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect, useHistory } from 'react-router-dom';
//import Fertilizer from './Fertilizer';
//import FertilizerCostData from './FertilizerCostData';
//import Agrochemical from './Agrochemical';
//import AgrochemicalCostData from './AgrochemicalCostData';
//import SeedlingCostData from './SeedlingCostData';
//import LaborCostData from './LaborCostData';
//import UnitConversionData from './UnitConversionData';
//import OriginEconomicsData from './OriginEconomicsData';
//import SurveyMasterData from './SurveyMasterData';
//import LoginForm from './LoginForm';
//import AdminPanel from './AdminPanel';
//import Status from './Status';
//import Home from './Home';
//import Navbar from './Navbar';
import './App.css';
import axios from 'axios';

function App() {
  const [loggedIn, setLoggedIn] = useState(false); // State to track if user is logged in
  const [isAdmin, setIsAdmin] = useState(false); // State to track if user is an admin
  const history = useHistory(); // Access to the browser history

  // Function to handle user login
  const handleLogin = (username) => {
    setLoggedIn(true); // Set loggedIn state to true
    setIsAdmin(username === 'admin'); // Set isAdmin state based on username
    history.push("/"); // Redirect user to home page
  };

  // Function to handle user logout
  const handleLogout = () => {
    axios.post('https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/logout', {}, { withCredentials: true })
      .then(response => {
        setLoggedIn(false); // Set loggedIn state to false
        setIsAdmin(false); // Set isAdmin state to false
        history.push("/login"); // Redirect user to login page
      });
  };

  return (
    <Router>
      <div className="App">
        {loggedIn && <Navbar onLogout={handleLogout} isAdmin={isAdmin} />} {/* Show Navbar component if user is logged in */}
        <Switch>
          <Route path="/" exact>
            {loggedIn ? <Home onLogout={handleLogout} /> : <Redirect to="/login" />} {/* Show Home component if user is logged in, otherwise redirect to login page */}
          </Route>
          <Route path="/login">
            {loggedIn ? <Redirect to="/" /> : <LoginForm onLogin={handleLogin} />} {/* Show LoginForm component if user is not logged in, otherwise redirect to home page */}
          </Route>

          {/* Commented routes for future use */}
          {/* <Route path="/admin">
            {loggedIn && isAdmin ? <AdminPanel /> : <Redirect to="/login" />} 
          </Route>
          <Route path="/fertilizers_data">
            {loggedIn ? <Fertilizer /> : <Redirect to="/login" />} 
          </Route>
          <Route path="/agrochemical_data">
            {loggedIn ? <Agrochemical /> : <Redirect to="/login" />} 
          </Route>
          <Route path="/fertlizers_cost_data">
            {loggedIn ? <FertilizerCostData /> : <Redirect to="/login" />} 
          </Route>
          <Route path="/agrochemical_cost_data">
            {loggedIn ? <AgrochemicalCostData /> : <Redirect to="/login" />} 
          </Route>
          <Route path="/seedling_cost_data">
            {loggedIn ? <SeedlingCostData /> : <Redirect to="/login" />} 
          </Route>
          <Route path="/labor_cost_data">
            {loggedIn ? <LaborCostData /> : <Redirect to="/login" />} 
          </Route>
          <Route path="/unit_conversion_data">
            {loggedIn ? <UnitConversionData /> : <Redirect to="/login" />} 
          </Route>
          <Route path="/origin_economics_data">
            {loggedIn ? <OriginEconomicsData /> : <Redirect to="/login" />} 
          </Route>
          <Route path="/survey_master_data">
            {loggedIn ? <SurveyMasterData /> : <Redirect to="/login" />} 
          </Route>
          <Route path="/status">
            {loggedIn ? <Status /> : <Redirect to="/login" />} 
          </Route> */}
        </Switch>
      </div>
    </Router>
  );
}

export default App;