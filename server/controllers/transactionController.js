import Transaction from '../models/Transaction.js';

// ========== CREATE NEW TRANSACTION ==========
// POST /api/transactions
export const createTransaction = async (req, res) => {
  try {
    const { date, amount, type, comment } = req.body;
    const userId = req.userId; // From middleware!

    // Validation
    if (!date || !amount || !type) {
      return res.status(400).json({ 
        message: 'Please provide date, amount, and type' 
      });
    }

    // Validate type is either 'expense' or 'income'
    if (type !== 'expense' && type !== 'income') {
      return res.status(400).json({ 
        message: 'Type must be either "expense" or "income"' 
      });
    }

    // Create transaction with userId (from middleware)
    const transaction = await Transaction.create({
      user: userId,        // Automatically links to logged-in user!
      date,
      amount,
      type,
      comment: comment || '', // Optional
    });

    res.status(201).json({
      message: 'Transaction created',
      transaction,
    });
  } catch (err) {
    console.error('Create transaction error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ========== READ TRANSACTIONS ==========
// GET /api/transactions?month=1&year=2026
export const getTransactions = async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.userId; // From middleware!

    // If no month/year provided, return all user's transactions
    if (!month || !year) {
      const transactions = await Transaction.find({ user: userId }).sort({ date: -1 });
      return res.json({
        message: 'All transactions',
        count: transactions.length,
        transactions,
      });
    }

    // If month/year provided, filter by that month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const transactions = await Transaction.find({
      user: userId,  // Only this user's data
      date: { $gte: startDate, $lt: endDate }, // Only this month
    }).sort({ date: 1 });

    res.json({
      message: `Transactions for ${month}/${year}`,
      month,
      year,
      count: transactions.length,
      transactions,
    });
  } catch (err) {
    console.error('Get transactions error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ========== UPDATE TRANSACTION ==========
// PUT /api/transactions/:id
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, amount, type, comment } = req.body;
    const userId = req.userId;

    // Find transaction
    let transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if this transaction belongs to the logged-in user
    if (transaction.user.toString() !== userId.toString()) {
      return res.status(403).json({ 
        message: 'Not authorized to update this transaction' 
      });
    }

    // Update fields
    if (date) transaction.date = date;
    if (amount) transaction.amount = amount;
    if (type) transaction.type = type;
    if (comment !== undefined) transaction.comment = comment;

    // Save to database
    transaction = await transaction.save();

    res.json({
      message: 'Transaction updated',
      transaction,
    });
  } catch (err) {
    console.error('Update transaction error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ========== DELETE TRANSACTION ==========
// DELETE /api/transactions/:id
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Find transaction
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if this transaction belongs to the logged-in user
    if (transaction.user.toString() !== userId.toString()) {
      return res.status(403).json({ 
        message: 'Not authorized to delete this transaction' 
      });
    }

    // Delete transaction
    await Transaction.findByIdAndDelete(id);

    res.json({
      message: 'Transaction deleted successfully',
    });
  } catch (err) {
    console.error('Delete transaction error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};