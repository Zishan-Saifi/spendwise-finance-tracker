const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Category type is required'],
  },
  icon: {
    type: String,
    default: 'Tag',
  },
  color: {
    type: String,
    default: '#8B5CF6',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;