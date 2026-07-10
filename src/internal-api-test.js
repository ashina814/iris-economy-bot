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
  const actor = { id: "guild:casino-user", name: "Casino User" };
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

  const server = startInternalApi({
    engine,
    store,
    apiKey: "secret-secret-secret",
    host: "127.0.0.1",
    port: 0,
    maxPayoutMultiplier: 10,
    maxPayoutRis: 50000,
    logger: { info() {}, warn() {} }
  });

  await new Promise((resolve) => server.once("listening", resolve));
  const port = server.address().port;

  try {
    const unauthorized = await request(port, { path: "/internal/v1/wallets/casino-user", token: "bad-bad-bad-bad-bad" });
    assert.strictEqual(unauthorized.status, 401, "Bearer認証に失敗したら401");

    const wallet = await request(port, { path: "/internal/v1/wallets/casino-user", token: "secret-secret-secret" });
    assert.strictEqual(wallet.status, 200, "wallet取得が成功する");
    assert.strictEqual(wallet.body.wallet, 10000, "wallet残高が返る");

    engine.run("join", { id: "guild-a:dupe-user", name: "Dupe A" });
    engine.run("join", { id: "guild-b:dupe-user", name: "Dupe B" });
    const ambiguous = await request(port, { path: "/internal/v1/wallets/dupe-user", token: "secret-secret-secret" });
    assert.strictEqual(ambiguous.status, 409, "複数候補に一致するdiscordUserIdは拒否");

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
      body: { transactionId: "bad-number", discordUserId: "casino-user", sessionId: "s1", game: "slots", bet: -1 }
    });
    assert.strictEqual(invalidNumber.status, 400, "不正なbetは400");

    const reserve = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "tx-win", discordUserId: "casino-user", sessionId: "s1", game: "slots", bet: 1000 }
    });
    assert.strictEqual(reserve.status, 201, "予約が成功する");
    assert.strictEqual(engine.getUser(actor.id, actor.name).wallet, 9000, "予約時にbetを控除");
    assert.strictEqual(saveCount, 1, "予約時に保存");

    const duplicateReserve = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "tx-win", discordUserId: "casino-user", sessionId: "s1", game: "slots", bet: 1000 }
    });
    assert.strictEqual(duplicateReserve.status, 200, "同じtransactionIdの予約再送は冪等");
    assert.strictEqual(engine.getUser(actor.id, actor.name).wallet, 9000, "予約再送で二重控除しない");
    assert.strictEqual(saveCount, 2, "冪等予約も保存を再試行する");

    failNextSave = true;
    const beforeSaveRetryWallet = engine.getUser(actor.id, actor.name).wallet;
    const saveFailedReserve = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "tx-save-retry", discordUserId: "casino-user", sessionId: "s-save", game: "slots", bet: 100 }
    });
    assert.strictEqual(saveFailedReserve.status, 500, "保存失敗時は500");
    assert.strictEqual(engine.getUser(actor.id, actor.name).wallet, beforeSaveRetryWallet - 100, "保存失敗後もメモリ上の予約は一度だけ反映");
    const saveRetry = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "tx-save-retry", discordUserId: "casino-user", sessionId: "s-save", game: "slots", bet: 100 }
    });
    assert.strictEqual(saveRetry.status, 200, "保存失敗後の予約再送は冪等成功");
    assert.strictEqual(engine.getUser(actor.id, actor.name).wallet, beforeSaveRetryWallet - 100, "保存失敗後の再送で二重控除しない");

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
      body: { transactionId: "tx-lose", discordUserId: "casino-user", sessionId: "s2", game: "blackjack", bet: 500 }
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
      body: { transactionId: "tx-draw", discordUserId: "casino-user", sessionId: "s3", game: "blackjack", bet: 700 }
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
      body: { transactionId: "tx-cancel", discordUserId: "casino-user", sessionId: "s4", game: "roulette", bet: 300 }
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

    const insufficient = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "tx-rich", discordUserId: "casino-user", sessionId: "s5", game: "slots", bet: 999999999 }
    });
    assert.strictEqual(insufficient.status, 409, "残高不足は拒否");

    await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations",
      body: { transactionId: "tx-cap", discordUserId: "casino-user", sessionId: "s6", game: "slots", bet: 100 }
    });
    const tooLarge = await request(port, {
      method: "POST",
      path: "/internal/v1/casino/reservations/tx-cap/settle",
      body: { payout: 1001 }
    });
    assert.strictEqual(tooLarge.status, 400, "高額すぎるpayoutは拒否");

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
