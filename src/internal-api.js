const http = require("http");
const { URL } = require("url");

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 8787;
const DEFAULT_BODY_LIMIT = 16 * 1024;

function startInternalApi({
  engine,
  store,
  apiKey = process.env.IRIS_INTERNAL_API_KEY,
  host = process.env.IRIS_INTERNAL_API_HOST || DEFAULT_HOST,
  port = process.env.IRIS_INTERNAL_API_PORT || DEFAULT_PORT,
  maxBodyBytes = process.env.IRIS_INTERNAL_API_MAX_BODY_BYTES || DEFAULT_BODY_LIMIT,
  maxPayoutMultiplier = process.env.IRIS_CASINO_MAX_PAYOUT_MULTIPLIER,
  maxPayoutRis = process.env.IRIS_CASINO_MAX_PAYOUT_RIS,
  logger = console
} = {}) {
  if (!apiKey) {
    logger.info?.("Internal Economy API disabled: IRIS_INTERNAL_API_KEY is not set.");
    return null;
  }
  if (!engine || !store) throw new Error("startInternalApi requires engine and store.");

  const listenPort = parsePort(port, DEFAULT_PORT);
  const bodyLimit = parsePositiveInt(maxBodyBytes, DEFAULT_BODY_LIMIT);
  const payoutLimits = {
    maxPayoutMultiplier: parseOptionalNonNegativeInt(maxPayoutMultiplier),
    maxPayoutRis: parseOptionalNonNegativeInt(maxPayoutRis)
  };

  const server = http.createServer(async (req, res) => {
    try {
      await handleInternalRequest(req, res, { engine, store, apiKey, bodyLimit, payoutLimits });
    } catch (error) {
      sendJson(res, 500, { ok: false, error: { code: "INTERNAL_ERROR", message: "internal api error" } });
      logger.warn?.(`Internal Economy API error: ${error.message}`);
    }
  });

  server.listen(listenPort, host, () => {
    const address = server.address();
    const boundPort = typeof address === "object" && address ? address.port : listenPort;
    logger.info?.(`Internal Economy API listening on ${host}:${boundPort}`);
  });
  return server;
}

async function handleInternalRequest(req, res, context) {
  if (!isAuthorized(req, context.apiKey)) {
    sendJson(res, 401, { ok: false, error: { code: "UNAUTHORIZED", message: "unauthorized" } });
    return;
  }

  const url = new URL(req.url || "/", "http://internal.local");
  const pathname = decodeURIComponent(url.pathname);
  const method = String(req.method || "GET").toUpperCase();

  if (method === "GET") {
    const walletMatch = pathname.match(/^\/internal\/v1\/wallets\/([^/]+)$/);
    if (walletMatch) {
      const result = context.engine.casinoWallet(walletMatch[1]);
      sendDomainResult(res, result);
      return;
    }
  }

  if (method === "POST" && pathname === "/internal/v1/casino/reservations") {
    const body = await readJsonBody(req, context.bodyLimit);
    if (!body.ok) {
      sendJson(res, body.status, { ok: false, error: { code: body.code, message: body.message } });
      return;
    }
    const result = context.engine.reserveCasinoBet(body.value);
    if (result.changed) context.store.save(context.engine.state);
    sendDomainResult(res, result);
    return;
  }

  const settleMatch = pathname.match(/^\/internal\/v1\/casino\/reservations\/([^/]+)\/settle$/);
  if (method === "POST" && settleMatch) {
    const body = await readJsonBody(req, context.bodyLimit);
    if (!body.ok) {
      sendJson(res, body.status, { ok: false, error: { code: body.code, message: body.message } });
      return;
    }
    const result = context.engine.settleCasinoReservation(settleMatch[1], body.value, context.payoutLimits);
    if (result.changed) context.store.save(context.engine.state);
    sendDomainResult(res, result);
    return;
  }

  const cancelMatch = pathname.match(/^\/internal\/v1\/casino\/reservations\/([^/]+)\/cancel$/);
  if (method === "POST" && cancelMatch) {
    const body = await readJsonBody(req, context.bodyLimit);
    if (!body.ok) {
      sendJson(res, body.status, { ok: false, error: { code: body.code, message: body.message } });
      return;
    }
    const result = context.engine.cancelCasinoReservation(cancelMatch[1]);
    if (result.changed) context.store.save(context.engine.state);
    sendDomainResult(res, result);
    return;
  }

  sendJson(res, 404, { ok: false, error: { code: "NOT_FOUND", message: "route not found" } });
}

function isAuthorized(req, apiKey) {
  const header = req.headers.authorization || "";
  return header === `Bearer ${apiKey}`;
}

function readJsonBody(req, limit) {
  return new Promise((resolve) => {
    let size = 0;
    let raw = "";
    let tooLarge = false;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (tooLarge) return;
      if (size > limit) {
        tooLarge = true;
        raw = "";
        return;
      }
      raw += chunk.toString("utf8");
    });
    req.on("end", () => {
      if (tooLarge) {
        resolve({ ok: false, status: 413, code: "BODY_TOO_LARGE", message: "request body too large" });
        return;
      }
      if (!raw) {
        resolve({ ok: true, value: {} });
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          resolve({ ok: false, status: 400, code: "INVALID_JSON", message: "json body must be an object" });
          return;
        }
        resolve({ ok: true, value: parsed });
      } catch {
        resolve({ ok: false, status: 400, code: "INVALID_JSON", message: "invalid json" });
      }
    });
    req.on("error", () => {
      resolve({ ok: false, status: 400, code: "INVALID_REQUEST", message: "request body error" });
    });
  });
}

function sendDomainResult(res, result) {
  if (result.ok) {
    sendJson(res, result.status || 200, {
      ok: true,
      wallet: result.wallet,
      currency: result.currency,
      userId: result.userId,
      discordUserId: result.discordUserId,
      name: result.name,
      transaction: result.transaction
    });
    return;
  }
  sendJson(res, result.status || 400, {
    ok: false,
    error: {
      code: result.code || "BAD_REQUEST",
      message: result.message || "request failed"
    },
    wallet: result.wallet,
    bet: result.bet,
    maxPayout: result.maxPayout
  });
}

function sendJson(res, status, payload) {
  const raw = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(raw),
    "cache-control": "no-store"
  });
  res.end(raw);
}

function parsePort(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 65535 ? parsed : fallback;
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseOptionalNonNegativeInt(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

module.exports = {
  startInternalApi,
  handleInternalRequest
};
