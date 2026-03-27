require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { MONGODB_URI = 'mongodb://127.0.0.1:27017/expense_tracker' } = process.env;

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now }
});

const expenseSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  amount: Number,
  category: String,
  date: Date,
  description: String,
  type: { type: String, enum: ['expense', 'income'], default: 'expense' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Expense = mongoose.model('Expense', expenseSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const existingUser = await User.findOne({ email: 'demo@example.com' });
  if (existingUser) {
    console.log('Demo user already exists. Seed skipped.');
    return process.exit(0);
  }

  const hashed = await bcrypt.hash('password123', 10);
  const user = await User.create({ name: 'Demo User', email: 'demo@example.com', password: hashed });

  const sampleExpenses = [
    {
      user_id: user._id,
      title: 'Groceries',
      amount: 54.23,
      category: 'food',
      date: new Date('2024-03-20'),
      description: 'Weekly groceries',
      type: 'expense'
    },
    {
      user_id: user._id,
      title: 'Salary',
      amount: 2500.0,
      category: 'savings',
      date: new Date('2024-03-01'),
      description: 'Monthly salary',
      type: 'income'
    },
    {
      user_id: user._id,
      title: 'Gym Membership',
      amount: 29.99,
      category: 'personal',
      date: new Date('2024-03-05'),
      description: 'Monthly gym',
      type: 'expense'
    },
    {
      user_id: user._id,
      title: 'Movie Night',
      amount: 18.0,
      category: 'entertainment',
      date: new Date('2024-03-11'),
      description: 'Cinema with friends',
      type: 'expense'
    }
  ];

  await Expense.insertMany(sampleExpenses);
  console.log('Seed data inserted: demo@example.com / password123');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
