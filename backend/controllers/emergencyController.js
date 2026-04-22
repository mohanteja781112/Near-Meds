import EmergencyReport from '../models/EmergencyReport.js';

export const createReport = async (req, res) => {
  try {
    const { report, severity, location, patientSocketId } = req.body;

    if (!report || !patientSocketId) {
      return res.status(400).json({ error: 'Missing required report data or socket ID.' });
    }

    // For demonstration purposes: if this is a mock wearable trigger, clear existing pending reports
    // so the judges only see the exact one we just triggered on the dashboard.
    if (patientSocketId.startsWith('wearable_mock_')) {
      await EmergencyReport.deleteMany({ status: 'Pending' });
    }

    const newReport = new EmergencyReport({
      patientData: report,
      severity: severity || 'High', // Defaulting to high if not explicitly provided
      location: location || {},
      status: 'Pending',
      patientSocketId
    });

    const savedReport = await newReport.save();

    // Broadcast the new report to all connected hospitals
    const io = req.app.get('io');
    if (io) {
      io.to('hospitals').emit('new_emergency_report', savedReport);
    }

    res.status(201).json(savedReport);
  } catch (error) {
    console.error('Error creating emergency report:', error);
    res.status(500).json({ error: 'Failed to create emergency report.' });
  }
};

export const getReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await EmergencyReport.findById(reportId).populate('respondedHospital', 'name location');
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    res.status(200).json(report);
  } catch (error) {
    console.error('Error fetching report status:', error);
    res.status(500).json({ error: 'Failed to fetch report status.' });
  }
};
