import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './RealTimeInfo.css';

function RealTimeInfo() {
  const [info, setInfo] = useState({
    total_missing_data: 0,
    table_with_most_missing_data: '',
    max_missing_count: 0,
  });

  useEffect(() => {
    // Function to fetch real-time info from the server
    const fetchData = () => {
      axios.get('http://localhost:5000/real_time_info', { withCredentials: true })
        .then(response => {
          // Update the state with the fetched data
          setInfo(response.data);
        })
        .catch(error => {
          console.error('Error fetching real-time info:', error);
        });
    };

    // Fetch data when the component mounts
    fetchData();
  }, []);

  return (
    <div className="real-time-info">
      <h2>Real-time Information</h2>
      <div className="info-card">
        <span>{info.total_missing_data}</span>
        <div className="info-card-label">Total missing data</div>
      </div>
      <div className="info-card">
        <span>{info.table_with_most_missing_data}</span>
        <div className="info-card-label">Table with most missing data</div>
      </div>
      <div className="info-card">
        <span>{info.max_missing_count}</span>
        <div className="info-card-label">Missing data in this table</div>
      </div>
    </div>
  );
}

export default RealTimeInfo;
