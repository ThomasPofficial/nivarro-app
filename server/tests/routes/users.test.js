const request = require('supertest');
const express = require('express');
const { startDB, stopDB, clearDB, makeToken } = require('../helpers');
const usersRoutes = require('../../routes/users');
const { requireAuth } = require('../../middleware/auth');
const User = require('../../models/User');
const ContactRequest = require('../../models/ContactRequest');

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/users', requireAuth, usersRoutes);
  return app;
}

beforeAll(startDB);
afterAll(stopDB);
beforeEach(clearDB);

let alice, bob, app;
beforeEach(async () => {
  alice = await User.create({ name: 'Alice Smith', email: 'alice@test.com' });
  bob   = await User.create({ name: 'Bob Jones',  email: 'bob@test.com' });
  app = makeApp();
});

describe('GET /api/users/search', () => {
  it('returns users matching partial name (case-insensitive), excludes self', async () => {
    const res = await request(app)
      .get('/api/users/search?q=alice')
      .set('Authorization', `Bearer ${makeToken(bob._id)}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Alice Smith');
  });

  it('excludes the requesting user from results', async () => {
    const res = await request(app)
      .get('/api/users/search?q=alice')
      .set('Authorization', `Bearer ${makeToken(alice._id)}`);
    expect(res.body).toHaveLength(0);
  });

  it('returns connection_status none when no relationship exists', async () => {
    const res = await request(app)
      .get('/api/users/search?q=bob')
      .set('Authorization', `Bearer ${makeToken(alice._id)}`);
    expect(res.body[0].connection_status).toBe('none');
  });

  it('returns pending_sent when current user sent the request', async () => {
    await ContactRequest.create({ sender_id: alice._id, recipient_id: bob._id, status: 'pending' });
    const res = await request(app)
      .get('/api/users/search?q=bob')
      .set('Authorization', `Bearer ${makeToken(alice._id)}`);
    expect(res.body[0].connection_status).toBe('pending_sent');
  });

  it('returns pending_received when other user sent the request', async () => {
    await ContactRequest.create({ sender_id: bob._id, recipient_id: alice._id, status: 'pending' });
    const res = await request(app)
      .get('/api/users/search?q=bob')
      .set('Authorization', `Bearer ${makeToken(alice._id)}`);
    expect(res.body[0].connection_status).toBe('pending_received');
  });

  it('returns connected when request is accepted', async () => {
    await ContactRequest.create({ sender_id: alice._id, recipient_id: bob._id, status: 'accepted' });
    const res = await request(app)
      .get('/api/users/search?q=bob')
      .set('Authorization', `Bearer ${makeToken(alice._id)}`);
    expect(res.body[0].connection_status).toBe('connected');
  });

  it('returns empty array for blank query without hitting DB', async () => {
    const res = await request(app)
      .get('/api/users/search')
      .set('Authorization', `Bearer ${makeToken(alice._id)}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/users/search?q=alice');
    expect(res.status).toBe(401);
  });
});
