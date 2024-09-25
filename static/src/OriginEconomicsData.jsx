import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function OriginEconomicsDataTable() {
    // State variables
    const [originEconomicsData, setOriginEconomicsData] = useState([]); // Stores the origin economics data
    const [selectedOriginEconomicsData, setSelectedOriginEconomicsData] = useState(null); // Stores the selected origin economics data
    const [modalOpen, setModalOpen] = useState(false); // Controls the visibility of the modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false); // Controls the visibility of the delete modal
    const [formMode, setFormMode] = useState('add'); // Tracks the form mode (add or update)
    const [originEconomicsDetails, setOriginEconomicsDetails] = useState({ // Stores the details of the origin economics data
        survey_origin: '',
        survey_year: '',
        origin_living_income_benchmark_lc: '',
        origin_currency: '',
        origin_currency_to_usd: ''
    });
    const [alert, setAlert] = useState(null); // Stores the alert message

    // Fetches the origin economics data on component mount
    useEffect(() => {
        fetchOriginEconomicsData();
    }, []);

    // Fetches the origin economics data from the server
    const fetchOriginEconomicsData = () => {
        axios.get('http://localhost:5000/get_origin_economics_data', { withCredentials: true })
            .then(response => setOriginEconomicsData(response.data))
            .catch(error => console.error('Error fetching origin economics data:', error));
    };

    // Handles the add/update operation
    const handleAddUpdate = () => {
        const url = formMode === 'add' ? 'http://localhost:5000/add_origin_economics_data' : 'http://localhost:5000/update_origin_economics_data';
        axios.post(url, originEconomicsDetails, { withCredentials: true })
            .then(response => {
                setAlert({ type: 'success', message: `Origin economics data ${formMode}d successfully!` });
                fetchOriginEconomicsData();
                setModalOpen(false);
            })
            .catch(error => setAlert({ type: 'danger', message: `Error ${formMode}ing origin economics data.` }));
    };

    // Handles the delete operation
    const handleDelete = () => {
        axios.post('http://localhost:5000/delete_origin_economics_data', { survey_year_origin: selectedOriginEconomicsData.survey_year_origin }, { withCredentials: true })
            .then(response => {
                setAlert({ type: 'success', message: 'Origin economics data deleted successfully!' });
                fetchOriginEconomicsData();
                setSelectedOriginEconomicsData(null);
                setDeleteModalOpen(false);
            })
            .catch(error => {
                setAlert({ type: 'danger', message: 'Error deleting origin economics data.' });
                setDeleteModalOpen(false);
            });
    };

    // Handles the ingest operation
    const handleIngest = () => {
        axios.post('http://localhost:5000/ingest_origin_economics_data', {}, { withCredentials: true })
            .then(response => {
                setAlert({ type: 'success', message: 'Origin economics data ingested successfully!' });
                fetchOriginEconomicsData();
            })
            .catch(error => setAlert({ type: 'danger', message: 'Error ingesting origin economics data.' }));
    };

    // Opens the modal for add/update operation
    const openModal = (mode, data) => {
        setFormMode(mode);
        if (mode === 'update') {
            setOriginEconomicsDetails({
                survey_origin: data.survey_origin,
                survey_year: data.survey_year,
                origin_living_income_benchmark_lc: data.origin_living_income_benchmark_lc || '',
                origin_currency: data.origin_currency || '',
                origin_currency_to_usd: data.origin_currency_to_usd || ''
            });
            setModalOpen(true);
        } else {
            setOriginEconomicsDetails({
                survey_origin: '',
                survey_year: '',
                origin_living_income_benchmark_lc: '',
                origin_currency: '',
                origin_currency_to_usd: ''
            });
            setModalOpen(true);
        }
    };

    // Opens the delete modal
    const openDeleteModal = (data) => {
        setSelectedOriginEconomicsData(data);
        setDeleteModalOpen(true);
    };

    // State variable for search term
    const [searchTerm, setSearchTerm] = useState('');

    // Filters the origin economics data based on the search term
    const filteredOriginEconomicsData = originEconomicsData.filter(data => {
        return data.survey_origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
            data.survey_year.toLowerCase().includes(searchTerm.toLowerCase()) ||
            data.origin_living_income_benchmark_lc.toString().includes(searchTerm) ||
            data.origin_currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
            data.origin_currency_to_usd.toString().includes(searchTerm);
    });

    return (
        <div className="fertilizer-container mx-auto p-8">
            <div className="header-section">
                <h1 className="text-2xl font-bold mb-4">Origin Economics Data Management</h1>
                {alert && <div className={`alert ${alert.type === 'danger' ? 'bg-red-500' : 'bg-green-500'} text-white p-2 mb-4 rounded`}>{alert.message}</div>}
                <div className="flex items-center ml-auto">
                    <input
                        type="text"
                        placeholder="Search Economics..."
                        className="p-1 border border-gray-300 rounded w-32 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="bg-green-500 text-white p-2 rounded hover:bg-green-700 transition duration-200 mb-4" onClick={() => openModal('add')}>
                    Add Origin Economics Data
                </button>
                <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 transition duration-200 mb-4 ml-4" onClick={handleIngest}>
                    Ingest Origin Economics Data from Survey
                </button>
            </div>
            <div className="table-wrapper">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Survey Origin</th>
                            <th className="py-2 px-4 border-b">Survey Year</th>
                            <th className="py-2 px-4 border-b">Living Income Benchmark (LC)</th>
                            <th className="py-2 px-4 border-b">Currency</th>
                            <th className="py-2 px-4 border-b">Currency to USD Rate</th>
                            <th className="py-2 px-4 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOriginEconomicsData.map((data, index) => (
                            <tr key={index}>
                                <td className="py-2 px-4 border-b">{data.survey_origin}</td>
                                <td className="py-2 px-4 border-b">{data.survey_year}</td>
                                <td className="py-2 px-4 border-b">{data.origin_living_income_benchmark_lc || 'NULL'}</td>
                                <td className="py-2 px-4 border-b">{data.origin_currency || 'NULL'}</td>
                                <td className="py-2 px-4 border-b">{data.origin_currency_to_usd || 'NULL'}</td>
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
                        <h2 className="text-xl font-bold mb-4">{formMode.charAt(0).toUpperCase() + formMode.slice(1)} Origin Economics Data</h2>
                        <div>
                            <div className="form-group">
                                <label className="block text-gray-700">Survey Origin</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={originEconomicsDetails.survey_origin}
                                    onChange={e => setOriginEconomicsDetails({ ...originEconomicsDetails, survey_origin: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Survey Year</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={originEconomicsDetails.survey_year}
                                    onChange={e => setOriginEconomicsDetails({ ...originEconomicsDetails, survey_year: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Living Income Benchmark (LC)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={originEconomicsDetails.origin_living_income_benchmark_lc}
                                    onChange={e => setOriginEconomicsDetails({ ...originEconomicsDetails, origin_living_income_benchmark_lc: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Currency</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={originEconomicsDetails.origin_currency}
                                    onChange={e => setOriginEconomicsDetails({ ...originEconomicsDetails, origin_currency: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Currency to USD Rate</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={originEconomicsDetails.origin_currency_to_usd}
                                    onChange={e => setOriginEconomicsDetails({ ...originEconomicsDetails, origin_currency_to_usd: e.target.value })}
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
                        <h2 className="text-xl font-bold mb-4">Delete Origin Economics Data</h2>
                        <p>Are you sure you want to delete the origin economics data for "{selectedOriginEconomicsData?.survey_year_origin}"?</p>
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

export default OriginEconomicsDataTable;
