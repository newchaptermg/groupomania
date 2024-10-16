import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import './PostFeed.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');          // State for the title
  const [content, setContent] = useState('');      // State for the content
  const [media, setMedia] = useState(null);        // State for the media file
  const [error, setError] = useState('');
  const [expandedPostId, setExpandedPostId] = useState(null);
  const userId = parseInt(localStorage.getItem('userId'), 10);
  const navigate = useNavigate();

  // Check for token on page load and redirect to homepage if not authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    } else {
      fetchPosts();
    }
  }, [navigate]);

  // Function to fetch posts
  const fetchPosts = async () => {
    try {
      const response = await API.get('/posts');
      setPosts(response.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    }
  };

  const handleExpandPost = async (postId) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);

      try {
        await API.post(`/posts/${postId}/mark-read`);  // Send a request to mark as read
        console.log(`Post ${postId} marked as read`);
        fetchPosts();
        setError(''); // Clear the error message after successful creation
      } catch (err) {
        console.error(`Error marking post ${postId} as read:`, err);
      }
    }
  };

  // Handle post creation
  const handleCreatePost = async (e) => {
    e.preventDefault();
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
      setError(''); // Clear the error message after successful creation
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setError('');
    navigate('/');
  };

  const handleDelete = async (postId) => {
    try {
      await API.delete(`/posts/${postId}`);
      fetchPosts(); // Refresh posts after deletion
      setError('');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        // If the status code is 403 Forbidden
        setError('You are not authorized to delete this post.');
      } else if (err.response && err.response.status === 404) {
        // If the post is not found
        setError('Post not found.');
      } else {
        console.error('Error deleting post:', err);
        setError('Failed to delete the post. Please try again.');
      }
    }
  };

  const renderMedia = (mediaUrl) => {
    if (!mediaUrl) return null;

    const fileExtension = mediaUrl.split('.').pop().toLowerCase();
    // Ensure you have the base URL pointing correctly to your backend's address
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      return <img src={`${baseUrl}${mediaUrl}`} alt="Post Media" className="responsive-media" />;
    } else if (['mp4', 'webm'].includes(fileExtension)) {
      return (
        <video className="responsive-media" controls>
          <source src={`${baseUrl}${mediaUrl}`} type={`video/${fileExtension}`} />
          Your browser does not support the video tag.
        </video>
      );
    } else if (['mp3', 'wav'].includes(fileExtension)) {
      return (
        <audio className="responsive-media" controls>
          <source src={`${baseUrl}${mediaUrl}`} type={`audio/${fileExtension}`} />
          Your browser does not support the audio element.
        </audio>
      );
    } else {
      return <p>Unsupported media type</p>;
    }
  };

  //   if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
  //     return <img src={`${baseUrl}${mediaUrl}`} alt="Post Media" width="200" />;
  //   } else if (['mp4', 'webm'].includes(fileExtension)) {
  //     return (
  //       <video width="320" height="240" controls>
  //         <source src={`${baseUrl}${mediaUrl}`} type={`video/${fileExtension}`} />
  //         Your browser does not support the video tag.
  //       </video>
  //     );
  //   } else if (['mp3', 'wav'].includes(fileExtension)) {
  //     return (
  //       <audio controls>
  //         <source src={`${baseUrl}${mediaUrl}`} type={`audio/${fileExtension}`} />
  //         Your browser does not support the audio element.
  //       </audio>
  //     );
  //   } else {
  //     return <p>Unsupported media type</p>;
  //   }
  // };

  // const togglePost = (postId) => {
  //   setExpandedPostId((prev) => (prev === postId ? null : postId));
  // };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date) ? date.toLocaleDateString() : 'Invalid Date';
  };

  return (
    <div className="post-feed-container">
      <header className="post-feed-header">
        <h2>Post Feed</h2>
        <div className="header-actions">
          <Link to="/profile" className="profile-link">Profile</Link>
          <button onClick={handleSignOut} className="sign-out-button">Sign Out</button>
        </div>
      </header>
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
          // <div key={post.id} className={`post-card ${post.is_read ? 'read' : 'unread'}`}>
          <div key={post.id} className="post-card">

            <h3 onClick={() => handleExpandPost(post.id)} style={{ cursor: 'pointer' }}>

              <FontAwesomeIcon
                icon={post.is_read ? faCheckCircle : faEnvelope}
                style={{ marginRight: '8px', color: post.is_read ? 'green' : 'red' }}
              />
              {post.title}
            </h3>
            {expandedPostId === post.id ? (
              <>
                <p>{post.content}</p>
                {renderMedia(post.media_url)}
                <p><strong>Posted by:</strong> {post.username || 'Unknown'}</p>
                <p><strong>Created at:</strong> {formatDate(post.created_at)}</p>

                {String(post.created_by) === String(userId) && (
                  <button onClick={() => handleDelete(post.id)} >
                    Delete Post
                  </button>
                )}
                <button onClick={() => handleDelete(post.id)}>Delete Post</button>
              </>
            ) : (
              <p>{post.content.substring(0, 100)}...</p>
            )}
            <button onClick={() => handleExpandPost(post.id)} className="view-details-button">
              {expandedPostId === post.id ? 'Collapse' : 'Expand'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostFeed;
