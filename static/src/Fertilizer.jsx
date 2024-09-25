import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function FertilizerTable() {
  // State variables
  const [fertilizers, setFertilizers] = useState([]); // Stores the list of fertilizers
  const [selectedFertilizer, setSelectedFertilizer] = useState(null); // Stores the selected fertilizer
  const [modalOpen, setModalOpen] = useState(false); // Controls the visibility of the modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // Controls the visibility of the delete modal
  const [formMode, setFormMode] = useState('add'); // Tracks the mode of the form (add or update)
  const [fertilizerDetails, setFertilizerDetails] = useState({ // Stores the details of the fertilizer being added or updated
    fertilizer_name: '',
    n_content: '',
    p_content: '',
    k_content: '',
    f_type: ''
  });
  const [alert, setAlert] = useState(null); // Stores the alert message
  const [searchTerm, setSearchTerm] = useState(''); // Stores the search term for filtering fertilizers

  useEffect(() => {
    // Fetch fertilizers when the component mounts
    fetchFertilizers();
  }, []);

  const fetchFertilizers = () => {
    // Fetches the list of fertilizers from the server
    axios.get('https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/get_fertilizers', { withCredentials: true })
      .then(response => setFertilizers(response.data))
      .catch(error => console.error('Error fetching fertilizers:', error));
  };

  const handleAddUpdate = () => {
    // Handles the add or update operation for a fertilizer
    const url = formMode === 'add' ? 'https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/add_fertilizer' : 'https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/update_fertilizer';
    axios.post(url, fertilizerDetails, { withCredentials: true })
      .then(response => {
        setAlert({ type: 'success', message: `Fertilizer ${formMode}d successfully!` });
        fetchFertilizers();
        setModalOpen(false);
      })
      .catch(error => setAlert({ type: 'danger', message: `Error ${formMode}ing fertilizer.` }));
  };

  const handleDelete = () => {
    // Handles the delete operation for a fertilizer
    axios.post('https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/delete_fertilizer', { fertilizer_name: selectedFertilizer.fertilizer_name }, { withCredentials: true })
      .then(response => {
        setAlert({ type: 'success', message: 'Fertilizer deleted successfully!' });
        fetchFertilizers();
        setSelectedFertilizer(null);
        setDeleteModalOpen(false);
      })
      .catch(error => {
        setAlert({ type: 'danger', message: 'Error deleting fertilizer.' });
        setDeleteModalOpen(false);
      });
  };

  const handleIngest = () => {
    // Handles the ingestion of fertilizers from a survey
    axios.post('https://sucafina-we-impact-webapp-01-gch6g5bjhrbndje6.westeurope-01.azurewebsites.net/ingest_fertilizers', {}, { withCredentials: true })
      .then(response => {
        setAlert({ type: 'success', message: 'Fertilizers ingested successfully!' });
        fetchFertilizers();
      })
      .catch(error => setAlert({ type: 'danger', message: 'Error ingesting fertilizers.' }));
  };

  const openModal = (mode, fertilizer) => {
    // Opens the modal for adding or updating a fertilizer
    setFormMode(mode);
    if (mode === 'update') {
      setFertilizerDetails({
        fertilizer_name: fertilizer.fertilizer_name,
        n_content: fertilizer.n_content || 'NULL',
        p_content: fertilizer.p_content || 'NULL',
        k_content: fertilizer.k_content || 'NULL',
        f_type: fertilizer.f_type || 'NULL'
      });
      setModalOpen(true);
    } else {
      setFertilizerDetails({
        fertilizer_name: '',
        n_content: '',
        p_content: '',
        k_content: '',
        f_type: ''
      });
      setModalOpen(true);
    }
  };

  const openDeleteModal = (fertilizer) => {
    // Opens the delete modal for a fertilizer
    setSelectedFertilizer(fertilizer);
    setDeleteModalOpen(true);
  };

  const filteredFertilizers = fertilizers.filter(fertilizer =>
    fertilizer.fertilizer_name && fertilizer.fertilizer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fertilizer-container mx-auto p-8">
      <div className="header-section">
        <h1 className="text-2xl font-bold mb-4">Fertilizer Management</h1>
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
          Add Fertilizer
        </button>
        <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 transition duration-200 mb-4 ml-4" onClick={handleIngest}>
          Ingest Fertilizers from Survey
        </button>
      </div>
      <div className="table-wrapper">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">N Content</th>
              <th className="py-2 px-4 border-b">P Content</th>
              <th className="py-2 px-4 border-b">K Content</th>
              <th className="py-2 px-4 border-b">Type</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFertilizers.map((fertilizer, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b">{fertilizer.fertilizer_name}</td>
                <td className="py-2 px-4 border-b">{fertilizer.n_content || 'NULL'}</td>
                <td className="py-2 px-4 border-b">{fertilizer.p_content || 'NULL'}</td>
                <td className="py-2 px-4 border-b">{fertilizer.k_content || 'NULL'}</td>
                <td className="py-2 px-4 border-b">{fertilizer.f_type || 'NULL'}</td>
                <td className="py-2 px-4 border-b table-actions">
                  <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 transition duration-200 table-action" onClick={() => openModal('update', fertilizer)}>
                    Update
                  </button>
                  <button className="bg-red-500 text-white p-2 rounded hover:bg-red-700 transition duration-200 table-action" onClick={() => openDeleteModal(fertilizer)}>
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
            <h2 className="text-xl font-bold mb-4">{formMode.charAt(0).toUpperCase() + formMode.slice(1)} Fertilizer</h2>
            {formMode !== 'delete' && (
              <div>
                {formMode === 'add' && (
                  <div className="form-group">
                    <label className="block text-gray-700">Fertilizer Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded"
                      value={fertilizerDetails.fertilizer_name}
                      onChange={e => setFertilizerDetails({ ...fertilizerDetails, fertilizer_name: e.target.value })}
                    />
                  </div>
                )}
                <div className="form-group">
                  <label className="block text-gray-700">Nitrogen Content</label>
                  <input
                    type="number"
                    step="0.001"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={fertilizerDetails.n_content}
                    onChange={e => setFertilizerDetails({ ...fertilizerDetails, n_content: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="block text-gray-700">Phosphorus Content</label>
                  <input
                    type="number"
                    step="0.001"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={fertilizerDetails.p_content}
                    onChange={e => setFertilizerDetails({ ...fertilizerDetails, p_content: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="block text-gray-700">Potassium Content</label>
                  <input
                    type="number"
                    step="0.001"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={fertilizerDetails.k_content}
                    onChange={e => setFertilizerDetails({ ...fertilizerDetails, k_content: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="block text-gray-700">Fertilizer Type</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded"
                    value={fertilizerDetails.f_type}
                    onChange={e => setFertilizerDetails({ ...fertilizerDetails, f_type: e.target.value })}
                  >
                    <option value="">Choose...</option>
                    <option value="No fertilizer">No fertilizer</option>
                    <option value="Organic fertilizer">Organic fertilizer</option>
                    <option value="Synthetic fertilizer">Synthetic fertilizer</option>
                    <option value="Crop residues">Crop residues</option>
                    <option value="NPK fertilizer">NPK fertilizer</option>
                  </select>
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
            <h2 className="text-xl font-bold mb-4">Delete Fertilizer</h2>
            <p>Are you sure you want to delete the fertilizer "{selectedFertilizer?.fertilizer_name}"?</p>
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

export default FertilizerTable;
