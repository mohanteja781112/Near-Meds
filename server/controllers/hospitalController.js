import EmergencyReport from '../models/EmergencyReport.js';
import Hospital from '../models/Hospital.js';
import HospitalResponse from '../models/HospitalResponse.js';
import bcrypt from 'bcryptjs';

// Global mock rotation counter for demo
let demoIndex = 0;
const DEMO_HOSPITALS = [
  { _id: 'mock_kims_01', name: 'KIMS-ICON Hospital', location: { address: 'Vizag', lat: 17.7144317, lng: 83.1957044 } },
  { _id: 'mock_apollo_02', name: 'Apollo Hospitals', location: { address: 'Ramnagar Vizag', lat: 17.7172512, lng: 83.3091802 } },
  { _id: 'mock_visakha_03', name: 'Visakha Hospital', location: { address: 'Vizag', lat: 17.6979033, lng: 83.1614047 } },
  { _id: 'mock_mom_04', name: 'MOM Hospital', location: { address: 'Vizag', lat: 17.6958846, lng: 83.1422378 } }
];

// Simple login for prototype hospital dashboard
export const loginHospital = async (req, res) => {
  try {
    const { email, password } = req.body;
    let hospital = await Hospital.findOne({ email });
    
    // Prototype auto-create if doesn't exist to make testing easy
    if (!hospital && email === 'demo@hospital.com') {
      hospital = new Hospital({
        name: 'Demo General Hospital',
        email: 'demo@hospital.com',
        password: 'password123',
        location: {
          address: '123 Medical Way',
          lat: 0,
          lng: 0
        }
      });
      await hospital.save();
    }

    if (hospital && (await hospital.matchPassword(password))) {
      // Return simple token/session identifier (basic implementation for prototype)
      res.json({
        _id: hospital._id,
        name: hospital.name,
        email: hospital.email,
        token: 'hospital_dummy_token_123'
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Hospital login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getReports = async (req, res) => {
  try {
    // Return all pending reports for the dashboard
    const reports = await EmergencyReport.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch emergency reports.' });
  }
};

export const respondToReport = async (req, res) => {
  try {
    const { reportId, hospitalId, responseType } = req.body; // responseType: 'Accepted' | 'Rejected'

    // Fetch report and check lock/status
    const report = await EmergencyReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    if (report.status !== 'Pending') {
      return res.status(400).json({ error: 'Case has already been claimed or processed.' });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found.' });
    }

    // Save Response Audit Log
    const hospitalResponse = new HospitalResponse({
      reportId,
      hospitalId,
      responseType
    });
    await hospitalResponse.save();

    // If accepted, update the actual EmergencyReport
    if (responseType === 'Accepted') {
      report.status = 'Accepted';
      report.respondedHospital = hospitalId;
      await report.save();

      // Demo Loop Logic: override the actual hospital with our predefined loop
      const activeDemoHospital = DEMO_HOSPITALS[demoIndex % DEMO_HOSPITALS.length];
      demoIndex++; // Increment for the next emergency

      // Emit real-time response back to the specific patient
      const io = req.app.get('io');
      if (io) {
        // We broadcast to the specific socket ID of the patient
        io.to(report.patientSocketId).emit('hospital_accepted', {
          reportId: report._id,
          hospital: activeDemoHospital
        });

        // Also broadcast to all hospitals that this report was claimed
        io.to('hospitals').emit('report_claimed', { reportId: report._id });
      }

      res.status(200).json({ message: 'Case successfully claimed.', report });
    } else {
      // Merely rejected by this UI, do not change overall status unless we implement complicated logic to track all rejections
      res.status(200).json({ message: 'Case rejected by your facility.' });
    }
    
  } catch (error) {
    console.error('Error responding to report:', error);
    res.status(500).json({ error: 'Server error while processing response.' });
  }
};
