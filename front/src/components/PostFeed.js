import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './PostFeed.css';
import { useNavigate } from 'react-router-dom';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [error, setError] = useState('');
  const [expandedPostId, setExpandedPostId] = useState(null);
  const userId = localStorage.getItem('userId'); // Assuming you store user ID in local storage
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // If token is missing, redirect to the homepage
      navigate('/');
    } else {
      fetchPosts();
    }
  }, [navigate]);

  const fetchPosts = async () => {
    try {
      const response = await API.get('/posts');
      setPosts(response.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (media) {
      formData.append('media', media);
    }

    try {
      await API.post('/posts/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setTitle('');
      setContent('');
      setMedia(null);
      fetchPosts(); // Refresh posts after successful creation
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    }
  };

  const togglePost = (postId) => {
    setExpandedPostId((prev) => (prev === postId ? null : postId));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date) ? date.toLocaleDateString() : 'Invalid Date';
  };

  const handleDelete = async (postId) => {
    try {
      await API.delete(`/posts/${postId}`);
      fetchPosts(); // Refresh posts after deletion
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete the post. Please try again.');
    }
  };

  const handleSignOut = () => {
    // Remove the token and user ID from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');

    // Redirect to the login page or home page after sign-out
    navigate('/'); // Update the route as needed
  };

  return (
    <div className="post-feed-container">
      <header className="post-feed-header">
        <h2>Post Feed</h2>
        <button onClick={handleSignOut} className="sign-out-button">Sign Out</button>      </header>
      <div className="create-post-container">
        <h3>Create New Post</h3>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleCreatePost}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
            required
          />
          <input
            type="file"
            accept="image/*,video/*,audio/*"
            onChange={(e) => setMedia(e.target.files[0])}
          />
          <button type="submit">Create Post</button>
        </form>
      </div>
      {error && <p className="error-message">{error}</p>}
      <div className="posts-list">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <h3 onClick={() => togglePost(post.id)} style={{ cursor: 'pointer' }}>{post.title}</h3>
            {expandedPostId === post.id ? (
              <>
                <p>{post.content}</p>
                {post.media_url && <img src={post.media_url} alt={post.title} className="post-image" />}
                <p><strong>Posted by:</strong> {post.username || 'Unknown'}</p>
                <p><strong>Created at:</strong> {formatDate(post.created_at)}</p>
                {post.created_by === userId && (
                  <button onClick={() => handleDelete(post.id)} className="delete-button">
                    Delete
                  </button>
                )}
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
