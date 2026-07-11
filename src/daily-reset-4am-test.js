"use strict";

const assert = require("assert");
const {
  claimFourAmDaily,
  fourAmDayKey,
  getFourAmDailyStatus,
  installDailyFourAmReset,
  nextJstFourAm
} = require("./daily-reset-4am");

function fakeUser(overrides = {}) {
  return {
    id: "guild:user",
    name: "tester",
    joined: true,
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

assert.strictEqual(fourAmDayKey("2026-07-11T18:59:59.000Z"), "2026-07-11");
assert.strictEqual(fourAmDayKey("2026-07-11T19:00:00.000Z"), "2026-07-12");
assert.strictEqual(nextJstFourAm("2026-07-11T18:59:59.000Z").toISOString(), "2026-07-11T19:00:00.000Z");
assert.strictEqual(nextJstFourAm("2026-07-11T19:00:00.000Z").toISOString(), "2026-07-12T19:00:00.000Z");

{
  const user = fakeUser({
    streak: 4,
    lastDaily: "2026-07-11T14:00:00.000Z"
  });
  const beforeReset = getFourAmDailyStatus(user, "2026-07-11T18:59:59.000Z");
  assert.strictEqual(beforeReset.claimable, false);
  assert.strictEqual(beforeReset.currentDayKey, "2026-07-11");

  const afterReset = getFourAmDailyStatus(user, "2026-07-11T19:00:00.000Z");
  assert.strictEqual(afterReset.claimable, true);
  assert.strictEqual(afterReset.nextStreak, 5);
}

{
  const user = fakeUser({
    streak: 4,
    lastDaily: "2026-07-10T14:00:00.000Z",
    inventory: { stamp: 1 }
  });
  const result = claimFourAmDaily(fakeEngine("2026-07-11T19:00:00.000Z", 1), user);
  assert.strictEqual(result.ok, true);
  assert.strictEqual(user.streak, 1);
  assert.strictEqual(user.wallet, 600 + 120 + 250 + 180);
  assert.strictEqual(user.lastDailyDay, "2026-07-12");
}

{
  const user = fakeUser({
    streak: 6,
    lastDaily: "2026-07-10T20:00:00.000Z"
  });
  const result = claimFourAmDaily(fakeEngine("2026-07-11T20:00:00.000Z"), user);
  assert.strictEqual(result.ok, true);
  assert.strictEqual(user.streak, 7);
}

{
  class FakeEngine {
    constructor(nowIso) {
      this.now = () => new Date(nowIso);
      this.rng = () => 0;
    }
    daily() {
      throw new Error("not patched");
    }
    loopSuggestion() {
      return "今日のログボを受け取る\nカードを見る";
    }
    panel() {
      return {
        ok: true,
        panel: {
          fields: [{ name: "ログボ", value: "midnight behavior", inline: true }],
          components: [{ type: "buttons", items: [{ kind: "run", command: "daily", label: "ログボ", disabled: false }] }]
        }
      };
    }
    log() {}
  }

  installDailyFourAmReset({ EconomyEngine: FakeEngine });
  const engine = new FakeEngine("2026-07-11T17:00:00.000Z");
  const user = fakeUser({ streak: 3, lastDaily: "2026-07-11T14:00:00.000Z" });
  const panel = engine.panel(user, "home").panel;
  const field = panel.fields.find((item) => item.name === "ログボ");
  const button = panel.components[0].items[0];
  assert.ok(field.value.includes("本日分は受取済み"));
  assert.strictEqual(button.label, "ログボ済み");
  assert.strictEqual(button.disabled, true);
  assert.strictEqual(engine.loopSuggestion(user), "カードを見る");
}

console.log("daily-reset-4am-test: passed");
