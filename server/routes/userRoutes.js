import express from 'express';
import { updateProfile, getDashboardStats } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.get('/dashboard', protect, getDashboardStats);

export default router;
