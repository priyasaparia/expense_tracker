require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
  MONGODB_URI = 'mongodb://127.0.0.1:27017/expense_tracker',
  JWT_SECRET = 'supersecret',
  PORT = 5000
} = process.env;

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend static files from root
app.use(express.static(require('path').join(__dirname, '..')));

// Mongoose models will be imported after DB connect
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ExpenseSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['expense', 'income'], default: 'expense' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Expense = mongoose.model('Expense', ExpenseSchema);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error', err);
  process.exit(1);
});

function generateToken(user) {
  return jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

app.get('/api/ping', (req, res) => res.json({ message: 'pong' }));

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();

    const token = generateToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Signup error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Me error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/expenses', authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ user_id: req.user.id }).sort({ date: -1, createdAt: -1 });
    res.json({ expenses });
  } catch (err) {
    console.error('Fetch expenses error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/expenses', authMiddleware, async (req, res) => {
  const { title, amount, category, date, description, type = 'expense' } = req.body;
  if (!title || !amount || !category || !date) {
    return res.status(400).json({ message: 'Title, amount, category and date are required' });
  }

  try {
    const expense = new Expense({
      user_id: req.user.id,
      title,
      amount,
      category,
      date,
      description: description || '',
      type
    });

    await expense.save();
    res.json({ expense });
  } catch (err) {
    console.error('Create expense error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/expenses/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, amount, category, date, description, type } = req.body;

  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: id, user_id: req.user.id },
      { title, amount, category, date, description, type },
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ expense });
  } catch (err) {
    console.error('Update expense error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/expenses/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Expense.findOneAndDelete({ _id: id, user_id: req.user.id });
    if (!result) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Delete expense error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/expenses/summary', authMiddleware, async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      { $match: { user_id: mongoose.Types.ObjectId(req.user.id), type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $project: { category: '$_id', total: 1, _id: 0 } }
    ]);

    res.json({ summary });
  } catch (err) {
    console.error('Summary error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
