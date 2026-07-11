"use strict";

const assert = require("assert");
const { installCampaignV2 } = require("./campaign-v2");

class FakeEngine {
  constructor(state, options = {}) {
    this.state = state;
    this.now = options.now || (() => new Date());
    this.logs = [];
  }
  log(user, type, amount, note) {
    this.logs.push({ userId: user.id, type, amount, note });
  }
  join(user) {
    if (user.joined) return { ok: true, lines: ["already"] };
    user.joined = true;
    user.wallet += 100000;
    user.lifetimeEarned += 100000;
    return { ok: true, lines: ["joined"] };
  }
  inviteRankLine() { return "rank"; }
  bumpRankLine() { return "rank"; }
  inviteReward() { return 900; }
  bumpReward() { return 500; }
  marketplacePanel() { return { fields: [], components: [] }; }
}

const economy = { EconomyEngine: FakeEngine };
installCampaignV2(economy, { JsonStore: class {} });
const Engine = economy.EconomyEngine;
let now = new Date("2026-07-01T00:00:00.000Z");
const engine = new Engine({ users: {}, inviteCampaign: { active: false }, ledger: [] }, { now: () => now });

function user(id, joined = false, vcMinutes = 0) {
  const record = {
    id,
    name: id,
    joined,
    wallet: joined ? 100000 : 0,
    lifetimeEarned: joined ? 100000 : 0,
    invites: { qualified: 0, earned: 0 },
    bump: { count: 0, earned: 0 },
    activity: { vcMinutes },
    inviteCampaign: {}
  };
  engine.state.users[id] = record;
  return record;
}

const admin = user("g:admin", true);
const inviter = user("g:inviter", true);
const invitee = user("g:invitee", false, 90);

let result = engine.startInviteCampaign(admin);
assert.strictEqual(result.ok, true);
assert.strictEqual(engine.state.inviteCampaign.status, "active");
assert.strictEqual(engine.state.inviteCampaign.seasonNumber, 1);

const inviterWalletBefore = inviter.wallet;
engine.recordCampaignInviteJoin(inviter, invitee, { code: "abc" });
assert.strictEqual(inviter.wallet, inviterWalletBefore, "server join must not pay campaign reward");
assert.strictEqual(engine.state.inviteCampaign.userStats[inviter.id], undefined, "attribution is not a qualified invite");

engine.join(invitee);
assert.strictEqual(inviter.wallet, inviterWalletBefore + 1000, "economy join pays inviter");
assert.strictEqual(invitee.wallet, 101000, "economy join pays invitee after starter grant");
assert.strictEqual(engine.state.inviteCampaign.userStats[inviter.id].invited, 1);
const entry = engine.state.inviteCampaign.invitedUsers[invitee.id];
assert.strictEqual(entry.vcMinutesAtJoin, 90, "VC baseline is captured at campaign qualification");

invitee.activity.vcMinutes = 104;
assert.strictEqual(engine.qualifyCampaignVc(invitee), null, "past VC and only 14 new minutes do not qualify");
invitee.activity.vcMinutes = 105;
assert(engine.qualifyCampaignVc(invitee), "15 campaign minutes qualify");
assert.strictEqual(inviter.inviteCampaign.tickets, 1);
assert.strictEqual(engine.qualifyCampaignVc(invitee), null, "VC reward is idempotent");

now = new Date("2026-07-01T01:00:00.000Z");
result = engine.stopInviteCampaign(admin);
assert.strictEqual(result.ok, true);
assert.strictEqual(engine.state.inviteCampaign.status, "settling");

const lateInvitee = user("g:late", false);
assert.strictEqual(engine.recordCampaignInviteJoin(inviter, lateInvitee, {}), null, "new attribution is blocked while settling");

now = new Date("2026-07-02T01:00:01.000Z");
const tick = engine.campaignTick();
assert.strictEqual(tick.finalized, true, "settlement finalizes after grace period");
assert.strictEqual(engine.state.inviteCampaign.status, "idle");
assert.strictEqual(engine.state.inviteCampaign.history.length, 1);
assert.strictEqual(inviter.inviteCampaign.tickets, 2, "retention ticket remains after finalization");

const ticketBeforeSeason2 = inviter.inviteCampaign.tickets;
result = engine.startInviteCampaign(admin);
assert.strictEqual(result.ok, true);
assert.strictEqual(engine.state.inviteCampaign.seasonNumber, 2);
assert.strictEqual(inviter.inviteCampaign.tickets, ticketBeforeSeason2, "tickets persist across seasons");
assert.deepStrictEqual(engine.state.inviteCampaign.userStats, {}, "season stats are reset");

const reset = engine.resetInviteCampaign(admin);
assert.strictEqual(reset.ok, false, "destructive reset is retired");
assert.strictEqual(inviter.inviteCampaign.tickets, ticketBeforeSeason2);

const adminPanel = engine.adminCampaignPanel(admin);
assert(adminPanel.title.includes("招待キャンペーン管理"));
assert(!JSON.stringify(adminPanel).includes("Start campaign"));
assert(!JSON.stringify(adminPanel).includes("Reset campaign data"));

const shop = engine.campaignShopPanel(inviter);
assert(shop.description.includes("交換機能は停止"));
assert.strictEqual(engine.claimCampaignShopViewBonus(inviter), 0);

console.log("campaign-v2-test: passed");
