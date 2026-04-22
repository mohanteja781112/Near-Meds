import express from 'express';
import { handleChat, generateReport, saveReport } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', handleChat);
router.post('/generate-report', generateReport);
router.post('/save-report', protect, saveReport);

export default router;
