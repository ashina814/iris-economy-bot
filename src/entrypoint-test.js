const assert = require("assert");
const fs = require("fs");
const Module = require("module");

process.env.IRIS_ENTRYPOINT_TEST = "1";
process.env.DISCORD_TOKEN = "entrypoint-test-token";
process.env.DISCORD_CLIENT_ID = "000000000000000000";

const originalLoader = Module._extensions[".js"];
require("./discord-entry-operations");
const { applyOfficialPurchaseUsername, buildComponents, engine, officialPurchaseBuyerName, parseOfficialFulfillmentControlId, officialPurchaseNotificationResult } = require("./discord-core");

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

const missingFromCache = { id: "entrypoint-test:missing", name: "cache-missing member" };
engine.run("join", missingFromCache);
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

console.log("entrypoint-test: passed");
