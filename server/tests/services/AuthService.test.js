const { startDB, stopDB, clearDB } = require('../helpers');
const AuthService = require('../../services/AuthService');

beforeAll(startDB);
afterAll(stopDB);
beforeEach(clearDB);

describe('AuthService.register', () => {
  it('creates a user and returns token + user without password_hash', async () => {
    const result = await AuthService.register('Alice', 'alice@test.com', 'password123');
    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('alice@test.com');
    expect(result.user.password_hash).toBeUndefined();
    expect(result.user.profile_complete).toBe(false);
  });

  it('throws EMAIL_TAKEN if email already registered', async () => {
    await AuthService.register('Alice', 'alice@test.com', 'password123');
    await expect(AuthService.register('Alice2', 'alice@test.com', 'password456'))
      .rejects.toMatchObject({ code: 'EMAIL_TAKEN' });
  });

  it('throws VALIDATION_ERROR if password less than 8 chars', async () => {
    await expect(AuthService.register('Alice', 'alice@test.com', 'short'))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('throws VALIDATION_ERROR if name missing', async () => {
    await expect(AuthService.register('', 'alice@test.com', 'password123'))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});

describe('AuthService.login', () => {
  beforeEach(async () => {
    await AuthService.register('Alice', 'alice@test.com', 'password123');
  });

  it('returns token + user on correct credentials', async () => {
    const result = await AuthService.login('alice@test.com', 'password123');
    expect(result.token).toBeDefined();
    expect(result.user.name).toBe('Alice');
    expect(result.user.password_hash).toBeUndefined();
  });

  it('throws INVALID_CREDENTIALS on wrong password', async () => {
    await expect(AuthService.login('alice@test.com', 'wrongpass'))
      .rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
  });

  it('throws INVALID_CREDENTIALS on unknown email', async () => {
    await expect(AuthService.login('nobody@test.com', 'password123'))
      .rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
  });
});

describe('AuthService.completeProfile', () => {
  it('sets profile_complete to true and updates fields, excluding password_hash', async () => {
    const { user } = await AuthService.register('Alice', 'alice@test.com', 'password123');
    const updated = await AuthService.completeProfile(user._id, {
      bio: 'I code', location: 'NYC', skills: ['JS'], interests: ['music'],
    });
    expect(updated.profile_complete).toBe(true);
    expect(updated.bio).toBe('I code');
    expect(updated.password_hash).toBeUndefined();
  });

  it('sets profile_complete true even with empty fields', async () => {
    const { user } = await AuthService.register('Alice', 'alice@test.com', 'password123');
    const updated = await AuthService.completeProfile(user._id, {});
    expect(updated.profile_complete).toBe(true);
    expect(updated.password_hash).toBeUndefined();
  });
});
