import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Reset error message

    try {
      // Make login API call
      const response = await API.post('/auth/login', { email, password });
      const token = response.data.token;

      // Store token and redirect to posts page
      localStorage.setItem('token', token);
      navigate('/posts');
    } catch (err) {
      console.error('Login failed:', err);
      setError('Invalid email or password. Please try again.');
    }
  };

  const goToSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="homepage-container">
      <div className="login-card">
        <h2>Welcome to Groupomania!</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-button">Log In</button>
        </form>
        <hr />
        <button className="signup-button" onClick={goToSignup}>Create new account</button>
      </div>
    </div>
  );
};

export default HomePage;
