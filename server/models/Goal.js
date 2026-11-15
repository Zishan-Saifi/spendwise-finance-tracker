const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a goal title'],
      trim: true
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please provide target amount'],
      min: 1
    },
    savedAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    targetDate: {
      type: Date,
      required: [true, 'Please provide a target date']
    },
    category: {
      type: String,
      default: 'General'
    },
    color: {
      type: String,
      default: '#8B5CF6'
    },
    icon: {
      type: String,
      default: 'Target'
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused'],
      default: 'active'
    },
    notes: {
      type: String,
      default: ''
    },
    history: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        note: { type: String, default: '' }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', GoalSchema);