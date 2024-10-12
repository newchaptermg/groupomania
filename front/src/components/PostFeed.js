import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './PostFeed.css';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [expandedPostId, setExpandedPostId] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await API.get('/posts');
        console.log('API response:', response.data);
        setPosts(response.data);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again later.');
      }
    };

    fetchPosts();
  }, []);

  const togglePost = (postId) => {
    setExpandedPostId((prev) => (prev === postId ? null : postId));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date) ? date.toLocaleDateString() : 'Invalid Date';
  };

  return (
    <div className="post-feed-container">
      <header className="post-feed-header">
        <h2>Post Feed</h2>
        <button onClick={() => localStorage.removeItem('token')} className="sign-out-button">Sign Out</button>
      </header>
      {error && <p className="error-message">{error}</p>}
      <div className="posts-list">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <h3 onClick={() => togglePost(post.id)} style={{ cursor: 'pointer' }}>{post.title}</h3>
            {expandedPostId === post.id ? (
              <>
                <p>{post.content}</p>
                {post.mediaUrl && <img src={post.mediaUrl} alt={post.title} className="post-image" />}
                <p><strong>Posted by:</strong> {post.username || 'Unknown'}</p>                
                <p><strong>Created at:</strong> {formatDate(post.created_at)}</p>
              </>
            ) : (
              <p>{post.content.substring(0, 100)}...</p>
            )}
            <button onClick={() => togglePost(post.id)} className="view-details-button">
              {expandedPostId === post.id ? 'Collapse' : 'Expand'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostFeed;
