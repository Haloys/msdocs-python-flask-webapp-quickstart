import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function SeedlingCostTable() {
    // State variables
    const [seedlingCosts, setSeedlingCosts] = useState([]); // Holds the list of seedling costs
    const [selectedSeedlingCost, setSelectedSeedlingCost] = useState(null); // Holds the currently selected seedling cost
    const [modalOpen, setModalOpen] = useState(false); // Controls the visibility of the add/update modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false); // Controls the visibility of the delete modal
    const [formMode, setFormMode] = useState('add'); // Tracks the mode of the form (add or update)
    const [seedlingCostDetails, setSeedlingCostDetails] = useState({ // Holds the details of the seedling cost being added/updated
        survey_origin: '',
        survey_year: '',
        seedling_item_name: '',
        seedling_item_price_lc: ''
    });
    const [alert, setAlert] = useState(null); // Holds the alert message to display
    const [searchTerm, setSearchTerm] = useState(''); // Holds the search term for filtering seedling costs

    useEffect(() => {
        // Fetch seedling costs when the component mounts
        fetchSeedlingCosts();
    }, []);

    const fetchSeedlingCosts = () => {
        // Fetch seedling costs from the server
        axios.get('https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/get_seedling_costs', { withCredentials: true })
            .then(response => setSeedlingCosts(response.data))
            .catch(error => console.error('Error fetching seedling costs:', error));
    };

    const handleAddUpdate = () => {
        // Handle adding or updating a seedling cost
        const url = formMode === 'add' ? 'https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/add_seedling_cost' : 'https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/update_seedling_cost';
        axios.post(url, seedlingCostDetails, { withCredentials: true })
            .then(response => {
                setAlert({ type: 'success', message: `Seedling cost ${formMode}d successfully!` });
                fetchSeedlingCosts();
                setModalOpen(false);
            })
            .catch(error => setAlert({ type: 'danger', message: `Error ${formMode}ing seedling cost.` }));
    };

    const handleDelete = () => {
        // Handle deleting a seedling cost
        axios.post('https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/delete_seedling_cost', { seedling_item_name: selectedSeedlingCost.seedling_item_name }, { withCredentials: true })
            .then(response => {
                setAlert({ type: 'success', message: 'Seedling cost deleted successfully!' });
                fetchSeedlingCosts();
                setSelectedSeedlingCost(null);
                setDeleteModalOpen(false);
            })
            .catch(error => {
                setAlert({ type: 'danger', message: 'Error deleting seedling cost.' });
                setDeleteModalOpen(false);
            });
    };

    const handleIngest = () => {
        // Handle ingesting seedling costs from a survey
        axios.post('https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/ingest_seedling_costs', {}, { withCredentials: true })
            .then(response => {
                setAlert({ type: 'success', message: 'Seedling costs ingested successfully!' });
                fetchSeedlingCosts();
            })
            .catch(error => setAlert({ type: 'danger', message: 'Error ingesting seedling costs.' }));
    };

    const openModal = (mode, seedlingCost) => {
        // Open the add/update modal
        setFormMode(mode);
        if (mode === 'update') {
            setSeedlingCostDetails({
                survey_origin: seedlingCost.survey_origin,
                survey_year: seedlingCost.survey_year,
                seedling_item_name: seedlingCost.seedling_item_name,
                seedling_item_price_lc: seedlingCost.seedling_item_price_lc || ''
            });
            setModalOpen(true);
        } else {
            setSeedlingCostDetails({
                survey_origin: '',
                survey_year: '',
                seedling_item_name: '',
                seedling_item_price_lc: ''
            });
            setModalOpen(true);
        }
    };

    const openDeleteModal = (seedlingCost) => {
        // Open the delete modal
        setSelectedSeedlingCost(seedlingCost);
        setDeleteModalOpen(true);
    };

    const filteredSeedlingCosts = seedlingCosts.filter(seedlingCost => {
        // Filter seedling costs based on the search term
        return seedlingCost.seedling_item_name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="fertilizer-container mx-auto p-8">
            <div className="header-section">
                <h1 className="text-2xl font-bold mb-4">Seedling Cost Management</h1>
                {alert && <div className={`alert ${alert.type === 'danger' ? 'bg-red-500' : 'bg-green-500'} text-white p-2 mb-4 rounded`}>{alert.message}</div>}
                <div className="flex items-center ml-auto">
                    <input
                        type="text"
                        placeholder="Search Seedling..."
                        className="p-1 border border-gray-300 rounded w-32 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="bg-green-500 text-white p-2 rounded hover:bg-green-700 transition duration-200 mb-4" onClick={() => openModal('add')}>
                    Add Seedling Cost
                </button>
                <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 transition duration-200 mb-4 ml-4" onClick={handleIngest}>
                    Ingest Seedling Costs from Survey
                </button>
            </div>
            <div className="table-wrapper">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Survey Origin</th>
                            <th className="py-2 px-4 border-b">Survey Year</th>
                            <th className="py-2 px-4 border-b">Seedling Item Name</th>
                            <th className="py-2 px-4 border-b">Price (Local Currency)</th>
                            <th className="py-2 px-4 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSeedlingCosts.map((seedlingCost, index) => (
                            <tr key={index}>
                                <td className="py-2 px-4 border-b">{seedlingCost.survey_origin}</td>
                                <td className="py-2 px-4 border-b">{seedlingCost.survey_year}</td>
                                <td className="py-2 px-4 border-b">{seedlingCost.seedling_item_name}</td>
                                <td className="py-2 px-4 border-b">{seedlingCost.seedling_item_price_lc || 'NULL'}</td>
                                <td className="py-2 px-4 border-b table-actions">
                                    <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 transition duration-200 table-action" onClick={() => openModal('update', seedlingCost)}>
                                        Update
                                    </button>
                                    <button className="bg-red-500 text-white p-2 rounded hover:bg-red-700 transition duration-200 table-action" onClick={() => openDeleteModal(seedlingCost)}>
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
                        <h2 className="text-xl font-bold mb-4">{formMode.charAt(0).toUpperCase() + formMode.slice(1)} Seedling Cost</h2>
                        <div>
                            <div className="form-group">
                                <label className="block text-gray-700">Survey Origin</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={seedlingCostDetails.survey_origin}
                                    onChange={e => setSeedlingCostDetails({ ...seedlingCostDetails, survey_origin: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Survey Year</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={seedlingCostDetails.survey_year}
                                    onChange={e => setSeedlingCostDetails({ ...seedlingCostDetails, survey_year: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Seedling Item Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={seedlingCostDetails.seedling_item_name}
                                    onChange={e => setSeedlingCostDetails({ ...seedlingCostDetails, seedling_item_name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Price (Local Currency)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={seedlingCostDetails.seedling_item_price_lc}
                                    onChange={e => setSeedlingCostDetails({ ...seedlingCostDetails, seedling_item_price_lc: e.target.value })}
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
                        <h2 className="text-xl font-bold mb-4">Delete Seedling Cost</h2>
                        <p>Are you sure you want to delete the seedling cost "{selectedSeedlingCost?.seedling_item_name}"?</p>
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

export default SeedlingCostTable;
