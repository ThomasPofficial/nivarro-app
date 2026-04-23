const request = require('supertest');
const express = require('express');
const { startDB, stopDB, clearDB } = require('../helpers');
const authRoutes = require('../../routes/auth');

// Single mount — requireAuth is called internally per-route where needed
function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  return app;
}

beforeAll(startDB);
afterAll(stopDB);
beforeEach(clearDB);

describe('POST /api/auth/register', () => {
  it('registers a new user and returns token + user without password_hash', async () => {
    const res = await request(makeApp())
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@test.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('alice@test.com');
    expect(res.body.user.password_hash).toBeUndefined();
  });

  it('returns 409 for duplicate email', async () => {
    const app = makeApp();
    await request(app).post('/api/auth/register').send({ name: 'Alice', email: 'alice@test.com', password: 'password123' });
    const res = await request(app).post('/api/auth/register').send({ name: 'Alice2', email: 'alice@test.com', password: 'password123' });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('EMAIL_TAKEN');
  });

  it('returns 400 for short password', async () => {
    const res = await request(makeApp()).post('/api/auth/register').send({ name: 'Alice', email: 'alice@test.com', password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(makeApp()).post('/api/auth/register').send({ name: 'Alice', email: 'alice@test.com', password: 'password123' });
  });

  it('returns token + user on valid credentials', async () => {
    const res = await request(makeApp()).post('/api/auth/login').send({ email: 'alice@test.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.password_hash).toBeUndefined();
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(makeApp()).post('/api/auth/login').send({ email: 'alice@test.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('PATCH /api/auth/profile', () => {
  it('completes the profile for authenticated user, excludes password_hash', async () => {
    const reg = await request(makeApp()).post('/api/auth/register').send({ name: 'Alice', email: 'alice@test.com', password: 'password123' });
    const res = await request(makeApp())
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${reg.body.token}`)
      .send({ bio: 'I code', location: 'NYC', skills: ['JS'], interests: ['music'] });
    expect(res.status).toBe(200);
    expect(res.body.profile_complete).toBe(true);
    expect(res.body.password_hash).toBeUndefined();
  });

  it('returns 401 without token', async () => {
    const res = await request(makeApp()).patch('/api/auth/profile').send({ bio: 'hi' });
    expect(res.status).toBe(401);
  });
});
