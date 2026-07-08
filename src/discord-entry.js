"use strict";

const fs = require("fs");
const path = require("path");
const Module = require("module");
const discord = require("discord.js");

const memberDirectoryByGuild = new Map();
const prefix = process.env.BOT_PREFIX || "!eco";
const targetDiscordEntrypoint = path.join(__dirname, "discord.js");

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
    if (path.resolve(filename) !== path.resolve(targetDiscordEntrypoint)) {
      return originalLoader(module, filename);
    }

    let content = fs.readFileSync(filename, "utf8");
    content = patchRankingSource(content);
    return module._compile(content, filename);
  };
  Module._extensions[".js"].__irisRankingTransformPatched = true;
}

function patchRankingSource(source) {
  let content = source;

  content = content.replace(
    `function userMention(user) {\n  const discordId = extractDiscordUserId(user?.id);\n  return discordId ? \`<@\${discordId}>\` : (user?.name || "名無し");\n}\n`,
    `function userMention(user, member = null) {\n  const discordId = extractDiscordUserId(user?.id);\n  const displayName = member?.displayName || user?.name || "名無し";\n  return discordId ? \`<@\${discordId}>（\${displayName}）\` : displayName;\n}\n\nfunction guildIdFromInternalUserId(internalUserId) {\n  const text = String(internalUserId || "");\n  const index = text.indexOf(":");\n  if (index < 0) return null;\n  return text.slice(0, index) || null;\n}\n\nfunction memberDirectoryForActor(actor) {\n  const guildId = guildIdFromInternalUserId(actor?.id);\n  if (!guildId || guildId === "dm") return null;\n  return global.__IRIS_GUILD_MEMBER_DIRECTORY__?.get?.(guildId) || null;\n}\n\nfunction memberRecordForUser(user, memberDirectory) {\n  if (!memberDirectory) return null;\n  const discordId = extractDiscordUserId(user?.id);\n  if (!discordId) return null;\n  return memberDirectory.get(discordId) || null;\n}\n`
  );

  content = content.replace(
    `function buildMentionLeaderboard(engine, actor, typeRaw = "net") {\n  const spec = leaderboardSpec(typeRaw);\n  const users = Object.values(engine.state.users || {}).filter((user) => user.joined);`,
    `function buildMentionLeaderboard(engine, actor, typeRaw = "net") {\n  const spec = leaderboardSpec(typeRaw);\n  const memberDirectory = memberDirectoryForActor(actor);\n  const users = Object.values(engine.state.users || {}).filter((user) => {\n    if (!user.joined) return false;\n    if (!memberDirectory) return true;\n    return Boolean(memberRecordForUser(user, memberDirectory));\n  });`
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

  return content;
}

installMemberDirectoryPatch();
installDiscordEntrypointTransform();
require("./discord.js");
