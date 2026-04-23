const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, default: null },
  profile_complete: { type: Boolean, default: false },
  photo_url: { type: String, default: null },
  skills: [String],
  bio: { type: String, default: '' },
  interests: [String],
  location: { type: String, default: '' },
  last_seen: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
