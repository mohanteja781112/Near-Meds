import express from 'express';
import { saveLocation, getUserLocations, deleteLocation, updateUserLocation } from '../controllers/locationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/save', protect, saveLocation);
router.get('/user-locations', protect, getUserLocations);
router.delete('/:id', protect, deleteLocation);
router.post('/update', protect, updateUserLocation); // Keeping for backward compatibility/legacy

export default router;
