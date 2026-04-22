import mongoose from 'mongoose';

const hospitalResponseSchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmergencyReport',
    required: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  responseType: {
    type: String,
    enum: ['Accepted', 'Rejected'],
    required: true
  },
  notes: {
    type: String
  }
}, { timestamps: true });

const HospitalResponse = mongoose.model('HospitalResponse', hospitalResponseSchema);
export default HospitalResponse;
