const path = require("path");
const { EconomyEngine, createInitialState, formatResult } = require("./economy");
const { JsonStore } = require("./storage");

let discord;
try {
  discord = require("discord.js");
} catch (error) {
  console.error("discord.js is not installed. Run `npm install` before starting the Discord bot.");
  process.exit(1);
}

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  StringSelectMenuBuilder
} = discord;

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;
const prefix = process.env.BOT_PREFIX || "!eco";
const logChannelId = process.env.DISCORD_LOG_CHANNEL_ID;
const adminUserIds = new Set(
  String(process.env.ECONOMY_ADMIN_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
);
const inviteCache = new Map();

if (!token) {
  console.error("Missing DISCORD_TOKEN.");
  process.exit(1);
}

const store = new JsonStore(path.join(__dirname, "..", "data", "discord-state.json"), createInitialState);
const state = store.load();
const engine = new EconomyEngine(state);

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
  console.log(`Logged in as ${readyClient.user.tag}`);
  console.log(`Slash: /eco command:<text>  Prefix: ${prefix} <command>`);
  await registerSlashCommand();
  await refreshInviteCaches();
  startVoiceRewardSweeper();
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton() || interaction.isStringSelectMenu()) {
    const command = commandFromComponent(interaction);
    if (!command) return;
    if (!canRunCommand(interaction.user.id, command)) {
      await interaction.reply({ content: "その釘、触る権限ないです。", ephemeral: true });
      return;
    }

    const actor = actorFromInteraction(interaction);
    const result = engine.run(command, actor);
    store.save(engine.state);
    await updateDiscord(interaction, result);
    return;
  }

  if (!interaction.isChatInputCommand() || interaction.commandName !== "eco") return;

  const command = interaction.options.getString("command") || "panel";
  if (!canRunCommand(interaction.user.id, command)) {
    await interaction.reply({ content: "その釘、触る権限ないです。", ephemeral: true });
    return;
  }
  const actor = actorFromInteraction(interaction);
  const result = engine.run(command, actor);
  store.save(engine.state);

  await replyDiscord(interaction, result);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const actor = actorFromMessage(message);
  if (message.guild && !message.content.startsWith(prefix)) {
    const activityResult = engine.awardTextActivity(actor);
    if (activityResult) {
      store.save(engine.state);
      if (!activityResult.silent) await sendResult(message.channel, activityResult);
    }
    return;
  }

  if (!message.content.startsWith(prefix)) return;
  const command = message.content.slice(prefix.length).trim() || "help";
  if (!canRunCommand(message.author.id, command)) {
    await message.reply("その釘、触る権限ないです。");
    return;
  }
  const result = engine.run(command, actor);
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
    const result = engine.finishVoiceSession(actor);
    if (moved) engine.startVoiceSession(actor, newState.channelId);
    store.save(engine.state);
    if (result?.kind === "vc_rank_up") await sendLog(result);
  }
});

client.on(Events.InviteCreate, async (invite) => {
  await refreshInviteCache(invite.guild);
});

client.on(Events.InviteDelete, async (invite) => {
  await refreshInviteCache(invite.guild);
});

client.on(Events.GuildMemberAdd, async (member) => {
  if (member.user.bot) return;
  const used = await detectUsedInvite(member.guild);
  const result = used?.inviter
    ? engine.recordInviteJoin(
        actorFromUser(member.guild.id, used.inviter),
        actorFromMember(member),
        { code: used.code }
      )
    : null;
  const joinResult = engine.run("join", actorFromMember(member));
  store.save(engine.state);
  if (result) {
    await sendLog({
      ok: true,
      title: "招待成立",
      lines: [`${result.inviter.name} -> ${result.invitee.name}`, ...joinResult.lines.slice(0, 2)]
    });
  } else {
    await sendLog({
      ok: true,
      title: "自動加入",
      lines: [`${member.displayName || member.user.username} に初期KCを付与。`, ...joinResult.lines.slice(0, 1)]
    });
  }
});

client.on(Events.GuildMemberRemove, async (member) => {
  if (member.user.bot) return;
  engine.recordInviteLeave(actorFromMember(member));
  store.save(engine.state);
});

client.login(token);

async function registerSlashCommand() {
  if (!clientId) {
    console.log("DISCORD_CLIENT_ID not set; skipping slash command registration.");
    return;
  }

  const command = new SlashCommandBuilder()
    .setName("eco")
    .setDescription("K-Credit panels, economy, RPG, casino, ranks")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("Optional. Example: panel, card, policy, panel casino")
        .setRequired(false)
    );

  const rest = new REST({ version: "10" }).setToken(token);
  const route = guildId
    ? Routes.applicationGuildCommands(clientId, guildId)
    : Routes.applicationCommands(clientId);

  await rest.put(route, { body: [command.toJSON()] });
  console.log(guildId ? `Registered /eco in guild ${guildId}` : "Registered global /eco command");
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

function actorFromUser(guildId, user) {
  return {
    id: `${guildId}:${user.id}`,
    name: user.globalName || user.username
  };
}

function canRunCommand(discordUserId, command) {
  const normalized = String(command || "").trim().toLowerCase();
  const restricted =
    normalized.startsWith("house profile") ||
    normalized.startsWith("house set") ||
    normalized.startsWith("釘 profile") ||
    normalized.startsWith("釘 set") ||
    normalized.startsWith("casino-config profile") ||
    normalized.startsWith("casino-config set");
  if (!restricted) return true;
  if (adminUserIds.size === 0) return true;
  return adminUserIds.has(discordUserId);
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
        inviter: invite.inviter || null
      });
    }
    inviteCache.set(guild.id, cache);
    return cache;
  } catch (error) {
    console.warn(`Invite cache skipped for ${guild.name}: ${error.message}`);
    return null;
  }
}

async function detectUsedInvite(guild) {
  const before = inviteCache.get(guild.id) || new Map();
  const after = await refreshInviteCache(guild);
  if (!after) return null;

  for (const invite of after.values()) {
    const previous = before.get(invite.code);
    if (previous && invite.uses > previous.uses) return invite;
    if (!previous && invite.uses > 0) return invite;
  }

  return null;
}

async function replyDiscord(interaction, result) {
  const embed = buildEmbed(result);
  const components = buildComponents(result);
  if (embed) {
    await interaction.reply({ embeds: [embed], components });
    return;
  }

  const chunks = chunkDiscord(formatDiscord(result));
  await interaction.reply({ content: chunks[0], components });
  for (const chunk of chunks.slice(1)) {
    await interaction.followUp({ content: chunk });
  }
}

async function updateDiscord(interaction, result) {
  const embed = buildEmbed(result);
  const components = buildComponents(result, { fallback: true });
  if (embed) {
    await interaction.update({ content: "", embeds: [embed], components });
    return;
  }

  const chunks = chunkDiscord(formatDiscord(result));
  await interaction.update({ content: chunks[0], embeds: [], components });
  for (const chunk of chunks.slice(1)) {
    await interaction.followUp({ content: chunk, ephemeral: true });
  }
}

async function sendResult(channel, result) {
  const embed = buildEmbed(result);
  const components = buildComponents(result);
  if (embed) {
    await channel.send({ embeds: [embed], components });
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
    console.warn(`Failed to send log: ${error.message}`);
  }
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

      const result = engine.claimVoiceReward(user, { silent: true });
      if (result && !result.noop) changed = true;
    }

    if (changed) store.save(engine.state);
  }, intervalMs).unref?.();
}

function formatDiscord(result) {
  return formatResult(result).replace(/^◆ /, "**◆ ").replace(/^◇ /, "**◇ ").replace(/\n/, "**\n");
}

function buildEmbed(result) {
  if (result.panel) return buildPanelEmbed(result);
  if (!result.card) return null;
  const embed = new EmbedBuilder()
    .setTitle(result.card.title || result.title)
    .setColor(result.card.color || 0x64748b);

  if (result.card.description) embed.setDescription(result.card.description);
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

  if (Array.isArray(panel.fields)) {
    embed.addFields(
      panel.fields.map((field) => ({
        name: field.name,
        value: field.value || "-",
        inline: Boolean(field.inline)
      }))
    );
  }

  embed.setFooter({ text: "Panel-first UI / commands still work under the hood" });
  return embed;
}

function buildComponents(result, options = {}) {
  const panel = result.panel;
  if (!panel?.components) return options.fallback ? fallbackComponents() : [];

  return panel.components.slice(0, 5).map((component, rowIndex) => {
    const row = new ActionRowBuilder();
    if (component.type === "buttons") {
      row.addComponents(
        component.items.slice(0, 5).map((item, index) => {
          const customId = item.kind === "panel"
            ? `eco:panel:${item.panel}`
            : `eco:run:${item.command}`;
          return new ButtonBuilder()
            .setCustomId(customId.slice(0, 100))
            .setLabel(item.label || `Action ${rowIndex}-${index}`)
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

    return row;
  });
}

function fallbackComponents() {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("eco:panel:home").setLabel("ホーム").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("eco:panel:casino").setLabel("カジノ").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("eco:panel:market").setLabel("市場").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("eco:panel:rpg").setLabel("RPG").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("eco:run:card").setLabel("カード").setStyle(ButtonStyle.Secondary)
  );
  return [row];
}

function commandFromComponent(interaction) {
  if (interaction.isButton()) {
    const parts = interaction.customId.split(":");
    if (parts[1] === "panel") return `panel ${parts.slice(2).join(":")}`;
    if (parts[1] === "run") return parts.slice(2).join(":");
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
