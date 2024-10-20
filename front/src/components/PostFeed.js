import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import './PostFeed.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelopeOpen, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [expandedPostIds, setExpandedPostIds] = useState([]);
  const userId = parseInt(localStorage.getItem('userId'), 10);
  const [title, setTitle] = useState('');          // State for the title
  const [content, setContent] = useState('');      // State for the content
  const [media, setMedia] = useState(null);        // State for the media file
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const fetchPosts = useCallback(async () => {
    try {
      const response = await API.get('/posts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const sortedPosts = response.data.map(post => ({
        ...post,
        is_read: !!post.is_read  // Ensure it's a boolean value
      })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setPosts(sortedPosts);
      // const sortedPosts = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      // setPosts(sortedPosts);
      // console.log('Fetched posts:',response.data);
      
    } catch (err) {
      console.error('Error fetching posts:', err);
      if (err.response && err.response.status === 403) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        localStorage.setItem('message', 'Session expired. Please log in again.');
        navigate('/');
      } else {
        setError('Failed to load posts. Please try again later.');
      }
    }
  }, [navigate]);

  // Check for token on page load and redirect to homepage if not authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    } else {
      fetchPosts();
    }
  }, [navigate, fetchPosts]);


  const handleExpandPost = async (postId) => {
    setExpandedPostIds((prevExpanded) => {
      if (prevExpanded.includes(postId)) {
        // Collapse the post
        return prevExpanded.filter(id => id !== postId);
      } else {
        // Expand the post
        return [...prevExpanded, postId];
      }
    });

    // Only mark the post as read if it's not already marked as read
    const post = posts.find(post => post.id === postId);
    if (!post.is_read) {
      try {
        await API.post(`/posts/${postId}/mark-read`);
        console.log(`Post ${postId} marked as read`);
        
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId ? { ...post, is_read: true } : post
          )
        );
      } catch (err) {
        console.error(`Error marking post ${postId} as read:`, err);
      }
    }
  };
  //   // Now handle marking the post as read
  //   try {
  //     await API.post(`/posts/${postId}/mark-read`);  // Send a request to mark as read
  //     console.log(`Post ${postId} marked as read`);
  //     setPosts((prevPosts) =>
  //       prevPosts.map((post) =>
  //         post.id === postId ? { ...post, is_read: true } : post
  //       )
  //     );
  //     setError(''); // Clear the error message after successful creation
  //   } catch (err) {
  //     console.error(`Error marking post ${postId} as read:`, err);
  //   }
  // };

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
      fileInputRef.current.value = '';
      fetchPosts(); // Refresh posts after successful creation
      setError(''); // Clear the error message after successful creation
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    }
  };

  const handleMarkAsUnread = async (postId) => {
    try {
      await API.post(`/posts/${postId}/mark-unread`);  // Send request to mark as unread
      console.log(`Post ${postId} marked as unread`);
      fetchPosts();  // Refresh the post list to reflect the change
    } catch (err) {
      console.error(`Error marking post ${postId} as unread:`, err);
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
          {/* <source src={`${baseUrl}${mediaUrl}`} type={`audio/${fileExtension}`} /> */}
          <source src={`${baseUrl}${mediaUrl}`} type={`audio/mpeg`} />
          Your browser does not support the audio element.
        </audio>
      );
    } else {
      return <p>Unsupported media type</p>;
    }
  };

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
            ref={fileInputRef}
            onChange={(e) => setMedia(e.target.files[0])}
          />
          <button type="submit">Create Post</button>
        </form>
      </div>
      {error && <p className="error-message">{error}</p>}
      <div className="posts-list">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <h3 onClick={() => handleExpandPost(post.id)} style={{ cursor: 'pointer' }}>
            {/* {console.log('Post ID:', post.id, 'is_read:', post.is_read)}  */}
              <FontAwesomeIcon
                icon={post.is_read ? faEnvelopeOpen : faEnvelope}
                style={{ marginRight: '8px', color: post.is_read ? 'green' : 'red' }}
              />
              {post.title}
            </h3>
            {expandedPostIds.includes(post.id) ? (
              <>
                <p>{post.content}</p>
                {renderMedia(post.media_url)}

                <p><strong>Posted by:</strong> {post.author || 'Unknown'}</p>
                <p><strong>Created at:</strong> {formatDate(post.created_at)}</p>

                {/* Toggle Read/Unread */}
                {post.is_read ? (
                  <button onClick={() => handleMarkAsUnread(post.id)} className="mark-unread-button">Mark as Unread</button>
                ) : (
                  <button onClick={() => handleExpandPost(post.id)} className="mark-read-button">Mark as Read</button>
                )}

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
              {expandedPostIds.includes(post.id) ? 'Collapse' : 'Expand'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostFeed;
