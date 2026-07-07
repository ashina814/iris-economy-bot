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
assert(user.inventory.frame >= 1, "公式ショップでカード枠を購入できる必要があります");

const card = engine.run("card", actor);
assert(card.card, "カードコマンドにDiscordカード情報が必要です");
assert(card.lines.some((line) => line.includes("カード")), "カードコマンドにCLIカード表示が必要です");

const marketPanel = engine.run("panel marketplace", actor);
assert(marketPanel.panel, "マーケットパネルが必要です");
assert(marketPanel.panel.components.length > 0, "マーケットパネルに操作部品が必要です");

// 初期資本が CPI 補正なしで素の 100,000 Ris になっていることを確認
const freshEngine = new EconomyEngine(createInitialState(), { rng });
const freshActor = { id: "test:fresh", name: "新規参加者" };
const joinResult = freshEngine.run("join", freshActor);
assert(joinResult.ok, "join が成功する必要があります");
const freshUser = freshEngine.state.users[freshActor.id];
assert.strictEqual(freshUser.wallet, 100000, `初期配布は素の10万Ris（実際: ${freshUser.wallet}）`);

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
const buyListing = engine.run(`marketplace listing-buy ${listing.id}`, buyer);
assert(buyListing.ok, "民営商品を購入できる必要があります");
assert(engine.getUser(buyer.id, buyer.name).marketplace.inventory.length === 1, "購入品が持ち物に入る必要があります");
assert(engine.getUser(seller.id, seller.name).marketplace.sales > 0, "販売者の売上が増える必要があります");

// ロール出品は自動判定ではなく手動対応になるはず
const roleListingResult = engine.createUserListing(sellerUser, {
  name: "限定ロール",
  type: "role",
  mode: "permanent",
  price: "800",
  stock: "1",
  description: "運営が付与するロール"
});
assert(roleListingResult.ok, "ロール出品ができる必要があります");
const roleListing = engine.state.marketplace.listings.find((entry) => entry.name === "限定ロール");
assert(roleListing.manual === true, "ロール出品は manual=true になる必要があります");

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
