import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return false;
    }
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setError('Invalid email format.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    try {
      await API.post('/auth/signup', {
        username,
        email,
        password,
      });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/posts');
      }, 2000);
    } catch (err) {
      console.error('Error during signup:', err);
      // Ensure the error is always a string or properly converted
      const errorMessage = err.response?.data?.error || err.message || 'Signup failed. Please try again.';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{String(error)}</p>}
        {success && <p className="success">{success}</p>}
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;
