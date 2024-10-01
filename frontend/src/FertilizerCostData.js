import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function FertilizerCostTable() {
    // State variables
    const [fertilizerCosts, setFertilizerCosts] = useState([]); // Stores the list of fertilizer costs
    const [selectedFertilizerCost, setSelectedFertilizerCost] = useState(null); // Stores the selected fertilizer cost
    const [modalOpen, setModalOpen] = useState(false); // Controls the visibility of the modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false); // Controls the visibility of the delete modal
    const [formMode, setFormMode] = useState('add'); // Tracks the mode of the form (add or update)
    const [fertilizerCostDetails, setFertilizerCostDetails] = useState({
        // Stores the details of the fertilizer cost being added or updated
        survey_origin: '',
        survey_year: '',
        fertilizer_item_name: '',
        fertilizer_item_price_lc: '',
        fertilizer_item_price_unit: ''
    });
    const [alert, setAlert] = useState(null); // Stores the alert message

    useEffect(() => {
        // Fetches the fertilizer costs when the component mounts
        fetchFertilizerCosts();
    }, []);

    const fetchFertilizerCosts = () => {
        // Fetches the fertilizer costs from the server
        axios.get('https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/get_fertilizer_costs', { withCredentials: true })
            .then(response => setFertilizerCosts(response.data))
            .catch(error => console.error('Error fetching fertilizer costs:', error));
    };

    const handleAddUpdate = () => {
        // Handles the add or update operation of the fertilizer cost
        const url = formMode === 'add' ? 'https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/add_fertilizer_cost' : 'https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/update_fertilizer_cost';
        axios.post(url, fertilizerCostDetails, { withCredentials: true })
            .then(response => {
                setAlert({ type: 'success', message: `Fertilizer cost ${formMode}d successfully!` });
                fetchFertilizerCosts();
                setModalOpen(false);
            })
            .catch(error => setAlert({ type: 'danger', message: `Error ${formMode}ing fertilizer cost.` }));
    };

    const handleDelete = () => {
        // Handles the delete operation of the fertilizer cost
        axios.post('https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/delete_fertilizer_cost', { fertilizer_item_name: selectedFertilizerCost.fertilizer_item_name }, { withCredentials: true })
            .then(response => {
                setAlert({ type: 'success', message: 'Fertilizer cost deleted successfully!' });
                fetchFertilizerCosts();
                setSelectedFertilizerCost(null);
                setDeleteModalOpen(false);
            })
            .catch(error => {
                setAlert({ type: 'danger', message: 'Error deleting fertilizer cost.' });
                setDeleteModalOpen(false);
            });
    };

    const handleIngest = () => {
        // Handles the ingestion of fertilizer costs from a survey
        axios.post('https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/ingest_fertilizer_costs', {}, { withCredentials: true })
            .then(response => {
                setAlert({ type: 'success', message: 'Fertilizer costs ingested successfully!' });
                fetchFertilizerCosts();
            })
            .catch(error => setAlert({ type: 'danger', message: 'Error ingesting fertilizer costs.' }));
    };

    const openModal = (mode, fertilizerCost) => {
        // Opens the modal for adding or updating a fertilizer cost
        setFormMode(mode);
        if (mode === 'update') {
            setFertilizerCostDetails({
                survey_origin: fertilizerCost.survey_origin,
                survey_year: fertilizerCost.survey_year,
                fertilizer_item_name: fertilizerCost.fertilizer_item_name,
                fertilizer_item_price_lc: fertilizerCost.fertilizer_item_price_lc || '',
                fertilizer_item_price_unit: fertilizerCost.fertilizer_item_price_unit || ''
            });
            setModalOpen(true);
        } else {
            setFertilizerCostDetails({
                survey_origin: '',
                survey_year: '',
                fertilizer_item_name: '',
                fertilizer_item_price_lc: '',
                fertilizer_item_price_unit: ''
            });
            setModalOpen(true);
        }
    };

    const openDeleteModal = (fertilizerCost) => {
        // Opens the delete modal for confirming the deletion of a fertilizer cost
        setSelectedFertilizerCost(fertilizerCost);
        setDeleteModalOpen(true);
    };

    const [searchTerm, setSearchTerm] = useState('');

    const filteredFertilizerCosts = fertilizerCosts.filter(fertilizerCost => {
        // Filters the fertilizer costs based on the search term
        return fertilizerCost.fertilizer_item_name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="fertilizer-container mx-auto p-8">
            <div className="header-section">
                <h1 className="text-2xl font-bold mb-4">Fertilizer Cost Management</h1>
                {alert && <div className={`alert ${alert.type === 'danger' ? 'bg-red-500' : 'bg-green-500'} text-white p-2 mb-4 rounded`}>{alert.message}</div>}

                <div className="flex items-center ml-auto">
                    <input
                        type="text"
                        placeholder="Search fertilizer..."
                        className="p-1 border border-gray-300 rounded w-32 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="bg-green-500 text-white p-2 rounded hover:bg-green-700 transition duration-200 mb-4" onClick={() => openModal('add')}>
                    Add Fertilizer Cost
                </button>
                <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 transition duration-200 mb-4 ml-4" onClick={handleIngest}>
                    Ingest Fertilizer Costs from Survey
                </button>
            </div>
            <div className="table-wrapper">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Survey Origin</th>
                            <th className="py-2 px-4 border-b">Survey Year</th>
                            <th className="py-2 px-4 border-b">Fertilizer Item Name</th>
                            <th className="py-2 px-4 border-b">Price (Local Currency)</th>
                            <th className="py-2 px-4 border-b">Price Unit</th>
                            <th className="py-2 px-4 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFertilizerCosts.map((fertilizerCost, index) => (
                            <tr key={index}>
                                <td className="py-2 px-4 border-b">{fertilizerCost.survey_origin}</td>
                                <td className="py-2 px-4 border-b">{fertilizerCost.survey_year}</td>
                                <td className="py-2 px-4 border-b">{fertilizerCost.fertilizer_item_name}</td>
                                <td className="py-2 px-4 border-b">{fertilizerCost.fertilizer_item_price_lc || 'NULL'}</td>
                                <td className="py-2 px-4 border-b">{fertilizerCost.fertilizer_item_price_unit || 'NULL'}</td>
                                <td className="py-2 px-4 border-b table-actions">
                                    <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 transition duration-200 table-action" onClick={() => openModal('update', fertilizerCost)}>
                                        Update
                                    </button>
                                    <button className="bg-red-500 text-white p-2 rounded hover:bg-red-700 transition duration-200 table-action" onClick={() => openDeleteModal(fertilizerCost)}>
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
                        <h2 className="text-xl font-bold mb-4">{formMode.charAt(0).toUpperCase() + formMode.slice(1)} Fertilizer Cost</h2>
                        <div>
                            <div className="form-group">
                                <label className="block text-gray-700">Survey Origin</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={fertilizerCostDetails.survey_origin}
                                    onChange={e => setFertilizerCostDetails({ ...fertilizerCostDetails, survey_origin: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Survey Year</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={fertilizerCostDetails.survey_year}
                                    onChange={e => setFertilizerCostDetails({ ...fertilizerCostDetails, survey_year: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Fertilizer Item Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={fertilizerCostDetails.fertilizer_item_name}
                                    onChange={e => setFertilizerCostDetails({ ...fertilizerCostDetails, fertilizer_item_name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Price (Local Currency)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={fertilizerCostDetails.fertilizer_item_price_lc}
                                    onChange={e => setFertilizerCostDetails({ ...fertilizerCostDetails, fertilizer_item_price_lc: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Price Unit</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={fertilizerCostDetails.fertilizer_item_price_unit}
                                    onChange={e => setFertilizerCostDetails({ ...fertilizerCostDetails, fertilizer_item_price_unit: e.target.value })}
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
                        <h2 className="text-xl font-bold mb-4">Delete Fertilizer Cost</h2>
                        <p>Are you sure you want to delete the fertilizer cost "{selectedFertilizerCost?.fertilizer_item_name}"?</p>
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

export default FertilizerCostTable;
