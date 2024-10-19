const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Signup controller
exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create(username, email, hashedPassword);
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(403).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user profile controller
exports.getProfile = async (req, res) => {
  const { userId } = req.user;

  try {
    const result = await pool.query('SELECT username, email FROM public.users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Error fetching user profile' });
  }
};

// Delete user controller
exports.deleteUser = async (req, res) => {
  const { userId } = req.user;

  try {
    await pool.query('DELETE FROM public.users WHERE id = $1', [userId]);
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).json({ error: 'Error deleting account' });
  }
};

// Change password controller
exports.changePassword = async (req, res) => {
  const { userId } = req.user;
  const { currentPassword, newPassword } = req.body;

  try {
    const result = await pool.query('SELECT password FROM public.users WHERE id = $1', [userId]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE public.users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ error: 'Error changing password' });
  }
};


// const User = require('../models/User'); // Make sure this path is correct
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const pool = require('../db'); // Import the database pool

// // Signup controller
// exports.signup = async (req, res, next) => {
//     const { username, email, password } = req.body;

//     try {
//         // Validate input
//         if (!username || !email || !password) {
//             return res.status(400).json({ error: 'All fields are required' });
//         }

//         // Check if email already exists
//         const existingUser = await User.findByEmail(email);
//         if (existingUser) {
//             return res.status(400).json({ error: 'Email already in use' });
//         }

//         // Hash the password
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         // Create a new user
//         const newUser = await User.create(username, email, hashedPassword);
//         res.status(201).json({ message: 'User created successfully', user: newUser });
//     } catch (err) {
//         console.error('Error during signup:', err); // Log error for debugging
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

// // Login controller
// exports.login = async (req, res, next) => {
//     const { email, password } = req.body;

//     try {
//         if (!email || !password) {
//             return res.status(400).json({ error: 'Email and password are required' });
//         }

//         const user = await User.findByEmail(email);
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         const passwordMatch = await bcrypt.compare(password, user.password);
//         if (!passwordMatch) {
//             return res.status(403).json({ error: 'Invalid credentials' });
//         }

//         const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//         res.status(200).json({ token });
//     } catch (err) {
//         console.error('Error during login:', err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

// // Delete user controller
// exports.deleteUser = async (req, res, next) => {
//     const { userId } = req.user;

//     try {
//         await pool.query('DELETE FROM public.users WHERE id = $1', [userId]);
//         res.status(200).json({ message: 'Account deleted successfully' });
//     } catch (err) {
//         console.error('Error deleting account:', err);
//         res.status(500).json({ error: 'Error deleting account' });
//     }
// };

// // Get user profile controller
// exports.getProfile = async (req, res, next) => {
//     const { userId } = req.user;

//     try {
//         const result = await pool.query('SELECT username, email FROM public.users WHERE id = $1', [userId]);
//         const user = result.rows[0];

//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         res.status(200).json(user);
//     } catch (err) {
//         console.error('Error fetching user profile:', err);
//         res.status(500).json({ error: 'Error fetching user profile' });
//     }
// };

// // Change password controller
// exports.changePassword = async (req, res) => {
//     const { userId } = req.user;
//     const { currentPassword, newPassword } = req.body;

//     try {
//         const result = await pool.query('SELECT password FROM public.users WHERE id = $1', [userId]);
//         const user = result.rows[0];

//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         const isMatch = await bcrypt.compare(currentPassword, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ error: 'Current password is incorrect' });
//         }

//         const hashedPassword = await bcrypt.hash(newPassword, 10);
//         await pool.query('UPDATE public.users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

//         res.status(200).json({ message: 'Password updated successfully' });
//     } catch (err) {
//         console.error('Error changing password:', err);
//         res.status(500).json({ error: 'Error changing password' });
//     }
// };
