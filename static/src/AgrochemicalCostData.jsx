import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function AgrochemicalCostTable() {
    // State variables
    const [agrochemicalCosts, setAgrochemicalCosts] = useState([]);
    const [selectedAgrochemicalCost, setSelectedAgrochemicalCost] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [formMode, setFormMode] = useState('add');
    const [agrochemicalCostDetails, setAgrochemicalCostDetails] = useState({
        survey_origin: '',
        survey_year: '',
        agrochemical_item_name: '',
        agrochemical_item_price_lc: '',
        agrochemical_item_price_unit: ''
    });
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        // Fetch agrochemical costs when the component mounts
        fetchAgrochemicalCosts();
    }, []);

    const fetchAgrochemicalCosts = () => {
        // Fetch agrochemical costs from the server
        axios.get('https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/get_agrochemical_costs', { withCredentials: true })
            .then(response => setAgrochemicalCosts(response.data))
            .catch(error => console.error('Error fetching agrochemical costs:', error));
    };

    const handleAddUpdate = () => {
        // Add or update agrochemical cost
        const url = formMode === 'add' ? 'https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/add_agrochemical_cost' : 'https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/update_agrochemical_cost';
        axios.post(url, agrochemicalCostDetails, { withCredentials: true })
            .then(response => {
                setAlert({ type: 'success', message: `Agrochemical cost ${formMode}d successfully!` });
                fetchAgrochemicalCosts();
                setModalOpen(false);
            })
            .catch(error => setAlert({ type: 'danger', message: `Error ${formMode}ing agrochemical cost.` }));
    };

    const handleDelete = () => {
        // Delete agrochemical cost
        axios.post('https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/delete_agrochemical_cost', { agrochemical_item_name: selectedAgrochemicalCost.agrochemical_item_name }, { withCredentials: true })
            .then(response => {
                setAlert({ type: 'success', message: 'Agrochemical cost deleted successfully!' });
                fetchAgrochemicalCosts();
                setSelectedAgrochemicalCost(null);
                setDeleteModalOpen(false);
            })
            .catch(error => {
                setAlert({ type: 'danger', message: 'Error deleting agrochemical cost.' });
                setDeleteModalOpen(false);
            });
    };

    const handleIngest = () => {
        // Ingest agrochemical costs from survey
        axios.post('https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/ingest_agrochemical_costs', {}, { withCredentials: true })
            .then(response => {
                setAlert({ type: 'success', message: 'Agrochemical costs ingested successfully!' });
                fetchAgrochemicalCosts();
            })
            .catch(error => setAlert({ type: 'danger', message: 'Error ingesting agrochemical costs.' }));
    };

    const openModal = (mode, agrochemicalCost) => {
        // Open modal for adding or updating agrochemical cost
        setFormMode(mode);
        if (mode === 'update') {
            setAgrochemicalCostDetails({
                survey_origin: agrochemicalCost.survey_origin,
                survey_year: agrochemicalCost.survey_year,
                agrochemical_item_name: agrochemicalCost.agrochemical_item_name,
                agrochemical_item_price_lc: agrochemicalCost.agrochemical_item_price_lc || '',
                agrochemical_item_price_unit: agrochemicalCost.agrochemical_item_price_unit || ''
            });
            setModalOpen(true);
        } else {
            setAgrochemicalCostDetails({
                survey_origin: '',
                survey_year: '',
                agrochemical_item_name: '',
                agrochemical_item_price_lc: '',
                agrochemical_item_price_unit: ''
            });
            setModalOpen(true);
        }
    };

    const openDeleteModal = (agrochemicalCost) => {
        // Open modal for deleting agrochemical cost
        setSelectedAgrochemicalCost(agrochemicalCost);
        setDeleteModalOpen(true);
    };

    const [searchTerm, setSearchTerm] = useState('');

    const filteredAgrochemicalCosts = agrochemicalCosts.filter(agrochemicalCost => {
        // Filter agrochemical costs based on search term
        return agrochemicalCost.agrochemical_item_name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="fertilizer-container mx-auto p-8">
            <div className="header-section">
                <h1 className="text-2xl font-bold mb-4">Agrochemical Cost Management</h1>
                {alert && <div className={`alert ${alert.type === 'danger' ? 'bg-red-500' : 'bg-green-500'} text-white p-2 mb-4 rounded`}>{alert.message}</div>}
                <div className="flex items-center ml-auto">
                    <input
                        type="text"
                        placeholder="Search Agrochemicals ..."
                        className="p-1 border border-gray-300 rounded w-32 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="bg-green-500 text-white p-2 rounded hover:bg-green-700 transition duration-200 mb-4" onClick={() => openModal('add')}>
                    Add Agrochemical Cost
                </button>
                <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 transition duration-200 mb-4 ml-4" onClick={handleIngest}>
                    Ingest Agrochemical Costs from Survey
                </button>
            </div>
            <div className="table-wrapper">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Survey Origin</th>
                            <th className="py-2 px-4 border-b">Survey Year</th>
                            <th className="py-2 px-4 border-b">Agrochemical Item Name</th>
                            <th className="py-2 px-4 border-b">Price (Local Currency)</th>
                            <th className="py-2 px-4 border-b">Price Unit</th>
                            <th className="py-2 px-4 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAgrochemicalCosts.map((agrochemicalCost, index) => (
                            <tr key={index}>
                                <td className="py-2 px-4 border-b">{agrochemicalCost.survey_origin}</td>
                                <td className="py-2 px-4 border-b">{agrochemicalCost.survey_year}</td>
                                <td className="py-2 px-4 border-b">{agrochemicalCost.agrochemical_item_name}</td>
                                <td className="py-2 px-4 border-b">{agrochemicalCost.agrochemical_item_price_lc || 'NULL'}</td>
                                <td className="py-2 px-4 border-b">{agrochemicalCost.agrochemical_item_price_unit || 'NULL'}</td>
                                <td className="py-2 px-4 border-b table-actions">
                                    <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 transition duration-200 table-action" onClick={() => openModal('update', agrochemicalCost)}>
                                        Update
                                    </button>
                                    <button className="bg-red-500 text-white p-2 rounded hover:bg-red-700 transition duration-200 table-action" onClick={() => openDeleteModal(agrochemicalCost)}>
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
                        <h2 className="text-xl font-bold mb-4">{formMode.charAt(0).toUpperCase() + formMode.slice(1)} Agrochemical Cost</h2>
                        <div>
                            <div className="form-group">
                                <label className="block text-gray-700">Survey Origin</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={agrochemicalCostDetails.survey_origin}
                                    onChange={e => setAgrochemicalCostDetails({ ...agrochemicalCostDetails, survey_origin: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Survey Year</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={agrochemicalCostDetails.survey_year}
                                    onChange={e => setAgrochemicalCostDetails({ ...agrochemicalCostDetails, survey_year: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Agrochemical Item Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={agrochemicalCostDetails.agrochemical_item_name}
                                    onChange={e => setAgrochemicalCostDetails({ ...agrochemicalCostDetails, agrochemical_item_name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Price (Local Currency)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={agrochemicalCostDetails.agrochemical_item_price_lc}
                                    onChange={e => setAgrochemicalCostDetails({ ...agrochemicalCostDetails, agrochemical_item_price_lc: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Price Unit</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={agrochemicalCostDetails.agrochemical_item_price_unit}
                                    onChange={e => setAgrochemicalCostDetails({ ...agrochemicalCostDetails, agrochemical_item_price_unit: e.target.value })}
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
                        <h2 className="text-xl font-bold mb-4">Delete Agrochemical Cost</h2>
                        <p>Are you sure you want to delete the agrochemical cost "{selectedAgrochemicalCost?.agrochemical_item_name}"?</p>
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

export default AgrochemicalCostTable;
