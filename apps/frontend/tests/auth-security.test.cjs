const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const path = require("node:path");
const {
  fetchBaseQuery: realFetchBaseQuery,
} = require("@reduxjs/toolkit/query");
function compile(relative, imports, globals = {}) {
  const filename = path.resolve(relative);
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const module = { exports: {} };
  const sandbox = {
    module,
    exports: module.exports,
    require: (name) => (name in imports ? imports[name] : require(name)),
    ...globals,
    navigator: {},
    console,
    Promise,
  };
  vm.runInNewContext(source, sandbox, { filename });
  return module.exports;
}
function fixture(handler) {
  const actions = [];
  const calls = [];
  const session = compile("src/shared/api/session.ts", {});
  const { fetchBase } = compile("src/shared/api/fetch.base.ts", {
    "./consts": { BASE_URL: "http://localhost:3000/" },
    "./session": session,
    "@reduxjs/toolkit/query": {
      fetchBaseQuery: (options) =>
        realFetchBaseQuery({
          ...options,
          fetchFn: async (request) => {
            const url = new URL(request.url).pathname.slice(1);
            calls.push(url);
            const [status, body] = await handler(url, request);
            return new Response(JSON.stringify(body), {
              status,
              headers: { "Content-Type": "application/json" },
            });
          },
        }),
    },
  });
  const api = {
    dispatch: (action) => actions.push(action),
    getState: () => ({}),
    signal: new AbortController().signal,
    abort() {},
    endpoint: "test",
    type: "query",
  };
  return { run: (args) => fetchBase(args, api, {}), actions, calls, session };
}
const deferred = () => {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return { promise, resolve };
};
test("wrong password does not trigger refresh", async () => {
  const f = fixture(async () => [401, { message: "Wrong password" }]);
  const result = await f.run({
    url: "auth/login",
    method: "POST",
    body: { email: "a", password: "wrong" },
  });
  assert.equal(result.error.status, 401);
  assert.deepEqual(f.calls, ["auth/login"]);
  assert.equal(f.actions.length, 0);
});
test("concurrent expired requests share a refresh and retry successfully", async () => {
  let valid = false,
    refreshes = 0;
  const f = fixture(async (url) => {
    if (url === "auth/refresh") {
      refreshes++;
      await new Promise(setImmediate);
      valid = true;
      return [200, { success: true }];
    }
    return valid ? [200, { success: true }] : [401, { message: "Expired" }];
  });
  const results = await Promise.all([
    f.run("profiles/me"),
    f.run("study"),
    f.run("documents"),
  ]);
  assert.ok(results.every((r) => r.data?.success));
  assert.equal(refreshes, 1);
  assert.equal(f.actions.length, 0);
});
test("network/server failure while refreshing does not log out", async () => {
  const f = fixture(async (url) =>
    url === "auth/refresh"
      ? [503, { message: "Unavailable" }]
      : [401, { message: "Expired" }],
  );
  const result = await f.run("profiles/me");
  assert.equal(result.error.status, 503);
  assert.equal(f.actions.length, 0);
});
test("expired refresh clears authentication without a hard redirect", async () => {
  const f = fixture(async () => [401, { message: "Expired" }]);
  assert.equal((await f.run("profiles/me")).error.status, 401);
  assert.deepEqual(
    f.actions.map((a) => a.type),
    ["auth/logout"],
  );
});
test("old refresh failure cannot log out a newer login", async () => {
  const started = deferred(),
    finish = deferred();
  const f = fixture(async (url) => {
    if (url === "auth/refresh") {
      started.resolve();
      await finish.promise;
      return [401, { message: "Expired" }];
    }
    if (url === "auth/login")
      return [200, { success: true, data: { userId: "new" } }];
    return [401, { message: "Expired" }];
  });
  const old = f.run("profiles/me");
  await started.promise;
  const login = f.run({ url: "auth/login", method: "POST" });
  finish.resolve();
  assert.equal((await old).error.status, 409);
  assert.equal((await login).data.success, true);
  assert.equal(f.actions.length, 0);
});
test("old refresh success cannot overwrite or retry within a newer login", async () => {
  const started = deferred(),
    finish = deferred();
  let profileRequests = 0;
  const f = fixture(async (url) => {
    if (url === "auth/refresh") {
      started.resolve();
      await finish.promise;
      return [200, { success: true }];
    }
    if (url === "auth/login") return [200, { success: true }];
    if (url === "profiles/me") profileRequests++;
    return [401, { message: "Expired" }];
  });
  const old = f.run("profiles/me");
  await started.promise;
  const login = f.run({ url: "auth/login", method: "POST" });
  finish.resolve();
  assert.equal((await old).error.status, 409);
  await login;
  assert.equal(profileRequests, 1);
  assert.equal(f.actions.length, 0);
});
test("logout state is false, contains no secrets and never accesses localStorage", () => {
  const { authSliceReducer, setAuthData, logout } = compile(
    "src/entities/auth/model/slice/auth.slice.ts",
    {},
  );
  const authenticated = authSliceReducer(
    undefined,
    setAuthData({ id: "user", email: "a@b.com" }),
  );
  assert.equal(authenticated.isAuthenticated, true);
  const state = authSliceReducer(authenticated, logout());
  assert.equal(state.isAuthenticated, false);
  assert.equal(state.user.id, "");
  assert.equal("token" in state, false);
});

test('session broadcasts notify another tab without reloading the sender', () => {
  const channels = [];
  class Channel {
    constructor() { this.listeners = new Set(); channels.push(this); }
    addEventListener(_type, listener) { this.listeners.add(listener); }
    removeEventListener(_type, listener) { this.listeners.delete(listener); }
    postMessage() { for (const other of channels) if (other !== this) for (const listener of other.listeners) listener(); }
  }
  const first = compile('src/shared/api/session.ts', {}, { BroadcastChannel: Channel });
  const second = compile('src/shared/api/session.ts', {}, { BroadcastChannel: Channel });
  let sourceReloads=0, otherReloads=0;
  first.subscribeSession(()=>sourceReloads++);
  second.subscribeSession(()=>otherReloads++);
  first.announceSession();
  assert.equal(sourceReloads,0);
  assert.equal(otherReloads,1);
});
