import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import RealTimeInfo from './RealTimeInfo';

function Home() {
  return (
    <div className="dashboard">
      <div className="main-content">
        {/* Info panel */}
        <div className="info-panel">
          <RealTimeInfo />
        </div>
        {/* Grid container */}
        <div className="grid-container">
          {/* Links to different data pages */}
          <Link to="/fertilizers_data" className="box">Fertilizers Data</Link>
          <Link to="/agrochemical_data" className="box">Agrochemical Data</Link>
          <Link to="/fertlizers_cost_data" className="box">Fertilizers Cost Data</Link>
          <Link to="/agrochemical_cost_data" className="box">Agrochemical Cost Data</Link>
          <Link to="/seedling_cost_data" className="box">Seedling Cost Data</Link>
          <Link to="/labor_cost_data" className="box">Labor Cost Data</Link>
          <Link to="/unit_conversion_data" className="box">Unit Conversion Data</Link>
          <Link to="/origin_economics_data" className="box">Origin Economics Data</Link>
          <Link to="/survey_master_data" className="box">Survey Master Data</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
