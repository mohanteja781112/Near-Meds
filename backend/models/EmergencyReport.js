import mongoose from 'mongoose';

const emergencyReportSchema = new mongoose.Schema({
  patientData: {
    // We'll store the AI generated structured data here (as an object to allow flexibility, or a stringified JSON if preferred, but object is better)
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['Low', 'Moderate', 'High', 'Critical']
  },
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Completed'],
    default: 'Pending'
  },
  patientSocketId: {
    type: String, // WebSocket ID of the patient generating the report to send real-time updates directly back
    required: true
  },
  respondedHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    default: null
  }
}, { timestamps: true });

const EmergencyReport = mongoose.model('EmergencyReport', emergencyReportSchema);
export default EmergencyReport;
