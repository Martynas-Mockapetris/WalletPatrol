import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController.js';

const router = express.Router();

// ========== PROTECTED ROUTES (require JWT) ==========

// POST /api/transactions - Create new transaction
// protect middleware runs FIRST, extracts userId, then createTransaction
router.post('/', protect, createTransaction);

// GET /api/transactions - Get user's transactions (optional month/year query)
// Example: GET /api/transactions?month=1&year=2026
router.get('/', protect, getTransactions);

// PUT /api/transactions/:id - Update specific transaction
// Example: PUT /api/transactions/123abc...
router.put('/:id', protect, updateTransaction);

// DELETE /api/transactions/:id - Delete specific transaction
router.delete('/:id', protect, deleteTransaction);

export default router;