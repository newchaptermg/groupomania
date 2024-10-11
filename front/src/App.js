import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Signup from './components/Signup';
import PostFeed from './components/PostFeed';
import Profile from './components/Profile';
import PrivateRoute from './components/PrivateRoute';
import PostDetails from './components/PostDetails';
import logo from './assets/logo192.png';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
            <Route path="/posts" element={<PrivateRoute element={<PostFeed />} />} />
            <Route path="/posts/:postId" element={<PrivateRoute element={<PostDetails />} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

const Header = () => (
  <header className="app-header">
    <div className="logo-container">
      <img src={logo} alt="Groupomania Logo" className="app-logo" />
      <h1>Groupomania</h1>
    </div>
  </header>
);

export default App;
