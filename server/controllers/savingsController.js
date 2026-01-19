import Savings from '../models/Savings.js';
import Transaction from '../models/Transaction.js';

// Get all savings goals for the logged-in user
export const getSavings = async (req, res) => {
  try {
    const savings = await Savings.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ savings });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create a new savings goal
export const createSavings = async (req, res) => {
  try {
    const { name, goalAmount } = req.body;
    if (!name || goalAmount === undefined) {
      return res.status(400).json({ message: 'Name and goal amount are required' });
    }

    const savings = await Savings.create({
      user: req.userId,
      name,
      goalAmount: Number(goalAmount),
      currentAmount: 0
    });

    res.status(201).json({ savings });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Add money to a savings goal (validates available balance)
export const addToSavings = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }

    // Calculate available balance: income - expense - all savings
    const transactions = await Transaction.find({ user: req.userId });
    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const allSavings = await Savings.find({ user: req.userId });
    const totalSaved = allSavings.reduce((s, sg) => s + sg.currentAmount, 0);
    const availableBalance = totalIncome - totalExpense - totalSaved;

    if (amount > availableBalance) {
      return res.status(400).json({
        message: `Insufficient balance. Available: ${availableBalance.toFixed(2)} €`
      });
    }

    const savings = await Savings.findOne({ _id: id, user: req.userId });
    if (!savings) return res.status(404).json({ message: 'Savings goal not found' });

    savings.currentAmount += Number(amount);
    await savings.save();
    res.json({ savings });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Remove money from a savings goal
export const removeFromSavings = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }

    const savings = await Savings.findOne({ _id: id, user: req.userId });
    if (!savings) return res.status(404).json({ message: 'Savings goal not found' });

    if (amount > savings.currentAmount) {
      return res.status(400).json({ message: 'Cannot withdraw more than current savings amount' });
    }

    savings.currentAmount -= Number(amount);
    await savings.save();
    res.json({ savings });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a savings goal
export const deleteSavings = async (req, res) => {
  try {
    const { id } = req.params;
    const savings = await Savings.findOneAndDelete({ _id: id, user: req.userId });
    if (!savings) return res.status(404).json({ message: 'Savings goal not found' });
    res.json({ message: 'Savings goal deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
