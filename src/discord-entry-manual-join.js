"use strict";

const { AsyncLocalStorage } = require("async_hooks");
const discord = require("discord.js");
const economy = require("./economy");

const guildMemberAddContext = new AsyncLocalStorage();
const SHOP_MAINTENANCE = process.env.IRIS_SHOP_MAINTENANCE !== "0";

function isGuildMemberAddEvent(eventName) {
  return eventName === discord.Events.GuildMemberAdd || eventName === "guildMemberAdd";
}

function isInteractionCreateEvent(eventName) {
  return eventName === discord.Events.InteractionCreate || eventName === "interactionCreate";
}

function isJoinCommand(input) {
  const command = String(input || "").trim().toLowerCase();
  return command === "join" || command === "start" || command === "参加";
}

function normalizeComponentCommand(value) {
  const text = String(value || "").trim();
  if (text.startsWith("panel:")) return `panel ${text.slice(6)}`;
  if (text.startsWith("run:")) return text.slice(4);
  return text;
}

function isShopRelatedCommand(input) {
  const command = normalizeComponentCommand(input).trim().toLowerCase();
  if (!command) return false;

  return command === "panel marketplace"
    || command === "panel my-shop"
    || command === "panel market-admin"
    || command === "panel market-review"
    || command === "panel market-trades"
    || command === "panel market-logs"
    || command.startsWith("panel marketplace ")
    || command.startsWith("panel my-shop ")
    || command.startsWith("panel market-")
    || command.startsWith("marketplace")
    || command.startsWith("market-")
    || command.startsWith("shop-")
    || command.startsWith("my-shop")
    || command.includes(" marketplace")
    || command.includes(" market-")
    || command.includes(" shop-");
}

function isShopRelatedCustomId(customId) {
  const id = String(customId || "");
  if (!id) return false;

  return id === "eco:panel:marketplace"
    || id === "eco:panel:my-shop"
    || id.startsWith("eco:panel:market-")
    || id.startsWith("eco:run:marketplace")
    || id.startsWith("eco:run:market-")
    || id.startsWith("eco:run:shop-")
    || id.startsWith("eco:market:")
    || id.startsWith("eco:shop:")
    || id.startsWith("eco:review:")
    || id.startsWith("eco:order:")
    || id.startsWith("eco:modal:market")
    || id.startsWith("eco:modal:shop")
    || id.startsWith("eco:modal:review-");
}

function isShopSlashCommand(interaction) {
  const name = String(interaction?.commandName || "");
  return name === "マーケット" || name === "自分の店";
}

function isShopRelatedInteraction(interaction) {
  if (!SHOP_MAINTENANCE || !interaction) return false;
  if (isShopSlashCommand(interaction)) return true;
  if (isShopRelatedCustomId(interaction.customId)) return true;

  const values = Array.isArray(interaction.values) ? interaction.values : [];
  if (values.some((value) => isShopRelatedCommand(value))) return true;

  return false;
}

function shopMaintenanceResult() {
  return {
    ok: false,
    title: "ショップ一時停止中",
    lines: [
      "ショップ/マーケット機能は一時メンテナンス中です。",
      "所持金、カード、送金、ランク、宿などはそのまま使えます。",
      "出品・購入・審査・オークション・自分の店は復旧まで止めています。"
    ]
  };
}

async function replyShopMaintenance(interaction) {
  if (!interaction?.isRepliable?.()) return false;
  const payload = {
    content: "ショップ/マーケット機能は一時メンテナンス中です。出品・購入・審査・オークション・自分の店は復旧まで停止しています。",
    ephemeral: true
  };

  try {
    if (interaction.deferred || interaction.replied) await interaction.followUp(payload);
    else await interaction.reply(payload);
    console.warn(`[shop-maintenance] blocked ${interaction.customId || interaction.commandName || "interaction"}`);
    return true;
  } catch (error) {
    console.warn(`[shop-maintenance] failed to reply: ${error.message}`);
    return false;
  }
}

function installGuildMemberAddContext() {
  const Client = discord.Client;
  if (!Client?.prototype || Client.prototype.__irisManualJoinContextInstalled) return;

  const originalEmit = Client.prototype.emit;
  Client.prototype.emit = function irisManualJoinContextEmit(eventName, ...args) {
    if (isGuildMemberAddEvent(eventName)) {
      return guildMemberAddContext.run({ suppressStarterGrant: true }, () => originalEmit.call(this, eventName, ...args));
    }

    if (isInteractionCreateEvent(eventName) && isShopRelatedInteraction(args[0])) {
      replyShopMaintenance(args[0]).catch((error) => console.warn(`[shop-maintenance] interaction guard failed: ${error.message}`));
      return true;
    }

    return originalEmit.call(this, eventName, ...args);
  };

  Client.prototype.__irisManualJoinContextInstalled = true;
}

function installManualJoinGrantGuard() {
  const Engine = economy.EconomyEngine;
  if (!Engine?.prototype || Engine.prototype.__irisManualJoinGrantGuardInstalled) return;

  const originalRun = Engine.prototype.run;
  Engine.prototype.run = function irisManualJoinGuardedRun(input, actor) {
    if (guildMemberAddContext.getStore()?.suppressStarterGrant && isJoinCommand(input)) {
      const user = this.getUser(actor.id, actor.name);
      console.log(`[manual-join] suppressed automatic starter grant for ${actor.id}`);
      return {
        ok: true,
        title: "参加待ち",
        lines: [
          `${user.name} が参加しました。`,
          "初期Risは参加ボタンを押した時に付与します。"
        ],
        inviteRankUp: null,
        inviterId: null
      };
    }

    if (SHOP_MAINTENANCE && isShopRelatedCommand(input)) {
      console.warn(`[shop-maintenance] blocked command: ${String(input || "")}`);
      return shopMaintenanceResult();
    }

    return originalRun.call(this, input, actor);
  };

  Engine.prototype.__irisManualJoinGrantGuardInstalled = true;
}

function componentKey(component) {
  if (!component || typeof component !== "object") return null;
  return component.custom_id || component.customId || null;
}

function componentJson(component) {
  if (!component || typeof component !== "object") return component;
  if (typeof component.toJSON === "function") return component.toJSON();
  return component;
}

function sanitizeComponents(components) {
  if (!Array.isArray(components) || components.length === 0) return components;

  const seen = new Set();
  const rows = [];
  let dropped = 0;

  for (const row of components) {
    const rowJson = componentJson(row);
    const rowComponents = Array.isArray(rowJson?.components) ? rowJson.components : [];
    const cleanRowComponents = [];

    for (const component of rowComponents) {
      const json = componentJson(component);
      const key = componentKey(json);
      if (key) {
        if (seen.has(key)) {
          dropped += 1;
          continue;
        }
        seen.add(key);
      }
      cleanRowComponents.push(json);
    }

    if (cleanRowComponents.length > 0) {
      rows.push({ ...rowJson, components: cleanRowComponents });
    }
  }

  if (dropped > 0) {
    console.warn(`[component-guard] dropped ${dropped} duplicate component custom_id(s)`);
  }

  return rows;
}

function sanitizeInteractionPayload(payload) {
  if (!payload || typeof payload !== "object" || !Array.isArray(payload.components)) return payload;
  return { ...payload, components: sanitizeComponents(payload.components) };
}

function patchResponseMethod(prototype, methodName) {
  if (!prototype || typeof prototype[methodName] !== "function") return;
  const flag = `__irisComponentGuard_${methodName}`;
  if (prototype[flag]) return;

  const original = prototype[methodName];
  prototype[methodName] = function irisComponentGuardedResponse(options, ...args) {
    return original.call(this, sanitizeInteractionPayload(options), ...args);
  };
  prototype[flag] = true;
}

function installComponentDuplicateGuard() {
  const classes = [
    discord.ButtonInteraction,
    discord.StringSelectMenuInteraction,
    discord.UserSelectMenuInteraction,
    discord.RoleSelectMenuInteraction,
    discord.ChannelSelectMenuInteraction,
    discord.MentionableSelectMenuInteraction,
    discord.ChatInputCommandInteraction,
    discord.ModalSubmitInteraction
  ].filter(Boolean);

  for (const klass of classes) {
    patchResponseMethod(klass.prototype, "reply");
    patchResponseMethod(klass.prototype, "update");
    patchResponseMethod(klass.prototype, "followUp");
    patchResponseMethod(klass.prototype, "editReply");
  }
}

installGuildMemberAddContext();
installManualJoinGrantGuard();
installComponentDuplicateGuard();

require("./discord-entry.js");
