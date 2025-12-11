import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const OTP_TTL_MINUTES = 10;

const createToken = (userId) =>
  jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpDev = (email, otp) => {
  // Placeholder for actual email service; logged for development.
  console.log(`[OTP] Send to ${email}: ${otp}`);
};

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otpCode = generateOtp();
    const otpExpiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await User.create({
      fullName,
      email: email.toLowerCase(),
      passwordHash,
      otpCode,
      otpExpiresAt,
      verified: false,
    });

    sendOtpDev(email, otpCode);

    res.json({
      success: true,
      message: 'Signup successful. Please verify the OTP sent to your email.',
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to signup.' });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.verified) {
      return res.json({ success: true, message: 'Already verified.' });
    }

    if (
      user.otpCode !== otp ||
      !user.otpExpiresAt ||
      user.otpExpiresAt < new Date()
    ) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    user.verified = true;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const token = createToken(user.id);
    res.json({ success: true, token });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    if (!user.verified) {
      return res.status(403).json({ error: 'Account not verified. Please verify OTP.' });
    }

    const token = createToken(user.id);
    res.json({ success: true, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login.' });
  }
};

