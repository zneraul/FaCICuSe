import test from 'node:test';
import assert from 'node:assert/strict';
import { createUserUseCases } from './userUseCases.js';
import { createAuthMiddleware, SESSION_COOKIE_NAME } from '../../adapters/inbound/authMiddleware.js';

function makeUserRepo(overrides = {}) {
  const users = new Map();
  return {
    users,
    async setPasswordByUid(uid, passwordHash) {
      const user = users.get(uid);
      if (!user) return null;
      const updated = { ...user, passwordHash, authProvider: 'google+password' };
      users.set(uid, updated);
      return updated;
    },
    async findAuthRecordByEmail(email) {
      return [...users.values()].find((user) => user.email === email) || null;
    },
    async findByUid(uid) {
      return users.get(uid) || null;
    },
    ...overrides,
  };
}

test('verified Google user can set a separate FaCICuSe password without storing plaintext', async () => {
  const repo = makeUserRepo();
  repo.users.set('google-uid-1', {
    uid: 'google-uid-1',
    email: 'student@g.batstate-u.edu.ph',
    fullName: 'Test Student',
    role: 'student',
    emailVerified: true,
    isActive: true,
  });
  const useCases = createUserUseCases({
    userRepo: repo,
    auditLogPort: {},
    domainPolicy: { assertEmailAllowed: (email) => email },
    passwordHasher: {
      hashPassword: (password) => `test-scrypt-hash:${password}`,
      verifyPassword: (password, hash) => hash === `test-scrypt-hash:${password}`,
    },
  });

  await useCases.setOwnPassword(repo.users.get('google-uid-1'), {
    password: 'a-long-test-password',
    confirmPassword: 'a-long-test-password',
  });

  const saved = repo.users.get('google-uid-1');
  assert.equal(saved.authProvider, 'google+password');
  assert.equal(saved.passwordHash, 'test-scrypt-hash:a-long-test-password');
  assert.notEqual(saved.passwordHash, 'a-long-test-password');
});

test('password setup rejects unverified users and mismatched confirmations', async () => {
  let writes = 0;
  const repo = makeUserRepo({
    async setPasswordByUid() {
      writes += 1;
      return {};
    },
  });
  const useCases = createUserUseCases({
    userRepo: repo,
    auditLogPort: {},
    domainPolicy: { assertEmailAllowed: (email) => email },
    passwordHasher: { hashPassword: () => 'hashed' },
  });

  await assert.rejects(
    useCases.setOwnPassword(
      { uid: 'u1', emailVerified: false, isActive: true },
      { password: 'a-long-test-password', confirmPassword: 'a-long-test-password' }
    ),
    /verified, active university account/
  );
  await assert.rejects(
    useCases.setOwnPassword(
      { uid: 'u1', emailVerified: true, isActive: true },
      { password: 'a-long-test-password', confirmPassword: 'a-different-password' }
    ),
    /confirmation does not match/
  );
  assert.equal(writes, 0);
});

test('FaCICuSe password login verifies the stored password and university domain', async () => {
  const repo = makeUserRepo();
  repo.users.set('google-uid-2', {
    uid: 'google-uid-2',
    id: 12,
    email: 'student@g.batstate-u.edu.ph',
    fullName: 'Test Student',
    role: 'student',
    emailVerified: true,
    isActive: true,
    passwordHash: 'test-scrypt-hash:a-long-test-password',
  });
  const useCases = createUserUseCases({
    userRepo: repo,
    auditLogPort: {},
    domainPolicy: { assertEmailAllowed: (email) => email },
    passwordHasher: {
      verifyPassword: (password, hash) => hash === `test-scrypt-hash:${password}`,
      hashPassword: (password) => `test-scrypt-hash:${password}`,
    },
  });

  const user = await useCases.authenticateWithEmailPassword({
    email: 'STUDENT@G.BATSTATE-U.EDU.PH',
    password: 'a-long-test-password',
  });
  assert.equal(user.uid, 'google-uid-2');
  assert.equal(user.emailVerified, true);
  await assert.rejects(
    useCases.authenticateWithEmailPassword({
      email: 'student@g.batstate-u.edu.ph',
      password: 'wrong-password',
    }),
    /Invalid university email or password/
  );
});

test('Google bearer authentication resolves a verified app user', async () => {
  const actor = {
    uid: 'google-uid-3',
    email: 'student@g.batstate-u.edu.ph',
    emailVerified: true,
    isActive: true,
    role: 'student',
  };
  const authProvider = {
    async verifyFirebaseIdToken(token) {
      assert.equal(token, 'firebase-id-token');
      return { uid: actor.uid, email: actor.email, email_verified: true };
    },
    verifySessionToken() {
      throw new Error('Cookie path should not be used for bearer auth');
    },
  };
  const userUseCases = {
    async syncVerifiedGoogleUser(decoded) {
      assert.equal(decoded.uid, actor.uid);
      return actor;
    },
  };
  const middleware = createAuthMiddleware({
    authProvider,
    userRepo: {},
    userUseCases,
  });
  const req = { headers: { authorization: 'Bearer firebase-id-token' } };
  let nextCalled = false;
  await middleware.requireAuth(req, {}, () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true);
  assert.equal(req.actor, actor);
});

test('session cookie authentication restores the user after a full page reload', async () => {
  const actor = {
    uid: 'google-uid-4',
    email: 'student@g.batstate-u.edu.ph',
    emailVerified: true,
    isActive: true,
    isDemo: false,
    role: 'student',
  };
  const authProvider = {
    verifySessionToken(token, type) {
      assert.equal(token, 'signed-session-token');
      assert.equal(type, 'user');
      return { uid: actor.uid };
    },
    async verifyFirebaseIdToken() {
      throw new Error('Bearer path should not be used for cookie session');
    },
  };
  const middleware = createAuthMiddleware({
    authProvider,
    userRepo: { async findByUid(uid) { return uid === actor.uid ? actor : null; } },
    userUseCases: {},
  });
  const req = {
    headers: {
      cookie: `${SESSION_COOKIE_NAME}=signed-session-token`,
    },
  };
  let nextCalled = false;
  await middleware.requireAuth(req, {}, () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true);
  assert.equal(req.actor, actor);
});

test('inactive or invalid cookie sessions are rejected', async () => {
  const middleware = createAuthMiddleware({
    authProvider: {
      verifySessionToken: () => ({ uid: 'inactive-user' }),
      async verifyFirebaseIdToken() { throw new Error('unused'); },
    },
    userRepo: {
      async findByUid() {
        return { uid: 'inactive-user', isActive: false, emailVerified: true };
      },
    },
    userUseCases: {},
  });
  const req = { headers: { cookie: `${SESSION_COOKIE_NAME}=token` } };
  let responseStatus;
  let responseBody;
  await middleware.requireAuth(req, {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    },
  }, () => assert.fail('Inactive account must not authenticate'));
  assert.equal(responseStatus, 401);
  assert.match(responseBody.error, /Authentication required/);
});
