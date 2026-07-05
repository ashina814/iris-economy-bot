const assert = require("assert");
const { EconomyEngine, createInitialState } = require("./economy");

let seed = 123456789;
function rng() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0x100000000;
}

const engine = new EconomyEngine(createInitialState(), { rng });
const actor = { id: "test:user", name: "Tester" };

const commands = [
  "join",
  "panel",
  "panel casino",
  "panel market",
  "panel sink",
  "panel invite",
  "house",
  "house profile sweet",
  "daily",
  "profile",
  "ranks",
  "card",
  "policy",
  "market",
  "invest RAMEN 200",
  "portfolio",
  "quest task",
  "train attack",
  "slots 50",
  "crash 50 2.0",
  "roulette 50 red",
  "coinflip 50 heads",
  "dice 50 3",
  "bj 50",
  "kabu",
  "kabu buy 100",
  "kabu sell all",
  "safety",
  "sink 100",
  "invite",
  "simulate-text 20",
  "simulate-vc 30",
  "rank text",
  "rank vc",
  "rank rpg",
  "news"
];

for (const command of commands) {
  const result = engine.run(command, actor);
  assert(result && typeof result.title === "string", `No result for ${command}`);
  assert(Array.isArray(result.lines), `No lines for ${command}`);
}

const user = engine.state.users[actor.id];
assert(user.joined, "User should be joined");
assert(user.lifetimeEarned >= 100000, "Initial grant should be around 100k KC");
assert(engine.state.house.profile === "sweet", "House profile should be configurable");
assert(user.activity.textXp > 0, "Text XP should increase");
assert(user.activity.vcXp > 0, "VC XP should increase");
assert(user.rpg.xp > 0, "RPG XP should increase");
assert(user.casino.plays >= 4, "Casino plays should be recorded");
assert(Object.keys(engine.state.market.assets).length >= 4, "Market assets should exist");

const card = engine.run("card", actor);
assert(card.card, "Card command should include Discord card data");
assert(card.lines.some((line) => line.includes("CARD")), "Card command should include CLI card layout");

engine.startVoiceSession(actor, "voice:test");
const voiceUser = engine.getUser(actor.id, actor.name);
voiceUser.activity.voiceJoinedAt = new Date(Date.now() - 20 * 60 * 1000).toISOString();
voiceUser.activity.voiceLastClaimAt = voiceUser.activity.voiceJoinedAt;
const vcClaim = engine.run("vc", actor);
assert(vcClaim.title === "VC報酬" || vcClaim.title === "VCランク昇格", "VC claim should settle active voice time");
assert(engine.state.users[actor.id].activity.vcDailyEarned > 0, "VC daily KC should increase");

for (let i = 0; i < 15; i += 1) {
  engine.run("simulate-text 50", actor);
}
assert(engine.state.policy.history.length > 0, "Policy cycle should run after enough commands");
const upgradedCard = engine.run("card", actor);
assert(upgradedCard.card.footer.includes("Layout"), "Upgraded card should report layout");

const invitee = { id: "test:invitee", name: "Invitee" };
const tracked = engine.recordInviteJoin(actor, invitee, { code: "abc123" });
assert(tracked?.ok, "Invite should be tracked");
engine.run("join", invitee);
assert(engine.state.users[actor.id].invites.qualified >= 1, "Inviter should get a qualified invite");
assert(engine.state.users[actor.id].invites.earned > 0, "Inviter should earn invite KC");

const sinkBefore = engine.state.sink.totalBurned;
engine.run("sink 100", actor);
assert(engine.state.sink.totalBurned > sinkBefore, "Sink should burn KC");

console.log("Smoke test passed.");
