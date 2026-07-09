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

installGuildMemberAddContext();
installManualJoinGrantGuard();

require("./discord-entry.js");
