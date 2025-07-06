

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../Dashboard/Sidebar';
import { Header } from '../Dashboard/Header';
import { FiEdit, FiTrash2, FiPlus, FiRefreshCw } from 'react-icons/fi';

const CardManagement = () => {
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [message, setMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updateCardData, setUpdateCardData] = useState({
    id: '',
    name: '',
    location: '',
    price: '',
    rating: '1',
    category: '',
    image_url: '',
    admin_id: '1',
  });
  const [createCardData, setCreateCardData] = useState({
    name: '',
    location: '',
    price: '',
    rating: '1',
    category: '',
    image_url: '',
    admin_id: '1',
  });

  const API_BASE_URL = 'http://localhost:5000/api/admin';

  useEffect(() => {
    handleFetchAllCards();
  }, []);

  const handleFetchAllCards = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/destinations`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }
      const data = await response.json();
      const sortedCards = data.sort((a, b) => new Date(b.created_at || a.created_at) - new Date(a.created_at));
      setCards(sortedCards);
      setSelectedCard(null);
      setMessage('');
    } catch (error) {
      console.error('Fetch All Cards Error:', error);
      setMessage(`Error fetching cards: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/destinations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createCardData),
      });
      if (!response.ok) throw new Error('Failed to create card');
      const newCard = await response.json();
      setCards([newCard, ...cards]);
      setMessage('Card created successfully');
      setShowCreateModal(false);
      setCreateCardData({
        name: '',
        location: '',
        price: '',
        rating: '1',
        category: '',
        image_url: '',
        admin_id: '1',
      });
    } catch (error) {
      setMessage('Error creating card: ' + error.message);
    }
  };

  const handleUpdateCard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/destinations/${updateCardData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateCardData),
      });
      if (!response.ok) throw new Error('Failed to update card');
      const updatedCard = await response.json();
      setCards(
        cards.map((card) =>
          card.id === updatedCard.id ? updatedCard : card
        )
      );
      if (selectedCard && selectedCard.id === updatedCard.id) {
        setSelectedCard(updatedCard);
      }
      setMessage('Card updated successfully');
      setShowUpdateModal(false);
    } catch (error) {
      setMessage('Error updating card: ' + error.message);
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/destinations/${cardId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete card');
      const data = await response.json();
      setMessage(data.message);
      setCards(cards.filter((card) => card.id !== cardId));
    } catch (error) {
      setMessage('Error deleting card: ' + error.message);
    }
  };

  const openUpdateModal = (card) => {
    setUpdateCardData({
      id: card.id,
      name: card.name,
      location: card.location,
      price: card.price,
      rating: card.rating,
      category: card.category,
      image_url: card.image_url,
      admin_id: card.admin_id || '1',
    });
    setShowUpdateModal(true);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Card Management</h1>
            <div className="flex space-x-2">
              <button
                onClick={handleFetchAllCards}
                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-black flex items-center"
                disabled={isLoading}
              >
                <FiRefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-600 flex items-center"
              >
                <FiPlus className="mr-2" /> Add Destination
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`p-4 mb-4 rounded-lg border ${
                message.includes('Error') ? 'bg-red-100 text-red-700 border-red-300' : 'bg-green-100 text-green-700 border-green-300'
              }`}
            >
              {message}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-blue">
              <thead className="bg-black">
                <tr>
                  {['ID', 'Name', 'Location', 'Price', 'Rating', 'Category', 'Image', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : cards.length > 0 ? (
                  cards.map((card) => (
                    <tr key={card.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{card.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{card.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{card.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${card.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{card.rating}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{card.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {card.image_url && <img src={card.image_url} alt={card.name} className="w-16 h-16 object-cover" />}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-4">
                          <button onClick={() => openUpdateModal(card)} className="text-blue-600 hover:text-blue-900">
                            <FiEdit size={20} />
                          </button>
                          <button onClick={() => handleDeleteCard(card.id)} className="text-red-600 hover:text-red-900">
                            <FiTrash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      No destinations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Update Destination</h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <label className="text-sm font-medium text-gray-700 w-28">Name</label>
                <input
                  type="text"
                  value={updateCardData.name}
                  onChange={(e) => setUpdateCardData({ ...updateCardData, name: e.target.value })}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter destination name"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <label className="text-sm font-medium text-gray-700 w-28">Location</label>
                <input
                  type="text"
                  value={updateCardData.location}
                  onChange={(e) => setUpdateCardData({ ...updateCardData, location: e.target.value })}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <label className="text-sm font-medium text-gray-700 w-28">Price</label>
                <input
                  type="number"
                  value={updateCardData.price}
                  onChange={(e) => setUpdateCardData({ ...updateCardData, price: e.target.value })}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter price"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <label className="text-sm font-medium text-gray-700 w-28">Rating</label>
                <select
                  value={updateCardData.rating}
                  onChange={(e) => setUpdateCardData({ ...updateCardData, rating: e.target.value })}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select rating</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <label className="text-sm font-medium text-gray-700 w-28">Category</label>
                <input
                  type="text"
                  value={updateCardData.category}
                  onChange={(e) => setUpdateCardData({ ...updateCardData, category: e.target.value })}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <label className="text-sm font-medium text-gray-700 w-28">Image URL</label>
                <div className="flex-1">
                  <input
                    type="text"
                    value={updateCardData.image_url}
                    onChange={(e) => setUpdateCardData({ ...updateCardData, image_url: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter image URL"
                  />
                  {updateCardData.image_url && (
                    <img src={updateCardData.image_url} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCard}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Create Destination</h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <label className="text-sm font-medium text-gray-700 w-28">Name</label>
                <input
                  type="text"
                  value={createCardData.name}
                  onChange={(e) => setCreateCardData({ ...createCardData, name: e.target.value })}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter destination name"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <label className="text-sm font-medium text-gray-700 w-28">Location</label>
                <input
                  type="text"
                  value={createCardData.location}
                  onChange={(e) => setCreateCardData({ ...createCardData, location: e.target.value })}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <label className="text-sm font-medium text-gray-700 w-28">Price</label>
                <input
                  type="number"
                  value={createCardData.price}
                  onChange={(e) => setCreateCardData({ ...createCardData, price: e.target.value })}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter price"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <label className="text-sm font-medium text-gray-700 w-28">Rating</label>
                <select
                  value={createCardData.rating}
                  onChange={(e) => setCreateCardData({ ...createCardData, rating: e.target.value })}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select rating</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <label className="text-sm font-medium text-gray-700 w-28">Category</label>
                <input
                  type="text"
                  value={createCardData.category}
                  onChange={(e) => setCreateCardData({ ...createCardData, category: e.target.value })}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <label className="text-sm font-medium text-gray-700 w-28">Image URL</label>
                <div className="flex-1">
                  <input
                    type="text"
                    value={createCardData.image_url}
                    onChange={(e) => setCreateCardData({ ...createCardData, image_url: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter image URL"
                  />
                  {createCardData.image_url && (
                    <img src={createCardData.image_url} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCard}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardManagement;