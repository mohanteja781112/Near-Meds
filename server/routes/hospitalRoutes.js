import express from 'express';
import { getReports, respondToReport, loginHospital } from '../controllers/hospitalController.js';

const router = express.Router();

// Note: authentication middleware can be added later, prototype will just use raw endpoints
router.post('/login', loginHospital);
router.get('/reports', getReports);
router.post('/respond', respondToReport);

export default router;
