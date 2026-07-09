"use strict";

const fs = require("fs");
const path = require("path");

const corePath = path.join(__dirname, "..", "src", "discord-core.js");
let source = fs.readFileSync(corePath, "utf8");

function fail(label) {
  throw new Error(`apply-yado-extension: ${label} insertion point not found`);
}

function replaceOnce(label, oldValue, newValue) {
  const normalizedSource = source.replace(/\r\n/g, "\n");
  if (normalizedSource.includes(newValue)) return;
  if (!source.includes(oldValue)) fail(label);
  source = source.replace(oldValue, newValue);
}

function findFunctionRange(name) {
  const start = source.indexOf(`function ${name}(`);
  const asyncStart = source.indexOf(`async function ${name}(`);
  const index = asyncStart >= 0 && (start < 0 || asyncStart < start) ? asyncStart : start;
  if (index < 0) return null;

  const open = source.indexOf("{", index);
  if (open < 0) return null;
  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    const char = source[i];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return [index, i + 1];
    }
  }
  return null;
}

function replaceFunction(name, newValue) {
  const range = findFunctionRange(name);
  if (!range) fail(name);
  const current = source.slice(range[0], range[1]);
  if (current === newValue) return;
  source = `${source.slice(0, range[0])}${newValue}${source.slice(range[1])}`;
}

function insertBeforeFunction(name, marker, newValue) {
  if (source.includes(marker)) return;
  const range = findFunctionRange(name);
  if (!range) fail(name);
  source = `${source.slice(0, range[0])}${newValue}\n\n${source.slice(range[0])}`;
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

replaceFunction("handleYadoControl", `async function handleYadoControl(interaction) {
  const [, , action, channelId] = interaction.customId.split(":");
  const context = await getYadoControlContext(interaction, channelId);
  if (!context) return;
  const { ownerKey, room, channel } = context;

  if (action === "rename") {
    await showYadoRenameModal(interaction, room, channel);
    return;
  }

  if (action === "add-seat") {
    if (room.secret) {
      await showYadoAddMemberPicker(interaction, room, channel);
      return;
    }
    await addYadoSeat(interaction, ownerKey, room, channel);
    return;
  }

  if (action === "extend") {
    await extendYadoRoom(interaction, ownerKey, room, channel);
    return;
  }

  if (action === "resync") {
    await resyncYadoPermissions(interaction, room, channel);
    return;
  }

  if (action === "refresh") {
    await refreshYadoControlPanel(interaction, room, channel);
    return;
  }

  if (action === "close") {
    await showYadoCloseConfirmation(interaction, room, channel);
    return;
  }

  if (action === "close-confirm") {
    await closeYadoRoomFromConfirmation(interaction, ownerKey, channel);
    return;
  }

  if (action === "close-cancel") {
    await interaction.update({ content: "宿を閉じる操作を取り消しました。", embeds: [], components: [] });
  }
}`);

insertBeforeFunction("addYadoSeat", "宿延長・管理操作UI・安全操作を追加する。", `// 宿延長・管理操作UI・安全操作を追加する。
function formatYadoCountdown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(Number(ms || 0) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return \`\${hours}時間\${minutes}分\${seconds}秒\`;
  if (minutes > 0) return \`\${minutes}分\${seconds}秒\`;
  return \`\${seconds}秒\`;
}

function yadoExtendCost(room) {
  return room?.secret ? yadoSecretExtendCost : yadoPublicExtendCost;
}

function yadoMaxExpiresAt(room) {
  const createdAt = Number(room?.createdAt || Date.now());
  return createdAt + yadoMaxLifetimeMs;
}

function yadoCanExtend(room) {
  return Number(room?.expiresAt || 0) + yadoExtendMs <= yadoMaxExpiresAt(room);
}

function yadoExtendStatus(room) {
  const maxExpiresAt = yadoMaxExpiresAt(room);
  const remainingWindow = maxExpiresAt - Number(room?.expiresAt || Date.now());
  if (!yadoCanExtend(room)) {
    return \`最大期限に近いため延長できません\\n最大 \${formatDuration(yadoMaxLifetimeMs)} / <t:\${Math.floor(maxExpiresAt / 1000)}:R>\`;
  }
  return \`+\${yadoExtendHours}時間 / \${fmt(yadoExtendCost(room))}\\n最大 \${formatDuration(yadoMaxLifetimeMs)} / あと \${formatYadoCountdown(remainingWindow)} まで延長可\`;
}

function yadoCostBreakdown(room) {
  const createCost = room?.secret ? yadoSecretCost : yadoPublicCost;
  const seatCost = Math.max(0, Number(room?.extraSeats || 0)) * yadoExtraSeatCost;
  const total = Math.max(0, Number(room?.cost || createCost + seatCost));
  const extendCost = Math.max(0, total - createCost - seatCost);
  return \`作成 \${fmt(createCost)} / 増員 \${fmt(seatCost)} / 延長 \${fmt(extendCost)}\\n合計 \${fmt(total)}\`;
}

function yadoRoomName(room, channel) {
  return room?.name || safeChannelName(channel?.name || "room");
}

function yadoOwnerMention(room) {
  return room?.ownerId ? \`<@\${room.ownerId}>\` : "不明";
}

function yadoAllowedMemberIds(room) {
  return Array.from(new Set([room?.ownerId, room?.partnerId, ...(room?.guestIds || [])].filter(Boolean)));
}

async function extendYadoRoom(interaction, ownerKey, room, channel) {
  if (!yadoCanExtend(room)) {
    await interaction.reply({ content: \`これ以上は延長できません。作成から最大 \${formatDuration(yadoMaxLifetimeMs)} までです。\`, ephemeral: true });
    return;
  }

  const actor = actorFromInteraction(interaction);
  const user = engine.getUser(actor.id, actor.name);
  const cost = yadoExtendCost(room);
  if (user.wallet < cost) {
    await interaction.reply({
      content: \`延長には \${fmt(cost)} 必要です。いまの財布は \${fmt(user.wallet)}。\`,
      ephemeral: true
    });
    return;
  }

  const previous = {
    wallet: user.wallet,
    lifetimeLost: user.lifetimeLost,
    expiresAt: room.expiresAt,
    cost: room.cost,
    extensions: room.extensions
  };

  user.wallet -= cost;
  user.lifetimeLost += cost;
  engine.log(user, "yado", -cost, \`宿 延長 +\${yadoExtendHours}時間\`);

  try {
    room.expiresAt = Number(room.expiresAt || Date.now()) + yadoExtendMs;
    room.cost = (room.cost || 0) + cost;
    room.extensions = (room.extensions || 0) + 1;
    store.save(engine.state);
    yadoStore.save(yadoState);
    scheduleYadoExpiry(ownerKey, room.expiresAt);
    const refreshed = await refreshYadoControlMessage(room, channel);
    await interaction.reply({
      content: \`宿を \${yadoExtendHours}時間延長しました。残り \${formatYadoCountdown(room.expiresAt - Date.now())} / 料金 \${fmt(cost)}。\${refreshed ? "" : " 管理パネルの自動更新に失敗したため、最新化ボタンで再取得してください。"}\`,
      ephemeral: true
    });
  } catch (error) {
    user.wallet = previous.wallet;
    user.lifetimeLost = previous.lifetimeLost;
    room.expiresAt = previous.expiresAt;
    room.cost = previous.cost;
    room.extensions = previous.extensions;
    store.save(engine.state);
    yadoStore.save(yadoState);
    scheduleYadoExpiry(ownerKey, room.expiresAt);
    await interaction.reply({ content: "延長処理に失敗しました。料金は戻しました。", ephemeral: true });
    console.warn(\`二人宿の延長に失敗しました: \${error.message}\`);
  }
}

async function resyncYadoPermissions(interaction, room, channel) {
  if (!room.secret) {
    await interaction.reply({ content: "公開宿では権限の再同期は不要です。", ephemeral: true });
    return;
  }

  const overwrites = [
    {
      id: interaction.guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
    },
    ...yadoAllowedMemberIds(room).map((id) => ({
      id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
    }))
  ];
  if (client.user?.id) {
    overwrites.push({
      id: client.user.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.ManageChannels]
    });
  }

  try {
    await channel.permissionOverwrites.set(overwrites, "シークレット宿の権限再同期");
    const refreshed = await refreshYadoControlMessage(room, channel);
    await interaction.reply({
      content: \`宿主・相手・追加メンバー・Botだけが見える状態に戻しました。\${refreshed ? "" : " 管理パネルの更新だけ失敗しました。"}\`,
      ephemeral: true
    });
  } catch (error) {
    await interaction.reply({ content: "権限を再同期できませんでした。Botのチャンネル管理権限を確認してください。", ephemeral: true });
    console.warn(\`二人宿の権限再同期に失敗しました: \${error.message}\`);
  }
}

async function refreshYadoControlPanel(interaction, room, channel) {
  await interaction.update(buildYadoControlPayload(room, channel));
}

async function showYadoCloseConfirmation(interaction, room, channel) {
  const embed = new EmbedBuilder()
    .setTitle("宿を閉じますか？")
    .setDescription(\`\${channel} を削除し、宿の管理台帳とタイマーを片付けます。\nこの操作は宿主だけが実行できます。\`)
    .setColor(0xb91c1c)
    .addFields(
      { name: "部屋", value: \`\${yadoRoomName(room, channel)}\n\${channel}\`, inline: true },
      { name: "期限", value: \`残り \${formatYadoCountdown(room.expiresAt - Date.now())}\`, inline: true }
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(\`eco:yado:close-confirm:\${channel.id}\`)
      .setLabel("本当に閉じる")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(\`eco:yado:close-cancel:\${channel.id}\`)
      .setLabel("やめる")
      .setStyle(ButtonStyle.Secondary)
  );

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}

async function closeYadoRoomFromConfirmation(interaction, ownerKey, channel) {
  await interaction.deferUpdate();
  try {
    await channel.delete("二人宿を宿主が閉じました");
    clearYadoRoom(ownerKey);
  } catch (error) {
    scheduleYadoExpiry(ownerKey, Date.now() + 60_000);
    await interaction.editReply({
      content: "宿の削除に失敗しました。台帳は残しているため、1分後に自動削除の再試行へ回します。",
      embeds: [],
      components: []
    });
    console.warn(\`二人宿の手動クローズに失敗しました（再試行します）: \${error.message}\`);
    return;
  }

  try {
    await interaction.editReply({ content: "宿を閉じました。", embeds: [], components: [] });
  } catch (error) {
    console.warn(\`二人宿の手動クローズ確認更新に失敗しました: \${error.message}\`);
  }
}`);

replaceFunction("refreshYadoControlMessage", `async function refreshYadoControlMessage(room, channel) {
  if (!room.controlMessageId || !channel?.messages?.fetch) return false;
  try {
    const message = await channel.messages.fetch(room.controlMessageId);
    await message.edit(buildYadoControlPayload(room, channel));
    return true;
  } catch (error) {
    console.warn(\`二人宿の管理パネル更新に失敗しました: \${error.message}\`);
    return false;
  }
}`);

replaceFunction("buildYadoControlPayload", `function buildYadoControlPayload(room, channel) {
  const expiresIn = formatYadoCountdown(room.expiresAt - Date.now());
  const extraSeats = Math.max(0, Number(room.extraSeats || 0));
  const capacity = Number(room.capacity || 2);
  const addDisabled = extraSeats >= yadoMaxExtraSeats;
  const embed = new EmbedBuilder()
    .setTitle("🛏 宿泊許可証")
    .setDescription("このVCの管理パネルです。\\n名前変更、人数追加、期限延長、状態更新はここから行えます。")
    .setColor(room.secret ? 0x7f1d1d : 0x0f766e)
    .addFields(
      { name: "部屋", value: \`\${yadoRoomName(room, channel)}\\n\${channel}\`, inline: true },
      { name: "形式", value: room.secret ? "シークレット宿" : "公開宿", inline: true },
      { name: "人数", value: \`基本2人 + 追加\${extraSeats}人\\n現在の上限 \${capacity}人\`, inline: true },
      { name: "期限", value: \`残り \${expiresIn}\\n<t:\${Math.floor(room.expiresAt / 1000)}:R>\`, inline: true },
      { name: "延長", value: yadoExtendStatus(room), inline: true },
      { name: "合計消費", value: yadoCostBreakdown(room), inline: false },
      { name: "宿主", value: yadoOwnerMention(room), inline: true }
    );

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(\`eco:yado:rename:\${channel.id}\`)
      .setLabel("名前変更")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(\`eco:yado:add-seat:\${channel.id}\`)
      .setLabel(room.secret ? "メンバー+1" : "人数+1")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(addDisabled),
    new ButtonBuilder()
      .setCustomId(\`eco:yado:extend:\${channel.id}\`)
      .setLabel(\`延長+\${yadoExtendHours}h\`)
      .setStyle(ButtonStyle.Success)
      .setDisabled(!yadoCanExtend(room))
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(\`eco:yado:resync:\${channel.id}\`)
      .setLabel("権限を再同期")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(\`eco:yado:refresh:\${channel.id}\`)
      .setLabel("最新化")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(\`eco:yado:close:\${channel.id}\`)
      .setLabel("宿を閉じる")
      .setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row1, row2] };
}`);

replaceFunction("cleanupTemporaryVoiceChannel", `async function cleanupTemporaryVoiceChannel(channel) {
  if (!channel || !tempInnVoiceChannels.has(channel.id)) return;
  if (channel.members?.size > 0) return;
  try {
    await channel.delete("二人宿VCが空になったため削除");
    clearYadoRoomByChannel(channel.id);
  } catch (error) {
    console.warn(\`二人宿VC削除に失敗しました: \${error.message}\`);
  }
}`);

insertBeforeFunction("startVoiceRewardSweeper", "function startYadoControlRefreshSweeper()", `function startYadoControlRefreshSweeper() {
  setInterval(async () => {
    for (const [ownerKey, room] of Object.entries(yadoState.rooms || {})) {
      if (!room?.controlMessageId || Date.now() >= Number(room.expiresAt || 0)) continue;
      const guild = client.guilds.cache.get(room.guildId) || await client.guilds.fetch(room.guildId).catch(() => null);
      const channel = guild ? await guild.channels.fetch(room.channelId).catch(() => null) : null;
      if (channel) await refreshYadoControlMessage(room, channel);
      else clearYadoRoom(ownerKey);
    }
  }, yadoControlRefreshMs).unref?.();
}`);

const secretPickerOld = "名前変更とメンバー追加は宿内の管理パネルから。追加は1人";
if (source.includes(secretPickerOld)) {
  source = source.replace(secretPickerOld, "名前・人数・期限は宿内の管理パネルから。追加は1人");
}

fs.writeFileSync(corePath, source);
console.log("apply-yado-extension: patched src/discord-core.js");
