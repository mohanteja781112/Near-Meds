import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import crypto from 'crypto';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key', {
    expiresIn: '7d',
  });
};

export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    if (user) {
      await ActivityLog.create({
        userId: user.id,
        action: 'REGISTER',
        details: { method: 'email' }
      });

      res.status(201).json({
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      console.log(`Login failed: User not found for email ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Login failed: Password mismatch for user ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    await ActivityLog.create({
      userId: user.id,
      action: 'LOGIN',
      details: { method: 'email' }
    });

    res.status(200).json({
      _id: user.id,
      fullName: user.fullName,
      email: user.email,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, picture, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.picture = picture;
        await user.save();
      }
    } else {
      user = await User.create({
        fullName: name,
        email,
        googleId,
        picture,
        password: crypto.randomBytes(16).toString('hex'), 
      });
    }

    res.status(200).json({
      _id: user.id,
      fullName: user.fullName,
      email: user.email,
      picture: user.picture,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

export const getMe = async (req, res) => {
  res.status(200).json(req.user);
};
