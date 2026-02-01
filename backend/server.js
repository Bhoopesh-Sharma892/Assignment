const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/startup-benefits', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Models
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const DealSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  partner: { type: String, required: true },
  category: { type: String, required: true },
  accessLevel: { type: String, enum: ['public', 'locked'], default: 'public' },
  eligibilityCriteria: { type: String },
  discount: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const ClaimSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  claimedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Deal = mongoose.model('Deal', DealSchema);
const Claim = mongoose.model('Claim', ClaimSchema);

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        verified: user.verified
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all deals
app.get('/api/deals', async (req, res) => {
  try {
    const deals = await Deal.find();
    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single deal
app.get('/api/deals/:id', async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Claim a deal (protected)
app.post('/api/deals/:id/claim', authenticateToken, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Check if deal is locked and user is not verified
    if (deal.accessLevel === 'locked') {
      const user = await User.findById(req.user.userId);
      if (!user.verified) {
        return res.status(403).json({ message: 'Verification required for locked deals' });
      }
    }

    // Check if already claimed
    const existingClaim = await Claim.findOne({
      userId: req.user.userId,
      dealId: req.params.id
    });

    if (existingClaim) {
      return res.status(400).json({ message: 'Deal already claimed' });
    }

    const claim = new Claim({
      userId: req.user.userId,
      dealId: req.params.id
    });

    await claim.save();
    res.status(201).json({ message: 'Deal claimed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's claimed deals (protected)
app.get('/api/user/claims', authenticateToken, async (req, res) => {
  try {
    const claims = await Claim.find({ userId: req.user.userId })
      .populate('dealId')
      .sort({ claimedAt: -1 });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Seed some sample data
app.post('/api/seed', async (req, res) => {
  try {
    // Clear existing data
    await Deal.deleteMany({});
    await Claim.deleteMany({});

    // Sample deals
    const deals = [
      {
        title: 'AWS Credits for Startups',
        description: 'Get $100,000 in AWS credits to build your startup infrastructure.',
        partner: 'Amazon Web Services',
        category: 'Cloud Services',
        accessLevel: 'public',
        eligibilityCriteria: 'Must be a registered startup with less than 2 years in operation',
        discount: '$100,000 credits'
      },
      {
        title: 'Premium Slack Plan',
        description: 'Free premium Slack plan for 2 years.',
        partner: 'Slack',
        category: 'Productivity',
        accessLevel: 'locked',
        eligibilityCriteria: 'Verified startup founders only',
        discount: '2 years free'
      },
      {
        title: 'Google Workspace Business Starter',
        description: 'Free Google Workspace for your team.',
        partner: 'Google',
        category: 'Productivity',
        accessLevel: 'public',
        eligibilityCriteria: 'Startup teams with 2+ members',
        discount: 'Free for 1 year'
      },
      {
        title: 'Stripe Atlas Program',
        description: 'Incorporation services and banking setup for international startups.',
        partner: 'Stripe',
        category: 'Financial Services',
        accessLevel: 'locked',
        eligibilityCriteria: 'Verified startup with international operations',
        discount: 'Discounted incorporation fees'
      }
    ];

    await Deal.insertMany(deals);
    res.json({ message: 'Sample data seeded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
