"use strict";

const DAY_MS = 24 * 60 * 60 * 1000;
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAILY_CONFIG = Object.freeze({
  baseAmount: 600,
  streakStep: 120,
  streakBonusCap: 1800,
  stampBonus: 250,
  randomMax: 180,
  xp: 12
});

const nicknameCleanupLocks = new Set();

function validDate(value) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function jstDayNumber(value) {
  const date = validDate(value);
  if (!date) return null;
  return Math.floor((date.getTime() + JST_OFFSET_MS) / DAY_MS);
}

function jstDayKey(value) {
  const dayNumber = jstDayNumber(value);
  if (dayNumber === null) return null;
  return new Date(dayNumber * DAY_MS).toISOString().slice(0, 10);
}

function nextJstMidnight(value) {
  const dayNumber = jstDayNumber(value);
  if (dayNumber === null) return null;
  return new Date((dayNumber + 1) * DAY_MS - JST_OFFSET_MS);
}

function getDailyStatus(user, nowValue = new Date()) {
  const now = validDate(nowValue) || new Date();
  const currentDay = jstDayNumber(now);
  const lastClaim = validDate(user?.lastDaily);
  const lastDay = lastClaim ? jstDayNumber(lastClaim) : null;
  const storedStreak = Math.max(0, Math.floor(Number(user?.streak) || 0));
  const dayGap = lastDay === null ? null : currentDay - lastDay;
  const claimable = lastDay === null || dayGap >= 1;
  const nextStreak = lastDay !== null && dayGap === 1 ? storedStreak + 1 : 1;

  return {
    claimable,
    currentDayKey: jstDayKey(now),
    lastDayKey: lastClaim ? jstDayKey(lastClaim) : null,
    dayGap,
    streak: storedStreak,
    nextStreak,
    nextResetAt: nextJstMidnight(now)
  };
}

function dailyResetTimestamp(status) {
  const resetAt = status?.nextResetAt;
  if (!resetAt) return null;
  return Math.floor(resetAt.getTime() / 1000);
}

function dailyStatusLine(user, nowValue = new Date()) {
  const status = getDailyStatus(user, nowValue);
  if (status.claimable) {
    return `受取可能 / 次は連続 ${status.nextStreak}日目`;
  }
  const reset = dailyResetTimestamp(status);
  return `本日分は受取済み / 次回 <t:${reset}:R> / 現在 ${status.streak}日連続`;
}

function claimDaily(engine, user) {
  const now = validDate(engine?.now?.()) || new Date();
  const status = getDailyStatus(user, now);
  const reset = dailyResetTimestamp(status);

  if (!status.claimable) {
    return {
      ok: false,
      title: "本日のログボは受取済み",
      lines: [
        `次回は <t:${reset}:R>（日本時間 0:00）から受け取れます。`,
        `現在 ${status.streak}日連続です。`
      ],
      meta: {
        daily: {
          claimable: false,
          dayKey: status.currentDayKey,
          streak: status.streak,
          nextResetAt: status.nextResetAt?.toISOString() || null
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
    engine.log(user, "daily", amount, `ログボ JST ${status.currentDayKey} / ${streak}日連続`);
  }

  return {
    ok: true,
    title: "ログボ支給",
    lines: [
      `${amount.toLocaleString("ja-JP")} Ris を受け取りました。`,
      `内訳: 基本 ${DAILY_CONFIG.baseAmount.toLocaleString("ja-JP")} / 連続 ${streakBonus.toLocaleString("ja-JP")} / ランダム ${randomRoll.toLocaleString("ja-JP")}${stampBonus ? ` / 常連カード ${stampBonus.toLocaleString("ja-JP")}` : ""}`,
      `連続 ${streak}日。次回は <t:${reset}:R>（日本時間 0:00）から。`,
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
        nextResetAt: status.nextResetAt?.toISOString() || null
      }
    }
  };
}

function normalizePanelComponentRows(panel) {
  if (!panel || !Array.isArray(panel.components)) return;
  const normalized = [];
  for (const row of panel.components) {
    if (row?.type !== "buttons" || !Array.isArray(row.items) || row.items.length <= 5) {
      normalized.push(row);
      continue;
    }
    for (let index = 0; index < row.items.length; index += 5) {
      normalized.push({ ...row, items: row.items.slice(index, index + 5) });
    }
  }
  panel.components = normalized;
}

function installEconomyExtensions(economyModule) {
  const economy = economyModule || require("./economy");
  const Engine = economy.EconomyEngine;
  if (!Engine?.prototype || Engine.prototype.__irisOperationsExtensionInstalled) return;

  const originalPanel = Engine.prototype.panel;
  const originalLoopSuggestion = Engine.prototype.loopSuggestion;

  Engine.prototype.daily = function irisJstDaily(user) {
    return claimDaily(this, user);
  };

  Engine.prototype.loopSuggestion = function irisDailyAwareLoopSuggestion(user) {
    const suggestions = [];
    if (!user.joined) suggestions.push("まず `参加` で初期資本を受け取る");
    if (getDailyStatus(user, this.now()).claimable) suggestions.push("今日のログボを受け取る");
    if (suggestions.length === 0 && typeof originalLoopSuggestion === "function") {
      const original = String(originalLoopSuggestion.call(this, user) || "");
      for (const line of original.split("\n")) {
        if (line && !line.includes("ログボ")) suggestions.push(line);
      }
    }
    if (suggestions.length === 0) suggestions.push("カードを見る、VCに入る、ショップを眺める");
    return suggestions.slice(0, 3).join("\n");
  };

  Engine.prototype.panel = function irisOperationsPanel(user, panelIdRaw = "home") {
    const result = originalPanel.call(this, user, panelIdRaw);
    const panelId = String(panelIdRaw || "home").trim().toLowerCase();
    const panel = result?.panel;
    if (!panel) return result;

    if (["home", "ホーム", "menu", "パネル"].includes(panelId)) {
      panel.fields = Array.isArray(panel.fields) ? panel.fields : [];
      panel.fields.push({ name: "ログボ", value: dailyStatusLine(user, this.now()), inline: true });
      const rows = Array.isArray(panel.components) ? panel.components : [];
      for (const row of rows) {
        if (row?.type !== "buttons" || !Array.isArray(row.items)) continue;
        const dailyButton = row.items.find((item) => item?.kind === "run" && item.command === "daily");
        if (!dailyButton) continue;
        const status = getDailyStatus(user, this.now());
        if (!status.claimable) {
          dailyButton.label = "ログボ済み";
          dailyButton.disabled = true;
        }
      }
    }

    if (["admin", "管理", "運営"].includes(panelId)) {
      panel.fields = Array.isArray(panel.fields) ? panel.fields : [];
      panel.fields.push({
        name: "ニックネーム整理",
        value: "サーバー内のカスタムニックネームを確認後に一括削除します。権限順位で変更できないメンバーは自動でスキップします。",
        inline: false
      });
      panel.components = Array.isArray(panel.components) ? panel.components : [];
      panel.components.push({
        type: "buttons",
        items: [{
          kind: "custom",
          label: "ニックネーム一括削除",
          customId: "eco:admin:nickname-clear-preview",
          style: "danger",
          disabled: false
        }]
      });
      if (Array.isArray(result.lines)) {
        result.lines.push("ニックネーム整理: 実行前に対象件数を確認します。");
      }
    }

    normalizePanelComponentRows(panel);
    return result;
  };

  Engine.prototype.__irisOperationsExtensionInstalled = true;
}

function adminIdSet() {
  return new Set(
    String(process.env.ECONOMY_ADMIN_IDS || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  );
}

function hasPermission(interaction, permission) {
  try {
    return Boolean(interaction?.memberPermissions?.has?.(permission));
  } catch {
    return false;
  }
}

function isOperationsAdmin(interaction, PermissionFlagsBits) {
  const userId = String(interaction?.user?.id || "");
  if (userId && adminIdSet().has(userId)) return true;
  return hasPermission(interaction, PermissionFlagsBits.Administrator)
    || hasPermission(interaction, PermissionFlagsBits.ManageGuild);
}

function nicknameTargets(members, includeBots = false) {
  const values = members?.values ? [...members.values()] : Array.from(members || []);
  return values.filter((member) => {
    if (!member || member.nickname === null || member.nickname === undefined) return false;
    if (!includeBots && member.user?.bot) return false;
    return true;
  });
}

function nicknamePreviewPayload(discord, counts) {
  const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = discord;
  const embed = new EmbedBuilder()
    .setTitle("ニックネーム一括削除の確認")
    .setColor(0xdc2626)
    .setDescription("カスタムニックネームをDiscord上の元の表示名へ戻します。この操作は元のニックネームを保存しません。")
    .addFields(
      { name: "通常ユーザー", value: `${counts.humans.toLocaleString("ja-JP")}人`, inline: true },
      { name: "Bot", value: `${counts.bots.toLocaleString("ja-JP")}体`, inline: true },
      { name: "実行時の扱い", value: "サーバー所有者やBotより上位のロールなど、変更不能な対象はスキップして結果を集計します。", inline: false }
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("eco:admin:nickname-clear-execute:humans")
      .setLabel("通常ユーザーのみ削除")
      .setStyle(ButtonStyle.Danger)
      .setDisabled(counts.humans === 0),
    new ButtonBuilder()
      .setCustomId("eco:admin:nickname-clear-execute:all")
      .setLabel("Botを含めて削除")
      .setStyle(ButtonStyle.Danger)
      .setDisabled(counts.humans + counts.bots === 0),
    new ButtonBuilder()
      .setCustomId("eco:admin:nickname-clear-cancel")
      .setLabel("キャンセル")
      .setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row], ephemeral: true };
}

async function fetchGuildMembers(interaction) {
  if (!interaction?.guild?.members) return null;
  try {
    return await interaction.guild.members.fetch();
  } catch (error) {
    console.warn(`[nickname-cleanup] member fetch failed: ${error.message}`);
    return interaction.guild.members.cache || null;
  }
}

async function sendNicknameAudit(interaction, summary) {
  const channelId = String(process.env.DISCORD_LOG_CHANNEL_ID || "").trim();
  if (!channelId || !interaction?.client?.channels?.fetch) return;
  const channel = await interaction.client.channels.fetch(channelId).catch(() => null);
  if (!channel?.isTextBased?.()) return;
  const includeBotsText = summary.includeBots ? "Bot含む" : "通常ユーザーのみ";
  await channel.send({
    content: [
      "🧹 ニックネーム一括削除",
      `実行者: <@${interaction.user.id}>`,
      `対象: ${includeBotsText}`,
      `削除: ${summary.removed} / 権限でスキップ: ${summary.skipped} / 失敗: ${summary.failed}`
    ].join("\n")
  }).catch(() => null);
}

async function handleNicknamePreview(interaction, discord) {
  const { PermissionFlagsBits } = discord;
  if (!isOperationsAdmin(interaction, PermissionFlagsBits)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  if (!interaction.guild) {
    await interaction.reply({ content: "サーバー内で実行してください。", ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });
  const members = await fetchGuildMembers(interaction);
  const all = nicknameTargets(members, true);
  const counts = {
    humans: all.filter((member) => !member.user?.bot).length,
    bots: all.filter((member) => member.user?.bot).length
  };
  await interaction.editReply(nicknamePreviewPayload(discord, counts));
}

async function handleNicknameExecute(interaction, discord, includeBots) {
  const { PermissionFlagsBits } = discord;
  if (!isOperationsAdmin(interaction, PermissionFlagsBits)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  if (!interaction.guild) {
    await interaction.reply({ content: "サーバー内で実行してください。", ephemeral: true });
    return;
  }

  const guildId = interaction.guild.id;
  if (nicknameCleanupLocks.has(guildId)) {
    await interaction.reply({ content: "このサーバーではニックネーム削除を実行中です。", ephemeral: true });
    return;
  }

  nicknameCleanupLocks.add(guildId);
  await interaction.deferReply({ ephemeral: true });

  try {
    const me = interaction.guild.members.me
      || await interaction.guild.members.fetchMe?.().catch(() => null);
    if (!me?.permissions?.has?.(PermissionFlagsBits.ManageNicknames)) {
      await interaction.editReply({ content: "Botに「ニックネームの管理」権限がありません。権限を付けてから再実行してください。" });
      return;
    }

    const members = await fetchGuildMembers(interaction);
    const targets = nicknameTargets(members, includeBots);
    let removed = 0;
    let skipped = 0;
    let failed = 0;
    const errors = [];

    for (const member of targets) {
      if (!member.manageable || typeof member.setNickname !== "function") {
        skipped += 1;
        continue;
      }
      try {
        await member.setNickname(null, `一括ニックネーム削除: ${interaction.user.tag || interaction.user.id}`);
        removed += 1;
      } catch (error) {
        failed += 1;
        if (errors.length < 3) errors.push(`${member.user?.tag || member.id}: ${error.message}`);
      }
    }

    const summary = { includeBots, removed, skipped, failed };
    await sendNicknameAudit(interaction, summary);
    const lines = [
      `削除: ${removed.toLocaleString("ja-JP")}件`,
      `権限順位などでスキップ: ${skipped.toLocaleString("ja-JP")}件`,
      `失敗: ${failed.toLocaleString("ja-JP")}件`
    ];
    if (errors.length) lines.push(`失敗例:\n${errors.map((line) => `- ${line}`).join("\n")}`);
    await interaction.editReply({
      content: `ニックネーム一括削除が完了しました。\n${lines.join("\n")}`,
      embeds: [],
      components: []
    });
  } finally {
    nicknameCleanupLocks.delete(guildId);
  }
}

async function handleNicknameInteraction(interaction, discord) {
  const customId = String(interaction?.customId || "");
  if (customId === "eco:admin:nickname-clear-preview") {
    await handleNicknamePreview(interaction, discord);
    return true;
  }
  if (customId === "eco:admin:nickname-clear-cancel") {
    if (!isOperationsAdmin(interaction, discord.PermissionFlagsBits)) {
      await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
      return true;
    }
    await interaction.update({ content: "ニックネーム一括削除をキャンセルしました。", embeds: [], components: [] });
    return true;
  }
  if (customId === "eco:admin:nickname-clear-execute:humans") {
    await handleNicknameExecute(interaction, discord, false);
    return true;
  }
  if (customId === "eco:admin:nickname-clear-execute:all") {
    await handleNicknameExecute(interaction, discord, true);
    return true;
  }
  return false;
}

function installDiscordOperations(discordModule) {
  const discord = discordModule || require("discord.js");
  const Client = discord.Client;
  if (!Client?.prototype || Client.prototype.__irisOperationsInteractionInstalled) return;

  const originalEmit = Client.prototype.emit;
  Client.prototype.emit = function irisOperationsEmit(eventName, ...args) {
    const isInteraction = eventName === discord.Events.InteractionCreate || eventName === "interactionCreate";
    const interaction = args[0];
    const customId = String(interaction?.customId || "");
    if (isInteraction && customId.startsWith("eco:admin:nickname-clear-")) {
      handleNicknameInteraction(interaction, discord).catch(async (error) => {
        console.warn(`[nickname-cleanup] interaction failed: ${error.stack || error.message}`);
        if (!interaction?.isRepliable?.()) return;
        const payload = { content: "ニックネーム処理に失敗しました。権限とロール順位を確認してください。", ephemeral: true };
        try {
          if (interaction.deferred || interaction.replied) await interaction.editReply({ ...payload, components: [], embeds: [] });
          else await interaction.reply(payload);
        } catch (_) {}
      });
      return true;
    }
    return originalEmit.call(this, eventName, ...args);
  };

  Client.prototype.__irisOperationsInteractionInstalled = true;
}

module.exports = {
  DAILY_CONFIG,
  claimDaily,
  dailyStatusLine,
  getDailyStatus,
  installDiscordOperations,
  installEconomyExtensions,
  jstDayKey,
  jstDayNumber,
  nextJstMidnight,
  nicknameTargets
};
