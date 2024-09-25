import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function UnitConversionDataTable() {
    // State variables
    const [unitConversionData, setUnitConversionData] = useState([]); // Holds the unit conversion data
    const [selectedUnitConversionData, setSelectedUnitConversionData] = useState(null); // Holds the selected unit conversion data
    const [modalOpen, setModalOpen] = useState(false); // Controls the visibility of the modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false); // Controls the visibility of the delete modal
    const [formMode, setFormMode] = useState('add'); // Tracks the mode of the form (add or update)
    const [unitConversionDetails, setUnitConversionDetails] = useState({ // Holds the details of the unit conversion
        reported_unit_name: '',
        reported_unit_amount: '',
        reported_unit_type: ''
    });
    const [alert, setAlert] = useState(null); // Holds the alert message

    useEffect(() => {
        fetchUnitConversionData(); // Fetches the unit conversion data when the component mounts
    }, []);

    // Fetches the unit conversion data from the server
    const fetchUnitConversionData = () => {
        axios.get('http://localhost:5000/get_unit_conversion_data', { withCredentials: true })
            .then(response => setUnitConversionData(response.data))
            .catch(error => console.error('Error fetching unit conversion data:', error));
    };

    // Handles the add/update operation for unit conversion data
    const handleAddUpdate = () => {
        const url = formMode === 'add' ? 'http://localhost:5000/add_unit_conversion_data' : 'http://localhost:5000/update_unit_conversion_data';
        axios.post(url, unitConversionDetails, { withCredentials: true })
            .then(response => {
                setAlert({ type: 'success', message: `Unit conversion data ${formMode}d successfully!` });
                fetchUnitConversionData();
                setModalOpen(false);
            })
            .catch(error => setAlert({ type: 'danger', message: `Error ${formMode}ing unit conversion data.` }));
    };

    // Handles the delete operation for unit conversion data
    const handleDelete = () => {
        axios.post('http://localhost:5000/delete_unit_conversion_data', { reported_unit_name: selectedUnitConversionData.reported_unit_name }, { withCredentials: true })
            .then(response => {
                setAlert({ type: 'success', message: 'Unit conversion data deleted successfully!' });
                fetchUnitConversionData();
                setSelectedUnitConversionData(null);
                setDeleteModalOpen(false);
            })
            .catch(error => {
                setAlert({ type: 'danger', message: 'Error deleting unit conversion data.' });
                setDeleteModalOpen(false);
            });
    };

    // Handles the ingest operation for unit conversion data
    const handleIngest = () => {
        axios.post('http://localhost:5000/ingest_unit_conversion_data', {}, { withCredentials: true })
            .then(response => {
                setAlert({ type: 'success', message: 'Unit conversion data ingested successfully!' });
                fetchUnitConversionData();
            })
            .catch(error => setAlert({ type: 'danger', message: 'Error ingesting unit conversion data.' }));
    };

    // Opens the modal for adding/updating unit conversion data
    const openModal = (mode, data) => {
        setFormMode(mode);
        if (mode === 'update') {
            setUnitConversionDetails({
                reported_unit_name: data.reported_unit_name,
                reported_unit_amount: data.reported_unit_amount || '',
                reported_unit_type: data.reported_unit_type || ''
            });
            setModalOpen(true);
        } else {
            setUnitConversionDetails({
                reported_unit_name: '',
                reported_unit_amount: '',
                reported_unit_type: ''
            });
            setModalOpen(true);
        }
    };

    // Opens the delete modal for unit conversion data
    const openDeleteModal = (data) => {
        setSelectedUnitConversionData(data);
        setDeleteModalOpen(true);
    };

    // State variable for search term
    const [searchTerm, setSearchTerm] = useState('');

    // Filters the unit conversion data based on the search term
    const filteredUnitConversionData = unitConversionData.filter(data => {
        return data.reported_unit_name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="fertilizer-container mx-auto p-8">
            <div className="header-section">
                <h1 className="text-2xl font-bold mb-4">Unit Conversion Data Management</h1>
                {alert && <div className={`alert ${alert.type === 'danger' ? 'bg-red-500' : 'bg-green-500'} text-white p-2 mb-4 rounded`}>{alert.message}</div>}
                <div className="flex items-center ml-auto">
                    <input
                        type="text"
                        placeholder="Search Conversion Data..."
                        className="p-1 border border-gray-300 rounded w-32 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="bg-green-500 text-white p-2 rounded hover:bg-green-700 transition duration-200 mb-4" onClick={() => openModal('add')}>
                    Add Unit Conversion Data
                </button>
                <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 transition duration-200 mb-4 ml-4" onClick={handleIngest}>
                    Ingest Unit Conversion Data from Survey
                </button>
            </div>
            <div className="table-wrapper">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Reported Unit Name</th>
                            <th className="py-2 px-4 border-b">Reported Unit Amount</th>
                            <th className="py-2 px-4 border-b">Reported Unit Type</th>
                            <th className="py-2 px-4 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUnitConversionData.map((data, index) => (
                            <tr key={index}>
                                <td className="py-2 px-4 border-b">{data.reported_unit_name}</td>
                                <td className="py-2 px-4 border-b">{data.reported_unit_amount || 'NULL'}</td>
                                <td className="py-2 px-4 border-b">{data.reported_unit_type || 'NULL'}</td>
                                <td className="py-2 px-4 border-b table-actions">
                                    <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 transition duration-200 table-action" onClick={() => openModal('update', data)}>
                                        Update
                                    </button>
                                    <button className="bg-red-500 text-white p-2 rounded hover:bg-red-700 transition duration-200 table-action" onClick={() => openDeleteModal(data)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h2 className="text-xl font-bold mb-4">{formMode.charAt(0).toUpperCase() + formMode.slice(1)} Unit Conversion Data</h2>
                        <div>
                            <div className="form-group">
                                <label className="block text-gray-700">Reported Unit Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={unitConversionDetails.reported_unit_name}
                                    onChange={e => setUnitConversionDetails({ ...unitConversionDetails, reported_unit_name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Reported Unit Amount</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={unitConversionDetails.reported_unit_amount}
                                    onChange={e => setUnitConversionDetails({ ...unitConversionDetails, reported_unit_amount: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Reported Unit Type</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={unitConversionDetails.reported_unit_type}
                                    onChange={e => setUnitConversionDetails({ ...unitConversionDetails, reported_unit_type: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button className="bg-gray-500 text-white p-2 rounded hover:bg-gray-700 transition duration-200 mr-2" onClick={() => setModalOpen(false)}>
                                Cancel
                            </button>
                            <button
                                className={`bg-${formMode === 'delete' ? 'red' : 'blue'}-500 text-white p-2 rounded hover:bg-${formMode === 'delete' ? 'red' : 'blue'}-700 transition duration-200`}
                                onClick={handleAddUpdate}
                            >
                                {formMode.charAt(0).toUpperCase() + formMode.slice(1)}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h2 className="text-xl font-bold mb-4">Delete Unit Conversion Data</h2>
                        <p>Are you sure you want to delete the unit conversion data for "{selectedUnitConversionData?.reported_unit_name}"?</p>
                        <div className="flex justify-end">
                            <button className="bg-gray-500 text-white p-2 rounded hover:bg-gray-700 transition duration-200 mr-2" onClick={() => setDeleteModalOpen(false)}>
                                Cancel
                            </button>
                            <button className="bg-red-500 text-white p-2 rounded hover:bg-red-700 transition duration-200" onClick={handleDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UnitConversionDataTable;
