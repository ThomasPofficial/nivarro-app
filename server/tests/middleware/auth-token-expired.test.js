const { startDB, stopDB } = require('../helpers');
const jwt = require('jsonwebtoken');
const { requireAuth } = require('../../middleware/auth');
const express = require('express');
const request = require('supertest');

function makeApp() {
  const app = express();
  app.get('/protected', requireAuth, (req, res) => res.json({ ok: true }));
  return app;
}

beforeAll(startDB);
afterAll(stopDB);

it('returns TOKEN_EXPIRED code on expired token', async () => {
  const token = jwt.sign({ id: 'abc' }, process.env.JWT_SECRET, { expiresIn: -1 });
  const res = await request(makeApp())
    .get('/protected')
    .set('Authorization', `Bearer ${token}`);
  expect(res.status).toBe(401);
  expect(res.body.code).toBe('TOKEN_EXPIRED');
});

it('returns AUTH_FAILED code on invalid token', async () => {
  const res = await request(makeApp())
    .get('/protected')
    .set('Authorization', 'Bearer badtoken');
  expect(res.status).toBe(401);
  expect(res.body.code).toBe('AUTH_FAILED');
});
