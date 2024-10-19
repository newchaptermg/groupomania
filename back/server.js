require('dotenv').config();
const express = require('express');
const cors = require('cors');  // Import the CORS middleware
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const errorHandler = require('./middleware/errorHandler'); // Import the error handler



const app = express();

// Enable CORS
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Define the root route
app.get('/', (req, res) => {
  res.send('Welcome to the Groupomania API');
});

// Routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

// Error handling middleware
app.use(errorHandler); // Make sure to add this after all routes

// upload
app.use('/uploads', express.static('uploads'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
