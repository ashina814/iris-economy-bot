const assert = require("assert");
const fs = require("fs");
const Module = require("module");

process.env.IRIS_ENTRYPOINT_TEST = "1";
process.env.DISCORD_TOKEN = "entrypoint-test-token";
process.env.DISCORD_CLIENT_ID = "000000000000000000";

const originalLoader = Module._extensions[".js"];
require("./discord-entry-operations");
const { applyOfficialPurchaseUsername, buildComponents, client, completeOfficialNicknameFulfillment, engine, ensureShopForumThread, handleInteraction, isEphemeralComponentSource, officialPurchaseBuyerName, parseOfficialFulfillmentControlId, officialPurchaseNotificationResult } = require("./discord-core");

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

// ランキング系は discord.js のチューニング層（buildMentionLeaderboard）が rank コマンドを
// 横取りするため、必ず本番entryチェーン経由の engine.run で検証する。
// （rank boost が未対応タイプ扱いで純資産ランキングに落ちる回帰を防ぐ）
const boostRankActor = { id: "entrypoint-test:boost-ranker", name: "boost ranker" };
engine.run("join", boostRankActor);
engine.recordBoostEvent({
  guildId: "999999999999999901",
  discordUserId: "999999999999999902",
  messageId: "999999999999999903",
  messageType: 8,
  displayName: "entrypoint booster"
});
for (const rankCommand of ["rank boost", "rank ブースト", "ランキング boost"]) {
  const boostRank = engine.run(rankCommand, boostRankActor);
  assert(String(boostRank.title).includes("ブーストランキング"), `${rankCommand} はブーストランキングを返す必要があります（純資産ランキングに落ちてはいけません）`);
  assert(boostRank.lines.some((line) => line.includes("entrypoint booster") && line.includes("1回")), `${rankCommand} に累計回数が表示される必要があります`);
}
assert(String(engine.run("rank", boostRankActor).title).includes("純資産ランキング"), "引数なしの rank は従来通り純資産ランキングのままである必要があります");

// 招待・Bumpランキング: 実績0の人でTop10を埋めない・退出者を表示しない
const bumpRanker = { id: "999999999999999904:999999999999999905", name: "bump ranker" };
engine.run("join", bumpRanker);
engine.getUser(bumpRanker.id, bumpRanker.name).bump.count = 999999;
engine.getUser(bumpRanker.id, bumpRanker.name).invites.qualified = 999999;
for (const rankCommand of ["rank bump", "rank invite"]) {
  const contribution = engine.run(rankCommand, boostRankActor);
  const rankedLines = contribution.lines.filter((line) => /^\d+\./.test(line));
  assert(!rankedLines.some((line) => / - 0(回|人)/.test(line)), `${rankCommand} に実績0のユーザーを表示してはいけません`);
  assert(rankedLines.some((line) => line.includes("bump ranker")), `${rankCommand} に実績のあるユーザーが表示される必要があります`);
}

// `join` していない貢献者も、Bump/招待の記録があれば必ずランキングに載せる。
// （回帰: /bump は自動で経済圏加入させないため、joinedフィルタで丸ごと消えていた）
const unjoinedBumper = { id: "999999999999999904:999999999999999906", name: "unjoined bumper" };
engine.getUser(unjoinedBumper.id, unjoinedBumper.name).bump.count = 37;
const unjoinedInviter = { id: "999999999999999904:999999999999999907", name: "unjoined inviter" };
engine.getUser(unjoinedInviter.id, unjoinedInviter.name).invites.qualified = 5;
assert(!engine.state.users[unjoinedBumper.id].joined, "テストの前提: bump ユーザーは join 未済である必要があります");
assert(!engine.state.users[unjoinedInviter.id].joined, "テストの前提: invite ユーザーは join 未済である必要があります");
const unjoinedBumpRank = engine.run("rank bump", boostRankActor);
assert(unjoinedBumpRank.lines.some((line) => line.includes("unjoined bumper")), "join 未済の Bumper も Bump ランキングに載る必要があります");
const unjoinedInviteRank = engine.run("rank invite", boostRankActor);
assert(unjoinedInviteRank.lines.some((line) => line.includes("unjoined inviter")), "join 未済の招待者も招待ランキングに載る必要があります");
const savedContribDirectory = global.__IRIS_GUILD_MEMBER_DIRECTORY__;
global.__IRIS_GUILD_MEMBER_DIRECTORY__ = {
  get(guildId) {
    // bumpRanker のギルドに本人が居ない = サーバー退出済みの想定
    return guildId === "999999999999999904" ? new Map() : null;
  }
};
for (const rankCommand of ["rank bump", "rank invite"]) {
  const filtered = engine.run(rankCommand, boostRankActor);
  assert(!filtered.lines.some((line) => line.includes("bump ranker")), `${rankCommand} にサーバー退出者を表示してはいけません`);
}
global.__IRIS_GUILD_MEMBER_DIRECTORY__ = savedContribDirectory;

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

// --- 本番オーバーレイ (TunedEconomyEngine) 経由での撤去済みコマンド no-op 確認 ---
// PR #58 レビューで指摘: 基礎engineは早期returnで no-op でも、Tunedのラッパーが
// originalRun後に getUser() を叩くと未登録actorのuser stateが新規作成されていた。
// 現在のラッパーは state.users[actor.id] を直接参照するだけなので新規作成されないことを、
// 本番と同じEngineクラスで検証する。
{
  const OriginalEconomyEngineExport = require("./economy").EconomyEngine;
  assert.notStrictEqual(OriginalEconomyEngineExport.name, "EconomyEngine",
    "本番起動経路では economy.EconomyEngine が TunedEconomyEngine に差し替えられている必要があります");
  const removedCommands = ["work", "労働", "subsidy", "beg", "給付金", "simulate-text 200", "simulate-vc 240"];
  for (const cmd of removedCommands) {
    const strangerId = "entrypoint-test:removed-stranger-" + cmd.replace(/\s/g, "-");
    const strangerActor = { id: strangerId, name: "未登録の他人" };
    // stranger は engine.state.users に居ないことを前提とする（テスト用の一意ID）
    assert(!Object.prototype.hasOwnProperty.call(engine.state.users, strangerId),
      `テスト前提: ${cmd} 用の stranger は事前に登録されていない`);
    const beforeAll = JSON.stringify(engine.state);
    const usersBeforeCount = Object.keys(engine.state.users).length;
    const commandCountBefore = engine.state.commandCount;
    const result = engine.run(cmd, strangerActor);
    const afterAll = JSON.stringify(engine.state);
    assert.strictEqual(afterAll, beforeAll,
      `本番Tuned経由でも ${cmd} 実行前後で engine.state 全体が完全一致する必要があります`);
    assert.strictEqual(Object.keys(engine.state.users).length, usersBeforeCount,
      `本番Tuned経由でも ${cmd} 実行で users に新規レコードが増えてはいけません`);
    assert.strictEqual(engine.state.commandCount, commandCountBefore,
      `本番Tuned経由でも ${cmd} 実行で commandCount が動いてはいけません`);
    assert(!Object.prototype.hasOwnProperty.call(engine.state.users, strangerId),
      `本番Tuned経由でも ${cmd} 実行で未登録利用者の user state が作成されてはいけません`);
    assert.strictEqual(result.ok, false, `本番Tuned経由でも ${cmd} は ok:false で拒否される必要があります`);
    assert(String(result.title).includes("未知"),
      `本番Tuned経由でも ${cmd} は「未知の経済行為」で応答する必要があります`);
  }
}

// simulate系メソッドがTunedEconomyEngineからも露出していない
{
  assert.strictEqual(typeof engine.simulateText, "undefined",
    "TunedEconomyEngine 経由でも simulateText メソッドが露出していてはいけません");
  assert.strictEqual(typeof engine.simulateVoice, "undefined",
    "TunedEconomyEngine 経由でも simulateVoice メソッドが露出していてはいけません");
}

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

// ---- 公開商店街パネルの非破壊ルーティング ----
// 公開メッセージのボタンは元メッセージを書き換えず、本人だけのephemeral返信を返すこと。

function makeComponentInteraction({ customId, userId, ephemeralSource }) {
  const calls = { reply: [], update: [], editReply: [], followUp: [], messageEdits: [] };
  const interaction = {
    customId,
    guildId: "entrypoint-test",
    user: { id: userId, username: `user-${userId}`, globalName: null, displayAvatarURL: () => null },
    member: { displayName: `member-${userId}` },
    guild: null,
    deferred: false,
    replied: false,
    message: {
      flags: { has: () => Boolean(ephemeralSource) },
      edit: async (payload) => { calls.messageEdits.push(payload); }
    },
    isModalSubmit: () => false,
    isUserSelectMenu: () => false,
    isRoleSelectMenu: () => false,
    isChannelSelectMenu: () => false,
    isButton: () => true,
    isStringSelectMenu: () => false,
    isChatInputCommand: () => false,
    reply: async (payload) => { calls.reply.push(payload); interaction.replied = true; },
    update: async (payload) => { calls.update.push(payload); },
    editReply: async (payload) => { calls.editReply.push(payload); },
    followUp: async (payload) => { calls.followUp.push(payload); }
  };
  return { interaction, calls };
}

function embedTitle(payload) {
  const embed = payload?.embeds?.[0];
  return embed?.data?.title || embed?.title || "";
}

async function verifyPublicPanelRouting() {
  // handleInteraction は台帳保存まで行うため、テスト中はディスク書き込みだけ無効化する
  const { JsonStore } = require("./storage");
  const originalSave = JsonStore.prototype.save;
  JsonStore.prototype.save = function () {};
  try {
    await verifyPublicPanelRoutingInner();
  } finally {
    JsonStore.prototype.save = originalSave;
  }
}

async function verifyPublicPanelRoutingInner() {
  const publicMyShop = makeComponentInteraction({ customId: "eco:panel:my-shop", userId: "public-user-a", ephemeralSource: false });
  const publicDirectory = makeComponentInteraction({ customId: "eco:panel:seller-directory", userId: "public-user-b", ephemeralSource: false });
  assert.strictEqual(isEphemeralComponentSource(publicMyShop.interaction), false, "公開メッセージはephemeral扱いされてはいけません");

  // AとBが同時に公開パネルを操作しても、公開メッセージは書き換わらず、それぞれにephemeral画面が返ること
  await Promise.all([
    handleInteraction(publicMyShop.interaction),
    handleInteraction(publicDirectory.interaction)
  ]);
  for (const [label, target] of [["自分の店", publicMyShop], ["店舗一覧", publicDirectory]]) {
    assert.strictEqual(target.calls.update.length, 0, `公開パネルの「${label}」操作で元メッセージをupdateしてはいけません`);
    assert.strictEqual(target.calls.messageEdits.length, 0, `公開パネルの「${label}」操作で元メッセージをeditしてはいけません`);
    assert.strictEqual(target.calls.reply.length, 1, `公開パネルの「${label}」操作は本人への返信が1回必要です`);
    assert.strictEqual(target.calls.reply[0].ephemeral, true, `公開パネルの「${label}」操作はephemeralで返す必要があります`);
  }
  assert(embedTitle(publicMyShop.calls.reply[0]).includes("member-public-user-a"), "Aには自分の店の画面が返る必要があります");
  assert(embedTitle(publicDirectory.calls.reply[0]).includes("店舗一覧"), "Bには店舗一覧の画面が返る必要があります");
  assert(!embedTitle(publicDirectory.calls.reply[0]).includes("member-public-user-a"), "他人の操作画面が混ざってはいけません");

  // 自分の取引・商品検索結果も公開パネルからはephemeral
  const publicTrades = makeComponentInteraction({ customId: "eco:panel:my-trades", userId: "public-user-c", ephemeralSource: false });
  await handleInteraction(publicTrades.interaction);
  assert.strictEqual(publicTrades.calls.update.length, 0, "公開パネルの「自分の取引」で元メッセージをupdateしてはいけません");
  assert.strictEqual(publicTrades.calls.reply[0]?.ephemeral, true, "自分の取引はephemeralで返す必要があります");
  const publicSearch = makeComponentInteraction({ customId: "eco:run:marketplace search-page 1", userId: "public-user-d", ephemeralSource: false });
  await handleInteraction(publicSearch.interaction);
  assert.strictEqual(publicSearch.calls.update.length, 0, "公開パネルからの商品検索で元メッセージをupdateしてはいけません");
  assert.strictEqual(publicSearch.calls.reply[0]?.ephemeral, true, "商品検索の結果はephemeralで返す必要があります");

  // ephemeral画面内の操作は従来通りその画面を更新する（画面遷移が増殖しない）
  const ephemeralNav = makeComponentInteraction({ customId: "eco:panel:my-listings", userId: "public-user-a", ephemeralSource: true });
  await handleInteraction(ephemeralNav.interaction);
  assert.strictEqual(ephemeralNav.calls.reply.length, 0, "ephemeral画面内の遷移で新しい返信を作ってはいけません");
  assert.strictEqual(ephemeralNav.calls.update.length, 1, "ephemeral画面内の遷移はその画面を更新する必要があります");

  // 参加ボタン: 新規ユーザーが公開パネルから押して初期資本を受け取れる
  const joinPress = makeComponentInteraction({ customId: "eco:run:join", userId: "join-user-fresh", ephemeralSource: false });
  await handleInteraction(joinPress.interaction);
  assert(embedTitle(joinPress.calls.reply[0]).includes("経済圏へようこそ"), "参加ボタンで新規ユーザーが経済圏に参加できる必要があります");
  assert.strictEqual(engine.state.users["entrypoint-test:join-user-fresh"].wallet >= 100000, true, "参加で初期資本が付与される必要があります");
  assert.strictEqual(joinPress.calls.reply[0].ephemeral, true, "公開パネルからの参加はephemeralで返す必要があります");

  // 旧世代パネルの未知customIdは無応答にせず、ephemeralで案内を返す
  const staleButton = makeComponentInteraction({ customId: "eco:join", userId: "join-user-stale", ephemeralSource: false });
  await handleInteraction(staleButton.interaction);
  assert.strictEqual(staleButton.calls.reply.length, 1, "未知のコンポーネントIDにも必ず応答する必要があります（無応答はDiscord側で失敗表示になる）");
  assert(String(staleButton.calls.reply[0].content).includes("古いパネル"), "未知のコンポーネントIDには案内メッセージを返す必要があります");
  assert.strictEqual(staleButton.calls.reply[0].ephemeral, true, "未知IDへの案内はephemeralである必要があります");

  // 重複コンポーネントIDのパネルは、クラッシュせず重複ボタンだけ落として表示する
  const dupPanel = {
    title: "dup test",
    description: "x",
    fields: [],
    components: [
      { type: "buttons", items: [
        { kind: "panel", panel: "marketplace", label: "A", style: "primary" },
        { kind: "panel", panel: "marketplace", label: "B", style: "secondary" }
      ] }
    ]
  };
  const dupRows = buildComponents({ panel: dupPanel });
  assert.strictEqual(dupRows.length, 1, "重複IDのパネルでも行が生成される必要があります");
  assert.strictEqual(dupRows[0].components.length, 1, "重複したボタンは1つに畳んで表示する必要があります");
}

// ---- 店舗Forum作成の孤児防止 ----
// thread作成後にDBへの紐付けが成立しなかった場合、作成したthreadを削除してロールバックすること。
// 削除もできない場合は孤児としてmarketLogに記録すること。

async function verifyShopForumOrphanRollback() {
  const { JsonStore } = require("./storage");
  const originalSave = JsonStore.prototype.save;
  JsonStore.prototype.save = function () {};
  try {
    const forumAdmin = engine.getUser("entrypoint-test:forum-admin", "forum admin");
    engine.setMarketForumChannel(forumAdmin, "111111111111111111");

    // 正常系: 作成 → 紐付け成功。削除は呼ばれない。
    const okActor = { id: "entrypoint-test:forum-seller-ok", name: "forum seller ok" };
    engine.run("join", okActor);
    let deletions = [];
    client.channels.fetch = async () => ({
      threads: {
        create: async () => ({ id: "810000000000000001", delete: async (reason) => { deletions.push(reason); } })
      }
    });
    const okThread = await ensureShopForumThread(okActor.id);
    assert.strictEqual(okThread, "810000000000000001", "店舗Forum投稿を作成・紐付けできる必要があります");
    assert.strictEqual(engine.state.users[okActor.id].marketplace.marketForumThreadId, "810000000000000001", "紐付け成功時はDBに店舗投稿IDが記録される必要があります");
    assert.strictEqual(deletions.length, 0, "紐付け成功時に作成threadを削除してはいけません");

    // 競合系: thread作成のawait中に手動採用が先に別threadを紐付けた場合、
    // 作成したthreadは孤児になるため削除し、DBに記録済みのthreadを返す。
    const raceActor = { id: "entrypoint-test:forum-seller-race", name: "forum seller race" };
    engine.run("join", raceActor);
    deletions = [];
    client.channels.fetch = async () => ({
      threads: {
        create: async () => {
          engine.attachShopForumThread(engine.getUser(raceActor.id, raceActor.name), "810000000000000002");
          return { id: "810000000000000003", delete: async (reason) => { deletions.push(reason); } };
        }
      }
    });
    const racedThread = await ensureShopForumThread(raceActor.id);
    assert.strictEqual(racedThread, "810000000000000002", "競合時はDBに記録済みの店舗投稿IDを返す必要があります");
    assert.strictEqual(engine.state.users[raceActor.id].marketplace.marketForumThreadId, "810000000000000002", "競合時もDBは先に紐付いた店舗投稿を維持する必要があります");
    assert.strictEqual(deletions.length, 1, "DBに紐付かなかった店舗投稿は削除（ロールバック）する必要があります");

    // 削除失敗系: 孤児としてmarketLogに記録し、処理自体は安全に完了する。
    const orphanActor = { id: "entrypoint-test:forum-seller-orphan", name: "forum seller orphan" };
    engine.run("join", orphanActor);
    client.channels.fetch = async () => ({
      threads: {
        create: async () => {
          engine.attachShopForumThread(engine.getUser(orphanActor.id, orphanActor.name), "810000000000000004");
          return { id: "810000000000000005", delete: async () => { throw new Error("delete denied"); } };
        }
      }
    });
    const orphanThread = await ensureShopForumThread(orphanActor.id);
    assert.strictEqual(orphanThread, "810000000000000004", "削除失敗時もDBに記録済みの店舗投稿IDを返す必要があります");
    assert(engine.state.marketplace.logs.some((line) => String(line).includes("810000000000000005") && String(line).includes("孤児")),
      "削除できなかった店舗投稿は孤児としてmarketLogに記録する必要があります");
    assert.strictEqual(engine.state.users[orphanActor.id].marketplace.marketForumThreadId, "810000000000000004", "孤児処理でDBの店舗投稿IDを壊してはいけません");
  } finally {
    JsonStore.prototype.save = originalSave;
    delete client.channels.fetch;
    engine.setMarketForumChannel(engine.getUser("entrypoint-test:forum-admin", "forum admin"), null);
  }
}

verifyOfficialNicknameCompletion()
  .then(() => verifyPublicPanelRouting())
  .then(() => verifyShopForumOrphanRollback())
  .then(() => console.log("entrypoint-test: passed"))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
