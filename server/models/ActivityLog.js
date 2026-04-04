import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['LOGIN', 'LOGOUT', 'REGISTER', 'PROFILE_UPDATE', 'EMERGENCY_ACCESS', 'SEARCH', 'LOCATION_ACCESS', 'ROUTE_GENERATED', 'PHARMACY_SELECTED', 'MEDICINE_SEARCH']
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
