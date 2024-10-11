require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const errorHandler = require('./middleware/errorHandler');
const app = express();

// Enable CORS for all origins (customize for production)
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Static file serving for uploaded media files
app.use('/uploads', express.static('uploads'));

// Define the root route
app.get('/', (req, res) => {
  res.send('Welcome to the Groupomania API');
});

// Routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

// Error handling middleware (placed after all routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
