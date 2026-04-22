import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import SavedLocation from '../models/SavedLocation.js';
import MedicalReport from '../models/MedicalReport.js';
import bcrypt from 'bcryptjs';

//@desc    Update user profile (name, password)
//@route   PUT /api/user/profile
//@access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (req.body.fullName) {
      user.fullName = req.body.fullName;
    }

    if (req.body.password) {
      //Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    //Log update
    await ActivityLog.create({
      userId: user.id,
      action: 'PROFILE_UPDATE',
      details: { fields: Object.keys(req.body) }
    });

    res.status(200).json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

//@desc    Get dashboard statistics
//@route   GET /api/user/dashboard
//@access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    //Aggregate stats
    const totalLogins = await ActivityLog.countDocuments({ userId, action: 'LOGIN' });
    const totalSearches = await ActivityLog.countDocuments({ userId, action: 'SEARCH' });
    const savedLocationsCount = await SavedLocation.countDocuments({ userId });
    
    //Recent activity
    const recentActivity = await ActivityLog.find({ userId })
      .sort({ timestamp: -1 })
      .limit(5);

    //Saved Reports
    const savedReports = await MedicalReport.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      stats: {
        logins: totalLogins,
        searches: totalSearches,
        locations: savedLocationsCount,
        reports: savedReports.length
      },
      recentActivity,
      savedReports
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};
