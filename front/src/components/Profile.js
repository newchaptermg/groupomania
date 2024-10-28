import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get('/auth/profile');
        setUsername(response.data.username);
        setEmail(response.data.email);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Error loading profile information.');
      }
    };

    fetchProfile();
  }, []);

  const handleBackToPosts = () => {
    navigate('/posts');  // This will navigate to the post feed page
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      await API.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.error || 'Error changing password. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await API.delete('/auth/delete');
        setSuccess('Account deleted successfully. Redirecting to the homepage...');
        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/');
        }, 2000);
      } catch (err) {
        console.error('Error deleting account:', err);
        setError('Error deleting account. Please try again.');
      }
    }
  };

  return (
    <div className="profile-container">
      <h2>Profile</h2>

      <div className="back-button-container">
        <button onClick={handleBackToPosts} className="back-button">
          Back to Posts
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <div className="profile-details">
        <p><strong>Username:</strong> {username}</p>
        <p><strong>Email:</strong> {email}</p>
      </div>



      <form onSubmit={handleChangePassword}>
        <h3>Change Password</h3>
        <div>
          <label htmlFor="currentPassword">Current Password:</label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="newPassword">New Password:</label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm New Password:</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Change Password</button>
      </form>

      <button className="delete-button" onClick={handleDeleteAccount}>
        Delete Account
      </button>
    </div>
  );
};

export default Profile;
