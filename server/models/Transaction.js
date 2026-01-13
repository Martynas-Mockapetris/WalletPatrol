import mongoose from 'mongoose';

// Define the structure of a transaction document
const transactionSchema = new mongoose.Schema(
  {
    // Reference to the user who created this transaction
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Links to User model
      required: [true, 'Transaction must belong to a user']
    },
    // Date of the transaction
    date: {
      type: Date,
      required: [true, 'Please provide a date']
    },
    // Amount of money
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0, 'Amount cannot be negative']
    },
    // Type: either 'expense' or 'income'
    type: {
      type: String,
      enum: ['expense', 'income'],
      required: [true, 'Please specify transaction type']
    },
    // Optional comment describing the transaction
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    }
  },
  { timestamps: true } // Automatically add createdAt, updatedAt
);

// Create and export the Transaction model
export default mongoose.model('Transaction', transactionSchema);
