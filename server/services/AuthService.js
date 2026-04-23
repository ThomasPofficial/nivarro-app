const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function appError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function safeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    photo_url: user.photo_url,
    profile_complete: user.profile_complete,
  };
}

async function register(name, email, password) {
  if (!name || !name.trim()) throw appError('VALIDATION_ERROR', 'Name is required');
  if (!password || password.length < 8) throw appError('VALIDATION_ERROR', 'Password must be at least 8 characters');

  const existing = await User.findOne({ email });
  if (existing) throw appError('EMAIL_TAKEN', 'Email already registered');

  const password_hash = await bcrypt.hash(password, 12);
  const user = await User.create({ name: name.trim(), email, password_hash, profile_complete: false });
  return { token: signToken(user), user: safeUser(user) };
}

async function login(email, password) {
  const user = await User.findOne({ email });
  if (!user || !user.password_hash) throw appError('INVALID_CREDENTIALS', 'Invalid email or password');

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw appError('INVALID_CREDENTIALS', 'Invalid email or password');

  return { token: signToken(user), user: safeUser(user) };
}

async function completeProfile(userId, { bio, location, skills, interests } = {}) {
  return User.findByIdAndUpdate(
    userId,
    { $set: { profile_complete: true, bio: bio || '', location: location || '', skills: skills || [], interests: interests || [] } },
    { new: true }
  ).select('-password_hash');
}

module.exports = { register, login, completeProfile };
