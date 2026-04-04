import Pharmacy from '../models/Pharmacy.js';
import ActivityLog from '../models/ActivityLog.js';

export const getNearestPharmacies = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const pharmacies = await Pharmacy.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: parseInt(radius) 
        }
      }
    });
    if (req.user) {
      await ActivityLog.create({
        userId: req.user._id,
        action: 'MEDICINE_SEARCH',
        details: { 
          coordinates: { lat, lng },
          radius,
          resultsCount: pharmacies.length
        }
      });
    }

    res.status(200).json({
      count: pharmacies.length,
      data: pharmacies
    });
  } catch (error) {
    console.error('Error fetching nearest pharmacies:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Seed sample pharmacies
// @route   POST /api/pharmacies/seed
// @access  Public (should optionally be protected in production)
export const seedPharmacies = async (req, res) => {
  try {
    const defaultPharmacies = [
      {
        name: "HealthGuard Pharmacy",
        address: {
          street: "123 Main St",
          city: "Metropolis",
          state: "NY",
          zipCode: "10001",
          fullAddress: "123 Main St, Metropolis, NY 10001"
        },
        location: {
          type: "Point",
          coordinates: [-73.935242, 40.730610] // Example coordinates (NYC)
        },
        operatingHours: { open: "08:00", close: "22:00", is24Hours: false },
        contact: { phone: "555-0101", email: "contact@healthguard.com" }
      },
      {
        name: "CityCare Drugs",
        address: {
          street: "456 Broadway",
          city: "Metropolis",
          state: "NY",
          zipCode: "10002",
          fullAddress: "456 Broadway, Metropolis, NY 10002"
        },
        location: {
          type: "Point",
          coordinates: [-73.998466, 40.723080]
        },
        operatingHours: { open: "00:00", close: "00:00", is24Hours: true },
        contact: { phone: "555-0102", email: "info@citycaredrugs.com" }
      }
      // Add more as needed
    ];
    
    // Check if we need to clear existing for clean seed
    // await Pharmacy.deleteMany({}); // Uncomment if you want to clear first

    const createdPharmacies = await Pharmacy.insertMany(defaultPharmacies);
    
    res.status(201).json({
      message: 'Pharmacies seeded successfully',
      count: createdPharmacies.length,
      data: createdPharmacies
    });
  } catch (error) {
    console.error('Error seeding pharmacies:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
