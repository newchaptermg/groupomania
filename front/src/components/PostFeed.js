import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './PostFeed.css';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [error, setError] = useState('');
  const [expandedPostId, setExpandedPostId] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await API.get('/posts');
      setPosts(response.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    }
  };

  const handleSubmit = async (e) => {
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

  return (
    <div className="post-feed-container">
      <header className="post-feed-header">
        <h2>Post Feed</h2>
        <button onClick={() => localStorage.removeItem('token')} className="sign-out-button">Sign Out</button>
      </header>
      <div className="create-post-container">
        <h3>Create New Post</h3>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
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
            accept="image/*,video/*,audio/*" // Allow images, videos, and audio files
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
                {post.media_url && (post.media_url.endsWith('.jpg') || post.media_url.endsWith('.png')) && (
                  <img src={post.media_url} alt={post.title} className="post-image" />
                )}
                {post.media_url && (post.media_url.endsWith('.mp4') || post.media_url.endsWith('.avi')) && (
                  <video controls src={post.media_url} className="post-video"></video>
                )}
                {post.media_url && (post.media_url.endsWith('.mp3') || post.media_url.endsWith('.wav')) && (
                  <audio controls src={post.media_url} className="post-audio"></audio>
                )}
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
