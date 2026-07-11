"use strict";

const DAY_MS = 24 * 60 * 60 * 1000;
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const RESET_HOUR_MS = 4 * 60 * 60 * 1000;
const DAILY_CONFIG = Object.freeze({
  baseAmount: 600,
  streakStep: 120,
  streakBonusCap: 1800,
  stampBonus: 250,
  randomMax: 180,
  xp: 12
});

function validDate(value) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function fourAmDayNumber(value) {
  const date = validDate(value);
  if (!date) return null;
  return Math.floor((date.getTime() + JST_OFFSET_MS - RESET_HOUR_MS) / DAY_MS);
}

function fourAmDayKey(value) {
  const dayNumber = fourAmDayNumber(value);
  if (dayNumber === null) return null;
  return new Date(dayNumber * DAY_MS).toISOString().slice(0, 10);
}

function nextJstFourAm(value) {
  const dayNumber = fourAmDayNumber(value);
  if (dayNumber === null) return null;
  return new Date((dayNumber + 1) * DAY_MS - JST_OFFSET_MS + RESET_HOUR_MS);
}

function getFourAmDailyStatus(user, nowValue = new Date()) {
  const now = validDate(nowValue) || new Date();
  const currentDay = fourAmDayNumber(now);
  const lastClaim = validDate(user?.lastDaily);
  const lastDay = lastClaim ? fourAmDayNumber(lastClaim) : null;
  const storedStreak = Math.max(0, Math.floor(Number(user?.streak) || 0));
  const dayGap = lastDay === null ? null : currentDay - lastDay;

  return {
    claimable: lastDay === null || dayGap >= 1,
    currentDayKey: fourAmDayKey(now),
    lastDayKey: lastClaim ? fourAmDayKey(lastClaim) : null,
    dayGap,
    streak: storedStreak,
    nextStreak: lastDay !== null && dayGap === 1 ? storedStreak + 1 : 1,
    nextResetAt: nextJstFourAm(now)
  };
}

function resetTimestamp(status) {
  return status?.nextResetAt ? Math.floor(status.nextResetAt.getTime() / 1000) : null;
}

function fourAmDailyStatusLine(user, nowValue = new Date()) {
  const status = getFourAmDailyStatus(user, nowValue);
  if (status.claimable) return `受取可能 / 次は連続 ${status.nextStreak}日目`;
  return `本日分は受取済み / 次回 <t:${resetTimestamp(status)}:R> / 現在 ${status.streak}日連続`;
}

function claimFourAmDaily(engine, user) {
  const now = validDate(engine?.now?.()) || new Date();
  const status = getFourAmDailyStatus(user, now);
  const reset = resetTimestamp(status);

  if (!status.claimable) {
    return {
      ok: false,
      title: "本日のログボは受取済み",
      lines: [
        `次回は <t:${reset}:R>（日本時間 4:00）から受け取れます。`,
        `現在 ${status.streak}日連続です。`
      ],
      meta: {
        daily: {
          claimable: false,
          dayKey: status.currentDayKey,
          streak: status.streak,
          nextResetAt: status.nextResetAt?.toISOString() || null,
          resetHourJst: 4
        }
      }
    };
  }

  const randomRoll = Math.max(0, Math.min(
    DAILY_CONFIG.randomMax,
    Math.floor((Number(engine?.rng?.()) || 0) * (DAILY_CONFIG.randomMax + 1))
  ));
  const streak = status.nextStreak;
  const streakBonus = Math.min(streak * DAILY_CONFIG.streakStep, DAILY_CONFIG.streakBonusCap);
  const stampBonus = user?.inventory?.stamp ? DAILY_CONFIG.stampBonus : 0;
  const amount = DAILY_CONFIG.baseAmount + streakBonus + stampBonus + randomRoll;

  user.streak = streak;
  user.lastDaily = now.toISOString();
  user.lastDailyDay = status.currentDayKey;
  user.wallet = Math.floor(Number(user.wallet) || 0) + amount;
  user.lifetimeEarned = Math.floor(Number(user.lifetimeEarned) || 0) + amount;
  user.xp = Math.floor(Number(user.xp) || 0) + DAILY_CONFIG.xp;

  if (typeof engine?.log === "function") {
    engine.log(user, "daily", amount, `ログボ JST4 ${status.currentDayKey} / ${streak}日連続`);
  }

  return {
    ok: true,
    title: "ログボ支給",
    lines: [
      `${amount.toLocaleString("ja-JP")} Ris を受け取りました。`,
      `内訳: 基本 ${DAILY_CONFIG.baseAmount.toLocaleString("ja-JP")} / 連続 ${streakBonus.toLocaleString("ja-JP")} / ランダム ${randomRoll.toLocaleString("ja-JP")}${stampBonus ? ` / 常連カード ${stampBonus.toLocaleString("ja-JP")}` : ""}`,
      `連続 ${streak}日。次回は <t:${reset}:R>（日本時間 4:00）から。`,
      `財布: ${user.wallet.toLocaleString("ja-JP")} Ris`
    ],
    meta: {
      daily: {
        claimable: true,
        amount,
        baseAmount: DAILY_CONFIG.baseAmount,
        streakBonus,
        stampBonus,
        randomRoll,
        dayKey: status.currentDayKey,
        streak,
        nextResetAt: status.nextResetAt?.toISOString() || null,
        resetHourJst: 4
      }
    }
  };
}

function installDailyFourAmReset(economyModule) {
  const economy = economyModule || require("./economy");
  const Engine = economy.EconomyEngine;
  if (!Engine?.prototype || Engine.prototype.__irisDailyFourAmInstalled) return;

  const originalPanel = Engine.prototype.panel;
  const originalLoopSuggestion = Engine.prototype.loopSuggestion;

  Engine.prototype.daily = function irisFourAmDaily(user) {
    return claimFourAmDaily(this, user);
  };

  Engine.prototype.loopSuggestion = function irisFourAmLoopSuggestion(user) {
    const suggestions = [];
    if (!user.joined) suggestions.push("まず `参加` で初期資本を受け取る");
    if (getFourAmDailyStatus(user, this.now()).claimable) suggestions.push("今日のログボを受け取る");

    if (typeof originalLoopSuggestion === "function") {
      const original = String(originalLoopSuggestion.call(this, user) || "");
      for (const line of original.split("\n")) {
        if (line && !line.includes("ログボ") && !suggestions.includes(line)) suggestions.push(line);
      }
    }

    if (suggestions.length === 0) suggestions.push("カードを見る、VCに入る、マーケットを眺める");
    return suggestions.slice(0, 3).join("\n");
  };

  Engine.prototype.panel = function irisFourAmPanel(user, panelIdRaw = "home") {
    const result = originalPanel.call(this, user, panelIdRaw);
    const panelId = String(panelIdRaw || "home").trim().toLowerCase();
    const panel = result?.panel;
    if (!panel || !["home", "ホーム", "menu", "パネル"].includes(panelId)) return result;

    const status = getFourAmDailyStatus(user, this.now());
    panel.fields = Array.isArray(panel.fields) ? panel.fields : [];
    const dailyField = panel.fields.find((field) => field?.name === "ログボ");
    if (dailyField) dailyField.value = fourAmDailyStatusLine(user, this.now());
    else panel.fields.push({ name: "ログボ", value: fourAmDailyStatusLine(user, this.now()), inline: true });

    for (const row of panel.components || []) {
      if (row?.type !== "buttons" || !Array.isArray(row.items)) continue;
      const dailyButton = row.items.find((item) => item?.kind === "run" && item.command === "daily");
      if (!dailyButton) continue;
      dailyButton.label = status.claimable ? "ログボ" : "ログボ済み";
      dailyButton.disabled = !status.claimable;
    }

    return result;
  };

  Engine.prototype.__irisDailyFourAmInstalled = true;
}

module.exports = {
  DAILY_CONFIG,
  claimFourAmDaily,
  fourAmDailyStatusLine,
  fourAmDayKey,
  fourAmDayNumber,
  getFourAmDailyStatus,
  installDailyFourAmReset,
  nextJstFourAm
};
