const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
process.env.JWT_SECRET = 'security-test-only-'.repeat(4);
process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token';
const { JwtService } = require('@nestjs/jwt');
const {
  TokenHelper,
  hashToken,
} = require('../src/services/authService/helpers/Token.helper');
const { JwtHelper } = require('../src/services/authService/helpers/Jwt.helper');
const { OauthService } = require('../src/services/authService/OAuth.service');
const { AuthService } = require('../src/services/authService/Auth.service');
const {
  JwtStrategy,
} = require('../src/services/authService/strategy/Jwt.strategy');
const {
  AuthController,
} = require('../src/modules/auth/controllers/auth.controller');
const {
  OAuthController,
} = require('../src/modules/auth/controllers/oauth.controller');
const {
  GoogleStateGuard,
} = require('../src/services/authService/strategy/OAuth-state.guard');
const {
  textField,
  requireOrigin,
  setSession,
} = require('../src/services/authService/helpers/Auth.http');
const {
  DockerService,
} = require('../src/services/dockerService/Docker.service');
const bcrypt = require('bcrypt');
const config = require('../src/core/config/jwt/jwt.config').default;
const user = {
  _id: 'user-1',
  email: 'user@example.com',
  isEmailConfirmed: true,
  authVersion: 0,
};
const jwt = new JwtService({
  secret: config().secret,
  signOptions: { expiresIn: config().expiresIn },
});
const helper = new JwtHelper(jwt);
function tokenFixture() {
  const rows = new Map();
  const repo = {
    create: async (row) => {
      rows.set(row._id, { ...row });
      return row._id;
    },
    findOne: async (filter) =>
      [...rows.values()].find((row) =>
        Object.entries(filter).every(([key, value]) => row[key] === value),
      ) || null,
    update: async (filter, changes) => {
      const row = [...rows.values()].find((row) =>
        Object.entries(filter).every(([key, value]) => row[key] === value),
      );
      if (!row) return false;
      Object.assign(row, changes);
      return true;
    },
    delete: async (filter) => {
      const row = await repo.findOne(filter);
      return row ? rows.delete(row._id) : false;
    },
  };
  const tokens = new TokenHelper(
    jwt,
    repo,
    { findOne: async () => user },
    helper,
  );
  return { rows, repo, tokens };
}
test('JWT lasts 15 minutes; missing and weak secrets are rejected', () => {
  const token = helper.generateAccessToken(user, 'session');
  const payload = jwt.verify(token);
  assert.equal(payload.exp - payload.iat, 900);
  assert.throws(() => jwt.verify(token, { clockTimestamp: payload.exp + 1 }));
  const previous = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'secretkey';
  assert.throws(config);
  delete process.env.JWT_SECRET;
  assert.throws(config);
  process.env.JWT_SECRET = previous;
});
test('Mongo operators never reach refresh lookup', async () => {
  const tokens = new TokenHelper(
    jwt,
    {
      findOne: () => {
        throw Error('query must not run');
      },
    },
    {},
    helper,
  );
  for (const value of [{ $ne: null }, [], null, '', 'x'])
    assert.equal((await tokens.refreshToken(value)).success, false);
  assert.throws(() => textField({ email: { $ne: null } }, 'email'));
});
test('refresh secrets are hashed, persistence awaited, sessions independent', async () => {
  const { rows, tokens } = tokenFixture();
  const first = await tokens.issueTokens(user);
  const second = await tokens.issueTokens(user);
  assert.equal(rows.size, 2);
  assert.ok(
    [...rows.values()].every((row) => row.token !== first.data.refreshToken),
  );
  assert.equal([...rows.values()][0].token, hashToken(first.data.refreshToken));
  await tokens.revoke(first.data.refreshToken);
  assert.equal(rows.size, 1);
  assert.equal(
    (await tokens.refreshToken(first.data.refreshToken)).success,
    false,
  );
  assert.equal(
    (await tokens.refreshToken(second.data.refreshToken)).success,
    true,
  );
});
test('concurrent refresh succeeds once, replays fail, expiry never slides', async () => {
  const { rows, tokens } = tokenFixture();
  const issued = await tokens.issueTokens(user);
  const expiry = [...rows.values()][0].expiresAt.getTime();
  const results = await Promise.all([
    tokens.refreshToken(issued.data.refreshToken),
    tokens.refreshToken(issued.data.refreshToken),
  ]);
  assert.equal(results.filter((r) => r.success).length, 1);
  assert.equal(
    (await tokens.refreshToken(issued.data.refreshToken)).success,
    false,
  );
  assert.equal([...rows.values()][0].expiresAt.getTime(), expiry);
  [...rows.values()][0].expiresAt = new Date(0);
  assert.equal(
    (
      await tokens.refreshToken(
        results.find((r) => r.success).data.refreshToken,
      )
    ).success,
    false,
  );
});
test('token issuing does not complete before database persistence', async () => {
  let release;
  let finished = false;
  const tokens = new TokenHelper(
    jwt,
    {
      create: () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    },
    {},
    helper,
  );
  const work = tokens.issueTokens(user).then(() => {
    finished = true;
  });
  await new Promise(setImmediate);
  assert.equal(finished, false);
  release('id');
  await work;
  assert.equal(finished, true);
});
function telegram(fields = {}) {
  const data = {
    id: 123,
    first_name: 'Test',
    auth_date: Math.floor(Date.now() / 1000),
    ...fields,
  };
  const message = Object.keys(data)
    .sort()
    .map((k) => `${k}=${data[k]}`)
    .join('\n');
  const key = crypto
    .createHash('sha256')
    .update(process.env.TELEGRAM_BOT_TOKEN)
    .digest();
  return {
    ...data,
    hash: crypto.createHmac('sha256', key).update(message).digest('hex'),
  };
}
test('Telegram accepts authentic signed data including auth_date; rejects tampering and invalid dates', () => {
  const service = Object.create(OauthService.prototype);
  const valid = telegram();
  assert.equal(service.verifyTelegramAuthData(valid), true);
  for (const invalid of [
    { id: 123, first_name: 'Test' },
    { ...valid, id: 456 },
    telegram({ auth_date: 1 }),
    telegram({ auth_date: 'NaN' }),
    telegram({ auth_date: Math.floor(Date.now() / 1000) + 3600 }),
  ])
    assert.equal(service.verifyTelegramAuthData(invalid), false);
});
test('actual Telegram endpoint rejects unsigned and malformed payloads before issuing tokens', async () => {
  let calls = 0;
  const service = Object.create(OauthService.prototype);
  service.validateOrCreateTelegramUser = async () => {
    calls++;
  };
  const controller = new OAuthController(service);
  await assert.rejects(() =>
    controller.telegramVerify({ id: 123, first_name: 'Test' }, {}),
  );
  await assert.rejects(() =>
    controller.telegramVerify({ tgAuthResult: 'invalid' }, {}),
  );
  assert.equal(calls, 0);
});
test('reset requires a one-use grant, consumes it atomically and revokes all sessions', async () => {
  let consumed = false,
    revoked = false,
    update;
  const grant = 'a'.repeat(64);
  const service = Object.create(AuthService.prototype);
  service.db = {
    collection: () => ({
      findOneAndUpdate: async (filter, changes) => {
        assert.equal(filter.resetTokenHash, hashToken(grant));
        assert.ok(filter.resetExpiresAt.$gt instanceof Date);
        assert.equal(changes.$inc.authVersion, 1);
        if (consumed) return null;
        consumed = true;
        update = changes;
        return user;
      },
    }),
  };
  service.repositoryRefreshToken = {
    deleteMany: async () => {
      revoked = true;
    },
  };
  assert.equal(
    (await service.resetPassword(user._id, 'new-password')).success,
    false,
  );
  assert.equal(
    (await service.resetPassword(user._id, 'new-password', grant)).success,
    true,
  );
  assert.equal(revoked, true);
  assert.equal(
    await bcrypt.compare('new-password', update.$set.password_hash),
    true,
  );
  assert.equal(
    (await service.resetPassword(user._id, 'new-password', grant)).success,
    false,
  );
});
test('confirmation enforces purpose, expiry and atomic attempt budget; consumes code before issuing grant', async () => {
  const service = Object.create(AuthService.prototype);
  const codeHash = await bcrypt.hash('12345', 4);
  let attempts = 0,
    used = false,
    grant;
  service.db = {
    collection: () => ({
      findOneAndUpdate: async (filter, change) => {
        assert.equal(filter.purpose, 'reset');
        assert.equal(filter.attempts.$lt, 5);
        assert.ok(filter.expiresAt.$gt instanceof Date);
        assert.equal(change.$inc.attempts, 1);
        return attempts++ < 5 && !used ? { _id: 'code', codeHash } : null;
      },
      findOneAndDelete: async () => {
        if (used) return null;
        used = true;
        return { _id: 'code' };
      },
    }),
  };
  service.repositoryUser = {
    update: async (filter, changes) => {
      grant = changes;
      return true;
    },
  };
  assert.equal(
    (await service.confirmCode('wrong', 'user', { isResetPassword: true }))
      .success,
    false,
  );
  const result = await service.confirmCode('12345', 'user', {
    isResetPassword: true,
  });
  assert.equal(result.success, true);
  assert.equal(grant.resetTokenHash, hashToken(result.data.resetToken));
  assert.equal(
    (await service.confirmCode('12345', 'user', { isResetPassword: true }))
      .success,
    false,
  );
});
test('JWT guard rejects revoked, expired and password-reset sessions', async () => {
  let session = {
    _id: 'sid',
    userId: user._id,
    version: 0,
    expiresAt: new Date(Date.now() + 10000),
  };
  const strategy = new JwtStrategy({
    collection: (name) => ({
      findOne: async () => (name === 'users' ? user : session),
    }),
  });
  const payload = {
    sub: user._id,
    login: user.email,
    type: 'access',
    sid: 'sid',
    version: 0,
  };
  assert.equal((await strategy.validate(payload)).userId, user._id);
  await assert.rejects(() => strategy.validate({ ...payload, version: 1 }));
  session = null;
  await assert.rejects(() => strategy.validate(payload));
});
test('cookies are HttpOnly and production Secure; write origins and OAuth state are checked', () => {
  const cookies = [];
  const res = {
    setHeader() {},
    cookie: (...args) => cookies.push(args),
    clearCookie() {},
  };
  setSession(res, { accessToken: 'access', refreshToken: 'refresh' });
  assert.equal(cookies.length, 2);
  assert.ok(cookies.every((c) => c[2].httpOnly));
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  cookies.length = 0;
  setSession(res, { accessToken: 'a', refreshToken: 'r' });
  assert.ok(cookies.every((c) => c[2].secure));
  if (previous === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previous;
  assert.throws(() =>
    requireOrigin({ headers: { origin: 'https://evil.example' } }),
  );
  assert.throws(() => requireOrigin({ headers: {} }));
  requireOrigin({ headers: { origin: 'http://localhost:5173' } });
  const guard = new GoogleStateGuard();
  const context = (req) => ({
    switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
  });
  assert.throws(() =>
    guard.getAuthenticateOptions(
      context({
        path: '/oauth/google/callback',
        headers: {},
        query: { state: 'x' },
      }),
    ),
  );
  const options = guard.getAuthenticateOptions(
    context({ path: '/oauth/google', headers: {} }),
  );
  assert.equal(options.state.length, 64);
  assert.equal(
    guard.getAuthenticateOptions(
      context({
        path: '/oauth/google/callback',
        headers: { cookie: `icodeme_oauth_google=${options.state}` },
        query: { state: options.state },
      }),
    ).session,
    false,
  );
});
test('Docker rejects foreign containers and traversal before filesystem writes', async () => {
  const service = Object.create(DockerService.prototype);
  service.docker = {
    getContainer: () => ({
      inspect: async () => ({
        Config: { Labels: { 'project.user': 'owner' } },
      }),
    }),
  };
  await assert.rejects(() => service.assertOwner('a'.repeat(64), 'attacker'));
  await service.assertOwner('a'.repeat(64), 'owner');
  assert.throws(() =>
    service.validateProject({
      _id: 'project',
      userId: 'owner',
      meta: { name: '../escape' },
      dir: [],
    }),
  );
  assert.throws(() =>
    service.validateProject({
      _id: 'project',
      userId: 'owner',
      meta: { name: 'safe' },
      dir: [{ name: '../escape', type: 'file', content: 'x' }],
    }),
  );
});

test('login waits for storage and controller returns no access/refresh secrets', async () => {
  const service = Object.create(AuthService.prototype);
  service.repositoryUser = {
    findOne: async () => ({
      ...user,
      password_hash: await bcrypt.hash('password', 4),
    }),
  };
  let release;
  const ready = new Promise((resolve) => {
    release = resolve;
  });
  let issued = false;
  service.tokenHelper = {
    issueTokens: async () => {
      await ready;
      issued = true;
      return {
        success: true,
        data: {
          accessToken: 'access-secret',
          refreshToken: 'refresh-secret',
          userId: user._id,
        },
      };
    },
  };
  const controller = new AuthController(service);
  const cookies = [];
  const work = controller.login(
    { body: { email: user.email, password: 'password' } },
    { setHeader() {}, cookie: (...args) => cookies.push(args) },
  );
  await new Promise(setImmediate);
  assert.equal(issued, false);
  release();
  const result = await work;
  assert.equal(issued, true);
  assert.equal(cookies.length, 2);
  assert.equal(result.data.accessToken, undefined);
  assert.equal(result.data.refreshToken, undefined);
  assert.equal(result.data.userId, user._id);
});

test('shared rate limiter rejects repeated attempts by account as well as address', async () => {
  const {
    AuthSecurityGuard,
  } = require('../src/services/authService/strategy/Auth-security.guard');
  const counts = new Map();
  const guard = new AuthSecurityGuard({
    collection: () => ({
      findOneAndUpdate: async ({ _id }) => {
        counts.set(_id, (counts.get(_id) || 0) + 1);
        return { count: counts.get(_id) };
      },
    }),
  });
  const request = {
    headers: { origin: 'http://localhost:5173' },
    method: 'POST',
    path: '/auth/login',
    body: { email: 'user@example.com' },
    socket: { remoteAddress: '127.0.0.1' },
  };
  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({ setHeader() {} }),
    }),
  };
  for (let i = 0; i < 10; i++) {
    request.socket.remoteAddress = `127.0.0.${i + 1}`;
    assert.equal(await guard.canActivate(context), true);
  }
  request.socket.remoteAddress = '127.0.0.200';
  await assert.rejects(
    () => guard.canActivate(context),
    (error) => error.getStatus() === 429,
  );
});
