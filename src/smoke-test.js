const assert = require("assert");
const { EconomyEngine, createInitialState } = require("./economy");

let seed = 123456789;
function rng() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0x100000000;
}

const engine = new EconomyEngine(createInitialState(), { rng });
const actor = { id: "test:user", name: "テスター" };

const commands = [
  "join",
  "panel",
  "panel inn",
  "panel marketplace",
  "panel official-shop",
  "panel user-shops",
  "panel my-shop",
  "panel invite",
  "panel lounge",
  "panel admin",
  "daily",
  "profile",
  "ranks",
  "card",
  "marketplace recommended",
  "marketplace affordable",
  "marketplace product frame",
  "marketplace confirm frame",
  "marketplace buy frame",
  "invite",
  "simulate-text 20",
  "simulate-vc 30",
  "rank text",
  "rank vc",
  "rank invite",
  "rank net"
];

for (const command of commands) {
  const result = engine.run(command, actor);
  assert(result && typeof result.title === "string", `${command} の結果がありません`);
  assert(Array.isArray(result.lines), `${command} の本文行がありません`);
}

const user = engine.state.users[actor.id];
assert(user.joined, "参加状態になる必要があります");
assert(user.lifetimeEarned >= 100000, "初期配布は100,000 Ris以上が必要です");
assert(user.activity.textXp > 0, "TC経験値が増える必要があります");
assert(user.activity.vcXp > 0, "VC経験値が増える必要があります");
assert(!user.inventory.frame, "公式ショップ撤去中は商品を購入できてはいけません");

const unjoinedRankerActor = { id: "test:unjoined-ranker", name: "未加入ランカー" };
const unjoinedRanker = engine.getUser(unjoinedRankerActor.id, unjoinedRankerActor.name);
unjoinedRanker.activity.textXp = 999;
unjoinedRanker.activity.textMessages = 80;
unjoinedRanker.activity.vcXp = 888;
unjoinedRanker.activity.vcMinutes = 160;
assert.strictEqual(unjoinedRanker.joined, false, "ランキング修正テスト用ユーザーは未加入のままにする必要があります");
assert(engine.run("rank text", actor).lines.some((line) => line.includes(unjoinedRankerActor.name)), "TC実績を持つ未加入ユーザーはランキング対象にする必要があります");
assert(engine.run("rank vc", actor).lines.some((line) => line.includes(unjoinedRankerActor.name)), "VC実績を持つ未加入ユーザーはランキング対象にする必要があります");
assert.strictEqual(engine.serverPositionByTextXp(unjoinedRankerActor.id), 1, "TC昇格時の順位も未加入の活動者を含める必要があります");
assert.strictEqual(engine.serverPositionByVcXp(unjoinedRankerActor.id), 1, "VC昇格時の順位も未加入の活動者を含める必要があります");

const card = engine.run("card", actor);
assert(card.card, "カードコマンドにDiscordカード情報が必要です");
assert(card.lines.some((line) => line.includes("カード")), "カードコマンドにCLIカード表示が必要です");

const marketPanel = engine.run("panel marketplace", actor);
assert(marketPanel.panel, "ショップパネルが必要です");
assert(marketPanel.panel.components.length > 0, "ショップパネルに操作部品が必要です");
assert(marketPanel.panel.fields.some((field) => field.name === "商店街"), "ショップホームに商店街の状況が必要です");
assert(marketPanel.panel.fields.some((field) => field.name === "新着"), "ショップホームに新着枠が必要です");
const marketPanelJson = JSON.stringify(marketPanel.panel.components);
assert(marketPanelJson.includes("my-trades") && marketPanelJson.includes("my-shop"), "ショップホームに自分の店・自分の取引の導線が必要です");
assert(marketPanelJson.includes("seller-directory") && marketPanelJson.includes("eco:shop:search-open"), "ショップホームは店舗を見る/商品を探すの2軸が必要です");

// 公式ショップは全商品撤去中（ラインナップは OFFICIAL_SALE_ITEM_IDS で管理）
const recommendedPanel = engine.run("marketplace recommended", actor);
assert(recommendedPanel.panel, "おすすめ商品パネルが必要です");
assert(JSON.stringify(recommendedPanel.panel).includes("準備中"), "撤去中のおすすめは準備中表示になる必要があります");
assert(!JSON.stringify(recommendedPanel.panel.components).includes("marketplace product"), "撤去中に商品詳細への導線を出してはいけません");

const affordablePanel = engine.run("marketplace affordable", actor);
assert(affordablePanel.panel, "今買えるものパネルが必要です");
assert(affordablePanel.panel.fields.length > 0, "今買えるものに表示内容が必要です");
assert(!JSON.stringify(affordablePanel.panel).includes("公式ショップでカード枠"), "撤去中に公式商品が今買えるものに出てはいけません");

const officialShopEmpty = engine.run("panel official-shop", actor);
assert(JSON.stringify(officialShopEmpty.panel).includes("撤去中"), "公式ショップは撤去中表示になる必要があります");

const productPanel = engine.run("marketplace product frame", actor);
assert(productPanel.panel, "公式商品詳細はショップへフォールバックする必要があります");
assert(!JSON.stringify(productPanel.panel.components).includes("marketplace confirm frame"), "撤去中の商品に購入確認導線を出してはいけません");
const blockedBuy = engine.run("marketplace buy frame", actor);
assert(!blockedBuy.ok, "撤去中の公式商品は購入できてはいけません");

// 初期資本が CPI 補正なしで素の 100,000 Ris になっていることを確認
const officialAdminActor = { id: "test:official-admin", name: "公式商品管理者" };
engine.run("join", officialAdminActor);
const officialAdmin = engine.getUser(officialAdminActor.id, officialAdminActor.name);
const createOfficialItem = engine.adminCreateOfficialItem(officialAdmin, {
  id: "vip-pass",
  name: "VIPパス30日",
  price: "10000",
  max: "1",
  type: "ロール30日",
  effect: "VIPロール30日分（手動付与）",
  description: "購入後、運営がロール付与を確認します。",
  fulfillmentMode: "manual"
});
assert(createOfficialItem.ok, "運営が公式ショップ商品を追加できる必要があります");
assert(engine.state.marketplace.officialItems["official:vip-pass"], "追加公式商品がstateに保存される必要があります");
const marketAdminPanel = engine.run("panel market-admin", officialAdminActor).panel;
assert(marketAdminPanel.components.length <= 3, "ショップ管理トップは3行以内に収める必要があります");
const marketAdminIds = marketAdminPanel.components
  .filter((component) => component.type === "buttons")
  .flatMap((component) => component.items.map((item) => item.kind === "custom" ? item.customId : `${item.kind}:${item.panel || item.command}`));
assert.strictEqual(new Set(marketAdminIds).size, marketAdminIds.length, "ショップ管理トップに重複ボタンを置いてはいけません");
assert(JSON.stringify(marketAdminPanel.components).includes("official-fulfillment"), "market admin must open the official fulfillment queue");
const marketAdminSecondary = marketAdminPanel.components.find((component) => component.type === "select");
assert(marketAdminSecondary?.options.some((item) => item.value === "panel:user-shops"), "private listings must remain reachable from secondary navigation");
assert(marketAdminSecondary?.options.some((item) => item.value === "panel:marketplace"), "buyer shop view must remain reachable from secondary navigation");
const officialProductAdminPanel = engine.run("panel official-product-admin", officialAdminActor).panel;
assert(JSON.stringify(officialProductAdminPanel.components).includes("eco:market:official-item-create"), "公式商品管理から商品追加へ進める必要があります");
assert(!JSON.stringify(officialProductAdminPanel.components).includes("official-shop"), "official product management must not duplicate the buyer shop link");
const setOfficialPurchaseLog = engine.setOfficialPurchaseLogChannel(officialAdmin, "123456789012345678");
assert(setOfficialPurchaseLog.ok, "公式商品購入の通知先を設定できる必要があります");
assert.strictEqual(engine.officialPurchaseLogChannelId(), "123456789012345678", "公式商品購入の通知先を保存する必要があります");
assert(JSON.stringify(setOfficialPurchaseLog.panel.components).includes("eco:market:official-purchase-log-set"), "公式商品管理から購入通知先を設定できる必要があります");
const updateOfficialItem = engine.adminUpdateOfficialItem(officialAdmin, "official:vip-pass", {
  name: "VIPパス30日", price: "10000", max: "2", stock: "2", type: "ロール30日",
  saleStartsAt: "-", saleEndsAt: "-", roleDurationDays: "30",
  effect: "VIPロール30日分（手動付与）", description: "購入後、運営がロール付与を確認します。", dmGuide: "運営がロール付与を確認します。"
});
assert(updateOfficialItem.ok, "公式商品の在庫・販売期間・DM案内を編集できる必要があります");
assert.strictEqual(engine.state.marketplace.officialItems["official:vip-pass"].stock, 2, "公式商品の在庫を保存する必要があります");
const stopOfficialItem = engine.adminToggleOfficialItem(officialAdmin, "official:vip-pass");
assert(stopOfficialItem.ok, "公式商品の販売を停止できる必要があります");
assert(!engine.officialItem("official:vip-pass"), "停止中の公式商品は販売棚から除外される必要があります");
const resumeOfficialItem = engine.adminToggleOfficialItem(officialAdmin, "official:vip-pass");
assert(resumeOfficialItem.ok && engine.officialItem("official:vip-pass"), "停止した公式商品の販売を再開できる必要があります");
const officialShopWithItem = engine.run("panel official-shop", actor);
assert(JSON.stringify(officialShopWithItem.panel).includes("VIPパス30日"), "追加公式商品が公式ショップに表示される必要があります");
const officialPanelTargets = officialShopWithItem.panel.components
  .filter((component) => component.type === "buttons")
  .flatMap((component) => component.items)
  .filter((item) => item.kind === "panel")
  .map((item) => item.panel);
assert(!officialPanelTargets.includes("marketplace"), "公式ショップ入口から総合ショップへ遷移させてはいけません");
const officialProduct = engine.run("marketplace product official:vip-pass", actor);
assert(JSON.stringify(officialProduct.panel).includes("marketplace confirm official:vip-pass"), "追加公式商品の購入確認導線が必要です");
const officialProductTargets = officialProduct.panel.components
  .filter((component) => component.type === "buttons")
  .flatMap((component) => component.items)
  .filter((item) => item.kind === "panel")
  .map((item) => item.panel);
assert(!officialProductTargets.includes("marketplace"), "公式商品の詳細から総合ショップへ遷移させてはいけません");
const officialConfirm = engine.run("marketplace confirm official:vip-pass", actor);
assert(JSON.stringify(officialConfirm.panel).includes("VIPパス30日"), "追加公式商品の確認画面が必要です");
const officialConfirmTargets = officialConfirm.panel.components
  .filter((component) => component.type === "buttons")
  .flatMap((component) => component.items)
  .filter((item) => item.kind === "panel")
  .map((item) => item.panel);
assert(!officialConfirmTargets.includes("marketplace"), "公式商品の購入確認から総合ショップへ遷移させてはいけません");
const officialAuctions = engine.run("panel official-auctions", actor);
const officialAuctionTargets = officialAuctions.panel.components
  .filter((component) => component.type === "buttons")
  .flatMap((component) => component.items)
  .filter((item) => item.kind === "panel")
  .map((item) => item.panel);
assert(!officialAuctionTargets.includes("marketplace") && !officialAuctionTargets.includes("user-shops"), "公式オークションから総合・民営ショップへ遷移させてはいけません");
const beforeOfficialBuyWallet = engine.getUser(actor.id, actor.name).wallet;
const officialBuy = engine.run("marketplace buy official:vip-pass", actor);
assert(officialBuy.ok, "追加公式商品を購入できる必要があります");
assert.strictEqual(engine.getUser(actor.id, actor.name).wallet, beforeOfficialBuyWallet - 10000, "追加公式商品の購入で価格分だけ減る必要があります");
assert.strictEqual(engine.getUser(actor.id, actor.name).inventory["official:vip-pass"], 1, "追加公式商品が持ち物に入る必要があります");
assert.strictEqual(engine.state.marketplace.officialItems["official:vip-pass"].stock, 1, "購入時に公式商品の在庫を1つ減らす必要があります");
assert.deepStrictEqual(officialBuy.officialPurchase, {
  itemId: "official:vip-pass",
  itemName: "VIPパス30日",
  price: 10000,
  buyerId: actor.id,
  buyerName: actor.name,
  fulfillmentId: 1
}, "公式商品の購入結果には運営通知に必要な情報を含める必要があります");
assert.strictEqual(engine.state.marketplace.officialFulfillment.length, 1, "公式商品の購入後は運営対応キューを作る必要があります");
const officialTask = engine.state.marketplace.officialFulfillment[0];
assert.strictEqual(officialTask.status, "pending", "ロール未設定の商品は運営対応待ちにする必要があります");
const completeOfficialTask = engine.completeOfficialFulfillment(officialAdmin, officialTask.id);
assert(completeOfficialTask.ok && officialTask.status === "completed", "運営が公式商品対応を完了できる必要があります");
const manualTicketTask = engine.createOfficialFulfillment(officialAdmin, {
  id: "name-change",
  name: "名前変更権",
  roleId: null,
  roleDurationDays: 0,
  dmGuide: ""
});
const manualTicketPanel = engine.officialFulfillmentTaskPanel(officialAdmin, manualTicketTask.id);
assert(JSON.stringify(manualTicketPanel.components).includes(`eco:market:official-fulfillment-ticket:${manualTicketTask.id}`), "手動対応の公式商品にはチケット作成導線が必要です");
const recordOfficialTicket = engine.recordOfficialFulfillmentTicket(officialAdmin, manualTicketTask.id, "123456789012345678");
assert(recordOfficialTicket.ok, "公式商品対応チケットを記録できる必要があります");
assert.strictEqual(manualTicketTask.ticketChannelId, "123456789012345678", "公式商品対応チケットのチャンネルIDを保存する必要があります");
assert(!engine.recordOfficialFulfillmentTicket(officialAdmin, manualTicketTask.id, "234567890123456789").ok, "同じ公式商品対応にチケットを重複作成してはいけません");
const officialInventory = engine.run("panel market-inventory", actor);
assert(JSON.stringify(officialInventory.panel).includes("VIPパス30日"), "追加公式商品が持ち物に表示される必要があります");

const nameChangeItem = engine.adminCreateOfficialItem(officialAdmin, {
  id: "name-change-request",
  name: "名前変更権",
  price: "5000",
  max: "2",
  type: "申請権",
  effect: "希望する名前への変更を申請できます。",
  description: "持ち物から使うと希望する名前を送信できます。",
  fulfillmentMode: "on_use"
});
assert(nameChangeItem.ok, "持ち物から申請する公式商品を追加できる必要があります");
const nameChangeManagement = engine.officialItemManagementPanel(officialAdmin, "official:name-change-request");
assert(JSON.stringify(nameChangeManagement.components).includes("official-item-mode:official:name-change-request:on_use"), "公式商品管理から利用方式を確認できる必要があります");
const fulfillmentCountBeforeNameChangeBuy = engine.state.marketplace.officialFulfillment.length;
const nameChangeBuy = engine.run("marketplace buy official:name-change-request", actor);
assert(nameChangeBuy.ok, "申請型の公式商品を購入できる必要があります");
assert.strictEqual(engine.state.marketplace.officialFulfillment.length, fulfillmentCountBeforeNameChangeBuy, "申請型の商品は購入時に対応キューを作ってはいけません");
const nameChangeInventory = engine.run("panel market-inventory", actor);
assert(JSON.stringify(nameChangeInventory.panel).includes("run:use official:name-change-request"), "申請型の商品は持ち物から使用できる必要があります");
const nameChangeUse = engine.beginOfficialItemUse(engine.getUser(actor.id, actor.name), "official:name-change-request", "tama_dane.");
assert(nameChangeUse.ok, "申請型の商品を持ち物から使用できる必要があります");
assert.strictEqual(engine.getUser(actor.id, actor.name).inventory["official:name-change-request"] || 0, 0, "利用申請時に商品を1つだけ消費する必要があります");
const nameChangeTask = engine.officialFulfillmentTask(nameChangeUse.officialUse.id);
assert.strictEqual(nameChangeTask.requestText, "tama_dane.", "利用申請の希望内容を対応キューへ記録する必要があります");
assert(!engine.beginOfficialItemUse(engine.getUser(actor.id, actor.name), "official:name-change-request", "another-name").ok, "同じ所持分を二重に利用申請してはいけません");

const freshEngine = new EconomyEngine(createInitialState(), { rng });
const freshActor = { id: "test:fresh", name: "新規参加者" };
const joinResult = freshEngine.run("join", freshActor);
assert(joinResult.ok, "join が成功する必要があります");
const freshUser = freshEngine.state.users[freshActor.id];
assert.strictEqual(freshUser.wallet, 100000, `初期配布は素の10万Ris（実際: ${freshUser.wallet}）`);

const legacyNameChangeState = createInitialState();
legacyNameChangeState.marketplace.officialItems["official:name-henkou"] = {
  id: "official:name-henkou",
  name: "名前変更権",
  price: 5000,
  max: 1,
  status: "active"
};
const migratedNameChangeEngine = new EconomyEngine(legacyNameChangeState, { rng });
assert.strictEqual(migratedNameChangeEngine.state.marketplace.officialItems["official:name-henkou"].fulfillmentMode, "on_use", "既存の名前変更権は持ち物から申請する方式へ移行する必要があります");
const migratedNameChangeItem = migratedNameChangeEngine.state.marketplace.officialItems["official:name-henkou"];
const nicknameRequestTask = migratedNameChangeEngine.createOfficialFulfillment({ id: "test:nickname", name: "名前変更希望者" }, migratedNameChangeItem, { requestText: "tama_dane." });
assert(migratedNameChangeEngine.isOfficialNicknameChangeTask(nicknameRequestTask), "希望名付きの名前変更権は自動変更対象として識別する必要があります");
const nicknameRequestPanel = migratedNameChangeEngine.officialFulfillmentTaskPanel({ id: "test:admin", name: "運営" }, nicknameRequestTask.id);
assert(JSON.stringify(nicknameRequestPanel.components).includes("名前変更して完了"), "希望名付きの名前変更権には自動完了ボタンを表示する必要があります");
const legacyNicknameTask = migratedNameChangeEngine.createOfficialFulfillment({ id: "test:legacy", name: "旧方式" }, migratedNameChangeItem);
assert(!migratedNameChangeEngine.isOfficialNicknameChangeTask(legacyNicknameTask), "希望名のない旧対応は自動変更対象にしてはいけません");

const migratedCampaignEngine = new EconomyEngine({ version: 4, users: {} }, { rng });
assert(migratedCampaignEngine.state.inviteCampaign, "inactive campaign state が安全に補完される必要があります");
const inactiveCampaignPanel = migratedCampaignEngine.run("campaign status", { id: "test:inactive", name: "非開催確認" });
assert(inactiveCampaignPanel.panel, "inactive campaign panel が表示できる必要があります");

let campaignNow = new Date("2026-07-01T00:00:00.000Z");
const campaignEngine = new EconomyEngine(createInitialState(), { rng, now: () => campaignNow });
const campaignAdmin = { id: "test:campaign-admin", name: "Campaign管理者" };
const campaignInviter = { id: "test:campaign-inviter", name: "招待者" };
const campaignInvitee = { id: "test:campaign-invitee", name: "招待された人" };
campaignEngine.run("join", campaignAdmin);
campaignEngine.run("join", campaignInviter);
const startCampaign = campaignEngine.run("campaign start", campaignAdmin);
assert(startCampaign.ok && campaignEngine.state.inviteCampaign.active, "campaign start が成功する必要があります");
const activeInvitePanel = campaignEngine.run("panel invite", campaignInviter);
assert(JSON.stringify(activeInvitePanel.panel).includes("IRIS Invite Campaign 開催中"), "貢献パネルにcampaignバナーが必要です");
const inactiveMarketBefore = migratedCampaignEngine.run("panel marketplace", { id: "test:market-inactive", name: "市場非開催" });
assert(!JSON.stringify(inactiveMarketBefore.panel).includes("Campaign Shop"), "非開催時のmarketplaceにCampaign Shopを出さない必要があります");
const activeMarket = campaignEngine.run("panel marketplace", campaignInviter);
assert(JSON.stringify(activeMarket.panel).includes("Campaign Shop"), "開催中のmarketplaceにCampaign Shop入口が必要です");

campaignEngine.recordInviteJoin(campaignInviter, campaignInvitee, { code: "iris-test" });
let campaignInviteeUser = campaignEngine.getUser(campaignInvitee.id, campaignInvitee.name);
let campaignInviterUser = campaignEngine.getUser(campaignInviter.id, campaignInviter.name);
const afterCampaignJoinInviterWallet = campaignInviterUser.wallet;
const afterCampaignJoinInviteeWallet = campaignInviteeUser.wallet;
campaignEngine.recordInviteJoin(campaignInviter, campaignInvitee, { code: "iris-test" });
assert.strictEqual(campaignInviterUser.wallet, afterCampaignJoinInviterWallet, "campaign join reward は二重支払いされてはいけません");
assert.strictEqual(campaignInviteeUser.wallet, afterCampaignJoinInviteeWallet, "invited user join bonus は二重支払いされてはいけません");
campaignEngine.run("join", campaignInvitee);
campaignInviteeUser = campaignEngine.getUser(campaignInvitee.id, campaignInvitee.name);
campaignInviterUser = campaignEngine.getUser(campaignInviter.id, campaignInviter.name);

campaignNow = new Date("2026-07-02T01:00:00.000Z");
campaignEngine.evaluateCampaignRetention();
const afterRetentionWallet = campaignInviterUser.wallet;
const afterRetentionTickets = campaignInviterUser.inviteCampaign.tickets;
campaignEngine.evaluateCampaignRetention();
assert.strictEqual(campaignInviterUser.wallet, afterRetentionWallet, "retention reward は二重支払いされてはいけません");
assert.strictEqual(campaignInviterUser.inviteCampaign.tickets, afterRetentionTickets, "retention ticket は二重付与されてはいけません");

const beforeVcMinutes = campaignInviteeUser.activity.vcMinutes;
campaignEngine.awardVoiceMinutes(campaignInviteeUser, 15);
assert.strictEqual(campaignInviteeUser.activity.vcMinutes, beforeVcMinutes + 15, "campaign VC判定で通常VC分数を減らしてはいけません");
assert(campaignInviterUser.inviteCampaign.tickets > afterRetentionTickets, "VC達成で招待者にCampaign Ticketが付与される必要があります");
const ticketsAfterVc = campaignInviterUser.inviteCampaign.tickets;
campaignEngine.awardVoiceMinutes(campaignInviteeUser, 15);
assert.strictEqual(campaignInviterUser.inviteCampaign.tickets, ticketsAfterVc, "VC campaign reward は二重付与されてはいけません");

const campaignShop = campaignEngine.run("campaign shop", campaignInvitee);
assert(campaignShop.panel, "Campaign Shop panel が表示できる必要があります");
assert(!JSON.stringify(campaignShop.panel.components).includes("work"), "Campaign Shopにworkを出してはいけません");
const stopCampaign = campaignEngine.run("campaign stop", campaignAdmin);
assert(stopCampaign.ok && !campaignEngine.state.inviteCampaign.active, "campaign stop が成功する必要があります");

const seller = { id: "test:seller", name: "売り手" };
const buyer = { id: "test:buyer", name: "買い手" };
engine.run("join", seller);
engine.run("join", buyer);
engine.run("marketplace open-shop", seller);
const sellerUser = engine.getUser(seller.id, seller.name);
const listingResult = engine.createUserListing(sellerUser, {
  name: "通話券",
  type: "item",
  mode: "permanent",
  price: "500",
  stock: "2",
  description: "30分だけ話を聞く券"
});
assert(listingResult.ok, "民営商品を出品できる必要があります");
const listing = engine.state.marketplace.listings[0];
assert(listing.status === "active", "通常商品は公開状態になる必要があります");
const listingPanel = engine.run(`marketplace listing ${listing.id}`, buyer);
assert(listingPanel.panel, "民営商品の詳細パネルが必要です");
const shelfPanel = engine.run("marketplace listing-shelf item", buyer);
assert(shelfPanel.panel, "民営商品のカテゴリ棚が必要です");
assert(shelfPanel.panel.fields.some((field) => field.name === "通話券"), "カテゴリ棚から商品を探せる必要があります");
const buyListing = engine.run(`marketplace listing-buy ${listing.id}`, buyer);
assert(buyListing.ok, "民営商品を購入できる必要があります");
assert(buyListing.panel, "民営商品購入後の次アクションパネルが必要です");
assert(engine.getUser(buyer.id, buyer.name).marketplace.inventory.length === 1, "購入品が持ち物に入る必要があります");
assert(engine.getUser(seller.id, seller.name).marketplace.sales > 0, "販売者の売上が増える必要があります");

const poorActor = { id: "test:poor", name: "残高不足テスト" };
engine.run("join", poorActor);
const poorUser = engine.getUser(poorActor.id, poorActor.name);
poorUser.wallet = 0;
const beforePoorWallet = poorUser.wallet;
const insufficientBuy = engine.run(`marketplace listing-buy ${listing.id}`, poorActor);
assert(!insufficientBuy.ok, "残高不足の直接購入は失敗する必要があります");
assert.strictEqual(engine.getUser(poorActor.id, poorActor.name).wallet, beforePoorWallet, "残高不足時に財布が減ってはいけません");
assert(insufficientBuy.panel, "残高不足時の案内パネルが必要です");
assert(!JSON.stringify(insufficientBuy.panel.components).includes("work"), "残高不足導線にworkを出してはいけません");

const insufficientAffordable = engine.run("marketplace affordable", poorActor);
assert(insufficientAffordable.panel, "残高不足向けの今買えるものパネルが必要です");
assert(!JSON.stringify(insufficientAffordable.panel.components).includes("work"), "今買えるもの不足導線にworkを出してはいけません");

// ロールは民営で出品できない（Discordロールの付与は運営にしかできないため公式のみ）
const roleListingResult = engine.createUserListing(sellerUser, {
  name: "限定ロール",
  type: "role",
  mode: "permanent",
  price: "800",
  stock: "1",
  description: "運営が付与するロール"
});
assert(!roleListingResult.ok, "ロールの民営出品は拒否される必要があります");
assert(!engine.state.marketplace.listings.some((entry) => entry.name === "限定ロール"), "ロール出品が台帳に登録されてはいけません");

const admin = { id: "test:admin", name: "運営" };
engine.run("join", admin);
const auctionCreate = engine.createOfficialAuction(engine.getUser(admin.id, admin.name), {
  name: "限定称号",
  type: "title",
  startPrice: "1000",
  durationMinutes: "60",
  description: "公式競売のテスト商品"
});
assert(auctionCreate.ok, "公式オークションを作成できる必要があります");
const auction = engine.state.marketplace.auctions[0];
assert(auction.status === "open", "公式オークションは開催中になる必要があります");
assert(JSON.stringify(engine.run(`marketplace auction ${auction.id}`, actor).panel.components).includes(`eco:market:auction-bid:${auction.id}`), "開催中の公式オークションに入札ボタンが必要です");
const auctionAdminPanel = engine.run("panel official-auction-admin", admin).panel;
assert(JSON.stringify(auctionAdminPanel.components).includes("eco:market:auction-create"), "公式オークション管理から作成へ進める必要があります");
assert(JSON.stringify(auctionAdminPanel.components).includes(`marketplace auction-end ${auction.id}`), "公式オークション管理から緊急終了を選べる必要があります");
const firstBidder = engine.getUser(actor.id, actor.name);
const secondBidder = engine.getUser(buyer.id, buyer.name);
const firstWallet = firstBidder.wallet;
const firstBid = engine.placeAuctionBid(firstBidder, auction.id, "1200");
assert(firstBid.ok, "入札できる必要があります");
assert(firstBidder.wallet === firstWallet - 1200, "入札額が拘束される必要があります");
const refundedWallet = firstBidder.wallet;
const secondBid = engine.placeAuctionBid(secondBidder, auction.id, "1600");
assert(secondBid.ok, "上書き入札できる必要があります");
assert(engine.getUser(actor.id, actor.name).wallet === refundedWallet + 1200, "上書きされた入札者へ自動返金される必要があります");
const closeResult = engine.forceEndAuction(engine.getUser(admin.id, admin.name), auction.id);
assert(closeResult.ok, "公式オークションを終了できる必要があります");
assert(auction.status === "ended", "公式オークションは終了状態になる必要があります");
assert(engine.getUser(buyer.id, buyer.name).marketplace.inventory.some((item) => item.name === "限定称号"), "落札者へ商品が付与される必要があります");

// 手動対応商品の完了報告は購入者のみ
const serviceListingResult = engine.createUserListing(engine.getUser(seller.id, seller.name), {
  name: "似顔絵サービス",
  type: "service",
  mode: "permanent",
  price: "800",
  stock: "1",
  description: "手動対応のテスト商品"
});
assert(serviceListingResult.ok, "サービス出品ができる必要があります");
const serviceListing = engine.state.marketplace.listings.find((entry) => entry.name === "似顔絵サービス");
assert(serviceListing.status === "pending", "サービス出品は審査待ちになる必要があります");
assert(engine.approveListing(engine.getUser(admin.id, admin.name), serviceListing.id).ok, "サービス出品を承認できる必要があります");
const sellerWalletBeforeServiceBuy = engine.state.users[seller.id].wallet;
assert(engine.buyUserListing(engine.getUser(buyer.id, buyer.name), serviceListing.id).ok, "サービス商品を購入できる必要があります");
const serviceOrder = engine.state.marketplace.orders.find((entry) => entry.listingId === serviceListing.id);
assert(serviceOrder.status === "open", "手動対応商品は対応待ちで始まる必要があります");
assert(serviceOrder.payout === "held", "手動対応商品の代金はエスクロー保留になる必要があります");
assert.strictEqual(engine.state.users[seller.id].wallet, sellerWalletBeforeServiceBuy, "エスクロー中は販売者に入金されてはいけません");
const sellerComplete = engine.completeOrder(engine.getUser(seller.id, seller.name), serviceOrder.id);
assert(!sellerComplete.ok, "売り手は自分で取引を完了にできてはいけません");
assert(serviceOrder.status === "open", "売り手の完了操作で状態が変わってはいけません");
const buyerComplete = engine.completeOrder(engine.getUser(buyer.id, buyer.name), serviceOrder.id);
assert(buyerComplete.ok && serviceOrder.status === "complete", "購入者の受け取り確認で完了になる必要があります");
assert(serviceOrder.payout === "paid", "受け取り確認でエスクローが支払い済みになる必要があります");
assert.strictEqual(
  engine.state.users[seller.id].wallet,
  sellerWalletBeforeServiceBuy + serviceOrder.price - serviceOrder.fee,
  "受け取り確認で販売者に手数料差引後の代金が支払われる必要があります"
);

// 公開後の編集で審査を迂回できない
const editTargetResult = engine.createUserListing(engine.getUser(seller.id, seller.name), {
  name: "編集テスト",
  type: "item",
  mode: "permanent",
  price: "500",
  stock: "1",
  description: "編集再審査のテスト"
});
assert(editTargetResult.ok, "編集テスト用の出品ができる必要があります");
const editTarget = engine.state.marketplace.listings.find((entry) => entry.name === "編集テスト");
assert(editTarget.status === "active", "安価なアイテムは即公開される必要があります");
const stockOnlyEdit = engine.editListing(engine.getUser(seller.id, seller.name), editTarget.id, { stock: "5" });
assert(stockOnlyEdit.ok && editTarget.status === "active", "在庫だけの編集は再審査に回ってはいけません");
const priceEdit = engine.editListing(engine.getUser(seller.id, seller.name), editTarget.id, { price: "60000" });
assert(priceEdit.ok && editTarget.status === "pending", "審査基準を超える編集は再審査に回る必要があります");

// 却下商品は停止→再開の迂回ができない
const rejectTargetResult = engine.createUserListing(engine.getUser(seller.id, seller.name), {
  name: "却下対象サービス",
  type: "service",
  mode: "permanent",
  price: "900",
  stock: "1",
  description: "却下テスト"
});
assert(rejectTargetResult.ok, "却下テスト用の出品ができる必要があります");
const rejectTarget = engine.state.marketplace.listings.find((entry) => entry.name === "却下対象サービス");
assert(engine.rejectListing(engine.getUser(admin.id, admin.name), rejectTarget.id, "テスト却下").ok, "出品を却下できる必要があります");
const stopRejected = engine.stopListing(engine.getUser(seller.id, seller.name), rejectTarget.id);
assert(!stopRejected.ok, "却下済み商品を停止状態に変えられてはいけません");

// エスクロー保留中の返金は販売者の残高に触れず、無からRisが湧かない
const escrowRefundListingResult = engine.createUserListing(engine.getUser(seller.id, seller.name), {
  name: "返金テストサービス",
  type: "service",
  mode: "permanent",
  price: "1000",
  stock: "1",
  description: "エスクロー返金のテスト"
});
assert(escrowRefundListingResult.ok, "返金テスト用の出品ができる必要があります");
const escrowRefundListing = engine.state.marketplace.listings.find((entry) => entry.name === "返金テストサービス");
assert(engine.approveListing(engine.getUser(admin.id, admin.name), escrowRefundListing.id).ok, "返金テスト出品を承認できる必要があります");
const buyerWalletBeforeEscrowBuy = engine.state.users[buyer.id].wallet;
const sellerWalletBeforeEscrowBuy = engine.state.users[seller.id].wallet;
assert(engine.buyUserListing(engine.getUser(buyer.id, buyer.name), escrowRefundListing.id).ok, "返金テスト商品を購入できる必要があります");
const escrowRefundOrder = engine.state.marketplace.orders.find((entry) => entry.listingId === escrowRefundListing.id);
assert(escrowRefundOrder.payout === "held", "返金テストの代金はエスクロー保留になる必要があります");
assert(engine.adminRefundOrder(engine.getUser(admin.id, admin.name), escrowRefundOrder.id).ok, "エスクロー保留中の注文を返金できる必要があります");
assert.strictEqual(engine.state.users[buyer.id].wallet, buyerWalletBeforeEscrowBuy, "返金で購入者の残高が元に戻る必要があります");
assert.strictEqual(engine.state.users[seller.id].wallet, sellerWalletBeforeEscrowBuy, "エスクロー返金で販売者の残高が変わってはいけません");
assert(escrowRefundOrder.payout === "cancelled", "返金でエスクローが取消になる必要があります");
assert(escrowRefundListing.stock === 1 && escrowRefundListing.status === "active", "返金で在庫が戻る必要があります");

const innPanel = engine.run("panel inn", actor);
assert(innPanel.panel, "二人宿パネルが必要です");
assert(innPanel.panel.components[0].items[0].command === "create-yado-vc", "二人宿はVC作成ボタンが必要です");
const innCommand = engine.run("inn", actor);
assert(innCommand.lines.some((line) => line.includes("固定パネル")), "宿コマンドは固定パネル案内が必要です");

engine.startVoiceSession(actor, "voice:test");
const voiceUser = engine.getUser(actor.id, actor.name);
voiceUser.activity.voiceJoinedAt = new Date(Date.now() - 20 * 60 * 1000).toISOString();
voiceUser.activity.voiceLastClaimAt = voiceUser.activity.voiceJoinedAt;
const vcClaim = engine.run("vc", actor);
assert(vcClaim.title === "VC報酬" || vcClaim.title === "VCランク昇格", "VC在室分を精算できる必要があります");
assert(engine.state.users[actor.id].activity.vcDailyEarned > 0, "VC日次Risが増える必要があります");

const rateActor = { id: "test:vc-rate", name: "VC倍率テスター" };
engine.run("join", rateActor);
engine.startVoiceSession(rateActor, "voice:outside");
const rateUser = engine.getUser(rateActor.id, rateActor.name);
rateUser.activity.voiceJoinedAt = new Date(Date.now() - 10 * 60 * 1000).toISOString();
rateUser.activity.voiceLastClaimAt = rateUser.activity.voiceJoinedAt;
const beforeRateWallet = rateUser.wallet;
const rateClaim = engine.finishVoiceSession(rateActor, { xpMultiplier: 0.2 });
const rateUserAfter = engine.state.users[rateActor.id];
assert(rateClaim, "VC倍率つき精算が結果を返す必要があります");
assert.strictEqual(rateUserAfter.activity.vcMinutes, 10, "VC分数は倍率で減らさない必要があります");
assert.strictEqual(rateUserAfter.activity.vcXp, 12, "VC XPだけ20%倍率を適用する必要があります");
assert.strictEqual(rateUserAfter.wallet - beforeRateWallet, 40, "VC Ris報酬は倍率で減らさない必要があります");

const invitee = { id: "test:invitee", name: "招待された人" };
const tracked = engine.recordInviteJoin(actor, invitee, { code: "abc123" });
assert(tracked?.ok, "招待を追跡できる必要があります");
engine.run("join", invitee);
assert(engine.state.users[actor.id].invites.qualified >= 1, "招待の立数が増える必要があります");
assert(engine.state.users[actor.id].invites.earned > 0, "招待報酬Risが入る必要があります");

// 招待報酬も素の値（CPI補正なし）で 900+ になるはず
const inviterAfterInvite = engine.state.users[actor.id];
assert(inviterAfterInvite.invites.earned >= 900, `招待報酬は素の900Ris以上（実際: ${inviterAfterInvite.invites.earned}）`);

// 民営出品の審査承認/却下
const highPricedListing = engine.createUserListing(sellerUser, {
  name: "高額サービス",
  type: "service",
  mode: "permanent",
  price: "60000",
  stock: "1",
  description: "審査待ちになるはずの高額サービス"
});
assert(highPricedListing.ok, "高額サービス出品ができる必要があります");
const pending = engine.state.marketplace.listings.find((l) => l.name === "高額サービス");
assert.strictEqual(pending.status, "pending", "高額サービスは審査待ちになる必要があります");
const adminUser = engine.getUser(admin.id, admin.name);
const approveResult = engine.approveListing(adminUser, pending.id);
assert(approveResult.ok, "承認が成功する必要があります");
assert.strictEqual(pending.status, "active", "承認後は active になる必要があります");

const anotherPending = engine.createUserListing(sellerUser, {
  name: "怪しい称号",
  type: "title",
  mode: "permanent",
  price: "500",
  stock: "1",
  description: "却下されるべき出品"
});
const pendingId = engine.state.marketplace.listings.find((l) => l.name === "怪しい称号").id;
const rejectResult = engine.rejectListing(adminUser, pendingId, "商品名が不適切");
assert(rejectResult.ok, "却下が成功する必要があります");
const rejected = engine.state.marketplace.listings.find((l) => l.id === pendingId);
assert.strictEqual(rejected.status, "rejected", "却下後は rejected になる必要があります");
assert.strictEqual(rejected.reviewNote, "商品名が不適切", "却下理由が記録される必要があります");

// 取引対応の運営完了 / 返金
const forRefundListing = engine.createUserListing(sellerUser, {
  name: "返金テスト用サービス",
  type: "service",
  mode: "permanent",
  price: "500",
  stock: "1",
  description: "返金テスト"
});
assert(forRefundListing.ok);
const testListing = engine.state.marketplace.listings.find((l) => l.name === "返金テスト用サービス");
engine.approveListing(adminUser, testListing.id);
const buyerBeforeRefund = engine.getUser(buyer.id, buyer.name).wallet;
const sellerBeforeRefund = engine.getUser(seller.id, seller.name).wallet;
const purchaseResult = engine.buyUserListing(engine.getUser(buyer.id, buyer.name), testListing.id);
assert(purchaseResult.ok, "サービス購入ができる必要があります");
const purchasedOrder = engine.state.marketplace.orders.find(
  (o) => o.listingId === testListing.id && o.buyerId === buyer.id
);
assert(purchasedOrder, "取引レコードが作られる必要があります");
const refundResult = engine.adminRefundOrder(adminUser, purchasedOrder.id);
assert(refundResult.ok, "運営返金が成功する必要があります");
assert.strictEqual(engine.getUser(buyer.id, buyer.name).wallet, buyerBeforeRefund, "購入者の財布が返金で元に戻る必要があります");
const buyerInventoryAfter = engine.getUser(buyer.id, buyer.name).marketplace.inventory;
assert(
  !buyerInventoryAfter.some((item) => String(item.orderId) === String(purchasedOrder.id)),
  "返金後は購入者の持ち物から該当商品が消える必要があります"
);
assert.strictEqual(purchasedOrder.status, "refunded", "取引が refunded になる必要があります");

// 給与配布: 中央発行で管理者財布は減らず、対象全員に一律で入る
const payeeA = { id: "test:payee-a", name: "受給者A" };
const payeeB = { id: "test:payee-b", name: "受給者B" };
engine.run("join", payeeA);
engine.run("join", payeeB);
const adminBefore = engine.getUser(admin.id, admin.name).wallet;
const payeeAWalletBefore = engine.getUser(payeeA.id, payeeA.name).wallet;
const salaryResult = engine.distributeSalary(engine.getUser(admin.id, admin.name), {
  entries: [
    { id: payeeA.id, name: payeeA.name },
    { id: payeeB.id, name: payeeB.name },
    { id: payeeA.id, name: payeeA.name }
  ],
  perUser: "500",
  roleLabel: "テストロール"
});
assert(salaryResult.ok, "給与配布が成功する必要があります");
assert.strictEqual(salaryResult.paid.length, 2, `重複除外後 2 人（実際: ${salaryResult.paid.length}）`);
assert.strictEqual(salaryResult.total, 1000, `合計 1000 Ris（実際: ${salaryResult.total}）`);
assert.strictEqual(engine.getUser(admin.id, admin.name).wallet, adminBefore, "管理者の財布は減らない");
assert.strictEqual(engine.getUser(payeeA.id, payeeA.name).wallet, payeeAWalletBefore + 500, "受給者Aに500 Ris入る");
const salaryInvalid = engine.distributeSalary(engine.getUser(admin.id, admin.name), { entries: [], perUser: "500" });
assert(!salaryInvalid.ok, "対象0人の配布は失敗する必要があります");

// ショップ拡張 PR3: 使うボタン / 購入者通知 / ソート / 設定 / 再提出
// 購入時に purchase 通知が buyer 宛てにも来る
const purchaseFresh = engine.createUserListing(engine.getUser(seller.id, seller.name), {
  name: "PR3 テスト用",
  type: "item",
  mode: "permanent",
  price: "400",
  stock: "1",
  description: "PR3 購入通知テスト"
});
assert(purchaseFresh.ok);
const purchaseFreshListing = engine.state.marketplace.listings.find((l) => l.name === "PR3 テスト用");
const buyRes = engine.buyUserListing(engine.getUser(buyer.id, buyer.name), purchaseFreshListing.id);
assert(buyRes.ok, "通常購入OK");
assert(buyRes.notifications.some((n) => n.event === "listing_purchased" && n.userId === buyer.id), "購入者にも通知が発火");
assert(buyRes.notifications.some((n) => n.event === "listing_sold" && n.userId === seller.id), "販売者にも通知");
const soldOrder = engine.state.marketplace.orders.find((order) => order.listingId === purchaseFreshListing.id && order.buyerId === buyer.id);
assert(soldOrder, "販売履歴に注文が残る");
assert.strictEqual(soldOrder.buyerName, buyer.name, "販売履歴に購入者名が残る");
assert.strictEqual(soldOrder.sellerDmNotifiedAt, null, "販売DM状態は未送信から始まる");
const sellerSalesPanel = engine.run("panel my-sales", seller);
assert(JSON.stringify(sellerSalesPanel.panel).includes(buyer.name), "売上画面に購入者名が出る");
const sellerSaleDetail = engine.run(`marketplace sale ${soldOrder.id}`, seller);
assert(sellerSaleDetail.panel.fields.some((field) => field.name === "購入者" && field.value === buyer.name), "販売詳細に購入者が出る");
assert(engine.state.marketplace.orders.find((order) => order.id === soldOrder.id).sellerSeenAt, "販売詳細を見ると確認済みになる");
const salesDmOff = engine.setSalesDmEnabled(engine.getUser(seller.id, seller.name), false);
assert(salesDmOff.ok, "販売DMをOFFにできる");
assert.strictEqual(engine.getUser(seller.id, seller.name).marketplace.salesDmEnabled, false, "販売DM OFFが保存される");
const salesDmOn = engine.setSalesDmEnabled(engine.getUser(seller.id, seller.name), true);
assert(salesDmOn.ok, "販売DMをONに戻せる");
assert.strictEqual(engine.getUser(seller.id, seller.name).marketplace.salesDmEnabled, true, "販売DM ONが保存される");

let boostNow = new Date("2026-07-12T00:00:00.000Z");
const boostEngine = new EconomyEngine(createInitialState(), { now: () => boostNow });
const boostAdmin = boostEngine.getUser("123456789012345678:111111111111111111", "Boost Admin");
const boostGuildId = "123456789012345678";
const boostUserId = "222222222222222222";
const boostInternalId = `${boostGuildId}:${boostUserId}`;
boostEngine.recordBoostMemberObservation({
  guildId: boostGuildId,
  discordUserId: boostUserId,
  displayName: "ブースター",
  premiumSince: "2026-07-01T00:00:00.000Z",
  active: true
});

// --- 月次一律報酬: 枠数ロール不要で自動支払い ---
const julyBoost = boostEngine.claimBoostMonthlyRewardForMember({
  guildId: boostGuildId,
  discordUserId: boostUserId,
  displayName: "ブースター",
  premiumSince: "2026-07-01T00:00:00.000Z",
  roleIds: []
});
assert(julyBoost.changed, "枠数ロールがなくても月次ブースト報酬を支払う");
assert.strictEqual(julyBoost.reward.amount, 10000, "月次一律は10,000 Ris");
const walletAfterJuly = boostEngine.getUser(boostInternalId, "ブースター").wallet;
const julyAgain = boostEngine.claimBoostMonthlyRewardForMember({
  guildId: boostGuildId,
  discordUserId: boostUserId,
  displayName: "ブースター",
  premiumSince: "2026-07-01T00:00:00.000Z",
  roleIds: []
});
assert.strictEqual(julyAgain.changed, false, "同月再送では二重付与しない");
assert.strictEqual(boostEngine.getUser(boostInternalId, "ブースター").wallet, walletAfterJuly, "同月再送で財布は増えない");
boostNow = new Date("2026-08-01T00:00:00.000Z");
const augustBoost = boostEngine.claimBoostMonthlyRewardForMember({
  guildId: boostGuildId,
  discordUserId: boostUserId,
  displayName: "ブースター",
  premiumSince: "2026-07-01T00:00:00.000Z",
  roleIds: []
});
assert(augustBoost.changed, "翌月のブースト報酬を支払う");
assert.strictEqual(augustBoost.reward.baseReward, 10000, "翌月も月次一律は10,000 Ris");
assert.strictEqual(augustBoost.reward.continuityBonus, 10000, "前月継続で10,000 Risを足す");
assert.strictEqual(augustBoost.reward.amount, 20000, "一律 + 継続は20,000 Ris");

// --- ブースト回数カウンター: 通知1件=1回・メッセージID重複防止・即時ボーナス ---
boostNow = new Date("2026-08-02T00:00:00.000Z");
const walletBeforeEvents = boostEngine.getUser(boostInternalId, "ブースター").wallet;
const boostEvent1 = boostEngine.recordBoostEvent({
  guildId: boostGuildId,
  discordUserId: boostUserId,
  messageId: "610000000000000001",
  messageType: 8,
  displayName: "ブースター",
  at: boostNow.toISOString()
});
assert(boostEvent1.ok && boostEvent1.counted, "ブースト通知を記録できる");
assert.strictEqual(boostEvent1.totalBoosts, 1, "累計1回になる");
assert.strictEqual(boostEvent1.bonusPaid, 10000, "即時ボーナス10,000 Risを支払う");
assert.strictEqual(boostEngine.getUser(boostInternalId, "ブースター").wallet, walletBeforeEvents + 10000, "即時ボーナスが財布に入る");
const boostEventDup = boostEngine.recordBoostEvent({
  guildId: boostGuildId,
  discordUserId: boostUserId,
  messageId: "610000000000000001",
  messageType: 8,
  displayName: "ブースター"
});
assert(boostEventDup.ok && !boostEventDup.counted && boostEventDup.duplicate, "同じ通知メッセージは二重加算しない");
assert.strictEqual(boostEngine.getUser(boostInternalId, "ブースター").wallet, walletBeforeEvents + 10000, "重複通知で財布は増えない");
assert(!boostEngine.recordBoostEvent({ guildId: boostGuildId, discordUserId: boostUserId, messageId: "610000000000000002", messageType: 0 }).ok,
  "ブースト以外のメッセージタイプは記録しない");

// 月あたりの即時ボーナス上限（既定3回）: 4回目はカウントのみ
boostEngine.recordBoostEvent({ guildId: boostGuildId, discordUserId: boostUserId, messageId: "610000000000000003", messageType: 9, displayName: "ブースター" });
boostEngine.recordBoostEvent({ guildId: boostGuildId, discordUserId: boostUserId, messageId: "610000000000000004", messageType: 10, displayName: "ブースター" });
const cappedEvent = boostEngine.recordBoostEvent({ guildId: boostGuildId, discordUserId: boostUserId, messageId: "610000000000000005", messageType: 11, displayName: "ブースター" });
assert(cappedEvent.counted, "上限超過でもカウント自体は成立する");
assert.strictEqual(cappedEvent.bonusPaid, 0, "月上限を超えた即時ボーナスは支払わない");
assert(cappedEvent.bonusCapped, "上限超過が結果に示される");
assert.strictEqual(cappedEvent.totalBoosts, 4, "累計は4回になる");
assert.strictEqual(boostEngine.getUser(boostInternalId, "ブースター").wallet, walletBeforeEvents + 30000, "即時ボーナスは月3回分まで");

// 翌月になれば即時ボーナスは再び支払われる
boostNow = new Date("2026-09-01T00:00:00.000Z");
const nextMonthEvent = boostEngine.recordBoostEvent({ guildId: boostGuildId, discordUserId: boostUserId, messageId: "610000000000000006", messageType: 8, displayName: "ブースター" });
assert.strictEqual(nextMonthEvent.bonusPaid, 10000, "翌月は即時ボーナスの回数がリセットされる");

// --- ブーストランキング ---
const boostUser2 = "222222222222222223";
boostEngine.recordBoostEvent({ guildId: boostGuildId, discordUserId: boostUser2, messageId: "610000000000000007", messageType: 8, displayName: "二番手" });
const boostRanking = boostEngine.run("rank boost", { id: boostAdmin.id, name: boostAdmin.name });
assert(boostRanking.title.includes("ブーストランキング"), "rank boost でブーストランキングが出る");
assert(boostRanking.lines[0].includes("ブースター") && boostRanking.lines[0].includes("5回"), "1位に累計5回のブースターが出る");
assert(boostRanking.lines.some((line) => line.includes("二番手")), "2人目もランキングに出る");

// サーバー退出者はランキングから外す（記録は保持し、復帰すれば再表示）
const savedBoostDirectory = global.__IRIS_GUILD_MEMBER_DIRECTORY__;
global.__IRIS_GUILD_MEMBER_DIRECTORY__ = {
  get(guildId) {
    // boostUser2 はサーバーに残っていて、ブースター（boostUserId）は退出した想定
    return guildId === boostGuildId ? new Map([[boostUser2, { id: boostUser2 }]]) : null;
  }
};
const leaverFiltered = boostEngine.run("rank boost", { id: boostAdmin.id, name: boostAdmin.name });
assert(!leaverFiltered.lines.some((line) => line.includes("ブースター -")), "退出した人はブーストランキングに出してはいけません");
assert(leaverFiltered.lines.some((line) => line.includes("二番手")), "在籍中の人はランキングに残る必要があります");
assert.strictEqual(boostEngine.boostCounter().users[boostInternalId].totalBoosts, 5, "退出してもブースト記録自体は消えない");
global.__IRIS_GUILD_MEMBER_DIRECTORY__ = savedBoostDirectory;
const restoredRanking = boostEngine.run("rank boost", { id: boostAdmin.id, name: boostAdmin.name });
assert(restoredRanking.lines.some((line) => line.includes("ブースター")), "ディレクトリ非対応環境ではフィルタしない（復帰時も再表示される）");

// --- 報酬額の設定変更 ---
const amountsRes = boostEngine.adminUpdateBoostRewardAmounts(boostAdmin, { instantBonus: "3000", monthlyFlatReward: "12000" });
assert(amountsRes.ok, "ブースト報酬額を変更できる");
assert.strictEqual(boostEngine.boostRewardSettings().instantBonus, 3000, "即時ボーナス額が更新される");
assert.strictEqual(boostEngine.boostRewardSettings().monthlyFlatReward, 12000, "月次一律額が更新される");
assert(!boostEngine.adminUpdateBoostRewardAmounts(boostAdmin, { instantBonus: "-1" }).ok, "不正な報酬額は拒否される");
assert(boostEngine.adminSetBoostAnnounceChannel(boostAdmin, "444444444444444444").ok, "お祝い通知チャンネルを設定できる");
assert.strictEqual(boostEngine.boostRewardSettings().announceChannelId, "444444444444444444", "通知チャンネルが保存される");

// --- 旧ブーストカウンターBotからの取り込み（即時ボーナスなし・一度きり） ---
const importEngine = new EconomyEngine(createInitialState(), { now: () => boostNow });
const importWalletBefore = importEngine.getUser(boostInternalId, "ブースター").wallet;
const importRes = importEngine.importBoostCounter({
  sourceId: "boost-counter-bot:test",
  guildId: boostGuildId,
  users: {
    [boostUserId]: { totalBoosts: 8, firstBoostAt: "2026-01-01T00:00:00.000Z", lastBoostAt: "2026-07-01T00:00:00.000Z", displayName: "ブースター" }
  },
  processedMessages: { "620000000000000001": "2026-07-01T00:00:00.000Z" }
});
assert(importRes.ok && importRes.importedBoosts === 8, "旧Botの累計を取り込める");
assert.strictEqual(importEngine.boostCounter().users[boostInternalId].totalBoosts, 8, "取り込んだ累計が保存される");
assert.strictEqual(importEngine.getUser(boostInternalId, "ブースター").wallet, importWalletBefore, "取り込みでは即時ボーナスを支払わない");
assert.strictEqual(importEngine.importBoostCounter({ sourceId: "boost-counter-bot:test", guildId: boostGuildId, users: {} }).code, "ALREADY_IMPORTED",
  "同じ取り込み元の二回目は拒否される");
assert(importEngine.recordBoostEvent({ guildId: boostGuildId, discordUserId: boostUserId, messageId: "620000000000000001", messageType: 8 }).duplicate,
  "取り込み済み通知メッセージは再カウントされない");
const importedNext = importEngine.recordBoostEvent({ guildId: boostGuildId, discordUserId: boostUserId, messageId: "620000000000000002", messageType: 8, displayName: "ブースター" });
assert.strictEqual(importedNext.totalBoosts, 9, "取り込み後の新規ブーストは累計に積み上がる");

// --- 再読み込みでカウンターが壊れない ---
const boostReload = new EconomyEngine(JSON.parse(JSON.stringify(boostEngine.state)), { now: () => boostNow });
assert.strictEqual(boostReload.boostCounter().users[boostInternalId].totalBoosts, 5, "再読み込みでも累計が維持される");
assert(JSON.stringify(boostReload.boostRewardAdminPanel(boostAdmin)).includes("即時ボーナス"), "管理パネルに新報酬設定が表示される");

// ソート: price_asc で価格昇順
const sortedAsc = engine.searchListings({ sort: "price_asc" });
for (let i = 1; i < sortedAsc.length; i++) {
  assert(sortedAsc[i].price >= sortedAsc[i - 1].price, "price_asc で昇順になる");
}
const sortedDesc = engine.searchListings({ sort: "price_desc" });
for (let i = 1; i < sortedDesc.length; i++) {
  assert(sortedDesc[i].price <= sortedDesc[i - 1].price, "price_desc で降順になる");
}

// ショップ設定変更
const settingsBefore = { ...engine.state.marketplace.settings };
const settingsUpdate = engine.updateMarketSettings(engine.getUser(admin.id, admin.name), {
  feeBps: "300",
  reviewPrice: "80000"
});
assert(settingsUpdate.ok, "ショップ設定を変更できる");
assert.strictEqual(engine.state.marketplace.settings.feeBps, 300, "手数料が更新される");
assert.strictEqual(engine.state.marketplace.settings.reviewPrice, 80000, "審査境界が更新される");
const settingsInvalid = engine.updateMarketSettings(engine.getUser(admin.id, admin.name), { feeBps: "9999" });
assert(!settingsInvalid.ok, "範囲外の手数料は失敗");
// 元に戻す
engine.updateMarketSettings(engine.getUser(admin.id, admin.name), {
  feeBps: String(settingsBefore.feeBps),
  reviewPrice: String(settingsBefore.reviewPrice)
});

// 却下商品の再提出
const rejectedListing = engine.state.marketplace.listings.find((l) => l.status === "rejected");
if (rejectedListing) {
  const resubmit = engine.resubmitListing(engine.getUser(seller.id, seller.name), rejectedListing.id, {
    description: "修正した説明"
  });
  assert(resubmit.ok, "却下商品を再提出できる");
  assert.strictEqual(rejectedListing.status, "stopped", "元 listing は stopped 化");
  assert(rejectedListing.resubmittedTo, "resubmittedTo が記録される");
  const newListing = engine.state.marketplace.listings.find((l) => l.id === rejectedListing.resubmittedTo);
  assert.strictEqual(newListing.status, "pending", "新 listing は pending");
}

// ショップ拡張 PR2: 通知イベント発火
const freshPendingResult = engine.createUserListing(engine.getUser(seller.id, seller.name), {
  name: "通知テスト用サービス",
  type: "service",
  mode: "permanent",
  price: "600",
  stock: "1",
  description: "通知テスト用"
});
assert(freshPendingResult.ok);
const freshPending = engine.state.marketplace.listings.find((l) => l.name === "通知テスト用サービス");
const approvedResult = engine.approveListing(engine.getUser(admin.id, admin.name), freshPending.id);
assert(Array.isArray(approvedResult.notifications) && approvedResult.notifications.length > 0, "承認結果に通知イベントが含まれる");
assert.strictEqual(approvedResult.notifications[0].event, "listing_approved", "listing_approved イベント");
assert.strictEqual(approvedResult.notifications[0].userId, seller.id, "販売者宛て");

// 通知ON/OFF トグル
const notifyToggle1 = engine.setNotifyEnabled(engine.getUser(actor.id, actor.name), true);
assert(notifyToggle1.ok, "通知ON トグルが成功");
assert.strictEqual(engine.getUser(actor.id, actor.name).notifyEnabled, true, "notifyEnabled が true になる");
const notifyToggle2 = engine.setNotifyEnabled(engine.getUser(actor.id, actor.name), true);
assert(!notifyToggle2.ok, "同じ状態への切り替えは失敗");

// 期限切れ処理: 期限が過去の timed order を作って expireEndedOrders で expired に
const expiredOrder = {
  id: 999999,
  listingId: "test-listing",
  itemName: "期限切れテスト",
  buyerId: buyer.id,
  buyerName: buyer.name,
  sellerId: seller.id,
  sellerName: seller.name,
  price: 100,
  fee: 5,
  mode: "timed",
  type: "item",
  manual: false,
  status: "complete",
  createdAt: new Date(Date.now() - 86400000).toISOString(),
  completedAt: new Date(Date.now() - 86400000).toISOString(),
  expiresAt: new Date(Date.now() - 3600000).toISOString()
};
engine.state.marketplace.orders.push(expiredOrder);
const buyerFresh = engine.getUser(buyer.id, buyer.name);
engine.ensureShopShape(buyerFresh).inventory.push({
  orderId: expiredOrder.id,
  name: expiredOrder.itemName,
  type: "item",
  mode: "timed",
  sellerName: seller.name,
  acquiredAt: expiredOrder.createdAt,
  expiresAt: expiredOrder.expiresAt,
  status: "complete"
});
const expireResult = engine.expireEndedOrders();
assert(expireResult.expired.some((o) => o.id === expiredOrder.id), "期限切れ order が検出される");
assert.strictEqual(expiredOrder.status, "expired", "order.status が expired");
const invItem = engine.getUser(buyer.id, buyer.name).marketplace.inventory.find((i) => i.orderId === expiredOrder.id);
assert.strictEqual(invItem?.status, "expired", "inventory エントリも expired 印");
assert(expireResult.notifications.some((n) => n.event === "listing_expired" && n.userId === buyer.id), "購入者に期限切れ通知が発火");

// ショップ拡張 PR1: 検索/店ページ/編集/再開/営業ステータス
const searchAll = engine.searchListings({});
assert(Array.isArray(searchAll), "searchListings は配列を返す必要があります");
const searchByKeyword = engine.searchListings({ keyword: "通話" });
assert(searchByKeyword.some((l) => l.name === "通話券"), "キーワード検索で通話券が見つかる");
const searchByPriceLow = engine.searchListings({ maxPrice: "100" });
assert(!searchByPriceLow.some((l) => l.name === "通話券"), "上限100Risなら500Ris商品は除外される");

// 店ページ: seller の shop-view で自分の店が見える
const shopViewResult = engine.run(`marketplace shop-view ${seller.id}`, buyer);
assert(shopViewResult.panel, "店ページパネルが取れる");
assert(shopViewResult.panel.fields.some((f) => f.value?.includes(sellerUser.name) || shopViewResult.panel.title.includes("店")), "店ページに店主表示");

// 出品編集: 価格・在庫の変更（sellerUser は毎回 fresh 取得しないと migrateUser で別オブジェクトになる）
const editableListing = engine.state.marketplace.listings.find((l) => l.sellerId === seller.id && l.status === "active");
if (editableListing) {
  const editResult = engine.editListing(engine.getUser(seller.id, seller.name), editableListing.id, { price: "700" });
  assert(editResult.ok, "自分の商品の編集ができる");
  assert.strictEqual(editableListing.price, 700, "価格が更新される");
  const editForeign = engine.editListing(engine.getUser(buyer.id, buyer.name), editableListing.id, { price: "100" });
  assert(!editForeign.ok, "他人の商品は編集できない");
}

// 停止 → 再開
const stopTarget = engine.createUserListing(engine.getUser(seller.id, seller.name), {
  name: "再開テスト用",
  type: "item",
  mode: "permanent",
  price: "300",
  stock: "1",
  description: "再開テスト用"
});
assert(stopTarget.ok);
const stopTargetListing = engine.state.marketplace.listings.find((l) => l.name === "再開テスト用");
engine.stopListing(engine.getUser(seller.id, seller.name), stopTargetListing.id);
assert.strictEqual(stopTargetListing.status, "stopped", "停止後は stopped");
const restart = engine.restartListing(engine.getUser(seller.id, seller.name), stopTargetListing.id);
assert(restart.ok, "停止済み商品を再開できる");
assert.strictEqual(stopTargetListing.status, "active", "再開後は active");

// 営業ステータス: 休業中は民営ショップから消え、購入も不可
const shopCloseResult = engine.setShopStatus(engine.getUser(seller.id, seller.name), "closed");
assert(shopCloseResult.ok, "休業中に切り替えできる");
const activeAfterClose = engine.activeListings();
assert(!activeAfterClose.some((l) => l.sellerId === seller.id), "休業中の店の商品は活性一覧から除外される");
const forbiddenBuy = engine.buyUserListing(engine.getUser(buyer.id, buyer.name), editableListing.id);
assert(!forbiddenBuy.ok, "休業中の店からは購入できない");
const reopenResult = engine.setShopStatus(engine.getUser(seller.id, seller.name), "open");
assert(reopenResult.ok, "営業を再開できる");
const activeAfterOpen = engine.activeListings();
assert(activeAfterOpen.some((l) => l.sellerId === seller.id), "再開後は商品が活性一覧に戻る");

// 招待階級とBump
const { INVITE_RANKS, BUMP_RANKS } = require("./economy");
assert(Array.isArray(INVITE_RANKS) && INVITE_RANKS.length === 6, "招待階級は6段");
assert(Array.isArray(BUMP_RANKS) && BUMP_RANKS.length === 5, "Bump階級は5段");

// 招待報酬が階級テーブル参照になっている（getUser は毎回移行コピーを返すので都度取り直す）
assert.strictEqual(engine.inviteReward(engine.getUser("test:inviter-rank", "階級テスト招待者")), 900, "0人時は900 Ris");
engine.getUser("test:inviter-rank", "階級テスト招待者").invites.qualified = 10;
assert.strictEqual(engine.inviteReward(engine.getUser("test:inviter-rank", "階級テスト招待者")), 1900, "10人時は1,900 Ris");
engine.getUser("test:inviter-rank", "階級テスト招待者").invites.qualified = 50;
assert.strictEqual(engine.inviteReward(engine.getUser("test:inviter-rank", "階級テスト招待者")), 5000, "50人時は5,000 Ris");

// 招待成立で昇格検知（2人目→3人目で 勧誘見習い→声かけ屋）
const rankInviter = { id: "test:rank-inviter", name: "昇格する招待者" };
engine.run("join", rankInviter);
engine.getUser(rankInviter.id, rankInviter.name).invites.qualified = 2;
const invitee2 = { id: "test:invitee-rankup", name: "3人目の招待され" };
engine.recordInviteJoin(rankInviter, invitee2, { code: "rankup" });
const joinRankUp = engine.run("join", invitee2);
assert(joinRankUp.inviteRankUp, "3人目成立で招待階級昇格が発生");
assert.strictEqual(joinRankUp.inviteRankUp.newRank, "声かけ屋", "新階級は声かけ屋");
assert.strictEqual(joinRankUp.inviterId, rankInviter.id, "昇格者のIDが返る");

// Bump: 報酬付与とカウント
const bumper = { id: "test:bumper", name: "宣伝係" };
engine.run("join", bumper);
const bumperWalletBefore = engine.getUser(bumper.id, bumper.name).wallet;
const bumpResult = engine.recordBump(bumper);
assert(bumpResult.ok, "bump記録が成功");
assert.strictEqual(bumpResult.reward, 500, "初回bumpは500 Ris");
assert.strictEqual(engine.getUser(bumper.id, bumper.name).wallet, bumperWalletBefore + 500, "財布に500入る");
assert.strictEqual(engine.getUser(bumper.id, bumper.name).bump.count, 1, "カウント1");

// Bump昇格: 9回→10回で 常連宣伝員
engine.getUser(bumper.id, bumper.name).bump.count = 9;
const bumpRankUpResult = engine.recordBump(bumper);
assert(bumpRankUpResult.rankUp, "10回目で昇格発生");
assert.strictEqual(bumpRankUpResult.rankUp.newRank, "常連宣伝員", "新階級は常連宣伝員");
assert.strictEqual(bumpRankUpResult.reward, 700, "昇格後の報酬単価700で支払われる");

// Bumpランキング
const bumpRanking = engine.run("rank bump", actor);
assert(bumpRanking.title === "Bumpランキング", "rank bump が動く");
assert(bumpRanking.lines.some((line) => line.includes("宣伝係")), "宣伝係がランキングに載る");

// 貢献パネル
const contribPanel = engine.run("panel invite", bumper);
assert(contribPanel.panel.title === "貢献台帳", "貢献パネルが開く");
assert(contribPanel.panel.fields.some((f) => f.name === "Bump階級"), "Bump階級フィールドがある");

// 個人残高操作: セット/加算/減算
const targetActor = { id: "test:balance", name: "残高テスト対象" };
const adminOp = engine.getUser(admin.id, admin.name);
const setResult = engine.setWallet(adminOp, targetActor, "50000", "テスト");
assert(setResult.ok, "セットが成功する必要があります");
assert.strictEqual(engine.getUser(targetActor.id, targetActor.name).wallet, 50000, "セット後の残高が正しい");
const addResult = engine.addWallet(adminOp, targetActor, "20000", "テスト加算");
assert(addResult.ok, "加算が成功する必要があります");
assert.strictEqual(engine.getUser(targetActor.id, targetActor.name).wallet, 70000, "加算後の残高が正しい");
const subResult = engine.subtractWallet(adminOp, targetActor, "30000", "テスト減算");
assert(subResult.ok, "減算が成功する必要があります");
assert.strictEqual(engine.getUser(targetActor.id, targetActor.name).wallet, 40000, "減算後の残高が正しい");
const overSub = engine.subtractWallet(adminOp, targetActor, "999999", "上限テスト");
assert(overSub.ok, "残高超え減算は成功する（上限クランプ）");
assert.strictEqual(engine.getUser(targetActor.id, targetActor.name).wallet, 0, "残高超え減算後は0");
const setInvalid = engine.setWallet(adminOp, targetActor, "-1000");
assert(!setInvalid.ok, "負の値のセットは失敗する");
const setZero = engine.setWallet(adminOp, targetActor, "0");
assert(setZero.ok, "0セットは成功する");

// ロール一括セット
const roleSet = engine.setWalletByRoleMembers(adminOp, {
  entries: [
    { id: "test:member-a", name: "メンバーA" },
    { id: "test:member-b", name: "メンバーB" },
    { id: "test:member-a", name: "メンバーA" }
  ],
  amount: "100000",
  roleLabel: "テストロール"
});
assert(roleSet.ok, "ロール一括セットが成功");
assert.strictEqual(roleSet.applied.length, 2, "重複除外後2人");
assert.strictEqual(engine.getUser("test:member-a", "メンバーA").wallet, 100000, "対象Aの残高がセットされる");
assert.strictEqual(engine.getUser("test:member-b", "メンバーB").wallet, 100000, "対象Bの残高がセットされる");

// 送金
const payer = { id: "test:payer", name: "送金者" };
const payee = { id: "test:payee", name: "受取人" };
engine.run("join", payer);
engine.run("join", payee);
const payerBefore = engine.getUser(payer.id, payer.name).wallet;
const payeeBefore = engine.getUser(payee.id, payee.name).wallet;
const transferResult = engine.transferFunds(payer, payee, "3000");
assert(transferResult.ok, "送金が成功");
assert.strictEqual(engine.getUser(payer.id, payer.name).wallet, payerBefore - 3000, "送金者の残高減");
assert.strictEqual(engine.getUser(payee.id, payee.name).wallet, payeeBefore + 3000, "受取人の残高増");
const selfTransfer = engine.transferFunds(payer, payer, "100");
assert(!selfTransfer.ok, "自分宛送金は失敗する");
const overTransfer = engine.transferFunds(payer, payee, "9999999");
assert(!overTransfer.ok, "残高超え送金は失敗する");

// カジノ関連のコマンドが未知扱いになることを確認
const casinoRemoved = engine.run("slots 50", actor);
assert(casinoRemoved.title === "未知の経済行為", `カジノコマンドは削除済み（title: ${casinoRemoved.title}）`);
const rpgRemoved = engine.run("quest task", actor);
assert(rpgRemoved.title === "未知の経済行為", `RPGコマンドは削除済み（title: ${rpgRemoved.title}）`);
const sinkRemoved = engine.run("sink 100", actor);
assert(sinkRemoved.title === "未知の経済行為", `シンクコマンドは削除済み（title: ${sinkRemoved.title}）`);
const policyRemoved = engine.run("policy", actor);
assert(policyRemoved.title === "未知の経済行為", `政策コマンドは削除済み（title: ${policyRemoved.title}）`);

// ============================================================
// 民営商店街（新方式: kind=service / flow=trade / 全件エスクロー）
// ============================================================
let tradeNow = new Date("2026-07-14T00:00:00.000Z");
const tradeEngine = new EconomyEngine(createInitialState(), { rng, now: () => tradeNow });
const tSeller = { id: "test:t-seller", name: "取引販売者" };
const tBuyer = { id: "test:t-buyer", name: "取引購入者" };
const tAdmin = { id: "test:t-admin", name: "取引運営" };
tradeEngine.run("join", tSeller);
tradeEngine.run("join", tBuyer);
tradeEngine.run("join", tAdmin);

// --- 出品: 店を事前開設しなくても出品できる / タイプ・販売方式を選ばない ---
const firstListingRes = tradeEngine.createServiceListing(tradeEngine.getUser(tSeller.id, tSeller.name), {
  name: "30分雑談します",
  description: "相談でも雑談でも。",
  price: "1000",
  category: "voice",
  limit: ""
});
assert(firstListingRes.ok, "店を開かずに出品できる必要があります");
assert(tradeEngine.state.users[tSeller.id].marketplace.shopOpened, "初出品で販売者ページが自動作成される必要があります");
const firstListing = firstListingRes.listing;
assert.strictEqual(firstListing.kind, "service", "新規出品は service kind になる必要があります");
assert(!("manual" in firstListing) || firstListing.manual === undefined, "新規出品に manual フラグを持たせない");
assert.strictEqual(firstListing.status, "pending", "初回出品はリスク審査で審査待ちになる必要があります");
assert.strictEqual(firstListing.stock, null, "空欄の受付上限は無制限（null）になる必要があります");
assert(tradeEngine.approveListing(tradeEngine.getUser(tAdmin.id, tAdmin.name), firstListing.id).ok, "初回出品を承認できる必要があります");
assert(tradeEngine.state.users[tSeller.id].marketplace.firstListingPublished, "承認で初回出品済みフラグが立つ必要があります");

const secondListingRes = tradeEngine.createServiceListing(tradeEngine.getUser(tSeller.id, tSeller.name), {
  name: "VALO教えます",
  description: "初心者歓迎",
  price: "3000",
  category: "game",
  limit: "2"
});
assert(secondListingRes.ok && secondListingRes.listing.status === "active", "2回目以降の通常出品は即公開される必要があります");
const finiteListing = secondListingRes.listing;
assert.strictEqual(finiteListing.stock, 2, "受付上限の数量指定が反映される必要があります");

// --- 購入: 全件エスクロー / 購入者だけ減る / 無制限は減らない / 有限は1減る ---
const sellerWalletBefore = tradeEngine.state.users[tSeller.id].wallet;
const buyerWalletBefore = tradeEngine.state.users[tBuyer.id].wallet;
const buyUnlimited = tradeEngine.buyServiceListing(tradeEngine.getUser(tBuyer.id, tBuyer.name), firstListing.id, { request: "初心者です。平日22時以降希望です。" });
assert(buyUnlimited.ok, "新方式の出品を購入できる必要があります");
const tradeOrder1 = buyUnlimited.order;
assert.strictEqual(tradeOrder1.flow, "trade", "新規注文は trade フローになる必要があります");
assert.strictEqual(tradeOrder1.status, "ordered", "購入直後は ordered になる必要があります");
assert.strictEqual(tradeOrder1.payout, "held", "新規民営取引は全件エスクローになる必要があります");
assert.strictEqual(tradeOrder1.request, "初心者です。平日22時以降希望です。", "依頼内容が注文に保存される必要があります");
assert.strictEqual(tradeEngine.state.users[tBuyer.id].wallet, buyerWalletBefore - 1000, "購入時に購入者のRisだけ減る必要があります");
assert.strictEqual(tradeEngine.state.users[tSeller.id].wallet, sellerWalletBefore, "販売者へ即時入金されてはいけません");
assert.strictEqual(firstListing.stock, null, "無制限受付は購入しても減ってはいけません");
assert.strictEqual((tradeEngine.state.users[tBuyer.id].marketplace.inventory || []).length, 0, "新規取引で民営持ち物に擬似アイテムを追加してはいけません");

const buyFinite = tradeEngine.buyServiceListing(tradeEngine.getUser(tBuyer.id, tBuyer.name), finiteListing.id, {});
assert(buyFinite.ok, "有限受付の出品を購入できる必要があります");
assert.strictEqual(finiteListing.stock, 1, "有限受付は購入で1減る必要があります");
const tradeOrder2 = buyFinite.order;

// --- 取引: 役割別の操作制限 ---
assert(!tradeEngine.acceptTrade(tradeEngine.getUser(tBuyer.id, tBuyer.name), tradeOrder1.id).ok, "購入者は受注できてはいけません");
assert(!tradeEngine.deliverTrade(tradeEngine.getUser(tBuyer.id, tBuyer.name), tradeOrder1.id).ok, "購入者は対応完了にできてはいけません");
assert(!tradeEngine.confirmTrade(tradeEngine.getUser(tSeller.id, tSeller.name), tradeOrder1.id).ok, "販売者は受取確認できてはいけません");
assert(tradeEngine.acceptTrade(tradeEngine.getUser(tSeller.id, tSeller.name), tradeOrder1.id).ok, "販売者は受注できる必要があります");
assert.strictEqual(tradeOrder1.status, "accepted", "受注で accepted になる必要があります");
assert(tradeEngine.deliverTrade(tradeEngine.getUser(tSeller.id, tSeller.name), tradeOrder1.id).ok, "販売者は対応完了にできる必要があります");
assert.strictEqual(tradeOrder1.status, "delivered", "対応完了で delivered になる必要があります");
assert(tradeOrder1.autoCompleteAt, "delivered で自動完了の絶対時刻が保存される必要があります");

const sellerBeforeConfirm = tradeEngine.state.users[tSeller.id].wallet;
const confirmRes = tradeEngine.confirmTrade(tradeEngine.getUser(tBuyer.id, tBuyer.name), tradeOrder1.id);
assert(confirmRes.ok && tradeOrder1.status === "completed", "購入者の受取確認で completed になる必要があります");
assert.strictEqual(tradeEngine.state.users[tSeller.id].wallet, sellerBeforeConfirm + 1000 - tradeOrder1.fee, "受取確認で手数料差引後が支払われる必要があります");
assert(!tradeEngine.confirmTrade(tradeEngine.getUser(tBuyer.id, tBuyer.name), tradeOrder1.id).ok, "受取確認は二重実行できてはいけません");
assert.strictEqual(tradeEngine.state.users[tSeller.id].wallet, sellerBeforeConfirm + 1000 - tradeOrder1.fee, "二重支払いされてはいけません");

// --- 取引画面の出し分け: 販売者に受取確認が出ない / 購入者に販売者操作が出ない ---
const sellerView = tradeEngine.tradeDetailPanel(tradeEngine.getUser(tSeller.id, tSeller.name), tradeOrder2.id);
assert(!JSON.stringify(sellerView.components).includes("trade-confirm"), "販売者に受取確認ボタンを出してはいけません");
assert(JSON.stringify(sellerView.components).includes("trade-accept"), "販売者に受注ボタンが出る必要があります");
const buyerView = tradeEngine.tradeDetailPanel(tradeEngine.getUser(tBuyer.id, tBuyer.name), tradeOrder2.id);
assert(!JSON.stringify(buyerView.components).includes("trade-accept"), "購入者に販売者用操作を出してはいけません");
assert(JSON.stringify(buyerView.components).includes("trade-cancel"), "未受注の購入者にキャンセルが出る必要があります");

// --- キャンセル・返金 ---
const buyerBeforeCancel = tradeEngine.state.users[tBuyer.id].wallet;
assert(tradeEngine.cancelTrade(tradeEngine.getUser(tBuyer.id, tBuyer.name), tradeOrder2.id).ok, "未受注なら購入者がキャンセルできる必要があります");
assert.strictEqual(tradeEngine.state.users[tBuyer.id].wallet, buyerBeforeCancel + 3000, "キャンセルで全額返金される必要があります");
assert.strictEqual(finiteListing.stock, 2, "キャンセルで有限受付数が戻る必要があります");
assert(!tradeEngine.cancelTrade(tradeEngine.getUser(tBuyer.id, tBuyer.name), tradeOrder2.id).ok, "二重キャンセルできてはいけません");
assert.strictEqual(tradeEngine.state.users[tBuyer.id].wallet, buyerBeforeCancel + 3000, "二重返金されてはいけません");

const buyDecline = tradeEngine.buyServiceListing(tradeEngine.getUser(tBuyer.id, tBuyer.name), finiteListing.id, {});
assert(buyDecline.ok, "辞退テスト用の購入ができる必要があります");
const declineOrder = buyDecline.order;
assert.strictEqual(finiteListing.stock, 1, "辞退テスト購入で受付数が減る必要があります");
assert(!tradeEngine.declineTrade(tradeEngine.getUser(tBuyer.id, tBuyer.name), declineOrder.id).ok, "購入者は辞退できてはいけません");
const buyerBeforeDecline = tradeEngine.state.users[tBuyer.id].wallet;
assert(tradeEngine.declineTrade(tradeEngine.getUser(tSeller.id, tSeller.name), declineOrder.id).ok, "販売者が辞退して全額返金できる必要があります");
assert.strictEqual(declineOrder.status, "refunded", "辞退で refunded になる必要があります");
assert.strictEqual(tradeEngine.state.users[tBuyer.id].wallet, buyerBeforeDecline + 3000, "辞退で購入者に全額返金される必要があります");
assert.strictEqual(finiteListing.stock, 2, "辞退で有限受付数が戻る必要があります");
assert(!tradeEngine.adminRefundOrder(tradeEngine.getUser(tAdmin.id, tAdmin.name), declineOrder.id).ok, "返金済み取引を運営が二重返金できてはいけません");

// --- 自動完了 ---
const buyAuto = tradeEngine.buyServiceListing(tradeEngine.getUser(tBuyer.id, tBuyer.name), firstListing.id, {});
const autoOrder = buyAuto.order;
tradeEngine.acceptTrade(tradeEngine.getUser(tSeller.id, tSeller.name), autoOrder.id);
tradeEngine.deliverTrade(tradeEngine.getUser(tSeller.id, tSeller.name), autoOrder.id);
tradeNow = new Date("2026-07-16T01:00:00.000Z"); // delivered から 49時間後: 72h前なので完了しない、24h前警告は出る
let sweep = tradeEngine.sweepTradeAutoCompletion();
assert.strictEqual(sweep.completed.length, 0, "期限前に自動完了してはいけません");
assert.strictEqual(sweep.warned.length, 1, "自動完了24時間前に購入者へ通知する必要があります");
sweep = tradeEngine.sweepTradeAutoCompletion();
assert.strictEqual(sweep.warned.length, 0, "警告は一度だけ出す必要があります");

// 再起動しても絶対時刻で判定できる（stateを保存→新エンジンで読み込み）
const rebootedEngine = new EconomyEngine(JSON.parse(JSON.stringify(tradeEngine.state)), { rng, now: () => tradeNow });
tradeNow = new Date("2026-07-17T01:05:00.000Z"); // 期限超過
const rebootSellerBefore = rebootedEngine.state.users[tSeller.id].wallet;
const rebootOrder = rebootedEngine.findTradeOrder(autoOrder.id);
let rebootSweep = rebootedEngine.sweepTradeAutoCompletion();
assert.strictEqual(rebootSweep.completed.length, 1, "再起動後も期限到達で自動完了できる必要があります");
assert.strictEqual(rebootOrder.status, "completed", "自動完了で completed になる必要があります");
assert.strictEqual(rebootedEngine.state.users[tSeller.id].wallet, rebootSellerBefore + 1000 - rebootOrder.fee, "自動完了で販売者に支払われる必要があります");
rebootSweep = rebootedEngine.sweepTradeAutoCompletion();
assert.strictEqual(rebootSweep.completed.length, 0, "sweeperを複数回実行しても二重処理されてはいけません");
assert.strictEqual(rebootedEngine.state.users[tSeller.id].wallet, rebootSellerBefore + 1000 - rebootOrder.fee, "sweeper再実行で二重支払いされてはいけません");

// reported は自動完了しない
const buyReported = tradeEngine.buyServiceListing(tradeEngine.getUser(tBuyer.id, tBuyer.name), firstListing.id, {});
const reportedOrder = buyReported.order;
tradeEngine.acceptTrade(tradeEngine.getUser(tSeller.id, tSeller.name), reportedOrder.id);
tradeEngine.deliverTrade(tradeEngine.getUser(tSeller.id, tSeller.name), reportedOrder.id);
assert(tradeEngine.reportTrade(tradeEngine.getUser(tBuyer.id, tBuyer.name), reportedOrder.id, "対応内容が違います").ok, "購入者が問題報告できる必要があります");
assert.strictEqual(reportedOrder.status, "reported", "問題報告で reported になる必要があります");
tradeNow = new Date("2026-08-01T00:00:00.000Z");
sweep = tradeEngine.sweepTradeAutoCompletion();
assert(!sweep.completed.some((order) => order.id === reportedOrder.id), "reported の取引は自動完了してはいけません");
assert.strictEqual(reportedOrder.payout, "held", "reported 中は支払いを保留し続ける必要があります");

// 運営は reported を完了にも返金にもできる
const adminRefundRes = tradeEngine.adminRefundOrder(tradeEngine.getUser(tAdmin.id, tAdmin.name), reportedOrder.id);
assert(adminRefundRes.ok && reportedOrder.status === "refunded", "運営が報告済み取引を返金できる必要があります");

// --- 出品UI: 商品タイプ・販売方式を選ばせない / 受付上限の編集 ---
const newListingPanel = tradeEngine.listingNewPanel(tradeEngine.getUser(tSeller.id, tSeller.name));
const newListingPanelJson = JSON.stringify(newListingPanel);
assert(!newListingPanelJson.includes("listing-type") && !newListingPanelJson.includes("listing-mode"), "新規出品UIに商品タイプ・販売方式を出してはいけません");
assert(newListingPanelJson.includes("listing-category"), "新規出品UIにカテゴリ選択が必要です");
assert(!newListingPanelJson.includes("在庫"), "新規出品UIに「在庫」という言葉を使ってはいけません");

const limitEditRes = tradeEngine.editListing(tradeEngine.getUser(tSeller.id, tSeller.name), finiteListing.id, { stock: "無制限" });
assert(limitEditRes.ok && finiteListing.stock === null, "受付上限を無制限に編集できる必要があります");
const limitEditBack = tradeEngine.editListing(tradeEngine.getUser(tSeller.id, tSeller.name), finiteListing.id, { stock: "5" });
assert(limitEditBack.ok && finiteListing.stock === 5, "受付上限を数量指定に戻せる必要があります");
const limitEditBad = tradeEngine.editListing(tradeEngine.getUser(tSeller.id, tSeller.name), finiteListing.id, { stock: "abc" });
assert(!limitEditBad.ok, "不正な受付上限は拒否される必要があります");

// --- 購入確認画面: エスクロー・手数料の明示 / 依頼内容モーダル導線 ---
const confirmPanelJson = JSON.stringify(tradeEngine.userListingConfirmPanel(tradeEngine.getUser(tBuyer.id, tBuyer.name), finiteListing.id));
assert(confirmPanelJson.includes("IRISが預かり") || confirmPanelJson.includes("IRIS預かり"), "購入確認にエスクローの明示が必要です");
assert(confirmPanelJson.includes("手数料"), "購入確認に手数料の扱いが必要です");
assert(confirmPanelJson.includes("trade-buy"), "新方式の購入は依頼内容モーダル経由である必要があります");

// --- 持ち物は公式専用、民営取引は自分の取引へ ---
const inventoryViewJson = JSON.stringify(tradeEngine.marketInventoryPanel(tradeEngine.getUser(tBuyer.id, tBuyer.name)));
assert(!inventoryViewJson.includes("complete-order"), "持ち物パネルに民営取引の操作を出してはいけません");
assert(inventoryViewJson.includes("my-trades"), "持ち物パネルから自分の取引へ誘導する必要があります");

// --- 出品の通報: 即削除しない・運営キューに積む ---
const reportListingRes = tradeEngine.reportListing(tradeEngine.getUser(tBuyer.id, tBuyer.name), finiteListing.id, "内容が説明と違います");
assert(reportListingRes.ok, "出品を通報できる必要があります");
assert.strictEqual(tradeEngine.state.marketplace.reports.length, 1, "通報が運営キューに積まれる必要があります");
assert.strictEqual(tradeEngine.state.marketplace.reports[0].reason, "内容が説明と違います", "通報理由が保存される必要があります");
assert.strictEqual(finiteListing.status, "active", "通報だけで出品を自動停止してはいけません");
assert(!tradeEngine.reportListing(tradeEngine.getUser(tSeller.id, tSeller.name), finiteListing.id, "自作自演").ok, "自分の出品は通報できてはいけません");

// --- 販売者退出: 新規購入停止・進行中取引は残る・再参加だけでは再開しない ---
const leaveBuy = tradeEngine.buyServiceListing(tradeEngine.getUser(tBuyer.id, tBuyer.name), finiteListing.id, {});
assert(leaveBuy.ok, "退出テスト用の購入ができる必要があります");
const leaveOrder = leaveBuy.order;
tradeEngine.pauseSellerListingsOnLeave({ id: tSeller.id });
assert(tradeEngine.state.users[tSeller.id].marketplace.leftGuildAt, "退出で leftGuildAt が記録される必要があります");
assert.strictEqual(firstListing.status, "stopped", "退出で公開中の出品が一時停止される必要があります");
assert.strictEqual(firstListing.stoppedReason, "seller_left", "退出停止の理由が記録される必要があります");
assert(!tradeEngine.buyServiceListing(tradeEngine.getUser(tBuyer.id, tBuyer.name), finiteListing.id, {}).ok, "退出した販売者の出品は購入できてはいけません");
assert.strictEqual(tradeEngine.findTradeOrder(leaveOrder.id).status, "ordered", "退出しても進行中の取引は削除されてはいけません");
assert(tradeEngine.adminRefundOrder(tradeEngine.getUser(tAdmin.id, tAdmin.name), leaveOrder.id).ok, "退出後も運営が進行中取引を返金できる必要があります");
tradeEngine.recordSellerReturn({ id: tSeller.id });
assert(!tradeEngine.state.users[tSeller.id].marketplace.leftGuildAt, "再参加で新規購入ブロックが解除される必要があります");
assert.strictEqual(firstListing.status, "stopped", "再参加だけでは出品が自動再開されてはいけません");
const restartAfterReturn = tradeEngine.restartListing(tradeEngine.getUser(tSeller.id, tSeller.name), firstListing.id);
assert(restartAfterReturn.ok && firstListing.status === "active", "本人の再開操作で出品を再公開できる必要があります");

// --- ページ送り: 25件を超えても全出品に到達できる / 範囲外ページで壊れない ---
const pagingEngine = new EconomyEngine(createInitialState(), { rng, now: () => tradeNow });
const pagingAdmin = { id: "test:pg-admin", name: "PG管理者" };
pagingEngine.run("join", pagingAdmin);
for (let i = 0; i < 6; i += 1) {
  const sellerActor = { id: `test:pg-seller-${i}`, name: `PG販売者${i}` };
  pagingEngine.run("join", sellerActor);
  for (let j = 0; j < 5; j += 1) {
    const res = pagingEngine.createServiceListing(pagingEngine.getUser(sellerActor.id, sellerActor.name), {
      name: `商品${i}-${j}`,
      description: "ページ送りテスト",
      price: String(100 + i * 10 + j),
      category: "fun",
      limit: ""
    });
    assert(res.ok, "ページ送りテスト用の出品ができる必要があります");
    if (res.listing.status === "pending") {
      assert(pagingEngine.approveListing(pagingEngine.getUser(pagingAdmin.id, pagingAdmin.name), res.listing.id).ok, "ページ送りテストの承認");
    }
  }
}
assert.strictEqual(pagingEngine.activeListings().length, 30, "30件の出品が公開されている必要があります");
const seenListingIds = new Set();
let pagingViewer = pagingEngine.getUser("test:pg-viewer", "PG閲覧者");
for (let page = 1; page <= 5; page += 1) {
  const panel = pagingEngine.userShopsPanel(pagingViewer, page);
  const json = JSON.stringify(panel.components);
  for (const m of json.matchAll(/marketplace listing (\d+)/g)) seenListingIds.add(m[1]);
}
assert(seenListingIds.size >= 30, `ページ送りで全出品に到達できる必要があります（到達 ${seenListingIds.size}件）`);
const overflowPanel = pagingEngine.userShopsPanel(pagingViewer, 99);
assert(overflowPanel.title === "IRIS商店街", "範囲外ページ指定で例外を出してはいけません");
const nanPanel = pagingEngine.userShopsPanel(pagingViewer, "abc");
assert(nanPanel.title === "IRIS商店街", "不正なページ指定で例外を出してはいけません");

// --- 通報キューの運営処理: 出品停止→再開は再審査 / 要確認販売者の出品は審査行き ---
assert(tradeEngine.restartListing(tradeEngine.getUser(tSeller.id, tSeller.name), finiteListing.id).ok, "退出停止した出品を本人が再開できる必要があります");
assert.strictEqual(finiteListing.status, "active", "通常条件の再開は即公開される必要があります");
const openReport = tradeEngine.state.marketplace.reports.find((r) => r.status === "open");
assert(openReport, "未対応の通報が存在する必要があります");
const stopResolve = tradeEngine.resolveListingReport(tradeEngine.getUser(tAdmin.id, tAdmin.name), openReport.id, "stop");
assert(stopResolve.ok && openReport.status === "resolved", "通報を出品停止で処理できる必要があります");
assert.strictEqual(finiteListing.status, "stopped", "通報処理で出品が停止される必要があります");
assert.strictEqual(finiteListing.stoppedReason, "reported", "通報停止の理由が記録される必要があります");
const restartReported = tradeEngine.restartListing(tradeEngine.getUser(tSeller.id, tSeller.name), finiteListing.id);
assert(restartReported.ok && finiteListing.status === "pending", "通報停止後の再開は審査待ちになる必要があります");
assert(!tradeEngine.resolveListingReport(tradeEngine.getUser(tAdmin.id, tAdmin.name), openReport.id, "stop").ok, "通報を二重処理できてはいけません");

const flagReportRes = tradeEngine.reportListing(tradeEngine.getUser(tBuyer.id, tBuyer.name), firstListing.id, "要確認テスト");
assert(flagReportRes.ok, "2件目の通報ができる必要があります");
const flagReport = tradeEngine.state.marketplace.reports.find((r) => r.status === "open");
assert(tradeEngine.resolveListingReport(tradeEngine.getUser(tAdmin.id, tAdmin.name), flagReport.id, "flag").ok, "販売者を要確認にできる必要があります");
assert(tradeEngine.state.users[tSeller.id].marketplace.sellerFlagged, "要確認フラグが立つ必要があります");
const flaggedListingRes = tradeEngine.createServiceListing(tradeEngine.getUser(tSeller.id, tSeller.name), {
  name: "要確認中の出品",
  description: "審査に回るはず",
  price: "500",
  category: "other",
  limit: "1"
});
assert(flaggedListingRes.ok && flaggedListingRes.listing.status === "pending", "要確認販売者の出品は審査待ちになる必要があります");
assert(tradeEngine.resolveListingReport(tradeEngine.getUser(tAdmin.id, tAdmin.name), flagReport.id, "unflag").ok, "要確認を解除できる必要があります");
assert(!tradeEngine.state.users[tSeller.id].marketplace.sellerFlagged, "要確認フラグが解除される必要があります");

// --- 商店街Forum連携（engine側の検証） ---
const FORUM_ID = "111111111111111111";
const THREAD_ID = "222222222222222222";
const sellerDiscordId = tSeller.id.split(":").pop();
// フォーラム未設定では登録できない
assert(!tradeEngine.createForumListing(tradeEngine.getUser(tSeller.id, tSeller.name), { name: "x", price: "100" }, { threadId: THREAD_ID, parentChannelId: FORUM_ID, threadOwnerId: sellerDiscordId }).ok,
  "フォーラム未設定時は販売登録できてはいけません");
tradeEngine.setMarketForumChannel(tradeEngine.getUser(tAdmin.id, tAdmin.name), FORUM_ID);
assert.strictEqual(tradeEngine.state.marketplace.settings.marketForumChannelId, FORUM_ID, "商店街フォーラムを設定できる必要があります");
// 指定Forum以外では登録しない
assert(!tradeEngine.createForumListing(tradeEngine.getUser(tSeller.id, tSeller.name), { name: "x", price: "100" }, { threadId: THREAD_ID, parentChannelId: "999999999999999999", threadOwnerId: sellerDiscordId }).ok,
  "指定Forum以外では販売登録できてはいけません");
// 投稿作成者以外は販売設定できない
assert(!tradeEngine.createForumListing(tradeEngine.getUser(tBuyer.id, tBuyer.name), { name: "x", price: "100" }, { threadId: THREAD_ID, parentChannelId: FORUM_ID, threadOwnerId: sellerDiscordId }).ok,
  "投稿作成者以外は販売設定できてはいけません");
// 投稿から登録できる
const forumListingRes = tradeEngine.createForumListing(tradeEngine.getUser(tSeller.id, tSeller.name), {
  name: "30分くらい雑談します",
  description: "相談でも雑談でも何でも。基本夜に対応できます。",
  price: "1000",
  category: "voice",
  limit: ""
}, { threadId: THREAD_ID, parentChannelId: FORUM_ID, threadOwnerId: sellerDiscordId });
assert(forumListingRes.ok, "フォーラム投稿から商品登録できる必要があります");
const forumListing = forumListingRes.listing;
assert.strictEqual(forumListing.forumThreadId, THREAD_ID, "出品にフォーラム投稿IDが記録される必要があります");
// 二重登録防止
assert(!tradeEngine.createForumListing(tradeEngine.getUser(tSeller.id, tSeller.name), { name: "x", price: "100" }, { threadId: THREAD_ID, parentChannelId: FORUM_ID, threadOwnerId: sellerDiscordId }).ok,
  "同じ投稿を二重に販売登録できてはいけません");
// /ショップ から同じ商品を購入できる
const forumBuy = tradeEngine.buyServiceListing(tradeEngine.getUser(tBuyer.id, tBuyer.name), forumListing.id, { request: "夜おねがいします" });
assert(forumBuy.ok && forumBuy.order.payout === "held", "フォーラム登録商品もショップから購入でき、エスクローになる必要があります");
// 販売パネルメッセージIDは一度だけ記録
assert(tradeEngine.recordForumPanelMessage(forumListing.id, "333333333333333333"), "販売パネルIDを記録できる必要があります");
assert(!tradeEngine.recordForumPanelMessage(forumListing.id, "444444444444444444"), "販売パネルIDを二重記録できてはいけません");
// 旧方式の投稿削除: Forum連携だけ外れ、出品・取引・Risは維持される（/ショップからの販売は継続）
const buyerWalletBeforeThreadDelete = tradeEngine.state.users[tBuyer.id].wallet;
const unlinked = tradeEngine.unlinkLegacyForumListingByThread(THREAD_ID);
assert(unlinked && unlinked.id === forumListing.id, "旧Forum投稿の削除で対象出品を特定できる必要があります");
assert.strictEqual(forumListing.forumThreadId, null, "旧Forum投稿の削除でForum連携が解除される必要があります");
assert.strictEqual(forumListing.status, "active", "旧Forum投稿が削除されても出品自体は停止されてはいけません");
assert.strictEqual(tradeEngine.state.users[tBuyer.id].wallet, buyerWalletBeforeThreadDelete, "投稿削除処理で金銭データが変わってはいけません");
assert.strictEqual(tradeEngine.findTradeOrder(forumBuy.order.id).status, "ordered", "投稿削除後も進行中取引は残る必要があります");
const afterUnlinkBuy = tradeEngine.buyServiceListing(tradeEngine.getUser(tBuyer.id, tBuyer.name), forumListing.id, {});
assert(afterUnlinkBuy.ok, "旧Forum投稿の削除後も/ショップから購入できる必要があります");
assert(tradeEngine.cancelTrade(tradeEngine.getUser(tBuyer.id, tBuyer.name), afterUnlinkBuy.order.id).ok, "検証用購入は未受注のうちにキャンセルできる必要があります");
assert.strictEqual(tradeEngine.state.users[tBuyer.id].wallet, buyerWalletBeforeThreadDelete, "検証用購入のキャンセルで残高が元に戻る必要があります");
assert.strictEqual(tradeEngine.unlinkLegacyForumListingByThread(THREAD_ID), null, "解除済みの旧Forum連携を二重処理してはいけません");
// 取引スレッドIDの二重記録防止
assert(tradeEngine.recordTradeThread(forumBuy.order.id, "555555555555555555"), "取引スレッドIDを記録できる必要があります");
assert(!tradeEngine.recordTradeThread(forumBuy.order.id, "666666666666666666"), "取引スレッドを二重作成扱いにしてはいけません");

// --- migration: 旧type/mode付き出品・旧注文があっても起動できる ---
const legacyState = JSON.parse(JSON.stringify(tradeEngine.state));
legacyState.marketplace.listings.push({
  id: 9001,
  sellerId: tSeller.id,
  sellerName: tSeller.name,
  name: "旧式アイテム",
  type: "item",
  mode: "permanent",
  price: 500,
  stock: 3,
  sold: 0,
  description: "旧仕様の出品",
  durationDays: null,
  manual: false,
  status: "active",
  createdAt: new Date().toISOString()
});
legacyState.marketplace.orders.push({
  id: 9002,
  listingId: 9001,
  itemName: "旧式アイテム",
  buyerId: tBuyer.id,
  buyerName: tBuyer.name,
  sellerId: tSeller.id,
  sellerName: tSeller.name,
  price: 500,
  fee: 25,
  mode: "permanent",
  type: "item",
  manual: false,
  payout: "paid",
  status: "complete",
  createdAt: new Date().toISOString()
});
const legacyEngine = new EconomyEngine(legacyState, { rng, now: () => tradeNow });
const legacyListing = legacyEngine.findListing(9001);
assert(legacyListing && legacyListing.type === "item" && legacyListing.kind === null, "旧type付き出品を壊さず読み込める必要があります");
assert.strictEqual(legacyListing.stock, 3, "旧出品の数値在庫が維持される必要があります");
const legacyOrder = legacyEngine.state.marketplace.orders.find((entry) => entry.id === 9002);
assert(legacyOrder && legacyOrder.status === "complete" && legacyOrder.flow === null, "旧注文を壊さず読み込める必要があります");
const legacyTradesView = legacyEngine.myTradesPanel(legacyEngine.getUser(tBuyer.id, tBuyer.name), "buy");
assert(JSON.stringify(legacyTradesView).includes("旧式アイテム"), "旧注文も自分の取引から閲覧できる必要があります");
const migratedServiceListing = legacyEngine.findListing(firstListing.id);
assert.strictEqual(migratedServiceListing.stock, null, "無制限受付が再読み込みでも維持される必要があります");

// ============================================================
// 店舗Forum（1販売者 = 1店舗投稿）と公開商店街パネル
// ============================================================

const storeNow = new Date("2026-07-15T00:00:00.000Z");
const storeEngine = new EconomyEngine(createInitialState(), { rng, now: () => storeNow });
const sAdmin = { id: "test:s-admin", name: "店舗運営" };
const sSellerA = { id: "test:s-seller-a", name: "だいたい店主" };
const sSellerB = { id: "test:s-seller-b", name: "深夜店主" };
const sBuyer = { id: "test:s-buyer", name: "店舗購入者" };
for (const actor of [sAdmin, sSellerA, sSellerB, sBuyer]) storeEngine.run("join", actor);
storeEngine.getUser(sBuyer.id, sBuyer.name).wallet = 100000;
storeEngine.setMarketForumChannel(storeEngine.getUser(sAdmin.id, sAdmin.name), "111111111111111111");

const STORE_THREAD_A = "710000000000000001";
const STORE_THREAD_B = "710000000000000002";
const userA = storeEngine.getUser(sSellerA.id, sSellerA.name);
const userB = storeEngine.getUser(sSellerB.id, sSellerB.name);

// --- 店舗投稿の紐付けは1人1つ・二重作成防止 ---
const attachA = storeEngine.attachShopForumThread(userA, STORE_THREAD_A);
assert(attachA.ok, "販売者の店舗Forum投稿を紐付けできる必要があります");
const attachAgain = storeEngine.attachShopForumThread(userA, "710000000000000009");
assert(!attachAgain.ok && attachAgain.already && attachAgain.threadId === STORE_THREAD_A,
  "同一販売者に2つ目の店舗Forum投稿を作ってはいけません");
assert.strictEqual(userA.marketplace.marketForumThreadId, STORE_THREAD_A, "店舗Forum投稿IDが上書きされてはいけません");
assert(!storeEngine.attachShopForumThread(userB, STORE_THREAD_A).ok, "他人の店舗投稿を自分の店舗にできてはいけません");
assert.strictEqual(storeEngine.sellerIdByShopForumThread(STORE_THREAD_A), sSellerA.id, "店舗投稿IDから販売者を引ける必要があります");
const attachB = storeEngine.attachShopForumThread(userB, STORE_THREAD_B);
assert(attachB.ok, "別販売者は別の店舗Forum投稿を持てる必要があります");
assert.notStrictEqual(userA.marketplace.marketForumThreadId, userB.marketplace.marketForumThreadId, "別販売者の店舗投稿は別スレッドである必要があります");

// --- 店舗パネルメッセージIDの記録 ---
assert(storeEngine.setShopForumPanelMessage(sSellerA.id, "720000000000000001"), "店舗パネルメッセージIDを記録できる必要があります");
assert(!storeEngine.setShopForumPanelMessage(sSellerA.id, "720000000000000001"), "同じ店舗パネルIDの再記録は変更なし扱いである必要があります");

// --- 出品→同一店舗に集約。出品ごとにForum投稿は増えない ---
const listA1 = storeEngine.createServiceListing(userA, { name: "Discordサーバー簡易診断", description: "だいたい見ます", price: "5000", category: "consultation", limit: "" });
assert(listA1.ok, "店舗テスト用の初出品ができる必要があります");
assert.deepStrictEqual(listA1.shopForumSync, { sellerId: sSellerA.id, ensure: true }, "初出品の結果に店舗Forum同期マーカーが必要です");
if (listA1.listing.status === "pending") storeEngine.approveListing(storeEngine.getUser(sAdmin.id, sAdmin.name), listA1.listing.id);
const listA2 = storeEngine.createServiceListing(userA, { name: "企画の壁打ち", description: "壁になります", price: "3000", category: "consultation", limit: "3" });
assert(listA2.ok && listA2.shopForumSync.sellerId === sSellerA.id, "2商品目にも店舗Forum同期マーカーが必要です");
assert.strictEqual(userA.marketplace.marketForumThreadId, STORE_THREAD_A, "2商品目を出しても店舗Forum投稿は同じである必要があります");
const listB1 = storeEngine.createServiceListing(userB, { name: "深夜相談", description: "夜だけ", price: "2000", category: "consultation", limit: "" });
assert(listB1.ok, "別販売者の出品ができる必要があります");
if (listB1.listing.status === "pending") storeEngine.approveListing(storeEngine.getUser(sAdmin.id, sAdmin.name), listB1.listing.id);

// --- 店舗Forumパネル: 複数商品をまとめて表示し、component上限を守る ---
const storePanelA = storeEngine.shopForumPanel(sSellerA.id);
const storePanelAJson = JSON.stringify(storePanelA);
assert(storePanelAJson.includes("Discordサーバー簡易診断") && storePanelAJson.includes("企画の壁打ち"), "店舗Forumパネルに複数商品が表示される必要があります");
assert(storePanelA.components.length <= 5, "店舗Forumパネルはcomponent行数上限を守る必要があります");
const storeSelect = storePanelA.components.find((row) => row.type === "select");
assert(storeSelect && storeSelect.options.length <= 25, "店舗Forumパネルの商品選択はセレクトメニューで25件以内である必要があります");
assert(storeSelect.options.some((entry) => entry.value === `run:marketplace listing ${listA1.listing.id}`), "店舗Forumパネルから商品詳細へ進める必要があります");
assert(!storePanelAJson.includes("深夜相談"), "他販売者の商品が店舗パネルに混ざってはいけません");
const storePanelB = storeEngine.shopForumPanel(sSellerB.id);
assert(JSON.stringify(storePanelB).includes("深夜相談"), "別販売者の店舗パネルには本人の商品が表示される必要があります");

// --- 出品追加・編集・価格変更・停止・再開・店舗休止で同期マーカーが付く ---
const editRes = storeEngine.editListing(userA, listA1.listing.id, { price: "5500" });
assert(editRes.ok && editRes.shopForumSync.sellerId === sSellerA.id, "価格変更の結果に店舗Forum同期マーカーが必要です");
const stopRes = storeEngine.stopListing(userA, listA2.listing.id);
assert(stopRes.ok && stopRes.shopForumSync.sellerId === sSellerA.id, "出品停止の結果に店舗Forum同期マーカーが必要です");
const restartRes = storeEngine.restartListing(userA, listA2.listing.id);
assert(restartRes.ok && restartRes.shopForumSync.sellerId === sSellerA.id, "出品再開の結果に店舗Forum同期マーカーが必要です");
const closeRes = storeEngine.setShopStatus(userA, "closed");
assert(closeRes.ok && closeRes.shopForumSync.sellerId === sSellerA.id, "店舗休止の結果に店舗Forum同期マーカーが必要です");
const reopenRes = storeEngine.setShopStatus(userA, "open");
assert(reopenRes.ok && reopenRes.shopForumSync.sellerId === sSellerA.id, "店舗再開の結果に店舗Forum同期マーカーが必要です");
const shopEditRes = storeEngine.updateShopSettings(userA, { name: "有限会社だいたい何とかする", description: "だいたい何とかします。" });
assert(shopEditRes.shopForumSync.sellerId === sSellerA.id, "店舗プロフィール更新の結果に店舗Forum同期マーカーが必要です");
assert(JSON.stringify(storeEngine.shopForumPanel(sSellerA.id)).includes("有限会社だいたい何とかする"), "店名変更が店舗パネルに反映される必要があります");

// --- Forum同期失敗はDB・取引に影響しない ---
const buyKeepRes = storeEngine.buyServiceListing(storeEngine.getUser(sBuyer.id, sBuyer.name), listA1.listing.id, { request: "お願いします" });
assert(buyKeepRes.ok && buyKeepRes.shopForumSync.sellerId === sSellerA.id, "購入の結果にも店舗Forum同期マーカーが必要です");
assert.strictEqual(buyKeepRes.order.payout, "held", "店舗Forum経由でも全件エスクローである必要があります");
// getUser はユーザーオブジェクトを差し替えるため、以降は都度 state から読み直す
const shopA = () => storeEngine.ensureShopShape(storeEngine.state.users[sSellerA.id]);
storeEngine.markShopForumSyncFailed(sSellerA.id, "テスト用の同期失敗");
assert.strictEqual(shopA().marketForumSyncStatus, "failed", "同期失敗が記録される必要があります");
assert.strictEqual(storeEngine.findTradeOrder(buyKeepRes.order.id).status, "ordered", "Forum同期失敗でも取引は成立したままである必要があります");
assert.strictEqual(storeEngine.findListing(listA1.listing.id).status, "active", "Forum同期失敗でも出品は維持される必要があります");
assert(storeEngine.markShopForumSynced(sSellerA.id), "再同期後に同期済みへ戻せる必要があります");
assert.strictEqual(shopA().marketForumSyncStatus, "synced", "再同期の状態が記録される必要があります");

// --- 店舗Forum投稿の削除: 連携解除のみ。出品・取引・Risは維持 ---
const buyerWalletBeforeDetach = storeEngine.state.users[sBuyer.id].wallet;
const detachedSellerId = storeEngine.detachShopForumThreadByThread(STORE_THREAD_A);
assert.strictEqual(detachedSellerId, sSellerA.id, "店舗投稿の削除で対象販売者を特定できる必要があります");
assert.strictEqual(shopA().marketForumThreadId, null, "店舗投稿の削除でForum連携が解除される必要があります");
assert.strictEqual(shopA().marketForumSyncStatus, "detached", "店舗投稿の削除が同期状態に記録される必要があります");
assert.strictEqual(shopA().marketForumDetachedThreadId, STORE_THREAD_A, "解除した店舗投稿IDを記録しておく必要があります");
assert.strictEqual(storeEngine.findListing(listA1.listing.id).status, "active", "店舗投稿が削除されても出品は停止されてはいけません");
assert.strictEqual(storeEngine.findTradeOrder(buyKeepRes.order.id).status, "ordered", "店舗投稿が削除されても進行中取引は維持される必要があります");
assert.strictEqual(storeEngine.state.users[sBuyer.id].wallet, buyerWalletBeforeDetach, "店舗投稿の削除でRisが変わってはいけません");
assert.strictEqual(storeEngine.detachShopForumThreadByThread(STORE_THREAD_A), null, "解除済みの店舗投稿を二重処理してはいけません");
const reattach = storeEngine.attachShopForumThread(storeEngine.getUser(sSellerA.id, sSellerA.name), "710000000000000003");
assert(reattach.ok, "店舗投稿の削除後は新しい店舗投稿を紐付けし直せる必要があります");

// --- 取引を進めて店舗の実績表示に反映される ---
assert(storeEngine.acceptTrade(storeEngine.getUser(sSellerA.id, sSellerA.name), buyKeepRes.order.id).ok, "店舗テストの受注ができる必要があります");
assert(storeEngine.deliverTrade(storeEngine.getUser(sSellerA.id, sSellerA.name), buyKeepRes.order.id).ok, "店舗テストの対応完了ができる必要があります");
assert(storeEngine.confirmTrade(storeEngine.getUser(sBuyer.id, sBuyer.name), buyKeepRes.order.id).ok, "店舗テストの受取確認ができる必要があります");
assert.strictEqual(storeEngine.shopTradeStats(sSellerA.id).completed, 1, "店舗の取引実績が集計される必要があります");
assert(JSON.stringify(storeEngine.shopForumPanel(sSellerA.id)).includes("完了 1件"), "店舗パネルに客観的な取引実績が表示される必要があります");

// --- /ショップ トップ: 人から探す / 目的から探すの2軸 ---
const marketTopJson = JSON.stringify(storeEngine.marketplacePanel(storeEngine.getUser(sBuyer.id, sBuyer.name)));
assert(marketTopJson.includes("IRIS MARKET"), "/ショップ トップはIRIS MARKETである必要があります");
assert(marketTopJson.includes("seller-directory"), "/ショップ トップに店舗一覧への導線が必要です");
assert(marketTopJson.includes("eco:shop:search-open"), "/ショップ トップに商品検索への導線が必要です");
assert(marketTopJson.includes("my-trades") && marketTopJson.includes("my-shop"), "/ショップ トップに自分の取引・自分の店が必要です");
assert(marketTopJson.includes("official-shop"), "/ショップ トップに公式ショップが必要です");

// --- 店舗一覧: 販売者単位で商品数と受付状況を表示 ---
const directoryPanel = storeEngine.sellerDirectoryPanel(storeEngine.getUser(sBuyer.id, sBuyer.name));
const directoryJson = JSON.stringify(directoryPanel);
assert(directoryJson.includes("有限会社だいたい何とかする"), "店舗一覧に店名が表示される必要があります");
assert(/\d+商品/.test(directoryJson), "店舗一覧に商品数が表示される必要があります");
assert(directoryJson.includes(`run:marketplace shop-view ${sSellerA.id}`), "店舗一覧から店舗ページを開ける必要があります");
assert(directoryJson.includes(`run:marketplace shop-view ${sSellerB.id}`), "店舗一覧に別販売者の店舗も並ぶ必要があります");
const shopViewJson = JSON.stringify(storeEngine.shopViewPanel(storeEngine.getUser(sBuyer.id, sBuyer.name), sSellerA.id));
assert(shopViewJson.includes("Discordサーバー簡易診断"), "店舗ページで販売者の全出品を見られる必要があります");

// --- 公開商店街入口パネル: 誰が見ても同じ・店舗数と新着店舗を表示 ---
const entrance1 = storeEngine.marketEntrancePanel();
const entrance2 = storeEngine.marketEntrancePanel();
assert.deepStrictEqual(entrance1, entrance2, "公開入口パネルは誰がいつ生成しても同じ内容である必要があります");
const entranceJson = JSON.stringify(entrance1);
assert(entranceJson.includes("現在の店舗数"), "公開入口パネルに店舗数が必要です");
assert(entranceJson.includes("受付中の出品"), "公開入口パネルに受付中の出品数が必要です");
assert(entranceJson.includes("新着店舗"), "公開入口パネルに新着店舗が必要です");
assert(entranceJson.includes("seller-directory") && entranceJson.includes("eco:shop:search-open") && entranceJson.includes("my-shop") && entranceJson.includes("my-trades") && entranceJson.includes("official-shop"),
  "公開入口パネルに店舗を見る/商品を探す/自分の店/自分の取引/公式ショップの導線が必要です");

// --- 新フィールドを含む状態の再読み込み（非破壊migration） ---
const storeReload = new EconomyEngine(JSON.parse(JSON.stringify(storeEngine.state)), { rng, now: () => storeNow });
const reloadedA = storeReload.state.users[sSellerA.id];
assert.strictEqual(storeReload.ensureShopShape(reloadedA).marketForumThreadId, "710000000000000003", "店舗Forum投稿IDが再読み込みでも維持される必要があります");
assert.strictEqual(storeReload.sellerIdByShopForumThread("710000000000000003"), sSellerA.id, "再読み込み後も店舗投稿から販売者を引ける必要があります");
assert(JSON.stringify(storeReload.shopForumPanel(sSellerA.id)).includes("有限会社だいたい何とかする"), "再読み込み後も店舗パネルを生成できる必要があります");

// =========================================================================
// 再発防止テスト: 返金の会計整合性 / 受取確認の状態機械 / オークション上書き通知 / 重複通報
// =========================================================================

// --- 修正1: 支払い済み注文を返金する際の会計整合性 ---
{
  function buildRefundScenario() {
    const e = new EconomyEngine(createInitialState(), { rng });
    const adminU = { id: "refund:admin", name: "返金運営" };
    const sellerU = { id: "refund:seller", name: "返金販売者" };
    const buyerU = { id: "refund:buyer", name: "返金購入者" };
    e.run("join", adminU);
    e.run("join", sellerU);
    e.run("join", buyerU);
    const listRes = e.createServiceListing(e.getUser(sellerU.id, sellerU.name), {
      name: "返金会計テスト", description: "test", price: "1000", category: "fun", limit: ""
    });
    assert(listRes.ok, "テスト前提: 返金テスト用の出品を作成できる");
    const listing = listRes.listing;
    if (listing.status === "pending") {
      assert(e.approveListing(e.getUser(adminU.id, adminU.name), listing.id).ok, "テスト前提: 出品を承認できる");
    }
    const buy = e.buyServiceListing(e.getUser(buyerU.id, buyerU.name), listing.id, {});
    assert(buy.ok, "テスト前提: 出品を購入できる");
    const order = buy.order;
    assert.strictEqual(order.fee, 50, "テスト前提: 5%手数料で fee=50 になる");
    // 支払い済みまで進める（seller.wallet += 950 が入る）
    assert(e.acceptTrade(e.getUser(sellerU.id, sellerU.name), order.id).ok);
    assert(e.deliverTrade(e.getUser(sellerU.id, sellerU.name), order.id).ok);
    assert(e.confirmTrade(e.getUser(buyerU.id, buyerU.name), order.id).ok);
    assert.strictEqual(order.status, "completed", "テスト前提: 受取確認で completed");
    assert.strictEqual(order.payout, "paid", "テスト前提: 受取確認で payout=paid");
    return { engine: e, adminU, sellerU, buyerU, order, listing };
  }

  // ケースA: 販売者が受取額 (950) 以上を持っている → 全額回収, 不足0
  {
    const { engine: e, adminU, sellerU, buyerU, order, listing } = buildRefundScenario();
    const buyerBefore = e.state.users[buyerU.id].wallet;
    const sellerBefore = e.state.users[sellerU.id].wallet;
    const inventoryBefore = e.getUser(buyerU.id, buyerU.name).marketplace.inventory.length;
    assert(sellerBefore >= 950, "テスト前提: 販売者残高が受取額以上");
    const stockBefore = listing.stock;
    const centralBefore = e.state.marketplace.centralRefundBurdenTotal || 0;
    const lifetimeLostBefore = e.state.users[sellerU.id].lifetimeLost;
    const res = e.adminRefundOrder(e.getUser(adminU.id, adminU.name), order.id);
    assert(res.ok, "支払い済み注文を通常返金できる必要があります");
    assert.strictEqual(order.status, "refunded", "返金完了で refunded になる必要があります");
    assert.strictEqual(e.state.users[buyerU.id].wallet, buyerBefore + 1000, "購入者へ商品価格が1回だけ返る必要があります");
    assert.strictEqual(order.refundRecovered, 950, "販売者残高が受取額以上なら全額回収される必要があります");
    assert.strictEqual(order.refundShortfall, 0, "全額回収時は不足額が0である必要があります");
    assert.strictEqual(e.state.users[sellerU.id].wallet, sellerBefore - 950, "販売者から受取分が引かれる必要があります");
    assert.strictEqual(e.state.marketplace.centralRefundBurdenTotal, centralBefore, "不足0のときは中央負担が増えてはいけません");
    assert.strictEqual(e.state.users[sellerU.id].lifetimeLost - lifetimeLostBefore, 950,
      "lifetimeLost には実回収額のみが加算される必要があります");
    // 在庫と purchaser inventory の巻き戻し
    assert.strictEqual(listing.sold, 0, "返金で在庫巻き戻し: sold が減る必要があります");
    if (typeof stockBefore === "number") {
      assert.strictEqual(listing.stock, stockBefore + 1, "受付枠が戻る必要があります");
    }
    assert(!e.getUser(buyerU.id, buyerU.name).marketplace.inventory.some((item) => String(item.orderId) === String(order.id)),
      "返金で購入者の持ち物から該当商品が消える必要があります");
    // 二重返金拒否
    const dbl = e.adminRefundOrder(e.getUser(adminU.id, adminU.name), order.id);
    assert(!dbl.ok, "同じ注文を2回返金してはいけません");
    assert.strictEqual(e.state.users[buyerU.id].wallet, buyerBefore + 1000, "二重返金で購入者残高が変わってはいけません");
  }

  // ケースB: 販売者が受取額未満しか持っていない → 実回収額と不足額が正しく分離される
  {
    const { engine: e, adminU, sellerU, buyerU, order } = buildRefundScenario();
    // 販売者残高を100 Risに落とす（受取分を他所に使った想定）
    e.state.users[sellerU.id].wallet = 100;
    const buyerBefore = e.state.users[buyerU.id].wallet;
    const centralBefore = e.state.marketplace.centralRefundBurdenTotal || 0;
    const lifetimeLostBefore = e.state.users[sellerU.id].lifetimeLost;
    const res = e.adminRefundOrder(e.getUser(adminU.id, adminU.name), order.id);
    assert(res.ok, "残高不足でも返金は完了する必要があります");
    assert.strictEqual(e.state.users[buyerU.id].wallet, buyerBefore + 1000, "購入者は商品価格を1回だけ全額返される必要があります");
    assert.strictEqual(e.state.users[sellerU.id].wallet, 0, "販売者残高は0まで回収される必要があります");
    assert.strictEqual(order.refundRecovered, 100, "実回収額は販売者残高分だけになる必要があります");
    assert.strictEqual(order.refundShortfall, 850, "不足額 = 受取分 - 実回収 になる必要があります");
    assert.strictEqual(e.state.marketplace.centralRefundBurdenTotal, centralBefore + 850,
      "不足額が中央負担合計に加算される必要があります");
    assert.strictEqual(e.state.users[sellerU.id].lifetimeLost - lifetimeLostBefore, 100,
      "lifetimeLost には実回収額のみが加算される必要があります（不足分を損失として記録してはいけません）");
    const burdenLog = e.state.marketplace.centralRefundBurdenLog;
    assert(Array.isArray(burdenLog) && burdenLog.length >= 1, "中央負担の詳細ログが記録される必要があります");
    const lastLog = burdenLog[burdenLog.length - 1];
    assert.strictEqual(lastLog.orderId, order.id, "中央負担ログに注文IDが記録される必要があります");
    assert.strictEqual(lastLog.shortfall, 850, "中央負担ログの不足額が一致する必要があります");
    assert.strictEqual(lastLog.recovered, 100, "中央負担ログの実回収額が一致する必要があります");
  }
}

// --- 修正2: 納品前の受取確認を禁止 ---
{
  const e = new EconomyEngine(createInitialState(), { rng });
  const adminU = { id: "confirm:admin", name: "運営" };
  const sellerU = { id: "confirm:seller", name: "販売者" };
  const buyerU = { id: "confirm:buyer", name: "購入者" };
  e.run("join", adminU);
  e.run("join", sellerU);
  e.run("join", buyerU);
  const listRes = e.createServiceListing(e.getUser(sellerU.id, sellerU.name), {
    name: "受取確認境界テスト", description: "test", price: "1000", category: "fun", limit: ""
  });
  const listing = listRes.listing;
  if (listing.status === "pending") e.approveListing(e.getUser(adminU.id, adminU.name), listing.id);
  const buy = e.buyServiceListing(e.getUser(buyerU.id, buyerU.name), listing.id, {});
  const order = buy.order;
  assert.strictEqual(order.status, "ordered", "テスト前提: 購入直後は ordered");
  // ordered で受取確認できない
  const buyerAtOrdered = e.state.users[buyerU.id].wallet;
  const sellerAtOrdered = e.state.users[sellerU.id].wallet;
  const rejOrdered = e.confirmTrade(e.getUser(buyerU.id, buyerU.name), order.id);
  assert(!rejOrdered.ok, "ordered では受取確認できてはいけません");
  assert.strictEqual(order.status, "ordered", "拒否時に status を変えてはいけません");
  assert.strictEqual(order.payout, "held", "拒否時に payout を変えてはいけません");
  assert.strictEqual(e.state.users[buyerU.id].wallet, buyerAtOrdered, "拒否時に購入者残高を変えてはいけません");
  assert.strictEqual(e.state.users[sellerU.id].wallet, sellerAtOrdered, "拒否時に販売者残高を変えてはいけません");
  // accepted で受取確認できない
  e.acceptTrade(e.getUser(sellerU.id, sellerU.name), order.id);
  assert.strictEqual(order.status, "accepted");
  const buyerAtAccepted = e.state.users[buyerU.id].wallet;
  const sellerAtAccepted = e.state.users[sellerU.id].wallet;
  const rejAccepted = e.confirmTrade(e.getUser(buyerU.id, buyerU.name), order.id);
  assert(!rejAccepted.ok, "accepted では受取確認できてはいけません");
  assert.strictEqual(order.status, "accepted", "拒否時に status を変えてはいけません");
  assert.strictEqual(order.payout, "held", "拒否時に payout を変えてはいけません");
  assert.strictEqual(e.state.users[buyerU.id].wallet, buyerAtAccepted, "拒否時に購入者残高を変えてはいけません");
  assert.strictEqual(e.state.users[sellerU.id].wallet, sellerAtAccepted, "拒否時に販売者残高を変えてはいけません");
  // delivered なら受取確認できる
  e.deliverTrade(e.getUser(sellerU.id, sellerU.name), order.id);
  assert.strictEqual(order.status, "delivered");
  const sellerBeforeConfirm = e.state.users[sellerU.id].wallet;
  const ok = e.confirmTrade(e.getUser(buyerU.id, buyerU.name), order.id);
  assert(ok.ok, "delivered では受取確認できる必要があります");
  assert.strictEqual(order.status, "completed", "受取確認で completed になる必要があります");
  assert.strictEqual(order.payout, "paid", "受取確認で payout=paid になる必要があります");
  assert.strictEqual(e.state.users[sellerU.id].wallet, sellerBeforeConfirm + 1000 - order.fee,
    "完了時に販売者へ手数料差引後の額が1回だけ支払われる必要があります");
  // 同じ注文を再度確認しても二重支払いされない
  const dbl = e.confirmTrade(e.getUser(buyerU.id, buyerU.name), order.id);
  assert(!dbl.ok, "同じ注文を再度確認できてはいけません");
  assert.strictEqual(e.state.users[sellerU.id].wallet, sellerBeforeConfirm + 1000 - order.fee, "二重支払いされてはいけません");
}

// --- 修正3: オークション上書き通知 ---
{
  const e = new EconomyEngine(createInitialState(), { rng });
  const adminU = { id: "auc:admin", name: "運営" };
  const aA = { id: "auc:A", name: "入札者A" };
  const aB = { id: "auc:B", name: "入札者B" };
  e.run("join", adminU);
  e.run("join", aA);
  e.run("join", aB);
  e.state.users[aA.id].wallet = 100000;
  e.state.users[aB.id].wallet = 100000;
  const created = e.createOfficialAuction(e.getUser(adminU.id, adminU.name), {
    name: "上書き通知テスト", type: "title", startPrice: "1000", durationMinutes: "60", description: "outbid test"
  });
  assert(created.ok, "テスト前提: 公式オークションを作成できる");
  const auction = e.state.marketplace.auctions[e.state.marketplace.auctions.length - 1];

  const bidA = e.placeAuctionBid(e.getUser(aA.id, aA.name), auction.id, "1200");
  assert(bidA.ok, "テスト前提: Aが入札できる");
  const walletAAfterBid = e.state.users[aA.id].wallet;

  // 別ユーザーBが上書き
  const bidB = e.placeAuctionBid(e.getUser(aB.id, aB.name), auction.id, "1600");
  assert(bidB.ok, "テスト前提: Bが上書き入札できる");
  // Aへ返金
  assert.strictEqual(e.state.users[aA.id].wallet, walletAAfterBid + 1200, "上書きで前入札者へ返金される必要があります");
  // outbid通知は前入札者Aへ、1件だけ
  const outbidNotifsB = (bidB.notifications || []).filter((n) => n.event === "auction_outbid");
  assert.strictEqual(outbidNotifsB.length, 1, "auction_outbid 通知が1件だけ生成される必要があります");
  assert.strictEqual(outbidNotifsB[0].userId, aA.id, "上書き通知の宛先は前入札者である必要があります");
  assert.strictEqual(outbidNotifsB[0].data.previousBid, 1200, "previousBid には旧入札額が入る必要があります");
  assert.strictEqual(outbidNotifsB[0].data.newBid, 1600, "newBid には新入札額が入る必要があります");
  assert.strictEqual(outbidNotifsB[0].data.newBidderName, aB.name, "newBidderName に新入札者が入る必要があります");

  // 同じユーザーが自分の入札額を上げても、上書き通知は出ない
  const bidBAgain = e.placeAuctionBid(e.getUser(aB.id, aB.name), auction.id, "2000");
  assert(bidBAgain.ok, "テスト前提: 同一ユーザーが額を上げられる");
  const outbidNotifsSelf = (bidBAgain.notifications || []).filter((n) => n.event === "auction_outbid");
  assert.strictEqual(outbidNotifsSelf.length, 0, "自分自身の追加入札では上書き通知が出てはいけません");

  // 即決入札: 別ユーザーが即決すると前入札者へ通知が出る
  const buyoutCreated = e.createOfficialAuction(e.getUser(adminU.id, adminU.name), {
    name: "即決通知テスト", type: "title", startPrice: "500", buyoutPrice: "3000", durationMinutes: "60", description: "buyout"
  });
  assert(buyoutCreated.ok, "テスト前提: 即決付きオークションを作成できる");
  const auction2 = e.state.marketplace.auctions[e.state.marketplace.auctions.length - 1];
  assert(e.placeAuctionBid(e.getUser(aA.id, aA.name), auction2.id, "700").ok, "テスト前提: Aが auction2 に入札できる");
  const walletABeforeBuyout = e.state.users[aA.id].wallet;
  const buyoutRes = e.placeAuctionBid(e.getUser(aB.id, aB.name), auction2.id, "3000");
  assert(buyoutRes.ok, "テスト前提: Bが即決落札できる");
  assert.strictEqual(e.state.users[aA.id].wallet, walletABeforeBuyout + 700, "即決入札でも前入札者へ返金される必要があります");
  const outbidBuyout = (buyoutRes.notifications || []).filter((n) => n.event === "auction_outbid");
  assert.strictEqual(outbidBuyout.length, 1, "即決入札でも前入札者への通知が失われてはいけません");
  assert.strictEqual(outbidBuyout[0].userId, aA.id, "即決入札の上書き通知宛先は前入札者");
  assert.strictEqual(outbidBuyout[0].data.previousBid, 700);
  assert.strictEqual(outbidBuyout[0].data.newBid, 3000);
}

// --- 修正4: 同一出品への重複通報防止 ---
{
  const e = new EconomyEngine(createInitialState(), { rng });
  const adminU = { id: "report:admin", name: "運営" };
  const sellerU = { id: "report:seller", name: "販売者" };
  const rA = { id: "report:reporterA", name: "通報者A" };
  const rB = { id: "report:reporterB", name: "通報者B" };
  e.run("join", adminU);
  e.run("join", sellerU);
  e.run("join", rA);
  e.run("join", rB);
  const listRes = e.createServiceListing(e.getUser(sellerU.id, sellerU.name), {
    name: "重複通報テスト", description: "test", price: "1000", category: "fun", limit: ""
  });
  const listing = listRes.listing;
  if (listing.status === "pending") e.approveListing(e.getUser(adminU.id, adminU.name), listing.id);

  const first = e.reportListing(e.getUser(rA.id, rA.name), listing.id, "内容が違う");
  assert(first.ok, "最初の通報は作成できる必要があります");
  const nextIdAfterFirst = e.state.marketplace.nextReportId;

  const dup = e.reportListing(e.getUser(rA.id, rA.name), listing.id, "もう一度");
  assert(!dup.ok, "同一ユーザー・同一出品の未処理重複通報は拒否される必要があります");
  assert.strictEqual(e.state.marketplace.nextReportId, nextIdAfterFirst, "拒否時に nextReportId が進んではいけません");
  assert.strictEqual(e.state.marketplace.reports.filter((r) => r.reporterId === rA.id && r.listingId === listing.id).length, 1,
    "拒否時に台帳へ新規レコードが積まれてはいけません");

  const another = e.reportListing(e.getUser(rB.id, rB.name), listing.id, "別視点");
  assert(another.ok, "別ユーザーからの通報は作成できる必要があります");

  // 既存通報が処理済み(status !== "open") になれば同一ユーザーからの再通報を許可
  const firstReport = e.state.marketplace.reports.find((r) => r.reporterId === rA.id && r.listingId === listing.id);
  firstReport.status = "resolved";
  const reReport = e.reportListing(e.getUser(rA.id, rA.name), listing.id, "また問題ありました");
  assert(reReport.ok, "既存通報が処理済みなら再通報できる必要があります");
}

console.log("スモークテスト通過。");
