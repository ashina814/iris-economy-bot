"use strict";

const fs = require("fs");
const path = require("path");
const Module = require("module");
const discord = require("discord.js");

const memberDirectoryByGuild = new Map();
const prefix = process.env.BOT_PREFIX || "!eco";
const targetDiscordEntrypoint = path.join(__dirname, "discord.js");
const targetDiscordCoreEntrypoint = path.join(__dirname, "discord-core.js");
const targetEconomyEntrypoint = path.join(__dirname, "economy.js");

function extractDiscordUserId(internalUserId) {
  const text = String(internalUserId || "");
  const index = text.indexOf(":");
  if (index < 0) return null;
  return text.slice(index + 1) || null;
}

function syncMember(member) {
  if (!member?.guild?.id || !member.user || member.user.bot) return;
  let directory = memberDirectoryByGuild.get(member.guild.id);
  if (!directory) {
    directory = new Map();
    memberDirectoryByGuild.set(member.guild.id, directory);
  }
  directory.set(member.user.id, {
    id: member.user.id,
    displayName: member.displayName || member.user.globalName || member.user.username || "名無し"
  });
}

function removeMember(member) {
  if (!member?.guild?.id || !member.user) return;
  const directory = memberDirectoryByGuild.get(member.guild.id);
  if (directory) directory.delete(member.user.id);
}

function syncGuildMembers(guild) {
  if (!guild?.id || !guild.members?.cache) return null;
  const directory = new Map();
  for (const member of guild.members.cache.values()) {
    if (!member.user?.bot) {
      directory.set(member.user.id, {
        id: member.user.id,
        displayName: member.displayName || member.user.globalName || member.user.username || "名無し"
      });
    }
  }
  memberDirectoryByGuild.set(guild.id, directory);
  return directory;
}

async function hydrateGuildMembers(guild) {
  if (!guild?.members?.fetch) return syncGuildMembers(guild);
  try {
    await guild.members.fetch();
  } catch (error) {
    console.warn(`ランキング用メンバー取得をスキップしました: ${error.message}`);
  }
  return syncGuildMembers(guild);
}

function guildFromEventPayload(payload) {
  return payload?.guild || payload?.member?.guild || payload?.guildId && payload.client?.guilds?.cache?.get?.(payload.guildId) || null;
}

function isRankingInteraction(interaction) {
  if (!interaction) return false;
  if (interaction.isButton?.() && String(interaction.customId || "").startsWith("eco:rank:")) return true;
  if (interaction.isStringSelectMenu?.() && String(interaction.customId || "").startsWith("eco:rank:")) return true;
  return false;
}

function isRankingMessage(message) {
  if (!message?.content || message.author?.bot) return false;
  if (!message.content.startsWith(prefix)) return false;
  const command = message.content.slice(prefix.length).trim().toLowerCase();
  return command === "rank" || command.startsWith("rank ") || command === "leaderboard" || command.startsWith("leaderboard ") || command === "ランキング" || command.startsWith("ランキング ");
}

function installMemberDirectoryPatch() {
  global.__IRIS_GUILD_MEMBER_DIRECTORY__ = {
    get(guildId) {
      return memberDirectoryByGuild.get(String(guildId || "")) || null;
    },
    extractDiscordUserId
  };

  const Client = discord.Client;
  if (!Client?.prototype || Client.prototype.__irisMemberDirectoryPatched) return;

  const originalEmit = Client.prototype.emit;
  Client.prototype.emit = function patchedEmit(eventName, ...args) {
    const event = String(eventName);
    const first = args[0];

    if (event === discord.Events.ClientReady || event === "ready") {
      for (const guild of this.guilds?.cache?.values?.() || []) {
        hydrateGuildMembers(guild).catch((error) => console.warn(`ランキング用メンバー初期化失敗: ${error.message}`));
      }
      return originalEmit.call(this, eventName, ...args);
    }

    if (event === discord.Events.GuildMemberAdd || event === "guildMemberAdd" || event === discord.Events.GuildMemberUpdate || event === "guildMemberUpdate") {
      syncMember(args[args.length - 1]);
      return originalEmit.call(this, eventName, ...args);
    }

    if (event === discord.Events.GuildMemberRemove || event === "guildMemberRemove") {
      removeMember(first);
      return originalEmit.call(this, eventName, ...args);
    }

    if ((event === discord.Events.InteractionCreate || event === "interactionCreate") && isRankingInteraction(first)) {
      const guild = guildFromEventPayload(first);
      if (guild) {
        hydrateGuildMembers(guild)
          .catch((error) => console.warn(`ランキング用メンバー更新失敗: ${error.message}`))
          .finally(() => originalEmit.call(this, eventName, ...args));
        return true;
      }
    }

    if ((event === discord.Events.MessageCreate || event === "messageCreate") && isRankingMessage(first)) {
      const guild = guildFromEventPayload(first);
      if (guild) {
        hydrateGuildMembers(guild)
          .catch((error) => console.warn(`ランキング用メンバー更新失敗: ${error.message}`))
          .finally(() => originalEmit.call(this, eventName, ...args));
        return true;
      }
    }

    const guild = guildFromEventPayload(first);
    if (guild) syncGuildMembers(guild);
    return originalEmit.call(this, eventName, ...args);
  };
  Client.prototype.__irisMemberDirectoryPatched = true;
}

function installDiscordEntrypointTransform() {
  if (Module._extensions[".js"].__irisRankingTransformPatched) return;

  const originalLoader = Module._extensions[".js"];
  Module._extensions[".js"] = function irisRankingTransform(module, filename) {
    const resolved = path.resolve(filename);
    let content = null;
    if (resolved === path.resolve(targetDiscordEntrypoint)) {
      content = patchRankingSource(fs.readFileSync(filename, "utf8"));
    } else if (resolved === path.resolve(targetDiscordCoreEntrypoint)) {
      content = patchBumpUpSource(fs.readFileSync(filename, "utf8"));
    } else if (resolved === path.resolve(targetEconomyEntrypoint)) {
      content = patchBumpUpLabels(fs.readFileSync(filename, "utf8"));
    }

    if (content === null) return originalLoader(module, filename);
    return module._compile(content, filename);
  };
  Module._extensions[".js"].__irisRankingTransformPatched = true;
}

function patchBumpUpLabels(source) {
  return source
    .replaceAll("Bumpランキング", "Bump/Upランキング")
    .replaceAll("Bump階級", "Bump/Up階級")
    .replaceAll("Bump受付", "Bump/Up受付")
    .replaceAll("Bumpしました", "Bump/Upしました")
    .replaceAll("Bump ${fmt", "Bump/Up ${fmt")
    .replaceAll("Bump: DISBOARD", "Bump/Up: DISBOARD")
    .replaceAll("Bump の", "Bump/Up の")
    .replaceAll("Bump 回数", "Bump/Up 回数");
}

function patchBumpUpSource(source) {
  let content = patchBumpUpLabels(source);
  content = content.replace(
    `    const description = message.embeds?.[0]?.description || "";\n    if (!description.includes("表示順をアップ") && !/Bump done/i.test(description)) return;`,
    `    const description = message.embeds?.[0]?.description || "";\n    const bumpText = [description, message.content || ""].join("\\n");\n    const isBumpOrUp = description.includes("表示順をアップ")\n      || /Bump done/i.test(bumpText)\n      || /Up done/i.test(bumpText)\n      || /\\/(?:bump|up)\\b/i.test(bumpText)\n      || /(?:bump|up)\\s*(?:done|success|complete|完了|成功)/i.test(bumpText);\n    if (!isBumpOrUp) return;`
  );
  content = content
    .replaceAll("Bumpありがとう", "Bump/Upありがとう")
    .replaceAll("Bump階級昇格", "Bump/Up階級昇格")
    .replaceAll("Bump のランク", "Bump/Up のランク")
    .replaceAll("Bump 回数", "Bump/Up 回数");
  return content;
}

function patchRankingSource(source) {
  let content = patchBumpUpLabels(source);

  content = content.replace(
    `function userMention(user) {\n  const discordId = extractDiscordUserId(user?.id);\n  return discordId ? \`<@\${discordId}>\` : (user?.name || "名無し");\n}\n`,
    `function userMention(user, member = null) {\n  const discordId = extractDiscordUserId(user?.id);\n  const displayName = member?.displayName || user?.name || "名無し";\n  return discordId ? \`<@\${discordId}>（\${displayName}）\` : displayName;\n}\n\nfunction guildIdFromInternalUserId(internalUserId) {\n  const text = String(internalUserId || "");\n  const index = text.indexOf(":");\n  if (index < 0) return null;\n  return text.slice(0, index) || null;\n}\n\nfunction memberDirectoryForActor(actor) {\n  const guildId = guildIdFromInternalUserId(actor?.id);\n  if (!guildId || guildId === "dm") return null;\n  return global.__IRIS_GUILD_MEMBER_DIRECTORY__?.get?.(guildId) || null;\n}\n\nfunction memberRecordForUser(user, memberDirectory) {\n  if (!memberDirectory) return null;\n  const discordId = extractDiscordUserId(user?.id);\n  if (!discordId) return null;\n  return memberDirectory.get(discordId) || null;\n}\n`
  );

  content = content.replace(
    `function buildMentionLeaderboard(engine, actor, typeRaw = "net") {\n  const spec = leaderboardSpec(typeRaw);\n  const users = Object.values(engine.state.users || {}).filter((user) => user.joined);`,
    `function buildMentionLeaderboard(engine, actor, typeRaw = "net") {\n  const spec = leaderboardSpec(typeRaw);\n  const memberDirectory = memberDirectoryForActor(actor);\n  const users = Object.values(engine.state.users || {}).filter((user) => {\n    const value = spec.score(user);\n    const hasRankingValue = value > 0;\n    const isRequester = actor?.id && user.id === actor.id;\n    const isEligibleRecord = user.joined || hasRankingValue || isRequester;\n    if (!isEligibleRecord) return false;\n    if (!memberDirectory) return true;\n    return Boolean(memberRecordForUser(user, memberDirectory));\n  });`
  );

  content = content.replace(
    `  const lines = top.map((entry, index) => {\n    const selfMark = entry.user.id === actorId ? " ← あなた" : "";\n    return \`\${index + 1}. \${userMention(entry.user)} - \${spec.label(entry.value, entry.user)}\${selfMark}\`;\n  });`,
    `  const lines = top.map((entry, index) => {\n    const selfMark = entry.user.id === actorId ? " ← あなた" : "";\n    const member = memberRecordForUser(entry.user, memberDirectory);\n    return \`\${index + 1}. \${userMention(entry.user, member)} - \${spec.label(entry.value, entry.user)}\${selfMark}\`;\n  });`
  );

  content = content.replace(
    `      lines.push(\`\${userMention(self.user)} - \${spec.label(self.value, self.user)}\`);`,
    `      lines.push(\`\${userMention(self.user, memberRecordForUser(self.user, memberDirectory))} - \${spec.label(self.value, self.user)}\`);`
  );

  content = content.replace(
    `      lines.push(\`\${userMention(self)} - \${spec.label(spec.score(self), self)}\`);`,
    `      lines.push(\`\${userMention(self, memberRecordForUser(self, memberDirectory))} - \${spec.label(spec.score(self), self)}\`);`
  );

  content = content.replace(
    `function handleXpSettingsCommand(engine, input) {`,
    `function stableAdminRankPanel(engine) {\n  const settings = engine.xpSettings ? engine.xpSettings() : DEFAULT_XP_SETTINGS;\n  const panel = {\n    title: "ランク設定",\n    description: "ランク確認パネル、昇格通知先、TC/VC XP設定を管理します。",\n    color: 0x334155,\n    fields: [\n      { name: "ランク確認パネル", value: "このチャンネルに住民向けの常設ランキングパネルを送信できます。", inline: false },\n      { name: "昇格通知", value: "通知先をこのチャンネルに設定、または解除できます。", inline: true },\n      { name: "TC/VC XP設定", value: xpSettingsSummary(settings), inline: true }\n    ],\n    components: [\n      buttons([\n        { kind: "custom", label: "ランク確認パネル送信", customId: "eco:admin:rank-panel-post", style: "primary" },\n        { kind: "custom", label: "通知先をここにする", customId: "eco:admin:rank-notify-set", style: "success" },\n        { kind: "custom", label: "通知先解除", customId: "eco:admin:rank-notify-clear", style: "danger" }\n      ]),\n      buttons([\n        panelButton("XP設定", "rank-xp-settings", "primary"),\n        panelButton("運営パネル", "admin")\n      ])\n    ]\n  };\n  return { ok: true, title: panel.title, lines: [panel.description, xpSettingsSummary(settings)], panel };\n}\n\nfunction handleXpSettingsCommand(engine, input) {`
  );

  content = content.replace(
    `  if (LOUNGE_PANEL_IDS.has(panelId)) return loungeRemovedResult();\n  if (panelId === "rank-xp-settings" || panelId === "xp-settings") return xpSettingsPanel(this);`,
    `  if (LOUNGE_PANEL_IDS.has(panelId)) return loungeRemovedResult();\n  if (panelId === "admin-rank" || panelId === "rank-settings") return stableAdminRankPanel(this);\n  if (panelId === "rank-xp-settings" || panelId === "xp-settings") return xpSettingsPanel(this);`
  );

  return content;
}

installMemberDirectoryPatch();
installDiscordEntrypointTransform();
require("./discord.js");
