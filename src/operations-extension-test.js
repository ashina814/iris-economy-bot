"use strict";

const assert = require("assert");
const {
  claimDaily,
  getDailyStatus,
  installEconomyExtensions,
  jstDayKey,
  nextJstMidnight,
  nicknameTargets
} = require("./operations-extension");

function fakeUser(overrides = {}) {
  return {
    id: "guild:user",
    name: "tester",
    wallet: 0,
    lifetimeEarned: 0,
    xp: 0,
    streak: 0,
    lastDaily: null,
    inventory: { stamp: 0 },
    ...overrides
  };
}

function fakeEngine(nowIso, rng = 0) {
  const logs = [];
  return {
    now: () => new Date(nowIso),
    rng: () => rng,
    log: (...args) => logs.push(args),
    logs
  };
}

assert.strictEqual(jstDayKey("2026-07-10T15:00:00.000Z"), "2026-07-11");
assert.strictEqual(nextJstMidnight("2026-07-11T14:59:59.000Z").toISOString(), "2026-07-11T15:00:00.000Z");

{
  const user = fakeUser();
  const status = getDailyStatus(user, "2026-07-11T03:00:00.000Z");
  assert.strictEqual(status.claimable, true);
  assert.strictEqual(status.nextStreak, 1);

  const engine = fakeEngine("2026-07-11T03:00:00.000Z", 0);
  const result = claimDaily(engine, user);
  assert.strictEqual(result.ok, true);
  assert.strictEqual(user.streak, 1);
  assert.strictEqual(user.wallet, 720);
  assert.strictEqual(user.lastDailyDay, "2026-07-11");
  assert.strictEqual(engine.logs.length, 1);
}

{
  const user = fakeUser({
    streak: 5,
    lastDaily: "2026-07-10T16:30:00.000Z"
  });
  const status = getDailyStatus(user, "2026-07-11T14:30:00.000Z");
  assert.strictEqual(status.claimable, false);
  const result = claimDaily(fakeEngine("2026-07-11T14:30:00.000Z"), user);
  assert.strictEqual(result.ok, false);
  assert.strictEqual(user.streak, 5);
}

{
  const user = fakeUser({
    streak: 5,
    lastDaily: "2026-07-10T14:59:00.000Z",
    inventory: { stamp: 1 }
  });
  const result = claimDaily(fakeEngine("2026-07-10T15:01:00.000Z", 1), user);
  assert.strictEqual(result.ok, true);
  assert.strictEqual(user.streak, 6);
  assert.strictEqual(user.wallet, 600 + 720 + 250 + 180);
}

{
  const user = fakeUser({
    streak: 8,
    lastDaily: "2026-07-08T03:00:00.000Z"
  });
  const result = claimDaily(fakeEngine("2026-07-11T03:00:00.000Z"), user);
  assert.strictEqual(result.ok, true);
  assert.strictEqual(user.streak, 1);
}

{
  const members = new Map([
    ["1", { nickname: "Alice", user: { bot: false } }],
    ["2", { nickname: null, user: { bot: false } }],
    ["3", { nickname: "Helper", user: { bot: true } }]
  ]);
  assert.strictEqual(nicknameTargets(members, false).length, 1);
  assert.strictEqual(nicknameTargets(members, true).length, 2);
}

{
  class FakeEngine {
    constructor() {
      this.now = () => new Date("2026-07-11T03:00:00.000Z");
      this.rng = () => 0;
    }
    panel(_user, panelId) {
      return {
        ok: true,
        lines: [],
        panel: {
          fields: [],
          components: panelId === "admin"
            ? [{ type: "buttons", items: Array.from({ length: 6 }, (_, index) => ({ kind: "custom", customId: `old:${index}` })) }]
            : []
        }
      };
    }
    loopSuggestion() {
      return "カードを見る";
    }
    log() {}
  }
  installEconomyExtensions({ EconomyEngine: FakeEngine });
  const engine = new FakeEngine();
  const user = fakeUser({ joined: true });
  const adminPanel = engine.panel(user, "admin").panel;
  assert.ok(adminPanel.components.every((row) => row.type !== "buttons" || row.items.length <= 5));
  assert.ok(adminPanel.components.flatMap((row) => row.items || []).some((item) => item.customId === "eco:admin:nickname-clear-preview"));
  const homePanel = engine.panel(user, "home").panel;
  assert.ok(homePanel.fields.some((field) => field.name === "ログボ"));
}

console.log("operations-extension-test: passed");
