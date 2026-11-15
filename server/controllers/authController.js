const User = require('../models/User');
const Category = require('../models/Category');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret_key_123', {
    expiresIn: '30d',
  });
};

const DEFAULT_CATEGORIES = [
  { name: 'Food', type: 'expense', icon: 'Utensils', color: '#ef4444' },
  { name: 'Transport', type: 'expense', icon: 'Car', color: '#f97316' },
  { name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#ec4899' },
  { name: 'Bills', type: 'expense', icon: 'Receipt', color: '#3b82f6' },
  { name: 'Entertainment', type: 'expense', icon: 'Clapperboard', color: '#8b5cf6' },
  { name: 'Health', type: 'expense', icon: 'Activity', color: '#10b981' },
  { name: 'Salary', type: 'income', icon: 'Wallet', color: '#10b981' },
  { name: 'Freelance', type: 'income', icon: 'Laptop', color: '#06b6d4' },
  { name: 'Investments', type: 'income', icon: 'TrendingUp', color: '#8b5cf6' },
];

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    // Accept either name OR fullName
    const userName = req.body.name || req.body.fullName;
    const { email, password, currency } = req.body;

    if (!userName || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered. Please login.' });
    }

    // Create user
    const user = await User.create({
      name: userName.trim(),
      email: cleanEmail,
      password: password,
      currency: currency || 'INR',
    });

    // Seed default categories safely (fail-safe)
    try {
      const userCategories = DEFAULT_CATEGORIES.map((cat) => ({
        ...cat,
        user: user._id,
      }));
      await Category.insertMany(userCategories);
    } catch (catErr) {
      console.warn('Category seed warning (safe to ignore):', catErr.message);
    }

    const token = generateToken(user._id);

    return res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
      },
    });
  } catch (error) {
    console.error('Registration server error:', error);
    return res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
      },
    });
  } catch (error) {
    console.error('Login server error:', error);
    return res.status(500).json({ message: error.message || 'Login failed' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.currency = req.body.currency || user.currency;
    if (req.body.password) user.password = req.body.password;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      currency: updatedUser.currency,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};