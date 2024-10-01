import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function SurveyMasterDataTable() {
    // State variables
    const [surveyMasterData, setSurveyMasterData] = useState([]); // Stores the survey master data
    const [selectedSurveyMasterData, setSelectedSurveyMasterData] = useState(null); // Stores the selected survey master data
    const [modalOpen, setModalOpen] = useState(false); // Controls the visibility of the modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false); // Controls the visibility of the delete modal
    const [formMode, setFormMode] = useState('add'); // Tracks the form mode (add or update)
    const [surveyMasterDetails, setSurveyMasterDetails] = useState({ // Stores the details of the survey master data
        survey_origin: '',
        survey_coffee_type: '',
        survey_supply_chain: '',
        survey_year: '',
        total_number_of_farmers_in_the_supply_chain: '',
        number_of_survey_plots_part_of_deforestation_analysis: ''
    });
    const [alert, setAlert] = useState(null); // Stores the alert message

    // Fetches the survey master data on component mount
    useEffect(() => {
        fetchSurveyMasterData();
    }, []);

    // Fetches the survey master data from the server
    const fetchSurveyMasterData = () => {
        axios.get('https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/get_survey_master_data', { withCredentials: true })
            .then(response => setSurveyMasterData(response.data))
            .catch(error => console.error('Error fetching survey master data:', error));
    };

    // Handles the add/update operation for the survey master data
    const handleAddUpdate = () => {
        const url = formMode === 'add' ? 'https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/add_survey_master_data' : 'https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/update_survey_master_data';
        axios.post(url, surveyMasterDetails, { withCredentials: true })
            .then(response => {
                setAlert({ type: 'success', message: `Survey master data ${formMode}d successfully!` });
                fetchSurveyMasterData();
                setModalOpen(false);
            })
            .catch(error => setAlert({ type: 'danger', message: `Error ${formMode}ing survey master data.` }));
    };

    // Handles the delete operation for the survey master data
    const handleDelete = () => {
        axios.post('https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/delete_survey_master_data', { survey_id: selectedSurveyMasterData.survey_id }, { withCredentials: true })
            .then(response => {
                setAlert({ type: 'success', message: 'Survey master data deleted successfully!' });
                fetchSurveyMasterData();
                setSelectedSurveyMasterData(null);
                setDeleteModalOpen(false);
            })
            .catch(error => {
                setAlert({ type: 'danger', message: 'Error deleting survey master data.' });
                setDeleteModalOpen(false);
            });
    };

    // Handles the ingest operation for the survey master data
    const handleIngest = () => {
        axios.post('https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/ingest_survey_master_data', {}, { withCredentials: true })
            .then(response => {
                setAlert({ type: 'success', message: 'Survey master data ingested successfully!' });
                fetchSurveyMasterData();
            })
            .catch(error => setAlert({ type: 'danger', message: 'Error ingesting survey master data.' }));
    };

    // Opens the modal for adding/updating survey master data
    const openModal = (mode, surveyMasterData) => {
        setFormMode(mode);
        if (mode === 'update') {
            setSurveyMasterDetails({
                survey_origin: surveyMasterData.survey_origin,
                survey_coffee_type: surveyMasterData.survey_coffee_type,
                survey_supply_chain: surveyMasterData.survey_supply_chain,
                survey_year: surveyMasterData.survey_year,
                total_number_of_farmers_in_the_supply_chain: surveyMasterData.total_number_of_farmers_in_the_supply_chain || '',
                number_of_survey_plots_part_of_deforestation_analysis: surveyMasterData.number_of_survey_plots_part_of_deforestation_analysis || ''
            });
            setModalOpen(true);
        } else {
            setSurveyMasterDetails({
                survey_origin: '',
                survey_coffee_type: '',
                survey_supply_chain: '',
                survey_year: '',
                total_number_of_farmers_in_the_supply_chain: '',
                number_of_survey_plots_part_of_deforestation_analysis: ''
            });
            setModalOpen(true);
        }
    };

    // Opens the delete modal for confirming the deletion of survey master data
    const openDeleteModal = (surveyMasterData) => {
        setSelectedSurveyMasterData(surveyMasterData);
        setDeleteModalOpen(true);
    };

    // Handles the search term input
    const [searchTerm, setSearchTerm] = useState('');

    // Filters the survey master data based on the search term
    const filteredSurveyMasterData = surveyMasterData.filter(data => {
        return (
            data.survey_origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
            data.survey_coffee_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            data.survey_supply_chain.toLowerCase().includes(searchTerm.toLowerCase()) ||
            data.survey_year.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="fertilizer-container mx-auto p-8">
            <div className="header-section">
                <h1 className="text-2xl font-bold mb-4">Survey Master Data Management</h1>
                {alert && <div className={`alert ${alert.type === 'danger' ? 'bg-red-500' : 'bg-green-500'} text-white p-2 mb-4 rounded`}>{alert.message}</div>}
                <div className="flex items-center ml-auto">
                    <input
                        type="text"
                        placeholder="Search MasterData..."
                        className="p-1 border border-gray-300 rounded w-32 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="bg-green-500 text-white p-2 rounded hover:bg-green-700 transition duration-200 mb-4" onClick={() => openModal('add')}>
                    Add Survey Master Data
                </button>
                <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 transition duration-200 mb-4 ml-4" onClick={handleIngest}>
                    Ingest Survey Master Data from Survey
                </button>
            </div>
            <div className="table-wrapper">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Survey Origin</th>
                            <th className="py-2 px-4 border-b">Survey Coffee Type</th>
                            <th className="py-2 px-4 border-b">Survey Supply Chain</th>
                            <th className="py-2 px-4 border-b">Survey Year</th>
                            <th className="py-2 px-4 border-b">Total Farmers</th>
                            <th className="py-2 px-4 border-b">Survey Plots in Deforestation Analysis</th>
                            <th className="py-2 px-4 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSurveyMasterData.map((data, index) => (
                            <tr key={index}>
                                <td className="py-2 px-4 border-b">{data.survey_origin}</td>
                                <td className="py-2 px-4 border-b">{data.survey_coffee_type}</td>
                                <td className="py-2 px-4 border-b">{data.survey_supply_chain}</td>
                                <td className="py-2 px-4 border-b">{data.survey_year}</td>
                                <td className="py-2 px-4 border-b">{data.total_number_of_farmers_in_the_supply_chain || 'NULL'}</td>
                                <td className="py-2 px-4 border-b">{data.number_of_survey_plots_part_of_deforestation_analysis || 'NULL'}</td>
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
                        <h2 className="text-xl font-bold mb-4">{formMode.charAt(0).toUpperCase() + formMode.slice(1)} Survey Master Data</h2>
                        <div>
                            <div className="form-group">
                                <label className="block text-gray-700">Survey Origin</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={surveyMasterDetails.survey_origin}
                                    onChange={e => setSurveyMasterDetails({ ...surveyMasterDetails, survey_origin: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Survey Coffee Type</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={surveyMasterDetails.survey_coffee_type}
                                    onChange={e => setSurveyMasterDetails({ ...surveyMasterDetails, survey_coffee_type: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Survey Supply Chain</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={surveyMasterDetails.survey_supply_chain}
                                    onChange={e => setSurveyMasterDetails({ ...surveyMasterDetails, survey_supply_chain: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Survey Year</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={surveyMasterDetails.survey_year}
                                    onChange={e => setSurveyMasterDetails({ ...surveyMasterDetails, survey_year: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Total Farmers</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={surveyMasterDetails.total_number_of_farmers_in_the_supply_chain}
                                    onChange={e => setSurveyMasterDetails({ ...surveyMasterDetails, total_number_of_farmers_in_the_supply_chain: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="block text-gray-700">Survey Plots in Deforestation Analysis</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value={surveyMasterDetails.number_of_survey_plots_part_of_deforestation_analysis}
                                    onChange={e => setSurveyMasterDetails({ ...surveyMasterDetails, number_of_survey_plots_part_of_deforestation_analysis: e.target.value })}
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
                        <h2 className="text-xl font-bold mb-4">Delete Survey Master Data</h2>
                        <p>Are you sure you want to delete the survey master data for "{selectedSurveyMasterData?.survey_id}"?</p>
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

export default SurveyMasterDataTable;
