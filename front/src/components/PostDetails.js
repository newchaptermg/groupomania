// PostDetails.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import './PostDetails.css';

const PostDetails = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPostDetails = async () => {
            try {
                const response = await API.get(`/posts/${id}`);
                setPost(response.data);
            } catch (err) {
                console.error('Error fetching post details:', err);
                setError('Failed to load post details. Please try again later.');
            }
        };

        fetchPostDetails();
    }, [id]);

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    if (!post) {
        return <p>Loading...</p>;
    }

    return (
        <div className="post-details-container">
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="post-image" />}
            <p><strong>Posted by:</strong> {post.user}</p>
            <p><strong>Created at:</strong> {new Date(post.createdAt).toLocaleDateString()}</p>
        </div>
    );
};

export default PostDetails;
