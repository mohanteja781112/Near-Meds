import mongoose from 'mongoose';

const medicalReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patient_summary: {
    type: String,
    default: "No summary provided"
  },
  possible_conditions: {
    type: mongoose.Schema.Types.Mixed,
    default: "Pending medical review"
  },
  urgency_level: {
    type: String,
    default: "Moderate"
  },
  recommendations: {
    type: mongoose.Schema.Types.Mixed,
    default: "Consult a healthcare professional"
  },
  precautions: {
    type: mongoose.Schema.Types.Mixed,
    default: "Standard precautions apply"
  },
  when_to_seek_immediate_care: {
    type: mongoose.Schema.Types.Mixed,
    default: "Seek help if symptoms worsen"
  },
  disclaimer: {
    type: String,
    default: "This is an AI generated summary."
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const MedicalReport = mongoose.model('MedicalReport', medicalReportSchema);

export default MedicalReport;
