const express = require('express');
const router = express.Router();
const ThreadService = require('../services/ThreadService');
const MessageService = require('../services/MessageService');
const ContactRequest = require('../models/ContactRequest');
const { getIo } = require('../socket/instance');

router.get('/', async (req, res) => {
  try {
    const threads = await ThreadService.getThreadsForUser(req.user.id);
    res.json(threads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/messages', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    const result = await MessageService.getHistory(req.params.id, req.user.id, req.query.before || null, limit);
    res.json(result);
  } catch (err) {
    if (err.code === 'NOT_PARTICIPANT') return res.status(403).json({ code: err.code, message: err.message });
    res.status(500).json({ message: err.message });
  }
});

router.post('/group', async (req, res) => {
  try {
    const { name, member_ids } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Team name is required' });
    }
    if (!member_ids || member_ids.length === 0) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'At least one member is required' });
    }

    const creatorId = req.user.id;
    for (const memberId of member_ids) {
      const cr = await ContactRequest.findOne({
        status: 'accepted',
        $or: [
          { sender_id: creatorId, recipient_id: memberId },
          { sender_id: memberId, recipient_id: creatorId },
        ],
      });
      if (!cr) {
        return res.status(403).json({ code: 'FORBIDDEN', message: 'All members must be confirmed contacts' });
      }
    }

    const thread = await ThreadService.createGroupThread(creatorId, name, member_ids);

    const io = getIo();
    if (io) {
      const payload = {
        thread_id: thread._id.toString(),
        type: 'group',
        group_name: thread.name,
        members: thread.participants.map(id => ({ _id: id })),
        last_message: null,
        participant: null,
      };
      thread.participants.forEach(participantId => {
        io.to(participantId.toString()).emit('thread_updated', payload);
      });
    }

    res.status(201).json(thread);
  } catch (err) {
    const status = err.code === 'VALIDATION_ERROR' ? 400 : err.code === 'FORBIDDEN' ? 403 : 500;
    res.status(status).json({ code: err.code, message: err.message });
  }
});

module.exports = router;
