"use strict";

const { EconomyEngine } = require("./economy");

const LOUNGE_PANEL_IDS = new Set(["lounge", "通話", "ラウンジ", "通話ラウンジ"]);

function normalizePanelId(value) {
  return String(value || "").trim().toLowerCase();
}

function isLoungeRoute(value) {
  const text = normalizePanelId(value);
  return text === "lounge" || text === "panel lounge" || text === "panel:lounge" || text.endsWith(":lounge");
}

function isLoungeCommand(input) {
  const text = normalizePanelId(input);
  return text === "lounge" || text === "通話" || text === "ラウンジ" || text === "通話ラウンジ" || text === "panel lounge" || text === "panel 通話" || text === "panel ラウンジ" || text === "panel 通話ラウンジ";
}

function loungeRemovedResult() {
  return {
    ok: false,
    title: "通話ラウンジは廃止しました",
    lines: [
      "この入口は現在使えません。",
      "VC報酬の精算が必要な場合は `vc` コマンドを使ってください。"
    ]
  };
}

function stripLoungeFromText(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/(?:、|・)?通話ラウンジ/g, "")
    .replace(/二人宿・の/g, "二人宿の")
    .replace(/、?通話。/g, "。");
}

function shouldDropComponent(item) {
  if (!item || typeof item !== "object") return false;
  const values = [item.command, item.customId, item.custom_id, item.value, item.id];
  if (values.some((value) => typeof value === "string" && isLoungeRoute(value))) return true;
  if ((item.label === "通話" || item.label === "通話ラウンジ") && values.some((value) => typeof value === "string")) return true;
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

const originalRun = EconomyEngine.prototype.run;
const originalPanel = EconomyEngine.prototype.panel;

EconomyEngine.prototype.run = function patchedRun(input, actor) {
  if (isLoungeCommand(input)) return loungeRemovedResult();
  return sanitizeResult(originalRun.call(this, input, actor));
};

EconomyEngine.prototype.panel = function patchedPanel(user, panelIdRaw = "home") {
  const panelId = normalizePanelId(panelIdRaw);
  if (LOUNGE_PANEL_IDS.has(panelId)) return loungeRemovedResult();
  return sanitizeResult(originalPanel.call(this, user, panelIdRaw));
};

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
