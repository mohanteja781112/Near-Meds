import mongoose from 'mongoose';

const savedLocationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  label: {
    type: String,
    default: 'Current Location'
  },
  address: {
    type: String,
    required: true
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  source: {
    type: String,
    enum: ['GPS', 'IP', 'MANUAL'],
    default: 'MANUAL'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const SavedLocation = mongoose.model('SavedLocation', savedLocationSchema);

export default SavedLocation;
