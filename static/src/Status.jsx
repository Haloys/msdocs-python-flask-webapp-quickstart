import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Status.css';

function Status() {
    const [dataMissingCounts, setDataMissingCounts] = useState({});

    useEffect(() => {
        // Fetch the status data from the server
        axios.get('http://localhost:5000/status', { withCredentials: true })
            .then(response => {
                // Update the state with the fetched data
                setDataMissingCounts(response.data);
            })
            .catch(error => {
                // Log an error message if there was an error fetching the data
                console.error("There was an error fetching the status data!", error);
            });
    }, []);

    return (
        <div className="status-container">
            <h1>Data Missing Status</h1>
            <div className="status-grid">
                {/* Render a status box for each table */}
                {Object.entries(dataMissingCounts).map(([tableName, details]) => (
                    <div key={tableName} className="status-box">
                        <h2>{tableName}</h2>
                        <p>Total Missing Data Points: {details.total_missing}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Status;
