"use strict";

const fs = require("fs");
const path = require("path");

const corePath = path.join(__dirname, "..", "src", "discord-core.js");
let source = fs.readFileSync(corePath, "utf8");

function replaceOnce(label, oldValue, newValue, options = {}) {
  const required = options.required !== false;
  if (source.includes(newValue)) return;
  if (!source.includes(oldValue)) {
    if (required) throw new Error(`apply-yado-extension: ${label} insertion point not found`);
    console.warn(`apply-yado-extension: ${label} insertion point not found; skipped`);
    return;
  }
  source = source.replace(oldValue, newValue);
}

replaceOnce(
  "config",
  'const yadoDurationMs = parsePositiveIntEnv("YADO_DURATION_HOURS", 12) * 60 * 60 * 1000;',
  'const yadoDurationMs = parsePositiveIntEnv("YADO_DURATION_HOURS", 12) * 60 * 60 * 1000;\nconst yadoExtendHours = parsePositiveIntEnv("YADO_EXTEND_HOURS", 3);\nconst yadoExtendMs = yadoExtendHours * 60 * 60 * 1000;\nconst yadoPublicExtendCost = parseNonNegativeIntEnv("YADO_PUBLIC_EXTEND_COST", 1500);\nconst yadoSecretExtendCost = parseNonNegativeIntEnv("YADO_SECRET_EXTEND_COST", 3000);\nconst yadoMaxLifetimeMs = parsePositiveIntEnv("YADO_MAX_LIFETIME_HOURS", 24) * 60 * 60 * 1000;\nconst yadoControlRefreshMs = Math.max(15, parsePositiveIntEnv("YADO_COUNTDOWN_REFRESH_SECONDS", 30)) * 1000;'
);

replaceOnce(
  "ready sweeper",
  '  startYadoSweeper();',
  '  startYadoSweeper();\n  startYadoControlRefreshSweeper();'
);

replaceOnce(
  "yado control action",
  '  if (action === "add-seat") {\n    if (room.secret) {\n      await showYadoAddMemberPicker(interaction, room, channel);\n      return;\n    }\n    await addYadoSeat(interaction, ownerKey, room, channel);\n  }\n}',
  '  if (action === "add-seat") {\n    if (room.secret) {\n      await showYadoAddMemberPicker(interaction, room, channel);\n      return;\n    }\n    await addYadoSeat(interaction, ownerKey, room, channel);\n    return;\n  }\n\n  if (action === "extend") {\n    await extendYadoRoom(interaction, ownerKey, room, channel);\n    return;\n  }\n}'
);

replaceOnce(
  "extend function",
  'async function addYadoSeat(interaction, ownerKey, room, channel, member = null) {',
  'function formatYadoCountdown(ms) {\n  const totalSeconds = Math.max(0, Math.ceil(Number(ms || 0) / 1000));\n  const hours = Math.floor(totalSeconds / 3600);\n  const minutes = Math.floor((totalSeconds % 3600) / 60);\n  const seconds = totalSeconds % 60;\n  if (hours > 0) return `${hours}時間${minutes}分${seconds}秒`;\n  if (minutes > 0) return `${minutes}分${seconds}秒`;\n  return `${seconds}秒`;\n}\n\nfunction yadoExtendCost(room) {\n  return room?.secret ? yadoSecretExtendCost : yadoPublicExtendCost;\n}\n\nfunction yadoMaxExpiresAt(room) {\n  const createdAt = Number(room?.createdAt || Date.now());\n  return createdAt + yadoMaxLifetimeMs;\n}\n\nfunction yadoCanExtend(room) {\n  return Number(room?.expiresAt || 0) + yadoExtendMs <= yadoMaxExpiresAt(room);\n}\n\nasync function extendYadoRoom(interaction, ownerKey, room, channel) {\n  if (!yadoCanExtend(room)) {\n    await interaction.reply({ content: `これ以上は延長できません。作成から最大 ${formatDuration(yadoMaxLifetimeMs)} までです。`, ephemeral: true });\n    return;\n  }\n\n  const actor = actorFromInteraction(interaction);\n  const user = engine.getUser(actor.id, actor.name);\n  const cost = yadoExtendCost(room);\n  if (user.wallet < cost) {\n    await interaction.reply({\n      content: `延長には ${fmt(cost)} 必要です。いまの財布は ${fmt(user.wallet)}。`,\n      ephemeral: true\n    });\n    return;\n  }\n\n  user.wallet -= cost;\n  user.lifetimeLost += cost;\n  engine.log(user, "yado", -cost, `宿 延長 +${yadoExtendHours}時間`);\n  room.expiresAt = Number(room.expiresAt || Date.now()) + yadoExtendMs;\n  room.cost = (room.cost || 0) + cost;\n  room.extensions = (room.extensions || 0) + 1;\n  store.save(engine.state);\n  yadoStore.save(yadoState);\n  scheduleYadoExpiry(ownerKey, room.expiresAt);\n  await refreshYadoControlMessage(room, channel);\n  await interaction.reply({\n    content: `宿を ${yadoExtendHours}時間延長しました。残り ${formatYadoCountdown(room.expiresAt - Date.now())} / 料金 ${fmt(cost)}。`,\n    ephemeral: true\n  });\n}\n\nasync function addYadoSeat(interaction, ownerKey, room, channel, member = null) {'
);

replaceOnce(
  "countdown display",
  '  const expiresIn = formatDuration(room.expiresAt - Date.now());',
  '  const expiresIn = formatYadoCountdown(room.expiresAt - Date.now());'
);

replaceOnce(
  "yado fields",
  '      { name: "期限", value: `残り ${expiresIn}`, inline: true },\n      { name: "合計消費", value: fmt(room.cost || 0), inline: true },',
  '      { name: "期限", value: `残り ${expiresIn}\\n<t:${Math.floor(room.expiresAt / 1000)}:R>`, inline: true },\n      { name: "延長", value: `+${yadoExtendHours}時間 ${fmt(yadoExtendCost(room))}`, inline: true },\n      { name: "合計消費", value: fmt(room.cost || 0), inline: true },'
);

replaceOnce(
  "extend button",
  '    new ButtonBuilder()\n      .setCustomId(`eco:yado:add-seat:${channel.id}`)\n      .setLabel(room.secret ? "メンバー+1" : "人数+1")\n      .setStyle(ButtonStyle.Primary)\n      .setDisabled(addDisabled)',
  '    new ButtonBuilder()\n      .setCustomId(`eco:yado:add-seat:${channel.id}`)\n      .setLabel(room.secret ? "メンバー+1" : "人数+1")\n      .setStyle(ButtonStyle.Primary)\n      .setDisabled(addDisabled),\n    new ButtonBuilder()\n      .setCustomId(`eco:yado:extend:${channel.id}`)\n      .setLabel(`延長+${yadoExtendHours}h`)\n      .setStyle(ButtonStyle.Success)\n      .setDisabled(!yadoCanExtend(room))'
);

replaceOnce(
  "control refresh sweeper",
  'function startVoiceRewardSweeper() {',
  'function startYadoControlRefreshSweeper() {\n  setInterval(async () => {\n    for (const [ownerKey, room] of Object.entries(yadoState.rooms || {})) {\n      if (!room?.controlMessageId || Date.now() >= Number(room.expiresAt || 0)) continue;\n      const guild = client.guilds.cache.get(room.guildId) || await client.guilds.fetch(room.guildId).catch(() => null);\n      const channel = guild ? await guild.channels.fetch(room.channelId).catch(() => null) : null;\n      if (channel) await refreshYadoControlMessage(room, channel);\n      else clearYadoRoom(ownerKey);\n    }\n  }, yadoControlRefreshMs).unref?.();\n}\n\nfunction startVoiceRewardSweeper() {'
);

replaceOnce(
  "entry panel description",
  '        description: "このカテゴリに宿VCを作成します。作成後、宿内の管理パネルから名前と人数を変更できます。",',
  '        description: "このカテゴリに宿VCを作成します。作成後、宿内の管理パネルから名前・人数・期限延長を変更できます。",',
  { required: false }
);

replaceOnce(
  "entry panel duration",
  '          { name: "期限", value: "12時間で自動終了", inline: true },',
  '          { name: "期限", value: "12時間で自動終了 / 宿内パネルから延長可", inline: true },',
  { required: false }
);

fs.writeFileSync(corePath, source);
console.log("apply-yado-extension: patched src/discord-core.js");
