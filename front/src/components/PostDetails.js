import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import './PostDetails.css';

const PostDetails = () => {
  const { postId } = useParams(); // Get the postId from the URL
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await API.get(`/posts/${postId}`);
        setPost(response.data);
      } catch (err) {
        console.error('Error fetching post details:', err);
        setError('Failed to load post details. Please try again later.');
      }
    };

    fetchPostDetails();
  }, [postId]);

  if (error) {
    return <div className="post-details-container"><p className="error-message">{error}</p></div>;
  }

  if (!post) {
    return <div className="post-details-container"><p>Loading...</p></div>;
  }

  return (
    <div className="post-details-container">
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="post-image" />}     
      <p><strong>Posted by:</strong> {post.user}</p>
      <p><strong>Created at:</strong> {new Date(post.createdAt).toLocaleString()}</p>
    </div>
  );
  
};

export default PostDetails;
