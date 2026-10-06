const mongoose = require('mongoose');

const mockSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    source: {
      type: String,
      default: '',
      trim: true,
    },
    gaScore: { type: Number, default: null },
    mathScore: { type: Number, default: null },
    amdScore: { type: Number, default: null },
    ftsScore: { type: Number, default: null },
    mmiScore: { type: Number, default: null },
    overallScore: { type: Number, default: null }, // out of 100
    percentile: { type: Number, default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Mock', mockSchema);
