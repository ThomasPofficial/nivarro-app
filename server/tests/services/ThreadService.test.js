const { startDB, stopDB, clearDB } = require('../helpers');
const ThreadService = require('../../services/ThreadService');
const User = require('../../models/User');
const Thread = require('../../models/Thread');

beforeAll(startDB);
afterAll(stopDB);
beforeEach(clearDB);

let alice, bob;
beforeEach(async () => {
  alice = await User.create({ name: 'Alice', email: 'alice@test.com' });
  bob = await User.create({ name: 'Bob', email: 'bob@test.com' });
});

describe('createThread', () => {
  it('creates a new thread between two users', async () => {
    const thread = await ThreadService.createThread(alice._id, bob._id);
    expect(thread.participants.map(String)).toEqual(expect.arrayContaining([alice._id.toString(), bob._id.toString()]));
  });
  it('returns existing thread if one already exists', async () => {
    const first = await ThreadService.createThread(alice._id, bob._id);
    const second = await ThreadService.createThread(alice._id, bob._id);
    expect(first._id.toString()).toBe(second._id.toString());
    const count = await Thread.countDocuments();
    expect(count).toBe(1);
  });
  it('is idempotent regardless of participant order', async () => {
    const first = await ThreadService.createThread(alice._id, bob._id);
    const second = await ThreadService.createThread(bob._id, alice._id);
    expect(first._id.toString()).toBe(second._id.toString());
  });
});

describe('getThreadsForUser', () => {
  it('returns threads for the user sorted by most recent activity', async () => {
    const thread = await ThreadService.createThread(alice._id, bob._id);
    await Thread.findByIdAndUpdate(thread._id, { last_message: { sender_id: alice._id, content: 'Hi', timestamp: new Date() } });
    const threads = await ThreadService.getThreadsForUser(alice._id);
    expect(threads).toHaveLength(1);
    expect(threads[0].last_message.content).toBe('Hi');
  });
  it('returns empty array if user has no threads', async () => {
    const threads = await ThreadService.getThreadsForUser(alice._id);
    expect(threads).toEqual([]);
  });
});

describe('getThread', () => {
  it('returns the thread if user is a participant', async () => {
    const thread = await ThreadService.createThread(alice._id, bob._id);
    const found = await ThreadService.getThread(thread._id, alice._id);
    expect(found._id.toString()).toBe(thread._id.toString());
  });
  it('throws NOT_PARTICIPANT if user is not in the thread', async () => {
    const carol = await User.create({ name: 'Carol', email: 'carol@test.com' });
    const thread = await ThreadService.createThread(alice._id, bob._id);
    await expect(ThreadService.getThread(thread._id, carol._id)).rejects.toMatchObject({ code: 'NOT_PARTICIPANT' });
  });
});

describe('ThreadService.createGroupThread', () => {
  it('creates a group thread with correct type, name, participants, and unread_counts', async () => {
    const [u1, u2, u3] = await Promise.all([
      User.create({ name: 'U1', email: 'u1grp@test.com' }),
      User.create({ name: 'U2', email: 'u2grp@test.com' }),
      User.create({ name: 'U3', email: 'u3grp@test.com' }),
    ]);
    const thread = await ThreadService.createGroupThread(u1._id, 'My Team', [u2._id, u3._id]);
    expect(thread.type).toBe('group');
    expect(thread.name).toBe('My Team');
    expect(thread.participants).toHaveLength(3);
    expect(thread.unread_counts.get(u1._id.toString())).toBe(0);
    expect(thread.unread_counts.get(u2._id.toString())).toBe(0);
    expect(thread.unread_counts.get(u3._id.toString())).toBe(0);
  });

  it('throws VALIDATION_ERROR if name is empty', async () => {
    const u = await User.create({ name: 'U', email: 'uval@test.com' });
    await expect(ThreadService.createGroupThread(u._id, '', [u._id]))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('throws VALIDATION_ERROR if memberIds is empty', async () => {
    const u = await User.create({ name: 'U', email: 'uvalmem@test.com' });
    await expect(ThreadService.createGroupThread(u._id, 'Team', []))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});
