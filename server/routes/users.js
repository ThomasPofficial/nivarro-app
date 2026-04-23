const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ContactRequest = require('../models/ContactRequest');

router.get('/search', async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json([]);

    const users = await User.find({
      _id: { $ne: req.user.id },
      name: { $regex: q, $options: 'i' },
    }).select('name photo_url').limit(20);

    const results = await Promise.all(users.map(async (u) => {
      const cr = await ContactRequest.findOne({
        $or: [
          { sender_id: req.user.id, recipient_id: u._id },
          { sender_id: u._id, recipient_id: req.user.id },
        ],
      });

      let connection_status = 'none';
      if (cr) {
        if (cr.status === 'accepted') {
          connection_status = 'connected';
        } else if (cr.status === 'pending') {
          connection_status = cr.sender_id.toString() === req.user.id
            ? 'pending_sent'
            : 'pending_received';
        }
      }

      return { _id: u._id, name: u.name, photo_url: u.photo_url, connection_status };
    }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
