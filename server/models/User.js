import mongoose from 'mongoose';

// Define the structure of a user document in MongoDB
const userSchema = new mongoose.Schema(
  {
    // User's name
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    // User's email - must be unique
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
    },
    // User's password - will be hashed
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't send password when querying users
    },
  },
  { timestamps: true } // Automatically add createdAt, updatedAt
);

export default mongoose.model('User', userSchema);