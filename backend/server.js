require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Expense = require('./Expense');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
if (!MONGO_URI || MONGO_URI === 'YOUR_MONGODB_ATLAS_CONNECTION_STRING') {
  console.warn('\n⚠️ WARNING: Please set your valid MongoDB connection string in backend/.env (MONGO_URI)\n');
} else {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB Atlas successfully');
    })
    .catch((err) => {
      console.error('❌ MongoDB Atlas connection error:', err.message);
    });
}

// Middleware to check database connection status
const checkDbConnection = (req, res, next) => {
  // mongoose.connection.readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is not connected. Please verify MONGO_URI in backend/.env and ensure MongoDB Atlas IP access is allowed.'
    });
  }
  next();
};

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'ok',
    message: 'Personal Expense Tracker API is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// GET /api/expenses - Retrieve all expenses sorted by date descending
app.get('/api/expenses', checkDbConnection, async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve expenses',
      error: error.message
    });
  }
});

// POST /api/expenses - Add a new expense
app.post('/api/expenses', checkDbConnection, async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    // Validation checks
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Expense title is required and cannot be empty.'
      });
    }

    if (amount === undefined || amount === null || amount === '') {
      return res.status(400).json({
        success: false,
        message: 'Amount is required.'
      });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a valid positive number greater than zero.'
      });
    }

    const validCategories = ['Food', 'Travel', 'Bills', 'Shopping', 'Other'];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Category is required and must be Food, Travel, Bills, Shopping, or Other.'
      });
    }

    if (!date || isNaN(new Date(date).getTime())) {
      return res.status(400).json({
        success: false,
        message: 'A valid date is required.'
      });
    }

    const newExpense = new Expense({
      title: title.trim(),
      amount: numericAmount,
      category,
      date: new Date(date)
    });

    const savedExpense = await newExpense.save();

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: savedExpense
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create expense'
    });
  }
});

// PUT /api/expenses/:id - Update an existing expense
app.put('/api/expenses/:id', checkDbConnection, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expense ID format.'
      });
    }

    const { title, amount, category, date } = req.body;

    // Validation checks
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Expense title is required and cannot be empty.'
      });
    }

    if (amount === undefined || amount === null || amount === '') {
      return res.status(400).json({
        success: false,
        message: 'Amount is required.'
      });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a valid positive number greater than zero.'
      });
    }

    const validCategories = ['Food', 'Travel', 'Bills', 'Shopping', 'Other'];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Category is required and must be Food, Travel, Bills, Shopping, or Other.'
      });
    }

    if (!date || isNaN(new Date(date).getTime())) {
      return res.status(400).json({
        success: false,
        message: 'A valid date is required.'
      });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        amount: numericAmount,
        category,
        date: new Date(date)
      },
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found with the provided ID.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: updatedExpense
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update expense'
    });
  }
});

// DELETE /api/expenses/:id - Delete an expense
app.delete('/api/expenses/:id', checkDbConnection, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expense ID format.'
      });
    }

    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found with the provided ID.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
      data: deletedExpense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense',
      error: error.message
    });
  }
});

// Fallback for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (http://localhost:${PORT})`);
});
