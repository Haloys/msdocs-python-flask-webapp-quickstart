import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function AgrochemicalTable() {
    // State variables
    const [agrochemicals, setAgrochemicals] = useState([]);
    const [selectedAgrochemical, setSelectedAgrochemical] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [formMode, setFormMode] = useState('add');
    const [agrochemicalDetails, setAgrochemicalDetails] = useState({
        agrochemical_name: '',
        agrochemical_type: '',
        active_ingredient_count: '',
        active_ingredient_name: '',
        active_ingredient_percentage: ''
    });
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        // Fetch agrochemicals when the component mounts
        fetchAgrochemicals();
    }, []);

    const fetchAgrochemicals = () => {
        // Fetch agrochemicals from the server
        axios.get('http://localhost:5000/get_agrochemicals', { withCredentials: true })
            .then(response => setAgrochemicals(response.data))
            .catch(error => console.error('Error fetching agrochemicals:', error));
    };

    const handleAddUpdate = () => {
        // Add or update an agrochemical
        const url = formMode === 'add' ? 'http://localhost:5000/add_agrochemical' : 'http://localhost:5000/update_agrochemical';
        axios.post(url, agrochemicalDetails, { withCredentials: true })
            .then(response => {
                setAlert({ type: 'success', message: `Agrochemical ${formMode}d successfully!` });
                fetchAgrochemicals();
                setModalOpen(false);
            })
            .catch(error => setAlert({ type: 'danger', message: `Error ${formMode}ing agrochemical.` }));
    };

    const handleDelete = () => {
        // Delete an agrochemical
        axios.post('http://localhost:5000/delete_agrochemical', { agrochemical_name: selectedAgrochemical.agrochemical_name }, { withCredentials: true })
            .then(response => {
                setAlert({ type: 'success', message: 'Agrochemical deleted successfully!' });
                fetchAgrochemicals();
                setSelectedAgrochemical(null);
                setDeleteModalOpen(false);
            })
            .catch(error => {
                setAlert({ type: 'danger', message: 'Error deleting agrochemical.' });
                setDeleteModalOpen(false);
            });
    };

    const handleIngest = () => {
        // Ingest agrochemicals from a survey
        axios.post('http://localhost:5000/ingest_agrochemicals', {}, { withCredentials: true })
            .then(response => {
                setAlert({ type: 'success', message: 'Agrochemicals ingested successfully!' });
                fetchAgrochemicals();
            })
            .catch(error => setAlert({ type: 'danger', message: 'Error ingesting agrochemicals.' }));
    };

    const openModal = (mode, agrochemical) => {
        // Open the modal for adding or updating an agrochemical
        setFormMode(mode);
        if (mode === 'update') {
            setAgrochemicalDetails({
                agrochemical_name: agrochemical.agrochemical_name,
                agrochemical_type: agrochemical.agrochemical_type || '',
                active_ingredient_count: agrochemical.active_ingredient_count || '',
                active_ingredient_name: agrochemical.active_ingredient_name || '',
                active_ingredient_percentage: agrochemical.active_ingredient_percentage || ''
            });
            setModalOpen(true);
        } else {
            setAgrochemicalDetails({
                agrochemical_name: '',
                agrochemical_type: '',
                active_ingredient_count: '',
                active_ingredient_name: '',
                active_ingredient_percentage: ''
            });
            setModalOpen(true);
        }
    };

    const openDeleteModal = (agrochemical) => {
        // Open the modal for deleting an agrochemical
        setSelectedAgrochemical(agrochemical);
        setDeleteModalOpen(true);
    };

    const [searchTerm, setSearchTerm] = useState('');

    const filteredAgrochemicals = agrochemicals.filter(agrochemical => {
        // Filter agrochemicals based on the search term
        return agrochemical.agrochemical_name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="fertilizer-container mx-auto p-8">
            <div className="header-section">
                <h1 className="text-2xl font-bold mb-4">Agrochemical Management</h1>
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
                    Add Agrochemical
                </button>
                <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 transition duration-200 mb-4 ml-4" onClick={handleIngest}>
                    Ingest Agrochemicals from Survey
                </button>
            </div>
            <div className="table-wrapper">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Name</th>
                            <th className="py-2 px-4 border-b">Type</th>
                            <th className="py-2 px-4 border-b">Active Ingredient Count</th>
                            <th className="py-2 px-4 border-b">Active Ingredient Name</th>
                            <th className="py-2 px-4 border-b">Active Ingredient Percentage</th>
                            <th className="py-2 px-4 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAgrochemicals.map((agrochemical, index) => (
                            <tr key={index}>
                                <td className="py-2 px-4 border-b">{agrochemical.agrochemical_name}</td>
                                <td className="py-2 px-4 border-b">{agrochemical.agrochemical_type || 'NULL'}</td>
                                <td className="py-2 px-4 border-b">{agrochemical.active_ingredient_count || 'NULL'}</td>
                                <td className="py-2 px-4 border-b">{agrochemical.active_ingredient_name || 'NULL'}</td>
                                <td className="py-2 px-4 border-b">{agrochemical.active_ingredient_percentage || 'NULL'}</td>
                                <td className="py-2 px-4 border-b table-actions">
                                    <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 transition duration-200 table-action" onClick={() => openModal('update', agrochemical)}>
                                        Update
                                    </button>
                                    <button className="bg-red-500 text-white p-2 rounded hover:bg-red-700 transition duration-200 table-action" onClick={() => openDeleteModal(agrochemical)}>
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
                        <h2 className="text-xl font-bold mb-4">{formMode.charAt(0).toUpperCase() + formMode.slice(1)} Agrochemical</h2>
                        {formMode !== 'delete' && (
                            <div>
                                {formMode === 'add' && (
                                    <div className="form-group">
                                        <label className="block text-gray-700">Agrochemical Name</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border border-gray-300 rounded"
                                            value={agrochemicalDetails.agrochemical_name}
                                            onChange={e => setAgrochemicalDetails({ ...agrochemicalDetails, agrochemical_name: e.target.value })}
                                        />
                                    </div>
                                )}
                                <div className="form-group">
                                    <label className="block text-gray-700">Agrochemical Type</label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded"
                                        value={agrochemicalDetails.agrochemical_type}
                                        onChange={e => setAgrochemicalDetails({ ...agrochemicalDetails, agrochemical_type: e.target.value })}
                                    >
                                        <option value="">Choose...</option>
                                        <option value="Bio-product">Bio-product</option>
                                        <option value="Fungicide">Fungicide</option>
                                        <option value="Herbicide">Herbicide</option>
                                        <option value="Insecticide">Insecticide</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="block text-gray-700">Active Ingredient Count</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border border-gray-300 rounded"
                                        value={agrochemicalDetails.active_ingredient_count}
                                        onChange={e => setAgrochemicalDetails({ ...agrochemicalDetails, active_ingredient_count: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="block text-gray-700">Active Ingredient Name</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border border-gray-300 rounded"
                                        value={agrochemicalDetails.active_ingredient_name}
                                        onChange={e => setAgrochemicalDetails({ ...agrochemicalDetails, active_ingredient_name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="block text-gray-700">Active Ingredient Percentage</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full p-2 border border-gray-300 rounded"
                                        value={agrochemicalDetails.active_ingredient_percentage}
                                        onChange={e => setAgrochemicalDetails({ ...agrochemicalDetails, active_ingredient_percentage: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
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
                        <h2 className="text-xl font-bold mb-4">Delete Agrochemical</h2>
                        <p>Are you sure you want to delete the agrochemical "{selectedAgrochemical?.agrochemical_name}"?</p>
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

export default AgrochemicalTable;
