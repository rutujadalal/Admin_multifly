
import React, { useState, useEffect } from 'react';
import { Sidebar } from '../Dashboard/Sidebar';
import { Header } from '../Dashboard/Header';
import { FiEdit, FiTrash2, FiLock, FiUnlock } from 'react-icons/fi';

const UserAdmin = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [message, setMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [updateUserData, setUpdateUserData] = useState({ id: '', name: '', phone: '' });

  const API_BASE_URL = 'http://localhost:5000';

  // Helper function to get the auth token from localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  };

  // Helper function to validate user object
  const validateUserData = (user) => {
    const requiredFields = ['id', 'name', 'email', 'phone', 'role', 'status', 'created_at', 'updated_at'];
    const missingFields = requiredFields.filter(field => user[field] === undefined || user[field] === null);
    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  };

  // Helper function to format dates safely
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
  };

  useEffect(() => {
    // Close sidebar by default on mobile screens
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    handleFetchAllUsers();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFetchAllUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }
      const { success, data } = await response.json();
      console.log('Fetch all users response:', { success, data });
      if (!success) {
        throw new Error('Failed to fetch users');
      }
      if (!Array.isArray(data)) {
        console.error('Fetch all users error: data is not an array', { data });
        throw new Error('Invalid response: Expected an array of users');
      }
      setUsers(data);
      setSelectedUser(null);
      setMessage('');
    } catch (error) {
      console.error('Fetch All Users Error:', error);
      setMessage(`Error fetching users: ${error.message}`);
      setUsers([]);
      setSelectedUser(null);
    }
  };

  const handleSearchUser = async () => {
    if (!searchInput.trim()) {
      setMessage('Please enter a user ID or name.');
      return;
    }
    try {
      const isNumericId = /^\d+$/.test(searchInput.trim());
      const url = isNumericId
        ? `${API_BASE_URL}/users/${searchInput.trim()}`
        : `${API_BASE_URL}/users?name=${encodeURIComponent(searchInput.trim())}`;

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      console.log(`Search response status: ${response.status}`);
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Search error response:', errorData);
        if (response.status === 404) {
          setSelectedUser(null);
          setUsers([]);
          setMessage('No users found.');
          return;
        }
        throw new Error(errorData.error || `Search failed with status ${response.status}`);
      }
      const { success, data } = await response.json();
      console.log('Search response:', { success, data });
      if (!success) {
        throw new Error('Search failed');
      }

      if (isNumericId) {
        const validation = validateUserData(data);
        if (!validation.isValid) {
          console.log('Invalid user data from ID search:', { missingFields: validation.missingFields });
          setMessage(`User data incomplete. Missing fields: ${validation.missingFields.join(', ')}`);
          setSelectedUser(null);
          setUsers([]);
          return;
        }
        setSelectedUser(data);
        setUsers([]);
        setMessage('');
      } else {
        if (!Array.isArray(data)) {
          console.error('Search by name error: data is not an array', { data });
          throw new Error('Invalid response: Expected an array of users');
        }
        const trimmedInput = searchInput.trim().toLowerCase();
        const matchedUser = data.find((user) => user.name && user.name.toLowerCase() === trimmedInput);
        if (matchedUser) {
          const validation = validateUserData(matchedUser);
          if (!validation.isValid) {
            console.log('Invalid user data from name search:', { missingFields: validation.missingFields });
            setMessage(`User data incomplete. Missing fields: ${validation.missingFields.join(', ')}`);
            setSelectedUser(null);
            setUsers([]);
            return;
          }
          setSelectedUser(matchedUser);
          setUsers([]);
          setMessage('');
        } else {
          setSelectedUser(null);
          setUsers([]);
          setMessage('No users found with the exact name.');
        }
      }
    } catch (error) {
      console.error('Search Error:', error);
      setSelectedUser(null);
      setUsers([]);
      setMessage(`Error searching users: ${error.message}`);
    } finally {
      setSearchInput('');
      setShowSearchInput(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      console.log(`Delete response status: ${response.status}`);
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Delete error response:', errorData);
        throw new Error(errorData.error || 'Failed to delete user');
      }
      const { success, message } = await response.json();
      console.log('Delete success response:', { success, message });
      if (!success) {
        throw new Error('Failed to delete user');
      }
      setMessage(message || 'User deleted successfully');
      setUsers(users.filter((user) => user.id !== userId));
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage(`Error deleting user: ${error.message}`);
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/block`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Block error response:', errorData);
        throw new Error(errorData.error || 'Failed to block user');
      }
      const { success, message, data } = await response.json();
      console.log('Block success response:', { success, message, data });
      if (!success) {
        throw new Error('Failed to block user');
      }
      setMessage(message || 'User blocked successfully');
      setUsers(users.map((user) => (user.id === userId ? data : user)));
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(data);
      }
    } catch (error) {
      console.error('Block error:', error);
      setMessage(`Error blocking user: ${error.message}`);
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/unblock`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Unblock error response:', errorData);
        throw new Error(errorData.error || 'Failed to unblock user');
      }
      const { success, message, data } = await response.json();
      console.log('Unblock success response:', { success, message, data });
      if (!success) {
        throw new Error('Failed to unblock user');
      }
      setMessage(message || 'User unblocked successfully');
      setUsers(users.map((user) => (user.id === userId ? data : user)));
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(data);
      }
    } catch (error) {
      console.error('Unblock error:', error);
      setMessage(`Error unblocking user: ${error.message}`);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${updateUserData.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: updateUserData.name,
          phone: updateUserData.phone,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Update error response:', errorData);
        throw new Error(errorData.error || 'Failed to update user');
      }
      const { success, message, data } = await response.json();
      console.log('Update success response:', { success, message, data });
      if (!success) {
        throw new Error('Failed to update user');
      }
      setUsers(
        users.map((user) =>
          user.id === updateUserData.id
            ? { ...user, name: updateUserData.name, phone: updateUserData.phone, updated_at: data.updated_at }
            : user
        )
      );
      if (selectedUser && selectedUser.id === updateUserData.id) {
        setSelectedUser({
          ...selectedUser,
          name: updateUserData.name,
          phone: updateUserData.phone,
          updated_at: data.updated_at,
        });
      }
      setMessage(message || 'User updated successfully');
      setShowUpdateModal(false);
    } catch (error) {
      console.error('Update error:', error);
      setMessage(`Error updating user: ${error.message}`);
    }
  };

  const openUpdateModal = (user) => {
    setUpdateUserData({ id: user.id, name: user.name || '', phone: user.phone || '' });
    setShowUpdateModal(true);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64 ml-0' : 'md:ml-20 ml-0'}`}>
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
            <button
              onClick={handleFetchAllUsers}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-6 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition duration-300 w-full md:w-auto"
            >
              View All Users
            </button>

            {!showSearchInput ? (
              <button
                onClick={() => setShowSearchInput(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-6 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition duration-300 w-full md:w-auto"
              >
                Search by ID or Name
              </button>
            ) : (
              <div className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-3 md:space-y-0 w-full">
                <input
                  type="text"
                  placeholder="Enter User ID or Name"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSearchUser}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition duration-300 w-full md:w-auto"
                  >
                    Search
                  </button>
                  <button
                    onClick={() => {
                      setShowSearchInput(false);
                      setSearchInput('');
                    }}
                    className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg shadow hover:bg-gray-400 transition duration-300 w-full md:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
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

          {selectedUser ? (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">User Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 text-sm sm:text-base">
                <p>
                  <strong>ID:</strong> {selectedUser.id || 'N/A'}
                </p>
                <p>
                  <strong>Name:</strong> {selectedUser.name || 'N/A'}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email || 'N/A'}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedUser.phone || 'N/A'}
                </p>
                <p>
                  <strong>Role:</strong> {selectedUser.role || 'N/A'}
                </p>
                <p>
                  <strong>Status:</strong> {selectedUser.status ? 'Active' : 'Blocked'}
                </p>
                <p>
                  <strong>Created At:</strong> {formatDate(selectedUser.created_at)}
                </p>
                <p>
                  <strong>Updated At:</strong> {formatDate(selectedUser.updated_at)}
                </p>
              </div>
              <div className="mt-4 flex space-x-4">
                <button onClick={() => openUpdateModal(selectedUser)} className="text-blue-600 hover:text-blue-900">
                  <FiEdit size={20} />
                </button>
                <button
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <FiTrash2 size={20} />
                </button>
                {selectedUser.status ? (
                  <button
                    onClick={() => handleBlockUser(selectedUser.id)}
                    className="text-orange-600 hover:text-orange-900"
                  >
                    <FiLock size={20} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnblockUser(selectedUser.id)}
                    className="text-green-600 hover:text-green-900"
                  >
                    <FiUnlock size={20} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg">
              {users.length === 0 ? (
                <p className="p-4 text-gray-500">No users to display.</p>
              ) : (
                <>
                  {/* Table for Desktop and Tablet (sm and above) */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[60px]">
                            ID
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[100px]">
                            Name
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[150px]">
                            Email
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">
                            Phone
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[80px]">
                            Role
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[80px]">
                            Status
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[150px]">
                            Created At
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[150px]">
                            Updated At
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[120px]">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-700 text-sm">{user.id || 'N/A'}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-700 text-sm">{user.name || 'N/A'}</td>
                            <td className="px-4 sm:px-6 py-4 text-gray-700 text-sm sm:whitespace-nowrap truncate max-w-[150px]">{user.email || 'N/A'}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-700 text-sm">{user.phone || 'N/A'}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-700 text-sm">{user.role || 'N/A'}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {user.status ? 'Active' : 'Blocked'}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4 text-gray-700 text-sm sm:whitespace-nowrap">{formatDate(user.created_at)}</td>
                            <td className="px-4 sm:px-6 py-4 text-gray-700 text-sm sm:whitespace-nowrap">{formatDate(user.updated_at)}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-4">
                                <button
                                  onClick={() => openUpdateModal(user)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <FiEdit size={20} />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <FiTrash2 size={20} />
                                </button>
                                {user.status ? (
                                  <button
                                    onClick={() => handleBlockUser(user.id)}
                                    className="text-orange-600 hover:text-orange-900"
                                  >
                                    <FiLock size={20} />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUnblockUser(user.id)}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <FiUnlock size={20} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Card Layout for Mobile (below sm) */}
                  <div className="sm:hidden space-y-4 p-4">
                    {users.map((user) => (
                      <div key={user.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="space-y-2 text-gray-700 text-sm">
                          <p><strong>ID:</strong> {user.id || 'N/A'}</p>
                          <p><strong>Name:</strong> {user.name || 'N/A'}</p>
                          <p><strong>Email:</strong> {user.email || 'N/A'}</p>
                          <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                          <p><strong>Role:</strong> {user.role || 'N/A'}</p>
                          <p>
                            <strong>Status:</strong>{' '}
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {user.status ? 'Active' : 'Blocked'}
                            </span>
                          </p>
                          <p><strong>Created At:</strong> {formatDate(user.created_at)}</p>
                          <p><strong>Updated At:</strong> {formatDate(user.updated_at)}</p>
                        </div>
                        <div className="mt-3 flex space-x-4">
                          <button
                            onClick={() => openUpdateModal(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiTrash2 size={18} />
                          </button>
                          {user.status ? (
                            <button
                              onClick={() => handleBlockUser(user.id)}
                              className="text-orange-600 hover:text-orange-900"
                            >
                              <FiLock size={18} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnblockUser(user.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <FiUnlock size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showUpdateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Update User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={updateUserData.name}
                  onChange={(e) => setUpdateUserData({ ...updateUserData, name: e.target.value })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  value={updateUserData.phone}
                  onChange={(e) => setUpdateUserData({ ...updateUserData, phone: e.target.value })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 w-full sm:w-auto"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAdmin;


