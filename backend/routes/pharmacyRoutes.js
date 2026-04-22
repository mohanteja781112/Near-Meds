import express from 'express';
import { getNearestPharmacies, seedPharmacies } from '../controllers/pharmacyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.router ? express.Router() : express.Router; // handle potential import edge cases, though just express.Router() is standard

const pharmacyRouter = express.Router();

pharmacyRouter.get('/nearest', protect, getNearestPharmacies);
pharmacyRouter.post('/seed', seedPharmacies);

export default pharmacyRouter;
