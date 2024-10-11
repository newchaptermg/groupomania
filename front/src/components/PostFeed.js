import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import './PostFeed.css';

const PostFeed = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await API.get('/posts');
        setPosts(response.data);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again later.');
      }
    };

    fetchPosts();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const viewPostDetails = (postId) => {
    navigate(`/posts/${postId}`);
  };

  return (
    <div className="post-feed-container">
      <header className="post-feed-header">
        <h2>Post Feed</h2>
        <button onClick={handleSignOut} className="sign-out-button">Sign Out</button>
      </header>
      {error && <p className="error-message">{error}</p>}
      <div className="posts-list">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <h3>{post.title}</h3>
            <p>{post.content.substring(0, 100)}...</p>
            <button onClick={() => viewPostDetails(post.id)} className="view-details-button">View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostFeed;
