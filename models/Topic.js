const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      // GA = General Aptitude, MATH = Engineering Mathematics,
      // AMD = Applied Mechanics & Design, FTS = Fluid Mechanics & Thermal Sciences,
      // MMI = Materials, Manufacturing & Industrial Engineering
      enum: ['GA', 'MATH', 'AMD', 'FTS', 'MMI'],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started',
    },
    notes: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Topic', topicSchema);
