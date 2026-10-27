const mongoose = require('mongoose');

const allowedCategories = ['Food', 'Travel', 'Bills', 'Shopping', 'Other'];

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: allowedCategories,
        message: '{VALUE} is not a valid category. Choose from Food, Travel, Bills, Shopping, or Other.'
      }
    },
    date: {
      type: Date,
      required: [true, 'Date is required']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Expense', expenseSchema);
