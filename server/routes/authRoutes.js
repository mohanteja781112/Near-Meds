import express from 'express';
import { register, login, googleAuth, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/signup', register); //Alias for register
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', protect, getMe); //Protected Route

export default router;
