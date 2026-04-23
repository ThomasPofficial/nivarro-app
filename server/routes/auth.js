const express = require('express');
const router = express.Router();
const AuthService = require('../services/AuthService');
const { requireAuth } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const result = await AuthService.register(name, email, password);
    res.status(201).json(result);
  } catch (err) {
    const status = err.code === 'EMAIL_TAKEN' ? 409 : err.code === 'VALIDATION_ERROR' ? 400 : 500;
    res.status(status).json({ code: err.code, message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ code: err.code, message: err.message });
  }
});

router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const { bio, location, skills, interests } = req.body;
    const updated = await AuthService.completeProfile(req.user.id, { bio, location, skills, interests });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
