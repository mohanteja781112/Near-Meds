import express from 'express';
import { createReport, getReportStatus } from '../controllers/emergencyController.js';

const router = express.Router();

router.post('/create-report', createReport);
router.get('/status/:reportId', getReportStatus);

export default router;
