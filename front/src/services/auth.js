import jwtDecode from 'jwt-decode';
import API from './api';

// Function to check if the token is expired
export const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000; // Current time in seconds
    return decoded.exp < now; // Compare token's expiration time with the current time
  } catch (err) {
    return true; // If token can't be decoded, treat it as expired
  }
};

// Function to refresh the access token using the refresh token
export const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await API.post('/auth/refresh-token', { refreshToken });
    const { accessToken } = response.data;
    localStorage.setItem('token', accessToken);
    return accessToken;
  } catch (err) {
    console.error('Error refreshing access token:', err);
    // Redirect to login if refresh fails
    window.location.href = '/login';
  }
};

// Function to validate and refresh token if necessary
export const validateToken = async () => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken'); // Store this if using refresh tokens
  if (!token || isTokenExpired(token)) {
    if (refreshToken) {
      // Try refreshing the access token
      return await refreshAccessToken(refreshToken);
    } else {
      // No refresh token or token expired, redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
  return token;
};
