require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Expense = require('./models/Expense');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expense-tracker';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB for seeding');

    // Remove existing demo user and expenses
    await User.deleteMany({ email: 'demo@example.com' });

    const hashed = await bcrypt.hash('password123', 10);
    const demoUser = new User({ name: 'Demo User', email: 'demo@example.com', password: hashed });
    await demoUser.save();
    console.log('Created demo user: demo@example.com / password123');

    const sampleExpenses = [
      { title: 'Groceries', amount: 54.23, category: 'food', type: 'expense', date: new Date(), description: 'Weekly groceries', paymentMethod: 'debit' },
      { title: 'Salary', amount: 2500, category: 'salary', type: 'income', date: new Date(), description: 'Monthly salary', paymentMethod: 'online' },
      { title: 'Gym Membership', amount: 29.99, category: 'personal', type: 'expense', date: new Date(), description: 'Monthly gym', paymentMethod: 'credit' }
    ];

    for (const e of sampleExpenses) {
      const exp = new Expense({ ...e, userId: demoUser._id });
      await exp.save();
    }

    console.log('Seeded sample expenses');
    await mongoose.disconnect();
    console.log('Disconnected. Seeding complete.');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
