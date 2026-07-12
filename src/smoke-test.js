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
assert(marketPanel.panel.fields.some((field) => field.name === "今日のおすすめ"), "ショップホームにおすすめ枠が必要です");

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
  description: "購入後、運営がロール付与を確認します。"
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
const officialProduct = engine.run("marketplace product official:vip-pass", actor);
assert(JSON.stringify(officialProduct.panel).includes("marketplace confirm official:vip-pass"), "追加公式商品の購入確認導線が必要です");
const officialConfirm = engine.run("marketplace confirm official:vip-pass", actor);
assert(JSON.stringify(officialConfirm.panel).includes("VIPパス30日"), "追加公式商品の確認画面が必要です");
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

const freshEngine = new EconomyEngine(createInitialState(), { rng });
const freshActor = { id: "test:fresh", name: "新規参加者" };
const joinResult = freshEngine.run("join", freshActor);
assert(joinResult.ok, "join が成功する必要があります");
const freshUser = freshEngine.state.users[freshActor.id];
assert.strictEqual(freshUser.wallet, 100000, `初期配布は素の10万Ris（実際: ${freshUser.wallet}）`);

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
const tier1Role = "333333333333333331";
const tier2Role = "333333333333333332";
const tier3Role = "333333333333333333";
assert(boostEngine.adminSetBoostRewardRole(boostAdmin, "tier1", tier1Role).ok, "1枠ロールを設定できる");
assert(boostEngine.adminSetBoostRewardRole(boostAdmin, "tier2", tier2Role).ok, "2枠ロールを設定できる");
assert(boostEngine.adminSetBoostRewardRole(boostAdmin, "tier3", tier3Role).ok, "3枠ロールを設定できる");
boostEngine.recordBoostMemberObservation({
  guildId: boostGuildId,
  discordUserId: boostUserId,
  displayName: "ブースター",
  premiumSince: "2026-07-01T00:00:00.000Z",
  active: true
});
const noTierBoost = boostEngine.claimBoostMonthlyRewardForMember({
  guildId: boostGuildId,
  discordUserId: boostUserId,
  displayName: "ブースター",
  premiumSince: "2026-07-01T00:00:00.000Z",
  roleIds: []
});
assert.strictEqual(noTierBoost.changed, false, "枠数ロールがない場合は支払わない");
assert.strictEqual(noTierBoost.code, "BOOST_TIER_UNSET", "枠数未設定として扱う");
const julyBoost = boostEngine.claimBoostMonthlyRewardForMember({
  guildId: boostGuildId,
  discordUserId: boostUserId,
  displayName: "ブースター",
  premiumSince: "2026-07-01T00:00:00.000Z",
  roleIds: [tier2Role]
});
assert(julyBoost.changed, "初回月次ブースト報酬を支払う");
assert.strictEqual(julyBoost.reward.amount, 20000, "2枠は20,000 Ris");
const walletAfterJuly = boostEngine.getUser(`${boostGuildId}:${boostUserId}`, "ブースター").wallet;
const julyAgain = boostEngine.claimBoostMonthlyRewardForMember({
  guildId: boostGuildId,
  discordUserId: boostUserId,
  displayName: "ブースター",
  premiumSince: "2026-07-01T00:00:00.000Z",
  roleIds: [tier2Role]
});
assert.strictEqual(julyAgain.changed, false, "同月再送では二重付与しない");
assert.strictEqual(boostEngine.getUser(`${boostGuildId}:${boostUserId}`, "ブースター").wallet, walletAfterJuly, "同月再送で財布は増えない");
boostNow = new Date("2026-08-01T00:00:00.000Z");
const augustBoost = boostEngine.claimBoostMonthlyRewardForMember({
  guildId: boostGuildId,
  discordUserId: boostUserId,
  displayName: "ブースター",
  premiumSince: "2026-07-01T00:00:00.000Z",
  roleIds: [tier3Role]
});
assert(augustBoost.changed, "翌月のブースト報酬を支払う");
assert.strictEqual(augustBoost.reward.baseReward, 30000, "3枠以上は30,000 Ris");
assert.strictEqual(augustBoost.reward.continuityBonus, 10000, "前月継続で10,000 Risを足す");
assert.strictEqual(augustBoost.reward.amount, 40000, "3枠以上 + 継続は40,000 Ris");

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

console.log("スモークテスト通過。");
