const path = require("path");
const { EconomyEngine, createInitialState, formatResult, fmt } = require("./economy");
const { startInternalApi } = require("./internal-api");
const { JsonStore } = require("./storage");
const { handleNicknameInteraction } = require("./operations-extension");

let discord;
try {
  discord = require("discord.js");
} catch (error) {
  console.error("discord.js が入っていません。先に `npm install` を実行してください。");
  process.exit(1);
}

const {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  PermissionFlagsBits,
  AuditLogEvent,
  ModalBuilder,
  REST,
  RoleSelectMenuBuilder,
  Routes,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder
} = discord;

let canvasTools = null;
try {
  canvasTools = require("@napi-rs/canvas");
} catch {
  canvasTools = null;
}

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;
const prefix = process.env.BOT_PREFIX || "!eco";
const logChannelId = process.env.DISCORD_LOG_CHANNEL_ID;
const rankChannelId = process.env.DISCORD_RANK_CHANNEL_ID || process.env.DISCORD_LOG_CHANNEL_ID;
const yadoPublicCost = parseNonNegativeIntEnv("YADO_PUBLIC_COST", 0);
const yadoSecretCost = parsePositiveIntEnv("YADO_SECRET_COST", 10000);
const yadoExtraSeatCost = parsePositiveIntEnv("YADO_EXTRA_SEAT_COST", 5000);
const yadoMaxExtraSeats = parseNonNegativeIntEnv("YADO_MAX_EXTRA_SEATS", 8);
const yadoDurationMs = parsePositiveIntEnv("YADO_DURATION_HOURS", 12) * 60 * 60 * 1000;
const yadoExtendHours = parsePositiveIntEnv("YADO_EXTEND_HOURS", 3);
const yadoExtendMs = yadoExtendHours * 60 * 60 * 1000;
const yadoPublicExtendCost = parseNonNegativeIntEnv("YADO_PUBLIC_EXTEND_COST", 1500);
const yadoSecretExtendCost = parseNonNegativeIntEnv("YADO_SECRET_EXTEND_COST", 3000);
const yadoMaxLifetimeMs = parsePositiveIntEnv("YADO_MAX_LIFETIME_HOURS", 24) * 60 * 60 * 1000;
const yadoControlRefreshMs = Math.max(15, parsePositiveIntEnv("YADO_COUNTDOWN_REFRESH_SECONDS", 30)) * 1000;
const internalApiHost = process.env.IRIS_INTERNAL_API_HOST || "127.0.0.1";
const internalApiPort = parseNonNegativeIntEnv("IRIS_INTERNAL_API_PORT", 8787);
const internalApiMaxBodyBytes = parsePositiveIntEnv("IRIS_INTERNAL_API_MAX_BODY_BYTES", 16 * 1024);
const casinoMaxPayoutMultiplier = parseNonNegativeIntEnv("IRIS_CASINO_MAX_PAYOUT_MULTIPLIER", 100);
const casinoMaxPayoutRis = parseNonNegativeIntEnv("IRIS_CASINO_MAX_PAYOUT_RIS", 100000000);
const casinoMinBet = parsePositiveIntEnv("IRIS_CASINO_MIN_BET", 1);
const casinoMaxBet = parsePositiveIntEnv("IRIS_CASINO_MAX_BET", 100000000);
const shopMaintenance = process.env.IRIS_SHOP_MAINTENANCE === "1";
const adminUserIds = new Set(
  String(process.env.ECONOMY_ADMIN_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
);
const inviteCache = new Map();
const pendingInviteUses = new Map();
const creditedDeletedInviteCodes = new Map();
const memberDirectoryByGuild = new Map();
const PENDING_INVITE_USE_TTL_MS = 5 * 60 * 1000;
const tempInnVoiceChannels = new Set();
const yadoTimers = new Map();
const rankPanelRefreshTimers = new Map();
const salarySessions = new Map();
const SALARY_SESSION_TTL_MS = 10 * 60 * 1000;
const DISBOARD_BOT_ID = "302050872383242240";
const boostRewardSweepMs = Math.max(60, parsePositiveIntEnv("IRIS_BOOST_REWARD_SWEEP_SECONDS", 6 * 60 * 60)) * 1000;

global.__IRIS_GUILD_MEMBER_DIRECTORY__ = {
  get(id) {
    return memberDirectoryByGuild.get(String(id || "")) || null;
  }
};

function loadRequiredState(jsonStore, label) {
  try {
    return jsonStore.load();
  } catch (error) {
    console.error(`${label}の読込に失敗したため起動を中止します: ${error.message}`);
    throw error;
  }
}

if (!token) {
  console.error("DISCORD_TOKEN が未設定です。");
  process.exit(1);
}

const store = new JsonStore(path.join(__dirname, "..", "data", "discord-state.json"), createInitialState);
const state = loadRequiredState(store, "経済台帳");
const engine = new EconomyEngine(state);
startInternalApi({
  engine,
  store,
  apiKey: process.env.IRIS_INTERNAL_API_KEY,
  host: internalApiHost,
  port: internalApiPort,
  maxBodyBytes: internalApiMaxBodyBytes,
  maxPayoutMultiplier: casinoMaxPayoutMultiplier,
  maxPayoutRis: casinoMaxPayoutRis,
  minBet: casinoMinBet,
  maxBet: casinoMaxBet,
  guildId
});
const yadoStore = new JsonStore(path.join(__dirname, "..", "data", "yado-state.json"), () => ({ rooms: {} }));
const yadoState = loadRequiredState(yadoStore, "二人宿台帳");
const panelStore = new JsonStore(path.join(__dirname, "..", "data", "panel-state.json"), () => ({ rankPanel: null, rankNotifyChannelId: null }));
const panelState = loadRequiredState(panelStore, "パネル台帳");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers
  ]
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`${readyClient.user.tag} としてログインしました。`);
  console.log(`スラッシュ: /ショップ /自分の店 /管理 /アイリス /カード /宿  プレフィックス: ${prefix} <command>`);
  try {
    await registerSlashCommand();
  } catch (error) {
    console.warn(`スラッシュコマンド登録に失敗しました: ${error.message}`);
    console.warn("既存の /eco かプレフィックスコマンドで起動を継続します。");
  }
  await refreshInviteCaches();
  for (const guild of readyClient.guilds.cache.values()) syncGuildMemberDirectory(guild);
  await resumeYadoRooms();
  await ensureRankPanel();
  startVoiceRewardSweeper();
  startMarketSweeper();
  startOfficialRoleExpirySweeper();
  startBoostRewardSweeper();
  startYadoSweeper();
  startYadoControlRefreshSweeper();
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    await handleInteraction(interaction);
  } catch (error) {
    const cid = interaction.isButton?.() || interaction.isStringSelectMenu?.() ? interaction.customId : (interaction.commandName || "unknown");
    console.warn(`インタラクション処理に失敗しました [${cid}]: ${error.stack || error.message}`);
    if (logChannelId) {
      try {
        const channel = await client.channels.fetch(logChannelId).catch(() => null);
        if (channel?.isTextBased?.()) {
          const detail = String(error.rawError ? JSON.stringify(error.rawError) : error.message).slice(0, 900);
          await channel.send({ content: `⚠ interaction fail [${cid}]\n\`\`\`\n${detail}\n\`\`\`` }).catch(() => null);
        }
      } catch (_) {}
    }
    await replyInteractionError(interaction);
  }
});

async function handleInteraction(interaction) {
  if (shopMaintenance && isShopMaintenanceInteraction(interaction)) {
    await replyShopMaintenance(interaction);
    return;
  }
  if (interaction.isModalSubmit()) {
    if (interaction.customId.startsWith("eco:modal:yado-rename:")) {
      await renameYadoRoomFromModal(interaction);
      return;
    }
    if (interaction.customId === "eco:modal:market-shop-settings") {
      await updateMarketShopFromModal(interaction);
      return;
    }
    if (interaction.customId === "eco:modal:market-listing-create") {
      await createMarketListingFromModal(interaction);
      return;
    }
    if (interaction.customId === "eco:modal:market-auction-create") {
      await createMarketAuctionFromModal(interaction);
      return;
    }
    if (interaction.customId === "eco:modal:market-official-item-create") {
      await createOfficialItemFromModal(interaction);
      return;
    }
    if (interaction.customId.startsWith("eco:modal:market-official-item-edit:")) {
      await updateOfficialItemFromModal(interaction);
      return;
    }
    if (interaction.customId.startsWith("eco:modal:market-auction-bid:")) {
      await placeMarketAuctionBidFromModal(interaction);
      return;
    }
    if (interaction.customId.startsWith("eco:modal:salary:")) {
      await handleSalaryAmountModal(interaction);
      return;
    }
    if (interaction.customId.startsWith("eco:modal:review-reject:")) {
      await handleReviewRejectModal(interaction);
      return;
    }
    if (interaction.customId.startsWith("eco:modal:balance:")) {
      await handleBalanceModal(interaction);
      return;
    }
    if (interaction.customId.startsWith("eco:modal:balance-role-set:")) {
      await handleBalanceRoleAmountModal(interaction);
      return;
    }
    if (interaction.customId === "eco:modal:shop-search") {
      await handleShopSearchModal(interaction);
      return;
    }
    if (interaction.customId.startsWith("eco:modal:shop-edit:")) {
      await handleShopEditModal(interaction);
      return;
    }
    if (interaction.customId.startsWith("eco:modal:shop-resubmit:")) {
      await handleShopResubmitModal(interaction);
      return;
    }
    if (interaction.customId === "eco:modal:market-settings") {
      await handleMarketSettingsModal(interaction);
      return;
    }
  }

  if (interaction.isUserSelectMenu()) {
    if (interaction.customId === "eco:user:secret-yado") {
      await createYadoVoiceChannel(interaction, { secret: true, partnerId: interaction.values[0] });
      return;
    }
    if (interaction.customId.startsWith("eco:user:yado-add:")) {
      await addSecretYadoMember(interaction);
      return;
    }
    if (interaction.customId.startsWith("eco:user:balance:")) {
      await showBalanceAmountModal(interaction);
      return;
    }
    return;
  }

  if (interaction.isRoleSelectMenu()) {
    if (interaction.customId === "eco:role:salary") {
      await handleSalaryRoleSelect(interaction);
      return;
    }
    if (interaction.customId === "eco:role:balance-set") {
      await handleBalanceRoleSelect(interaction);
      return;
    }
    if (interaction.customId.startsWith("eco:role:boost:")) {
      await handleBoostRewardRoleSelect(interaction);
      return;
    }
    if (interaction.customId.startsWith("eco:role:official-item:")) {
      await handleOfficialItemRoleSelect(interaction);
      return;
    }
    return;
  }

  if (interaction.isChannelSelectMenu?.()) {
    if (interaction.customId.startsWith("eco:vcxp:")) {
      await handleVcXpLocationChannelSelect(interaction);
      return;
    }
    return;
  }

  if (interaction.isButton() || interaction.isStringSelectMenu()) {
    if (interaction.isButton() && interaction.customId.startsWith("eco:admin:nickname-clear-")) {
      await handleNicknameInteraction(interaction, discord);
      return;
    }
    if (interaction.isButton() && interaction.customId.startsWith("eco:rank:")) {
      await handleRankPanelButton(interaction);
      return;
    }
    if (interaction.isButton() && interaction.customId.startsWith("eco:yado:")) {
      await handleYadoControl(interaction);
      return;
    }
    if (interaction.isButton() && interaction.customId.startsWith("eco:review:")) {
      await handleReviewButton(interaction);
      return;
    }
    if (interaction.isButton() && interaction.customId.startsWith("eco:order:")) {
      await handleOrderAdminButton(interaction);
      return;
    }
    if (interaction.isButton() && interaction.customId.startsWith("eco:market:auction-bid:")) {
      await showMarketAuctionBidModal(interaction, interaction.customId.split(":")[3]);
      return;
    }
    if (interaction.isButton() && interaction.customId === "eco:market:official-item-create") {
      await showOfficialItemCreateModal(interaction);
      return;
    }
    if (interaction.isButton() && interaction.customId.startsWith("eco:market:official-")) {
      await handleOfficialMarketControl(interaction);
      return;
    }
    if (interaction.isButton() && interaction.customId === "eco:user:notify-toggle") {
      await handleNotifyToggle(interaction);
      return;
    }
    if (interaction.isButton() && interaction.customId.startsWith("eco:boost:")) {
      await handleBoostRewardButton(interaction);
      return;
    }
    const command = commandFromComponent(interaction);
    if (!command) return;
    if (command === "create-yado-vc") {
      await createYadoVoiceChannel(interaction, { secret: false });
      return;
    }
    if (command === "choose-secret-yado") {
      await showSecretYadoPartnerPicker(interaction);
      return;
    }
    if (command === "market-shop-settings") {
      await showMarketShopSettingsModal(interaction);
      return;
    }
    if (command === "market-listing-create") {
      await showMarketListingModal(interaction);
      return;
    }
    if (command === "post-market-panel") {
      await postMarketPanel(interaction);
      return;
    }
    if (command === "market-auction-create") {
      await showMarketAuctionCreateModal(interaction);
      return;
    }
    if (command.startsWith("market-auction-bid ")) {
      await showMarketAuctionBidModal(interaction, command.split(/\s+/)[1]);
      return;
    }
    if (command === "salary-start") {
      await showSalaryRolePicker(interaction);
      return;
    }
    if (command === "rank-panel-post") {
      await postRankPanelFromButton(interaction);
      return;
    }
    if (command === "rank-notify-set") {
      await setRankNotifyChannel(interaction, interaction.channel);
      return;
    }
    if (command === "rank-notify-clear") {
      await clearRankNotifyChannel(interaction);
      return;
    }
    if (command.startsWith("rank-reset-confirm ")) {
      await confirmRankReset(interaction, command.split(/\s+/)[1]);
      return;
    }
    if (command.startsWith("rank-reset-execute ")) {
      await executeRankReset(interaction, command.split(/\s+/)[1]);
      return;
    }
    if (command === "rank-reset-cancel") {
      await interaction.reply({ content: "ランクリセットをキャンセルしました。", ephemeral: true });
      return;
    }
    if (command === "balance-user-set" || command === "balance-user-add" || command === "balance-user-sub") {
      await showBalanceUserPicker(interaction, command.split("-")[2]);
      return;
    }
    if (command === "balance-role-set") {
      await showBalanceRolePicker(interaction);
      return;
    }
    if (command.startsWith("balance-role-execute ")) {
      await executeBalanceRoleSet(interaction, command.split(/\s+/)[1]);
      return;
    }
    if (command.startsWith("balance-role-cancel ")) {
      await cancelBalanceRoleSession(interaction, command.split(/\s+/)[1]);
      return;
    }
    if (command === "shop-search-open") {
      await showShopSearchModal(interaction);
      return;
    }
    if (command === "shop-status-toggle") {
      await handleShopStatusToggle(interaction);
      return;
    }
    if (command === "shop-sales-dm-toggle") {
      await handleShopSalesDmToggle(interaction);
      return;
    }
    if (command.startsWith("shop-edit ")) {
      await showShopEditModal(interaction, command.split(/\s+/)[1]);
      return;
    }
    if (command.startsWith("shop-resubmit ")) {
      await showShopResubmitModal(interaction, command.split(/\s+/)[1]);
      return;
    }
    if (command === "market-settings-edit") {
      await showMarketSettingsModal(interaction);
      return;
    }
    if (command.startsWith("salary-execute ")) {
      await executeSalaryDistribution(interaction, command.split(/\s+/)[1]);
      return;
    }
    if (command.startsWith("salary-cancel ")) {
      await cancelSalarySession(interaction, command.split(/\s+/)[1]);
      return;
    }
    if (!canRunCommand(interaction, command)) {
      await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
      return;
    }

    const actor = actorFromInteraction(interaction);
    const result = engine.run(command, actor);
    decorateResultForDiscord(result, interaction);
    store.save(engine.state);
    await updateDiscord(interaction, result);
    void processOfficialPurchaseEffects(interaction, result);
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const slash = commandFromSlash(interaction);
  if (!slash) return;
  if (slash.adminOnly && !isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。鍵が違います。", ephemeral: true });
    return;
  }
  if (slash.transfer) {
    await handleTransferSlash(interaction);
    return;
  }
  const command = slash.command;
  if (!canRunCommand(interaction, command)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  const actor = actorFromInteraction(interaction);
  const result = engine.run(command, actor);
  decorateResultForDiscord(result, interaction);
  store.save(engine.state);

  await replyDiscord(interaction, result, { ephemeral: slash.ephemeral });
  void processOfficialPurchaseEffects(interaction, result);
}

async function replyInteractionError(interaction) {
  if (!interaction?.isRepliable?.()) return;
  const payload = { content: "処理に失敗しました。もう一度押してみてください。", ephemeral: true };
  try {
    if (interaction.deferred || interaction.replied) await interaction.followUp(payload);
    else await interaction.reply(payload);
  } catch (replyError) {
    console.warn(`インタラクション失敗通知も送れませんでした: ${replyError.message}`);
  }
}

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) {
    if (message.author.id === DISBOARD_BOT_ID) await handleDisboardBump(message);
    return;
  }
  if (message.guild && message.channelId === panelState.rankPanel?.channelId) scheduleRankPanelRefresh(message.channel);

  const actor = actorFromMessage(message);
  if (message.guild && !message.content.startsWith(prefix)) {
    const activityResult = engine.awardTextActivity(actor);
    if (activityResult) {
      store.save(engine.state);
      if (!activityResult.silent) await sendRankAnnouncement(activityResult, message.author.id, message);
    }
    return;
  }

  if (!message.content.startsWith(prefix)) return;
  const command = message.content.slice(prefix.length).trim() || "help";
  if (shopMaintenance && isShopCommand(command)) {
    await message.reply("ショップ機能は現在メンテナンス中です。出品・購入・審査・オークションは一時停止しています。");
    return;
  }
  if (!canRunCommand(message, command)) {
    await message.reply("そこは運営用です。");
    return;
  }
  const result = engine.run(command, actor);
  decorateResultForDiscord(result, message);
  store.save(engine.state);
  await sendResult(message.channel, result);
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  const member = newState.member || oldState.member;
  if (!member || member.user.bot || !member.guild) return;

  const actor = actorFromMember(member);
  const moved = oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId;
  const joined = !oldState.channelId && newState.channelId;
  const left = oldState.channelId && !newState.channelId;

  if (joined) {
    engine.startVoiceSession(actor, newState.channelId);
    store.save(engine.state);
    return;
  }

  if (left || moved) {
    const result = engine.finishVoiceSession(actor, voiceRewardOptionsForChannel(oldState.channel));
    if (moved) engine.startVoiceSession(actor, newState.channelId);
    await cleanupTemporaryVoiceChannel(oldState.channel);
    store.save(engine.state);
    if (result?.kind === "vc_rank_up") await sendRankAnnouncement(result, member.id, newState);
  }
});

client.on(Events.InviteCreate, async (invite) => {
  await refreshInviteCache(invite.guild);
});

client.on(Events.InviteDelete, async (invite) => {
  if (invite.guild) {
    const cached = inviteCache.get(invite.guild.id)?.get(invite.code);
    creditExhaustedDeletedInvite(invite.guild.id, cached);
  }
  await refreshInviteCache(invite.guild);
});

client.on(Events.GuildMemberAdd, async (member) => {
  if (member.user.bot) return;
  syncGuildMember(member);
  await handleBoostMemberState(member, "member-add");
  const used = await detectUsedInvite(member.guild);
  const result = used?.inviter
    ? engine.recordInviteJoin(
        actorFromUser(member.guild.id, used.inviter),
        actorFromMember(member),
        { code: used.code }
      )
    : null;
  // 初期Risは本人が参加操作をした時だけ付与する。入室イベントでは住民記録と招待だけを更新する。
  const joinedUser = engine.getUser(actorFromMember(member).id, actorFromMember(member).name);
  store.save(engine.state);
  if (result) {
    await sendLog({
      ok: true,
      title: "招待成立",
      lines: [`${result.inviter.name} -> ${result.invitee.name}`, "初期Risは本人が参加操作をした時に付与されます。"]
    });
  } else {
    await sendLog({
      ok: true,
      title: "入室記録",
      lines: [`${joinedUser.name} が入室しました。初期Risは参加操作時に付与されます。`]
    });
  }
});

client.on(Events.GuildMemberRemove, async (member) => {
  if (member.user.bot) return;
  removeGuildMember(member);
  recordBoostMemberLeft(member);
  engine.recordInviteLeave(actorFromMember(member));
  store.save(engine.state);
});

client.on(Events.GuildMemberUpdate, async (_oldMember, member) => {
  if (member.user.bot) return;
  syncGuildMember(member);
  await handleBoostMemberState(member, "member-update");
});

if (process.env.IRIS_ENTRYPOINT_TEST === "1") {
  module.exports = { assertUniquePanelComponentIds, buildComponents, client, engine };
} else {
  client.login(token);
}

async function registerSlashCommand() {
  if (!clientId) {
    console.log("DISCORD_CLIENT_ID が未設定なのでスラッシュコマンド登録をスキップします。");
    return;
  }

  const commands = buildSlashCommands();

  const rest = new REST({ version: "10" }).setToken(token);
  const route = guildId
    ? Routes.applicationGuildCommands(clientId, guildId)
    : Routes.applicationCommands(clientId);

  await rest.put(route, { body: commands.map((command) => command.toJSON()) });
  const names = commands.map((command) => `/${command.toJSON().name}`).join(" ");
  console.log(guildId ? `ギルド ${guildId} に ${names} を登録しました。` : `グローバル ${names} を登録しました。`);
}

function buildSlashCommands() {
  return [
    new SlashCommandBuilder()
      .setName("アイリス")
      .setDescription("アイリス経済圏のホームパネルを開きます"),
    new SlashCommandBuilder()
      .setName("カード")
      .setDescription("残高、発言、通話ランクをプロフィールカードで表示します"),
    new SlashCommandBuilder()
      .setName("宿")
      .setDescription("運営用: 二人宿・通話ラウンジのパネルを開きます")
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
      .addStringOption((option) =>
        option
          .setName("パネル")
          .setDescription("開くパネル")
          .setRequired(false)
          .addChoices(
            { name: "二人宿", value: "inn" },
            { name: "通話ラウンジ", value: "lounge" }
          )
      ),
    new SlashCommandBuilder()
      .setName("ショップ")
      .setDescription("商品購入、民営ショップ、公式オークションの入口を開きます"),
    new SlashCommandBuilder()
      .setName("自分の店")
      .setDescription("出品、売上、取引中の商品を管理します"),
    new SlashCommandBuilder()
      .setName("送金")
      .setDescription("他の住民に Ris を送金します")
      .addUserOption((option) =>
        option.setName("相手").setDescription("送金相手").setRequired(true)
      )
      .addIntegerOption((option) =>
        option.setName("金額").setDescription("送金する Ris の額（1以上）").setRequired(true).setMinValue(1)
      ),
    new SlashCommandBuilder()
      .setName("管理")
      .setDescription("運営用の管理パネルを開きます")
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  ];
}

function commandFromSlash(interaction) {
  switch (interaction.commandName) {
    case "アイリス":
      return { command: "panel home", ephemeral: true, adminOnly: false };
    case "カード":
      return { command: "card", ephemeral: false, adminOnly: false };
    case "宿": {
      const panel = interaction.options.getString("パネル") || "inn";
      return { command: `panel ${panel}`, ephemeral: false, adminOnly: true };
    }
    case "ショップ":
      return { command: "panel marketplace", ephemeral: true, adminOnly: false };
    case "自分の店":
      return { command: "panel my-shop", ephemeral: true, adminOnly: false };
    case "送金":
      return { transfer: true, ephemeral: true, adminOnly: false };
    case "管理":
      return { command: "panel admin", ephemeral: true, adminOnly: true };
    default:
      return null;
  }
}

function actorFromInteraction(interaction) {
  const guildPart = interaction.guildId || "dm";
  const memberName = interaction.member?.displayName;
  return {
    id: `${guildPart}:${interaction.user.id}`,
    name: memberName || interaction.user.globalName || interaction.user.username
  };
}

function actorFromMessage(message) {
  const guildPart = message.guild?.id || "dm";
  return {
    id: `${guildPart}:${message.author.id}`,
    name: message.member?.displayName || message.author.globalName || message.author.username
  };
}

function actorFromMember(member) {
  return {
    id: `${member.guild.id}:${member.user.id}`,
    name: member.displayName || member.user.globalName || member.user.username
  };
}

function syncGuildMemberDirectory(guild) {
  if (!guild?.id || !guild.members?.cache) return;
  const directory = new Map();
  for (const member of guild.members.cache.values()) {
    if (!member?.user?.bot) {
      directory.set(member.user.id, {
        id: member.user.id,
        displayName: member.displayName || member.user.globalName || member.user.username || "名無し"
      });
    }
  }
  memberDirectoryByGuild.set(guild.id, directory);
}

function syncGuildMember(member) {
  if (!member?.guild?.id || !member.user || member.user.bot) return;
  const directory = memberDirectoryByGuild.get(member.guild.id) || new Map();
  directory.set(member.user.id, {
    id: member.user.id,
    displayName: member.displayName || member.user.globalName || member.user.username || "名無し"
  });
  memberDirectoryByGuild.set(member.guild.id, directory);
}

function removeGuildMember(member) {
  const directory = member?.guild?.id ? memberDirectoryByGuild.get(member.guild.id) : null;
  if (directory && member?.user?.id) directory.delete(member.user.id);
}

function voiceRewardOptionsForChannel(channel) {
  const context = {
    channelId: channel?.id || null,
    parentId: channel?.parentId || null
  };
  const xpMultiplier = engine.vcXpMultiplierForVoiceContext?.(context) ?? 1;
  return { ...context, xpMultiplier };
}

function actorFromUser(guildId, user) {
  return {
    id: `${guildId}:${user.id}`,
    name: user.globalName || user.username
  };
}

function canRunCommand(context, command) {
  // economy側の parseInput は \s+ split なので、全角スペースや連続スペースも同じ1コマンドに解釈される。
  // ゲート判定も同じ正規化をしないと "panel  admin" などがすり抜ける。
  const normalized = String(command || "").trim().toLowerCase().replace(/\s+/g, " ");
  const restricted =
    normalized.startsWith("marketplace auction-end") ||
    normalized.startsWith("marketplace review") ||
    normalized.startsWith("marketplace order") ||
    normalized.startsWith("marketplace official-manage") ||
    normalized.startsWith("marketplace official-fulfillment") ||
    normalized === "panel market-admin" ||
    normalized === "panel official-product-admin" ||
    normalized === "panel official-auction-admin" ||
    normalized === "panel market-review" ||
    normalized === "panel market-trades" ||
    normalized === "panel market-logs" ||
    normalized === "panel official-fulfillment" ||
    normalized === "panel inn" ||
    normalized === "panel yado" ||
    normalized === "panel 宿" ||
    normalized === "panel 二人宿" ||
    normalized === "panel admin" ||
    normalized === "panel 管理" ||
    normalized === "panel 運営" ||
    normalized === "panel ショップ管理" ||
    normalized === "panel マーケット管理" ||
    normalized === "panel admin-campaign" ||
    normalized === "panel campaign管理" ||
    normalized === "panel campaign-pending" ||
    normalized === "panel admin-balance" ||
    normalized === "panel admin-rank" ||
    normalized === "panel admin-maintenance" ||
    normalized === "panel boost-rewards" ||
    normalized === "panel rank-xp-settings" ||
    normalized === "panel vc-xp-location-settings" ||
    normalized === "panel vc-xp-location" ||
    normalized.startsWith("campaign start") ||
    normalized.startsWith("campaign stop") ||
    normalized.startsWith("campaign admin") ||
    normalized.startsWith("campaign manage") ||
    normalized.startsWith("campaign pending") ||
    normalized.startsWith("campaign cancel-reset") ||
    normalized.startsWith("campaign reset") ||
    normalized.startsWith("rankxp") ||
    normalized.startsWith("xp-settings");
  if (!restricted) return true;
  return isAdmin(context);
}

function isAdmin(context) {
  const discordUserId =
    typeof context === "string"
      ? context
      : context?.user?.id || context?.author?.id || "";
  if (adminUserIds.size > 0) return adminUserIds.has(discordUserId);
  if (context?.memberPermissions?.has?.(PermissionFlagsBits.ManageGuild)) return true;
  if (context?.member?.permissions?.has?.(PermissionFlagsBits.ManageGuild)) return true;
  return false;
}

async function refreshInviteCaches() {
  for (const guild of client.guilds.cache.values()) {
    await refreshInviteCache(guild);
  }
}

async function refreshInviteCache(guild) {
  if (!guild) return null;
  try {
    const invites = await guild.invites.fetch();
    const cache = new Map();
    for (const invite of invites.values()) {
      cache.set(invite.code, {
        code: invite.code,
        uses: invite.uses || 0,
        maxUses: invite.maxUses || 0,
        inviter: invite.inviter || null
      });
    }
    inviteCache.set(guild.id, cache);
    return cache;
  } catch (error) {
    console.warn(`${guild.name} の招待キャッシュをスキップしました: ${error.message}`);
    return null;
  }
}

function pendingInviteUsesFor(guildId) {
  if (!pendingInviteUses.has(guildId)) pendingInviteUses.set(guildId, []);
  return pendingInviteUses.get(guildId);
}

function addPendingInviteUses(guildId, invite, count) {
  const queue = pendingInviteUsesFor(guildId);
  const expiresAt = Date.now() + PENDING_INVITE_USE_TTL_MS;
  for (let i = 0; i < count; i += 1) {
    queue.push({ code: invite.code, inviter: invite.inviter || null, expiresAt });
  }
}

function consumePendingInviteUse(guildId) {
  const queue = pendingInviteUsesFor(guildId);
  while (queue.length > 0) {
    const entry = queue.shift();
    if (entry.expiresAt >= Date.now()) return entry;
  }
  return null;
}

// 使い切り招待はDiscordが使用と同時に削除するため、消えた招待も1回分の使用として計上する。
// InviteDelete イベント経由と before/after 差分の両方から呼ばれるので、code 単位で重複計上を防ぐ。
function creditExhaustedDeletedInvite(guildId, cached) {
  if (!cached || !(cached.maxUses > 0) || cached.uses < cached.maxUses - 1) return;
  const key = `${guildId}:${cached.code}`;
  if (creditedDeletedInviteCodes.has(key)) return;
  creditedDeletedInviteCodes.set(key, Date.now());
  addPendingInviteUses(guildId, cached, 1);
  const cutoff = Date.now() - 60 * 60 * 1000;
  for (const [k, at] of creditedDeletedInviteCodes) {
    if (at < cutoff) creditedDeletedInviteCodes.delete(k);
  }
}

// 同時参加で差分検知が交錯しないよう、検知は直列に実行する
let inviteDetectionChain = Promise.resolve();
function detectUsedInvite(guild) {
  const task = inviteDetectionChain.then(() => detectUsedInviteNow(guild));
  inviteDetectionChain = task.then(
    () => null,
    (error) => {
      console.warn(`招待検知に失敗しました: ${error.message}`);
      return null;
    }
  );
  return task.catch(() => null);
}

async function detectUsedInviteNow(guild) {
  const hasBaseline = inviteCache.has(guild.id);
  const before = inviteCache.get(guild.id) || new Map();
  const after = await refreshInviteCache(guild);

  if (after && hasBaseline) {
    for (const invite of after.values()) {
      const previous = before.get(invite.code);
      const delta = invite.uses - (previous ? previous.uses : 0);
      if (delta > 0) addPendingInviteUses(guild.id, invite, delta);
    }
    for (const [code, previous] of before) {
      if (!after.has(code)) creditExhaustedDeletedInvite(guild.id, previous);
    }
  }

  return consumePendingInviteUse(guild.id);
}

async function replyDiscord(interaction, result, options = {}) {
  const cardImage = await buildProfileCardAttachment(result);
  if (cardImage) {
    await interaction.reply({ files: [cardImage.attachment], ephemeral: Boolean(options.ephemeral) });
  } else {
    const embed = buildEmbed(result, cardImage?.name);
    const components = buildComponents(result);
    if (embed) {
      await interaction.reply({ embeds: [embed], components, files: cardImage ? [cardImage.attachment] : [], ephemeral: Boolean(options.ephemeral) });
    } else {
      const chunks = chunkDiscord(formatDiscord(result));
      await interaction.reply({ content: chunks[0], components, ephemeral: Boolean(options.ephemeral) });
      for (const chunk of chunks.slice(1)) {
        await interaction.followUp({ content: chunk, ephemeral: Boolean(options.ephemeral) });
      }
    }
  }
  if (Array.isArray(result?.notifications) && result.notifications.length) {
    await deliverNotifications(result.notifications);
  }
}

async function updateDiscord(interaction, result) {
  const cardImage = await buildProfileCardAttachment(result);
  if (cardImage) {
    await interaction.update({ content: "", embeds: [], components: [], files: [cardImage.attachment] });
  } else {
    const embed = buildEmbed(result, cardImage?.name);
    const components = buildComponents(result, { fallback: true });
    if (embed) {
      await interaction.update({ content: "", embeds: [embed], components, files: cardImage ? [cardImage.attachment] : [] });
    } else {
      const chunks = chunkDiscord(formatDiscord(result));
      await interaction.update({ content: chunks[0], embeds: [], components });
      for (const chunk of chunks.slice(1)) {
        await interaction.followUp({ content: chunk, ephemeral: true });
      }
    }
  }
  if (Array.isArray(result?.notifications) && result.notifications.length) {
    await deliverNotifications(result.notifications);
  }
}

async function deliverNotifications(notifications) {
  if (!Array.isArray(notifications) || notifications.length === 0) return;
  let stateChanged = false;
  for (const note of notifications) {
    try {
      const delivered = await deliverOne(note);
      if (delivered?.stateChanged) stateChanged = true;
    } catch (error) {
      console.warn(`通知配送失敗 (${note.event}): ${error.message}`);
    }
  }
  if (stateChanged) {
    try {
      store.save(engine.state);
    } catch (error) {
      console.warn(`通知状態の保存に失敗しました: ${error.message}`);
    }
  }
}

async function deliverOne(note) {
  const userRec = engine.state.users?.[note.userId];
  const enabled = Boolean(userRec?.notifyEnabled);
  const sellerSaleDm = note.event === "listing_sold" && userRec?.marketplace?.salesDmEnabled !== false;
  const embed = buildNotificationEmbed(note);
  if (!embed) return { stateChanged: false };
  let stateChanged = false;
  if (enabled || sellerSaleDm) {
    const discordId = extractDiscordUserId(note.userId);
    if (discordId) {
      try {
        const user = await client.users.fetch(discordId).catch(() => null);
        if (user) {
          await user.send({ embeds: [embed] });
          const changed = sellerSaleDm && note.data?.orderId
            ? engine.markOrderSellerNotification(note.data.orderId, "sent")
            : false;
          return { stateChanged: changed };
        }
      } catch (error) {
        if (sellerSaleDm && note.data?.orderId) {
          stateChanged = engine.markOrderSellerNotification(note.data.orderId, "failed") || stateChanged;
        }
      }
    }
  }
  await sendLog({ ok: true, title: embed.data?.title || "通知", lines: [embed.data?.description || ""].filter(Boolean) });
  if (sellerSaleDm && note.data?.orderId) {
    stateChanged = engine.markOrderSellerNotification(note.data.orderId, "failed") || stateChanged;
  }
  return { stateChanged };
}

function extractDiscordUserId(internalUserId) {
  if (typeof internalUserId !== "string") return null;
  const idx = internalUserId.indexOf(":");
  if (idx < 0) return null;
  return internalUserId.slice(idx + 1) || null;
}

function buildNotificationEmbed(note) {
  const embed = new EmbedBuilder().setFooter({ text: "アイリス経済圏 / 通知" });
  const data = note.data || {};
  switch (note.event) {
    case "listing_approved":
      return embed
        .setTitle("◆ 出品が承認されました")
        .setColor(0x22c55e)
        .setDescription(`#${data.listingId} **${data.name}** が公開されました。（価格 ${fmt(data.price || 0)}）`);
    case "listing_rejected":
      return embed
        .setTitle("◇ 出品が却下されました")
        .setColor(0xef4444)
        .setDescription(`#${data.listingId} **${data.name}** が却下されました。`)
        .addFields({ name: "理由", value: data.reason || "（記入なし）" });
    case "listing_sold":
      return embed
        .setTitle("◆ 商品が売れました")
        .setColor(0x22c55e)
        .setDescription(`#${data.listingId} **${data.itemName}** を ${data.buyerName} が購入しました。`)
        .addFields(
          { name: "取引ID", value: data.orderId ? `#${data.orderId}` : "-", inline: true },
          { name: "購入者", value: extractDiscordUserId(data.buyerId) ? `<@${extractDiscordUserId(data.buyerId)}>` : data.buyerName || "-", inline: true },
          { name: "売上", value: fmt(data.sellerReceive || 0), inline: true },
          { name: "価格", value: fmt(data.price || 0), inline: true },
          { name: "対応", value: data.manual ? "手動対応が必要（取引中）" : "自動付与済み", inline: true }
        );
    case "listing_purchased":
      return embed
        .setTitle("◆ 購入完了")
        .setColor(0x22c55e)
        .setDescription(`**${data.itemName}** を ${data.sellerName} から購入しました。（${fmt(data.price || 0)}）`)
        .addFields(
          { name: "状態", value: data.manual ? "手動対応待ち（販売者から連絡が来ます）" : "自動付与済み（持ち物から確認）", inline: true },
          { name: "販売方式", value: data.mode === "timed" ? `期間制（期限 ${data.expiresAt ? new Date(data.expiresAt).toLocaleDateString("ja-JP") : "未設定"}）` : "買い切り", inline: true }
        );
    case "auction_outbid":
      return embed
        .setTitle("◇ 入札が上書きされました")
        .setColor(0xf59e0b)
        .setDescription(`#${data.auctionId} **${data.name}** の最高入札が ${fmt(data.newBid)} に更新されました。`)
        .addFields(
          { name: "あなたの前回入札", value: `${fmt(data.previousBid)}（返金済み）`, inline: true },
          { name: "現在の入札者", value: data.newBidderName || "不明", inline: true }
        );
    case "auction_won":
      return embed
        .setTitle("◆ 落札しました")
        .setColor(0x22c55e)
        .setDescription(`#${data.auctionId} **${data.name}** を ${fmt(data.winningBid)} で落札しました。持ち物に付与済み。`);
    case "order_admin_completed":
      return embed
        .setTitle("◆ 取引が完了扱いになりました")
        .setColor(0x22c55e)
        .setDescription(`#${data.orderId} **${data.itemName}** を運営が完了処理しました。`);
    case "order_refunded":
      return embed
        .setTitle("◇ 取引が返金されました")
        .setColor(0xf59e0b)
        .setDescription(`#${data.orderId} **${data.itemName}**（${fmt(data.amount || 0)}）が返金されました。`)
        .addFields({ name: "役割", value: data.role === "seller" ? "販売者（売上巻き戻し）" : "購入者（返金受領）", inline: true });
    case "listing_expired":
      return embed
        .setTitle("◇ 商品の期限が切れました")
        .setColor(0x64748b)
        .setDescription(`#${data.orderId} **${data.itemName}** の使用期限が切れました。`);
    default:
      return null;
  }
}

async function sendResult(channel, result) {
  const cardImage = await buildProfileCardAttachment(result);
  if (cardImage) {
    await channel.send({ files: [cardImage.attachment] });
    return;
  }
  const embed = buildEmbed(result, cardImage?.name);
  const components = buildComponents(result);
  if (embed) {
    await channel.send({ embeds: [embed], components, files: cardImage ? [cardImage.attachment] : [] });
    return;
  }

  for (const chunk of chunkDiscord(formatDiscord(result))) {
    await channel.send({ content: chunk, components });
    components.length = 0;
  }
}

async function sendLog(result) {
  if (!logChannelId) return;
  try {
    const channel = await client.channels.fetch(logChannelId);
    if (channel?.isTextBased()) await sendResult(channel, result);
  } catch (error) {
    console.warn(`ログ送信に失敗しました: ${error.message}`);
  }
}

async function sendRankAnnouncement(result, discordUserId, context = null) {
  const targetChannelId = panelState.rankNotifyChannelId || rankChannelId;
  if (!targetChannelId) return;
  try {
    const channel = await client.channels.fetch(targetChannelId);
    if (!channel?.isTextBased?.()) return;
    const cardImage = await buildRankUpCardAttachment(result, context, discordUserId);
    const embed = buildRankUpEmbed(result, discordUserId);
    const mention = discordUserId ? `<@${discordUserId}>` : "";
    await channel.send({
      content: mention || undefined,
      embeds: embed ? [embed] : [],
      files: cardImage ? [cardImage.attachment] : [],
      allowedMentions: discordUserId ? { users: [discordUserId] } : undefined
    });
  } catch (error) {
    console.warn(`ランク昇格通知に失敗しました: ${error.message}`);
  }
}

function buildRankUpEmbed(result, discordUserId) {
  const meta = result?.meta;
  const mentionText = discordUserId ? `<@${discordUserId}>` : (meta?.userName || "住民");
  const embed = new EmbedBuilder()
    .setColor(rankUpColor(meta))
    .setTitle(result.title || "ランク昇格");

  if (meta?.previousRank && meta?.newRank) {
    embed.setDescription(`${mentionText} → **${meta.newRank}**`);
  } else {
    embed.setDescription(`${mentionText} のランクが上がりました。`);
  }
  return embed;
}

function rankUpColor(meta) {
  if (!meta) return 0x7c3aed;
  if (meta.axis === "invite") return 0x22c55e;
  if (meta.axis === "bump") return 0xf59e0b;
  const textColors = [0x64748b, 0x2563eb, 0x0891b2, 0x14b8a6, 0x7c3aed, 0xd97706];
  const vcColors = [0x64748b, 0x2563eb, 0x22c55e, 0x14b8a6, 0x4f46e5, 0xd97706];
  const ranks = ["観測者", "発言者", "会話設計士", "文脈編集者", "タイムライン統括", "言語圏の代表"];
  const vcRanks = ["入室者", "傾聴者", "雑談主任", "会議進行役", "深夜VC責任者", "声のインフラ"];
  if (meta.axis === "text") {
    const idx = ranks.indexOf(meta.newRank);
    return idx >= 0 ? textColors[idx] : 0x7c3aed;
  }
  const idx = vcRanks.indexOf(meta.newRank);
  return idx >= 0 ? vcColors[idx] : 0x7c3aed;
}

function progressBar(percent) {
  const width = 14;
  const filled = Math.max(0, Math.min(width, Math.round((percent / 100) * width)));
  return `\`${"▰".repeat(filled)}${"▱".repeat(width - filled)}\``;
}

async function handleRankPanelButton(interaction) {
  const action = interaction.customId.split(":")[2];
  const actor = actorFromInteraction(interaction);
  const commands = { tc: "rank text", vc: "rank vc", invite: "rank invite", bump: "rank bump" };
  const command = commands[action] || "card";
  const result = engine.run(command, actor);
  decorateResultForDiscord(result, interaction);
  store.save(engine.state);
  await replyDiscord(interaction, result, { ephemeral: true });
}

async function showMarketShopSettingsModal(interaction) {
  const actor = actorFromInteraction(interaction);
  const user = engine.getUser(actor.id, actor.name);
  const shop = user.marketplace || {};
  const modal = new ModalBuilder()
    .setCustomId("eco:modal:market-shop-settings")
    .setTitle("店の設定");
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("name")
        .setLabel("店名")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(40)
        .setValue((shop.shopName || `${actor.name}の店`).slice(0, 40))
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("description")
        .setLabel("説明")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setMaxLength(120)
        .setValue((shop.shopDescription || "").slice(0, 120))
    )
  );
  await interaction.showModal(modal);
}

async function updateMarketShopFromModal(interaction) {
  const actor = actorFromInteraction(interaction);
  const result = engine.updateShopSettings(engine.getUser(actor.id, actor.name), {
    name: interaction.fields.getTextInputValue("name"),
    description: interaction.fields.getTextInputValue("description")
  });
  decorateResultForDiscord(result, interaction);
  store.save(engine.state);
  await replyDiscord(interaction, result, { ephemeral: true });
}

async function showMarketListingModal(interaction) {
  const actor = actorFromInteraction(interaction);
  const user = engine.getUser(actor.id, actor.name);
  if (!user.marketplace?.shopOpened) {
    await interaction.reply({ content: "先に「店を開く」を押してください。", ephemeral: true });
    return;
  }
  const draft = user.marketplace?.listingDraft || {};
  const modal = new ModalBuilder()
    .setCustomId("eco:modal:market-listing-create")
    .setTitle(`出品内容 ${draft.mode === "timed" ? "期間制" : "買い切り"}`);
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("name")
        .setLabel("商品名")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(48)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("price")
        .setLabel("価格（Ris）")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(12)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("stock")
        .setLabel("在庫")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(3)
        .setValue("1")
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("duration")
        .setLabel("期間（日数、買い切りなら空欄）")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(4)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("description")
        .setLabel("説明")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setMaxLength(240)
    )
  );
  await interaction.showModal(modal);
}

async function createMarketListingFromModal(interaction) {
  const actor = actorFromInteraction(interaction);
  const user = engine.getUser(actor.id, actor.name);
  const draft = user.marketplace?.listingDraft || {};
  const result = engine.createUserListing(user, {
    name: interaction.fields.getTextInputValue("name"),
    price: interaction.fields.getTextInputValue("price"),
    stock: interaction.fields.getTextInputValue("stock"),
    durationDays: interaction.fields.getTextInputValue("duration"),
    description: interaction.fields.getTextInputValue("description"),
    type: draft.type,
    mode: draft.mode
  });
  decorateResultForDiscord(result, interaction);
  store.save(engine.state);
  await replyDiscord(interaction, result, { ephemeral: true });
}

async function postMarketPanel(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  if (!interaction.channel?.isTextBased?.()) {
    await interaction.reply({ content: "テキストチャンネルで使ってください。", ephemeral: true });
    return;
  }
  const actor = actorFromInteraction(interaction);
  const result = engine.run("panel marketplace", actor);
  decorateResultForDiscord(result, interaction);
  store.save(engine.state);
  const embed = buildEmbed(result);
  const components = buildComponents(result);
  await interaction.channel.send({ embeds: embed ? [embed] : [], components });
  await interaction.reply({ content: "このチャンネルに常設ショップを送信しました。", ephemeral: true });
}

async function showMarketAuctionCreateModal(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  const modal = new ModalBuilder()
    .setCustomId("eco:modal:market-auction-create")
    .setTitle("公式オークション作成");
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("name")
        .setLabel("商品名")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(48)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("prices")
        .setLabel("開始 / 即決 / 入札増分（後ろ2つは任意）")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(40)
        .setPlaceholder("例: 3000 / 10000 / 300  または 3000 だけでもOK")
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("durationMinutes")
        .setLabel("終了までの分数（5〜10080）")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(6)
        .setValue("60")
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("type")
        .setLabel("種類（称号/アイテム/チケット/権利/サービス等）")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(20)
        .setValue("称号")
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("description")
        .setLabel("説明")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setMaxLength(240)
    )
  );
  await interaction.showModal(modal);
}

async function createMarketAuctionFromModal(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  const actor = actorFromInteraction(interaction);
  const pricesRaw = interaction.fields.getTextInputValue("prices") || "";
  const { startPrice, buyoutPrice, bidIncrement } = parseAuctionPrices(pricesRaw);
  const result = engine.createOfficialAuction(engine.getUser(actor.id, actor.name), {
    name: interaction.fields.getTextInputValue("name"),
    startPrice,
    buyoutPrice,
    bidIncrement,
    durationMinutes: interaction.fields.getTextInputValue("durationMinutes"),
    type: auctionTypeFromInput(interaction.fields.getTextInputValue("type")),
    description: interaction.fields.getTextInputValue("description")
  });
  decorateResultForDiscord(result, interaction);
  store.save(engine.state);
  await replyDiscord(interaction, result, { ephemeral: true });
}

function isShopCommand(command) {
  const normalized = String(command || "").trim().toLowerCase().replace(/\s+/g, " ");
  return normalized === "shop" || normalized === "ショップ" || normalized === "店" ||
    normalized.startsWith("marketplace") || normalized.startsWith("market-") || normalized.startsWith("shop-") ||
    normalized === "panel marketplace" || normalized === "panel official-shop" || normalized === "panel user-shops" ||
    normalized === "panel market-inventory" || normalized === "panel my-shop" || normalized === "panel market-admin" ||
    normalized === "panel official-product-admin" || normalized === "panel official-auction-admin" ||
    normalized === "panel market-review" || normalized === "panel market-trades" || normalized === "panel market-logs";
}

function isShopMaintenanceInteraction(interaction) {
  const customId = String(interaction?.customId || "");
  if (customId.startsWith("eco:market:") || customId.startsWith("eco:shop:") || customId.startsWith("eco:review:") || customId.startsWith("eco:order:") || customId.startsWith("eco:modal:market") || customId.startsWith("eco:modal:shop")) return true;
  if (customId === "eco:panel:marketplace" || customId === "eco:panel:official-shop" || customId === "eco:panel:user-shops" || customId === "eco:panel:market-inventory" || customId === "eco:panel:my-shop" || customId.startsWith("eco:panel:market-") || customId.startsWith("eco:panel:official-")) return true;
  const selected = interaction?.values?.[0] || "";
  return selected.startsWith("run:marketplace") || selected.startsWith("panel:market") || selected.startsWith("panel:official-") || selected.startsWith("panel:user-shops") || selected.startsWith("panel:my-shop");
}

async function replyShopMaintenance(interaction) {
  const payload = { content: "ショップ機能は現在メンテナンス中です。出品・購入・審査・オークションは一時停止しています。", ephemeral: true };
  if (interaction.deferred || interaction.replied) await interaction.followUp(payload);
  else await interaction.reply(payload);
}

async function showOfficialItemCreateModal(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  const modal = new ModalBuilder()
    .setCustomId("eco:modal:market-official-item-create")
    .setTitle("公式商品を追加");
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("id")
        .setLabel("商品ID（英数字。例: vip-pass）")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(40)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("name")
        .setLabel("商品名")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(48)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("priceMaxType")
        .setLabel("価格 / 所持上限 / 種別")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(80)
        .setPlaceholder("例: 10000 / 1 / ロール30日")
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("effect")
        .setLabel("効果テキスト")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(160)
        .setPlaceholder("例: VIPロール30日分（手動付与）")
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("description")
        .setLabel("説明")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setMaxLength(400)
    )
  );
  await interaction.showModal(modal);
}

async function createOfficialItemFromModal(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  const actor = actorFromInteraction(interaction);
  const admin = engine.getUser(actor.id, actor.name);
  const { price, max, type } = parseOfficialItemPriceMaxType(interaction.fields.getTextInputValue("priceMaxType"));
  const result = engine.adminCreateOfficialItem(admin, {
    id: interaction.fields.getTextInputValue("id"),
    name: interaction.fields.getTextInputValue("name"),
    price,
    max,
    type,
    effect: interaction.fields.getTextInputValue("effect"),
    description: interaction.fields.getTextInputValue("description")
  });
  decorateResultForDiscord(result, interaction);
  store.save(engine.state);
  await replyDiscord(interaction, result, { ephemeral: true });
}

async function handleOfficialMarketControl(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  if (interaction.customId.startsWith("eco:market:official-fulfillment-")) {
    await handleOfficialFulfillmentControl(interaction);
    return;
  }
  const parts = interaction.customId.split(":");
  const action = parts[2].replace("official-item-", "");
  const id = parts.slice(3).join(":");
  const actor = actorFromInteraction(interaction);
  const admin = engine.getUser(actor.id, actor.name);
  if (action === "edit") {
    await showOfficialItemEditModal(interaction, id);
    return;
  }
  if (action === "toggle") {
    const result = engine.adminToggleOfficialItem(admin, id);
    decorateResultForDiscord(result, interaction);
    store.save(engine.state);
    await updateDiscord(interaction, result);
    return;
  }
  if (action === "role") {
    if (!interaction.guild) {
      await interaction.reply({ content: "サーバー内で操作してください。", ephemeral: true });
      return;
    }
    const menu = new RoleSelectMenuBuilder()
      .setCustomId(`eco:role:official-item:${id}`)
      .setPlaceholder("購入時に付与するロールを選ぶ")
      .setMinValues(1)
      .setMaxValues(1);
    await interaction.reply({ content: "ロールを選ぶと、この商品の購入時にBotが付与を試みます。期限は商品編集の「ロール期限日数」で設定します。", components: [new ActionRowBuilder().addComponents(menu)], ephemeral: true });
  }
}

async function handleOfficialFulfillmentControl(interaction) {
  const parts = interaction.customId.split(":");
  const action = parts[3];
  const taskId = parts[4];
  const actor = actorFromInteraction(interaction);
  const admin = engine.getUser(actor.id, actor.name);
  if (action === "complete") {
    const result = engine.completeOfficialFulfillment(admin, taskId);
    decorateResultForDiscord(result, interaction);
    store.save(engine.state);
    await updateDiscord(interaction, result);
    return;
  }
  if (action === "retry") {
    const task = engine.officialFulfillmentTask(taskId);
    if (!task?.roleId) {
      await interaction.reply({ content: "この購入には再試行するロールがありません。", ephemeral: true });
      return;
    }
    const result = await grantOfficialRoleForTask(interaction.guild, task, interaction.user.id);
    decorateResultForDiscord(result, interaction);
    await updateDiscord(interaction, result);
  }
}

async function showOfficialItemEditModal(interaction, id) {
  const item = engine.officialCustomItems()[id];
  if (!item) {
    await interaction.reply({ content: "公式商品が見つかりません。", ephemeral: true });
    return;
  }
  const modal = new ModalBuilder()
    .setCustomId(`eco:modal:market-official-item-edit:${id}`)
    .setTitle("公式商品を編集");
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId("name").setLabel("商品名").setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(48).setValue(item.name)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId("priceMaxStockType").setLabel("価格 / 所持上限 / 在庫 / 種別").setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(100).setValue(`${item.price} / ${item.max} / ${item.stock === null ? "無制限" : item.stock} / ${item.type}`)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId("saleRoleDays").setLabel("販売開始 / 販売終了 / ロール期限日数").setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(100).setValue(`${formatOfficialSaleDate(item.saleStartsAt)} / ${formatOfficialSaleDate(item.saleEndsAt)} / ${item.roleDurationDays || 0}`).setPlaceholder("例: - / 2026-08-01 00:00 / 30")
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId("effect").setLabel("効果テキスト").setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(160).setValue(item.effect)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId("descriptionGuide").setLabel("説明 / DM案内").setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(400).setValue(`${item.description}\n---\n${item.dmGuide || ""}`)
    )
  );
  await interaction.showModal(modal);
}

async function updateOfficialItemFromModal(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  const id = interaction.customId.split(":").slice(3).join(":");
  const { price, max, stock, type } = parseOfficialItemEditNumbers(interaction.fields.getTextInputValue("priceMaxStockType"));
  const { saleStartsAt, saleEndsAt, roleDurationDays } = parseOfficialItemSaleRoleDays(interaction.fields.getTextInputValue("saleRoleDays"));
  const { description, dmGuide } = parseOfficialItemDescriptionGuide(interaction.fields.getTextInputValue("descriptionGuide"));
  const actor = actorFromInteraction(interaction);
  const result = engine.adminUpdateOfficialItem(engine.getUser(actor.id, actor.name), id, {
    name: interaction.fields.getTextInputValue("name"), price, max, stock, type, saleStartsAt, saleEndsAt, roleDurationDays,
    effect: interaction.fields.getTextInputValue("effect"), description, dmGuide
  });
  decorateResultForDiscord(result, interaction);
  store.save(engine.state);
  await replyDiscord(interaction, result, { ephemeral: true });
}

async function handleOfficialItemRoleSelect(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  const id = interaction.customId.split(":").slice(3).join(":");
  const roleId = interaction.values?.[0];
  const role = roleId && interaction.guild ? await interaction.guild.roles.fetch(roleId).catch(() => null) : null;
  if (!role || role.managed || role.id === interaction.guild.roles.everyone.id) {
    await interaction.reply({ content: "付与できる通常ロールを選択してください。", ephemeral: true });
    return;
  }
  const botMember = interaction.guild.members.me;
  if (!botMember?.permissions.has(PermissionFlagsBits.ManageRoles) || role.position >= botMember.roles.highest.position) {
    await interaction.reply({ content: "Botにロール管理権限がないか、対象ロールがBotの最高ロール以上です。", ephemeral: true });
    return;
  }
  const actor = actorFromInteraction(interaction);
  const result = engine.adminSetOfficialItemRole(engine.getUser(actor.id, actor.name), id, role.id);
  decorateResultForDiscord(result, interaction);
  store.save(engine.state);
  await updateDiscord(interaction, result);
}

function parseOfficialItemEditNumbers(raw) {
  const parts = String(raw || "").split(/[\/／,，]/).map((part) => part.trim());
  return { price: parts[0] || "", max: parts[1] || "", stock: parts[2] || "", type: parts.slice(3).join(" / ") || "アイテム" };
}

function parseOfficialItemSaleRoleDays(raw) {
  const parts = String(raw || "").split(/[\/／,，]/).map((part) => part.trim());
  return { saleStartsAt: parts[0] || "", saleEndsAt: parts[1] || "", roleDurationDays: parts[2] || "0" };
}

function parseOfficialItemDescriptionGuide(raw) {
  const [description, ...guide] = String(raw || "").split(/\n---\n/);
  return { description: description.trim(), dmGuide: guide.join("\n---\n").trim() };
}

function formatOfficialSaleDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const parts = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const piece = (type) => parts.find((part) => part.type === type)?.value || "00";
  return `${piece("year")}-${piece("month")}-${piece("day")} ${piece("hour")}:${piece("minute")}`;
}

function parseOfficialItemPriceMaxType(raw) {
  const parts = String(raw || "")
    .split(/[\/／,，]/)
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    price: parts[0] || "",
    max: parts[1] || "1",
    type: parts[2] || "アイテム"
  };
}

function parseAuctionPrices(raw) {
  const parts = String(raw || "")
    .split(/[\/／,、]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return {
    startPrice: parts[0] || "",
    buyoutPrice: parts[1] || "",
    bidIncrement: parts[2] || ""
  };
}

async function showMarketAuctionBidModal(interaction, auctionId) {
  const actor = actorFromInteraction(interaction);
  const preview = engine.run(`marketplace auction ${auctionId}`, actor);
  const auction = engine.state.marketplace.auctions.find((entry) => String(entry.id) === String(auctionId));
  if (!auction || auction.status !== "open") {
    await updateDiscord(interaction, preview);
    return;
  }
  const minimum = engine.minimumAuctionBid(auction);
  const modal = new ModalBuilder()
    .setCustomId(`eco:modal:market-auction-bid:${auction.id}`)
    .setTitle(`入札 #${auction.id}`);
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("amount")
        .setLabel(`入札額（最低 ${fmt(minimum)}）`)
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(12)
        .setValue(String(minimum))
    )
  );
  await interaction.showModal(modal);
}

async function placeMarketAuctionBidFromModal(interaction) {
  const auctionId = interaction.customId.split(":")[3];
  const actor = actorFromInteraction(interaction);
  const result = engine.placeAuctionBid(
    engine.getUser(actor.id, actor.name),
    auctionId,
    interaction.fields.getTextInputValue("amount")
  );
  decorateResultForDiscord(result, interaction);
  store.save(engine.state);
  await replyDiscord(interaction, result, { ephemeral: true });
}

async function handleDisboardBump(message) {
  try {
    if (!message.guild) return;
    const description = message.embeds?.[0]?.description || "";
    if (!description.includes("表示順をアップ") && !/Bump done/i.test(description)) return;
    const bumper = message.interactionMetadata?.user || message.interaction?.user || null;
    if (!bumper) return;
    const member = await message.guild.members.fetch(bumper.id).catch(() => null);
    const actor = {
      id: `${message.guild.id}:${bumper.id}`,
      name: member?.displayName || bumper.globalName || bumper.username
    };
    const result = engine.recordBump(actor);
    store.save(engine.state);
    await message.channel.send({
      content: `<@${bumper.id}> Bumpありがとう！ **+${result.reward.toLocaleString("ja-JP")} Ris**（累計 ${result.count}回 / ${result.rankName}）`,
      allowedMentions: { users: [bumper.id] }
    }).catch(() => null);
    if (result.rankUp) {
      await sendRankAnnouncement(
        { title: "Bump階級昇格", lines: [], meta: result.rankUp },
        bumper.id,
        message
      );
    }
  } catch (error) {
    console.warn(`Bump処理に失敗しました: ${error.message}`);
  }
}

async function handleTransferSlash(interaction) {
  const target = interaction.options.getUser("相手");
  const amount = interaction.options.getInteger("金額");
  if (!target || !Number.isInteger(amount) || amount <= 0) {
    await interaction.reply({ content: "相手と金額（1以上）を指定してください。", ephemeral: true });
    return;
  }
  if (target.bot) {
    await interaction.reply({ content: "Bot には送金できません。", ephemeral: true });
    return;
  }
  const senderActor = actorFromInteraction(interaction);
  const targetMember = await interaction.guild?.members.fetch(target.id).catch(() => null);
  const recipientActor = {
    id: `${interaction.guildId || "dm"}:${target.id}`,
    name: targetMember?.displayName || target.globalName || target.username
  };
  const result = engine.transferFunds(senderActor, recipientActor, amount);
  store.save(engine.state);
  decorateResultForDiscord(result, interaction);
  await replyDiscord(interaction, result, { ephemeral: true });
  if (result.ok) {
    await sendLog({
      ok: true,
      title: "送金",
      lines: [
        `${result.sender.name} → ${result.recipient.name}`,
        `金額: ${fmt(amount)}`
      ]
    });
  }
}

async function postRankPanelFromButton(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  if (!interaction.channel?.isTextBased?.()) {
    await interaction.reply({ content: "テキストチャンネルで使ってください。", ephemeral: true });
    return;
  }
  await postRankPanel(interaction.channel);
  await interaction.reply({
    content: `${interaction.channel} にランク確認パネルを設置しました。ここに発言があるたび自動でパネルが下へ戻ります。`,
    ephemeral: true
  });
}

async function setRankNotifyChannel(interaction, channel) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  if (!channel?.isTextBased?.()) {
    await interaction.reply({ content: "テキストチャンネルで使ってください。", ephemeral: true });
    return;
  }
  panelState.rankNotifyChannelId = channel.id;
  panelStore.save(panelState);
  await interaction.reply({
    content: `発言/通話ランクの昇格通知先を ${channel} に設定しました。以降、この鯖の昇格通知はここに投稿されます。`,
    ephemeral: true
  });
}

async function clearRankNotifyChannel(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  panelState.rankNotifyChannelId = null;
  panelStore.save(panelState);
  const fallback = rankChannelId
    ? `<#${rankChannelId}>`
    : "（未設定なので通知はスキップされます）";
  await interaction.reply({
    content: `昇格通知先のカスタム設定を解除しました。以後は環境変数の設定先を使います: ${fallback}`,
    ephemeral: true
  });
}

async function handleVcXpLocationChannelSelect(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }

  const selectedId = interaction.values?.[0];
  const action = interaction.customId.split(":")[2];
  const selected = selectedId && interaction.guild
    ? await interaction.guild.channels.fetch(selectedId).catch(() => null)
    : null;
  if (!selected || selected.guildId !== interaction.guildId) {
    await interaction.reply({ content: "このサーバー内のチャンネルを選んでください。", ephemeral: true });
    return;
  }

  if (action === "category-add") {
    if (selected.type !== ChannelType.GuildCategory) {
      await interaction.reply({ content: "カテゴリだけを選んでください。", ephemeral: true });
      return;
    }
    engine.addVcFullXpTarget?.("category", selected.id);
  } else if (action === "channel-add") {
    if (selected.type !== ChannelType.GuildVoice) {
      await interaction.reply({ content: "VCチャンネルだけを選んでください。", ephemeral: true });
      return;
    }
    engine.addVcFullXpTarget?.("channel", selected.id);
  } else {
    await interaction.reply({ content: "不明なVC XP設定操作です。", ephemeral: true });
    return;
  }

  const actor = actorFromInteraction(interaction);
  const result = engine.run("rankxp vc-location", actor);
  decorateResultForDiscord(result, interaction);
  store.save(engine.state);
  await updateDiscord(interaction, result);
}

async function confirmRankReset(interaction, axis) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }

  const normalized = ["tc", "vc", "both"].includes(axis) ? axis : "both";
  const label = normalized === "tc" ? "TC" : normalized === "vc" ? "VC" : "TC/VC";

  const embed = new EmbedBuilder()
    .setTitle(`${label}一括リセット - 確認`)
    .setColor(0xef4444)
    .setDescription("この操作は全住民のランク経験値をリセットします。取り消す場合は、実行せずに閉じてください。")
    .addFields(
      { name: "対象", value: label, inline: true },
      { name: "影響", value: normalized === "tc" ? "発言XP・発言数" : normalized === "vc" ? "VC XP・VC分数・VC日次値" : "発言XP・発言数・VC XP・VC分数・VC日次値", inline: false }
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`eco:admin:rank-reset-execute:${normalized}`)
      .setLabel(`${label}リセット実行`)
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("eco:admin:rank-reset-cancel")
      .setLabel("キャンセル")
      .setStyle(ButtonStyle.Secondary)
  );

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}

async function executeRankReset(interaction, axis) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }

  const actor = actorFromInteraction(interaction);
  const adminUser = engine.getUser(actor.id, actor.name);
  const result = engine.resetActivityRanks(adminUser, axis);

  store.save(engine.state);
  decorateResultForDiscord(result, interaction);
  await replyDiscord(interaction, result, { ephemeral: true });

  if (result.ok) {
    await sendLog({
      ok: true,
      title: result.title,
      lines: [
        `実行者: ${actor.name}`,
        ...result.lines
      ]
    });
  }
}

async function showBalanceUserPicker(interaction, mode) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  if (!["set", "add", "sub"].includes(mode)) {
    await interaction.reply({ content: "モード不明。", ephemeral: true });
    return;
  }
  const label = mode === "set" ? "セット" : mode === "add" ? "加算" : "減算";
  const menu = new UserSelectMenuBuilder()
    .setCustomId(`eco:user:balance:${mode}`)
    .setPlaceholder(`残高を${label}する対象ユーザーを選ぶ`)
    .setMinValues(1)
    .setMaxValues(1);
  const row = new ActionRowBuilder().addComponents(menu);
  const embed = new EmbedBuilder()
    .setTitle(`残高操作 - ${label}`)
    .setColor(mode === "sub" ? 0xef4444 : mode === "add" ? 0x22c55e : 0x2563eb)
    .setDescription(`対象ユーザーを選ぶと、次に額の入力モーダルが開きます。${mode === "set" ? "「セット」は 0 も指定できます。" : ""}中央台帳との入出金として記録されます。`);
  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}

async function showBalanceAmountModal(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  const mode = interaction.customId.split(":")[3];
  const targetId = interaction.values?.[0];
  if (!targetId) {
    await interaction.reply({ content: "対象が選ばれていません。", ephemeral: true });
    return;
  }
  const label = mode === "set" ? "セット" : mode === "add" ? "加算" : "減算";
  const modal = new ModalBuilder()
    .setCustomId(`eco:modal:balance:${mode}:${targetId}`)
    .setTitle(`残高${label}`);
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("amount")
        .setLabel(mode === "set" ? "セットする額（Ris、0以上）" : `${label}する額（Ris、1以上）`)
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(12)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("note")
        .setLabel("メモ（ログに残ります・任意）")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(80)
    )
  );
  await interaction.showModal(modal);
}

async function handleBalanceModal(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  const parts = interaction.customId.split(":");
  const mode = parts[3];
  const targetDiscordId = parts[4];
  const amountRaw = interaction.fields.getTextInputValue("amount");
  const note = interaction.fields.getTextInputValue("note") || "";
  const targetUser = await client.users.fetch(targetDiscordId).catch(() => null);
  const guildMember = interaction.guild
    ? await interaction.guild.members.fetch(targetDiscordId).catch(() => null)
    : null;
  const guildPart = interaction.guildId || "dm";
  const targetActor = {
    id: `${guildPart}:${targetDiscordId}`,
    name: guildMember?.displayName || targetUser?.globalName || targetUser?.username || "名無し"
  };
  const adminActor = actorFromInteraction(interaction);
  const adminUser = engine.getUser(adminActor.id, adminActor.name);

  let result;
  if (mode === "set") result = engine.setWallet(adminUser, targetActor, amountRaw, note);
  else if (mode === "add") result = engine.addWallet(adminUser, targetActor, amountRaw, note);
  else if (mode === "sub") result = engine.subtractWallet(adminUser, targetActor, amountRaw, note);
  else result = { ok: false, title: "不明モード", lines: [`モード ${mode} は未知です。`] };

  store.save(engine.state);
  decorateResultForDiscord(result, interaction);
  await replyDiscord(interaction, result, { ephemeral: true });
  if (result.ok) {
    await sendLog({
      ok: true,
      title: `残高操作: ${mode === "set" ? "セット" : mode === "add" ? "加算" : "減算"}`,
      lines: [
        `実行者: ${adminActor.name}`,
        `対象: ${targetActor.name}`,
        `${fmt(result.before)} → ${fmt(result.after)}（差分 ${result.delta >= 0 ? "+" : ""}${fmt(result.delta)}）`,
        note ? `メモ: ${note}` : null
      ].filter(Boolean)
    });
  }
}

async function showBalanceRolePicker(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  if (!interaction.guild) {
    await interaction.reply({ content: "サーバー内で使ってください。", ephemeral: true });
    return;
  }
  const menu = new RoleSelectMenuBuilder()
    .setCustomId("eco:role:balance-set")
    .setPlaceholder("対象ロールを選ぶ（最大10）")
    .setMinValues(1)
    .setMaxValues(10);
  const row = new ActionRowBuilder().addComponents(menu);
  const embed = new EmbedBuilder()
    .setTitle("ロール一括セット")
    .setColor(0x2563eb)
    .setDescription("選んだロール保持者全員の残高を、指定した額に**揃えます**。差分は中央台帳との入出金として記録されます。（給与配布との違い: 給与配布は一律加算、こちらは一律セット）");
  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}

async function handleBalanceRoleSelect(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  if (!interaction.guild) {
    await interaction.reply({ content: "サーバー内で使ってください。", ephemeral: true });
    return;
  }
  const roleIds = interaction.values || [];
  if (roleIds.length === 0) {
    await interaction.reply({ content: "ロールが選ばれていません。", ephemeral: true });
    return;
  }
  const sessionId = createSalarySession(interaction.user.id, roleIds);
  const modal = new ModalBuilder()
    .setCustomId(`eco:modal:balance-role-set:${sessionId}`)
    .setTitle("ロール一括セット - 額の入力");
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("amount")
        .setLabel("セットする額（Ris、0以上）")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(12)
        .setPlaceholder("例: 100000")
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("note")
        .setLabel("メモ（ログに残ります・任意）")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(80)
    )
  );
  await interaction.showModal(modal);
}

async function handleBalanceRoleAmountModal(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  if (!interaction.guild) {
    await interaction.reply({ content: "サーバー内で使ってください。", ephemeral: true });
    return;
  }
  const sessionId = interaction.customId.split(":")[3];
  const session = getSalarySession(sessionId, interaction.user.id);
  if (!session) {
    await interaction.reply({ content: "セッションが見つからないか期限切れです。もう一度やり直してください。", ephemeral: true });
    return;
  }
  const amountRaw = interaction.fields.getTextInputValue("amount");
  const amount = Number.parseInt(String(amountRaw || "").replace(/[^\d]/g, ""), 10);
  if (!Number.isFinite(amount) || amount < 0) {
    await interaction.reply({ content: "セット額は0以上の整数で入力してください。", ephemeral: true });
    return;
  }
  const note = String(interaction.fields.getTextInputValue("note") || "").trim();
  const targets = await collectSalaryTargets(interaction.guild, session.roleIds);
  const roleNames = await Promise.all(
    session.roleIds.map(async (id) => {
      const role = await interaction.guild.roles.fetch(id).catch(() => null);
      return role?.name || `ロールID:${id}`;
    })
  );

  session.mode = "balance-set";
  session.amount = amount;
  session.note = note;
  session.roleNames = roleNames;
  session.targets = targets;

  if (targets.length === 0) {
    salarySessions.delete(sessionId);
    await interaction.reply({ content: "対象ロール保持者が0人でした。", ephemeral: true });
    return;
  }

  // 差分プレビュー
  let issue = 0;
  let reclaim = 0;
  for (const t of targets) {
    const u = engine.state.users?.[t.id];
    const current = u?.wallet || 0;
    const delta = amount - current;
    if (delta > 0) issue += delta;
    else if (delta < 0) reclaim += -delta;
  }

  const embed = new EmbedBuilder()
    .setTitle("ロール一括セット - 確認")
    .setColor(0xf59e0b)
    .setDescription("この内容で全員の残高を揃えます。実行前に確認してください。")
    .addFields(
      { name: "対象ロール", value: roleNames.map((n) => `・${n}`).join("\n") || "-", inline: false },
      { name: "対象人数", value: `${targets.length}人（Bot除外）`, inline: true },
      { name: "1人あたり", value: `${amount.toLocaleString("ja-JP")} Ris`, inline: true },
      { name: "純増減見込み", value: `${(issue - reclaim).toLocaleString("ja-JP")} Ris`, inline: true },
      { name: "発行見込み", value: `${issue.toLocaleString("ja-JP")} Ris`, inline: true },
      { name: "回収見込み", value: `${reclaim.toLocaleString("ja-JP")} Ris`, inline: true },
      { name: "メモ", value: note || "（なし）", inline: false }
    );
  const buttonsRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`eco:admin:balance-role-execute:${sessionId}`).setLabel("セット実行").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`eco:admin:balance-role-cancel:${sessionId}`).setLabel("キャンセル").setStyle(ButtonStyle.Secondary)
  );
  await interaction.reply({ embeds: [embed], components: [buttonsRow], ephemeral: true });
}

async function executeBalanceRoleSet(interaction, sessionId) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  const session = getSalarySession(sessionId, interaction.user.id);
  if (!session || session.mode !== "balance-set" || !session.targets) {
    await interaction.reply({ content: "セッションが見つからないか期限切れです。もう一度やり直してください。", ephemeral: true });
    return;
  }
  const adminActor = actorFromInteraction(interaction);
  const adminUser = engine.getUser(adminActor.id, adminActor.name);
  const roleLabel = session.roleNames?.join(", ") || "選択したロール";
  const noteSuffix = session.note ? ` / ${session.note}` : "";
  const result = engine.setWalletByRoleMembers(adminUser, {
    entries: session.targets,
    amount: session.amount,
    roleLabel: `${roleLabel}${noteSuffix}`
  });
  salarySessions.delete(sessionId);
  store.save(engine.state);
  decorateResultForDiscord(result, interaction);
  await replyDiscord(interaction, result, { ephemeral: true });
  if (result.ok) {
    await sendLog({
      ok: true,
      title: "ロール一括セットログ",
      lines: [
        `実行者: ${adminActor.name}`,
        `対象ロール: ${roleLabel}`,
        `${result.applied?.length ?? 0}人 → ${result.amount?.toLocaleString("ja-JP") ?? "?"} Ris`,
        `発行: ${result.totalIssued?.toLocaleString("ja-JP")} / 回収: ${result.totalReclaimed?.toLocaleString("ja-JP")}`,
        session.note ? `メモ: ${session.note}` : null
      ].filter(Boolean)
    });
  }
}

async function cancelBalanceRoleSession(interaction, sessionId) {
  salarySessions.delete(sessionId);
  await interaction.reply({ content: "ロール一括セットをキャンセルしました。", ephemeral: true });
}

async function showShopSearchModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId("eco:modal:shop-search")
    .setTitle("民営ショップを絞り込む");
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("keyword")
        .setLabel("キーワード（商品名/説明に含まれる文字、任意）")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(48)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("type")
        .setLabel("種類（アイテム/チケット/権利/サービス/称号/ロール/セット、任意）")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(20)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("minPrice")
        .setLabel("最低価格（Ris、任意）")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(12)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("maxPrice")
        .setLabel("最高価格（Ris、任意）")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(12)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("sort")
        .setLabel("並び順: 新着順 / 安い順 / 高い順 / 古い順（任意）")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(10)
        .setPlaceholder("空欄=新着順")
    )
  );
  await interaction.showModal(modal);
}

async function handleShopSearchModal(interaction) {
  const actor = actorFromInteraction(interaction);
  const user = engine.getUser(actor.id, actor.name);
  const sortMap = { "新着順": "newest", "安い順": "price_asc", "高い順": "price_desc", "古い順": "oldest" };
  const sortInput = String(interaction.fields.getTextInputValue("sort") || "").trim();
  const filters = {
    keyword: interaction.fields.getTextInputValue("keyword") || "",
    type: interaction.fields.getTextInputValue("type") || "",
    minPrice: interaction.fields.getTextInputValue("minPrice") || "",
    maxPrice: interaction.fields.getTextInputValue("maxPrice") || "",
    sort: sortMap[sortInput] || sortInput || "newest"
  };
  const panel = engine.searchResultsPanel(user, filters);
  const result = { ok: true, title: panel.title, lines: [panel.description], panel };
  decorateResultForDiscord(result, interaction);
  await replyDiscord(interaction, result, { ephemeral: true });
}

async function showShopEditModal(interaction, listingId) {
  const actor = actorFromInteraction(interaction);
  const user = engine.getUser(actor.id, actor.name);
  const listing = engine.state.marketplace.listings.find((l) => String(l.id) === String(listingId));
  if (!listing || listing.sellerId !== user.id) {
    await interaction.reply({ content: "この商品を編集する権限がありません。", ephemeral: true });
    return;
  }
  const modal = new ModalBuilder()
    .setCustomId(`eco:modal:shop-edit:${listing.id}`)
    .setTitle(`編集 #${listing.id}`);
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("name")
        .setLabel("商品名（空欄で変更なし）")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(48)
        .setValue(listing.name || "")
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("price")
        .setLabel("価格（Ris、空欄で変更なし）")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(12)
        .setValue(String(listing.price || ""))
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("stock")
        .setLabel("在庫（1〜99、空欄で変更なし）")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(3)
        .setValue(String(listing.stock || ""))
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("description")
        .setLabel("説明（空欄で変更なし）")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setMaxLength(240)
        .setValue(listing.description || "")
    )
  );
  await interaction.showModal(modal);
}

async function handleShopEditModal(interaction) {
  const listingId = interaction.customId.split(":")[3];
  const actor = actorFromInteraction(interaction);
  const user = engine.getUser(actor.id, actor.name);
  const result = engine.editListing(user, listingId, {
    name: interaction.fields.getTextInputValue("name") || null,
    price: interaction.fields.getTextInputValue("price") || null,
    stock: interaction.fields.getTextInputValue("stock") || null,
    description: interaction.fields.getTextInputValue("description") || null
  });
  decorateResultForDiscord(result, interaction);
  store.save(engine.state);
  await replyDiscord(interaction, result, { ephemeral: true });
}

async function handleNotifyToggle(interaction) {
  const actor = actorFromInteraction(interaction);
  const user = engine.getUser(actor.id, actor.name);
  const target = !Boolean(user.notifyEnabled);
  const result = engine.setNotifyEnabled(user, target);
  decorateResultForDiscord(result, interaction);
  store.save(engine.state);
  await replyDiscord(interaction, result, { ephemeral: true });
}

async function showShopResubmitModal(interaction, listingId) {
  const actor = actorFromInteraction(interaction);
  const user = engine.getUser(actor.id, actor.name);
  const listing = engine.state.marketplace.listings.find((l) => String(l.id) === String(listingId));
  if (!listing || listing.sellerId !== user.id || listing.status !== "rejected") {
    await interaction.reply({ content: "この商品を再提出できません。", ephemeral: true });
    return;
  }
  const modal = new ModalBuilder()
    .setCustomId(`eco:modal:shop-resubmit:${listing.id}`)
    .setTitle(`再提出 #${listing.id}`);
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("name")
        .setLabel("商品名（空欄で元のまま）")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(48)
        .setValue(listing.name || "")
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("price")
        .setLabel("価格（Ris、空欄で元のまま）")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(12)
        .setValue(String(listing.price || ""))
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("stock")
        .setLabel("在庫（1〜99、空欄で元のまま）")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(3)
        .setValue(String(listing.stock || ""))
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("description")
        .setLabel("説明（空欄で元のまま）")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setMaxLength(240)
        .setValue(listing.description || "")
    )
  );
  await interaction.showModal(modal);
}

async function handleShopResubmitModal(interaction) {
  const listingId = interaction.customId.split(":")[3];
  const actor = actorFromInteraction(interaction);
  const user = engine.getUser(actor.id, actor.name);
  const result = engine.resubmitListing(user, listingId, {
    name: interaction.fields.getTextInputValue("name") || null,
    price: interaction.fields.getTextInputValue("price") || null,
    stock: interaction.fields.getTextInputValue("stock") || null,
    description: interaction.fields.getTextInputValue("description") || null
  });
  decorateResultForDiscord(result, interaction);
  store.save(engine.state);
  await replyDiscord(interaction, result, { ephemeral: true });
}

async function showMarketSettingsModal(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  const settings = engine.state.marketplace.settings;
  const modal = new ModalBuilder()
    .setCustomId("eco:modal:market-settings")
    .setTitle("ショップ設定を編集");
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("feeBps")
        .setLabel("手数料（bps、100=1.0%）")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(5)
        .setValue(String(settings.feeBps))
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("reviewPrice")
        .setLabel("高額審査境界（Ris）")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(12)
        .setValue(String(settings.reviewPrice))
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("maxActiveListings")
        .setLabel("1人あたり出品上限（1〜99）")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(3)
        .setValue(String(settings.maxActiveListings))
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("auctionExtendMinutes")
        .setLabel("オークション延長分数（1〜60）")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(3)
        .setValue(String(settings.auctionExtendMinutes))
    )
  );
  await interaction.showModal(modal);
}

async function handleMarketSettingsModal(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  const actor = actorFromInteraction(interaction);
  const admin = engine.getUser(actor.id, actor.name);
  const result = engine.updateMarketSettings(admin, {
    feeBps: interaction.fields.getTextInputValue("feeBps") || "",
    reviewPrice: interaction.fields.getTextInputValue("reviewPrice") || "",
    maxActiveListings: interaction.fields.getTextInputValue("maxActiveListings") || "",
    auctionExtendMinutes: interaction.fields.getTextInputValue("auctionExtendMinutes") || ""
  });
  decorateResultForDiscord(result, interaction);
  store.save(engine.state);
  await replyDiscord(interaction, result, { ephemeral: true });
}

async function handleShopStatusToggle(interaction) {
  const actor = actorFromInteraction(interaction);
  const user = engine.getUser(actor.id, actor.name);
  const current = user.marketplace?.shopStatus || "open";
  const target = current === "open" ? "closed" : "open";
  const result = engine.setShopStatus(user, target);
  decorateResultForDiscord(result, interaction);
  store.save(engine.state);
  await replyDiscord(interaction, result, { ephemeral: true });
}

async function handleShopSalesDmToggle(interaction) {
  const actor = actorFromInteraction(interaction);
  const user = engine.getUser(actor.id, actor.name);
  const result = engine.setSalesDmEnabled(user);
  decorateResultForDiscord(result, interaction);
  store.save(engine.state);
  await replyDiscord(interaction, result, { ephemeral: true });
}

async function handleBoostRewardRoleSelect(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  const key = interaction.customId.split(":")[3];
  const roleId = interaction.values?.[0] || null;
  if (!roleId || !interaction.guild?.roles?.cache?.has(roleId)) {
    await interaction.reply({ content: "このサーバー内のロールを選んでください。", ephemeral: true });
    return;
  }
  const actor = actorFromInteraction(interaction);
  const result = engine.adminSetBoostRewardRole(engine.getUser(actor.id, actor.name), key, roleId);
  decorateResultForDiscord(result, interaction);
  store.save(engine.state);
  await updateDiscord(interaction, result);
}

async function handleBoostRewardButton(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  if (interaction.customId === "eco:boost:run-monthly") {
    await interaction.deferUpdate();
    const result = await reconcileTrackedBoostRewards("manual");
    const actor = actorFromInteraction(interaction);
    const panelResult = engine.panelResult(engine.boostRewardAdminPanel(engine.getUser(actor.id, actor.name)));
    panelResult.title = "ブースト報酬を再確認しました";
    panelResult.lines.unshift(`付与 ${result.paid}件 / スキップ ${result.skipped}件 / エラー ${result.failed}件`);
    decorateResultForDiscord(panelResult, interaction);
    await interaction.editReply({ embeds: [buildEmbed(panelResult)], components: buildComponents(panelResult, { fallback: true }) });
  }
}

async function handleReviewButton(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  const parts = interaction.customId.split(":");
  const action = parts[2];
  const listingId = parts[3];
  if (action === "approve") {
    const actor = actorFromInteraction(interaction);
    const result = engine.approveListing(engine.getUser(actor.id, actor.name), listingId);
    decorateResultForDiscord(result, interaction);
    store.save(engine.state);
    await updateDiscord(interaction, result);
    return;
  }
  if (action === "reject") {
    const modal = new ModalBuilder()
      .setCustomId(`eco:modal:review-reject:${listingId}`)
      .setTitle(`却下 #${listingId}`);
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("reason")
          .setLabel("却下理由（販売者に伝わります・任意）")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false)
          .setMaxLength(200)
          .setPlaceholder("例: 価格が相場から外れています / 商品説明が不十分など")
      )
    );
    await interaction.showModal(modal);
  }
}

async function handleOrderAdminButton(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  const parts = interaction.customId.split(":");
  const action = parts[2];
  const orderId = parts[3];
  const actor = actorFromInteraction(interaction);
  const adminUser = engine.getUser(actor.id, actor.name);

  let result;
  if (action === "complete") {
    result = engine.adminCompleteOrder(adminUser, orderId);
  } else if (action === "refund") {
    result = engine.adminRefundOrder(adminUser, orderId);
  } else {
    result = { ok: false, title: "不明な操作", lines: [`未知の取引アクション: ${action}`] };
  }
  decorateResultForDiscord(result, interaction);
  store.save(engine.state);
  await updateDiscord(interaction, result);
}

async function handleReviewRejectModal(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  const listingId = interaction.customId.split(":")[3];
  const reason = interaction.fields.getTextInputValue("reason") || "";
  const actor = actorFromInteraction(interaction);
  const result = engine.rejectListing(engine.getUser(actor.id, actor.name), listingId, reason);
  decorateResultForDiscord(result, interaction);
  store.save(engine.state);
  await replyDiscord(interaction, result, { ephemeral: true });
}

async function showSalaryRolePicker(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  if (!interaction.guild) {
    await interaction.reply({ content: "サーバー内で使ってください。", ephemeral: true });
    return;
  }
  const menu = new RoleSelectMenuBuilder()
    .setCustomId("eco:role:salary")
    .setPlaceholder("配布先ロールを選ぶ（最大10）")
    .setMinValues(1)
    .setMaxValues(10);
  const row = new ActionRowBuilder().addComponents(menu);
  const embed = new EmbedBuilder()
    .setTitle("給与配布 - ロール選択")
    .setDescription("配布したいロールを選んでください。複数選択できます。選択後、1人あたりの額を入力するモーダルが開きます。")
    .setColor(0x22c55e)
    .addFields(
      { name: "原資", value: "中央台帳から発行します。管理者の財布は減りません。", inline: false },
      { name: "重複", value: "複数ロールで重なる人は1回だけ受け取ります。Bot は除外されます。", inline: false }
    );
  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}

async function handleSalaryRoleSelect(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  if (!interaction.guild) {
    await interaction.reply({ content: "サーバー内で使ってください。", ephemeral: true });
    return;
  }
  const roleIds = interaction.values || [];
  if (roleIds.length === 0) {
    await interaction.reply({ content: "ロールが選ばれていません。", ephemeral: true });
    return;
  }
  const sessionId = createSalarySession(interaction.user.id, roleIds);
  const modal = new ModalBuilder()
    .setCustomId(`eco:modal:salary:${sessionId}`)
    .setTitle("給与配布 - 額の入力");
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("perUser")
        .setLabel("1人あたりの額（Ris）")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(12)
        .setPlaceholder("例: 1000")
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("note")
        .setLabel("配布メモ（ログに残ります・任意）")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(80)
        .setPlaceholder("例: 週次給与 / 12月分など")
    )
  );
  await interaction.showModal(modal);
}

async function handleSalaryAmountModal(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  if (!interaction.guild) {
    await interaction.reply({ content: "サーバー内で使ってください。", ephemeral: true });
    return;
  }
  const sessionId = interaction.customId.split(":")[3];
  const session = getSalarySession(sessionId, interaction.user.id);
  if (!session) {
    await interaction.reply({ content: "セッションが見つからないか期限切れです。もう一度やり直してください。", ephemeral: true });
    return;
  }

  const perUserRaw = interaction.fields.getTextInputValue("perUser");
  const perUser = Number.parseInt(String(perUserRaw || "").replace(/[^\d-]/g, ""), 10);
  if (!Number.isFinite(perUser) || perUser <= 0) {
    await interaction.reply({ content: "1人あたりの額は1以上の整数で入力してください。", ephemeral: true });
    return;
  }
  const note = String(interaction.fields.getTextInputValue("note") || "").trim();

  const targets = await collectSalaryTargets(interaction.guild, session.roleIds);
  const roleNames = await Promise.all(
    session.roleIds.map(async (id) => {
      const role = await interaction.guild.roles.fetch(id).catch(() => null);
      return role?.name || `ロールID:${id}`;
    })
  );

  session.perUser = perUser;
  session.note = note;
  session.roleNames = roleNames;
  session.targets = targets;

  const total = perUser * targets.length;
  const embed = new EmbedBuilder()
    .setTitle("給与配布 - 確認")
    .setColor(0xf59e0b)
    .setDescription("この内容で配布します。よろしければ配布実行、やめる場合はキャンセルを押してください。")
    .addFields(
      { name: "対象ロール", value: roleNames.map((name) => `・${name}`).join("\n") || "-", inline: false },
      { name: "対象人数", value: `${targets.length}人（Bot と重複を除外）`, inline: true },
      { name: "1人あたり", value: `${perUser.toLocaleString("ja-JP")} Ris`, inline: true },
      { name: "合計", value: `${total.toLocaleString("ja-JP")} Ris`, inline: true },
      { name: "メモ", value: note || "（なし）", inline: false }
    );

  if (targets.length === 0) {
    await interaction.reply({
      content: "対象ロール保持者が0人でした。ロールを見直してください。",
      embeds: [embed],
      ephemeral: true
    });
    salarySessions.delete(sessionId);
    return;
  }

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`eco:admin:salary-execute:${sessionId}`).setLabel("配布実行").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`eco:admin:salary-cancel:${sessionId}`).setLabel("キャンセル").setStyle(ButtonStyle.Secondary)
  );
  await interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true });
}

async function executeSalaryDistribution(interaction, sessionId) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: "そこは運営用です。", ephemeral: true });
    return;
  }
  const session = getSalarySession(sessionId, interaction.user.id);
  if (!session || !session.targets || !session.perUser) {
    await interaction.reply({ content: "セッションが見つからないか期限切れです。もう一度やり直してください。", ephemeral: true });
    return;
  }

  const adminActor = actorFromInteraction(interaction);
  const adminUser = engine.getUser(adminActor.id, adminActor.name);
  const roleLabel = session.roleNames?.join(", ") || "選択したロール";
  const noteSuffix = session.note ? ` / ${session.note}` : "";
  const result = engine.distributeSalary(adminUser, {
    entries: session.targets,
    perUser: session.perUser,
    roleLabel: `${roleLabel}${noteSuffix}`
  });
  salarySessions.delete(sessionId);
  decorateResultForDiscord(result, interaction);
  store.save(engine.state);

  await replyDiscord(interaction, result, { ephemeral: true });

  if (result.ok) {
    await sendLog({
      ok: true,
      title: "給与配布ログ",
      lines: [
        `実行者: ${adminActor.name}`,
        `対象ロール: ${roleLabel}`,
        `${result.paid?.length ?? 0}人 × ${result.amount?.toLocaleString("ja-JP") ?? "?"} Ris = 合計 ${result.total?.toLocaleString("ja-JP") ?? "?"} Ris`,
        session.note ? `メモ: ${session.note}` : null
      ].filter(Boolean)
    });
  }
}

async function cancelSalarySession(interaction, sessionId) {
  salarySessions.delete(sessionId);
  await interaction.reply({ content: "給与配布をキャンセルしました。", ephemeral: true });
}

function createSalarySession(userId, roleIds) {
  cleanupSalarySessions();
  const sessionId = Math.random().toString(36).slice(2, 10);
  salarySessions.set(sessionId, {
    userId,
    roleIds: roleIds.slice(),
    createdAt: Date.now()
  });
  return sessionId;
}

function getSalarySession(sessionId, userId) {
  cleanupSalarySessions();
  const session = salarySessions.get(sessionId);
  if (!session) return null;
  if (session.userId !== userId) return null;
  return session;
}

function cleanupSalarySessions() {
  const now = Date.now();
  for (const [key, session] of salarySessions) {
    if (now - session.createdAt > SALARY_SESSION_TTL_MS) salarySessions.delete(key);
  }
}

async function collectSalaryTargets(guild, roleIds) {
  // Salary runs from the member cache. Fetching every guild member here can
  // rate-limit unrelated interaction handling on larger servers.
  syncGuildMemberDirectory(guild);
  const seen = new Map();
  for (const roleId of roleIds) {
    const role = await guild.roles.fetch(roleId).catch(() => null);
    if (!role) continue;
    for (const member of role.members.values()) {
      if (member.user.bot) continue;
      if (seen.has(member.id)) continue;
      const actor = actorFromMember(member);
      seen.set(member.id, { id: actor.id, name: actor.name });
    }
  }
  return Array.from(seen.values());
}

function auctionTypeFromInput(value) {
  const normalized = String(value || "").trim();
  const map = {
    "ロール": "role",
    "称号": "title",
    "アイテム": "item",
    "チケット": "ticket",
    "権利": "right",
    "サービス": "service",
    "セット": "bundle",
    "セット商品": "bundle",
    "role": "role",
    "title": "title",
    "item": "item",
    "ticket": "ticket",
    "right": "right",
    "service": "service",
    "bundle": "bundle"
  };
  return map[normalized] || "title";
}

async function ensureRankPanel() {
  const channelId = panelState.rankPanel?.channelId;
  if (!channelId) return;
  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (channel?.isTextBased?.()) await postRankPanel(channel);
}

function scheduleRankPanelRefresh(channel) {
  if (!channel?.id) return;
  const oldTimer = rankPanelRefreshTimers.get(channel.id);
  if (oldTimer) clearTimeout(oldTimer);
  const timer = setTimeout(async () => {
    rankPanelRefreshTimers.delete(channel.id);
    await postRankPanel(channel).catch((error) => console.warn(`ランク確認パネル更新に失敗しました: ${error.message}`));
  }, 1500);
  timer.unref?.();
  rankPanelRefreshTimers.set(channel.id, timer);
}

async function postRankPanel(channel) {
  const oldId = panelState.rankPanel?.messageId;
  if (oldId && panelState.rankPanel?.channelId === channel.id) {
    const oldMessage = await channel.messages.fetch(oldId).catch(() => null);
    if (oldMessage) await oldMessage.delete().catch(() => null);
  }
  const message = await channel.send(buildRankPanelPayload());
  panelState.rankPanel = { channelId: channel.id, messageId: message.id };
  panelStore.save(panelState);
  return message;
}

function buildRankPanelPayload() {
  const embed = new EmbedBuilder()
    .setTitle("ランク確認")
    .setDescription("発言・通話・招待・Bump のランクとサーバー内順位を確認できます。")
    .setColor(0x7c3aed)
    .addFields(
      { name: "発言ランク", value: "発言量に応じて経験値・レベル・ランクが上がります。", inline: true },
      { name: "通話ランク", value: "VC滞在時間で経験値が増え、分給も上がります。", inline: true },
      { name: "招待・Bump階級", value: "招待成立数と DISBOARD の Bump 回数で階級が上がり、1回あたりの報酬が増えます。", inline: false },
      { name: "使い方", value: "「自分のランク」で自身のカード、各ランキングボタンでトップ10を確認できます。", inline: false }
    );
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("eco:rank:me").setLabel("自分のランク").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("eco:rank:tc").setLabel("発言ランキング").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("eco:rank:vc").setLabel("通話ランキング").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("eco:rank:invite").setLabel("招待ランキング").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("eco:rank:bump").setLabel("Bumpランキング").setStyle(ButtonStyle.Success)
  );
  return { embeds: [embed], components: [row] };
}

function decorateResultForDiscord(result, context) {
  if (!result?.card) return result;
  const user = context.user || context.author;
  const guild = context.guild;
  result.card.discord = {
    serverName: guild?.name || null,
    serverIconUrl: guild?.iconURL?.({ size: 128 }) || null,
    userIconUrl: user?.displayAvatarURL?.({ size: 128 }) || null
  };
  return result;
}

async function buildProfileCardAttachment(result) {
  if (!result?.card?.profile || !canvasTools) return null;
  try {
    const buffer = await renderProfileCardPng(result.card.profile, result.card.discord || {});
    const name = "iris-profile-card.png";
    return { name, attachment: new AttachmentBuilder(buffer, { name }) };
  } catch (error) {
    console.warn(`プロフィールカード画像生成に失敗しました: ${error.message}`);
    return null;
  }
}

async function buildRankUpCardAttachment(result, context, discordUserId) {
  if (!canvasTools) return null;
  try {
    const user = context?.user || context?.author || context?.member?.user || null;
    const member = context?.member || null;
    const guild = context?.guild || member?.guild || null;
    const buffer = await renderRankUpCardPng({
      title: result.title || "ランク昇格",
      lines: Array.isArray(result.lines) ? result.lines : [],
      displayName: member?.displayName || user?.globalName || user?.username || "名無し",
      serverName: guild?.name || "IRIS",
      serverIconUrl: guild?.iconURL?.({ size: 128 }) || null,
      userIconUrl: user?.displayAvatarURL?.({ size: 128 }) || null,
      discordUserId
    });
    const name = "iris-rank-up.png";
    return { name, attachment: new AttachmentBuilder(buffer, { name }) };
  } catch (error) {
    console.warn(`ランク昇格カード生成に失敗しました: ${error.message}`);
    return null;
  }
}

async function renderProfileCardPng(profile, discordMeta) {
  const { createCanvas, loadImage } = canvasTools;
  const width = 980;
  const height = 460;
  const outputWidth = 900;
  const outputHeight = Math.round((height / width) * outputWidth);
  const canvas = createCanvas(outputWidth, outputHeight);
  const ctx = canvas.getContext("2d");
  ctx.scale(outputWidth / width, outputHeight / height);
  const gold = profile.premiumFrame ? "#d7a844" : "#9b742a";
  const purple = "#130a26";

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#21113b");
  gradient.addColorStop(0.35, purple);
  gradient.addColorStop(1, "#090615");
  ctx.fillStyle = gradient;
  roundRect(ctx, 0, 0, width, height, 22);
  ctx.fill();

  ctx.fillStyle = "#0d0719";
  roundRect(ctx, 12, 12, width - 24, height - 24, 22);
  ctx.fill();

  ctx.strokeStyle = "rgba(155,116,42,0.84)";
  ctx.lineWidth = 2;
  roundRect(ctx, 20, 20, width - 40, height - 40, 18);
  ctx.stroke();
  ctx.strokeStyle = "rgba(216,194,147,0.16)";
  ctx.lineWidth = 1;
  roundRect(ctx, 31, 31, width - 62, height - 62, 15);
  ctx.stroke();

  ctx.globalAlpha = 0.26;
  ctx.fillStyle = "#2a1647";
  roundRect(ctx, 48, 230, width - 96, 94, 10);
  ctx.fill();
  ctx.globalAlpha = 1;

  const avatar = await loadRemoteImage(discordMeta.userIconUrl, loadImage);
  drawAvatar(ctx, avatar, 66, 56, 142, gold, initials(profile.name));

  ctx.fillStyle = "#f5ead4";
  ctx.font = font("900", 46);
  ctx.fillText(trimText(ctx, profile.name, 430), 250, 102);

  const badgeText = profile.styleName || "記録者";
  darkPill(ctx, 250, 126, badgeText, "#332845", "#a99bbd");

  ctx.fillStyle = "#847895";
  ctx.font = font("700", 22);
  ctx.fillText(trimText(ctx, `${discordMeta.serverName || "アイリス"} 魂の記録カード`, 520), 250, 190);

  const statY = 226;
  const statW = 205;
  const gap = 18;
  drawStatBox(ctx, 66, statY, statW, "所持", fmt(profile.wallet), "");
  drawStatBox(ctx, 66 + (statW + gap), statY, statW, "純資産", fmt(profile.net), "");
  drawStatBox(ctx, 66 + (statW + gap) * 2, statY, statW, `TCレベル ${profile.text.level || 1}`, profile.text.name, `経験値 ${profile.text.xp}`);
  drawStatBox(ctx, 66 + (statW + gap) * 3, statY, statW, `VCレベル ${profile.voice.level || 1}`, profile.voice.name, `${profile.voice.salaryPerMinute || 4}/分`);

  ctx.fillStyle = "#c89425";
  ctx.font = font("900", 30);
  ctx.fillText("刻まれし称号", 66, 350);

  ctx.strokeStyle = "rgba(155,116,42,0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(66, 366);
  ctx.lineTo(width - 66, 366);
  ctx.stroke();

  ctx.fillStyle = "#877b93";
  ctx.font = font("700", 22);
  const title = profile.title || profile.economy?.name || "未記録";
  ctx.fillText(trimText(ctx, title, 620), 66, 408);

  ctx.fillStyle = "#665a72";
  ctx.font = font("600", 18);
  ctx.fillText("発言と通話の記録が、ここに静かに刻まれる。", 420, 408);

  return canvas.toBuffer("image/png");
}

async function renderRankUpCardPng(data) {
  const { createCanvas, loadImage } = canvasTools;
  const width = 900;
  const height = 260;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  const gold = "#b8913c";

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#1a1031");
  gradient.addColorStop(0.55, "#090615");
  gradient.addColorStop(1, "#171022");
  ctx.fillStyle = gradient;
  roundRect(ctx, 0, 0, width, height, 22);
  ctx.fill();

  ctx.strokeStyle = "rgba(184,145,60,0.75)";
  ctx.lineWidth = 2;
  roundRect(ctx, 14, 14, width - 28, height - 28, 18);
  ctx.stroke();

  const avatar = await loadRemoteImage(data.userIconUrl, loadImage);
  drawAvatar(ctx, avatar, 42, 62, 132, gold, initials(data.displayName));

  const serverIcon = await loadRemoteImage(data.serverIconUrl, loadImage);
  if (serverIcon) drawAvatar(ctx, serverIcon, width - 82, 28, 46, gold, "I");

  ctx.fillStyle = "#9689aa";
  ctx.font = font("800", 20);
  ctx.fillText(trimText(ctx, data.serverName, 460), 200, 56);

  ctx.fillStyle = "#f5ead4";
  ctx.font = font("900", 38);
  ctx.fillText(trimText(ctx, data.displayName, 460), 200, 104);

  darkPill(ctx, 200, 122, data.title, "#332845", "#d8c293");

  const primary = data.lines[0] || "ランクが上がりました。";
  const secondary = data.lines[1] || "";
  ctx.fillStyle = "#d8c293";
  ctx.font = font("900", 28);
  ctx.fillText(trimText(ctx, primary.replace(data.displayName, "").trim() || primary, 610), 200, 188);

  ctx.fillStyle = "#8b809a";
  ctx.font = font("700", 20);
  ctx.fillText(trimText(ctx, secondary, 610), 200, 222);

  return canvas.toBuffer("image/png");
}

async function loadRemoteImage(url, loadImage) {
  if (!url || typeof fetch !== "function") return null;
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timeout = controller ? setTimeout(() => controller.abort(), 2000) : null;
  try {
    const response = await fetch(url, controller ? { signal: controller.signal } : undefined);
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    return await loadImage(buffer);
  } catch {
    return null;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function drawAvatar(ctx, image, x, y, size, accent, fallback) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  if (image) {
    ctx.drawImage(image, x, y, size, size);
  } else {
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "#f8fafc";
    ctx.font = font("bold", 40);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(fallback, x + size / 2, y + size / 2 + 2);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }
  ctx.restore();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2 + 3, 0, Math.PI * 2);
  ctx.stroke();
}

function drawMetric(ctx, x, y, w, label, value, accent, sub = "") {
  roundRect(ctx, x, y, w, 72, 16);
  ctx.fillStyle = "rgba(15,23,42,0.74)";
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.font = font("700", 14);
  ctx.fillText(label, x + 18, y + 25);
  ctx.fillStyle = "#f8fafc";
  ctx.font = font("bold", value.length > 12 ? 24 : 28);
  ctx.fillText(trimText(ctx, value, w - 34), x + 18, y + 55);
  if (sub) {
    ctx.fillStyle = "#94a3b8";
    ctx.font = font("600", 14);
    ctx.fillText(trimText(ctx, sub, 68), x + w - 78, y + 55);
  }
}

function drawStatBox(ctx, x, y, w, label, value, sub = "") {
  roundRect(ctx, x, y, w, 82, 10);
  ctx.fillStyle = "rgba(33,24,52,0.96)";
  ctx.fill();
  ctx.strokeStyle = "rgba(216,194,147,0.10)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#71677d";
  ctx.font = font("800", 19);
  ctx.fillText(label, x + 18, y + 28);

  ctx.fillStyle = "#eee2cd";
  ctx.font = font("900", value.length > 9 ? 25 : 29);
  ctx.fillText(trimText(ctx, value, w - 34), x + 18, y + 62);

  if (sub) {
    ctx.fillStyle = "#847895";
    ctx.font = font("700", 15);
    ctx.fillText(trimText(ctx, sub, 78), x + w - 92, y + 62);
  }
}

function drawProgress(ctx, x, y, w, label, percent, accent) {
  ctx.fillStyle = "#94a3b8";
  ctx.font = font("700", 14);
  ctx.fillText(label, x, y - 12);
  ctx.fillStyle = "#dbeafe";
  ctx.font = font("bold", 14);
  ctx.fillText(`${percent}%`, x + w - 38, y - 12);
  roundRect(ctx, x, y, w, 18, 9);
  ctx.fillStyle = "rgba(148,163,184,0.20)";
  ctx.fill();
  roundRect(ctx, x, y, Math.max(18, Math.floor((w * percent) / 100)), 18, 9);
  ctx.fillStyle = accent;
  ctx.fill();
}

function darkPill(ctx, x, y, text, bg, fg) {
  ctx.font = font("900", 21);
  const w = Math.ceil(ctx.measureText(text).width) + 34;
  roundRect(ctx, x, y, w, 38, 19);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.stroke();
  ctx.fillStyle = fg;
  ctx.fillText(text, x + 17, y + 26);
}

function pill(ctx, x, y, text, color) {
  ctx.font = font("800", 14);
  const w = Math.ceil(ctx.measureText(text).width) + 30;
  roundRect(ctx, x, y, w, 30, 15);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.fillStyle = "#f8fafc";
  ctx.fillText(text, x + 15, y + 20);
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function trimText(ctx, text, maxWidth) {
  const value = String(text || "");
  if (ctx.measureText(value).width <= maxWidth) return value;
  let clipped = value;
  while (clipped.length > 0 && ctx.measureText(`${clipped}...`).width > maxWidth) {
    clipped = clipped.slice(0, -1);
  }
  return `${clipped}...`;
}

function initials(name) {
  return String(name || "I").trim().slice(0, 2).toUpperCase() || "IR";
}

function colorHex(value) {
  return `#${Number(value || 0x14b8a6).toString(16).padStart(6, "0").slice(-6)}`;
}

function font(weight, size) {
  return `${weight} ${size}px "Noto Sans CJK JP", "Yu Gothic", "Meiryo", "Inter", sans-serif`;
}


async function showYadoRenameModal(interaction, room, channel) {
  const modal = new ModalBuilder()
    .setCustomId(`eco:modal:yado-rename:${channel.id}`)
    .setTitle("宿の名前を変える");

  const roomNameInput = new TextInputBuilder()
    .setCustomId("roomName")
    .setLabel("新しい宿名")
    .setStyle(TextInputStyle.Short)
    .setMaxLength(24)
    .setRequired(true)
    .setValue(room.name || safeChannelName(channel.name || "room"))
    .setPlaceholder("例: 深夜の避難所");

  modal.addComponents(
    new ActionRowBuilder().addComponents(roomNameInput)
  );

  await interaction.showModal(modal);
}

async function showSecretYadoPartnerPicker(interaction) {
  if (!interaction.guild || !interaction.channel?.parentId) {
    await interaction.reply({ content: "シークレット宿はカテゴリ内のテキストチャンネルから作ってください。", ephemeral: true });
    return;
  }

  const row = new ActionRowBuilder().addComponents(
    new UserSelectMenuBuilder()
      .setCustomId("eco:user:secret-yado")
      .setPlaceholder("相手を選ぶ")
      .setMinValues(1)
      .setMaxValues(1)
  );

  await interaction.reply({
    content: `シークレット宿は基本 ${fmt(yadoSecretCost)}。相手を選ぶとすぐVCを作ります。名前・人数・期限は宿内の管理パネルから。追加は1人 ${fmt(yadoExtraSeatCost)}。`,
    components: [row],
    ephemeral: true
  });
}

async function handleYadoControl(interaction) {
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
}

async function getYadoControlContext(interaction, channelId) {
  const entry = findYadoRoomByChannelId(channelId);
  if (!entry) {
    await interaction.reply({ content: "この宿はもう管理対象に残っていません。", ephemeral: true });
    return null;
  }
  const [ownerKey, room] = entry;
  if (room.ownerId !== interaction.user.id) {
    await interaction.reply({ content: "宿主だけが変更できます。", ephemeral: true });
    return null;
  }
  const guild = interaction.guild || client.guilds.cache.get(room.guildId);
  const channel = guild ? await guild.channels.fetch(room.channelId).catch(() => null) : null;
  if (!channel) {
    clearYadoRoom(ownerKey);
    await interaction.reply({ content: "宿VCが見つからなかったので管理情報を片付けました。", ephemeral: true });
    return null;
  }
  return { ownerKey, room, channel };
}

async function showYadoAddMemberPicker(interaction, room, channel) {
  if ((room.extraSeats || 0) >= yadoMaxExtraSeats) {
    await interaction.reply({ content: `追加人数は最大 ${yadoMaxExtraSeats} 人までです。`, ephemeral: true });
    return;
  }

  const row = new ActionRowBuilder().addComponents(
    new UserSelectMenuBuilder()
      .setCustomId(`eco:user:yado-add:${channel.id}`)
      .setPlaceholder("追加する相手を選ぶ")
      .setMinValues(1)
      .setMaxValues(1)
  );

  await interaction.reply({
    content: `シークレット宿に1人追加します。料金は ${fmt(yadoExtraSeatCost)}。`,
    components: [row],
    ephemeral: true
  });
}

async function addSecretYadoMember(interaction) {
  const channelId = interaction.customId.split(":")[3];
  const context = await getYadoControlContext(interaction, channelId);
  if (!context) return;
  const { ownerKey, room, channel } = context;
  const memberId = interaction.values[0];
  const member = await interaction.guild.members.fetch(memberId).catch(() => null);
  const alreadyAllowed = new Set([room.ownerId, room.partnerId, ...(room.guestIds || [])].filter(Boolean));
  if (!member || member.user.bot || alreadyAllowed.has(member.id)) {
    await interaction.reply({ content: "追加できる通常ユーザーを1人選んでください。", ephemeral: true });
    return;
  }
  await addYadoSeat(interaction, ownerKey, room, channel, member);
}

// 宿延長・管理操作UI・安全操作を追加する。
function formatYadoCountdown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(Number(ms || 0) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}時間${minutes}分${seconds}秒`;
  if (minutes > 0) return `${minutes}分${seconds}秒`;
  return `${seconds}秒`;
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
    return `最大期限に近いため延長できません\n最大 ${formatDuration(yadoMaxLifetimeMs)} / <t:${Math.floor(maxExpiresAt / 1000)}:R>`;
  }
  return `+${yadoExtendHours}時間 / ${fmt(yadoExtendCost(room))}\n最大 ${formatDuration(yadoMaxLifetimeMs)} / あと ${formatYadoCountdown(remainingWindow)} まで延長可`;
}

function yadoCostBreakdown(room) {
  const createCost = room?.secret ? yadoSecretCost : yadoPublicCost;
  const seatCost = Math.max(0, Number(room?.extraSeats || 0)) * yadoExtraSeatCost;
  const total = Math.max(0, Number(room?.cost || createCost + seatCost));
  const extendCost = Math.max(0, total - createCost - seatCost);
  return `作成 ${fmt(createCost)} / 増員 ${fmt(seatCost)} / 延長 ${fmt(extendCost)}\n合計 ${fmt(total)}`;
}

function yadoRoomName(room, channel) {
  return room?.name || safeChannelName(channel?.name || "room");
}

function yadoOwnerMention(room) {
  return room?.ownerId ? `<@${room.ownerId}>` : "不明";
}

function yadoAllowedMemberIds(room) {
  return Array.from(new Set([room?.ownerId, room?.partnerId, ...(room?.guestIds || [])].filter(Boolean)));
}

async function extendYadoRoom(interaction, ownerKey, room, channel) {
  if (!yadoCanExtend(room)) {
    await interaction.reply({ content: `これ以上は延長できません。作成から最大 ${formatDuration(yadoMaxLifetimeMs)} までです。`, ephemeral: true });
    return;
  }

  const actor = actorFromInteraction(interaction);
  const user = engine.getUser(actor.id, actor.name);
  const cost = yadoExtendCost(room);
  if (user.wallet < cost) {
    await interaction.reply({
      content: `延長には ${fmt(cost)} 必要です。いまの財布は ${fmt(user.wallet)}。`,
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
  engine.log(user, "yado", -cost, `宿 延長 +${yadoExtendHours}時間`);

  try {
    room.expiresAt = Number(room.expiresAt || Date.now()) + yadoExtendMs;
    room.cost = (room.cost || 0) + cost;
    room.extensions = (room.extensions || 0) + 1;
    store.save(engine.state);
    yadoStore.save(yadoState);
    scheduleYadoExpiry(ownerKey, room.expiresAt);
    const refreshed = await refreshYadoControlMessage(room, channel);
    await interaction.reply({
      content: `宿を ${yadoExtendHours}時間延長しました。残り ${formatYadoCountdown(room.expiresAt - Date.now())} / 料金 ${fmt(cost)}。${refreshed ? "" : " 管理パネルの自動更新に失敗したため、最新化ボタンで再取得してください。"}`,
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
    console.warn(`二人宿の延長に失敗しました: ${error.message}`);
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
      content: `宿主・相手・追加メンバー・Botだけが見える状態に戻しました。${refreshed ? "" : " 管理パネルの更新だけ失敗しました。"}`,
      ephemeral: true
    });
  } catch (error) {
    await interaction.reply({ content: "権限を再同期できませんでした。Botのチャンネル管理権限を確認してください。", ephemeral: true });
    console.warn(`二人宿の権限再同期に失敗しました: ${error.message}`);
  }
}

async function refreshYadoControlPanel(interaction, room, channel) {
  await interaction.update(buildYadoControlPayload(room, channel));
}

async function showYadoCloseConfirmation(interaction, room, channel) {
  const embed = new EmbedBuilder()
    .setTitle("宿を閉じますか？")
    .setDescription(`${channel} を削除し、宿の管理台帳とタイマーを片付けます。
この操作は宿主だけが実行できます。`)
    .setColor(0xb91c1c)
    .addFields(
      { name: "部屋", value: `${yadoRoomName(room, channel)}
${channel}`, inline: true },
      { name: "期限", value: `残り ${formatYadoCountdown(room.expiresAt - Date.now())}`, inline: true }
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`eco:yado:close-confirm:${channel.id}`)
      .setLabel("本当に閉じる")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`eco:yado:close-cancel:${channel.id}`)
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
    console.warn(`二人宿の手動クローズに失敗しました（再試行します）: ${error.message}`);
    return;
  }

  try {
    await interaction.editReply({ content: "宿を閉じました。", embeds: [], components: [] });
  } catch (error) {
    console.warn(`二人宿の手動クローズ確認更新に失敗しました: ${error.message}`);
  }
}

async function addYadoSeat(interaction, ownerKey, room, channel, member = null) {
  if ((room.extraSeats || 0) >= yadoMaxExtraSeats) {
    await interaction.reply({ content: `追加人数は最大 ${yadoMaxExtraSeats} 人までです。`, ephemeral: true });
    return;
  }

  const actor = actorFromInteraction(interaction);
  const user = engine.getUser(actor.id, actor.name);
  if (user.wallet < yadoExtraSeatCost) {
    await interaction.reply({
      content: `増員には ${fmt(yadoExtraSeatCost)} 必要です。いまの財布は ${fmt(user.wallet)}。`,
      ephemeral: true
    });
    return;
  }

  user.wallet -= yadoExtraSeatCost;
  user.lifetimeLost += yadoExtraSeatCost;
  engine.log(user, "yado", -yadoExtraSeatCost, "宿 増員");

  try {
    const nextCapacity = (room.capacity || 2) + 1;
    await channel.edit({ userLimit: nextCapacity }, "二人宿の増員");
    if (member && room.secret) {
      await channel.permissionOverwrites.edit(member.id, {
        ViewChannel: true,
        Connect: true,
        Speak: true
      });
      room.guestIds = Array.from(new Set([...(room.guestIds || []), member.id]));
    }
    room.capacity = nextCapacity;
    room.extraSeats = (room.extraSeats || 0) + 1;
    room.cost = (room.cost || 0) + yadoExtraSeatCost;
    store.save(engine.state);
    yadoStore.save(yadoState);
    await refreshYadoControlMessage(room, channel);
    await interaction.reply({
      content: member
        ? `${member} を宿に追加しました。最大${nextCapacity}人 / 追加料金 ${fmt(yadoExtraSeatCost)}。`
        : `宿の人数を最大${nextCapacity}人に増やしました。追加料金 ${fmt(yadoExtraSeatCost)}。`,
      ephemeral: true
    });
  } catch (error) {
    user.wallet += yadoExtraSeatCost;
    user.lifetimeLost = Math.max(0, user.lifetimeLost - yadoExtraSeatCost);
    store.save(engine.state);
    await interaction.reply({ content: "人数変更に失敗しました。料金は戻しました。", ephemeral: true });
    console.warn(`二人宿の増員に失敗しました: ${error.message}`);
  }
}

async function renameYadoRoomFromModal(interaction) {
  const channelId = interaction.customId.split(":")[3];
  const context = await getYadoControlContext(interaction, channelId);
  if (!context) return;
  const { room, channel } = context;
  const roomSlug = safeChannelName(interaction.fields.getTextInputValue("roomName"));
  if (!roomSlug) {
    await interaction.reply({ content: "宿名を入力してください。", ephemeral: true });
    return;
  }

  try {
    await channel.setName(`${room.secret ? "密宿" : "宿"}-${roomSlug}`, "二人宿の名前変更");
    room.name = roomSlug;
    yadoStore.save(yadoState);
    await refreshYadoControlMessage(room, channel);
    await interaction.reply({ content: `宿名を ${roomSlug} に変えました。`, ephemeral: true });
  } catch (error) {
    await interaction.reply({ content: "宿名を変更できませんでした。Botの権限を確認してください。", ephemeral: true });
    console.warn(`二人宿の名前変更に失敗しました: ${error.message}`);
  }
}

async function sendYadoControlPanel(channel, room) {
  if (!channel?.isTextBased?.()) return false;
  try {
    const message = await channel.send(buildYadoControlPayload(room, channel));
    room.controlMessageId = message.id;
    yadoStore.save(yadoState);
    return true;
  } catch (error) {
    console.warn(`二人宿の管理パネル送信に失敗しました: ${error.message}`);
    return false;
  }
}

async function refreshYadoControlMessage(room, channel) {
  if (!room.controlMessageId || !channel?.messages?.fetch) return false;
  try {
    const message = await channel.messages.fetch(room.controlMessageId);
    await message.edit(buildYadoControlPayload(room, channel));
    return true;
  } catch (error) {
    console.warn(`二人宿の管理パネル更新に失敗しました: ${error.message}`);
    return false;
  }
}

function buildYadoControlPayload(room, channel) {
  const expiresIn = formatYadoCountdown(room.expiresAt - Date.now());
  const extraSeats = Math.max(0, Number(room.extraSeats || 0));
  const capacity = Number(room.capacity || 2);
  const addDisabled = extraSeats >= yadoMaxExtraSeats;
  const embed = new EmbedBuilder()
    .setTitle("🛏 宿泊許可証")
    .setDescription("このVCの管理パネルです。\n名前変更、人数追加、期限延長、状態更新はここから行えます。")
    .setColor(room.secret ? 0x7f1d1d : 0x0f766e)
    .addFields(
      { name: "部屋", value: `${yadoRoomName(room, channel)}\n${channel}`, inline: true },
      { name: "形式", value: room.secret ? "シークレット宿" : "公開宿", inline: true },
      { name: "人数", value: `基本2人 + 追加${extraSeats}人\n現在の上限 ${capacity}人`, inline: true },
      { name: "期限", value: `残り ${expiresIn}\n<t:${Math.floor(room.expiresAt / 1000)}:R>`, inline: true },
      { name: "延長", value: yadoExtendStatus(room), inline: true },
      { name: "合計消費", value: yadoCostBreakdown(room), inline: false },
      { name: "宿主", value: yadoOwnerMention(room), inline: true }
    );

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`eco:yado:rename:${channel.id}`)
      .setLabel("名前変更")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`eco:yado:add-seat:${channel.id}`)
      .setLabel(room.secret ? "メンバー+1" : "人数+1")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(addDisabled),
    new ButtonBuilder()
      .setCustomId(`eco:yado:extend:${channel.id}`)
      .setLabel(`延長+${yadoExtendHours}h`)
      .setStyle(ButtonStyle.Success)
      .setDisabled(!yadoCanExtend(room))
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`eco:yado:resync:${channel.id}`)
      .setLabel("権限を再同期")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`eco:yado:refresh:${channel.id}`)
      .setLabel("最新化")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`eco:yado:close:${channel.id}`)
      .setLabel("宿を閉じる")
      .setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row1, row2] };
}

async function createYadoVoiceChannel(interaction, options = {}) {
  if (!interaction.guild || !interaction.channel) {
    await interaction.reply({ content: "サーバー内のテキストチャンネルで使ってください。", ephemeral: true });
    return;
  }

  const parentId = interaction.channel.parentId;
  if (!parentId) {
    await interaction.reply({ content: "このパネルはカテゴリ内のテキストチャンネルに置いてください。", ephemeral: true });
    return;
  }

  const actor = actorFromInteraction(interaction);
  const user = engine.getUser(actor.id, actor.name);
  const ownerKey = yadoOwnerKey(interaction.guild.id, interaction.user.id);
  const secret = Boolean(options.secret);
  const capacity = 2;
  const extraSeats = 0;
  const cost = secret ? yadoSecretCost : yadoPublicCost;
  const partnerId = options.partnerId || null;
  const partner = partnerId ? await interaction.guild.members.fetch(partnerId).catch(() => null) : null;
  if (secret) {
    if (!partner || partner.user.bot || partner.id === interaction.user.id) {
      await interaction.reply({ content: "相手はサーバー内の通常ユーザーから1人選んでください。", ephemeral: true });
      return;
    }
  }
  const activeRoom = await getActiveYadoRoom(interaction.guild, ownerKey);
  if (activeRoom) {
    const payload = buildYadoControlPayload(activeRoom, activeRoom.channel, { ephemeral: true });
    await interaction.reply({
      content: `すでに宿があります。${activeRoom.channel ? `${activeRoom.channel} ` : ""}終了まで ${formatDuration(activeRoom.expiresAt - Date.now())}。`,
      embeds: payload.embeds,
      components: payload.components,
      ephemeral: true
    });
    return;
  }

  if (user.wallet < cost) {
    await interaction.reply({
      content: `宿の作成には ${fmt(cost)} 必要です。いまの財布は ${fmt(user.wallet)}。`,
      ephemeral: true
    });
    return;
  }

  user.wallet -= cost;
  user.lifetimeLost += cost;
  engine.log(user, "yado", -cost, secret ? "シークレット宿 12時間" : "公開宿 12時間");
  store.save(engine.state);

  try {
    const displayName = interaction.member?.displayName || interaction.user.globalName || interaction.user.username;
    const roomSlug = safeChannelName(displayName);
    const expiresAt = Date.now() + yadoDurationMs;
    const channelOptions = {
      name: `${secret ? "密宿" : "宿"}-${roomSlug}`,
      type: ChannelType.GuildVoice,
      parent: parentId,
      userLimit: capacity,
      reason: `${secret ? "シークレット宿" : "公開宿"}VC作成: ${interaction.user.tag}`
    };
    if (secret) {
      channelOptions.permissionOverwrites = [
        {
          id: interaction.guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
        },
        {
          id: interaction.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
        },
        {
          id: partner.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
        },
        {
          id: client.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.ManageChannels]
        }
      ];
    }
    const channel = await interaction.guild.channels.create(channelOptions);
    tempInnVoiceChannels.add(channel.id);
    yadoState.rooms ||= {};
    const room = {
      guildId: interaction.guild.id,
      ownerId: interaction.user.id,
      partnerId: partner?.id || null,
      secret,
      channelId: channel.id,
      name: roomSlug,
      capacity,
      extraSeats,
      cost,
      createdAt: Date.now(),
      expiresAt
    };
    yadoState.rooms[ownerKey] = room;
    yadoStore.save(yadoState);
    scheduleYadoExpiry(ownerKey, expiresAt);
    const controlPosted = await sendYadoControlPanel(channel, room);
    const fallbackPayload = controlPosted ? null : buildYadoControlPayload(room, channel, { ephemeral: true });
    await interaction.reply({
      content: secret
        ? `${channel} を作成しました。相手: ${partner} / 最大${capacity}人 / 料金 ${fmt(cost)} / 12時間で終了します。${controlPosted ? "宿内チャットに管理パネルを置きました。" : "下のパネルから管理できます。"}`
        : `${channel} を作成しました。公開宿 / 最大${capacity}人 / 料金 ${fmt(cost)} / 12時間で終了します。${controlPosted ? "宿内チャットに管理パネルを置きました。" : "下のパネルから管理できます。"}`,
      embeds: fallbackPayload?.embeds || [],
      components: fallbackPayload?.components || [],
      ephemeral: true
    });
  } catch (error) {
    user.wallet += cost;
    user.lifetimeLost = Math.max(0, user.lifetimeLost - cost);
    store.save(engine.state);
    await interaction.reply({
      content: `VCを作成できませんでした。Botに「チャンネル管理」権限があるか確認してください。`,
      ephemeral: true
    });
    console.warn(`二人宿VC作成に失敗しました: ${error.message}`);
  }
}

async function cleanupTemporaryVoiceChannel(channel) {
  if (!channel || !tempInnVoiceChannels.has(channel.id)) return;
  if (channel.members?.size > 0) return;
  try {
    await channel.delete("二人宿VCが空になったため削除");
    clearYadoRoomByChannel(channel.id);
  } catch (error) {
    console.warn(`二人宿VC削除に失敗しました: ${error.message}`);
  }
}

async function resumeYadoRooms() {
  yadoState.rooms ||= {};
  for (const [ownerKey, room] of Object.entries(yadoState.rooms)) {
    tempInnVoiceChannels.add(room.channelId);
    if (Date.now() >= room.expiresAt) {
      await expireYadoRoom(ownerKey, "二人宿の12時間期限");
      continue;
    }
    scheduleYadoExpiry(ownerKey, room.expiresAt);
  }
}

async function getActiveYadoRoom(guild, ownerKey) {
  const room = yadoState.rooms?.[ownerKey];
  if (!room) return null;
  if (Date.now() >= room.expiresAt) {
    await expireYadoRoom(ownerKey, "二人宿の12時間期限");
    return null;
  }
  const channel = await guild.channels.fetch(room.channelId).catch(() => null);
  if (!channel) {
    clearYadoRoom(ownerKey);
    return null;
  }
  return { ...room, channel };
}

function scheduleYadoExpiry(ownerKey, expiresAt) {
  const oldTimer = yadoTimers.get(ownerKey);
  if (oldTimer) clearTimeout(oldTimer);

  const timer = setTimeout(async () => {
    await expireYadoRoom(ownerKey, "二人宿の12時間期限");
  }, Math.max(1_000, expiresAt - Date.now()));
  timer.unref?.();
  yadoTimers.set(ownerKey, timer);
}

async function expireYadoRoom(ownerKey, reason) {
  const room = yadoState.rooms?.[ownerKey];
  if (!room) return;
  const guild = client.guilds.cache.get(room.guildId) || await client.guilds.fetch(room.guildId).catch(() => null);
  if (!guild) {
    // ギルドが取れない（一時障害の可能性）→ 記録は残して60秒後に再試行
    scheduleYadoExpiry(ownerKey, Date.now() + 60_000);
    return;
  }
  let channel = null;
  try {
    channel = await guild.channels.fetch(room.channelId);
  } catch (error) {
    if (error?.code === 10003) {
      // Unknown Channel = すでに消えている → 台帳だけ掃除
      clearYadoRoom(ownerKey);
      return;
    }
    console.warn(`二人宿VC取得に失敗しました（再試行します）: ${error.message}`);
    scheduleYadoExpiry(ownerKey, Date.now() + 60_000);
    return;
  }
  if (channel) {
    try {
      await channel.delete(reason);
    } catch (error) {
      // 削除に失敗した場合は台帳を消さず、後で再試行する（VCが残り続けるバグの元凶だった）
      console.warn(`二人宿VC期限削除に失敗しました（再試行します）: ${error.message}`);
      scheduleYadoExpiry(ownerKey, Date.now() + 60_000);
      return;
    }
  }
  clearYadoRoom(ownerKey);
}

function startYadoSweeper() {
  // タイマー消失や削除失敗の取りこぼしを5分ごとに拾うフォールバック
  setInterval(async () => {
    for (const [ownerKey, room] of Object.entries(yadoState.rooms || {})) {
      if (Date.now() >= room.expiresAt) {
        await expireYadoRoom(ownerKey, "二人宿の12時間期限");
      }
    }
  }, 5 * 60_000).unref?.();
}

function clearYadoRoomByChannel(channelId) {
  const entry = findYadoRoomByChannelId(channelId);
  if (entry) clearYadoRoom(entry[0]);
  else tempInnVoiceChannels.delete(channelId);
}

function findYadoRoomByChannelId(channelId) {
  return Object.entries(yadoState.rooms || {}).find(([, room]) => room.channelId === channelId) || null;
}

function clearYadoRoom(ownerKey) {
  const room = yadoState.rooms?.[ownerKey];
  if (room) tempInnVoiceChannels.delete(room.channelId);
  const timer = yadoTimers.get(ownerKey);
  if (timer) clearTimeout(timer);
  yadoTimers.delete(ownerKey);
  if (yadoState.rooms) delete yadoState.rooms[ownerKey];
  yadoStore.save(yadoState);
}

function yadoOwnerKey(guildId, userId) {
  return `${guildId}:${userId}`;
}

function safeChannelName(value) {
  return String(value || "room")
    .replace(/[^\p{L}\p{N}_-]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || "room";
}

function startYadoControlRefreshSweeper() {
  setInterval(async () => {
    for (const [ownerKey, room] of Object.entries(yadoState.rooms || {})) {
      if (!room?.controlMessageId || Date.now() >= Number(room.expiresAt || 0)) continue;
      const guild = client.guilds.cache.get(room.guildId) || await client.guilds.fetch(room.guildId).catch(() => null);
      const channel = guild ? await guild.channels.fetch(room.channelId).catch(() => null) : null;
      if (channel) await refreshYadoControlMessage(room, channel);
      else clearYadoRoom(ownerKey);
    }
  }, yadoControlRefreshMs).unref?.();
}

function startVoiceRewardSweeper() {
  const intervalMs = 10 * 60 * 1000;
  setInterval(async () => {
    let changed = false;
    for (const storedUser of Object.values(engine.state.users || {})) {
      if (!storedUser.activity?.voiceJoinedAt) continue;

      const [guildKey, discordUserId] = String(storedUser.id).split(":");
      const guild = client.guilds.cache.get(guildKey);
      const voiceState = guild?.voiceStates.cache.get(discordUserId);
      const user = engine.getUser(storedUser.id, storedUser.name);

      if (!voiceState?.channelId) {
        engine.clearVoiceSession(user);
        changed = true;
        continue;
      }

      const result = engine.claimVoiceReward(user, { silent: true, ...voiceRewardOptionsForChannel(voiceState.channel) });
      if (result && !result.noop) changed = true;
    }

    if (changed) store.save(engine.state);
  }, intervalMs).unref?.();
}

function startMarketSweeper() {
  const intervalMs = 60_000;
  setInterval(async () => {
    const auctionRes = engine.closeEndedAuctions();
    const expireRes = engine.expireEndedOrders();
    const notifications = [...(auctionRes.notifications || []), ...(expireRes.notifications || [])];
    if ((auctionRes.closed?.length || 0) + (expireRes.expired?.length || 0) > 0) {
      store.save(engine.state);
      if (auctionRes.closed?.length) console.log(`公式オークションを ${auctionRes.closed.length}件終了しました。`);
      if (expireRes.expired?.length) console.log(`期限切れ商品を ${expireRes.expired.length}件処理しました。`);
    }
    if (notifications.length) await deliverNotifications(notifications);
  }, intervalMs).unref?.();
}

async function processOfficialPurchaseEffects(interaction, result) {
  const fulfillment = result?.officialFulfillment;
  if (!fulfillment || !interaction?.guild) return;
  const task = engine.officialFulfillmentTask(fulfillment.id);
  if (!task) return;
  if (task.roleId) await grantOfficialRoleForTask(interaction.guild, task, "bot");
  const guide = String(fulfillment.dmGuide || "").trim();
  if (guide) {
    await interaction.user.send({
      embeds: [new EmbedBuilder().setTitle(`購入ありがとうございます: ${fulfillment.itemName}`).setDescription(guide.slice(0, 4000)).setColor(0x8b5cf6)]
    }).catch(() => null);
  }
}

async function grantOfficialRoleForTask(guild, task, completedBy) {
  if (!guild || !task?.roleId) return { ok: false, title: "ロール付与に失敗しました", lines: ["サーバーまたはロール設定を確認してください。"] };
  const discordUserId = extractDiscordUserId(task.buyerId);
  const role = await guild.roles.fetch(task.roleId).catch(() => null);
  const member = discordUserId ? await guild.members.fetch(discordUserId).catch(() => null) : null;
  const botMember = guild.members.me;
  if (!role || !member || role.managed || !botMember?.permissions.has(PermissionFlagsBits.ManageRoles) || role.position >= botMember.roles.highest.position) {
    engine.recordOfficialRoleGrantFailure(task.id, "ロールが見つからない、またはBotに付与権限がありません。");
    store.save(engine.state);
    return { ok: false, title: "ロール付与に失敗しました", lines: ["対応キューに残しました。ロールの位置とBot権限を確認して再試行してください。"], panel: engine.officialFulfillmentTaskPanel(engine.getUser(task.buyerId, task.buyerName), task.id) };
  }
  try {
    await member.roles.add(role, `公式商品 #${task.id}`);
    engine.recordOfficialRoleGrant(task.id, { completedBy, guildId: guild.id, discordUserId });
    store.save(engine.state);
    return { ok: true, title: "ロールを付与しました", lines: [`${task.itemName} を ${member.displayName} に付与しました。`, task.roleDurationDays > 0 ? `${task.roleDurationDays}日後に自動回収します。` : "期限なしで付与しました。"], panel: engine.officialFulfillmentTaskPanel(engine.getUser(task.buyerId, task.buyerName), task.id) };
  } catch (error) {
    engine.recordOfficialRoleGrantFailure(task.id, `ロール付与失敗: ${String(error.message || error).slice(0, 160)}`);
    store.save(engine.state);
    return { ok: false, title: "ロール付与に失敗しました", lines: ["対応キューに残しました。権限と対象メンバーを確認して再試行してください。"], panel: engine.officialFulfillmentTaskPanel(engine.getUser(task.buyerId, task.buyerName), task.id) };
  }
}

function startOfficialRoleExpirySweeper() {
  setInterval(async () => {
    let changed = false;
    for (const grant of engine.state.marketplace?.officialRoleGrants || []) {
      if (grant.status !== "active" || !grant.expiresAt || Date.now() < new Date(grant.expiresAt).getTime()) continue;
      const guild = grant.guildId ? client.guilds.cache.get(grant.guildId) || await client.guilds.fetch(grant.guildId).catch(() => null) : null;
      const member = guild && grant.discordUserId ? await guild.members.fetch(grant.discordUserId).catch(() => null) : null;
      const role = guild && grant.roleId ? await guild.roles.fetch(grant.roleId).catch(() => null) : null;
      if (!guild || !member || !role) continue;
      try {
        await member.roles.remove(role, `公式商品ロール期限 #${grant.fulfillmentId}`);
        grant.status = "revoked";
        grant.revokedAt = new Date().toISOString();
        changed = true;
      } catch (error) {
        console.warn(`公式商品ロール期限回収に失敗しました: ${error.message}`);
      }
    }
    if (changed) store.save(engine.state);
  }, 60_000).unref?.();
}

function startBoostRewardSweeper() {
  setTimeout(() => {
    void reconcileTrackedBoostRewards("ready");
  }, 10_000).unref?.();
  setInterval(() => {
    void reconcileTrackedBoostRewards("sweeper");
  }, boostRewardSweepMs).unref?.();
}

async function reconcileTrackedBoostRewards(reason = "sweeper") {
  const tracked = Object.values(engine.state.boostRewards?.members || {}).filter((member) => member.active && member.guildId && member.discordUserId);
  const summary = { paid: 0, skipped: 0, failed: 0 };
  for (const trackedMember of tracked) {
    const guild = client.guilds.cache.get(trackedMember.guildId);
    if (!guild) {
      summary.skipped += 1;
      continue;
    }
    const member = await guild.members.fetch(trackedMember.discordUserId).catch(() => null);
    if (!member || member.user?.bot) {
      const before = snapshotEngineState();
      try {
        recordBoostMemberLeft({
          guild,
          user: { id: trackedMember.discordUserId, bot: false },
          displayName: trackedMember.displayName
        });
        store.save(engine.state);
      } catch (error) {
        engine.state = before;
        console.warn(`ブースト追跡状態の保存に失敗しました: ${error.message}`);
      }
      summary.skipped += 1;
      continue;
    }
    const result = await handleBoostMemberState(member, reason);
    if (result?.reward?.changed) summary.paid += 1;
    else if (result?.ok === false) summary.failed += 1;
    else summary.skipped += 1;
  }
  return summary;
}

async function handleBoostMemberState(member, reason = "member-update") {
  if (!member?.guild || !member.user || member.user.bot) return { ok: false };
  const active = Boolean(member.premiumSince);
  const before = snapshotEngineState();
  let observation = null;
  let reward = null;
  try {
    observation = engine.recordBoostMemberObservation({
      guildId: member.guild.id,
      discordUserId: member.user.id,
      displayName: member.displayName || member.user.globalName || member.user.username,
      premiumSince: member.premiumSince ? member.premiumSince.toISOString() : null,
      active
    });
    await syncConfiguredBoosterRole(member, active);
    reward = active
      ? engine.claimBoostMonthlyRewardForMember({
          guildId: member.guild.id,
          discordUserId: member.user.id,
          displayName: member.displayName || member.user.globalName || member.user.username,
          premiumSince: member.premiumSince.toISOString(),
          roleIds: member.roles.cache.keys()
        })
      : { changed: false };
    if (observation?.changed || reward?.changed) {
      store.save(engine.state);
      if (reward?.changed) {
        await sendLog({
          ok: true,
          title: "サーバーブースト報酬",
          lines: [
            `${member.displayName} に ${fmt(reward.reward.amount)} を付与しました。`,
            `tier ${reward.reward.tier} / ${reward.reward.monthKey}${reward.reward.continuityBonus ? ` / 継続 ${fmt(reward.reward.continuityBonus)}` : ""}`
          ]
        });
      }
    }
    return { ok: true, observation, reward };
  } catch (error) {
    engine.state = before;
    console.warn(`ブースト報酬処理に失敗しました (${reason}): ${error.message}`);
    return { ok: false, error };
  }
}

function recordBoostMemberLeft(member) {
  if (!member?.guild || !member.user || member.user.bot) return;
  engine.recordBoostMemberObservation({
    guildId: member.guild.id,
    discordUserId: member.user.id,
    displayName: member.displayName || member.user.globalName || member.user.username,
    active: false
  });
}

async function syncConfiguredBoosterRole(member, active) {
  const roleId = engine.boostRewardSettings?.().boosterRoleId;
  if (!roleId || !member?.guild || !member.roles?.cache) return;
  const role = await member.guild.roles.fetch(roleId).catch(() => null);
  const botMember = member.guild.members.me;
  if (!role || role.managed || !botMember?.permissions.has(PermissionFlagsBits.ManageRoles) || role.position >= botMember.roles.highest.position) {
    console.warn("ブースター自動ロールを操作できません。ロール位置とManage Roles権限を確認してください。");
    return;
  }
  const hasRole = member.roles.cache.has(roleId);
  try {
    if (active && !hasRole) await member.roles.add(role, "サーバーブースト報酬: ブースター自動ロール");
    if (!active && hasRole) await member.roles.remove(role, "サーバーブースト報酬: ブースター自動ロール解除");
  } catch (error) {
    console.warn(`ブースター自動ロール操作に失敗しました: ${error.message}`);
  }
}

function snapshotEngineState() {
  return JSON.parse(JSON.stringify(engine.state));
}

function formatDiscord(result) {
  return formatResult(result).replace(/^◆ /, "**◆ ").replace(/^◇ /, "**◇ ").replace(/\n/, "**\n");
}

function buildEmbed(result, imageName = null) {
  if (result.panel) return buildPanelEmbed(result);
  if (!result.card) {
    // パネルもカードも無いプレーン結果（ランキング、台帳、報酬結果など）も Embed で統一する
    if (!result.title && !Array.isArray(result.lines)) return null;
    return new EmbedBuilder()
      .setTitle(String(result.title || "結果").slice(0, 256))
      .setDescription((result.lines || []).join("\n").slice(0, 4000) || "-")
      .setColor(result.ok ? 0x0f766e : 0xef4444);
  }
  const embed = new EmbedBuilder()
    .setTitle(result.card.title || result.title)
    .setColor(result.card.color || 0x64748b);

  if (result.card.discord?.serverName) {
    embed.setAuthor({
      name: result.card.discord.serverName,
      iconURL: result.card.discord.serverIconUrl || undefined
    });
  }
  if (result.card.discord?.userIconUrl) {
    embed.setThumbnail(result.card.discord.userIconUrl);
  }
  if (result.card.description) embed.setDescription(result.card.description);
  if (imageName) {
    embed.setImage(`attachment://${imageName}`);
    if (result.card.footer) embed.setFooter({ text: result.card.footer });
    return embed;
  }
  if (result.card.footer) embed.setFooter({ text: result.card.footer });
  if (Array.isArray(result.card.fields)) {
    embed.addFields(
      result.card.fields.map((field) => ({
        name: field.name,
        value: field.value || "-",
        inline: Boolean(field.inline)
      }))
    );
  }

  return embed;
}

function buildPanelEmbed(result) {
  const panel = result.panel;
  const embed = new EmbedBuilder()
    .setTitle(panel.title || result.title)
    .setDescription(panel.description || "")
    .setColor(panel.color || 0x64748b);

  if (Array.isArray(panel.fields) && panel.fields.length > 0) {
    embed.addFields(
      panel.fields.map((field) => ({
        name: field.name,
        value: field.value || "-",
        inline: Boolean(field.inline)
      }))
    );
  }

  embed.setFooter({ text: "パネル中心UI / 裏ではコマンドも使えます" });
  return embed;
}

function buildComponents(result, options = {}) {
  const panel = result.panel;
  if (!panel?.components) return options.fallback ? fallbackComponents() : [];

  assertUniquePanelComponentIds(panel);

  return panel.components.slice(0, 5).map((component, rowIndex) => {
    const row = new ActionRowBuilder();
    if (component.type === "buttons") {
      row.addComponents(
        component.items.slice(0, 5).map((item, index) => {
          const customId = item.kind === "panel"
            ? `eco:panel:${item.panel}`
            : item.kind === "custom"
              ? item.customId
              : `eco:run:${item.command}`;
          return new ButtonBuilder()
            .setCustomId(customId.slice(0, 100))
            .setLabel(item.label || `操作 ${rowIndex}-${index}`)
            .setStyle(buttonStyle(item.style))
            .setDisabled(Boolean(item.disabled));
        })
      );
      return row;
    }

    if (component.type === "select") {
      row.addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`eco:select:${rowIndex}`)
          .setPlaceholder(component.placeholder || "選択")
          .setDisabled(Boolean(component.disabled))
          .addOptions(
            component.options.slice(0, 25).map((item) => ({
              label: item.label,
              value: item.value.slice(0, 100),
              description: item.description?.slice(0, 100)
            }))
          )
      );
      return row;
    }

    if (component.type === "channel-select") {
      const typeMap = {
        category: ChannelType.GuildCategory,
        voice: ChannelType.GuildVoice
      };
      const channelTypes = (component.channelTypes || [])
        .map((type) => typeMap[type])
        .filter((type) => type !== undefined);
      const menu = new ChannelSelectMenuBuilder()
        .setCustomId(String(component.customId || `eco:channel-select:${rowIndex}`).slice(0, 100))
        .setPlaceholder(component.placeholder || "チャンネルを選択")
        .setMinValues(1)
        .setMaxValues(1)
        .setDisabled(Boolean(component.disabled));
      if (channelTypes.length) menu.addChannelTypes(...channelTypes);
      row.addComponents(menu);
      return row;
    }

    if (component.type === "role-select") {
      row.addComponents(
        new RoleSelectMenuBuilder()
          .setCustomId(String(component.customId || `eco:role-select:${rowIndex}`).slice(0, 100))
          .setPlaceholder(component.placeholder || "ロールを選択")
          .setMinValues(1)
          .setMaxValues(1)
          .setDisabled(Boolean(component.disabled))
      );
      return row;
    }

    return row;
  });
}

function assertUniquePanelComponentIds(panel) {
  const seen = new Set();
  for (const [rowIndex, row] of (panel.components || []).entries()) {
    if (row?.type === "buttons") {
      for (const item of row.items || []) {
        const id = item.kind === "panel"
          ? `eco:panel:${item.panel}`
          : item.kind === "custom"
            ? item.customId
            : `eco:run:${item.command}`;
        if (seen.has(id)) throw new Error(`重複したコンポーネントID: ${id}`);
        seen.add(id);
      }
      continue;
    }

    const id = row?.type === "select"
      ? `eco:select:${rowIndex}`
      : row?.type === "channel-select" || row?.type === "role-select"
        ? String(row.customId || "")
        : "";
    if (!id) continue;
    if (seen.has(id)) throw new Error(`重複したコンポーネントID: ${id}`);
    seen.add(id);
  }
}

function fallbackComponents() {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("eco:panel:home").setLabel("ホーム").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("eco:panel:marketplace").setLabel("ショップ").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("eco:panel:my-shop").setLabel("自分の店").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("eco:panel:lounge").setLabel("通話").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("eco:run:card").setLabel("カード").setStyle(ButtonStyle.Secondary)
  );
  return [row];
}

function commandFromComponent(interaction) {
  if (interaction.isButton()) {
    const parts = interaction.customId.split(":");
    if (parts[1] === "panel") return `panel ${parts.slice(2).join(":")}`;
    if (parts[1] === "run") return parts.slice(2).join(":");
    if (parts[1] === "market" && parts[2] === "shop-settings") return "market-shop-settings";
    if (parts[1] === "market" && parts[2] === "listing-create") return "market-listing-create";
    if (parts[1] === "market" && parts[2] === "post-panel") return "post-market-panel";
    if (parts[1] === "market" && parts[2] === "auction-create") return "market-auction-create";
    if (parts[1] === "market" && parts[2] === "official-item-create") return "market-official-item-create";
    if (parts[1] === "market" && parts[2] === "auction-bid") return `market-auction-bid ${parts[3]}`;
    if (parts[1] === "admin" && parts[2] === "salary-start") return "salary-start";
    if (parts[1] === "admin" && parts[2] === "salary-execute") return `salary-execute ${parts[3]}`;
    if (parts[1] === "admin" && parts[2] === "salary-cancel") return `salary-cancel ${parts[3]}`;
    if (parts[1] === "admin" && parts[2] === "rank-panel-post") return "rank-panel-post";
    if (parts[1] === "admin" && parts[2] === "rank-notify-set") return "rank-notify-set";
    if (parts[1] === "admin" && parts[2] === "rank-notify-clear") return "rank-notify-clear";
    if (parts[1] === "admin" && parts[2] === "rank-reset-confirm") return `rank-reset-confirm ${parts[3]}`;
    if (parts[1] === "admin" && parts[2] === "rank-reset-execute") return `rank-reset-execute ${parts[3]}`;
    if (parts[1] === "admin" && parts[2] === "rank-reset-cancel") return "rank-reset-cancel";
    if (parts[1] === "admin" && parts[2] === "balance-user-set") return "balance-user-set";
    if (parts[1] === "admin" && parts[2] === "balance-user-add") return "balance-user-add";
    if (parts[1] === "admin" && parts[2] === "balance-user-sub") return "balance-user-sub";
    if (parts[1] === "admin" && parts[2] === "balance-role-set") return "balance-role-set";
    if (parts[1] === "admin" && parts[2] === "balance-role-execute") return `balance-role-execute ${parts[3]}`;
    if (parts[1] === "admin" && parts[2] === "balance-role-cancel") return `balance-role-cancel ${parts[3]}`;
    if (parts[1] === "shop" && parts[2] === "search-open") return "shop-search-open";
    if (parts[1] === "shop" && parts[2] === "status-toggle") return "shop-status-toggle";
    if (parts[1] === "shop" && parts[2] === "sales-dm-toggle") return "shop-sales-dm-toggle";
    if (parts[1] === "shop" && parts[2] === "edit") return `shop-edit ${parts[3]}`;
    if (parts[1] === "shop" && parts[2] === "resubmit") return `shop-resubmit ${parts[3]}`;
    if (parts[1] === "market" && parts[2] === "settings-edit") return "market-settings-edit";
    return null;
  }

  if (interaction.isStringSelectMenu()) {
    const value = interaction.values[0] || "";
    if (value.startsWith("panel:")) return `panel ${value.slice(6)}`;
    if (value.startsWith("run:")) return value.slice(4);
  }

  return null;
}

function buttonStyle(style) {
  if (style === "primary") return ButtonStyle.Primary;
  if (style === "success") return ButtonStyle.Success;
  if (style === "danger") return ButtonStyle.Danger;
  return ButtonStyle.Secondary;
}

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return ["1", "true", "yes", "on", "有効"].includes(String(value).trim().toLowerCase());
}

function parsePositiveIntEnv(name, fallback) {
  const value = Number.parseInt(process.env[name] || "", 10);
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return value;
}

function parseNonNegativeIntEnv(name, fallback) {
  const value = Number.parseInt(process.env[name] || "", 10);
  if (!Number.isFinite(value) || value < 0) return fallback;
  return value;
}

function formatDuration(ms) {
  const totalMinutes = Math.max(1, Math.ceil(ms / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}分`;
  if (minutes === 0) return `${hours}時間`;
  return `${hours}時間${minutes}分`;
}

function chunkDiscord(text) {
  const chunks = [];
  let rest = text;
  while (rest.length > 1900) {
    const index = rest.lastIndexOf("\n", 1900);
    const cut = index > 0 ? index : 1900;
    chunks.push(rest.slice(0, cut));
    rest = rest.slice(cut).trimStart();
  }
  chunks.push(rest);
  return chunks;
}
