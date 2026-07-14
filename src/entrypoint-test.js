const assert = require("assert");
const fs = require("fs");
const Module = require("module");

process.env.IRIS_ENTRYPOINT_TEST = "1";
process.env.DISCORD_TOKEN = "entrypoint-test-token";
process.env.DISCORD_CLIENT_ID = "000000000000000000";

const originalLoader = Module._extensions[".js"];
require("./discord-entry-operations");
const { applyOfficialPurchaseUsername, buildComponents, completeOfficialNicknameFulfillment, engine, officialPurchaseBuyerName, parseOfficialFulfillmentControlId, officialPurchaseNotificationResult } = require("./discord-core");

assert.strictEqual(Module._extensions[".js"], originalLoader, "起動経路でModule._extensionsを上書きしてはいけません");
assert(!require.cache[require.resolve("./discord-entry-manual-join")], "通常起動でmanual-joinラッパーを経由してはいけません");
assert(!fs.readFileSync(require.resolve("./discord-core"), "utf8").includes('engine.run("join", actorFromMember(member))'), "入室時に初期Risを自動付与してはいけません");
assert(!fs.readFileSync(require.resolve("./discord-entry"), "utf8").includes("Module._extensions"), "discord-entryはソースを書き換えてはいけません");
assert(!fs.readFileSync(require.resolve("./discord-entry-manual-join"), "utf8").includes("Interaction.prototype"), "応答メソッドをプロトタイプで置き換えてはいけません");
assert.deepStrictEqual(parseOfficialFulfillmentControlId("eco:market:official-fulfillment-complete:42"), { action: "complete", taskId: "42" }, "公式対応の完了ボタンは対応IDを正しく読める必要があります");
assert.deepStrictEqual(parseOfficialFulfillmentControlId("eco:market:official-fulfillment-retry:42"), { action: "retry", taskId: "42" }, "公式対応の再試行ボタンは対応IDを正しく読める必要があります");
assert.deepStrictEqual(parseOfficialFulfillmentControlId("eco:market:official-fulfillment-ticket:42"), { action: "ticket", taskId: "42" }, "公式対応のチケット作成ボタンは対応IDを正しく読める必要があります");
assert.strictEqual(parseOfficialFulfillmentControlId("eco:market:official-fulfillment-complete"), null, "対応IDのない公式対応ボタンは拒否する必要があります");
assert.strictEqual(officialPurchaseBuyerName({ username: "nyan.zzl", globalName: "空白の多い表示名" }), "nyan.zzl", "公式購入の通知名は表示名ではなくDiscord usernameを使う必要があります");
const officialPurchaseLog = officialPurchaseNotificationResult({ itemName: "VIPパス", price: 10000, buyerId: "guild:user", buyerName: "購入者", fulfillmentId: 42 });
assert(officialPurchaseLog?.lines.includes("対応キュー: #42"), "公式購入通知には対応キュー番号を含める必要があります");

const actor = { id: "entrypoint-test:user", name: "entrypoint tester" };
engine.run("join", actor);
const fulfillmentTask = engine.createOfficialFulfillment(engine.getUser(actor.id, actor.name), {
  id: "entrypoint-fulfillment",
  name: "対応テスト商品",
  roleId: null,
  roleDurationDays: 0,
  dmGuide: ""
});
const usernamePurchase = { officialPurchase: { buyerName: "表示名", fulfillmentId: fulfillmentTask.id } };
applyOfficialPurchaseUsername(usernamePurchase, { username: "tama_dane." });
assert.strictEqual(usernamePurchase.officialPurchase.buyerName, "tama_dane.", "公式購入通知の購入者名はusernameへ更新する必要があります");
assert.strictEqual(fulfillmentTask.buyerName, "tama_dane.", "公式対応キューの購入者名もusernameへ更新する必要があります");
buildComponents({ panel: engine.officialFulfillmentTaskPanel(engine.getUser(actor.id, actor.name), fulfillmentTask.id) });
for (const command of [
  "panel home",
  "panel admin",
  "panel admin-maintenance",
  "panel admin-rank",
  "panel rank-xp-settings",
  "panel vc-xp-location-settings",
  "panel boost-rewards",
  "panel market-admin",
  "panel official-product-admin",
  "panel official-auction-admin"
]) {
  const result = engine.run(command, actor);
  if (result.panel) buildComponents(result);
}

const emptyShopOwner = { id: "entrypoint-test:empty-shop", name: "empty shop owner" };
engine.run("join", emptyShopOwner);
engine.openShop(engine.getUser(emptyShopOwner.id, emptyShopOwner.name));
const emptyShopPanel = engine.run(`marketplace shop-view ${emptyShopOwner.id}`, actor);
assert(emptyShopPanel.panel, "出品のない民営ショップも表示できる必要があります");
buildComponents(emptyShopPanel);

const missingFromCache = { id: "entrypoint-test:missing", name: "cache-missing member" };
engine.run("join", missingFromCache);
const unjoinedActivity = { id: "entrypoint-test:activity-only", name: "activity-only member" };
// The entrypoint test may load a populated production-like state, so this must
// remain above any existing leaderboard value rather than assuming a fresh store.
engine.getUser(unjoinedActivity.id, unjoinedActivity.name).activity.textXp = 1_000_000;
engine.getUser(unjoinedActivity.id, unjoinedActivity.name).activity.vcXp = 1_000_000;
engine.getUser(actor.id, actor.name).activity.textXp = 10;
engine.getUser(missingFromCache.id, missingFromCache.name).activity.textXp = 99;
const savedDirectory = global.__IRIS_GUILD_MEMBER_DIRECTORY__;
global.__IRIS_GUILD_MEMBER_DIRECTORY__ = {
  get(guildId) {
    return guildId === "entrypoint-test" ? new Map([["user", { id: "user", displayName: actor.name }]]) : null;
  }
};
const partialCacheRank = engine.run("rank text", actor);
global.__IRIS_GUILD_MEMBER_DIRECTORY__ = savedDirectory;
assert(partialCacheRank.lines.some((line) => line.includes(missingFromCache.name)), "部分メンバーキャッシュで台帳上のランキング対象を除外してはいけません");
assert(partialCacheRank.lines.some((line) => line.includes(unjoinedActivity.name)), "実績を持つ未加入ユーザーをDiscordランキングから除外してはいけません");
assert(engine.run("rank vc", actor).lines.some((line) => line.includes(unjoinedActivity.name)), "VC実績を持つ未加入ユーザーをDiscordランキングから除外してはいけません");

async function verifyOfficialNicknameCompletion() {
  const admin = engine.getUser(actor.id, actor.name);
  const task = engine.createOfficialFulfillment(engine.getUser(actor.id, actor.name), {
    id: "official:name-henkou",
    name: "名前変更権",
    roleId: null,
    roleDurationDays: 0
  }, { requestText: "tama_dane." });
  task.ticketChannelId = "123456789012345678";
  let nickname = null;
  let ticketDeleted = false;
  const guild = {
    id: "entrypoint-test",
    members: {
      me: { permissions: { has: () => true } },
      fetch: async () => ({ manageable: true, setNickname: async (value) => { nickname = value; } })
    },
    channels: {
      fetch: async () => ({ deletable: true, delete: async () => { ticketDeleted = true; } })
    }
  };
  const result = await completeOfficialNicknameFulfillment(guild, task, admin);
  assert(result.ok, "名前変更権の完了時にDiscordニックネームを自動変更できる必要があります");
  assert.strictEqual(nickname, "tama_dane.", "申請したニックネームを設定する必要があります");
  assert(ticketDeleted, "名前変更完了後に対応チケットを削除する必要があります");
  assert.strictEqual(task.status, "completed", "名前変更とチケット削除の後に対応を完了する必要があります");

  const failedTask = engine.createOfficialFulfillment(engine.getUser(actor.id, actor.name), {
    id: "official:name-henkou",
    name: "名前変更権",
    roleId: null,
    roleDurationDays: 0
  }, { requestText: "retry-name" });
  failedTask.ticketChannelId = "234567890123456789";
  const failedResult = await completeOfficialNicknameFulfillment({
    ...guild,
    channels: { fetch: async () => ({ deletable: true, delete: async () => { throw new Error("delete denied"); } }) }
  }, failedTask, admin);
  assert(!failedResult.ok, "チケット削除失敗時は名前変更対応を完了にしてはいけません");
  assert.strictEqual(failedTask.status, "pending", "チケット削除失敗時は再試行できるよう対応キューを残す必要があります");
}

verifyOfficialNicknameCompletion()
  .then(() => console.log("entrypoint-test: passed"))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
