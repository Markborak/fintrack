import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiLock, FiDownload, FiUpload } from 'react-icons/fi';
import ConfirmModal from '../components/ConfirmModal';

const Settings = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Handle profile form change
  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  // Handle password form change
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  // Update profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileData);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Error updating profile', type: 'danger' });
    }
  };

  // Change password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: 'New passwords do not match', type: 'danger' });
      return;
    }
    
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setMessage({ text: 'Password changed successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Error changing password', type: 'danger' });
    }
  };

  // Export data
  const handleExportData = () => {
    // In a real app, this would call an API endpoint to get the data
    // For this demo, we'll just create a mock JSON file
    const mockData = {
      user: {
        name: user.name,
        email: user.email
      },
      transactions: [
        { id: 1, description: 'Salary', amount: 5000, type: 'income', category: 'Salary', date: '2023-11-01' },
        { id: 2, description: 'Rent', amount: 1200, type: 'expense', category: 'Housing', date: '2023-11-02' }
      ],
      budgets: [
        { id: 1, category: 'Housing', amount: 1500 },
        { id: 2, category: 'Food', amount: 500 }
      ]
    };
    
    const dataStr = JSON.stringify(mockData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'fintrack-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setMessage({ text: 'Data exported successfully!', type: 'success' });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div>
      <div className="transactions-header">
        <h2 className="section-title">Settings</h2>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <div className="flex border-b mb-4">
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('profile')}
          >
            <FiUser className="inline mr-2" /> Profile
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'security' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('security')}
          >
            <FiLock className="inline mr-2" /> Security
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'data' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('data')}
          >
            <FiDownload className="inline mr-2" /> Data Management
          </button>
        </div>

        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                className="form-control" 
                value={profileData.name} 
                onChange={handleProfileChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                className="form-control" 
                value={profileData.email} 
                onChange={handleProfileChange}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Save Changes</button>
          </form>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input 
                type="password" 
                id="currentPassword" 
                name="currentPassword" 
                className="form-control" 
                value={passwordData.currentPassword} 
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input 
                type="password" 
                id="newPassword" 
                name="newPassword" 
                className="form-control" 
                value={passwordData.newPassword} 
                onChange={handlePasswordChange}
                required
                minLength="8"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                className="form-control" 
                value={passwordData.confirmPassword} 
                onChange={handlePasswordChange}
                required
                minLength="8"
              />
            </div>
            <button type="submit" className="btn-primary">Change Password</button>
            
            <hr className="my-6" />
            
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Account Actions</h3>
              <button 
                type="button" 
                className="btn-danger" 
                onClick={() => setShowLogoutModal(true)}
              >
                Logout from All Devices
              </button>
            </div>
          </form>
        )}

        {activeTab === 'data' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Export Data</h3>
              <p className="text-gray-600 mb-4">
                Download all your financial data in JSON format. This includes your transactions, 
                budgets, and account information.
              </p>
              <button 
                className="btn-primary flex items-center gap-2" 
                onClick={handleExportData}
              >
                <FiDownload /> Export Data
              </button>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Import Data</h3>
              <p className="text-gray-600 mb-4">
                Import your financial data from a JSON file. This will replace your current data.
              </p>
              <label className="btn-outline flex items-center gap-2 inline-block cursor-pointer">
                <FiUpload /> Import Data
                <input type="file" className="hidden" accept=".json" />
              </label>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-red-600">Danger Zone</h3>
              <p className="text-gray-600 mb-4">
                The following actions are destructive and cannot be undone.
              </p>
              <button className="btn-danger">Delete All Transactions</button>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <ConfirmModal
          title="Logout from All Devices"
          message="Are you sure you want to logout from all devices? You will need to login again on all your devices."
          confirmText="Logout"
          cancelText="Cancel"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  );
};

export default Settings;