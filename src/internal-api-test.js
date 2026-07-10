const assert = require("assert");
const http = require("http");
const { EconomyEngine, createInitialState } = require("./economy");
const { startInternalApi } = require("./internal-api");

function request(port, { method = "GET", path = "/", body, token = "secret-secret-secret", contentType = "application/json" } = {}) {
  return new Promise((resolve, reject) => {
    const raw = body === undefined ? null : typeof body === "string" ? body : JSON.stringify(body);
    const req = http.request({
      host: "127.0.0.1",
      port,
      method,
      path,
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(raw !== null && contentType ? { "content-type": contentType } : {}),
        ...(raw !== null ? { "content-length": Buffer.byteLength(raw) } : {})
      }
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk.toString("utf8"); });
      res.on("end", () => {
        let parsed = null;
        try {
          parsed = data ? JSON.parse(data) : null;
        } catch (error) {
          reject(error);
          return;
        }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on("error", reject);
    if (raw !== null) req.write(raw);
    req.end();
  });
}

async function main() {
  const engine = new EconomyEngine(createInitialState());
  const guildId = "123456789012345678";
  const discordUserId = "234567890123456789";
  const actor = { id: `${guildId}:${discordUserId}`, name: "Casino User" };
  engine.run("join", actor);
  const user = engine.getUser(actor.id, actor.name);
  user.wallet = 10000;
  let saveCount = 0;
  let failNextSave = false;
  const store = {
    save: () => {
      saveCount += 1;
      if (failNextSave) {
        failNextSave = false;
        throw new Error("simulated save failure");
      }
    }
  };
  const disabledServer = startInternalApi({
    engine,
    store,
    apiKey: "secret",
    host: "127.0.0.1",
    port: 0,
    logger: { info() {}, warn() {} }
  });
  assert.strictEqual(disabledServer, null, "弱い内部APIキーでは起動しない");

  const invalidGuildServer = startInternalApi({
    engine,
    store,
    apiKey: "secret-secret-secret",
    guildId: "not-a-snowflake",
    host: "127.0.0.1",
    port: 0,
    logger: { info() {}, warn() {} }
  });
  assert.strictEqual(invalidGuildServer, null, "invalid guildId disables the API");

  const blocker = http.createServer((req, res) => res.end("busy"));
  await new Promise((resolve) => blocker.listen(0, "127.0.0.1", resolve));
  const blockedPort = blocker.address().port;
  const listenWarnings = [];
  const listenErrorServer = startInternalApi({
    engine,
    store,
    apiKey: "secret-secret-secret",
    guildId,
    host: "127.0.0.1",
    port: blockedPort,
    logger: { info() {}, warn(message) { listenWarnings.push(String(message)); } }
  });
  await new Promise((resolve) => listenErrorServer.once("error", resolve));
  assert(listenWarnings.some((message) => message.includes("EADDRINUSE")), "listen errors are logged");
  assert(!listenWarnings.join("\n").includes("secret-secret-secret"), "listen error log does not include the API key");
  await new Promise((resolve) => blocker.close(resolve));

  const server = startInternalApi({
    engine,
    store,
    apiKey: "secret-secret-secret",
    host: "127.0.0.1",
    port: 0,
    maxPayoutMultiplier: 10,
    maxPayoutRis: 50000,
    minBet: 100,
    maxBet: 5000,
    guildId,
    logger: { info() {}, warn() {} }
  });

  await new Promise((resolve) => server.once("listening", resolve));
  const port = server.address().port;

  try {
    const unauthorized = await request(port, { path: `/internal/v1/wallets/${discordUserId}`, token: "bad-bad-bad-bad-bad" });
    assert.strictEqual(unauthorized.status, 401, "Bearer認証に失敗したら401");

    const wallet = await request(port, { path: `/internal/v1/wallets/${discordUserId}`, token: "secret-secret-secret" });
    assert.strictEqual(wallet.status, 200, "wallet取得が成功する");
    assert.strictEqual(wallet.body.wallet, 10000, "wallet残高が返る");

    const otherGuildUser = "345678901234567890";
    engine.run("join", { id: `345678901234567890:${otherGuildUser}`, name: "Other Guild" });
    const otherGuild = await request(port, { path: `/internal/v1/wallets/${otherGuildUser}`, token: "secret-secret-secret" });
    assert.strictEqual(otherGuild.status, 404, "別guildのユーザーは取得できない");

    const invalidDiscordUserId = await request(port, { path: "/internal/v1/wallets/not-a-snowflake", token: "secret-secret-secret" });
    assert.strictEqual(invalidDiscordUserId.status, 400, "discordUserIdはSnowflakeのみ許可する");

    const internalUserId = await request(port, { path: `/internal/v1/wallets/${guildId}:${discordUserId}`, token: "secret-secret-secret" });
    assert.strictEqual(internalUserId.status, 400, "internal userId cannot be used as discordUserId");

    const unjoinedDiscordUserId = "456789012345678901";
    engine.getUser(`${guildId}:${unjoinedDiscordUserId}`, "Unjoined User");
    const unjoined = await request(port, { path: `/internal/v1/wallets/${unjoinedDiscordUserId}`, token: "secret-secret-secret" });
    assert.strictEqual(unjoined.status, 403, "join未完了では取得できない");
    assert.strictEqual(unjoined.body.error.code, "ECONOMY_NOT_JOINED", "join未完了はECONOMY_NOT_JOINEDを返す");

    const invalidJson = await request(port, { method: "POST", path: "/internal/v1/casino/reservations", body: "{", token: "secret-secret-secret" });
    assert.strictEqual(invalidJson.status, 400, "不正JSONは400");

    const missingContentType = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: "{\"transactionId\":\"no-content-type\"}",
      token: "secret-secret-secret",
      contentType: ""
    });
    assert.strictEqual(missingContentType.status, 415, "JSON以外のContent-Typeは拒否");

    const invalidNumber = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "bad-number", discordUserId, sessionId: "s1", game: "slots", bet: -1 }
    });
    assert.strictEqual(invalidNumber.status, 400, "不正なbetは400");

    const belowMinBet = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "below-min", discordUserId, sessionId: "s-min", game: "slots", bet: 99 }
    });
    assert.strictEqual(belowMinBet.status, 400, "bet below configured minimum is rejected");
    assert.strictEqual(belowMinBet.body.error.code, "BET_OUT_OF_RANGE", "bet range error keeps its code");
    assert.strictEqual(belowMinBet.body.minBet, 100, "bet range response includes minBet");
    assert.strictEqual(belowMinBet.body.maxBet, 5000, "bet range response includes maxBet");

    const aboveMaxBet = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "above-max", discordUserId, sessionId: "s-max", game: "slots", bet: 5001 }
    });
    assert.strictEqual(aboveMaxBet.status, 400, "bet above configured maximum is rejected");

    const unsafeBet = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "unsafe-bet", discordUserId, sessionId: "s-safe", game: "slots", bet: 9007199254740992 }
    });
    assert.strictEqual(unsafeBet.status, 400, "unsafe bet is rejected");

    const otherGuildReserve = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "other-guild-reserve", discordUserId: otherGuildUser, sessionId: "s-other", game: "slots", bet: 100 }
    });
    assert.strictEqual(otherGuildReserve.status, 404, "other guild users cannot reserve through this guild API");

    const otherGuildCreatedAt = new Date().toISOString();
    engine.state.casino.transactions["tx-other-guild-reserve-existing"] = {
      transactionId: "tx-other-guild-reserve-existing",
      discordUserId: otherGuildUser,
      userId: `345678901234567890:${otherGuildUser}`,
      userName: "Other Guild",
      sessionId: "s-other",
      game: "slots",
      bet: 100,
      status: "reserved",
      payout: null,
      createdAt: otherGuildCreatedAt,
      reservedAt: otherGuildCreatedAt,
      settledAt: null,
      cancelledAt: null
    };
    const otherGuildExistingReserve = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "tx-other-guild-reserve-existing", discordUserId, sessionId: "s-other", game: "slots", bet: 100 }
    });
    assert.strictEqual(otherGuildExistingReserve.status, 404, "other guild reservation ids cannot be reused through this guild API");
    assert.strictEqual(otherGuildExistingReserve.body.error.code, "TRANSACTION_NOT_FOUND", "cross-guild reservation conflict hides transaction existence");

    engine.state.casino.transactions["tx-other-guild-settle"] = {
      transactionId: "tx-other-guild-settle",
      discordUserId: otherGuildUser,
      userId: `345678901234567890:${otherGuildUser}`,
      userName: "Other Guild",
      sessionId: "s-other",
      game: "slots",
      bet: 100,
      status: "reserved",
      payout: null,
      createdAt: otherGuildCreatedAt,
      reservedAt: otherGuildCreatedAt,
      settledAt: null,
      cancelledAt: null
    };
    const otherGuildSettle = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations/tx-other-guild-settle/settle",
      body: { payout: 100 }
    });
    assert.strictEqual(otherGuildSettle.status, 404, "other guild transactions cannot be settled");
    assert.strictEqual(otherGuildSettle.body.error.code, "TRANSACTION_NOT_FOUND", "cross-guild settle hides transaction existence");

    engine.state.casino.transactions["tx-other-guild-cancel"] = {
      transactionId: "tx-other-guild-cancel",
      discordUserId: otherGuildUser,
      userId: `345678901234567890:${otherGuildUser}`,
      userName: "Other Guild",
      sessionId: "s-other",
      game: "slots",
      bet: 100,
      status: "reserved",
      payout: null,
      createdAt: otherGuildCreatedAt,
      reservedAt: otherGuildCreatedAt,
      settledAt: null,
      cancelledAt: null
    };
    const otherGuildCancel = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations/tx-other-guild-cancel/cancel",
      body: {}
    });
    assert.strictEqual(otherGuildCancel.status, 404, "other guild transactions cannot be cancelled");
    assert.strictEqual(otherGuildCancel.body.error.code, "TRANSACTION_NOT_FOUND", "cross-guild cancel hides transaction existence");

    const reserve = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "tx-win", discordUserId, sessionId: "s1", game: "slots", bet: 1000 }
    });
    assert.strictEqual(reserve.status, 201, "予約が成功する");
    assert.strictEqual(engine.getUser(actor.id, actor.name).wallet, 9000, "予約時にbetを控除");
    assert.strictEqual(saveCount, 1, "予約時に保存");

    const duplicateReserve = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "tx-win", discordUserId, sessionId: "s1", game: "slots", bet: 1000 }
    });
    assert.strictEqual(duplicateReserve.status, 200, "同じtransactionIdの予約再送は冪等");
    assert.strictEqual(engine.getUser(actor.id, actor.name).wallet, 9000, "予約再送で二重控除しない");
    assert.strictEqual(saveCount, 1, "idempotent reservation does not write state again");

    failNextSave = true;
    const beforeSaveRetryState = JSON.parse(JSON.stringify(engine.state));
    const beforeSaveRetryWallet = engine.getUser(actor.id, actor.name).wallet;
    const saveFailedReserve = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "tx-save-retry", discordUserId, sessionId: "s-save", game: "slots", bet: 100 }
    });
    assert.strictEqual(saveFailedReserve.status, 500, "保存失敗時は500");
    assert.strictEqual(engine.getUser(actor.id, actor.name).wallet, beforeSaveRetryWallet, "save failure rolls back wallet");
    assert.strictEqual(engine.state.casino.transactions["tx-save-retry"], undefined, "save failure removes the reservation");
    assert.deepStrictEqual(engine.state, beforeSaveRetryState, "save failure restores the full state");
    assert.deepStrictEqual(engine.state.ledger, beforeSaveRetryState.ledger, "save failure rolls back ledger");
    assert.strictEqual(engine.getUser(actor.id, actor.name).lifetimeEarned, beforeSaveRetryState.users[actor.id].lifetimeEarned, "save failure rolls back lifetimeEarned");
    assert.strictEqual(engine.getUser(actor.id, actor.name).lifetimeLost, beforeSaveRetryState.users[actor.id].lifetimeLost, "save failure rolls back lifetimeLost");
    const saveRetry = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "tx-save-retry", discordUserId, sessionId: "s-save", game: "slots", bet: 100 }
    });
    assert.strictEqual(saveRetry.status, 201, "retry after save failure creates one new reservation");
    assert.strictEqual(engine.getUser(actor.id, actor.name).wallet, beforeSaveRetryWallet - 100, "retry deducts the bet once");

    await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "tx-settle-save-retry", discordUserId, sessionId: "s-settle-save", game: "slots", bet: 200 }
    });
    failNextSave = true;
    const beforeSettleSaveState = JSON.parse(JSON.stringify(engine.state));
    const beforeSettleWallet = engine.getUser(actor.id, actor.name).wallet;
    const failedSettleSave = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations/tx-settle-save-retry/settle",
      body: { payout: 300 }
    });
    assert.strictEqual(failedSettleSave.status, 500, "settle save failure returns 500");
    assert.deepStrictEqual(engine.state, beforeSettleSaveState, "settle save failure restores the full state");
    assert.strictEqual(engine.getUser(actor.id, actor.name).wallet, beforeSettleWallet, "settle save failure rolls back wallet");
    assert.strictEqual(engine.state.casino.transactions["tx-settle-save-retry"].status, "reserved", "settle save failure rolls back transaction status");
    assert.strictEqual(engine.state.casino.transactions["tx-settle-save-retry"].payout, null, "settle save failure rolls back payout");
    assert.strictEqual(engine.state.casino.transactions["tx-settle-save-retry"].settledAt, null, "settle save failure rolls back settledAt");
    assert.deepStrictEqual(engine.state.ledger, beforeSettleSaveState.ledger, "settle save failure rolls back ledger");
    assert.strictEqual(engine.getUser(actor.id, actor.name).lifetimeEarned, beforeSettleSaveState.users[actor.id].lifetimeEarned, "settle save failure rolls back lifetimeEarned");
    assert.strictEqual(engine.getUser(actor.id, actor.name).lifetimeLost, beforeSettleSaveState.users[actor.id].lifetimeLost, "settle save failure rolls back lifetimeLost");
    const settleRetry = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations/tx-settle-save-retry/settle",
      body: { payout: 300 }
    });
    assert.strictEqual(settleRetry.status, 200, "settle retry after save failure succeeds once");
    assert.strictEqual(engine.getUser(actor.id, actor.name).wallet, beforeSettleWallet + 300, "settle retry pays out once");
    const settleRetryAgain = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations/tx-settle-save-retry/settle",
      body: { payout: 300 }
    });
    assert.strictEqual(settleRetryAgain.status, 200, "settle retry is idempotent");
    assert.strictEqual(engine.getUser(actor.id, actor.name).wallet, beforeSettleWallet + 300, "settle retry is not double paid");

    await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "tx-cancel-save-retry", discordUserId, sessionId: "s-cancel-save", game: "slots", bet: 200 }
    });
    failNextSave = true;
    const beforeCancelSaveState = JSON.parse(JSON.stringify(engine.state));
    const beforeCancelWallet = engine.getUser(actor.id, actor.name).wallet;
    const failedCancelSave = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations/tx-cancel-save-retry/cancel",
      body: {}
    });
    assert.strictEqual(failedCancelSave.status, 500, "cancel save failure returns 500");
    assert.deepStrictEqual(engine.state, beforeCancelSaveState, "cancel save failure restores the full state");
    assert.strictEqual(engine.getUser(actor.id, actor.name).wallet, beforeCancelWallet, "cancel save failure rolls back wallet");
    assert.strictEqual(engine.state.casino.transactions["tx-cancel-save-retry"].status, "reserved", "cancel save failure rolls back transaction status");
    assert.strictEqual(engine.state.casino.transactions["tx-cancel-save-retry"].cancelledAt, null, "cancel save failure rolls back cancelledAt");
    assert.deepStrictEqual(engine.state.ledger, beforeCancelSaveState.ledger, "cancel save failure rolls back ledger");
    assert.strictEqual(engine.getUser(actor.id, actor.name).lifetimeEarned, beforeCancelSaveState.users[actor.id].lifetimeEarned, "cancel save failure rolls back lifetimeEarned");
    assert.strictEqual(engine.getUser(actor.id, actor.name).lifetimeLost, beforeCancelSaveState.users[actor.id].lifetimeLost, "cancel save failure rolls back lifetimeLost");
    const cancelRetryAfterSaveFailure = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations/tx-cancel-save-retry/cancel",
      body: {}
    });
    assert.strictEqual(cancelRetryAfterSaveFailure.status, 200, "cancel retry after save failure succeeds once");
    assert.strictEqual(engine.getUser(actor.id, actor.name).wallet, beforeCancelWallet + 200, "cancel retry refunds once");
    const cancelRetryAgainAfterSaveFailure = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations/tx-cancel-save-retry/cancel",
      body: {}
    });
    assert.strictEqual(cancelRetryAgainAfterSaveFailure.status, 200, "cancel retry is idempotent");
    assert.strictEqual(engine.getUser(actor.id, actor.name).wallet, beforeCancelWallet + 200, "cancel retry is not double refunded");

    const unsafePayout = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations/tx-win/settle",
      body: { payout: 9007199254740992 }
    });
    assert.strictEqual(unsafePayout.status, 400, "unsafe payout is rejected");

    const beforeWinSettle = engine.getUser(actor.id, actor.name).wallet;
    const settle = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations/tx-win/settle",
      body: { payout: 2500 }
    });
    assert.strictEqual(settle.status, 200, "精算が成功する");
    assert.strictEqual(engine.getUser(actor.id, actor.name).wallet, beforeWinSettle + 2500, "payoutは賭け金込みの返却総額");

    const duplicateSettle = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations/tx-win/settle",
      body: { payout: 2500 }
    });
    assert.strictEqual(duplicateSettle.status, 200, "同じ精算再送は冪等");
    assert.strictEqual(engine.getUser(actor.id, actor.name).wallet, beforeWinSettle + 2500, "精算再送で二重加算しない");

    const cancelAfterSettle = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations/tx-win/cancel",
      body: {}
    });
    assert.strictEqual(cancelAfterSettle.status, 409, "精算後取消は拒否");

    await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "tx-lose", discordUserId, sessionId: "s2", game: "blackjack", bet: 500 }
    });
    const lose = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations/tx-lose/settle",
      body: { payout: 0 }
    });
    assert.strictEqual(lose.status, 200, "敗北時payout 0を許可");

    await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "tx-draw", discordUserId, sessionId: "s3", game: "blackjack", bet: 700 }
    });
    const beforeDrawSettle = engine.getUser(actor.id, actor.name).wallet;
    const draw = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations/tx-draw/settle",
      body: { payout: 700 }
    });
    assert.strictEqual(draw.status, 200, "引き分け精算が成功");
    assert.strictEqual(engine.getUser(actor.id, actor.name).wallet, beforeDrawSettle + 700, "引き分けはbet相当を返却");

    await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "tx-cancel", discordUserId, sessionId: "s4", game: "roulette", bet: 300 }
    });
    const beforeCancel = engine.getUser(actor.id, actor.name).wallet;
    const cancel = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations/tx-cancel/cancel",
      body: {}
    });
    assert.strictEqual(cancel.status, 200, "取消が成功");
    assert.strictEqual(engine.getUser(actor.id, actor.name).wallet, beforeCancel + 300, "取消はbetを返金");
    const cancelAgain = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations/tx-cancel/cancel",
      body: {}
    });
    assert.strictEqual(cancelAgain.status, 200, "二重取消は冪等");
    assert.strictEqual(engine.getUser(actor.id, actor.name).wallet, beforeCancel + 300, "二重返金しない");
    const settleAfterCancel = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations/tx-cancel/settle",
      body: { payout: 300 }
    });
    assert.strictEqual(settleAfterCancel.status, 409, "取消後精算は拒否");

    engine.getUser(actor.id, actor.name).wallet = 100;
    const insufficient = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "tx-rich", discordUserId, sessionId: "s5", game: "slots", bet: 5000 }
    });
    assert.strictEqual(insufficient.status, 409, "残高不足は拒否");

    await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "tx-cap", discordUserId, sessionId: "s6", game: "slots", bet: 100 }
    });
    const tooLarge = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations/tx-cap/settle",
      body: { payout: 1001 }
    });
    assert.strictEqual(tooLarge.status, 400, "high payout is rejected");
    const overflowUserId = "567890123456789012";
    const overflowActor = { id: `${guildId}:${overflowUserId}`, name: "Overflow User" };
    engine.run("join", overflowActor);
    engine.getUser(overflowActor.id, overflowActor.name).wallet = Number.MAX_SAFE_INTEGER - 50;
    const overflowCreatedAt = new Date().toISOString();
    engine.state.casino.transactions["tx-wallet-overflow"] = {
      transactionId: "tx-wallet-overflow",
      discordUserId: overflowUserId,
      userId: overflowActor.id,
      userName: overflowActor.name,
      sessionId: "s-overflow",
      game: "slots",
      bet: 100,
      status: "reserved",
      payout: null,
      createdAt: overflowCreatedAt,
      reservedAt: overflowCreatedAt,
      settledAt: null,
      cancelledAt: null
    };
    const beforeWalletOverflowState = JSON.parse(JSON.stringify(engine.state));
    const walletOverflow = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations/tx-wallet-overflow/settle",
      body: { payout: 100 }
    });
    assert.strictEqual(walletOverflow.status, 409, "wallet overflow is rejected");
    assert.strictEqual(walletOverflow.body.error.code, "WALLET_OVERFLOW", "wallet overflow has a clear code");
    assert.deepStrictEqual(engine.state, beforeWalletOverflowState, "wallet overflow does not mutate state");

    const earnedOverflowUserId = "678901234567890123";
    const earnedOverflowActor = { id: `${guildId}:${earnedOverflowUserId}`, name: "Earned Overflow User" };
    engine.run("join", earnedOverflowActor);
    const earnedOverflowUser = engine.getUser(earnedOverflowActor.id, earnedOverflowActor.name);
    earnedOverflowUser.wallet = 1000;
    earnedOverflowUser.lifetimeEarned = Number.MAX_SAFE_INTEGER - 10;
    engine.state.casino.transactions["tx-earned-overflow"] = {
      transactionId: "tx-earned-overflow",
      discordUserId: earnedOverflowUserId,
      userId: earnedOverflowActor.id,
      userName: earnedOverflowActor.name,
      sessionId: "s-earned-overflow",
      game: "slots",
      bet: 100,
      status: "reserved",
      payout: null,
      createdAt: overflowCreatedAt,
      reservedAt: overflowCreatedAt,
      settledAt: null,
      cancelledAt: null
    };
    const beforeEarnedOverflowState = JSON.parse(JSON.stringify(engine.state));
    const earnedOverflow = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations/tx-earned-overflow/settle",
      body: { payout: 200 }
    });
    assert.strictEqual(earnedOverflow.status, 409, "lifetimeEarned overflow is rejected");
    assert.strictEqual(earnedOverflow.body.error.code, "LIFETIME_TOTAL_OVERFLOW", "lifetime overflow has a clear code");
    assert.deepStrictEqual(engine.state, beforeEarnedOverflowState, "lifetimeEarned overflow does not mutate state");

    const lostOverflowUserId = "789012345678901234";
    const lostOverflowActor = { id: `${guildId}:${lostOverflowUserId}`, name: "Lost Overflow User" };
    engine.run("join", lostOverflowActor);
    const lostOverflowUser = engine.getUser(lostOverflowActor.id, lostOverflowActor.name);
    lostOverflowUser.wallet = 1000;
    lostOverflowUser.lifetimeLost = Number.MAX_SAFE_INTEGER - 10;
    engine.state.casino.transactions["tx-lost-overflow"] = {
      transactionId: "tx-lost-overflow",
      discordUserId: lostOverflowUserId,
      userId: lostOverflowActor.id,
      userName: lostOverflowActor.name,
      sessionId: "s-lost-overflow",
      game: "slots",
      bet: 100,
      status: "reserved",
      payout: null,
      createdAt: overflowCreatedAt,
      reservedAt: overflowCreatedAt,
      settledAt: null,
      cancelledAt: null
    };
    const beforeLostOverflowState = JSON.parse(JSON.stringify(engine.state));
    const lostOverflow = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations/tx-lost-overflow/settle",
      body: { payout: 0 }
    });
    assert.strictEqual(lostOverflow.status, 409, "lifetimeLost overflow is rejected");
    assert.strictEqual(lostOverflow.body.error.code, "LIFETIME_TOTAL_OVERFLOW", "lifetime lost overflow has a clear code");
    assert.deepStrictEqual(engine.state, beforeLostOverflowState, "lifetimeLost overflow does not mutate state");

    const unsafeWalletUserId = "890123456789012345";
    const unsafeWalletActor = { id: `${guildId}:${unsafeWalletUserId}`, name: "Unsafe Wallet User" };
    engine.run("join", unsafeWalletActor);
    engine.getUser(unsafeWalletActor.id, unsafeWalletActor.name).wallet = Number.MAX_SAFE_INTEGER + 1;
    const beforeUnsafeWalletState = JSON.parse(JSON.stringify(engine.state));
    const unsafeWalletReserve = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "tx-unsafe-wallet-reserve", discordUserId: unsafeWalletUserId, sessionId: "s-unsafe-wallet", game: "slots", bet: 100 }
    });
    assert.strictEqual(unsafeWalletReserve.status, 409, "unsafe wallet state rejects reservation");
    assert.strictEqual(unsafeWalletReserve.body.error.code, "INVALID_WALLET_STATE", "unsafe wallet state has a clear code");
    assert.deepStrictEqual(engine.state, beforeUnsafeWalletState, "unsafe wallet reservation does not mutate state");
    assert(engine.state.ledger.some((entry) => entry.type === "casino_reserve"), "casino_reserve が台帳に残る");
    assert(engine.state.ledger.some((entry) => entry.type === "casino_settle"), "casino_settle が台帳に残る");
    assert(engine.state.ledger.some((entry) => entry.type === "casino_cancel"), "casino_cancel が台帳に残る");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

main()
  .then(() => {
    console.log("内部APIテスト通過。");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
