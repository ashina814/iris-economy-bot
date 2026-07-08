"use strict";

const economy = require("./economy");
const { JsonStore } = require("./storage");

const OriginalEconomyEngine = economy.EconomyEngine;

const LOUNGE_PANEL_IDS = new Set(["lounge", "通話", "ラウンジ", "通話ラウンジ"]);
const MANUAL_VOICE_SETTLEMENT_COMMANDS = new Set(["vc", "voice", "claimvc", "通話報酬", "vc精算", "通話精算"]);
const RANK_BALANCE_VERSION = 20260708;
const CURRENCY_CODE = "Ris";
const VC_MAX_CLAIM_MINUTES = 240;
const DEFAULT_XP_SETTINGS = Object.freeze({
  textCooldownSec: 60,
  textXpMin: 1,
  textXpMax: 2,
  textDripMin: 1,
  textDripMax: 4,
  vcXpPerMinute: 1
});

const XP_SETTING_LIMITS = Object.freeze({
  textCooldownSec: [15, 300],
  textXpMin: [1, 20],
  textXpMax: [1, 30],
  textDripMin: [0, 100],
  textDripMax: [0, 200],
  vcXpPerMinute: [1, 20]
});

const TUNED_RANK_THRESHOLDS = [
  0,
  15,
  45,
  90,
  180,
  360,
  720,
  1200,
  2000,
  3200,
  5000,
  7500,
  11000,
  16000,
  22000,
  30000,
  40000,
  50000,
  57000,
  60000,
  90000
];

const TEXT_RANKS = makeRanks([
  "観測者",
  "応答の芽",
  "言葉の灯",
  "会話の糸口",
  "文脈の拾い手",
  "話題の継ぎ手",
  "言葉の結び手",
  "会話の常連",
  "文脈の編み手",
  "言葉の調律師",
  "タイムラインの灯台",
  "談話圏の柱",
  "記録の織り手",
  "文脈の航路",
  "言葉の環",
  "談話圏の礎",
  "記録片",
  "文脈星",
  "言語環",
  "言語核",
  "アイリス"
]);

const VC_RANKS = makeRanks([
  "入室者",
  "傾聴の芽",
  "声の灯",
  "雑談の糸口",
  "声の同席者",
  "余韻の継ぎ手",
  "声場の結び手",
  "通話の常連",
  "響きの編み手",
  "声の調律師",
  "通話圏の灯台",
  "声場の柱",
  "残響の織り手",
  "声域の航路",
  "共鳴の環",
  "通話圏の礎",
  "残響片",
  "共鳴星",
  "声域環",
  "音声核",
  "アイリス"
]);

const OLD_TEXT_RANK_NAMES = ["観測者", "発言者", "会話設計士", "文脈編集者", "タイムライン統括", "言語圏の代表"];
const OLD_VC_RANK_NAMES = ["入室者", "傾聴者", "雑談主任", "会議進行役", "深夜VC責任者", "声のインフラ"];

function makeRanks(names) {
  return names.map((name, index) => ({ name, min: TUNED_RANK_THRESHOLDS[index] }));
}

function normalizePanelId(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeLabel(value) {
  return String(value || "").trim();
}

function isLoungeRoute(value) {
  const text = normalizePanelId(value);
  return text === "lounge" || text === "panel lounge" || text === "panel:lounge" || text.endsWith(":lounge");
}

function isLoungeLabel(value) {
  return ["通話", "通話ラウンジ", "ラウンジ"].includes(normalizeLabel(value));
}

function isLoungeCommand(input) {
  const text = normalizePanelId(input);
  return text === "lounge" || text === "通話" || text === "ラウンジ" || text === "通話ラウンジ" || text === "panel lounge" || text === "panel 通話" || text === "panel ラウンジ" || text === "panel 通話ラウンジ";
}

function isManualVoiceSettlementCommand(input) {
  return MANUAL_VOICE_SETTLEMENT_COMMANDS.has(normalizePanelId(input));
}

function loungeRemovedResult() {
  return {
    ok: false,
    title: "通話ラウンジは廃止しました",
    lines: [
      "この入口は現在使えません。",
      "VC報酬は退出・移動時と在室中の定期処理で自動精算されます。"
    ]
  };
}

function automaticVoiceSettlementResult() {
  return {
    ok: true,
    title: "VC報酬は自動精算です",
    lines: [
      "VCに入ると在室時間が自動で記録されます。",
      "退出・移動時に精算され、在室中も10分ごとに自動反映されます。",
      "手動で `vc` を押す必要はありません。"
    ]
  };
}

function stripLoungeFromText(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/(?:、|・)?通話ラウンジ/g, "")
    .replace(/二人宿・の/g, "二人宿の")
    .replace(/、?通話。/g, "。")
    .replace(/VC精算/g, "VC自動精算")
    .replace(/VC報酬を受け取る/g, "VC報酬は自動精算")
    .replace(/在室分を途中精算/g, "在室中も定期的に自動反映");
}

function shouldDropComponent(item) {
  if (!item || typeof item !== "object") return false;
  const values = [item.command, item.customId, item.custom_id, item.value, item.id];
  if (values.some((value) => typeof value === "string" && isLoungeRoute(value))) return true;
  if (isLoungeLabel(item.label) || isLoungeLabel(item.name)) return true;
  if (values.some((value) => typeof value === "string" && isManualVoiceSettlementCommand(value))) return true;
  return false;
}

function sanitizeValue(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeValue(item))
      .filter((item) => item !== null && item !== undefined && !(Array.isArray(item) && item.length === 0));
  }

  if (!value || typeof value !== "object") return stripLoungeFromText(value);
  if (shouldDropComponent(value)) return null;

  const next = {};
  for (const [key, entry] of Object.entries(value)) {
    if (key === "items" || key === "options" || key === "components") {
      const cleaned = sanitizeValue(entry);
      if (Array.isArray(cleaned) && cleaned.length === 0) return null;
      next[key] = cleaned;
    } else {
      next[key] = sanitizeValue(entry);
    }
  }
  return next;
}

function sanitizeResult(result) {
  if (!result || typeof result !== "object" || !result.panel) return result;
  return { ...result, panel: sanitizeValue(result.panel) };
}

function retuneRankText(value, user) {
  if (typeof value !== "string" || !user?.activity) return value;
  let text = stripLoungeFromText(value);
  const currentTextRank = rankFor(TEXT_RANKS, user.activity.textXp || 0).name;
  const currentVcRank = rankFor(VC_RANKS, user.activity.vcXp || 0).name;
  for (const name of OLD_TEXT_RANK_NAMES) text = text.replaceAll(name, currentTextRank);
  for (const name of OLD_VC_RANK_NAMES) text = text.replaceAll(name, currentVcRank);
  return text;
}

function retuneResultValue(value, user) {
  if (Array.isArray(value)) return value.map((item) => retuneResultValue(item, user));
  if (!value || typeof value !== "object") return retuneRankText(value, user);
  const next = {};
  for (const [key, entry] of Object.entries(value)) next[key] = retuneResultValue(entry, user);
  return next;
}

function retuneResult(result, user, engine = null) {
  return decorateTunedPanels(retuneResultValue(sanitizeResult(result), user), engine);
}

function decorateTunedPanels(result, engine) {
  const panel = result?.panel;
  if (!panel || typeof panel !== "object") return result;

  if (panel.title === "運営パネル") {
    panel.fields ||= [];
    if (!panel.fields.some((field) => field?.name === "TC/VC XP設定")) {
      panel.fields.splice(3, 0, {
        name: "TC/VC XP設定",
        value: "TC獲得XP、TCクールダウン、VC XP/分を調整できます。",
        inline: true
      });
    }

    panel.components ||= [];
    const row = panel.components.find((component) => component?.type === "buttons" && Array.isArray(component.items));
    if (row && !row.items.some((item) => item?.panel === "rank-xp-settings")) {
      row.items.splice(Math.max(0, row.items.length - 1), 0, panelButton("XP設定", "rank-xp-settings"));
    }
  }

  if (panel.title === "ランク設定") {
    panel.fields ||= [];
    if (!panel.fields.some((field) => field?.name === "TC/VC XP設定")) {
      panel.fields.push({
        name: "TC/VC XP設定",
        value: engine ? xpSettingsSummary(engine.xpSettings()) : "管理パネルのXP設定から変更できます。",
        inline: false
      });
    }

    panel.components ||= [];
    panel.components.push(buttons([
      panelButton("XP設定", "rank-xp-settings", "primary"),
      panelButton("運営パネル", "admin")
    ]));
  }

  return result;
}

function rankFor(ranks, value) {
  return ranks.reduce((best, rank) => (value >= rank.min ? rank : best), ranks[0]);
}

function rankIndex(ranks, value) {
  let index = 0;
  for (let i = 0; i < ranks.length; i += 1) {
    if (value >= ranks[i].min) index = i;
  }
  return index;
}

function rankLevel(ranks, value) {
  return rankIndex(ranks, value) + 1;
}

function rankWithProgress(ranks, value) {
  const index = rankIndex(ranks, value);
  const current = ranks[index];
  const next = ranks[index + 1] || null;
  return {
    name: current.name,
    value,
    currentMin: current.min,
    nextMin: next ? next.min : null
  };
}

function nextRankName(ranks, currentName) {
  const index = ranks.findIndex((rank) => rank.name === currentName);
  if (index < 0 || index + 1 >= ranks.length) return null;
  return ranks[index + 1].name;
}

function rankProgressPercent(rank) {
  if (!Number.isFinite(rank.currentMin)) return 0;
  if (!rank.nextMin) return 100;
  const span = rank.nextMin - rank.currentMin;
  const current = rank.value - rank.currentMin;
  return clamp(Math.floor((current / span) * 100), 0, 100);
}

function progressText(rank) {
  if (!Number.isFinite(rank.currentMin)) return "";
  if (!rank.nextMin) return "(MAX)";
  const pct = rankProgressPercent(rank);
  return `${bar(pct, 100)} ${pct}%`;
}

function bar(value, max) {
  const width = 10;
  const filled = Math.round((clamp(value, 0, max) / max) * width);
  return `[${"#".repeat(filled)}${"-".repeat(width - filled)}]`;
}

function fmt(amount) {
  const rounded = Math.floor(Math.abs(Number(amount) || 0));
  const sign = amount < 0 ? "-" : "";
  return `${sign}${rounded.toLocaleString("ja-JP")} ${CURRENCY_CODE}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function cooldownRemaining(lastIso, now, durationMs) {
  if (!lastIso) return 0;
  const elapsed = now - new Date(lastIso);
  return Math.max(0, durationMs - elapsed);
}

function buttons(items) {
  return { type: "buttons", items };
}

function runButton(label, command, style = "secondary", disabled = false) {
  return { kind: "run", label, command, style, disabled };
}

function panelButton(label, panel, style = "secondary", disabled = false) {
  return { kind: "panel", label, panel, style, disabled };
}

function normalizeActivity(user) {
  user.activity ||= {};
  user.activity.textXp = Math.max(0, Math.floor(Number(user.activity.textXp) || 0));
  user.activity.textMessages = Math.max(0, Math.floor(Number(user.activity.textMessages) || 0));
  user.activity.vcXp = Math.max(0, Math.floor(Number(user.activity.vcXp) || 0));
  user.activity.vcMinutes = Math.max(0, Math.floor(Number(user.activity.vcMinutes) || 0));
  user.activity.vcDailyEarned = Math.max(0, Math.floor(Number(user.activity.vcDailyEarned) || 0));
  user.activity.vcDailyMinutes = Math.max(0, Math.floor(Number(user.activity.vcDailyMinutes) || 0));
}

function cleanXpSettings(raw = {}) {
  const settings = { ...DEFAULT_XP_SETTINGS, ...(raw || {}) };
  for (const [key, [min, max]] of Object.entries(XP_SETTING_LIMITS)) {
    settings[key] = clamp(Math.floor(Number(settings[key]) || DEFAULT_XP_SETTINGS[key]), min, max);
  }
  if (settings.textXpMax < settings.textXpMin) settings.textXpMax = settings.textXpMin;
  if (settings.textDripMax < settings.textDripMin) settings.textDripMax = settings.textDripMin;
  return settings;
}

function getXpSettings(state) {
  state.rankXpSettings = cleanXpSettings(state.rankXpSettings);
  return state.rankXpSettings;
}

function applyXpPreset(state, preset) {
  if (preset === "light") {
    state.rankXpSettings = cleanXpSettings({
      textCooldownSec: 45,
      textXpMin: 2,
      textXpMax: 3,
      textDripMin: 2,
      textDripMax: 6,
      vcXpPerMinute: 2
    });
  } else if (preset === "heavy") {
    state.rankXpSettings = cleanXpSettings({
      textCooldownSec: 90,
      textXpMin: 1,
      textXpMax: 1,
      textDripMin: 1,
      textDripMax: 3,
      vcXpPerMinute: 1
    });
  } else {
    state.rankXpSettings = cleanXpSettings(DEFAULT_XP_SETTINGS);
  }
  return state.rankXpSettings;
}

function adjustXpSetting(state, key, delta) {
  const settings = getXpSettings(state);
  if (!(key in XP_SETTING_LIMITS)) return settings;
  settings[key] += delta;
  state.rankXpSettings = cleanXpSettings(settings);
  return state.rankXpSettings;
}

function xpSettingsSummary(settings) {
  return [
    `TC XP: ${settings.textXpMin}〜${settings.textXpMax} / 有効発言`,
    `TC CD: ${settings.textCooldownSec}秒`,
    `TC Ris: ${settings.textDripMin}〜${settings.textDripMax} / 有効発言`,
    `VC XP: ${settings.vcXpPerMinute} / 分`
  ].join("\n");
}

function xpSettingsPanel(engine, message = null) {
  const settings = engine.xpSettings();
  return {
    ok: true,
    title: "TC/VC XP設定",
    lines: [
      message,
      xpSettingsSummary(settings),
      "",
      "軽め: TC 2〜3XP/45秒、VC 2XP/分",
      "標準: TC 1〜2XP/60秒、VC 1XP/分",
      "重め: TC 1XP/90秒、VC 1XP/分"
    ].filter(Boolean),
    panel: {
      title: "TC/VC XP設定",
      description: "TCとVCのXP獲得量を調整します。変更は次の発言・VC精算から反映されます。",
      color: 0x7c3aed,
      fields: [
        { name: "現在値", value: xpSettingsSummary(settings), inline: false },
        { name: "ランク基準", value: "Lv21 アイリス = 90,000 XP / VC換算1500時間（VC 1XP/分の標準時）", inline: false }
      ],
      components: [
        buttons([
          runButton("軽め", "rankxp preset light", "success"),
          runButton("標準", "rankxp preset standard", "primary"),
          runButton("重め", "rankxp preset heavy", "danger"),
          panelButton("運営パネル", "admin")
        ]),
        buttons([
          runButton("TC上限 +1", "rankxp adjust textXpMax 1"),
          runButton("TC上限 -1", "rankxp adjust textXpMax -1"),
          runButton("TC下限 +1", "rankxp adjust textXpMin 1"),
          runButton("TC下限 -1", "rankxp adjust textXpMin -1")
        ]),
        buttons([
          runButton("TC CD -15秒", "rankxp adjust textCooldownSec -15"),
          runButton("TC CD +15秒", "rankxp adjust textCooldownSec 15"),
          runButton("VC XP +1", "rankxp adjust vcXpPerMinute 1"),
          runButton("VC XP -1", "rankxp adjust vcXpPerMinute -1")
        ])
      ]
    }
  };
}

function handleXpSettingsCommand(engine, input) {
  const parts = String(input || "").trim().split(/\s+/);
  const action = String(parts[1] || "show").toLowerCase();

  if (action === "show") return xpSettingsPanel(engine);
  if (action === "preset") {
    const preset = String(parts[2] || "standard").toLowerCase();
    applyXpPreset(engine.state, preset);
    return xpSettingsPanel(engine, `プリセット「${preset === "light" ? "軽め" : preset === "heavy" ? "重め" : "標準"}」を適用しました。`);
  }

  if (action === "adjust") {
    const key = parts[2];
    const delta = Math.floor(Number(parts[3]) || 0);
    if (!key || !delta || !(key in XP_SETTING_LIMITS)) {
      return { ok: false, title: "XP設定エラー", lines: ["調整対象または増減値が不正です。"] };
    }
    adjustXpSetting(engine.state, key, delta);
    return xpSettingsPanel(engine, "XP設定を更新しました。");
  }

  return xpSettingsPanel(engine);
}

function extractDiscordUserId(internalUserId) {
  const text = String(internalUserId || "");
  const index = text.indexOf(":");
  if (index < 0) return null;
  return text.slice(index + 1) || null;
}

function userMention(user) {
  const discordId = extractDiscordUserId(user?.id);
  return discordId ? `<@${discordId}>` : (user?.name || "名無し");
}

function leaderboardSpec(typeRaw) {
  const type = normalizePanelId(typeRaw || "net");
  if (["text", "txt", "tc", "発言"].includes(type)) {
    return {
      key: "text",
      title: "TCランキング",
      unit: "XP",
      score: (user) => user.activity?.textXp || 0,
      label: (value) => `${rankFor(TEXT_RANKS, value).name} / ${value.toLocaleString("ja-JP")} XP`
    };
  }
  if (["vc", "voice", "通話"].includes(type)) {
    return {
      key: "vc",
      title: "VCランキング",
      unit: "XP",
      score: (user) => user.activity?.vcXp || 0,
      label: (value, user) => `${rankFor(VC_RANKS, value).name} / ${value.toLocaleString("ja-JP")} XP / ${(user.activity?.vcMinutes || 0).toLocaleString("ja-JP")}分`
    };
  }
  if (["invite", "invites", "招待"].includes(type)) {
    return {
      key: "invite",
      title: "招待ランキング",
      unit: "人",
      score: (user) => user.invites?.qualified || 0,
      label: (value) => `${value.toLocaleString("ja-JP")}人`
    };
  }
  if (["bump", "バンプ"].includes(type)) {
    return {
      key: "bump",
      title: "Bumpランキング",
      unit: "回",
      score: (user) => user.bump?.count || 0,
      label: (value) => `${value.toLocaleString("ja-JP")}回`
    };
  }
  return {
    key: "net",
    title: "純資産ランキング",
    unit: CURRENCY_CODE,
    score: (user) => Math.floor(Number(user.wallet) || 0),
    label: (value) => fmt(value)
  };
}

function buildMentionLeaderboard(engine, actor, typeRaw = "net") {
  const spec = leaderboardSpec(typeRaw);
  const users = Object.values(engine.state.users || {}).filter((user) => user.joined);
  const ranked = users
    .map((user) => ({ user, value: spec.score(user) }))
    .sort((a, b) => b.value - a.value || String(a.user.name || "").localeCompare(String(b.user.name || ""), "ja"));

  if (ranked.length === 0) {
    return { ok: true, title: spec.title, lines: ["まだ誰も経済圏に住んでいません。`join` からどうぞ。"] };
  }

  const actorId = actor?.id || null;
  const selfIndex = actorId ? ranked.findIndex((entry) => entry.user.id === actorId) : -1;
  const top = ranked.slice(0, 10);
  const lines = top.map((entry, index) => {
    const selfMark = entry.user.id === actorId ? " ← あなた" : "";
    return `${index + 1}. ${userMention(entry.user)} - ${spec.label(entry.value, entry.user)}${selfMark}`;
  });

  if (actorId) {
    lines.push("");
    if (selfIndex >= 0) {
      const self = ranked[selfIndex];
      lines.push(`あなた: ${selfIndex + 1}位 / ${ranked.length}人中`);
      lines.push(`${userMention(self.user)} - ${spec.label(self.value, self.user)}`);
      if (selfIndex >= 10 && ranked[9]) {
        const needed = Math.max(1, ranked[9].value - self.value + 1);
        lines.push(`Top10まであと ${needed.toLocaleString("ja-JP")} ${spec.unit}`);
      }
    } else {
      const self = engine.getUser(actor.id, actor.name);
      lines.push("あなた: まだランキング対象外です。");
      lines.push(`${userMention(self)} - ${spec.label(spec.score(self), self)}`);
    }
  }

  return {
    ok: true,
    title: spec.title,
    lines
  };
}

function applyRankBalanceMigration(state) {
  if (!state || typeof state !== "object" || !state.users) return false;
  let changed = false;

  if (state.rankBalanceVersion !== RANK_BALANCE_VERSION) {
    for (const user of Object.values(state.users || {})) {
      if (!user || typeof user !== "object") continue;
      normalizeActivity(user);
      user.activity.textXp = Math.floor(user.activity.textXp / 8);
      user.activity.vcXp = user.activity.vcMinutes > 0 ? user.activity.vcMinutes : Math.floor(user.activity.vcXp / 6);
    }
    state.rankBalanceVersion = RANK_BALANCE_VERSION;
    changed = true;
  }

  const beforeSettings = JSON.stringify(state.rankXpSettings || null);
  state.rankXpSettings = cleanXpSettings(state.rankXpSettings);
  if (JSON.stringify(state.rankXpSettings) !== beforeSettings) changed = true;
  return changed;
}

const originalStoreLoad = JsonStore.prototype.load;
JsonStore.prototype.load = function patchedLoad() {
  const state = originalStoreLoad.call(this);
  if (applyRankBalanceMigration(state)) {
    try {
      this.save(state);
    } catch (error) {
      console.warn(`TC/VCランク移行の保存に失敗しました: ${error.message}`);
    }
  }
  return state;
};

class TunedEconomyEngine extends OriginalEconomyEngine {
  constructor(state, options = {}) {
    super(state, options);
    applyRankBalanceMigration(this.state);
    for (const user of Object.values(this.state.users || {})) {
      if (user?.joined) this.updateTitle(user);
    }
  }

  xpSettings() {
    return getXpSettings(this.state);
  }
}

economy.EconomyEngine = TunedEconomyEngine;

const originalRun = OriginalEconomyEngine.prototype.run;
const originalPanel = OriginalEconomyEngine.prototype.panel;
const originalUpdateTitle = OriginalEconomyEngine.prototype.updateTitle;

TunedEconomyEngine.prototype.run = function patchedRun(input, actor) {
  const text = String(input || "").trim();
  const parts = text.split(/\s+/);
  const command = normalizePanelId(parts[0]);
  if (isLoungeCommand(text)) return loungeRemovedResult();
  if (isManualVoiceSettlementCommand(text)) return automaticVoiceSettlementResult();
  if (/^rankxp(?:\s|$)/i.test(text) || /^xp-settings(?:\s|$)/i.test(text)) return handleXpSettingsCommand(this, text);
  if (/^panel\s+rank-xp-settings$/i.test(text)) return xpSettingsPanel(this);
  if (["rank", "leaderboard", "ランキング"].includes(command)) return buildMentionLeaderboard(this, actor, parts[1] || "net");

  const result = originalRun.call(this, input, actor);
  const user = actor?.id ? this.getUser(actor.id, actor.name) : null;
  return retuneResult(result, user, this);
};

TunedEconomyEngine.prototype.panel = function patchedPanel(user, panelIdRaw = "home") {
  const panelId = normalizePanelId(panelIdRaw);
  if (LOUNGE_PANEL_IDS.has(panelId)) return loungeRemovedResult();
  if (panelId === "rank-xp-settings" || panelId === "xp-settings") return xpSettingsPanel(this);
  return retuneResult(originalPanel.call(this, user, panelIdRaw), user, this);
};

TunedEconomyEngine.prototype.textLevel = function patchedTextLevel(user) {
  return rankLevel(TEXT_RANKS, user.activity.textXp || 0);
};

TunedEconomyEngine.prototype.vcLevel = function patchedVcLevel(user) {
  return rankLevel(VC_RANKS, user.activity.vcXp || 0);
};

TunedEconomyEngine.prototype.textRank = function patchedTextRank(user) {
  return rankFor(TEXT_RANKS, user.activity.textXp || 0);
};

TunedEconomyEngine.prototype.vcRank = function patchedVcRank(user) {
  return rankFor(VC_RANKS, user.activity.vcXp || 0);
};

TunedEconomyEngine.prototype.updateTitle = function patchedUpdateTitle(user) {
  if (!user) return originalUpdateTitle.call(this, user);
  const text = this.textRank(user).name;
  const voice = this.vcRank(user).name;
  if (text === "アイリス" || voice === "アイリス") {
    user.title = "アイリス";
    return user.title;
  }
  return originalUpdateTitle.call(this, user);
};

TunedEconomyEngine.prototype.awardTextActivity = function patchedAwardTextActivity(actor, meta = {}) {
  const user = this.getUser(actor.id, actor.name);
  const settings = this.xpSettings();
  const now = this.now();
  const cooldownMs = meta.cooldownMs ?? settings.textCooldownSec * 1000;
  const remaining = cooldownRemaining(user.activity.lastTextAt, now, cooldownMs);
  if (remaining > 0) return null;

  const before = rankFor(TEXT_RANKS, user.activity.textXp || 0);
  const xp = randInt(this.rng, settings.textXpMin, settings.textXpMax);
  const drip = randInt(this.rng, settings.textDripMin, settings.textDripMax);
  user.activity.textXp = Math.max(0, Math.floor(Number(user.activity.textXp) || 0)) + xp;
  user.activity.textMessages = Math.max(0, Math.floor(Number(user.activity.textMessages) || 0)) + 1;
  user.activity.lastTextAt = now.toISOString();
  user.wallet += drip;
  user.lifetimeEarned += drip;
  this.updateTitle(user);

  const after = rankFor(TEXT_RANKS, user.activity.textXp || 0);
  if (after.name !== before.name) {
    const progress = rankWithProgress(TEXT_RANKS, user.activity.textXp || 0);
    return {
      ok: true,
      kind: "text_rank_up",
      title: "TCランク昇格",
      lines: [`${user.name} が ${after.name} になりました。`, `TCレベル ${this.textLevel(user)} / 会話報酬 +${fmt(drip)} / TC経験値 +${xp}`],
      meta: {
        axis: "text",
        userName: user.name,
        previousRank: before.name,
        newRank: after.name,
        nextRank: progress.nextMin !== null ? nextRankName(TEXT_RANKS, after.name) : null,
        nextRankAt: progress.nextMin,
        progressPercent: rankProgressPercent(progress),
        serverPosition: this.serverPositionByTextXp(user.id),
        serverTotal: this.joinedUserCount(),
        totalMessages: user.activity.textMessages,
        xpTotal: user.activity.textXp,
        xpGained: xp,
        drip,
        level: this.textLevel(user)
      }
    };
  }

  return { silent: true };
};

TunedEconomyEngine.prototype.awardVoiceMinutes = function patchedAwardVoiceMinutes(user, minutes, options = {}) {
  this.resetVoiceDay(user);
  const settings = this.xpSettings();
  const before = rankFor(VC_RANKS, user.activity.vcXp || 0);
  const cappedMinutes = Math.min(Math.max(0, Math.floor(Number(minutes) || 0)), VC_MAX_CLAIM_MINUTES);
  if (cappedMinutes <= 0) return { noop: true };

  const xp = cappedMinutes * settings.vcXpPerMinute;
  const salaryPerMinute = this.voiceSalaryPerMinute(user);
  const rawDrip = Math.floor(cappedMinutes * salaryPerMinute);
  const remaining = Math.max(0, this.voiceDailyCap(user) - user.activity.vcDailyEarned);
  const drip = Math.min(rawDrip, remaining);

  user.activity.vcMinutes += cappedMinutes;
  user.activity.vcDailyMinutes += cappedMinutes;
  user.activity.vcXp += xp;
  if (drip > 0) {
    user.wallet += drip;
    user.lifetimeEarned += drip;
    user.activity.vcDailyEarned += drip;
  }
  this.updateTitle(user);

  const after = rankFor(VC_RANKS, user.activity.vcXp || 0);
  const capLine = drip <= 0 ? "今日のVC Risは上限。ランクだけ伸びます。" : this.voiceRewardLine(user);
  if (after.name !== before.name) {
    const progress = rankWithProgress(VC_RANKS, user.activity.vcXp || 0);
    return {
      ok: true,
      kind: "vc_rank_up",
      title: "VCランク昇格",
      silent: Boolean(options.silent),
      lines: [`${user.name} が ${after.name} になりました。`, `VCレベル ${this.vcLevel(user)} / 通話 ${cappedMinutes}分 / 経験値 +${xp} / +${fmt(drip)}`, capLine],
      meta: {
        axis: "vc",
        userName: user.name,
        previousRank: before.name,
        newRank: after.name,
        nextRank: progress.nextMin !== null ? nextRankName(VC_RANKS, after.name) : null,
        nextRankAt: progress.nextMin,
        progressPercent: rankProgressPercent(progress),
        serverPosition: this.serverPositionByVcXp(user.id),
        serverTotal: this.joinedUserCount(),
        totalMinutes: user.activity.vcMinutes,
        xpTotal: user.activity.vcXp,
        xpGained: xp,
        drip,
        minutesThisClaim: cappedMinutes,
        salaryPerMinute: this.voiceSalaryPerMinute(user),
        level: this.vcLevel(user)
      }
    };
  }

  return {
    ok: true,
    kind: "vc_reward",
    title: "VC報酬",
    silent: Boolean(options.silent),
    lines: [`VCレベル ${this.vcLevel(user)} / 通話 ${cappedMinutes}分 / 経験値 +${xp} / +${fmt(drip)}`, capLine]
  };
};

TunedEconomyEngine.prototype.simulateText = function patchedSimulateText(user, countRaw) {
  const count = clamp(Math.floor(Number(countRaw) || 1), 1, 200);
  const xp = count;
  const money = count * 2;
  user.activity.textMessages += count;
  user.activity.textXp += xp;
  user.wallet += money;
  user.lifetimeEarned += money;
  this.updateTitle(user);
  return {
    ok: true,
    title: "TC活動をシミュレート",
    lines: [`${count}メッセージ / TC経験値 +${xp} / +${fmt(money)}`, `TCランク: ${this.textRank(user).name}`]
  };
};

TunedEconomyEngine.prototype.playerCard = function patchedPlayerCard(user) {
  const net = Math.floor(this.netWorth(user));
  const style = this.cardStyle(user);
  const score = this.cardScore(user);
  const textRank = rankWithProgress(TEXT_RANKS, user.activity.textXp || 0);
  const vcRank = rankWithProgress(VC_RANKS, user.activity.vcXp || 0);
  const title = `${user.name} / ${style.name}カード`;
  const data = {
    user,
    style,
    score,
    net,
    wallet: user.wallet,
    textRank,
    vcRank,
    textLevel: this.textLevel(user),
    vcLevel: this.vcLevel(user),
    vcSalaryPerMinute: this.voiceSalaryPerMinute(user)
  };
  return {
    ok: true,
    title,
    lines: renderTunedPlayerCardLines(data),
    card: buildTunedDiscordProfileCard(data)
  };
};

TunedEconomyEngine.prototype.cardScore = function patchedCardScore(user) {
  const base = OriginalEconomyEngine.prototype.cardScore.call(this, user);
  return base + rankIndex(TEXT_RANKS, user.activity.textXp || 0) + rankIndex(VC_RANKS, user.activity.vcXp || 0);
};

TunedEconomyEngine.prototype.leaderboard = function patchedLeaderboard(typeRaw = "net") {
  return buildMentionLeaderboard(this, null, typeRaw);
};

TunedEconomyEngine.prototype.voiceRewardLine = function patchedVoiceRewardLine(user) {
  this.resetVoiceDay(user);
  const settings = this.xpSettings();
  const cap = this.voiceDailyCap(user);
  const remaining = Math.max(0, cap - user.activity.vcDailyEarned);
  const state = user.activity.voiceJoinedAt ? "在室中" : "未接続";
  return `${state} / VCレベル ${this.vcLevel(user)} / 給与 ${fmt(this.voiceSalaryPerMinute(user))}/分 / VC経験値 ${settings.vcXpPerMinute}/分 / 今日 ${fmt(user.activity.vcDailyEarned)} / ${fmt(cap)} / 残り ${fmt(remaining)}`;
};

function renderTunedPlayerCardLines(data) {
  return [
    `+------------------------------+`,
    `| ${data.user.name}`,
    `| 純資産 ${fmt(data.net)} / 財布 ${fmt(data.wallet)}`,
    `| TC Lv.${data.textLevel} ${data.textRank.name} ${progressText(data.textRank)}`,
    `| VC Lv.${data.vcLevel} ${data.vcRank.name} ${progressText(data.vcRank)}`,
    `| VC給与 ${fmt(data.vcSalaryPerMinute)}/分`,
    `+------------------------------+`
  ];
}

function buildTunedDiscordProfileCard(data) {
  return {
    color: data.style.color,
    title: data.user.name,
    description: data.user.title || "アイリス市民",
    fields: [
      {
        name: "WALLET",
        value: [`財布 ${fmt(data.wallet)}`, `純資産 ${fmt(data.net)}`].join("\n"),
        inline: true
      },
      {
        name: "TC",
        value: [`Lv.${data.textLevel} ${data.textRank.name}`, `経験値 ${data.user.activity.textXp}`, progressText(data.textRank) || "(初期)"].join("\n"),
        inline: true
      },
      {
        name: "VC",
        value: [`Lv.${data.vcLevel} ${data.vcRank.name}`, `${data.user.activity.vcMinutes}分 / 経験値 ${data.user.activity.vcXp}`, progressText(data.vcRank) || "(初期)"].join("\n"),
        inline: true
      }
    ],
    footer: `型 ${data.style.name} / CARD ${data.score}`,
    profile: {
      name: data.user.name,
      title: data.user.title || "アイリス市民",
      styleName: data.style.name,
      styleTagline: data.style.tagline,
      premiumFrame: Boolean(data.user.inventory.frame),
      color: data.style.color,
      score: data.score,
      wallet: data.wallet,
      net: data.net,
      text: {
        name: data.textRank.name,
        level: data.textLevel,
        xp: data.user.activity.textXp,
        messages: data.user.activity.textMessages,
        progress: rankProgressPercent(data.textRank)
      },
      voice: {
        name: data.vcRank.name,
        level: data.vcLevel,
        salaryPerMinute: data.vcSalaryPerMinute,
        xp: data.user.activity.vcXp,
        minutes: data.user.activity.vcMinutes,
        progress: rankProgressPercent(data.vcRank)
      },
      economy: {
        name: "-",
        progress: 0
      }
    }
  };
}

function patchSlashCommandBuilder(discord) {
  const SlashCommandBuilder = discord?.SlashCommandBuilder;
  if (!SlashCommandBuilder?.prototype) return;

  const originalSetDescription = SlashCommandBuilder.prototype.setDescription;
  SlashCommandBuilder.prototype.setDescription = function patchedSetDescription(description) {
    return originalSetDescription.call(this, stripLoungeFromText(description));
  };

  const originalAddStringOption = SlashCommandBuilder.prototype.addStringOption;
  SlashCommandBuilder.prototype.addStringOption = function patchedAddStringOption(input) {
    if (typeof input !== "function") return originalAddStringOption.call(this, input);

    return originalAddStringOption.call(this, (option) => {
      const originalAddChoices = option.addChoices?.bind(option);
      if (originalAddChoices) {
        option.addChoices = (...choices) => {
          const filtered = choices.filter((choice) => choice?.value !== "lounge" && choice?.name !== "通話ラウンジ");
          return originalAddChoices(...filtered);
        };
      }
      return input(option);
    });
  };
}

try {
  patchSlashCommandBuilder(require("discord.js"));
} catch {
  // src/discord-core.js performs the existing dependency error handling.
}

require("./discord-core");
