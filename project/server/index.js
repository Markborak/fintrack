import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection (commented out for demo)
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.error('MongoDB connection error:', err));

// Mock data for demo
let users = [
  {
    _id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    password: bcrypt.hashSync('password123', 10),
    createdAt: new Date()
  }
];

let transactions = [
  {
    _id: '1',
    user: '1',
    description: 'Salary',
    amount: 5000,
    type: 'income',
    category: 'Salary',
    date: new Date('2023-11-01'),
    notes: 'Monthly salary',
    createdAt: new Date()
  },
  {
    _id: '2',
    user: '1',
    description: 'Rent',
    amount: 1200,
    type: 'expense',
    category: 'Housing',
    date: new Date('2023-11-02'),
    notes: 'Monthly rent',
    createdAt: new Date()
  },
  {
    _id: '3',
    user: '1',
    description: 'Groceries',
    amount: 150,
    type: 'expense',
    category: 'Food',
    date: new Date('2023-11-05'),
    notes: 'Weekly groceries',
    createdAt: new Date()
  },
  {
    _id: '4',
    user: '1',
    description: 'Freelance Work',
    amount: 1000,
    type: 'income',
    category: 'Freelance',
    date: new Date('2023-11-10'),
    notes: 'Website project',
    createdAt: new Date()
  },
  {
    _id: '5',
    user: '1',
    description: 'Dinner with friends',
    amount: 85,
    type: 'expense',
    category: 'Entertainment',
    date: new Date('2023-11-12'),
    notes: 'Italian restaurant',
    createdAt: new Date()
  }
];

let categories = [
  { _id: '1', user: '1', name: 'Housing', type: 'expense' },
  { _id: '2', user: '1', name: 'Food', type: 'expense' },
  { _id: '3', user: '1', name: 'Transportation', type: 'expense' },
  { _id: '4', user: '1', name: 'Entertainment', type: 'expense' },
  { _id: '5', user: '1', name: 'Healthcare', type: 'expense' },
  { _id: '6', user: '1', name: 'Salary', type: 'income' },
  { _id: '7', user: '1', name: 'Freelance', type: 'income' },
  { _id: '8', user: '1', name: 'Investment', type: 'income' }
];

// JWT middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, 'secret_key'); // In production, use process.env.JWT_SECRET
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication required' });
  }
};

// Routes

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    if (users.find(user => user.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const newUser = {
      _id: (users.length + 1).toString(),
      name,
      email,
      password: bcrypt.hashSync(password, 10),
      createdAt: new Date()
    };
    
    users.push(newUser);
    
    // Create token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      'secret_key', // In production, use process.env.JWT_SECRET
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = users.find(user => user.email === email);
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      'secret_key', // In production, use process.env.JWT_SECRET
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/user', auth, async (req, res) => {
  try {
    const user = users.find(user => user._id === req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/auth/user', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Find user
    const userIndex = users.findIndex(user => user._id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user
    users[userIndex] = {
      ...users[userIndex],
      name,
      email
    };
    
    res.json({
      id: users[userIndex]._id,
      name: users[userIndex].name,
      email: users[userIndex].email
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/auth/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find user
    const userIndex = users.findIndex(user => user._id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check current password
    if (!bcrypt.compareSync(currentPassword, users[userIndex].password)) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    users[userIndex].password = bcrypt.hashSync(newPassword, 10);
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Transaction routes
app.get('/api/transactions', auth, async (req, res) => {
  try {
    const userTransactions = transactions.filter(
      transaction => transaction.user === req.user.id
    );
    
    res.json(userTransactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/transactions', auth, async (req, res) => {
  try {
    const { description, amount, type, category, date, notes } = req.body;
    
    const newTransaction = {
      _id: (transactions.length + 1).toString(),
      user: req.user.id,
      description,
      amount,
      type,
      category,
      date: new Date(date),
      notes,
      createdAt: new Date()
    };
    
    transactions.push(newTransaction);
    
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/transactions/:id', auth, async (req, res) => {
  try {
    const { description, amount, type, category, date, notes } = req.body;
    
    // Find transaction
    const transactionIndex = transactions.findIndex(
      transaction => transaction._id === req.params.id && transaction.user === req.user.id
    );
    
    if (transactionIndex === -1) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Update transaction
    transactions[transactionIndex] = {
      ...transactions[transactionIndex],
      description,
      amount,
      type,
      category,
      date: new Date(date),
      notes
    };
    
    res.json(transactions[transactionIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/transactions/:id', auth, async (req, res) => {
  try {
    // Find transaction
    const transactionIndex = transactions.findIndex(
      transaction => transaction._id === req.params.id && transaction.user === req.user.id
    );
    
    if (transactionIndex === -1) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Delete transaction
    transactions.splice(transactionIndex, 1);
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Category routes
app.get('/api/categories', auth, async (req, res) => {
  try {
    const userCategories = categories.filter(
      category => category.user === req.user.id
    );
    
    res.json(userCategories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/categories', auth, async (req, res) => {
  try {
    const { name, type } = req.body;
    
    // Check if category already exists
    if (categories.find(
      category => category.user === req.user.id && category.name === name && category.type === type
    )) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    
    const newCategory = {
      _id: (categories.length + 1).toString(),
      user: req.user.id,
      name,
      type
    };
    
    categories.push(newCategory);
    
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});