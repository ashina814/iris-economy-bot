"use strict";

const fs = require("fs");
const path = require("path");
const Module = require("module");

const targetEntrypoint = path.join(__dirname, "discord-entry.js");

function sourceReplacementPatch(oldValue, newValue) {
  return [
    "  content = content.replace(",
    `    ${JSON.stringify(oldValue)},`,
    `    ${JSON.stringify(newValue)}`,
    "  );"
  ].join("\n");
}

function injectYadoPanelTextPatch(source) {
  if (source.includes("二人宿入口へ延長案内を追加する。")) return source;

  const oldValue = '    .replaceAll("Bump の", "Bump/Up の")\n    .replaceAll("Bump 回数", "Bump/Up 回数");';
  const newValue = '    .replaceAll("Bump の", "Bump/Up の")\n    .replaceAll("Bump 回数", "Bump/Up 回数")\n    // 二人宿入口へ延長案内を追加する。\n    .replaceAll(\n      \'description: "このカテゴリに宿VCを作成します。作成後、宿内の管理パネルから名前と人数を変更できます。",\',\n      \'description: "このカテゴリに宿VCを作成します。作成後、宿内の管理パネルから名前・人数・期限延長を変更できます。",\'\n    )\n    .replaceAll(\n      \'{ name: "期限", value: "12時間で自動終了", inline: true },\',\n      \'{ name: "期限", value: "12時間で自動終了 / 宿内パネルから延長可", inline: true },\'\n    )\n    .replaceAll(\n      \'"宿名と人数は、作成後に宿内の管理パネルから変更できます。追加人数は1人ごとに5,000 Risです。"\',\n      \'"宿名・人数・期限延長は、作成後に宿内の管理パネルから変更できます。追加人数は1人ごとに5,000 Ris、延長は公開宿1,500 Ris / シークレット宿3,000 Risです。"\'\n    );';

  if (!source.includes(oldValue)) {
    throw new Error("Yado panel text patch insertion point not found.");
  }

  return source.replace(oldValue, newValue);
}

function injectYadoExtensionPatch(source) {
  if (source.includes("宿延長と宿内カウントダウン更新を追加する。")) return source;

  const replacements = [
    sourceReplacementPatch(
      'const yadoDurationMs = parsePositiveIntEnv("YADO_DURATION_HOURS", 12) * 60 * 60 * 1000;',
      'const yadoDurationMs = parsePositiveIntEnv("YADO_DURATION_HOURS", 12) * 60 * 60 * 1000;\nconst yadoExtendHours = parsePositiveIntEnv("YADO_EXTEND_HOURS", 3);\nconst yadoExtendMs = yadoExtendHours * 60 * 60 * 1000;\nconst yadoPublicExtendCost = parseNonNegativeIntEnv("YADO_PUBLIC_EXTEND_COST", 1500);\nconst yadoSecretExtendCost = parseNonNegativeIntEnv("YADO_SECRET_EXTEND_COST", 3000);\nconst yadoMaxLifetimeMs = parsePositiveIntEnv("YADO_MAX_LIFETIME_HOURS", 24) * 60 * 60 * 1000;\nconst yadoControlRefreshMs = Math.max(15, parsePositiveIntEnv("YADO_COUNTDOWN_REFRESH_SECONDS", 30)) * 1000;'
    ),
    sourceReplacementPatch(
      '  startYadoSweeper();',
      '  startYadoSweeper();\n  startYadoControlRefreshSweeper();'
    ),
    sourceReplacementPatch(
      '  if (action === "add-seat") {\n    if (room.secret) {\n      await showYadoAddMemberPicker(interaction, room, channel);\n      return;\n    }\n    await addYadoSeat(interaction, ownerKey, room, channel);\n  }\n}',
      '  if (action === "add-seat") {\n    if (room.secret) {\n      await showYadoAddMemberPicker(interaction, room, channel);\n      return;\n    }\n    await addYadoSeat(interaction, ownerKey, room, channel);\n    return;\n  }\n\n  if (action === "extend") {\n    await extendYadoRoom(interaction, ownerKey, room, channel);\n    return;\n  }\n}'
    ),
    sourceReplacementPatch(
      'async function addYadoSeat(interaction, ownerKey, room, channel, member = null) {',
      'function formatYadoCountdown(ms) {\n  const totalSeconds = Math.max(0, Math.ceil(Number(ms || 0) / 1000));\n  const hours = Math.floor(totalSeconds / 3600);\n  const minutes = Math.floor((totalSeconds % 3600) / 60);\n  const seconds = totalSeconds % 60;\n  if (hours > 0) return `${hours}時間${minutes}分${seconds}秒`;\n  if (minutes > 0) return `${minutes}分${seconds}秒`;\n  return `${seconds}秒`;\n}\n\nfunction yadoExtendCost(room) {\n  return room?.secret ? yadoSecretExtendCost : yadoPublicExtendCost;\n}\n\nfunction yadoMaxExpiresAt(room) {\n  const createdAt = Number(room?.createdAt || Date.now());\n  return createdAt + yadoMaxLifetimeMs;\n}\n\nfunction yadoCanExtend(room) {\n  return Number(room?.expiresAt || 0) + yadoExtendMs <= yadoMaxExpiresAt(room);\n}\n\nasync function extendYadoRoom(interaction, ownerKey, room, channel) {\n  if (!yadoCanExtend(room)) {\n    await interaction.reply({ content: `これ以上は延長できません。作成から最大 ${formatDuration(yadoMaxLifetimeMs)} までです。`, ephemeral: true });\n    return;\n  }\n\n  const actor = actorFromInteraction(interaction);\n  const user = engine.getUser(actor.id, actor.name);\n  const cost = yadoExtendCost(room);\n  if (user.wallet < cost) {\n    await interaction.reply({\n      content: `延長には ${fmt(cost)} 必要です。いまの財布は ${fmt(user.wallet)}。`,\n      ephemeral: true\n    });\n    return;\n  }\n\n  user.wallet -= cost;\n  user.lifetimeLost += cost;\n  engine.log(user, "yado", -cost, `宿 延長 +${yadoExtendHours}時間`);\n  room.expiresAt = Number(room.expiresAt || Date.now()) + yadoExtendMs;\n  room.cost = (room.cost || 0) + cost;\n  room.extensions = (room.extensions || 0) + 1;\n  store.save(engine.state);\n  yadoStore.save(yadoState);\n  scheduleYadoExpiry(ownerKey, room.expiresAt);\n  await refreshYadoControlMessage(room, channel);\n  await interaction.reply({\n    content: `宿を ${yadoExtendHours}時間延長しました。残り ${formatYadoCountdown(room.expiresAt - Date.now())} / 料金 ${fmt(cost)}。`,\n    ephemeral: true\n  });\n}\n\nasync function addYadoSeat(interaction, ownerKey, room, channel, member = null) {'
    ),
    sourceReplacementPatch(
      '  const expiresIn = formatDuration(room.expiresAt - Date.now());',
      '  const expiresIn = formatYadoCountdown(room.expiresAt - Date.now());'
    ),
    sourceReplacementPatch(
      '      { name: "期限", value: `残り ${expiresIn}`, inline: true },\n      { name: "合計消費", value: fmt(room.cost || 0), inline: true },',
      '      { name: "期限", value: `残り ${expiresIn}\\n<t:${Math.floor(room.expiresAt / 1000)}:R>`, inline: true },\n      { name: "延長", value: `+${yadoExtendHours}時間 ${fmt(yadoExtendCost(room))}`, inline: true },\n      { name: "合計消費", value: fmt(room.cost || 0), inline: true },'
    ),
    sourceReplacementPatch(
      '    new ButtonBuilder()\n      .setCustomId(`eco:yado:add-seat:${channel.id}`)\n      .setLabel(room.secret ? "メンバー+1" : "人数+1")\n      .setStyle(ButtonStyle.Primary)\n      .setDisabled(addDisabled)',
      '    new ButtonBuilder()\n      .setCustomId(`eco:yado:add-seat:${channel.id}`)\n      .setLabel(room.secret ? "メンバー+1" : "人数+1")\n      .setStyle(ButtonStyle.Primary)\n      .setDisabled(addDisabled),\n    new ButtonBuilder()\n      .setCustomId(`eco:yado:extend:${channel.id}`)\n      .setLabel(`延長+${yadoExtendHours}h`)\n      .setStyle(ButtonStyle.Success)\n      .setDisabled(!yadoCanExtend(room))'
    ),
    sourceReplacementPatch(
      'function startVoiceRewardSweeper() {',
      'function startYadoControlRefreshSweeper() {\n  setInterval(async () => {\n    for (const [ownerKey, room] of Object.entries(yadoState.rooms || {})) {\n      if (!room?.controlMessageId || Date.now() >= Number(room.expiresAt || 0)) continue;\n      const guild = client.guilds.cache.get(room.guildId) || await client.guilds.fetch(room.guildId).catch(() => null);\n      const channel = guild ? await guild.channels.fetch(room.channelId).catch(() => null) : null;\n      if (channel) await refreshYadoControlMessage(room, channel);\n      else clearYadoRoom(ownerKey);\n    }\n  }, yadoControlRefreshMs).unref?.();\n}\n\nfunction startVoiceRewardSweeper() {'
    )
  ];

  const yadoPatch = [
    "",
    "  // 宿延長と宿内カウントダウン更新を追加する。",
    ...replacements
  ].join("\n");
  const insertionPoint = "\n  return content;\n}\n\nfunction patchRankingSource";

  if (!source.includes(insertionPoint)) {
    throw new Error("Yado extension patch insertion point not found.");
  }

  return source.replace(insertionPoint, `\n${yadoPatch}\n  return content;\n}\n\nfunction patchRankingSource`);
}

function injectTcRankCompactPatch(source) {
  if (source.includes("TCランク昇格通知を単行表示にする。")) return source;

  const vcRankPatch = [
    "  content = content.replace(",
    "    'lines: [`${user.name} が ${after.name} になりました。`, `VCレベル ${this.vcLevel(user)} / 通話 ${cappedMinutes}分 / 経験値 +${xp} / +${fmt(drip)}`, capLine],',",
    "    'lines: [`${user.name} が ${after.name} になりました。`],',",
    "  );"
  ].join("\n");

  const tcRankPatch = [
    "",
    "  // TCランク昇格通知を単行表示にする。",
    "  content = content.replace(",
    "    'lines: [`${user.name} が ${after.name} になりました。`, `TCレベル ${this.textLevel(user)} / 会話報酬 +${fmt(drip)} / TC経験値 +${xp}`],',",
    "    'lines: [`${user.name} が ${after.name} になりました。`],',",
    "  );"
  ].join("\n");

  if (!source.includes(vcRankPatch)) {
    throw new Error("TC rank compact patch insertion point not found.");
  }

  return source.replace(vcRankPatch, `${vcRankPatch}${tcRankPatch}`);
}

function injectEntrypointPatch(source) {
  return injectYadoPanelTextPatch(injectYadoExtensionPatch(injectTcRankCompactPatch(source)));
}

function installEntrypointPatch() {
  if (Module._extensions[".js"].__irisTcRankCompactEntrypointPatched) return;

  const originalLoader = Module._extensions[".js"];
  Module._extensions[".js"] = function irisTcRankCompactLoader(module, filename) {
    if (path.resolve(filename) !== path.resolve(targetEntrypoint)) {
      return originalLoader(module, filename);
    }

    const content = injectEntrypointPatch(fs.readFileSync(filename, "utf8"));
    return module._compile(content, filename);
  };
  Module._extensions[".js"].__irisTcRankCompactEntrypointPatched = true;
}

installEntrypointPatch();
require("./discord-entry.js");
