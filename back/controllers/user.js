const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

exports.signup = async (req, res, next) => {
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

        const result = await User.create(username, email, hashedPassword);
        res.status(201).json({ message: 'User created successfully', user: result });
    } catch (err) {
        next(err);
    }
};

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
//         next(err);
//     }
// };

exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Fetch the user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' }); // Use 401 for invalid credentials
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' }); // Adjust expiration if needed
        res.status(200).json({ token });
    } catch (err) {
        next(err);
    }
};

exports.deleteUser = async (req, res, next) => {
    const { userId } = req.user; // Extract the user ID from the token
  
    try {
      // Delete the user from the database
      await pool.query('DELETE FROM public.users WHERE id = $1', [userId]);
      res.status(200).json({ message: 'Account deleted successfully' });
    } catch (err) {
      console.error('Error deleting account:', err);
      res.status(500).json({ error: 'Error deleting account' });
    }
  };
  
  exports.getProfile = async (req, res, next) => {
    const { userId } = req.user; // Extract the user ID from the token
  
    try {
      // Fetch the user's information from the database
      const result = await pool.query('SELECT username, email FROM public.users WHERE id = $1', [userId]);
      const user = result.rows[0];
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).json(user);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      res.status(500).json({ error: 'Error fetching user profile' });
    }
  };
  
 
  exports.changePassword = async (req, res) => {
    const { userId } = req.user; // Extract the user ID from the token
    const { currentPassword, newPassword } = req.body;
  
    try {
      // Retrieve the user's current hashed password from the database
      const result = await pool.query('SELECT password FROM public.users WHERE id = $1', [userId]);
      const user = result.rows[0];
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Compare the current password provided by the user with the hashed password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
  
      // Hash the new password and update the database
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE public.users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
  
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error('Error changing password:', err);
      res.status(500).json({ error: 'Error changing password' });
    }
  };
  