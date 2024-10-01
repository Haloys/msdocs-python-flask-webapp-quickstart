import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function LaborCostTable() {
    const [laborCosts, setLaborCosts] = useState([]); // State to store labor costs
    const [selectedLaborCost, setSelectedLaborCost] = useState(null); // State to store selected labor cost
    const [modalOpen, setModalOpen] = useState(false); // State to manage modal open/close
    const [deleteModalOpen, setDeleteModalOpen] = useState(false); // State to manage delete modal open/close
    const [formMode, setFormMode] = useState('add'); // State to track form mode (add/update/delete)
    const [laborCostDetails, setLaborCostDetails] = useState({ // State to store labor cost details
        survey_origin: '',
        survey_year: '',
        laborer_activity_name: '',
        laborer_activity_cost_per_day: ''
    });
    const [alert, setAlert] = useState(null); // State to display alerts

    useEffect(() => {
        fetchLaborCosts(); // Fetch labor costs on component mount
    }, []);

    const fetchLaborCosts = () => {
        axios.get('https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/get_labor_costs', { withCredentials: true }) // Fetch labor costs from API
            .then(response => setLaborCosts(response.data)) // Update labor costs state with fetched data
            .catch(error => console.error('Error fetching labor costs:', error)); // Handle error if any
    };

    const handleAddUpdate = () => {
        const url = formMode === 'add' ? 'https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/add_labor_cost' : 'https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/update_labor_cost';
        axios.post(url, laborCostDetails, { withCredentials: true }) // Add or update labor cost using API
            .then(response => {
                setAlert({ type: 'success', message: `Labor cost ${formMode}d successfully!` }); // Show success alert
                fetchLaborCosts(); // Fetch updated labor costs
                setModalOpen(false); // Close the modal
            })
            .catch(error => setAlert({ type: 'danger', message: `Error ${formMode}ing labor cost.` })); // Show error alert
    };

    const handleDelete = () => {
        axios.post('https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/delete_labor_cost', { laborer_activity_name: selectedLaborCost.laborer_activity_name }, { withCredentials: true }) // Delete labor cost using API
            .then(response => {
                setAlert({ type: 'success', message: 'Labor cost deleted successfully!' }); // Show success alert
                fetchLaborCosts(); // Fetch updated labor costs
                setSelectedLaborCost(null); // Clear selected labor cost
                setDeleteModalOpen(false); // Close the delete modal
            })
            .catch(error => {
                setAlert({ type: 'danger', message: 'Error deleting labor cost.' }); // Show error alert
                setDeleteModalOpen(false); // Close the delete modal
            });
    };

    const handleIngest = () => {
        axios.post('https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/ingest_labor_costs', {}, { withCredentials: true }) // Ingest labor costs using API
            .then(response => {
                setAlert({ type: 'success', message: 'Labor costs ingested successfully!' }); // Show success alert
                fetchLaborCosts(); // Fetch updated labor costs
            })
            .catch(error => setAlert({ type: 'danger', message: 'Error ingesting labor costs.' })); // Show error alert
    };

    const openModal = (mode, laborCost) => {
        setFormMode(mode); // Set the form mode (add/update)
        if (mode === 'update') {
            setLaborCostDetails({
                survey_origin: laborCost.survey_origin,
                survey_year: laborCost.survey_year,
                laborer_activity_name: laborCost.laborer_activity_name,
                laborer_activity_cost_per_day: laborCost.laborer_activity_cost_per_day || ''
            });
            setModalOpen(true); // Open the modal for update mode
        } else {
            setLaborCostDetails({
                survey_origin: '',
                survey_year: '',
                laborer_activity_name: '',
                laborer_activity_cost_per_day: ''
            });
            setModalOpen(true); // Open the modal for add mode
        }
    };

    const openDeleteModal = (laborCost) => {
        setSelectedLaborCost(laborCost); // Set the selected labor cost for deletion
        setDeleteModalOpen(true); // Open the delete modal
    };

    const [searchTerm, setSearchTerm] = useState(''); // State to store search term

    const filteredLaborCosts = laborCosts.filter(laborCost => {
        return laborCost.laborer_activity_name.toLowerCase().includes(searchTerm.toLowerCase()); // Filter labor costs based on search term
    });

    return (
        <div className="fertilizer-container mx-auto p-8">
            <div className="header-section">
                <h1 className="text-2xl font-bold mb-4">Labor Cost Management</h1>
                {alert && <div className={`alert ${alert.type === 'danger' ? 'bg-red-500' : 'bg-green-500'} text-white p-2 mb-4 rounded`}>{alert.message}</div>}

                <div className="flex items-center ml-auto">
                    <input
                        type="text"
                        placeholder="Search Labor..."
                        className="p-1 border border-gray-300 rounded w-32 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="bg-green-500 text-white p-2 rounded hover:bg-green-700 transition duration-200 mb-4" onClick={() => openModal('add')}>
                    Add Labor Cost
                </button>
                <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 transition duration-200 mb-4 ml-4" onClick={handleIngest}>
                    Ingest Labor Costs from Survey
                </button>
            </div>
            <div className="table-wrapper">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Survey Origin</th>
                            <th className="py-2 px-4 border-b">Survey Year</th>
                            <th className="py-2 px-4 border-b">Laborer Activity Name</th>
                            <th className="py-2 px-4 border-b">Cost Per Day (Local Currency)</th>
                            <th className="py-2 px-4 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLaborCosts.map((laborCost, index) => (
                            <tr key={index}>
                                <td className="py-2 px-4 border-b">{laborCost.survey_origin}</td>
                                <td className="py-2 px-4 border-b">{laborCost.survey_year}</td>
                                <td className="py-2 px-4 border-b">{laborCost.laborer_activity_name}</td>
                                <td className="py-2 px-4 border-b">{laborCost.laborer_activity_cost_per_day || 'NULL'}</td>
                                <td className="py-2 px-4 border-b table-actions">
                                    <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 transition duration-200 table-action" onClick={() => openModal('update', laborCost)}>
                                        Update
                                    </button>
                                    <button className="bg-red-500 text-white p-2 rounded hover:bg-red-700 transition duration-200 table-action" onClick={() => openDeleteModal(laborCost)}>
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
                        <h2 className="text-xl font-bold mb-4">{formMode.charAt(0).toUpperCase() + formMode.slice(1)} Labor Cost</h2>
                        <div>
                            <div className="form-group">
                                <label className="block text-gray-700">Survey Origin</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={laborCostDetails.survey_origin}
                                    onChange={e => setLaborCostDetails({ ...laborCostDetails, survey_origin: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Survey Year</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={laborCostDetails.survey_year}
                                    onChange={e => setLaborCostDetails({ ...laborCostDetails, survey_year: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Laborer Activity Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={laborCostDetails.laborer_activity_name}
                                    onChange={e => setLaborCostDetails({ ...laborCostDetails, laborer_activity_name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Cost Per Day (Local Currency)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={laborCostDetails.laborer_activity_cost_per_day}
                                    onChange={e => setLaborCostDetails({ ...laborCostDetails, laborer_activity_cost_per_day: e.target.value })}
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
                        <h2 className="text-xl font-bold mb-4">Delete Labor Cost</h2>
                        <p>Are you sure you want to delete the labor cost for "{selectedLaborCost?.laborer_activity_name}"?</p>
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

export default LaborCostTable;
