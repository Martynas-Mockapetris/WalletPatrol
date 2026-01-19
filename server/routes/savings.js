import express from 'express';
import { protect } from '../middleware/auth.js';
import { getSavings, createSavings, addToSavings, removeFromSavings, deleteSavings } from '../controllers/savingsController.js';

const router = express.Router();

// All routes require authentication
router.get('/', protect, getSavings);
router.post('/', protect, createSavings);
router.put('/:id/add', protect, addToSavings);
router.put('/:id/remove', protect, removeFromSavings);
router.delete('/:id', protect, deleteSavings);

export default router;
