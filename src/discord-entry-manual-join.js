"use strict";

const { AsyncLocalStorage } = require("async_hooks");
const discord = require("discord.js");
const economy = require("./economy");

const guildMemberAddContext = new AsyncLocalStorage();

function isGuildMemberAddEvent(eventName) {
  return eventName === discord.Events.GuildMemberAdd || eventName === "guildMemberAdd";
}

function isJoinCommand(input) {
  const command = String(input || "").trim().toLowerCase();
  return command === "join" || command === "start" || command === "参加";
}

function installGuildMemberAddContext() {
  const Client = discord.Client;
  if (!Client?.prototype || Client.prototype.__irisManualJoinContextInstalled) return;

  const originalEmit = Client.prototype.emit;
  Client.prototype.emit = function irisManualJoinContextEmit(eventName, ...args) {
    if (isGuildMemberAddEvent(eventName)) {
      return guildMemberAddContext.run({ suppressStarterGrant: true }, () => originalEmit.call(this, eventName, ...args));
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
