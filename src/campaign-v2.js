"use strict";

const path = require("path");

const CAMPAIGN_SCHEMA_VERSION = 2;
const HISTORY_LIMIT = 8;
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;
const DEFAULT_SETTINGS = Object.freeze({
  joinRewardRis: 1000,
  retentionHours: 24,
  retentionRewardRis: 2000,
  retentionTicketReward: 1,
  vcMinutesRequired: 15,
  vcTicketReward: 1,
  invitedUserJoinBonusRis: 1000,
  invitedUserVcBonusRis: 1000,
  shopViewBonusRis: 0
});

function clampNonNegative(value) {
  const number = Math.floor(Number(value) || 0);
  return number > 0 ? number : 0;
}

function validDate(value) {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function fmt(value) {
  return `${Math.floor(Number(value) || 0).toLocaleString("ja-JP")} Ris`;
}

function discordTime(value, style = "f") {
  const date = validDate(value);
  if (!date) return "-";
  return `<t:${Math.floor(date.getTime() / 1000)}:${style}>`;
}

function runButton(label, command, style = "secondary", disabled = false) {
  return { kind: "run", label, command, style, disabled: Boolean(disabled) };
}

function panelButton(label, panel, style = "secondary", disabled = false) {
  return { kind: "panel", label, panel, style, disabled: Boolean(disabled) };
}

function buttons(items) {
  return { type: "buttons", items: items.filter(Boolean).slice(0, 5) };
}

function panelResult(panel) {
  return {
    ok: true,
    title: panel.title,
    lines: [
      panel.description || panel.title,
      ...(panel.fields || []).map((field) => `${field.name}: ${String(field.value || "-").replace(/\n/g, " / ")}`)
    ],
    panel
  };
}

function normalizeSettings(settings = {}) {
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    joinRewardRis: clampNonNegative(settings.joinRewardRis ?? DEFAULT_SETTINGS.joinRewardRis),
    retentionHours: Math.max(1, clampNonNegative(settings.retentionHours ?? DEFAULT_SETTINGS.retentionHours)),
    retentionRewardRis: clampNonNegative(settings.retentionRewardRis ?? DEFAULT_SETTINGS.retentionRewardRis),
    retentionTicketReward: clampNonNegative(settings.retentionTicketReward ?? DEFAULT_SETTINGS.retentionTicketReward),
    vcMinutesRequired: Math.max(1, clampNonNegative(settings.vcMinutesRequired ?? DEFAULT_SETTINGS.vcMinutesRequired)),
    vcTicketReward: clampNonNegative(settings.vcTicketReward ?? DEFAULT_SETTINGS.vcTicketReward),
    invitedUserJoinBonusRis: clampNonNegative(settings.invitedUserJoinBonusRis ?? DEFAULT_SETTINGS.invitedUserJoinBonusRis),
    invitedUserVcBonusRis: clampNonNegative(settings.invitedUserVcBonusRis ?? DEFAULT_SETTINGS.invitedUserVcBonusRis),
    shopViewBonusRis: 0
  };
}

function normalizeUserCampaign(user) {
  if (!user || typeof user !== "object") return null;
  const current = user.inviteCampaign && typeof user.inviteCampaign === "object" ? user.inviteCampaign : {};
  user.inviteCampaign = {
    ...current,
    tickets: clampNonNegative(current.tickets),
    ticketsEarned: clampNonNegative(current.ticketsEarned),
    risEarned: clampNonNegative(current.risEarned),
    milestonesLogged: Array.isArray(current.milestonesLogged) ? current.milestonesLogged : [],
    seasonMilestonesLogged: Array.isArray(current.seasonMilestonesLogged) ? current.seasonMilestonesLogged : []
  };
  return user.inviteCampaign;
}

function normalizeStats(stats = {}) {
  return {
    invited: clampNonNegative(stats.invited),
    retained: clampNonNegative(stats.retained),
    vcQualified: clampNonNegative(stats.vcQualified),
    ticketsEarned: clampNonNegative(stats.ticketsEarned),
    risEarned: clampNonNegative(stats.risEarned)
  };
}

function normalizeEntry(entry = {}, inviteeId = null) {
  const rewardsPaid = entry.rewardsPaid || {};
  const qualifiedAt = entry.qualifiedAt || entry.economyJoinedAt || (rewardsPaid.join ? entry.joinedAt : null);
  return {
    inviterId: entry.inviterId || null,
    inviterName: entry.inviterName || "",
    invitedUserId: entry.invitedUserId || inviteeId || null,
    invitedUserName: entry.invitedUserName || "",
    attributedAt: entry.attributedAt || entry.joinedAt || null,
    joinedAt: entry.joinedAt || entry.attributedAt || null,
    qualifiedAt: qualifiedAt || null,
    retainedAt: entry.retainedAt || null,
    vcQualifiedAt: entry.vcQualifiedAt || null,
    leftAt: entry.leftAt || null,
    inviteCode: entry.inviteCode || null,
    vcMinutesAtJoin: Number.isFinite(Number(entry.vcMinutesAtJoin))
      ? Math.max(0, Number(entry.vcMinutesAtJoin))
      : (qualifiedAt ? 0 : null),
    disqualifiedReason: entry.disqualifiedReason || null,
    rewardsPaid: {
      join: Boolean(rewardsPaid.join),
      retention: Boolean(rewardsPaid.retention),
      vc: Boolean(rewardsPaid.vc),
      shopView: Boolean(rewardsPaid.shopView)
    }
  };
}

function ensureCampaignV2State(engine) {
  if (!engine?.state) return null;
  const existing = engine.state.inviteCampaign && typeof engine.state.inviteCampaign === "object"
    ? engine.state.inviteCampaign
    : {};
  if (existing.__irisCampaignV2Normalized) {
    existing.active = existing.status === "active";
    existing.settings = normalizeSettings(existing.settings);
    for (const user of Object.values(engine.state.users || {})) normalizeUserCampaign(user);
    return existing;
  }
  const legacyStatus = existing.active ? "active" : "idle";
  const status = ["idle", "active", "settling"].includes(existing.status) ? existing.status : legacyStatus;
  const startsAt = existing.startsAt || null;
  const seasonNumber = Math.max(startsAt ? 1 : 0, clampNonNegative(existing.seasonNumber));
  const seasonId = existing.seasonId || (startsAt ? `legacy-${String(startsAt).replace(/[^0-9]/g, "").slice(0, 14) || "season"}` : null);
  const campaign = {
    ...existing,
    schemaVersion: CAMPAIGN_SCHEMA_VERSION,
    baseName: String(existing.baseName || "IRIS招待キャンペーン").slice(0, 80),
    status,
    active: status === "active",
    seasonNumber,
    seasonId,
    name: existing.name || (seasonNumber ? `IRIS招待キャンペーン 第${seasonNumber}期` : "IRIS招待キャンペーン"),
    startsAt,
    endsAt: existing.endsAt || null,
    settlementEndsAt: existing.settlementEndsAt || null,
    settings: normalizeSettings(existing.settings),
    invitedUsers: {},
    userStats: {},
    logs: Array.isArray(existing.logs) ? existing.logs.slice(-100) : [],
    history: Array.isArray(existing.history) ? existing.history.slice(-HISTORY_LIMIT) : []
  };
  for (const [inviteeId, entry] of Object.entries(existing.invitedUsers || {})) {
    campaign.invitedUsers[inviteeId] = normalizeEntry(entry, inviteeId);
  }
  for (const [userId, stats] of Object.entries(existing.userStats || {})) {
    campaign.userStats[userId] = normalizeStats(stats);
  }
  if (campaign.status === "settling" && !campaign.settlementEndsAt && campaign.endsAt) {
    const end = validDate(campaign.endsAt);
    if (end) campaign.settlementEndsAt = new Date(end.getTime() + campaign.settings.retentionHours * 3600000).toISOString();
  }
  Object.defineProperty(campaign, "__irisCampaignV2Normalized", {
    value: true,
    writable: true,
    configurable: true,
    enumerable: false
  });
  engine.state.inviteCampaign = campaign;
  for (const user of Object.values(engine.state.users || {})) normalizeUserCampaign(user);
  return campaign;
}

function logCampaign(engine, event, message, data = {}) {
  const campaign = ensureCampaignV2State(engine);
  campaign.logs.push({ at: engine.now().toISOString(), event, message, data });
  campaign.logs = campaign.logs.slice(-100);
}

function campaignStatsFor(engine, userId) {
  const campaign = ensureCampaignV2State(engine);
  if (!campaign.userStats[userId]) campaign.userStats[userId] = normalizeStats();
  campaign.userStats[userId] = normalizeStats(campaign.userStats[userId]);
  return campaign.userStats[userId];
}

function addCampaignRis(engine, user, amount, note) {
  const value = clampNonNegative(amount);
  if (!user || value <= 0) return 0;
  const campaignUser = normalizeUserCampaign(user);
  user.wallet = clampNonNegative(user.wallet) + value;
  user.lifetimeEarned = clampNonNegative(user.lifetimeEarned) + value;
  campaignUser.risEarned += value;
  campaignStatsFor(engine, user.id).risEarned += value;
  if (typeof engine.log === "function") engine.log(user, "invite_campaign", value, note || ensureCampaignV2State(engine).name);
  return value;
}

function addCampaignTickets(engine, user, count, note) {
  const value = clampNonNegative(count);
  if (!user || value <= 0) return 0;
  const campaignUser = normalizeUserCampaign(user);
  campaignUser.tickets += value;
  campaignUser.ticketsEarned += value;
  campaignStatsFor(engine, user.id).ticketsEarned += value;
  if (typeof engine.log === "function") engine.log(user, "campaign_ticket", value, note || ensureCampaignV2State(engine).name);
  return value;
}

function campaignSummary(engine) {
  const campaign = ensureCampaignV2State(engine);
  const stats = Object.values(campaign.userStats || {});
  const entries = Object.values(campaign.invitedUsers || {});
  return {
    attributed: entries.length,
    qualified: entries.filter((entry) => entry.rewardsPaid.join).length,
    pendingJoin: entries.filter((entry) => !entry.rewardsPaid.join && !entry.disqualifiedReason).length,
    retained: stats.reduce((sum, entry) => sum + clampNonNegative(entry.retained), 0),
    vcQualified: stats.reduce((sum, entry) => sum + clampNonNegative(entry.vcQualified), 0),
    disqualified: entries.filter((entry) => entry.disqualifiedReason).length,
    totalTicketsIssued: stats.reduce((sum, entry) => sum + clampNonNegative(entry.ticketsEarned), 0),
    totalRisPaid: stats.reduce((sum, entry) => sum + clampNonNegative(entry.risEarned), 0)
  };
}

function archiveCurrentSeason(engine, reason = "finalized") {
  const campaign = ensureCampaignV2State(engine);
  if (!campaign.seasonId || campaign.history.some((entry) => entry.seasonId === campaign.seasonId)) return false;
  campaign.history.push({
    schemaVersion: CAMPAIGN_SCHEMA_VERSION,
    seasonId: campaign.seasonId,
    seasonNumber: campaign.seasonNumber,
    name: campaign.name,
    status: "finished",
    startsAt: campaign.startsAt,
    endsAt: campaign.endsAt,
    settlementEndsAt: campaign.settlementEndsAt,
    finalizedAt: engine.now().toISOString(),
    finalizeReason: reason,
    settings: clone(campaign.settings),
    summary: campaignSummary(engine),
    invitedUsers: clone(campaign.invitedUsers),
    userStats: clone(campaign.userStats),
    logs: clone(campaign.logs)
  });
  campaign.history = campaign.history.slice(-HISTORY_LIMIT);
  return true;
}

function finalizeCampaign(engine, reason = "settlement_complete") {
  const campaign = ensureCampaignV2State(engine);
  archiveCurrentSeason(engine, reason);
  campaign.status = "idle";
  campaign.active = false;
  campaign.settlementEndsAt = null;
  logCampaign(engine, "season_finalized", `${campaign.name} を確定しました。`, { reason });
  return true;
}

function retentionDueAt(entry, settings) {
  const qualified = validDate(entry.qualifiedAt);
  return qualified ? new Date(qualified.getTime() + settings.retentionHours * 3600000) : null;
}

function campaignTick(engine, options = {}) {
  const campaign = ensureCampaignV2State(engine);
  const now = validDate(engine.now()) || new Date();
  let changed = false;
  const awards = [];
  let finalized = false;
  if (["active", "settling"].includes(campaign.status)) {
    const settlementEnd = validDate(campaign.settlementEndsAt);
    const effectiveNow = campaign.status === "settling" && settlementEnd && now > settlementEnd ? settlementEnd : now;
    for (const entry of Object.values(campaign.invitedUsers || {})) {
      if (!entry.rewardsPaid.join || entry.rewardsPaid.retention || entry.disqualifiedReason) continue;
      const dueAt = retentionDueAt(entry, campaign.settings);
      if (!dueAt || dueAt > effectiveNow) continue;
      const leftAt = validDate(entry.leftAt);
      if (leftAt && leftAt < dueAt) {
        entry.disqualifiedReason = "left_before_retention";
        changed = true;
        continue;
      }
      const inviter = engine.state.users?.[entry.inviterId];
      if (!inviter || inviter.id === entry.invitedUserId) continue;
      addCampaignRis(engine, inviter, campaign.settings.retentionRewardRis, `Campaign ${campaign.seasonId} 24h: ${entry.invitedUserName}`);
      addCampaignTickets(engine, inviter, campaign.settings.retentionTicketReward, `Campaign ${campaign.seasonId} 24h: ${entry.invitedUserName}`);
      entry.retainedAt = now.toISOString();
      entry.rewardsPaid.retention = true;
      campaignStatsFor(engine, inviter.id).retained += 1;
      logCampaign(engine, "retention_paid", `${entry.invitedUserName} の24時間定着を確定しました。`, { inviterId: inviter.id });
      awards.push(entry);
      changed = true;
    }
  }
  if (campaign.status === "settling") {
    const settlementEnd = validDate(campaign.settlementEndsAt);
    if ((settlementEnd && now >= settlementEnd) || options.forceFinalize) {
      finalized = finalizeCampaign(engine, options.forceFinalize ? "forced" : "settlement_complete");
      changed = true;
    }
  }
  return { changed, awards, finalized, status: campaign.status };
}

function statusLabel(status) {
  if (status === "active") return "開催中";
  if (status === "settling") return "精算中";
  return "待機中";
}

function startSeason(engine, user) {
  const campaign = ensureCampaignV2State(engine);
  if (campaign.status === "active") return { ok: false, title: "開催中です", lines: ["現在のシーズンを終了してから開始してください。"], panel: engine.adminCampaignPanel(user) };
  if (campaign.status === "settling") return { ok: false, title: "精算中です", lines: ["精算期限後、または運営による確定後に次のシーズンを開始できます。"], panel: engine.adminCampaignPanel(user) };
  if (campaign.seasonId) archiveCurrentSeason(engine, "new_season_started");
  const now = validDate(engine.now()) || new Date();
  const seasonNumber = Math.max(0, campaign.seasonNumber) + 1;
  campaign.seasonNumber = seasonNumber;
  campaign.seasonId = `season-${seasonNumber}-${now.toISOString().replace(/[^0-9]/g, "").slice(0, 12)}`;
  campaign.name = `${campaign.baseName} 第${seasonNumber}期`;
  campaign.status = "active";
  campaign.active = true;
  campaign.startsAt = now.toISOString();
  campaign.endsAt = null;
  campaign.settlementEndsAt = null;
  campaign.invitedUsers = {};
  campaign.userStats = {};
  campaign.logs = [];
  for (const member of Object.values(engine.state.users || {})) normalizeUserCampaign(member).seasonMilestonesLogged = [];
  logCampaign(engine, "season_started", `${user?.name || "運営"} が ${campaign.name} を開始しました。`);
  return { ok: true, title: "キャンペーンを開始しました", lines: [`${campaign.name} を開始しました。`, "過去のCampaign Ticketは保持されています。"], panel: engine.adminCampaignPanel(user) };
}

function stopSeason(engine, user) {
  const campaign = ensureCampaignV2State(engine);
  if (campaign.status !== "active") return { ok: false, title: "開催中ではありません", lines: [`現在は${statusLabel(campaign.status)}です。`], panel: engine.adminCampaignPanel(user) };
  const now = validDate(engine.now()) || new Date();
  campaign.status = "settling";
  campaign.active = false;
  campaign.endsAt = now.toISOString();
  campaign.settlementEndsAt = new Date(now.getTime() + campaign.settings.retentionHours * 3600000).toISOString();
  logCampaign(engine, "season_stopped", `${user?.name || "運営"} が受付を終了しました。`, { settlementEndsAt: campaign.settlementEndsAt });
  campaignTick(engine);
  return {
    ok: true,
    title: "受付を終了し、精算へ移行しました",
    lines: ["新しい招待受付は終了しました。", `既存対象者の24時間定着・VC判定は ${discordTime(campaign.settlementEndsAt)} まで継続します。`],
    panel: engine.adminCampaignPanel(user)
  };
}

function startConfirmationPanel(engine) {
  const campaign = ensureCampaignV2State(engine);
  return {
    title: "新しい招待キャンペーンを開始しますか？",
    description: "前回シーズンの成績は履歴へ保存し、参加記録とランキングを新しくします。Campaign Ticket残高は消えません。",
    color: 0x16a34a,
    fields: [
      { name: "次のシーズン", value: `第${campaign.seasonNumber + 1}期`, inline: true },
      { name: "参加報酬", value: `招待者 ${fmt(campaign.settings.joinRewardRis)} / 新規 ${fmt(campaign.settings.invitedUserJoinBonusRis)}`, inline: true },
      { name: "定着・VC", value: `${campaign.settings.retentionHours}時間定着 / VC ${campaign.settings.vcMinutesRequired}分`, inline: false },
      { name: "重要", value: "招待報酬は、招待された人が参加ボタンで経済圏へ参加した時点に支給します。", inline: false }
    ],
    components: [buttons([runButton("開始する", "campaign start", "success"), panelButton("やめる", "admin-campaign")])]
  };
}

function stopConfirmationPanel(engine) {
  const campaign = ensureCampaignV2State(engine);
  const settlementAt = new Date((validDate(engine.now()) || new Date()).getTime() + campaign.settings.retentionHours * 3600000);
  return {
    title: "キャンペーン受付を終了しますか？",
    description: "新しい招待の受付だけを止め、既に対象となった人の定着・VC判定は精算期限まで継続します。",
    color: 0xf59e0b,
    fields: [
      { name: "現在", value: campaign.name, inline: true },
      { name: "精算期限", value: discordTime(settlementAt), inline: true },
      { name: "Ticket", value: "既に獲得したCampaign Ticketは保持されます。", inline: false }
    ],
    components: [buttons([runButton("受付を終了する", "campaign stop", "danger"), panelButton("やめる", "admin-campaign")])]
  };
}

function forceFinalizeConfirmationPanel(engine) {
  const campaign = ensureCampaignV2State(engine);
  return {
    title: "精算を今すぐ確定しますか？",
    description: "未達成の24時間定着・VC判定を打ち切ってシーズンを確定します。通常は精算期限まで待ってください。",
    color: 0xdc2626,
    fields: [
      { name: "シーズン", value: campaign.name, inline: true },
      { name: "本来の精算期限", value: discordTime(campaign.settlementEndsAt), inline: true },
      { name: "注意", value: "確定後に未達成者へ追加報酬は支給されません。", inline: false }
    ],
    components: [buttons([runButton("今すぐ確定", "campaign admin-finalize", "danger"), panelButton("やめる", "admin-campaign")])]
  };
}

function installStoreCapture(storageModule) {
  const storage = storageModule || require("./storage");
  const Store = storage.JsonStore;
  if (!Store?.prototype || Store.prototype.__irisCampaignV2CaptureInstalled) return;
  const originalLoad = Store.prototype.load;
  Store.prototype.load = function irisCampaignV2TrackedLoad(...args) {
    const loaded = originalLoad.apply(this, args);
    if (path.basename(String(this.filePath || "")) === "discord-state.json") {
      global.__IRIS_CAMPAIGN_V2_STORE_CONTEXT__ = { store: this, loadedState: loaded };
    }
    return loaded;
  };
  Store.prototype.__irisCampaignV2CaptureInstalled = true;
}

function attachCampaignSweeper(engine, inputState) {
  const context = global.__IRIS_CAMPAIGN_V2_STORE_CONTEXT__;
  if (!context || context.loadedState !== inputState || !context.store) return;
  delete global.__IRIS_CAMPAIGN_V2_STORE_CONTEXT__;
  engine.__irisCampaignV2Store = context.store;
  const sweep = () => {
    try {
      const result = engine.campaignTick();
      if (result.changed) {
        context.store.save(engine.state);
        console.log(`[campaign-v2] settlement sweep saved (${result.status}${result.finalized ? ", finalized" : ""})`);
      }
    } catch (error) {
      console.warn(`[campaign-v2] settlement sweep failed: ${error.message}`);
    }
  };
  const initialTimer = setTimeout(sweep, 30_000);
  initialTimer.unref?.();
  const timer = setInterval(sweep, SWEEP_INTERVAL_MS);
  timer.unref?.();
  engine.__irisCampaignV2SweepTimer = timer;
}

function installCampaignV2(economyModule, storageModule) {
  const economy = economyModule || require("./economy");
  const BaseEngine = economy.EconomyEngine;
  if (!BaseEngine?.prototype) return null;
  if (BaseEngine.__irisCampaignV2Installed) return BaseEngine;
  installStoreCapture(storageModule);
  const originalJoin = BaseEngine.prototype.join;
  const originalMarketplacePanel = BaseEngine.prototype.marketplacePanel;

  class CampaignV2Engine extends BaseEngine {
    constructor(state, options = {}) {
      super(state, options);
      ensureCampaignV2State(this);
      attachCampaignSweeper(this, state);
    }
    campaignStatsFor(userId) { return campaignStatsFor(this, userId); }
    campaignSummary() { return campaignSummary(this); }
    addCampaignRis(user, amount, note) { return addCampaignRis(this, user, amount, note); }
    addCampaignTickets(user, amount, note) { return addCampaignTickets(this, user, amount, note); }
    campaignLog(event, message, data = {}) { return logCampaign(this, event, message, data); }
    campaignTick(options = {}) { return campaignTick(this, options); }
    evaluateCampaignRetention() { return this.campaignTick().awards; }
    startInviteCampaign(user) { return startSeason(this, user); }
    stopInviteCampaign(user) { return stopSeason(this, user); }
    resetInviteCampaign(user) {
      return { ok: false, title: "一括リセットは廃止しました", lines: ["Campaign Ticketや支給済みRisを誤って消さないため、シーズン単位の開始・終了・履歴保存へ変更しました。"], panel: this.adminCampaignPanel(user) };
    }
    campaignResetConfirmPanel(user) { return this.adminCampaignPanel(user); }

    campaignCommand(user, args = []) {
      const action = String(args[0] || "status").toLowerCase();
      if (["status", "me", "progress"].includes(action)) return panelResult(this.campaignStatusPanel(user));
      if (["leaderboard", "rank", "ranking"].includes(action)) return panelResult(this.campaignLeaderboardPanel(user));
      if (["shop", "store"].includes(action)) return panelResult(this.campaignShopPanel(user));
      if (["admin", "manage"].includes(action)) return panelResult(this.adminCampaignPanel(user));
      if (action === "start-confirm") return panelResult(startConfirmationPanel(this));
      if (action === "start") return this.startInviteCampaign(user);
      if (action === "stop-confirm") return panelResult(stopConfirmationPanel(this));
      if (action === "stop") return this.stopInviteCampaign(user);
      if (action === "pending") return panelResult(this.campaignPendingPanel(user));
      if (action === "admin-history") return panelResult(this.campaignHistoryPanel(user));
      if (action === "admin-finalize-confirm") return panelResult(forceFinalizeConfirmationPanel(this));
      if (action === "admin-finalize") {
        const campaign = ensureCampaignV2State(this);
        if (campaign.status !== "settling") return { ok: false, title: "精算中ではありません", lines: ["今すぐ確定できるシーズンはありません。"], panel: this.adminCampaignPanel(user) };
        this.campaignTick({ forceFinalize: true });
        return { ok: true, title: "シーズンを確定しました", lines: ["未達成の判定を打ち切り、履歴へ保存しました。"], panel: this.adminCampaignPanel(user) };
      }
      if (action === "reset" || action === "reset-confirm") return this.resetInviteCampaign(user);
      return panelResult(this.campaignStatusPanel(user));
    }

    recordCampaignInviteJoin(inviter, invitee, meta = {}) {
      const campaign = ensureCampaignV2State(this);
      normalizeUserCampaign(inviter);
      normalizeUserCampaign(invitee);
      if (campaign.status !== "active") return null;
      if (!inviter?.id || !invitee?.id || inviter.id === invitee.id || meta.bot || invitee.joined || campaign.invitedUsers[invitee.id]) return null;
      const now = this.now().toISOString();
      const entry = normalizeEntry({ inviterId: inviter.id, inviterName: inviter.name, invitedUserId: invitee.id, invitedUserName: invitee.name, attributedAt: now, joinedAt: now, inviteCode: meta.code || null }, invitee.id);
      campaign.invitedUsers[invitee.id] = entry;
      logCampaign(this, "invite_attributed", `${inviter.name} の招待で ${invitee.name} が参加しました。参加ボタン待ちです。`, { inviterId: inviter.id, inviteeId: invitee.id });
      return entry;
    }

    activateCampaignInvite(user) {
      const campaign = ensureCampaignV2State(this);
      if (campaign.status !== "active") return null;
      const entry = campaign.invitedUsers[user.id];
      if (!entry || entry.rewardsPaid.join || entry.disqualifiedReason) return null;
      const inviter = this.state.users?.[entry.inviterId];
      if (!inviter || inviter.id === user.id) return null;
      const now = this.now().toISOString();
      entry.qualifiedAt = now;
      entry.vcMinutesAtJoin = Math.max(0, Number(user.activity?.vcMinutes) || 0);
      entry.rewardsPaid.join = true;
      campaignStatsFor(this, inviter.id).invited += 1;
      const inviterPaid = addCampaignRis(this, inviter, campaign.settings.joinRewardRis, `Campaign ${campaign.seasonId} join: ${user.name}`);
      const inviteePaid = addCampaignRis(this, user, campaign.settings.invitedUserJoinBonusRis, `Campaign ${campaign.seasonId} invited by: ${inviter.name}`);
      logCampaign(this, "invite_qualified", `${user.name} が参加ボタンを押し、キャンペーン対象になりました。`, { inviterId: inviter.id, inviterPaid, inviteePaid });
      return entry;
    }

    join(user) {
      const wasJoined = Boolean(user?.joined);
      const result = originalJoin.call(this, user);
      if (!wasJoined && user?.joined) {
        const entry = this.activateCampaignInvite(user);
        if (entry && Array.isArray(result?.lines)) result.lines.splice(1, 0, "招待キャンペーン参加報酬も支給されました。");
      }
      return result;
    }

    recordCampaignInviteLeave(invitee) {
      const campaign = ensureCampaignV2State(this);
      const entry = campaign.invitedUsers[invitee?.id];
      if (!entry) return;
      entry.leftAt = this.now().toISOString();
      if (!entry.rewardsPaid.join) entry.disqualifiedReason = "left_before_join";
      else {
        const dueAt = retentionDueAt(entry, campaign.settings);
        if (dueAt && validDate(entry.leftAt) < dueAt) entry.disqualifiedReason = "left_before_retention";
      }
      logCampaign(this, "invitee_left", `${entry.invitedUserName} が退出しました。`, { reason: entry.disqualifiedReason });
    }

    campaignInviteeLeft(invitedUserId) { return Boolean(ensureCampaignV2State(this).invitedUsers[invitedUserId]?.leftAt); }

    qualifyCampaignVc(user) {
      const campaign = ensureCampaignV2State(this);
      if (!["active", "settling"].includes(campaign.status)) return null;
      if (campaign.status === "settling") {
        const end = validDate(campaign.settlementEndsAt);
        if (end && this.now() > end) return null;
      }
      const entry = campaign.invitedUsers[user.id];
      if (!entry || !entry.rewardsPaid.join || entry.rewardsPaid.vc || entry.disqualifiedReason || entry.leftAt) return null;
      const baseline = Math.max(0, Number(entry.vcMinutesAtJoin) || 0);
      const current = Math.max(0, Number(user.activity?.vcMinutes) || 0);
      if (current - baseline < campaign.settings.vcMinutesRequired) return null;
      const inviter = this.state.users?.[entry.inviterId];
      if (!inviter || inviter.id === user.id) return null;
      addCampaignTickets(this, inviter, campaign.settings.vcTicketReward, `Campaign ${campaign.seasonId} VC: ${user.name}`);
      addCampaignRis(this, user, campaign.settings.invitedUserVcBonusRis, `Campaign ${campaign.seasonId} VC bonus: ${inviter.name}`);
      entry.vcQualifiedAt = this.now().toISOString();
      entry.rewardsPaid.vc = true;
      campaignStatsFor(this, inviter.id).vcQualified += 1;
      logCampaign(this, "vc_qualified", `${user.name} がキャンペーン参加後VC ${campaign.settings.vcMinutesRequired}分を達成しました。`, { inviterId: inviter.id });
      this.campaignLogActiveInviteMilestones(inviter);
      return entry;
    }

    claimCampaignShopViewBonus() { return 0; }

    campaignLogActiveInviteMilestones(inviter) {
      const stats = campaignStatsFor(this, inviter.id);
      const score = stats.retained + stats.vcQualified;
      const data = normalizeUserCampaign(inviter);
      for (const mark of [3, 5, 10]) {
        const key = `active_${mark}`;
        if (score >= mark && !data.seasonMilestonesLogged.includes(key)) {
          data.seasonMilestonesLogged.push(key);
          logCampaign(this, "milestone", `${inviter.name} が有効招待スコア ${mark} を達成しました。`, { inviterId: inviter.id, mark });
        }
      }
    }

    campaignNextMilestone(user) {
      const campaign = ensureCampaignV2State(this);
      if (campaign.status === "idle") return "現在開催中のキャンペーンはありません。";
      const entries = Object.values(campaign.invitedUsers || {}).filter((entry) => entry.inviterId === user.id && !entry.disqualifiedReason);
      const pendingJoin = entries.find((entry) => !entry.rewardsPaid.join);
      if (pendingJoin) return `${pendingJoin.invitedUserName} さんの参加ボタン待ち`;
      const pendingRetention = entries.find((entry) => !entry.rewardsPaid.retention);
      if (pendingRetention) return `${pendingRetention.invitedUserName} さんの24時間定着待ち`;
      const pendingVc = entries.find((entry) => !entry.rewardsPaid.vc);
      if (pendingVc) {
        const target = this.state.users?.[pendingVc.invitedUserId];
        const progress = Math.max(0, (Number(target?.activity?.vcMinutes) || 0) - (Number(pendingVc.vcMinutesAtJoin) || 0));
        return `${pendingVc.invitedUserName} さんのVC ${progress}/${campaign.settings.vcMinutesRequired}分`;
      }
      return campaign.status === "settling" ? "精算完了を待っています。" : "次の招待を待っています。";
    }

    campaignStatusPanel(user) {
      this.campaignTick();
      const campaign = ensureCampaignV2State(this);
      const stats = campaignStatsFor(this, user.id);
      const ticket = normalizeUserCampaign(user).tickets;
      const fields = [
        { name: "状態", value: statusLabel(campaign.status), inline: true },
        { name: "Campaign Ticket", value: `${ticket}枚`, inline: true }
      ];
      if (campaign.seasonId) {
        fields.push(
          { name: "シーズン", value: `${campaign.name}\n開始 ${discordTime(campaign.startsAt)}`, inline: false },
          { name: "あなたの成績", value: `成立 ${stats.invited} / 24時間定着 ${stats.retained} / VC達成 ${stats.vcQualified}`, inline: true },
          { name: "獲得", value: `Ticket ${stats.ticketsEarned}枚 / ${fmt(stats.risEarned)}`, inline: true },
          { name: "次の進捗", value: this.campaignNextMilestone(user), inline: false }
        );
      } else fields.push({ name: "案内", value: "次の開催まで待機中です。過去に獲得したCampaign Ticketは保持されています。", inline: false });
      if (campaign.status === "settling") fields.push({ name: "精算期限", value: discordTime(campaign.settlementEndsAt), inline: false });
      return {
        title: campaign.seasonId ? campaign.name : "招待キャンペーン",
        description: campaign.status === "active" ? "招待された人が参加ボタンを押した後、24時間定着とキャンペーン参加後のVC時間を判定します。" : campaign.status === "settling" ? "新規受付は終了しました。既存対象者だけ精算期限まで判定します。" : "現在開催中の招待キャンペーンはありません。",
        color: campaign.status === "active" ? 0x16a34a : campaign.status === "settling" ? 0xf59e0b : 0x64748b,
        fields,
        components: [buttons([runButton("ランキング", "campaign leaderboard", "primary", !campaign.seasonId), panelButton("貢献台帳", "invite"), panelButton("ホーム", "home")])]
      };
    }

    campaignLeaderboardPanel() {
      this.campaignTick();
      const campaign = ensureCampaignV2State(this);
      const rows = Object.entries(campaign.userStats || {})
        .map(([userId, stats]) => ({ userId, name: this.state.users?.[userId]?.name || "不明", ...normalizeStats(stats), score: clampNonNegative(stats.retained) + clampNonNegative(stats.vcQualified) }))
        .filter((row) => row.invited || row.retained || row.vcQualified || row.ticketsEarned)
        .sort((a, b) => b.score - a.score || b.retained - a.retained || b.vcQualified - a.vcQualified || b.invited - a.invited)
        .slice(0, 10);
      return {
        title: campaign.seasonId ? `${campaign.name} ランキング` : "キャンペーンランキング",
        description: "24時間定着とVC達成を同点扱いで集計し、単純な招待数だけでは順位を決めません。",
        color: 0x0f766e,
        fields: rows.length ? rows.map((row, index) => ({ name: `${index + 1}. ${row.name}`, value: `有効スコア ${row.score} / 成立 ${row.invited} / 定着 ${row.retained} / VC ${row.vcQualified} / Ticket ${row.ticketsEarned}`, inline: false })) : [{ name: "記録なし", value: "まだキャンペーン成立記録がありません。", inline: false }],
        components: [buttons([runButton("自分の状況", "campaign status", "success"), panelButton("貢献台帳", "invite"), panelButton("ホーム", "home")])]
      };
    }

    campaignShopPanel(user) {
      const ticket = normalizeUserCampaign(user).tickets;
      return {
        title: "Campaign Ticket",
        description: "交換商品が未整備のため、誤購入を防ぐ目的で交換機能は停止しています。Ticket残高は保持されます。",
        color: 0x64748b,
        fields: [
          { name: "所持", value: `${ticket}枚`, inline: true },
          { name: "現在", value: "交換停止中", inline: true },
          { name: "方針", value: "商品・在庫・交換履歴を安全に管理できる実装を追加するまで、閲覧だけ可能です。", inline: false }
        ],
        components: [buttons([runButton("キャンペーン状況", "campaign status"), panelButton("貢献台帳", "invite"), panelButton("ホーム", "home")])]
      };
    }

    adminCampaignPanel() {
      this.campaignTick();
      const campaign = ensureCampaignV2State(this);
      const summary = campaignSummary(this);
      const fields = [
        { name: "状態", value: statusLabel(campaign.status), inline: true },
        { name: "シーズン", value: campaign.seasonId ? `${campaign.name}\nID: ${campaign.seasonId}` : "未開催", inline: true },
        { name: "期間", value: campaign.seasonId ? `開始 ${discordTime(campaign.startsAt)}\n受付終了 ${discordTime(campaign.endsAt)}` : "-", inline: false },
        { name: "参加報酬", value: `招待者 ${fmt(campaign.settings.joinRewardRis)}\n新規 ${fmt(campaign.settings.invitedUserJoinBonusRis)}`, inline: true },
        { name: "24時間定着", value: `${fmt(campaign.settings.retentionRewardRis)} + Ticket ${campaign.settings.retentionTicketReward}枚`, inline: true },
        { name: "VC達成", value: `参加後 ${campaign.settings.vcMinutesRequired}分\n招待者 Ticket ${campaign.settings.vcTicketReward}枚 / 新規 ${fmt(campaign.settings.invitedUserVcBonusRis)}`, inline: true },
        { name: "集計", value: `招待検知 ${summary.attributed} / 成立 ${summary.qualified} / 参加待ち ${summary.pendingJoin}\n定着 ${summary.retained} / VC ${summary.vcQualified} / 対象外 ${summary.disqualified}`, inline: false },
        { name: "支給済み", value: `Ticket ${summary.totalTicketsIssued}枚 / ${fmt(summary.totalRisPaid)}`, inline: false }
      ];
      if (campaign.status === "settling") fields.splice(3, 0, { name: "精算期限", value: discordTime(campaign.settlementEndsAt), inline: false });
      const primary = campaign.status === "idle"
        ? buttons([runButton("新シーズン開始", "campaign start-confirm", "success"), runButton("履歴", "campaign admin-history"), panelButton("運営パネル", "admin")])
        : campaign.status === "active"
          ? buttons([runButton("受付を終了", "campaign stop-confirm", "danger"), runButton("参加者確認", "campaign pending", "primary"), runButton("ランキング", "campaign leaderboard"), runButton("履歴", "campaign admin-history"), panelButton("運営パネル", "admin")])
          : buttons([runButton("精算状況", "campaign pending", "primary"), runButton("今すぐ確定", "campaign admin-finalize-confirm", "danger"), runButton("ランキング", "campaign leaderboard"), runButton("履歴", "campaign admin-history"), panelButton("運営パネル", "admin")]);
      return {
        title: "招待キャンペーン管理",
        description: "シーズンごとに記録を分離し、受付終了後は定着判定のための精算期間へ移行します。Ticket残高はシーズンをまたいで保持します。",
        color: campaign.status === "active" ? 0x16a34a : campaign.status === "settling" ? 0xf59e0b : 0x334155,
        fields,
        components: [primary]
      };
    }

    campaignPendingPanel() {
      this.campaignTick();
      const campaign = ensureCampaignV2State(this);
      const entries = Object.values(campaign.invitedUsers || {})
        .filter((entry) => entry.disqualifiedReason || !entry.rewardsPaid.join || !entry.rewardsPaid.retention || !entry.rewardsPaid.vc)
        .sort((a, b) => new Date(b.attributedAt || 0) - new Date(a.attributedAt || 0))
        .slice(0, 10);
      const reasonLabel = { left_before_join: "参加前に退出", left_before_retention: "24時間前に退出" };
      return {
        title: "キャンペーン参加者・精算状況",
        description: "参加ボタン、24時間定着、キャンペーン参加後VC時間の進捗です。退出者は対象外として残します。",
        color: 0xf59e0b,
        fields: entries.length ? entries.map((entry) => {
          const target = this.state.users?.[entry.invitedUserId];
          const vcProgress = Math.max(0, (Number(target?.activity?.vcMinutes) || 0) - (Number(entry.vcMinutesAtJoin) || 0));
          return {
            name: entry.invitedUserName || entry.invitedUserId || "不明",
            value: entry.disqualifiedReason ? `招待者 ${entry.inviterName}\n対象外: ${reasonLabel[entry.disqualifiedReason] || entry.disqualifiedReason}` : `招待者 ${entry.inviterName}\n参加 ${entry.rewardsPaid.join ? "済" : "待ち"} / 24時間 ${entry.rewardsPaid.retention ? "済" : "待ち"} / VC ${entry.rewardsPaid.vc ? "済" : `${vcProgress}/${campaign.settings.vcMinutesRequired}分`}`,
            inline: false
          };
        }) : [{ name: "未処理なし", value: "表示対象の参加者はいません。", inline: false }],
        components: [buttons([panelButton("管理へ戻る", "admin-campaign", "primary"), runButton("ランキング", "campaign leaderboard"), panelButton("運営パネル", "admin")])]
      };
    }

    campaignHistoryPanel() {
      const campaign = ensureCampaignV2State(this);
      const history = [...campaign.history].reverse().slice(0, 5);
      return {
        title: "キャンペーン履歴",
        description: "確定済みシーズンの集計です。Campaign Ticket残高は履歴と別に保持されます。",
        color: 0x475569,
        fields: history.length ? history.map((entry) => ({ name: entry.name || entry.seasonId, value: `期間 ${discordTime(entry.startsAt, "d")}〜${discordTime(entry.endsAt, "d")}\n成立 ${entry.summary?.qualified || 0} / 定着 ${entry.summary?.retained || 0} / VC ${entry.summary?.vcQualified || 0} / Ticket ${entry.summary?.totalTicketsIssued || 0}`, inline: false })) : [{ name: "履歴なし", value: "まだ確定済みシーズンはありません。", inline: false }],
        components: [buttons([panelButton("管理へ戻る", "admin-campaign", "primary"), panelButton("運営パネル", "admin")])]
      };
    }

    contributionPanel(user) {
      const campaign = ensureCampaignV2State(this);
      const fields = [];
      if (["active", "settling"].includes(campaign.status)) {
        fields.push({
          name: campaign.status === "active" ? `${campaign.name} 開催中` : `${campaign.name} 精算中`,
          value: campaign.status === "active" ? "参加ボタン完了後に報酬対象となり、24時間定着と参加後VC時間を判定します。" : `新規受付は終了済み。精算期限 ${discordTime(campaign.settlementEndsAt)}。`,
          inline: false
        });
      }
      fields.push(
        { name: "招待階級", value: `${this.inviteRankLine(user)}\n成立 ${user.invites.qualified}人 / 累計報酬 ${fmt(user.invites.earned)}`, inline: true },
        { name: "Bump/Up階級", value: `${this.bumpRankLine(user)}\n累計 ${user.bump.count}回 / 累計報酬 ${fmt(user.bump.earned)}`, inline: true },
        { name: "通常報酬", value: `招待成立 ${fmt(this.inviteReward(user))} / Bump/Up ${fmt(this.bumpReward(user))}`, inline: false }
      );
      const campaignButtons = campaign.seasonId ? [runButton("キャンペーン状況", "campaign status", "success"), runButton("キャンペーン順位", "campaign leaderboard")] : [];
      return {
        title: "貢献台帳",
        description: "通常の招待・Bump/Up実績と、開催中の招待キャンペーンを確認します。",
        color: campaign.status === "active" ? 0x16a34a : 0x22c55e,
        fields,
        components: [
          buttons([...campaignButtons, runButton("招待状況", "invite", "success"), runButton("招待ランキング", "rank invite"), runButton("Bump/Upランキング", "rank bump", "primary")]),
          buttons([panelButton("ホーム", "home")])
        ]
      };
    }

    marketplacePanel(user) {
      const panel = originalMarketplacePanel.call(this, user);
      const campaign = ensureCampaignV2State(this);
      panel.fields = (panel.fields || []).filter((field) => field?.name !== "Campaign Shop" && field?.name !== "招待キャンペーン");
      panel.components = (panel.components || []).map((row) => {
        if (row?.type !== "buttons" || !Array.isArray(row.items)) return row;
        return { ...row, items: row.items.filter((item) => !String(item?.label || "").includes("Campaign") && !String(item?.command || "").startsWith("campaign")) };
      }).filter((row) => row?.type !== "buttons" || row.items.length > 0);
      if (["active", "settling"].includes(campaign.status)) {
        panel.fields.push({ name: "招待キャンペーン", value: `${campaign.name} / ${statusLabel(campaign.status)}\nTicket ${normalizeUserCampaign(user).tickets}枚`, inline: false });
        panel.components.push(buttons([runButton("キャンペーン状況", "campaign status", "success")]));
      }
      return panel;
    }
  }

  CampaignV2Engine.__irisCampaignV2Installed = true;
  CampaignV2Engine.prototype.__irisCampaignV2Installed = true;
  economy.EconomyEngine = CampaignV2Engine;
  return CampaignV2Engine;
}

module.exports = {
  CAMPAIGN_SCHEMA_VERSION,
  DEFAULT_SETTINGS,
  campaignSummary,
  campaignTick,
  ensureCampaignV2State,
  installCampaignV2,
  normalizeEntry,
  normalizeUserCampaign
};
