const CURRENCY = {
  code: "Ris",
  name: "Ris",
  issuer: "アイリス中央台帳"
};

const ECONOMY_CONFIG = {
  starterGrant: 100000
};

const SHOP_ITEMS = {
  chair: {
    name: "深座りの椅子",
    price: 1500,
    max: 1,
    kind: "passive",
    type: "権利",
    description: "労働報酬が少し増える。座ってるだけで偉そう。",
    effect: "労働報酬 +15%",
    usage: "持っているだけで自動発動"
  },
  stamp: {
    name: "常連カード",
    price: 1200,
    max: 1,
    kind: "passive",
    type: "権利",
    description: "毎日の受け取りに少し上乗せ。財布の底が少し厚くなる。",
    effect: "ログボ +250 Ris",
    usage: "持っているだけで自動発動"
  },
  coupon: {
    name: "くじ付き封筒",
    price: 300,
    max: 99,
    kind: "consumable",
    type: "アイテム",
    description: "開けるまで分からない。小遣いか、ため息か。",
    effect: "-450 〜 +700 Ris のランダム収支",
    usage: "`使う くじ付き封筒` で1個消費"
  },
  frame: {
    name: "黒金カード枠",
    price: 12000,
    max: 1,
    kind: "passive",
    type: "称号",
    description: "プロフィールに見栄を足す。強くはならない、でも見られる。",
    effect: "プロフィールカードに金枠を追加",
    usage: "所持中は自動で反映"
  },
  roompass: {
    name: "宿の増築券",
    price: 5000,
    max: 10,
    kind: "passive",
    type: "チケット",
    description: "宿の追加人数枠を1つ増やせるチケット。",
    effect: "二人宿の人数上限 +1（別途 5,000 Ris の増築費用は不要）",
    usage: "宿の管理パネルから消費（自動で使われます）"
  }
};

// 公式ショップで現在販売しているアイテムID。全商品撤去中のため空。
// SHOP_ITEMS の定義自体は、既存所持者のアイテム効果・表示・使用のために残している。
// 販売を再開する時はここにIDを追加する（例: ["coupon", "stamp"]）。
const OFFICIAL_SALE_ITEM_IDS = [];

function isOfficialItemOnSale(id) {
  return OFFICIAL_SALE_ITEM_IDS.includes(id) && Boolean(SHOP_ITEMS[id]);
}

function officialSaleEntries() {
  return OFFICIAL_SALE_ITEM_IDS.filter((id) => SHOP_ITEMS[id]).map((id) => [id, SHOP_ITEMS[id]]);
}

const MARKET_PRODUCT_TYPES = {
  role: "ロール",
  title: "称号",
  item: "アイテム",
  ticket: "チケット",
  right: "権利",
  service: "サービス",
  bundle: "セット商品"
};

const MARKET_SALE_MODES = {
  permanent: "買い切り",
  timed: "期間制"
};

const MARKETPLACE_CONFIG = {
  feeBps: 500,
  reviewPrice: 50000,
  maxActiveListings: 8,
  defaultDurationDays: 7,
  auctionExtendMinutes: 5
};

const CASINO_CONFIG = {
  maxPayoutMultiplier: 100,
  maxPayoutRis: 100000000
};

const WORKS = [
  { text: "自販機の下を金融街として再開発した", min: 90, max: 260, xp: 8 },
  { text: "会議で『それはレバレッジですね』だけ言い続けた", min: 120, max: 310, xp: 10 },
  { text: "レシートを見て宇宙の真理に近づいた", min: 80, max: 230, xp: 7 },
  { text: "社内通貨を勝手に発行して昼休みに上場した", min: 170, max: 420, xp: 14 },
  { text: "『雰囲気で決算を読む』講座を開いた", min: 140, max: 360, xp: 12 },
  { text: "空き箱をサブスク化して投資家をうならせた", min: 160, max: 390, xp: 13 },
  { text: "給与明細に励ましの付箋を貼る副業をした", min: 100, max: 270, xp: 9 }
];

const TEXT_RANKS = [
  { name: "観測者", min: 0 },
  { name: "発言者", min: 90 },
  { name: "会話設計士", min: 280 },
  { name: "文脈編集者", min: 720 },
  { name: "タイムライン統括", min: 1500 },
  { name: "言語圏の代表", min: 3200 }
];

const VC_RANKS = [
  { name: "入室者", min: 0 },
  { name: "傾聴者", min: 120 },
  { name: "雑談主任", min: 420 },
  { name: "会議進行役", min: 1100 },
  { name: "深夜VC責任者", min: 2600 },
  { name: "声のインフラ", min: 5600 }
];

const ECONOMY_RANKS = [
  { name: "未上場", min: 0 },
  { name: "個人商店", min: 1000 },
  { name: "流動性提供者", min: 7000 },
  { name: "地区銀行", min: 25000 },
  { name: "経済圏中枢", min: 80000 },
  { name: "アイリス財閥", min: 200000 }
];

const VOICE_REWARD_CONFIG = {
  kcPerMinute: 4,
  xpPerMinute: 6,
  levelXpBase: 120,
  salaryStepLevels: 10,
  salaryKcPerStep: 1,
  dailyCapBase: 1800,
  dailyCapPerLevel: 90,
  maxClaimMinutes: 240
};

const INN_CONFIG = {
  roomTtlCommands: 48,
  maxOpenRooms: 12
};

const INVITE_CONFIG = {
  inviteeBonus: 250,
  dailyPaidLimit: 4
};

const INVITE_CAMPAIGN_DEFAULTS = {
  name: "IRIS Invite Campaign: Welcome Week",
  settings: {
    joinRewardRis: 1000,
    retentionHours: 24,
    retentionRewardRis: 2000,
    retentionTicketReward: 1,
    vcMinutesRequired: 15,
    vcTicketReward: 1,
    invitedUserJoinBonusRis: 1000,
    invitedUserVcBonusRis: 1000,
    shopViewBonusRis: 500
  }
};

const INVITE_RANKS = [
  { name: "勧誘見習い", min: 0, reward: 900 },
  { name: "声かけ屋", min: 3, reward: 1300 },
  { name: "人脈師", min: 10, reward: 1900 },
  { name: "門番長", min: 20, reward: 2700 },
  { name: "アイリスの広告塔", min: 35, reward: 3800 },
  { name: "伝説の勧誘師", min: 50, reward: 5000 }
];

const BUMP_RANKS = [
  { name: "はじめての宣伝", min: 0, reward: 500 },
  { name: "常連宣伝員", min: 10, reward: 700 },
  { name: "広報担当", min: 30, reward: 900 },
  { name: "宣伝部長", min: 60, reward: 1200 },
  { name: "アイリスの拡声器", min: 100, reward: 1500 }
];

const CARD_STYLES = [
  {
    id: "civic",
    name: "市民",
    minScore: 0,
    color: 0x64748b,
    width: 54,
    layout: "compact",
    tagline: "初期台帳カード"
  },
  {
    id: "chrome",
    name: "クロム",
    minScore: 3,
    color: 0x0891b2,
    width: 60,
    layout: "split",
    tagline: "活動ランクカード"
  },
  {
    id: "aurum",
    name: "金帳",
    minScore: 6,
    color: 0xd97706,
    width: 64,
    layout: "ledger",
    tagline: "上位帳簿カード"
  },
  {
    id: "prism",
    name: "虹帳",
    minScore: 9,
    color: 0x7c3aed,
    width: 68,
    layout: "matrix",
    tagline: "複合ランク台帳"
  },
  {
    id: "black",
    name: "黒札",
    minScore: 12,
    color: 0x111827,
    width: 72,
    layout: "executive",
    tagline: "中央台帳の上位札"
  }
];

function createInitialState() {
  return {
    version: 4,
    currency: CURRENCY,
    commandCount: 0,
    users: {},
    marketplace: {
      nextListingId: 1,
      nextOrderId: 1,
      nextAuctionId: 1,
      shops: {},
      listings: [],
      orders: [],
      auctions: [],
      officialItems: {},
      officialFulfillment: [],
      officialRoleGrants: [],
      nextOfficialFulfillmentId: 1,
      logs: [],
      settings: {
        feeBps: MARKETPLACE_CONFIG.feeBps,
        reviewPrice: MARKETPLACE_CONFIG.reviewPrice,
        maxActiveListings: MARKETPLACE_CONFIG.maxActiveListings,
        auctionExtendMinutes: MARKETPLACE_CONFIG.auctionExtendMinutes
      }
    },
    invites: {
      totalTracked: 0,
      totalQualified: 0,
      totalPaid: 0,
      recent: []
    },
    inviteCampaign: createInviteCampaignState(),
    casino: createCasinoState(),
    inn: {
      nextId: 1,
      rooms: [],
      history: []
    },
    ledger: []
  };
}

class EconomyEngine {
  constructor(state, options = {}) {
    this.state = migrateState(state || createInitialState());
    this.now = options.now || (() => new Date());
    this.rng = options.rng || Math.random;
  }

  run(input, actor) {
    const user = this.getUser(actor.id, actor.name);
    const parsed = parseInput(input);

    if (!parsed.command) {
      return this.panel(user, "home");
    }

    this.state.commandCount += 1;

    let result;
    switch (parsed.command) {
      case "panel":
      case "home":
      case "menu":
      case "パネル":
        result = this.panel(user, parsed.args[0] || "home");
        break;
      case "join":
      case "start":
      case "参加":
        result = this.join(user);
        break;
      case "bal":
      case "balance":
      case "money":
      case "残高":
        result = this.balance(user);
        break;
      case "profile":
      case "me":
      case "プロフィール":
        result = this.profile(user);
        break;
      case "card":
      case "カード":
        result = this.playerCard(user, parsed.args[0] || "profile");
        break;
      case "ranks":
      case "rankcard":
      case "ランク":
        result = this.rankCard(user);
        break;
      case "invite":
      case "invites":
      case "招待":
        result = this.inviteReport(user);
        break;
      case "campaign":
      case "invite-campaign":
      case "キャンペーン":
        result = this.campaignCommand(user, parsed.args);
        break;
      case "help":
      case "h":
      case "commands":
      case "ヘルプ":
        result = this.help();
        break;
      case "daily":
      case "ログボ":
        result = this.daily(user);
        break;
      case "work":
      case "労働":
        result = this.work(user);
        break;
      case "subsidy":
      case "beg":
      case "給付金":
        result = this.subsidy(user);
        break;
      case "shop":
      case "店":
      case "ショップ":
      case "マーケット":
        result = this.marketplace(user);
        break;
      case "myshop":
      case "mystore":
      case "自分の店":
        result = this.myShop(user);
        break;
      case "marketplace":
      case "market-ui":
        result = this.marketplaceCommand(user, parsed.args);
        break;
      case "buy":
      case "買う":
        result = this.buyItem(user, parsed.args[0]);
        break;
      case "use":
      case "使う":
        result = this.useItem(user, parsed.args[0]);
        break;
      case "rank":
      case "leaderboard":
      case "ランキング":
        result = this.leaderboard(parsed.args[0]);
        break;
      case "lounge":
      case "通話":
        result = this.panel(user, "lounge");
        break;
      case "inn":
      case "yado":
      case "宿":
      case "二人宿":
        result = this.inn(user);
        break;
      case "vc":
      case "voice":
      case "claimvc":
      case "通話報酬":
        result = this.claimVoiceReward(user);
        break;
      case "simulate-text":
        result = this.simulateText(user, parsed.args[0]);
        break;
      case "simulate-vc":
        result = this.simulateVoice(user, parsed.args[0]);
        break;
      default:
        result = {
          ok: false,
          title: "未知の経済行為",
          lines: [
            `\`${parsed.command}\` は台帳に載ってません。`,
            "迷ったら `panel`。そこから押せます。"
          ]
        };
        break;
    }

    this.closeEndedAuctions();
    this.updateTitle(user);
    return result;
  }

  panel(user, panelIdRaw = "home") {
    const rawPanelId = String(panelIdRaw || "home").toLowerCase();
    const panelAliases = {
      "ホーム": "home",
      "通話": "lounge",
      "ラウンジ": "lounge",
      "宿": "inn",
      "二人宿": "inn",
      "店": "marketplace",
      "ショップ": "marketplace",
      "マーケット": "marketplace",
      "公式ショップ": "official-shop",
      "民営ショップ": "user-shops",
      "公式オークション": "official-auctions",
      "購入履歴": "market-inventory",
      "持ち物": "market-inventory",
      "自分の店": "my-shop",
      "出品": "my-listings",
      "売上": "my-sales",
      "ショップ管理": "market-admin",
      "マーケット管理": "market-admin",
      "招待": "invite",
      "貢献": "invite",
      "bump": "invite",
      "campaign": "campaign",
      "キャンペーン": "campaign",
      "campaign shop": "campaign-shop",
      "campaign-shop": "campaign-shop",
      "campaign管理": "admin-campaign",
      "管理": "admin",
      "運営": "admin"
    };
    const panelId = panelAliases[rawPanelId] || rawPanelId;
    const panels = {
      home: () => ({
        title: "アイリス",
        description: "財布、ランク、ショップ、通話。よく使うものだけ置いています。",
        color: 0x0f766e,
        fields: [
          { name: "今日の回し方", value: this.loopSuggestion(user), inline: false },
          { name: "財布", value: this.moneyLine(user), inline: true },
          { name: "ランク", value: `TCレベル ${this.textLevel(user)} / ${rankFor(TEXT_RANKS, user.activity.textXp).name}\nVCレベル ${this.vcLevel(user)} / ${rankFor(VC_RANKS, user.activity.vcXp).name}`, inline: true }
        ],
        components: [
          buttons([
            runButton("参加", "join", "success"),
            runButton("カード", "card", "primary"),
            runButton("ログボ", "daily", "success"),
            panelButton("ショップ", "marketplace", "primary"),
            panelButton("通話", "lounge")
          ]),
          buttons([
            panelButton("自分の店", "my-shop"),
            panelButton("貢献", "invite"),
            panelButton("通知設定", "notify")
          ]),
          select("行き先を選ぶ", [
            option("通話ラウンジ", "panel:lounge", "発言と通話ランク"),
            option("ショップ", "panel:marketplace", "買う、見る、入札する"),
            option("自分の店", "panel:my-shop", "出品、売上、取引管理"),
            option("貢献", "panel:invite", "招待とBumpの階級・報酬・ランキング"),
            option("通知設定", "panel:notify", "DM通知のON/OFF")
          ])
        ]
      }),
      shop: () => this.marketplacePanel(user),
      marketplace: () => this.marketplacePanel(user),
      "official-shop": () => this.officialShopPanel(user),
      "user-shops": () => this.userShopsPanel(user),
      "official-auctions": () => this.officialAuctionsPanel(user),
      "market-inventory": () => this.marketInventoryPanel(user),
      "my-shop": () => this.myShopPanel(user),
      "listing-new": () => this.listingNewPanel(user),
      "my-listings": () => this.myListingsPanel(user),
      "my-sales": () => this.mySalesPanel(user),
      "market-admin": () => this.marketAdminPanel(user),
      "official-product-admin": () => this.officialProductAdminPanel(user),
      "official-auction-admin": () => this.officialAuctionAdminPanel(user),
      "official-fulfillment": () => this.officialFulfillmentPanel(user),
      "market-review": () => this.marketReviewPanel(),
      "market-trades": () => this.marketTradesPanel(),
      "market-logs": () => this.marketLogsPanel(),
      "campaign": () => this.campaignStatusPanel(user),
      "campaign-shop": () => this.campaignShopPanel(user),
      "campaign-leaderboard": () => this.campaignLeaderboardPanel(user),
      "admin-campaign": () => this.adminCampaignPanel(user),
      "campaign-pending": () => this.campaignPendingPanel(user),
      "admin-balance": () => this.adminBalancePanel(user),
      "admin-rank": () => this.adminRankPanel(user),
      "search-results": () => this.searchResultsPanel(user),
      "notify": () => this.notifyPanel(user),
      lounge: () => ({
        title: "通話ラウンジ",
        description: "VC滞在時間と通常チャットの活動状況を確認できます。",
        color: 0x2563eb,
        fields: [
          { name: "VC", value: `ランク ${rankFor(VC_RANKS, user.activity.vcXp).name}\n${user.activity.vcMinutes}分 / 経験値 ${user.activity.vcXp}`, inline: true },
          { name: "VC報酬", value: this.voiceRewardLine(user), inline: true },
          { name: "発言", value: `ランク ${rankFor(TEXT_RANKS, user.activity.textXp).name}\n${user.activity.textMessages}発言 / 経験値 ${user.activity.textXp}`, inline: true },
          { name: "使い方", value: "VCに参加すると滞在時間が記録されます。必要な時にVC精算を押してください。", inline: false }
        ],
        components: [
          buttons([
            runButton("カード", "card", "primary"),
            runButton("VC精算", "vc", "success"),
            runButton("Text順位", "rank text"),
            runButton("VC順位", "rank vc")
          ]),
          select("ラウンジ操作", [
            option("VC報酬を受け取る", "run:vc", "在室分を途中精算"),
            option("プロフィールカード", "run:card", "今の見た目と総合ランク"),
            option("Textランキング", "run:rank text", "よく話す人ランキング"),
            option("VCランキング", "run:rank vc", "よく通話にいる人ランキング")
          ])
        ]
      }),
      inn: () => ({
        title: "🏨 二人宿",
        description: "一時的な通話部屋を発行します。\n公開宿は雑談用、シークレット宿は相手指定の密談用です。\n作成後、宿内の管理パネルから名前・人数・期限を調整できます。",
        color: 0x14b8a6,
        fields: [
          { name: "公開宿", value: "無料 / 通常VC / 雑談・待ち合わせ向け", inline: true },
          { name: "シークレット宿", value: "10,000 Ris / 自分と相手だけ / 個別通話・相談向け", inline: true },
          { name: "共通仕様", value: "基本2人 / 12時間で自動終了 / 1人1部屋まで", inline: false },
          { name: "追加・延長", value: "人数追加 5,000 Ris / 延長は宿内パネルから", inline: false }
        ],
        components: [
          buttons([
            runButton("公開宿を作る", "create-yado-vc", "primary"),
            runButton("シークレット宿を作る", "choose-secret-yado", "danger")
          ])
        ]
      }),
      admin: () => ({
        title: "運営パネル",
        description: "運営機能を目的別のサブパネルに分けています。",
        color: 0x334155,
        fields: [
          { name: "ショップ管理", value: "公式商品、審査、取引対応、公式オークション", inline: true },
          { name: "残高操作", value: "個人セット/加算/減算、ロール一括セット、給与配布（一括加算）", inline: true },
          { name: "ランク設定", value: "昇格通知先の指定、ランク確認パネルの設置", inline: true },
          { name: "Invite Campaign", value: "定期開催型の招待キャンペーン管理", inline: true },
          { name: "パネル送信", value: "住民向けの常設パネルをこのチャンネルへ送信できます。", inline: false }
        ],
        components: [
          buttons([
            panelButton("ショップ管理", "market-admin", "primary"),
            panelButton("残高操作", "admin-balance", "success"),
            panelButton("ランク設定", "admin-rank"),
            panelButton("Campaign管理", "admin-campaign"),
            customButton("常設ショップ送信", "eco:market:post-panel"),
            panelButton("ホーム", "home")
          ]),
          select("公開したいパネル", [
            option("ホーム", "panel:home", "入口"),
            option("ショップ", "panel:marketplace", "買う側の入口"),
            option("自分の店", "panel:my-shop", "売る側の入口"),
            option("ショップ管理", "panel:market-admin", "公式商品、審査、取引対応"),
            option("Campaign管理", "panel:admin-campaign", "IRIS Invite Campaign"),
            option("二人宿", "panel:inn", "2人用VC作成パネル"),
            option("招待", "panel:invite", "招待台帳")
          ])
        ]
      }),
      invite: () => this.contributionPanel(user)
    };

    const panel = (panels[panelId] || panels.home)();
    const lines = [
      panel.description,
      "",
      ...panel.fields.map((field) => `${field.name}: ${field.value.replace(/\n/g, " / ")}`),
      "",
      "Discordではボタンとセレクトで操作できます。"
    ];

    return {
      ok: true,
      title: panel.title,
      lines,
      panel
    };
  }

  help() {
    return {
      ok: true,
      title: `${CURRENCY.name} 経済圏ヘルプ`,
      lines: [
        "Discordでは `/ショップ`, `/自分の店`, `/管理` からショップを操作します。",
        "`panel` - ホームパネル",
        "`panel lounge` - 発言/通話パネル",
        "`panel inn` - 二人宿パネル（運営用）",
        "`panel marketplace` - ショップ",
        "`panel my-shop` - 自分の店",
        "`panel invite` - 招待台帳",
        "`daily` / `work` / `subsidy` - 収入コマンド",
        "`card` / `invite` - 直接見たい時だけ使う短縮コマンド"
      ]
    };
  }

  join(user) {
    if (user.joined) {
      return {
        ok: true,
        title: "もう住民です",
        lines: [`${user.name} はすでに ${CURRENCY.name} 経済圏の空気を吸っています。`, this.moneyLine(user)]
      };
    }

    user.joined = true;
    const grant = ECONOMY_CONFIG.starterGrant;
    user.wallet += grant;
    user.lifetimeEarned += grant;
    this.log(user, "join", grant, "初期資本");
    const inviteBonus = this.qualifyInvite(user);

    return {
      ok: true,
      title: `${CURRENCY.name} 経済圏へようこそ`,
      lines: [
        `${user.name} は初期資本 ${fmt(grant)} を受け取りました。`,
        inviteBonus ? `招待成立: ${inviteBonus.inviter.name} に ${fmt(inviteBonus.reward)}、あなたに ${fmt(inviteBonus.inviteeBonus)}。` : null,
        "各パネルから機能を利用できます。",
        this.moneyLine(user)
      ].filter(Boolean),
      inviteRankUp: inviteBonus?.rankUp || null,
      inviterId: inviteBonus?.inviter?.id || null
    };
  }

  balance(user) {
    return {
      ok: true,
      title: `${user.name} の残高`,
      lines: [
        `財布: ${fmt(user.wallet)}`,
        `純資産: ${fmt(Math.floor(this.netWorth(user)))}`,
        `経済ランク: ${rankFor(ECONOMY_RANKS, this.netWorth(user)).name}`
      ]
    };
  }

  resolveCasinoUser(guildId, discordUserId) {
    return this.resolveCasinoUserRecord(guildId, discordUserId).user || null;
  }

  resolveCasinoUserRecord(guildId, discordUserId) {
    if (!isDiscordSnowflake(guildId)) {
      return { user: null, error: { ok: false, code: "INVALID_GUILD_ID", status: 400, message: "guildId must be a Discord Snowflake" } };
    }
    if (!isDiscordSnowflake(discordUserId)) {
      return { user: null, error: { ok: false, code: "INVALID_DISCORD_USER_ID", status: 400, message: "discordUserId must be a Discord Snowflake" } };
    }
    const user = this.state.users[`${guildId}:${discordUserId}`];
    if (!user) return { user: null, error: { ok: false, code: "USER_NOT_FOUND", status: 404, message: "wallet user not found" } };
    if (user.joined !== true) return { user: null, error: { ok: false, code: "ECONOMY_NOT_JOINED", status: 403, message: "economy join is required" } };
    return { user };
  }

  casinoWallet(guildId, discordUserId) {
    const resolved = this.resolveCasinoUserRecord(guildId, discordUserId);
    const user = resolved.user;
    if (!user) {
      return resolved.error;
    }
    return {
      ok: true,
      discordUserId: String(discordUserId),
      userId: user.id,
      name: user.name,
      wallet: user.wallet,
      currency: CURRENCY.code
    };
  }

  reserveCasinoBet(data = {}, guildId, limits = {}) {
    const normalized = this.normalizeCasinoReservation(data, guildId, limits);
    if (!normalized.ok) return normalized;
    const { transactionId, discordUserId, sessionId, game, bet } = normalized;
    const existing = this.state.casino.transactions[transactionId];
    if (existing) {
      const scoped = this.scopedCasinoTransaction(existing, guildId);
      if (!scoped.ok) return scoped;
      return this.idempotentCasinoReservation(existing, normalized);
    }

    const resolved = this.resolveCasinoUserRecord(guildId, discordUserId);
    const user = resolved.user;
    if (!user) {
      return resolved.error;
    }
    const currentWalletCheck = this.nextCasinoWallet(user, 0);
    if (!currentWalletCheck.ok) return currentWalletCheck;
    if (user.wallet < bet) {
      return { ok: false, code: "INSUFFICIENT_FUNDS", status: 409, message: "insufficient wallet balance", wallet: user.wallet, bet };
    }
    const walletCheck = this.nextCasinoWallet(user, -bet);
    if (!walletCheck.ok) return walletCheck;

    user.wallet = walletCheck.wallet;
    const now = this.now().toISOString();
    const transaction = {
      transactionId,
      discordUserId,
      userId: user.id,
      userName: user.name,
      sessionId,
      game,
      bet,
      status: "reserved",
      payout: null,
      createdAt: now,
      reservedAt: now,
      settledAt: null,
      cancelledAt: null
    };
    this.state.casino.transactions[transactionId] = transaction;
    this.log(user, "casino_reserve", -bet, `${game} / ${sessionId} / ${transactionId}`);
    return { ok: true, status: 201, changed: true, transaction: this.publicCasinoTransaction(transaction), wallet: user.wallet };
  }

  settleCasinoReservation(transactionIdRaw, data = {}, guildId, limits = {}) {
    const transactionId = cleanToken(transactionIdRaw, 120);
    if (!transactionId) return { ok: false, code: "INVALID_TRANSACTION_ID", status: 400, message: "transactionId is required" };
    const transaction = this.state.casino.transactions[transactionId];
    if (!transaction) return { ok: false, code: "TRANSACTION_NOT_FOUND", status: 404, message: "transaction not found" };
    const scoped = this.scopedCasinoTransaction(transaction, guildId);
    if (!scoped.ok) return scoped;
    const payout = parseIntegerField(data.payout);
    if (!Number.isSafeInteger(payout) || payout < 0) {
      return { ok: false, code: "INVALID_PAYOUT", status: 400, message: "payout must be a non-negative integer" };
    }
    const cap = this.casinoPayoutCap(transaction.bet, limits);
    if (payout > cap) {
      return { ok: false, code: "PAYOUT_TOO_LARGE", status: 400, message: "payout exceeds configured cap", maxPayout: cap };
    }
    if (transaction.status === "settled") {
      if (transaction.payout === payout) {
        const user = this.state.users[transaction.userId];
        return { ok: true, status: 200, changed: false, transaction: this.publicCasinoTransaction(transaction), wallet: user?.wallet ?? null };
      }
      return { ok: false, code: "TRANSACTION_ALREADY_SETTLED", status: 409, message: "transaction already settled with a different payout" };
    }
    if (transaction.status !== "reserved") {
      return { ok: false, code: "INVALID_TRANSACTION_STATE", status: 409, message: `cannot settle ${transaction.status} transaction` };
    }

    const user = this.state.users[transaction.userId];
    if (!user) return { ok: false, code: "USER_NOT_FOUND", status: 404, message: "wallet user not found" };
    const net = payout - transaction.bet;
    const walletCheck = this.nextCasinoWallet(user, payout);
    if (!walletCheck.ok) return walletCheck;
    const lifetimeCheck = this.nextCasinoLifetimeTotals(user, net);
    if (!lifetimeCheck.ok) return lifetimeCheck;
    user.wallet = walletCheck.wallet;
    user.lifetimeEarned = lifetimeCheck.lifetimeEarned;
    user.lifetimeLost = lifetimeCheck.lifetimeLost;
    transaction.status = "settled";
    transaction.payout = payout;
    transaction.settledAt = this.now().toISOString();
    this.log(user, "casino_settle", payout, `${transaction.game} / net ${net >= 0 ? "+" : ""}${net} / ${transactionId}`);
    return { ok: true, status: 200, changed: true, transaction: this.publicCasinoTransaction(transaction), wallet: user.wallet };
  }

  cancelCasinoReservation(transactionIdRaw, guildId) {
    const transactionId = cleanToken(transactionIdRaw, 120);
    if (!transactionId) return { ok: false, code: "INVALID_TRANSACTION_ID", status: 400, message: "transactionId is required" };
    const transaction = this.state.casino.transactions[transactionId];
    if (!transaction) return { ok: false, code: "TRANSACTION_NOT_FOUND", status: 404, message: "transaction not found" };
    const scoped = this.scopedCasinoTransaction(transaction, guildId);
    if (!scoped.ok) return scoped;
    if (transaction.status === "cancelled") {
      const user = this.state.users[transaction.userId];
      return { ok: true, status: 200, changed: false, transaction: this.publicCasinoTransaction(transaction), wallet: user?.wallet ?? null };
    }
    if (transaction.status !== "reserved") {
      return { ok: false, code: "INVALID_TRANSACTION_STATE", status: 409, message: `cannot cancel ${transaction.status} transaction` };
    }

    const user = this.state.users[transaction.userId];
    if (!user) return { ok: false, code: "USER_NOT_FOUND", status: 404, message: "wallet user not found" };
    const walletCheck = this.nextCasinoWallet(user, transaction.bet);
    if (!walletCheck.ok) return walletCheck;
    user.wallet = walletCheck.wallet;
    transaction.status = "cancelled";
    transaction.cancelledAt = this.now().toISOString();
    this.log(user, "casino_cancel", transaction.bet, `${transaction.game} / ${transaction.sessionId} / ${transactionId}`);
    return { ok: true, status: 200, changed: true, transaction: this.publicCasinoTransaction(transaction), wallet: user.wallet };
  }

  normalizeCasinoReservation(data, guildId, limits = {}) {
    const transactionId = cleanToken(data.transactionId, 120);
    const discordUserId = cleanToken(data.discordUserId, 80);
    const sessionId = cleanToken(data.sessionId, 120);
    const game = cleanToken(data.game, 80);
    const bet = parseIntegerField(data.bet);
    if (!transactionId) return { ok: false, code: "INVALID_TRANSACTION_ID", status: 400, message: "transactionId is required" };
    if (!isDiscordSnowflake(guildId)) return { ok: false, code: "INVALID_GUILD_ID", status: 400, message: "guildId must be a Discord Snowflake" };
    if (!isDiscordSnowflake(discordUserId)) return { ok: false, code: "INVALID_DISCORD_USER_ID", status: 400, message: "discordUserId must be a Discord Snowflake" };
    if (!sessionId) return { ok: false, code: "INVALID_SESSION_ID", status: 400, message: "sessionId is required" };
    if (!game) return { ok: false, code: "INVALID_GAME", status: 400, message: "game is required" };
    if (!Number.isSafeInteger(bet) || bet <= 0) return { ok: false, code: "INVALID_BET", status: 400, message: "bet must be a positive safe integer" };
    const minBet = casinoBetLimit(limits.minBet, 1);
    const maxBet = casinoBetLimit(limits.maxBet, Number.MAX_SAFE_INTEGER);
    if (maxBet < minBet) return { ok: false, code: "INVALID_BET_LIMITS", status: 500, message: "casino bet limits are invalid" };
    if (bet < minBet || bet > maxBet) return { ok: false, code: "BET_OUT_OF_RANGE", status: 400, message: `bet must be between ${minBet} and ${maxBet}`, minBet, maxBet };
    return { ok: true, transactionId, discordUserId, sessionId, game, bet };
  }

  idempotentCasinoReservation(existing, normalized) {
    const same =
      existing.discordUserId === normalized.discordUserId &&
      existing.sessionId === normalized.sessionId &&
      existing.game === normalized.game &&
      existing.bet === normalized.bet;
    if (!same) {
      return { ok: false, code: "TRANSACTION_CONFLICT", status: 409, message: "transactionId already exists with different reservation data" };
    }
    const user = this.state.users[existing.userId];
    return { ok: true, status: 200, changed: false, transaction: this.publicCasinoTransaction(existing), wallet: user?.wallet ?? null };
  }

  scopedCasinoTransaction(transaction, guildId) {
    if (!isDiscordSnowflake(guildId) || !isDiscordSnowflake(transaction.discordUserId)) {
      return { ok: false, code: "TRANSACTION_NOT_FOUND", status: 404, message: "transaction not found" };
    }
    const expectedUserId = `${guildId}:${transaction.discordUserId}`;
    if (transaction.userId !== expectedUserId) {
      return { ok: false, code: "TRANSACTION_NOT_FOUND", status: 404, message: "transaction not found" };
    }
    return { ok: true };
  }

  nextCasinoWallet(user, delta) {
    if (!Number.isSafeInteger(user.wallet) || user.wallet < 0) {
      return { ok: false, code: "INVALID_WALLET_STATE", status: 409, message: "wallet must be a non-negative safe integer" };
    }
    const next = user.wallet + delta;
    if (!Number.isSafeInteger(next) || next < 0) {
      return { ok: false, code: "WALLET_OVERFLOW", status: 409, message: "wallet result is outside the safe integer range" };
    }
    return { ok: true, wallet: next };
  }

  nextCasinoLifetimeTotals(user, net) {
    const earned = Number.isSafeInteger(user.lifetimeEarned) && user.lifetimeEarned >= 0 ? user.lifetimeEarned : null;
    const lost = Number.isSafeInteger(user.lifetimeLost) && user.lifetimeLost >= 0 ? user.lifetimeLost : null;
    if (earned === null || lost === null) {
      return { ok: false, code: "LIFETIME_TOTAL_OVERFLOW", status: 409, message: "lifetime totals must be non-negative safe integers" };
    }
    const nextEarned = net > 0 ? earned + net : earned;
    const nextLost = net < 0 ? lost + Math.abs(net) : lost;
    if (!Number.isSafeInteger(nextEarned) || !Number.isSafeInteger(nextLost)) {
      return { ok: false, code: "LIFETIME_TOTAL_OVERFLOW", status: 409, message: "lifetime total result is outside the safe integer range" };
    }
    return { ok: true, lifetimeEarned: nextEarned, lifetimeLost: nextLost };
  }

  casinoPayoutCap(bet, limits = {}) {
    const multiplier = Number.isFinite(Number(limits.maxPayoutMultiplier))
      ? Math.max(0, Math.floor(Number(limits.maxPayoutMultiplier)))
      : this.state.casino.settings.maxPayoutMultiplier;
    const maxRis = Number.isFinite(Number(limits.maxPayoutRis))
      ? Math.max(0, Math.floor(Number(limits.maxPayoutRis)))
      : this.state.casino.settings.maxPayoutRis;
    return Math.min(Math.floor(Number(bet || 0) * multiplier), maxRis);
  }

  publicCasinoTransaction(transaction) {
    return {
      transactionId: transaction.transactionId,
      discordUserId: transaction.discordUserId,
      userId: transaction.userId,
      sessionId: transaction.sessionId,
      game: transaction.game,
      bet: transaction.bet,
      status: transaction.status,
      payout: transaction.payout,
      createdAt: transaction.createdAt,
      reservedAt: transaction.reservedAt,
      settledAt: transaction.settledAt,
      cancelledAt: transaction.cancelledAt
    };
  }

  profile(user) {
    return this.playerCard(user, "profile");
  }

  rankCard(user) {
    return this.playerCard(user, "ranks");
  }

  playerCard(user, mode = "profile") {
    const net = Math.floor(this.netWorth(user));
    const textRank = rankWithProgress(TEXT_RANKS, user.activity.textXp);
    const vcRank = rankWithProgress(VC_RANKS, user.activity.vcXp);
    const econRank = rankWithProgress(ECONOMY_RANKS, net);
    const style = this.cardStyle(user);
    const score = this.cardScore(user);
    const title = `${user.name} / ${style.name}カード`;
    const data = {
      mode,
      user,
      style,
      score,
      title,
      subtitle: user.title,
      net,
      wallet: user.wallet,
      textRank,
      vcRank,
      textLevel: this.textLevel(user),
      vcLevel: this.vcLevel(user),
      vcSalaryPerMinute: this.voiceSalaryPerMinute(user),
      econRank
    };

    return {
      ok: true,
      title,
      lines: renderPlayerCardLines(data),
      card: {
        ...buildDiscordProfileCard(data),
        profile: buildProfileImageData(data)
      }
    };
  }

  inviteReport(user) {
    this.evaluateCampaignRetention();
    this.resetInviteDay(user);
    const rank = rankWithProgress(INVITE_RANKS, user.invites.qualified);
    const nextLine = rank.nextMin !== null
      ? `${this.nextRankName(INVITE_RANKS, rank.name)} まであと **${rank.nextMin - user.invites.qualified}人**`
      : "最高階級に到達";
    const panel = {
      title: `招待台帳 - ${rank.name}`,
      description: `${user.name} の招待実績です。招待した人が参加して初期資本を受け取ると成立します。`,
      color: 0x22c55e,
      fields: [
        { name: "階級", value: `**${rank.name}**\n${nextLine}`, inline: true },
        { name: "実績", value: `成立 **${user.invites.qualified}人** / 待ち ${user.invites.pending}人\n累計報酬 ${fmt(user.invites.earned)}`, inline: true },
        { name: "報酬単価", value: `成立ごとに **${fmt(this.inviteReward(user))}**\n招待された人にも ${fmt(INVITE_CONFIG.inviteeBonus)}`, inline: true },
        { name: "本日", value: `有償招待 ${user.invites.dailyPaid}/${INVITE_CONFIG.dailyPaidLimit} 回`, inline: true },
        { name: "サーバー全体", value: `追跡 ${this.state.invites.totalTracked} / 成立 ${this.state.invites.totalQualified}`, inline: true }
      ],
      components: [
        buttons([
          runButton("Campaign状況", "campaign status", "success", !this.state.inviteCampaign.active),
          runButton("Campaignランキング", "campaign leaderboard", "primary", !this.state.inviteCampaign.active),
          runButton("招待ランキング", "rank invite", "primary"),
          panelButton("貢献台帳", "invite", "success"),
          panelButton("ホーム", "home")
        ])
      ]
    };
    return this.panelResult(panel);
  }

  contributionPanel(user) {
    this.evaluateCampaignRetention();
    const fields = [
      { name: "招待階級", value: `${this.inviteRankLine(user)}\n成立 ${user.invites.qualified}人 / 累計報酬 ${fmt(user.invites.earned)}`, inline: true },
      { name: "Bump階級", value: `${this.bumpRankLine(user)}\n累計 ${user.bump.count}回 / 累計報酬 ${fmt(user.bump.earned)}`, inline: true },
      { name: "今の報酬単価", value: `招待成立 ${fmt(this.inviteReward(user))} / Bump ${fmt(this.bumpReward(user))}\n招待された人にも ${fmt(INVITE_CONFIG.inviteeBonus)}`, inline: false },
      { name: "条件", value: "招待: 招待した人が参加して初期資本を受け取ると成立（1日の有償上限あり）。Bump: DISBOARD で `/bump` すると自動で加算されます。", inline: false }
    ];
    const components = [];
    if (this.state.inviteCampaign.active) {
      fields.unshift({
        name: "IRIS Invite Campaign 開催中",
        value: "招待された人が24時間在籍・VC参加まで進むと追加報酬があります。\nCampaign Ticket は Campaign Shop で使用できます。",
        inline: false
      });
      components.push(buttons([
        runButton("Campaign状況", "campaign status", "success"),
        runButton("Campaignランキング", "campaign leaderboard", "primary"),
        runButton("Campaign Shop", "campaign shop"),
        runButton("招待ランキング", "rank invite"),
        panelButton("ホーム", "home")
      ]));
    } else {
      components.push(buttons([
        runButton("招待状況", "invite", "success"),
        runButton("招待ランキング", "rank invite"),
        runButton("Bumpランキング", "rank bump", "primary"),
        panelButton("ホーム", "home")
      ]));
    }
    return {
      title: "貢献台帳",
      description: "招待とBumpでサーバーに貢献すると階級が上がり、1回あたりの報酬も増えます。",
      color: this.state.inviteCampaign.active ? 0x14b8a6 : 0x22c55e,
      fields,
      components
    };
  }

  campaignCommand(user, args = []) {
    const action = String(args[0] || "status").toLowerCase();
    if (["status", "me", "progress"].includes(action)) return this.panelResult(this.campaignStatusPanel(user));
    if (["leaderboard", "rank", "ranking"].includes(action)) return this.panelResult(this.campaignLeaderboardPanel(user));
    if (["shop", "store"].includes(action)) return this.panelResult(this.campaignShopPanel(user));
    if (["admin", "manage"].includes(action)) return this.panelResult(this.adminCampaignPanel(user));
    if (action === "start") return this.startInviteCampaign(user);
    if (action === "stop") return this.stopInviteCampaign(user);
    if (action === "pending") return this.panelResult(this.campaignPendingPanel(user));
    if (action === "reset-confirm") return this.panelResult(this.campaignResetConfirmPanel(user));
    if (action === "reset") return this.resetInviteCampaign(user);
    if (action === "cancel-reset") return this.panelResult(this.adminCampaignPanel(user));
    return this.panelResult(this.campaignStatusPanel(user));
  }

  campaignStatsFor(userId) {
    const campaign = this.state.inviteCampaign;
    if (!campaign.userStats[userId]) {
      campaign.userStats[userId] = {
        invited: 0,
        retained: 0,
        vcQualified: 0,
        ticketsEarned: 0,
        risEarned: 0
      };
    }
    return campaign.userStats[userId];
  }

  campaignTicketLine(user) {
    return `${user.inviteCampaign.tickets}枚`;
  }

  campaignStatusPanel(user) {
    this.evaluateCampaignRetention();
    const campaign = this.state.inviteCampaign;
    const stats = this.campaignStatsFor(user.id);
    const nextMilestone = this.campaignNextMilestone(user);
    return {
      title: campaign.name,
      description: campaign.active
        ? "あなたのIRIS Invite Campaign進捗です。招待、24h定着、VC参加を中心に評価します。"
        : "現在アクティブなInvite Campaignはありません。基盤は次回開催に備えて待機中です。",
      color: campaign.active ? 0x14b8a6 : 0x64748b,
      fields: [
        { name: "状態", value: campaign.active ? "開催中" : "停止中", inline: true },
        { name: "Campaign Ticket", value: this.campaignTicketLine(user), inline: true },
        { name: "あなたの進捗", value: `招待 ${stats.invited}人\n24h定着 ${stats.retained}人\nVC達成 ${stats.vcQualified}人`, inline: true },
        { name: "獲得", value: `Ticket ${stats.ticketsEarned}枚\nRis ${fmt(stats.risEarned)}`, inline: true },
        { name: "次の目標", value: nextMilestone, inline: false }
      ],
      components: [
        buttons([
          runButton("Campaignランキング", "campaign leaderboard", "primary"),
          runButton("Campaign Shop", "campaign shop", "success"),
          panelButton("貢献台帳", "invite"),
          panelButton("ホーム", "home")
        ])
      ]
    };
  }

  campaignNextMilestone(user) {
    const campaign = this.state.inviteCampaign;
    const invited = Object.values(campaign.invitedUsers).filter((entry) => entry.inviterId === user.id);
    const pendingRetention = invited.find((entry) => !entry.rewardsPaid?.retention && !this.campaignInviteeLeft(entry.invitedUserId));
    if (pendingRetention) return `${pendingRetention.invitedUserName} さんの24h定着待ち`;
    const pendingVc = invited.find((entry) => !entry.rewardsPaid?.vc);
    if (pendingVc) return `${pendingVc.invitedUserName} さんのVC ${campaign.settings.vcMinutesRequired}分待ち`;
    return campaign.active ? "次の招待で参加報酬と定着/VC報酬を狙えます。" : "次回キャンペーン開始を待っています。";
  }

  campaignLeaderboardPanel(user) {
    this.evaluateCampaignRetention();
    const rows = Object.entries(this.state.inviteCampaign.userStats || {})
      .map(([userId, stats]) => ({
        userId,
        name: this.state.users[userId]?.name || userId,
        ...stats,
        score: (stats.retained || 0) + (stats.vcQualified || 0)
      }))
      .sort((a, b) => b.score - a.score || (b.invited || 0) - (a.invited || 0) || (b.ticketsEarned || 0) - (a.ticketsEarned || 0))
      .slice(0, 10);
    return {
      title: "Campaignランキング",
      description: "24h定着 + VC達成を主軸に並べます。単純な招待数だけでは順位を決めません。",
      color: 0x14b8a6,
      fields: rows.length
        ? rows.map((row, index) => ({
            name: `${index + 1}. ${row.name}`,
            value: `招待 ${row.invited || 0} / 24h ${row.retained || 0} / VC ${row.vcQualified || 0} / Ticket ${row.ticketsEarned || 0}`,
            inline: false
          }))
        : [{ name: "まだ記録なし", value: "キャンペーン対象の招待が記録されると表示されます。", inline: false }],
      components: [buttons([
        runButton("自分の状況", "campaign status", "success"),
        runButton("Campaign Shop", "campaign shop"),
        panelButton("貢献台帳", "invite"),
        panelButton("ホーム", "home")
      ])]
    };
  }

  campaignShopPanel(user) {
    const shopBonus = this.claimCampaignShopViewBonus(user);
    const campaign = this.state.inviteCampaign;
    return {
      title: "Campaign Shop",
      description: "Campaign Ticket の確認と、今後の交換導線の入口です。Phase 1では交換商品の安全な台帳基盤までを用意しています。",
      color: 0x0f766e,
      fields: [
        { name: "Campaign Ticket", value: this.campaignTicketLine(user), inline: true },
        { name: "交換商品", value: "交換商品は次回PRで追加予定です。壊れた在庫や未実装効果を作らないため、Phase 1では表示と導線に留めます。", inline: false },
        { name: "Shopタッチボーナス", value: shopBonus ? `初回訪問ボーナス ${fmt(shopBonus)} を受け取りました。` : "招待された対象者は初回訪問時に小さなボーナスを受け取れます。", inline: false },
        { name: "開催状況", value: campaign.active ? `${campaign.name} 開催中` : "現在は停止中", inline: false }
      ],
      components: [buttons([
        panelButton("ショップ", "marketplace", "primary"),
        panelButton("貢献台帳", "invite", "success"),
        runButton("Campaign状況", "campaign status"),
        panelButton("持ち物", "market-inventory")
      ])]
    };
  }

  adminCampaignPanel(user) {
    this.evaluateCampaignRetention();
    const campaign = this.state.inviteCampaign;
    const summary = this.campaignSummary();
    return {
      title: "IRIS Invite Campaign 管理",
      description: "招待から24h定着・VC参加までを見る定期開催型キャンペーンの管理パネルです。",
      color: campaign.active ? 0x14b8a6 : 0x64748b,
      fields: [
        { name: "状態", value: campaign.active ? "active" : "inactive", inline: true },
        { name: "キャンペーン名", value: campaign.name, inline: true },
        { name: "期間", value: `開始 ${campaign.startsAt || "-"}\n終了 ${campaign.endsAt || "-"}`, inline: false },
        { name: "Join reward", value: `招待者 ${fmt(campaign.settings.joinRewardRis)}\n新規 ${fmt(campaign.settings.invitedUserJoinBonusRis)}`, inline: true },
        { name: "Retention", value: `${campaign.settings.retentionHours}h / ${fmt(campaign.settings.retentionRewardRis)} + Ticket ${campaign.settings.retentionTicketReward}`, inline: true },
        { name: "VC", value: `${campaign.settings.vcMinutesRequired}分 / 招待者 Ticket ${campaign.settings.vcTicketReward}\n新規 ${fmt(campaign.settings.invitedUserVcBonusRis)}`, inline: true },
        { name: "集計", value: `招待 ${summary.totalInvited} / 24h ${summary.retained} / VC ${summary.vcQualified}\nTicket ${summary.totalTicketsIssued} / Ris ${fmt(summary.totalRisPaid)}`, inline: false }
      ],
      components: [
        buttons([
          runButton("Start campaign", "campaign start", "success", campaign.active),
          runButton("Stop campaign", "campaign stop", "danger", !campaign.active),
          runButton("View status", "campaign admin"),
          runButton("Leaderboard", "campaign leaderboard")
        ]),
        buttons([
          runButton("Pending invites", "campaign pending"),
          runButton("Reset campaign data", "campaign reset-confirm", "danger"),
          panelButton("運営パネル", "admin"),
          panelButton("貢献台帳", "invite")
        ]),
        buttons([
          runButton("Post campaign panel", "campaign status", "secondary", true)
        ])
      ]
    };
  }

  campaignPendingPanel(user) {
    this.evaluateCampaignRetention();
    const entries = Object.values(this.state.inviteCampaign.invitedUsers || {})
      .filter((entry) => !entry.rewardsPaid?.retention || !entry.rewardsPaid?.vc)
      .sort((a, b) => new Date(b.joinedAt || 0) - new Date(a.joinedAt || 0))
      .slice(0, 10);
    return {
      title: "Campaign pending invites",
      description: "24h定着またはVC達成が未完了の招待です。",
      color: 0xf59e0b,
      fields: entries.length
        ? entries.map((entry) => ({
            name: entry.invitedUserName,
            value: `招待者 ${entry.inviterName}\njoined ${entry.joinedAt || "-"}\n24h ${entry.rewardsPaid?.retention ? "paid" : "pending"} / VC ${entry.rewardsPaid?.vc ? "paid" : "pending"}`,
            inline: false
          }))
        : [{ name: "pendingなし", value: "未精算のキャンペーン招待はありません。", inline: false }],
      components: [buttons([
        panelButton("Campaign管理", "admin-campaign", "primary"),
        runButton("Leaderboard", "campaign leaderboard"),
        panelButton("運営パネル", "admin")
      ])]
    };
  }

  campaignResetConfirmPanel(user) {
    return {
      title: "Campaign data reset 確認",
      description: "現在のキャンペーン記録、ユーザー別Campaign Ticket/獲得記録をリセットします。通常の招待/Bump/財布履歴は消しません。",
      color: 0xef4444,
      fields: [
        { name: "対象", value: "inviteCampaign.invitedUsers / userStats / logs / user.inviteCampaign", inline: false }
      ],
      components: [buttons([
        runButton("本当にリセット", "campaign reset", "danger"),
        runButton("やめる", "campaign cancel-reset")
      ])]
    };
  }

  startInviteCampaign(user) {
    const campaign = this.state.inviteCampaign;
    if (campaign.active) return { ok: true, title: "Campaign already active", lines: [`${campaign.name} は開催中です。`], panel: this.adminCampaignPanel(user) };
    campaign.active = true;
    campaign.name = campaign.name || INVITE_CAMPAIGN_DEFAULTS.name;
    campaign.startsAt = this.now().toISOString();
    campaign.endsAt = null;
    this.campaignLog("campaign_started", `${user.name} が ${campaign.name} を開始しました。`);
    return { ok: true, title: "Campaign started", lines: [`${campaign.name} を開始しました。`], panel: this.adminCampaignPanel(user) };
  }

  stopInviteCampaign(user) {
    const campaign = this.state.inviteCampaign;
    if (!campaign.active) return { ok: true, title: "Campaign inactive", lines: [`${campaign.name} は停止中です。`], panel: this.adminCampaignPanel(user) };
    this.evaluateCampaignRetention();
    campaign.active = false;
    campaign.endsAt = this.now().toISOString();
    this.campaignLog("campaign_stopped", `${user.name} が ${campaign.name} を停止しました。`);
    return { ok: true, title: "Campaign stopped", lines: [`${campaign.name} を停止しました。`], panel: this.adminCampaignPanel(user) };
  }

  resetInviteCampaign(user) {
    const current = this.state.inviteCampaign;
    this.state.inviteCampaign = createInviteCampaignState({
      active: false,
      name: current.name || INVITE_CAMPAIGN_DEFAULTS.name,
      settings: { ...current.settings }
    });
    for (const member of Object.values(this.state.users || {})) {
      member.inviteCampaign = createUser(member.id, member.name).inviteCampaign;
    }
    this.campaignLog("campaign_reset", `${user.name} がCampaign dataをリセットしました。`);
    return { ok: true, title: "Campaign data reset", lines: ["キャンペーン記録をリセットしました。通常の招待/Bump/財布は変更していません。"], panel: this.adminCampaignPanel(user) };
  }

  campaignSummary() {
    const campaign = this.state.inviteCampaign;
    const stats = Object.values(campaign.userStats || {});
    return {
      totalInvited: Object.keys(campaign.invitedUsers || {}).length,
      retained: stats.reduce((sum, entry) => sum + (entry.retained || 0), 0),
      vcQualified: stats.reduce((sum, entry) => sum + (entry.vcQualified || 0), 0),
      totalTicketsIssued: stats.reduce((sum, entry) => sum + (entry.ticketsEarned || 0), 0),
      totalRisPaid: stats.reduce((sum, entry) => sum + (entry.risEarned || 0), 0)
    };
  }

  campaignLog(event, message, data = {}) {
    const campaign = this.state.inviteCampaign;
    campaign.logs.push({ at: this.now().toISOString(), event, message, data });
    campaign.logs = campaign.logs.slice(-80);
  }

  addCampaignRis(user, amount, note) {
    const value = Math.max(0, Math.floor(Number(amount) || 0));
    if (value <= 0) return 0;
    user.wallet += value;
    user.lifetimeEarned += value;
    user.inviteCampaign.risEarned += value;
    const stats = this.campaignStatsFor(user.id);
    stats.risEarned += value;
    this.log(user, "invite_campaign", value, note || this.state.inviteCampaign.name);
    return value;
  }

  addCampaignTickets(user, count, note) {
    const value = Math.max(0, Math.floor(Number(count) || 0));
    if (value <= 0) return 0;
    user.inviteCampaign.tickets += value;
    user.inviteCampaign.ticketsEarned += value;
    const stats = this.campaignStatsFor(user.id);
    stats.ticketsEarned += value;
    this.log(user, "campaign_ticket", value, note || this.state.inviteCampaign.name);
    return value;
  }

  recordCampaignInviteJoin(inviter, invitee, meta = {}) {
    const campaign = this.state.inviteCampaign;
    if (!campaign.active) return null;
    if (!inviter?.id || !invitee?.id || inviter.id === invitee.id || meta.bot) return null;
    if (campaign.invitedUsers[invitee.id]) return null;
    const entry = {
      inviterId: inviter.id,
      inviterName: inviter.name,
      invitedUserId: invitee.id,
      invitedUserName: invitee.name,
      joinedAt: this.now().toISOString(),
      retainedAt: null,
      vcQualifiedAt: null,
      shopViewedAt: null,
      inviteCode: meta.code || null,
      rewardsPaid: {
        join: false,
        retention: false,
        vc: false,
        shopView: false
      }
    };
    campaign.invitedUsers[invitee.id] = entry;
    const stats = this.campaignStatsFor(inviter.id);
    stats.invited += 1;

    if (!entry.rewardsPaid.join) {
      const inviterPaid = this.addCampaignRis(inviter, campaign.settings.joinRewardRis, `Campaign join: ${invitee.name}`);
      const inviteePaid = this.addCampaignRis(invitee, campaign.settings.invitedUserJoinBonusRis, `Campaign invited join: ${inviter.name}`);
      entry.rewardsPaid.join = true;
      this.campaignLog("invited_user_joined", `${inviter.name} が ${invitee.name} を招待しました。`, { inviterPaid, inviteePaid });
    }
    return entry;
  }

  campaignInviteeLeft(invitedUserId) {
    const user = this.state.users[invitedUserId];
    return Boolean(user?.invite?.leftAt);
  }

  recordCampaignInviteLeave(invitee) {
    const entry = this.state.inviteCampaign.invitedUsers[invitee.id];
    if (entry) entry.leftAt = this.now().toISOString();
  }

  evaluateCampaignRetention() {
    const campaign = this.state.inviteCampaign;
    if (!campaign.active) return [];
    const now = this.now().getTime();
    const paid = [];
    for (const entry of Object.values(campaign.invitedUsers || {})) {
      if (entry.rewardsPaid?.retention) continue;
      if (this.campaignInviteeLeft(entry.invitedUserId)) continue;
      const joinedAt = new Date(entry.joinedAt || 0).getTime();
      if (!Number.isFinite(joinedAt) || now - joinedAt < campaign.settings.retentionHours * 3600000) continue;
      const inviter = this.state.users[entry.inviterId];
      if (!inviter || inviter.id === entry.invitedUserId) continue;
      this.addCampaignRis(inviter, campaign.settings.retentionRewardRis, `Campaign 24h retention: ${entry.invitedUserName}`);
      this.addCampaignTickets(inviter, campaign.settings.retentionTicketReward, `Campaign 24h retention: ${entry.invitedUserName}`);
      entry.retainedAt = this.now().toISOString();
      entry.rewardsPaid.retention = true;
      const stats = this.campaignStatsFor(inviter.id);
      stats.retained += 1;
      this.campaignLog("invited_user_retained", `${entry.invitedUserName} が24h定着しました。`, { inviterId: inviter.id });
      this.campaignLogActiveInviteMilestones(inviter);
      paid.push(entry);
    }
    return paid;
  }

  qualifyCampaignVc(user) {
    const campaign = this.state.inviteCampaign;
    if (!campaign.active) return null;
    const entry = campaign.invitedUsers[user.id];
    if (!entry || entry.rewardsPaid?.vc) return null;
    if ((user.activity?.vcMinutes || 0) < campaign.settings.vcMinutesRequired) return null;
    const inviter = this.state.users[entry.inviterId];
    if (!inviter || inviter.id === user.id) return null;
    this.addCampaignTickets(inviter, campaign.settings.vcTicketReward, `Campaign VC: ${user.name}`);
    this.addCampaignRis(user, campaign.settings.invitedUserVcBonusRis, `Campaign VC bonus: ${inviter.name}`);
    entry.vcQualifiedAt = this.now().toISOString();
    entry.rewardsPaid.vc = true;
    const stats = this.campaignStatsFor(inviter.id);
    stats.vcQualified += 1;
    this.campaignLog("invited_user_vc_qualified", `${user.name} がVC ${campaign.settings.vcMinutesRequired}分を達成しました。`, { inviterId: inviter.id });
    this.campaignLogActiveInviteMilestones(inviter);
    return entry;
  }

  claimCampaignShopViewBonus(user) {
    const campaign = this.state.inviteCampaign;
    if (!campaign.active) return 0;
    const entry = campaign.invitedUsers[user.id];
    if (!entry || entry.rewardsPaid?.shopView) return 0;
    const paid = this.addCampaignRis(user, campaign.settings.shopViewBonusRis, "Campaign Shop first view");
    entry.shopViewedAt = this.now().toISOString();
    entry.rewardsPaid.shopView = true;
    this.campaignLog("campaign_shop_viewed", `${user.name} がCampaign Shopを開きました。`, { paid });
    return paid;
  }

  campaignLogActiveInviteMilestones(inviter) {
    const stats = this.campaignStatsFor(inviter.id);
    const score = (stats.retained || 0) + (stats.vcQualified || 0);
    for (const mark of [3, 5, 10]) {
      const key = `active_${mark}`;
      if (score >= mark && !inviter.inviteCampaign.milestonesLogged.includes(key)) {
        inviter.inviteCampaign.milestonesLogged.push(key);
        this.campaignLog("active_invite_milestone", `${inviter.name} が active invite ${mark} を達成しました。`, { inviterId: inviter.id, mark });
      }
    }
  }

  inviteLine(user) {
    this.resetInviteDay(user);
    return `成立 ${user.invites.qualified} / 待ち ${user.invites.pending} / 報酬 ${fmt(user.invites.earned)}`;
  }

  inviteReward(user) {
    return rankFor(INVITE_RANKS, user.invites.qualified).reward;
  }

  inviteRankLine(user) {
    const rank = rankWithProgress(INVITE_RANKS, user.invites.qualified);
    const next = rank.nextMin !== null ? `次の階級まであと ${rank.nextMin - user.invites.qualified}人` : "最高階級";
    return `${rank.name} / ${next}`;
  }

  bumpReward(user) {
    return rankFor(BUMP_RANKS, user.bump.count).reward;
  }

  bumpRankLine(user) {
    const rank = rankWithProgress(BUMP_RANKS, user.bump.count);
    const next = rank.nextMin !== null ? `次の階級まであと ${rank.nextMin - user.bump.count}回` : "最高階級";
    return `${rank.name} / ${next}`;
  }

  recordBump(actor) {
    const user = this.getUser(actor.id, actor.name);
    const before = rankFor(BUMP_RANKS, user.bump.count);
    user.bump.count += 1;
    const after = rankFor(BUMP_RANKS, user.bump.count);
    const reward = after.reward;
    user.wallet += reward;
    user.lifetimeEarned += reward;
    user.bump.earned += reward;
    user.bump.lastBumpAt = this.now().toISOString();
    this.log(user, "bump", reward, `サーバーbump ${user.bump.count}回目`);

    let rankUp = null;
    if (after.name !== before.name) {
      const progress = rankWithProgress(BUMP_RANKS, user.bump.count);
      rankUp = {
        axis: "bump",
        userName: user.name,
        previousRank: before.name,
        newRank: after.name,
        nextRank: progress.nextMin !== null ? this.nextRankName(BUMP_RANKS, after.name) : null
      };
    }

    return {
      ok: true,
      title: "Bump受付",
      lines: [
        `${user.name} がサーバーをBumpしました。（累計 ${user.bump.count}回）`,
        `報酬 +${fmt(reward)} / 階級 ${after.name}`,
        this.moneyLine(user)
      ],
      reward,
      count: user.bump.count,
      rankName: after.name,
      rankUp
    };
  }

  resetInviteDay(user) {
    const today = dayKey(this.now());
    if (user.invites.day === today) return;
    user.invites.day = today;
    user.invites.dailyPaid = 0;
  }

  recordInviteJoin(inviterActor, inviteeActor, meta = {}) {
    if (!inviterActor?.id || !inviteeActor?.id || inviterActor.id === inviteeActor.id) return null;
    const inviter = this.getUser(inviterActor.id, inviterActor.name);
    const invitee = this.getUser(inviteeActor.id, inviteeActor.name);
    if (invitee.invite.trackedAt) return null;
    if (invitee.invite.referredBy && invitee.invite.referredBy !== inviter.id) return null;

    invitee.invite.referredBy = inviter.id;
    invitee.invite.referredByName = inviter.name;
    invitee.invite.code = meta.code || null;
    invitee.invite.trackedAt = this.now().toISOString();
    invitee.invite.qualified = Boolean(invitee.invite.qualified);
    if (!invitee.invite.qualified) inviter.invites.pending += 1;
    this.state.invites.totalTracked += 1;
    this.state.invites.recent.push({
      at: this.now().toISOString(),
      inviterId: inviter.id,
      inviterName: inviter.name,
      inviteeId: invitee.id,
      inviteeName: invitee.name,
      code: meta.code || null
    });
    this.state.invites.recent = this.state.invites.recent.slice(-20);
    this.recordCampaignInviteJoin(inviter, invitee, meta);
    return { ok: true, inviter, invitee };
  }

  recordInviteLeave(inviteeActor) {
    const invitee = this.getUser(inviteeActor.id, inviteeActor.name);
    invitee.invite.leftAt = this.now().toISOString();
    this.recordCampaignInviteLeave(invitee);
    if (invitee.invite.referredBy && !invitee.invite.qualified) {
      const inviter = this.state.users[invitee.invite.referredBy];
      if (inviter) inviter.invites.pending = Math.max(0, (inviter.invites.pending || 0) - 1);
    }
  }

  qualifyInvite(user) {
    if (!user.invite.referredBy || user.invite.qualified || user.invite.leftAt) return null;
    const inviter = this.state.users[user.invite.referredBy];
    if (!inviter || inviter.id === user.id) return null;

    this.resetInviteDay(inviter);
    const beforeRank = rankFor(INVITE_RANKS, inviter.invites.qualified);
    user.invite.qualified = true;
    user.invite.qualifiedAt = this.now().toISOString();
    inviter.invites.pending = Math.max(0, inviter.invites.pending - 1);
    inviter.invites.qualified += 1;
    this.state.invites.totalQualified += 1;
    const afterRank = rankFor(INVITE_RANKS, inviter.invites.qualified);

    const inviteeBonus = INVITE_CONFIG.inviteeBonus;
    user.wallet += inviteeBonus;
    user.lifetimeEarned += inviteeBonus;

    let reward = 0;
    if (inviter.invites.dailyPaid < INVITE_CONFIG.dailyPaidLimit) {
      reward = this.inviteReward(inviter);
      inviter.wallet += reward;
      inviter.lifetimeEarned += reward;
      inviter.invites.earned += reward;
      inviter.invites.dailyPaid += 1;
      this.state.invites.totalPaid += reward;
    }

    let rankUp = null;
    if (afterRank.name !== beforeRank.name) {
      const progress = rankWithProgress(INVITE_RANKS, inviter.invites.qualified);
      rankUp = {
        axis: "invite",
        userName: inviter.name,
        previousRank: beforeRank.name,
        newRank: afterRank.name,
        nextRank: progress.nextMin !== null ? this.nextRankName(INVITE_RANKS, afterRank.name) : null
      };
    }

    this.log(inviter, "invite_reward", reward, user.name);
    return { inviter, reward, inviteeBonus, rankUp };
  }

  inn() {
    return {
      ok: true,
      title: "二人宿",
      lines: [
        "二人宿はDiscordの固定パネルから使います。",
        "運営が `/管理` からカテゴリ内のテキストチャンネルにパネルを送信します。",
        "公開宿は無料。シークレット宿は10,000 Risで、選んだ相手と自分だけが見えるVCです。",
        "宿名・人数・期限は、作成後に宿内の管理パネルから調整できます。追加人数は1人ごとに5,000 Risです。"
      ]
    };
  }

  cardScore(user) {
    return (
      rankIndex(ECONOMY_RANKS, this.netWorth(user)) +
      rankIndex(TEXT_RANKS, user.activity.textXp) +
      rankIndex(VC_RANKS, user.activity.vcXp)
    );
  }

  cardStyle(user) {
    const score = this.cardScore(user);
    return CARD_STYLES.reduce((best, style) => (score >= style.minScore ? style : best), CARD_STYLES[0]);
  }

  itemPrice(id) {
    const item = this.officialItem(id);
    return item ? item.price : 0;
  }

  officialCustomItems() {
    return this.state.marketplace.officialItems || {};
  }

  isOfficialItemOnSale(item) {
    if (!item || item.status !== "active") return false;
    const now = this.now().getTime();
    const startsAt = item.saleStartsAt ? new Date(item.saleStartsAt).getTime() : null;
    const endsAt = item.saleEndsAt ? new Date(item.saleEndsAt).getTime() : null;
    if (Number.isFinite(startsAt) && now < startsAt) return false;
    if (Number.isFinite(endsAt) && now >= endsAt) return false;
    return item.stock === null || item.stock > 0;
  }

  officialItem(id) {
    const key = String(id || "");
    if (isOfficialItemOnSale(key)) return SHOP_ITEMS[key];
    const custom = this.officialCustomItems()[key];
    if (!this.isOfficialItemOnSale(custom)) return null;
    return custom;
  }

  officialItemDefinition(id) {
    const key = String(id || "");
    return SHOP_ITEMS[key] || this.officialCustomItems()[key] || null;
  }

  officialSaleEntries() {
    const custom = Object.entries(this.officialCustomItems())
      .filter(([, item]) => this.isOfficialItemOnSale(item))
      .sort((a, b) => String(a[1].createdAt || "").localeCompare(String(b[1].createdAt || "")));
    return [...officialSaleEntries(), ...custom];
  }

  normalizeOfficialItemId(raw) {
    const token = cleanToken(raw, 40).toLowerCase();
    if (!token) return "";
    return token.startsWith("official:") ? token : `official:${token}`;
  }

  adminCreateOfficialItem(adminUser, data = {}) {
    const id = this.normalizeOfficialItemId(data.id);
    const name = cleanMarketText(data.name, 48);
    const description = cleanMarketText(data.description, 400);
    const effect = cleanMarketText(data.effect, 160);
    const type = cleanMarketText(data.type, 32) || "アイテム";
    const price = parsePositiveInt(data.price);
    const max = parsePositiveInt(data.max);
    if (!id) return { ok: false, title: "公式商品IDが空です", lines: ["英数字・_・-・.・: だけでIDを指定してください。"] };
    if (SHOP_ITEMS[id] || this.state.marketplace.officialItems[id]) {
      return { ok: false, title: "公式商品IDが重複しています", lines: [`${id} はすでに使われています。`] };
    }
    if (!name) return { ok: false, title: "商品名が空です", lines: ["商品名を入力してください。"] };
    if (!Number.isFinite(price)) return { ok: false, title: "価格が不正です", lines: ["価格は1以上の整数で入力してください。"] };
    if (!Number.isFinite(max) || max > 999) return { ok: false, title: "所持上限が不正です", lines: ["所持上限は1〜999の整数で入力してください。"] };
    const now = this.now().toISOString();
    const item = {
      id,
      name,
      price,
      max,
      kind: "passive",
      type,
      description: description || "運営追加の公式商品です。",
      effect: effect || "説明文として表示される所持型アイテム",
      usage: "購入後は持ち物に残ります。Bot処理が絡む効果はまだ自動発動しません。",
      status: "active",
      stock: null,
      saleStartsAt: null,
      saleEndsAt: null,
      roleId: null,
      roleDurationDays: 0,
      dmGuide: "購入内容は持ち物と運営対応キューに記録されます。",
      source: "admin",
      createdAt: now,
      createdBy: adminUser.id,
      createdByName: adminUser.name
    };
    this.state.marketplace.officialItems[id] = item;
    this.marketLog(`${adminUser.name} が公式商品 ${id} ${name} を追加しました。`);
    return {
      ok: true,
      title: "公式商品を追加しました",
      lines: [
        `${name} / ${fmt(price)}`,
        `所持上限: ${max}`,
        `効果: ${item.effect}`,
        "当面は説明表示だけの所持型アイテムとして扱います。"
      ],
      panel: this.officialProductPanel(adminUser, id)
    };
  }

  officialItemManagementPanel(adminUser, id) {
    const item = this.officialCustomItems()[id];
    if (!item) return this.marketAdminPanel(adminUser);
    const queueCount = this.officialFulfillmentTasks().filter((task) => task.itemId === id && task.status === "pending").length;
    return {
      title: `公式商品管理: ${item.name}`,
      description: "販売中の内容を編集できます。停止した商品は新規購入できず、既存の持ち物と対応キューは保持されます。",
      color: item.status === "active" ? 0x334155 : 0x6b7280,
      fields: [
        { name: "販売", value: `${officialItemStatusLabel(item.status)} / ${this.officialSaleWindowLine(item)}`, inline: true },
        { name: "在庫", value: item.stock === null ? "無制限" : `${item.stock} 個`, inline: true },
        { name: "所持上限", value: `${item.max} 個`, inline: true },
        { name: "ロール", value: item.roleId ? `<@&${item.roleId}> / ${item.roleDurationDays > 0 ? `${item.roleDurationDays}日` : "無期限"}` : "なし", inline: false },
        { name: "運営対応", value: `未完了 ${queueCount} 件`, inline: true },
        { name: "DM案内", value: item.dmGuide || "なし", inline: false }
      ],
      components: [
        buttons([
          customButton("商品を編集", `eco:market:official-item-edit:${id}`, "primary"),
          customButton(item.status === "active" ? "販売を停止" : "販売を再開", `eco:market:official-item-toggle:${id}`, item.status === "active" ? "danger" : "success"),
          customButton("ロールを選択", `eco:market:official-item-role:${id}`, "secondary")
        ]),
        buttons([
          panelButton("対応キュー", "official-fulfillment"),
          panelButton("公式ショップ確認", "official-shop"),
          panelButton("ショップ管理", "market-admin")
        ])
      ]
    };
  }

  officialSaleWindowLine(item) {
    const start = item.saleStartsAt ? shortDate(item.saleStartsAt) : "すぐに開始";
    const end = item.saleEndsAt ? shortDate(item.saleEndsAt) : "終了なし";
    return `${start} - ${end}`;
  }

  adminUpdateOfficialItem(adminUser, id, patch = {}) {
    const item = this.officialCustomItems()[id];
    if (!item) return { ok: false, title: "公式商品が見つかりません", lines: ["対象の商品は削除済みです。"] };
    const name = cleanMarketText(patch.name, 48);
    const description = cleanMarketText(patch.description, 400);
    const effect = cleanMarketText(patch.effect, 160);
    const type = cleanMarketText(patch.type, 32);
    const price = parsePositiveInt(patch.price);
    const max = parsePositiveInt(patch.max);
    const stock = parseOfficialStock(patch.stock);
    const saleStartsAt = parseOfficialSaleDate(patch.saleStartsAt);
    const saleEndsAt = parseOfficialSaleDate(patch.saleEndsAt);
    const roleDurationDays = parseNonNegativeInt(patch.roleDurationDays);
    const dmGuide = cleanMarketText(patch.dmGuide, 400);
    if (!name || !description || !effect || !type || !Number.isFinite(price) || !Number.isFinite(max) || !Number.isFinite(stock) && stock !== null) {
      return { ok: false, title: "商品設定が不正です", lines: ["商品名、価格、所持上限、種別、効果、説明、在庫を確認してください。"] };
    }
    if (max > 999 || (stock !== null && stock > 999999)) return { ok: false, title: "上限値が大きすぎます", lines: ["所持上限は999、在庫は999,999までです。"] };
    const hasSaleStart = hasOfficialSaleDateInput(patch.saleStartsAt);
    const hasSaleEnd = hasOfficialSaleDateInput(patch.saleEndsAt);
    if ((hasSaleStart && !saleStartsAt) || (hasSaleEnd && !saleEndsAt)) {
      return { ok: false, title: "販売日時が不正です", lines: ["販売日時は YYYY-MM-DD HH:mm（日本時間）で指定してください。"] };
    }
    if (saleStartsAt && saleEndsAt && saleStartsAt >= saleEndsAt) return { ok: false, title: "販売期間が不正です", lines: ["販売終了は開始より後にしてください。"] };
    if (!Number.isFinite(roleDurationDays) || roleDurationDays > 3650) return { ok: false, title: "ロール期限が不正です", lines: ["ロール期限は0〜3650日で指定してください。"] };
    Object.assign(item, {
      name, description, effect, type, price, max, stock,
      saleStartsAt: saleStartsAt ? saleStartsAt.toISOString() : null,
      saleEndsAt: saleEndsAt ? saleEndsAt.toISOString() : null,
      roleDurationDays,
      dmGuide: dmGuide || "購入内容は持ち物と運営対応キューに記録されます。",
      updatedAt: this.now().toISOString(),
      updatedBy: adminUser.id
    });
    this.marketLog(`${adminUser.name} が公式商品 ${id} を編集しました。`);
    return { ok: true, title: "公式商品を更新しました", lines: [item.name, `在庫: ${item.stock === null ? "無制限" : `${item.stock} 個`}`, `販売: ${this.officialSaleWindowLine(item)}`], panel: this.officialItemManagementPanel(adminUser, id) };
  }

  adminToggleOfficialItem(adminUser, id) {
    const item = this.officialCustomItems()[id];
    if (!item) return { ok: false, title: "公式商品が見つかりません", lines: ["対象の商品は削除済みです。"] };
    item.status = item.status === "active" ? "stopped" : "active";
    item.updatedAt = this.now().toISOString();
    item.updatedBy = adminUser.id;
    this.marketLog(`${adminUser.name} が公式商品 ${id} を${item.status === "active" ? "再開" : "停止"}しました。`);
    return { ok: true, title: item.status === "active" ? "販売を再開しました" : "販売を停止しました", lines: [`${item.name} は${item.status === "active" ? "再び購入可能" : "新規購入不可"}です。既存の持ち物は変わりません。`], panel: this.officialItemManagementPanel(adminUser, id) };
  }

  adminSetOfficialItemRole(adminUser, id, roleId) {
    const item = this.officialCustomItems()[id];
    if (!item) return { ok: false, title: "公式商品が見つかりません", lines: ["対象の商品は削除済みです。"] };
    item.roleId = roleId || null;
    item.updatedAt = this.now().toISOString();
    item.updatedBy = adminUser.id;
    this.marketLog(`${adminUser.name} が公式商品 ${id} のロール設定を更新しました。`);
    return { ok: true, title: "ロール設定を更新しました", lines: [item.roleId ? "購入時にロール付与を試みます。失敗時は対応キューから再試行できます。" : "ロール自動付与を解除しました。"], panel: this.officialItemManagementPanel(adminUser, id) };
  }

  loopSuggestion(user) {
    const suggestions = [];
    if (!user.joined) suggestions.push("まず `参加` で初期資本を受け取る");
    if (!user.lastDaily || cooldownRemaining(user.lastDaily, this.now(), 20 * 60 * 60 * 1000) === 0) suggestions.push("ログボを取る");
    if (suggestions.length === 0) suggestions.push("カードを見る、VCに入る、ショップを眺める");
    return suggestions.slice(0, 3).join("\n");
  }

  daily(user) {
    const now = this.now();
    const cooldown = cooldownRemaining(user.lastDaily, now, 20 * 60 * 60 * 1000);
    if (cooldown > 0) {
      return {
        ok: false,
        title: "ログボはまだ熟成中",
        lines: [`次のログボまで ${formatDuration(cooldown)}。財布も少し寝かせましょう。`]
      };
    }

    const last = user.lastDaily ? new Date(user.lastDaily) : null;
    const keptStreak = last && now - last < 48 * 60 * 60 * 1000;
    user.streak = keptStreak ? user.streak + 1 : 1;

    const stampBonus = user.inventory.stamp ? 250 : 0;
    const amount = 600 + Math.min(user.streak * 120, 1800) + stampBonus + randInt(this.rng, 0, 180);
    user.wallet += amount;
    user.lifetimeEarned += amount;
    user.lastDaily = now.toISOString();
    user.xp += 12;
    this.log(user, "daily", amount, "ログボ");

    return {
      ok: true,
      title: "ログボ支給",
      lines: [
        `${fmt(amount)} を受け取りました。`,
        `連続 ${user.streak}日。継続は金利より強い。`,
        stampBonus ? "常連カードが光りました。" : null,
        this.moneyLine(user)
      ].filter(Boolean)
    };
  }

  work(user) {
    const now = this.now();
    const cooldown = cooldownRemaining(user.lastWork, now, 45 * 1000);
    if (cooldown > 0) {
      return {
        ok: false,
        title: "休憩も労働のうち",
        lines: [`次に働けるまで ${formatDuration(cooldown)}。タイムカードが震えています。`]
      };
    }

    const job = pick(this.rng, WORKS);
    const hasChair = Boolean(user.inventory.chair);
    const multiplier = hasChair ? 1.15 : 1;
    const amount = Math.floor(randInt(this.rng, job.min, job.max) * multiplier);
    user.wallet += amount;
    user.lifetimeEarned += amount;
    user.workCount += 1;
    user.xp += job.xp;
    user.lastWork = now.toISOString();
    this.log(user, "work", amount, job.text);

    const lines = [
      `${job.text}。`,
      `報酬 ${fmt(amount)} を獲得。`,
      hasChair ? "深座りの椅子で報酬が少し増えました。" : null,
      this.moneyLine(user)
    ].filter(Boolean);

    if (this.rng() < 0.12) {
      const bonus = randInt(this.rng, 80, 260);
      user.wallet += bonus;
      user.lifetimeEarned += bonus;
      lines.splice(2, 0, `謎の残業代 ${fmt(bonus)} が机の隙間から出ました。`);
    }

    return { ok: true, title: "労働完了", lines };
  }

  subsidy(user) {
    const now = this.now();
    const cooldown = cooldownRemaining(user.lastSubsidy, now, 2 * 60 * 1000);
    if (cooldown > 0) {
      return {
        ok: false,
        title: "給付金窓口は昼休み",
        lines: [`次の申請まで ${formatDuration(cooldown)}。窓口の人も人生を考えています。`]
      };
    }

    user.lastSubsidy = now.toISOString();
    user.xp += 5;
    const roll = this.rng();
    if (roll < 0.18) {
      const fee = Math.min(user.wallet, randInt(this.rng, 20, 160));
      user.wallet -= fee;
      user.lifetimeLost += fee;
      return {
        ok: false,
        title: "申請書が迷子",
        lines: [`手数料 ${fmt(fee)} だけ取られました。これが行政の味。`, this.moneyLine(user)]
      };
    }

    const amount = randInt(this.rng, 80, 380);
    user.wallet += amount;
    user.lifetimeEarned += amount;
    return {
      ok: true,
      title: "給付金チャレンジ成功",
      lines: [`${fmt(amount)} を受け取りました。プライドは非課税です。`, this.moneyLine(user)]
    };
  }

  marketplace(user) {
    return {
      ok: true,
      title: "ショップ",
      lines: [
        "買う、見る、入札する場所です。",
        this.moneyLine(user)
      ],
      panel: this.marketplacePanel(user)
    };
  }

  marketplaceCommand(user, args = []) {
    const action = String(args[0] || "top").toLowerCase();
    if (["top", "home"].includes(action)) return this.marketplace(user);
    if (["official", "official-shop"].includes(action)) return this.panelResult(this.officialShopPanel(user));
    if (["shops", "user-shops"].includes(action)) return this.panelResult(this.userShopsPanel(user));
    if (["recommended", "recommend", "today"].includes(action)) return this.panelResult(this.recommendedShelfPanel(user));
    if (["affordable", "can-buy", "available"].includes(action)) return this.panelResult(this.affordableItemsPanel(user));
    if (["campaign-shop", "campaign"].includes(action)) return this.panelResult(this.campaignShopPanel(user));
    if (["auction", "auctions"].includes(action)) return this.panelResult(this.officialAuctionsPanel(user));
    if (["inventory", "history"].includes(action)) return this.panelResult(this.marketInventoryPanel(user));
    if (action === "official-manage") return this.panelResult(this.officialItemManagementPanel(user, args[1]));
    if (action === "official-fulfillment") return this.panelResult(args[1] ? this.officialFulfillmentTaskPanel(user, args[1]) : this.officialFulfillmentPanel(user));
    if (["my", "my-shop"].includes(action)) return this.myShop(user);
    if (action === "product") return this.panelResult(this.officialProductPanel(user, args[1]));
    if (action === "confirm") return this.panelResult(this.officialConfirmPanel(user, args[1]));
    if (action === "buy") return this.buyItem(user, args[1]);
    if (action === "listing") return this.panelResult(this.userListingPanel(user, args[1]));
    if (["listing-shelf", "listing-category", "category"].includes(action)) return this.panelResult(this.userListingShelfPanel(user, args[1]));
    if (action === "listing-confirm") return this.panelResult(this.userListingConfirmPanel(user, args[1]));
    if (action === "listing-buy") return this.buyUserListing(user, args[1]);
    if (action === "auction") return this.panelResult(this.auctionDetailPanel(user, args[1]));
    if (action === "auction-history") return this.panelResult(this.auctionHistoryPanel(user, args[1]));
    if (action === "auction-end") return this.forceEndAuction(user, args[1]);
    if (action === "review") return this.panelResult(this.reviewListingPanel(user, args[1]));
    if (action === "order") return this.panelResult(this.adminOrderPanel(user, args[1]));
    if (action === "shop-view") return this.panelResult(this.shopViewPanel(user, args[1]));
    if (action === "restart-listing") return this.restartListing(user, args[1]);
    if (action === "edit-listing") return this.panelResult(this.editListingPromptPanel(user, args[1]));
    if (action === "resubmit-listing") return this.panelResult(this.resubmitListingPromptPanel(user, args[1]));
    if (action === "open-shop") return this.openShop(user);
    if (action === "listing-type") return this.setListingDraft(user, { type: args[1] });
    if (action === "listing-mode") return this.setListingDraft(user, { mode: args[1] });
    if (action === "stop-listing") return this.stopListing(user, args[1]);
    if (action === "complete-order") return this.completeOrder(user, args[1]);
    if (action === "report-order") return this.reportOrder(user, args[1]);
    return this.marketplace(user);
  }

  panelResult(panel) {
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

  recommendedOfficialItems() {
    const preferred = [
      ["coupon", "初心者向け"],
      ["stamp", "便利枠"],
      ["roompass", "チケット"],
      ["frame", "見た目用"]
    ];
    const picked = preferred
      .filter(([id]) => this.officialItem(id))
      .map(([id, reason]) => ({ id, item: this.officialItem(id), reason }));
    for (const [id, item] of this.officialSaleEntries()) {
      if (id === "chair") continue;
      if (picked.some((entry) => entry.id === id)) continue;
      picked.push({ id, item, reason: item.price >= 10000 ? "高額者向け" : "初心者向け" });
      if (picked.length >= 5) break;
    }
    return picked.slice(0, 5);
  }

  insufficientBalanceComponents() {
    return [
      buttons([
        runButton("ログボ", "daily", "success"),
        runButton("VC精算", "vc", "success"),
        runButton("招待・Bump確認", "invite"),
        runButton("今買えるもの", "marketplace affordable", "primary"),
        panelButton("ショップへ戻る", "marketplace")
      ])
    ];
  }

  insufficientBalancePanel({ title = "残高が足りません", itemName = "商品", needed = 0, current = 0, backCommand = "marketplace" } = {}) {
    const shortage = Math.max(0, needed - current);
    return {
      title,
      description: `${itemName} の購入に必要なRisが足りません。`,
      color: 0xef4444,
      fields: [
        { name: "必要額", value: fmt(needed), inline: true },
        { name: "現在残高", value: fmt(current), inline: true },
        { name: "不足額", value: fmt(shortage), inline: true }
      ],
      components: [
        ...this.insufficientBalanceComponents(),
        buttons([runButton("商品へ戻る", backCommand)])
      ]
    };
  }

  purchaseCompletePanel(user, { title = "購入完了", itemName, price, description = "", anotherCommand = "marketplace recommended", useCommand = null } = {}) {
    const actionButtons = [
      panelButton("持ち物を見る", "market-inventory", "primary")
    ];
    if (useCommand) actionButtons.push(runButton("使う", useCommand, "success"));
    actionButtons.push(
      runButton("もう一つ見る", anotherCommand),
      panelButton("ショップへ戻る", "marketplace")
    );
    return {
      title,
      description: description || "購入が完了しました。次の操作を選べます。",
      color: 0x22c55e,
      fields: [
        { name: "商品", value: itemName || "-", inline: true },
        { name: "支払い", value: fmt(price || 0), inline: true },
        { name: "残高", value: fmt(user.wallet), inline: true }
      ],
      components: [buttons(actionButtons)]
    };
  }

  marketplacePanel(user) {
    const shop = user.marketplace || {};
    const recommended = this.recommendedOfficialItems()[0];
    const shopStatus = shop.shopOpened
      ? `${shop.shopName || "未設定"} / ${(shop.shopStatus || "open") === "open" ? "営業中" : "休業中"}`
      : "未開店";
    const fields = [
      { name: "残高", value: this.moneyLine(user), inline: true },
      { name: "今日のおすすめ", value: recommended ? `${recommended.item.name}\n${recommended.reason} / ${fmt(this.itemPrice(recommended.id))}` : "公式商品を準備中です。", inline: true },
      { name: "民営出品", value: `${this.activeListings().length}件（${this.openShopSellerIds().size}店）`, inline: true },
      { name: "自分の店", value: shopStatus, inline: false }
    ];
    const components = [
      buttons([
        panelButton("公式商品を見る", "official-shop", "primary"),
        panelButton("ユーザー商品を見る", "user-shops", "primary"),
        runButton("今日のおすすめ", "marketplace recommended", "primary"),
        runButton("今買えるもの", "marketplace affordable"),
        panelButton("持ち物を見る", "market-inventory")
      ]),
      buttons([
        panelButton("自分の店", "my-shop"),
        customButton("絞り込みで探す", "eco:shop:search-open"),
        panelButton("公式オークション", "official-auctions")
      ])
    ];
    if (this.state.inviteCampaign.active) {
      fields.splice(3, 0, {
        name: "Campaign Shop",
        value: `${this.state.inviteCampaign.name}\nCampaign Ticket: ${this.campaignTicketLine(user)}`,
        inline: false
      });
      components.push(buttons([
        runButton("Campaign Shop", "marketplace campaign-shop", "success"),
        runButton("Campaign状況", "campaign status"),
        runButton("Campaignランキング", "campaign leaderboard")
      ]));
    }
    return {
      title: "ショップ",
      description: "商品を探して、詳細を見て、確認してから購入できます。売る側の管理も下の控えめな導線から行えます。",
      color: 0x7c3aed,
      fields,
      components
    };
  }

  recommendedShelfPanel(user) {
    const entries = this.recommendedOfficialItems();
    if (!entries.length) {
      return {
        title: "今日のおすすめ",
        description: "公式商品は現在準備中です。運営が追加するまでお待ちください。",
        color: 0x8b5cf6,
        fields: [
          { name: "民営ショップ", value: "ユーザー出品の商品はこちらから見られます。", inline: false }
        ],
        components: [
          buttons([
            panelButton("民営ショップ", "user-shops", "primary"),
            panelButton("ショップへ戻る", "marketplace")
          ])
        ]
      };
    }
    return {
      title: "今日のおすすめ",
      description: "公式商品を中心に、目的別に見やすく並べています。購入前には必ず詳細と確認画面を挟みます。",
      color: 0x8b5cf6,
      fields: entries.map((entry, index) => ({
        name: `${index + 1}. ${entry.item.name}`,
        value: `${entry.reason} / ${fmt(this.itemPrice(entry.id))}\n${String(entry.item.description || "").slice(0, 80)}`,
        inline: true
      })),
      components: [
        buttons(entries.slice(0, 5).map((entry, index) =>
          runButton(`${index + 1}を見る`, `marketplace product ${entry.id}`, index === 0 ? "primary" : "secondary")
        )),
        buttons([
          panelButton("公式ショップへ", "official-shop"),
          panelButton("ショップへ戻る", "marketplace")
        ])
      ]
    };
  }

  affordableItemsPanel(user) {
    const official = this.officialSaleEntries()
      .map(([id, item]) => ({
        id,
        source: "公式",
        name: item.name,
        type: item.type,
        price: this.itemPrice(id),
        command: `marketplace product ${id}`
      }))
      .filter((entry) => entry.price <= user.wallet && (user.inventory[entry.id] || 0) < this.officialItem(entry.id).max);
    const privateListings = this.activeListings()
      .filter((listing) => listing.price <= user.wallet && listing.sellerId !== user.id)
      .map((listing) => ({
        id: listing.id,
        source: "民営",
        name: listing.name,
        type: productTypeLabel(listing.type),
        price: listing.price,
        sellerName: listing.sellerName,
        command: `marketplace listing ${listing.id}`
      }));
    const entries = [...official, ...privateListings].sort((a, b) => a.price - b.price).slice(0, 10);
    if (!entries.length) {
      return {
        title: "今買えるもの",
        description: "現在の残高で買える商品は見つかりませんでした。",
        color: 0xef4444,
        fields: [
          { name: "残高", value: this.moneyLine(user), inline: false },
          { name: "次の行動", value: "ログボ、VC精算、招待・Bump確認、または安い商品の再確認へ進めます。", inline: false }
        ],
        components: this.insufficientBalanceComponents()
      };
    }
    return {
      title: "今買えるもの",
      description: "現在の残高で購入できる商品です。安い順で最大10件まで表示します。",
      color: 0x16a34a,
      fields: entries.map((entry, index) => ({
        name: `${index + 1}. ${entry.name}`.slice(0, 256),
        value: `${entry.source} / ${entry.type} / ${fmt(entry.price)}${entry.sellerName ? `\n販売者 ${entry.sellerName}` : ""}`,
        inline: true
      })),
      components: [
        select("買える商品を選ぶ", entries.slice(0, 10).map((entry, index) =>
          option(`${index + 1}. ${entry.name}`.slice(0, 90), `run:${entry.command}`, `${entry.source} / ${fmt(entry.price)}`.slice(0, 100))
        )),
        buttons([
          panelButton("持ち物を見る", "market-inventory"),
          panelButton("ショップへ戻る", "marketplace")
        ])
      ]
    };
  }

  officialShopPanel(user) {
    const saleEntries = this.officialSaleEntries();
    if (!saleEntries.length) {
      return {
        title: "公式ショップ",
        description: "公式商品は現在すべて撤去中です。新しいラインナップは運営が順次追加します。\nすでに購入済みの商品は引き続き持ち物から使えます（効果もそのまま）。",
        color: 0x8b5cf6,
        fields: [
          { name: "持ち物", value: "購入済みの商品は「持ち物」から確認・使用できます。", inline: false }
        ],
        components: [
          buttons([
            panelButton("ショップ", "marketplace"),
            panelButton("持ち物", "market-inventory", "primary"),
            panelButton("自分の店", "my-shop", "success")
          ])
        ]
      };
    }
    const fields = saleEntries.slice(0, 25).map(([id, item]) => ({
      name: `${item.name}（${item.type}）`,
      value: `${fmt(this.itemPrice(id))} / ${item.kind === "consumable" ? "使い切り" : "所持型"}\n効果: ${item.effect}\n所持 ${this.officialStockLine(user, id)}${item.stock === null || item.stock === undefined ? "" : ` / 在庫 ${item.stock}`}`,
      inline: true
    }));
    return {
      title: "公式ショップ",
      description: "運営が設定する公式商品です。所持型商品の効果は説明文で案内され、ロール付き商品は購入後に付与を試みます。購入前には必ず確認画面を挟みます。",
      color: 0x8b5cf6,
      fields,
      components: [
        select("公式商品を選ぶ", saleEntries.slice(0, 25).map(([id, item]) =>
          option(item.name, `run:marketplace product ${id}`, `${fmt(this.itemPrice(id))} / ${item.type} / ${item.effect}`.slice(0, 100))
        )),
        buttons([
          panelButton("ショップ", "marketplace"),
          panelButton("持ち物", "market-inventory"),
          panelButton("自分の店", "my-shop", "success")
        ])
      ]
    };
  }

  officialProductPanel(user, id) {
    const item = this.officialItem(id);
    if (!item) return this.marketplacePanel(user);
    const owned = user.inventory[id] || 0;
    const soldOut = owned >= item.max;
    return {
      title: item.name,
      description: item.description,
      color: 0x8b5cf6,
      fields: [
        { name: "価格", value: fmt(this.itemPrice(id)), inline: true },
        { name: "種別", value: item.type, inline: true },
        { name: "所持", value: `${owned}/${item.max}`, inline: true },
        { name: "在庫", value: item.stock === null || item.stock === undefined ? "無制限" : `${item.stock} 個`, inline: true },
        { name: "販売期間", value: this.officialSaleWindowLine(item), inline: false },
        { name: "効果", value: item.effect, inline: false },
        { name: "使い方", value: item.usage, inline: false },
        { name: "販売方式", value: item.kind === "consumable" ? "使い切り（消費型）" : "常時発動（所持型）", inline: false }
      ],
      components: [
        buttons([
          runButton("購入確認", `marketplace confirm ${id}`, "primary", soldOut),
          panelButton("公式ショップ", "official-shop"),
          panelButton("ショップ", "marketplace")
        ])
      ]
    };
  }

  officialConfirmPanel(user, id) {
    const item = this.officialItem(id);
    if (!item) return this.marketplacePanel(user);
    const price = this.itemPrice(id);
    const shortage = Math.max(0, price - user.wallet);
    const components = [
      buttons([
        runButton("購入する", `marketplace buy ${id}`, "success", shortage > 0),
        panelButton("やめる", "official-shop"),
        panelButton("ショップ", "marketplace")
      ])
    ];
    if (shortage > 0) components.push(...this.insufficientBalanceComponents());
    return {
      title: "購入確認",
      description: "内容を確認してから購入してください。",
      color: 0xf59e0b,
      fields: [
        { name: "商品", value: item.name, inline: true },
        { name: "価格", value: fmt(price), inline: true },
        { name: "販売者", value: "公式", inline: true },
        { name: "必要額", value: fmt(price), inline: true },
        { name: "現在残高", value: fmt(user.wallet), inline: true },
        { name: "不足額", value: shortage ? fmt(shortage) : "なし", inline: true }
      ],
      components
    };
  }

  userShopsPanel(user) {
    const listings = this.activeListings().slice(0, 25);
    const openShops = this.openShopSellerIds();
    const shopEntries = Array.from(openShops)
      .map((ownerId) => this.state.marketplace.shops[ownerId])
      .filter(Boolean)
      .slice(0, 25);
    const components = [
      select("カテゴリで探す", [
        option("称号", "run:marketplace listing-shelf title", "肩書き・表示用"),
        option("アイテム", "run:marketplace listing-shelf item", "通常アイテム"),
        option("チケット", "run:marketplace listing-shelf ticket", "利用券・入場券"),
        option("権利", "run:marketplace listing-shelf right", "権利系の商品"),
        option("サービス", "run:marketplace listing-shelf service", "手動対応の商品"),
        option("新着", "run:marketplace listing-shelf new", "最近の出品"),
        option("安い順", "run:marketplace listing-shelf cheap", "価格の安い商品")
      ]),
      buttons([
        customButton("絞り込みで探す", "eco:shop:search-open", "primary"),
        panelButton("ショップ", "marketplace"),
        panelButton("自分の店", "my-shop", "success"),
        panelButton("持ち物", "market-inventory")
      ])
    ];
    if (listings.length) {
      components.push(select("商品を選ぶ", listings.map((listing) =>
        option(listing.name.slice(0, 90), `run:marketplace listing ${listing.id}`, `${fmt(listing.price)} / ${listing.sellerName}`))));
    }
    if (shopEntries.length) {
      components.push(select("店を選ぶ", shopEntries.map((shop) =>
        option(`${shop.name || `${shop.ownerName}の店`}`.slice(0, 90), `run:marketplace shop-view ${shop.ownerId}`, `${shop.ownerName || ""}`.slice(0, 100) || "店主"))));
    }
    return {
      title: "民営ショップ",
      description: listings.length ? "ユーザーが出品している商品です。絞り込みや店ごとの一覧も見られます。" : "出品中の商品はまだありません。",
      color: 0x0f766e,
      fields: listings.slice(0, 6).map((listing) => ({
        name: listing.name,
        value: `${fmt(listing.price)} / ${saleModeLabel(listing.mode)} / 在庫 ${listing.stock}\n販売者 ${listing.sellerName}`,
        inline: true
      })),
      components
    };
  }

  userListingShelfPanel(user, shelfRaw = "new") {
    const shelf = String(shelfRaw || "new").toLowerCase();
    const typeAliases = {
      role: "role",
      "ロール": "role",
      title: "title",
      "称号": "title",
      item: "item",
      "アイテム": "item",
      ticket: "ticket",
      "チケット": "ticket",
      right: "right",
      "権利": "right",
      service: "service",
      "サービス": "service"
    };
    const typeKey = typeAliases[shelf] || null;
    let listings = this.activeListings().filter((listing) => listing.sellerId !== user.id);
    let title = "民営ショップ 新着";
    let description = "最近出品された商品です。";
    if (typeKey) {
      listings = listings.filter((listing) => listing.type === typeKey);
      title = `民営ショップ ${productTypeLabel(typeKey)}`;
      description = `${productTypeLabel(typeKey)}カテゴリの商品です。`;
    } else if (["cheap", "price", "安い順"].includes(shelf)) {
      title = "民営ショップ 安い順";
      description = "価格の安い商品から表示します。";
      listings.sort((a, b) => a.price - b.price);
    } else {
      listings.sort((a, b) => b.id - a.id);
    }
    listings = listings.slice(0, 10);
    const components = [];
    if (listings.length) {
      components.push(select("商品を選ぶ", listings.map((listing, index) =>
        option(`${index + 1}. ${listing.name}`.slice(0, 90), `run:marketplace listing ${listing.id}`, `${fmt(listing.price)} / ${listing.sellerName}`.slice(0, 100))
      )));
    }
    components.push(buttons([
      panelButton("民営ショップ", "user-shops", "primary"),
      customButton("絞り込みで探す", "eco:shop:search-open"),
      panelButton("ショップ", "marketplace")
    ]));
    return {
      title,
      description: listings.length ? `${description} 上位10件までを表示します。` : "この棚に表示できる商品はまだありません。",
      color: 0x0f766e,
      fields: listings.map((listing) => ({
        name: listing.name.slice(0, 256),
        value: `${fmt(listing.price)} / ${productTypeLabel(listing.type)} / ${saleModeLabel(listing.mode)}\n販売者 ${listing.sellerName}`,
        inline: true
      })),
      components
    };
  }

  shopViewPanel(user, ownerId) {
    if (!ownerId) return this.userShopsPanel(user);
    const owner = this.state.users[ownerId];
    if (!owner || !owner.marketplace?.shopOpened) {
      return {
        title: "店が見つかりません",
        description: "指定された店は存在しないか、まだ開店していません。",
        color: 0x64748b,
        fields: [],
        components: [buttons([panelButton("民営ショップ", "user-shops"), panelButton("ショップ", "marketplace")])]
      };
    }
    const shop = owner.marketplace;
    const isClosed = (shop.shopStatus || "open") === "closed";
    const listings = this.sellerListings(ownerId).filter((l) => l.status === "active" && l.stock > 0).slice(0, 25);
    return {
      title: `${shop.shopName || `${owner.name}の店`}${isClosed ? "（休業中）" : ""}`,
      description: shop.shopDescription || "説明はまだありません。",
      color: isClosed ? 0x64748b : 0x0f766e,
      fields: [
        { name: "店主", value: owner.name, inline: true },
        { name: "営業状況", value: isClosed ? "休業中（購入不可）" : "営業中", inline: true },
        { name: "出品中", value: `${listings.length}件`, inline: true },
        ...listings.slice(0, 6).map((listing) => ({
          name: listing.name,
          value: `${fmt(listing.price)} / ${saleModeLabel(listing.mode)} / 在庫 ${listing.stock}`,
          inline: true
        }))
      ],
      components: [
        listings.length && !isClosed
          ? select("商品を選ぶ", listings.map((listing) =>
              option(listing.name.slice(0, 90), `run:marketplace listing ${listing.id}`, `${fmt(listing.price)}`)
            ))
          : buttons([panelButton("民営ショップ", "user-shops")]),
        buttons([
          panelButton("民営ショップ", "user-shops"),
          panelButton("ショップ", "marketplace"),
          panelButton("持ち物", "market-inventory")
        ])
      ]
    };
  }

  searchResultsPanel(user, filters = {}) {
    const results = this.searchListings(filters);
    const summary = [];
    if (filters.keyword) summary.push(`キーワード: ${filters.keyword}`);
    if (filters.type) summary.push(`種類: ${filters.type}`);
    if (filters.minPrice) summary.push(`最低価格: ${filters.minPrice}`);
    if (filters.maxPrice) summary.push(`最高価格: ${filters.maxPrice}`);
    const sortLabels = { newest: "新着順", oldest: "古い順", price_asc: "安い順", price_desc: "高い順" };
    const sortKey = filters.sort || "newest";
    const sortLabel = sortLabels[sortKey] || "新着順";
    summary.push(`並び: ${sortLabel}`);
    const summaryLine = summary.length ? summary.join(" / ") : "条件なし（全商品）";
    const components = [];
    if (results.length) {
      components.push(select("商品を選ぶ", results.slice(0, 25).map((listing) =>
        option(listing.name.slice(0, 90), `run:marketplace listing ${listing.id}`, `${fmt(listing.price)} / ${listing.sellerName}`))));
    }
    components.push(buttons([
      customButton("再検索", "eco:shop:search-open", "primary"),
      panelButton("民営ショップ", "user-shops"),
      panelButton("ショップ", "marketplace")
    ]));
    return {
      title: `絞り込み結果（${results.length}件）`,
      description: `条件: ${summaryLine}\n上位25件までを表示します。`,
      color: 0x0f766e,
      fields: results.slice(0, 6).map((listing) => ({
        name: listing.name,
        value: `${fmt(listing.price)} / ${productTypeLabel(listing.type)} / ${listing.sellerName}\n在庫 ${listing.stock}`,
        inline: true
      })),
      components
    };
  }

  userListingPanel(user, id) {
    const listing = this.findListing(id);
    if (!listing || listing.status !== "active") return this.userShopsPanel(user);
    return {
      title: listing.name,
      description: listing.description || "説明はありません。",
      color: 0x0f766e,
      fields: [
        { name: "価格", value: fmt(listing.price), inline: true },
        { name: "方式", value: saleModeLabel(listing.mode), inline: true },
        { name: "種類", value: productTypeLabel(listing.type), inline: true },
        { name: "在庫", value: `${listing.stock}`, inline: true },
        { name: "販売者", value: listing.sellerName, inline: true },
        { name: "注意", value: listing.manual ? "この商品は手動対応です。購入後、取引中に入ります。" : "購入後、自動で持ち物に記録されます。", inline: false }
      ],
      components: [
        buttons([
          runButton("購入確認", `marketplace listing-confirm ${listing.id}`, "primary", listing.sellerId === user.id),
          runButton("この店の他の商品を見る", `marketplace shop-view ${listing.sellerId}`),
          panelButton("民営ショップ", "user-shops"),
          panelButton("ショップ", "marketplace")
        ])
      ]
    };
  }

  userListingConfirmPanel(user, id) {
    const listing = this.findListing(id);
    if (!listing || listing.status !== "active") return this.userShopsPanel(user);
    const shortage = Math.max(0, listing.price - user.wallet);
    const components = [
      buttons([
        runButton("購入する", `marketplace listing-buy ${listing.id}`, "success", shortage > 0 || listing.sellerId === user.id),
        panelButton("やめる", "user-shops"),
        panelButton("ショップ", "marketplace")
      ])
    ];
    if (shortage > 0) components.push(...this.insufficientBalanceComponents());
    return {
      title: "購入確認",
      description: "民営商品です。内容と販売者を確認してください。",
      color: 0xf59e0b,
      fields: [
        { name: "商品", value: listing.name, inline: true },
        { name: "価格", value: fmt(listing.price), inline: true },
        { name: "販売者", value: listing.sellerName, inline: true },
        { name: "方式", value: saleModeLabel(listing.mode), inline: true },
        { name: "必要額", value: fmt(listing.price), inline: true },
        { name: "現在残高", value: fmt(user.wallet), inline: true },
        { name: "不足額", value: shortage ? fmt(shortage) : "なし", inline: true }
      ],
      components
    };
  }

  marketInventoryPanel(user) {
    this.ensureShopShape(user);
    const officialEntries = Object.entries(user.inventory || {}).filter(([, count]) => count > 0);
    const consumables = officialEntries.filter(([id]) => this.officialItemDefinition(id)?.kind === "consumable");
    const officialLines = officialEntries.map(([id, count]) => {
      const item = this.officialItemDefinition(id);
      const kindLabel = item?.kind === "consumable" ? "使い切り" : item?.source === "admin" ? "所持型" : "常時発動";
      return `${item?.name || id} x${count} [${kindLabel}]`;
    });
    const marketItems = (user.marketplace.inventory || []).slice(-8).reverse().map((item) => {
      const suffix = item.status === "expired" ? "（期限切れ）" : item.status === "refunded" ? "（返金済み）" : "";
      const expiry = item.expiresAt ? `期限 ${shortDate(item.expiresAt)}` : "買い切り";
      return `${item.name} / ${expiry}${suffix}`;
    });
    const orders = this.userOrders(user.id).slice(0, 5).map((order) => `#${order.id} ${order.itemName} / ${orderStatusLabel(order.status)}`);
    const components = [];
    if (consumables.length) {
      components.push(select("使う商品を選ぶ（使い切り）", consumables.map(([id, count]) =>
        option(`${this.officialItemDefinition(id).name}（残り${count}）`.slice(0, 90), `run:use ${id}`, this.officialItemDefinition(id).effect || "効果を発動"))));
    }
    const awaitingOrders = this.userOrders(user.id).filter((order) => ["open", "reported"].includes(order.status)).slice(0, 25);
    const reportableOrders = awaitingOrders.filter((order) => order.status === "open");
    if (awaitingOrders.length) {
      components.push(select("受け取り確認（取引を完了にする）", awaitingOrders.map((order) =>
        option(`#${order.id} ${order.itemName}`.slice(0, 90), `run:marketplace complete-order ${order.id}`, "商品を受け取ったら完了報告"))));
    }
    if (reportableOrders.length) {
      components.push(select("問題を報告する", reportableOrders.map((order) =>
        option(`#${order.id} ${order.itemName}`.slice(0, 90), `run:marketplace report-order ${order.id}`, "対応がない場合は運営に残す"))));
    }
    components.push(buttons([
      panelButton("ショップ", "marketplace"),
      panelButton("公式ショップ", "official-shop", "primary"),
      panelButton("民営ショップ", "user-shops", "primary")
    ]));
    return {
      title: "購入履歴・持ち物",
      description: "公式商品、民営商品、手動対応中の取引を確認できます。使い切り商品はここから使用できます。",
      color: 0x475569,
      fields: [
        { name: "公式持ち物", value: officialLines.join("\n") || "まだありません。", inline: false },
        { name: "民営持ち物", value: marketItems.join("\n") || "まだありません。", inline: false },
        { name: "取引中", value: orders.join("\n") || "対応待ちの取引はありません。", inline: false }
      ],
      components
    };
  }

  myShop(user) {
    return this.panelResult(this.myShopPanel(user));
  }

  myShopPanel(user) {
    const shop = this.ensureShopShape(user);
    const active = this.sellerListings(user.id).filter((listing) => listing.status === "active").length;
    const pending = this.sellerListings(user.id).filter((listing) => listing.status === "pending").length;
    const openOrders = this.sellerOrders(user.id).filter((order) => order.status === "open").length;
    const isClosed = (shop.shopStatus || "open") === "closed";
    return {
      title: `自分の店${isClosed ? "（休業中）" : ""}`,
      description: shop.shopOpened ? `${shop.shopName}\n${shop.shopDescription || "説明はまだありません。"}` : "店を開くと、商品を出品できるようになります。",
      color: isClosed ? 0x64748b : 0x14b8a6,
      fields: [
        { name: "営業", value: isClosed ? "休業中（購入不可）" : "営業中", inline: true },
        { name: "売上", value: fmt(shop.sales || 0), inline: true },
        { name: "出品中", value: `${active}件`, inline: true },
        { name: "審査待ち", value: `${pending}件`, inline: true },
        { name: "取引中", value: `${openOrders}件`, inline: true }
      ],
      components: [
        buttons([
          runButton(shop.shopOpened ? "店を確認" : "店を開く", "marketplace open-shop", "success"),
          customButton("店名・説明を編集", "eco:market:shop-settings", "primary"),
          customButton(isClosed ? "営業を再開する" : "休業中にする", "eco:shop:status-toggle", isClosed ? "success" : "danger", !shop.shopOpened),
          panelButton("商品を出す", "listing-new", "primary", !shop.shopOpened),
          panelButton("商品を管理", "my-listings")
        ]),
        buttons([
          panelButton("売上を見る", "my-sales"),
          panelButton("民営ショップ", "user-shops"),
          panelButton("ショップ", "marketplace")
        ])
      ]
    };
  }

  listingNewPanel(user) {
    const shop = this.ensureShopShape(user);
    const draft = shop.listingDraft || { type: "item", mode: "permanent" };
    return {
      title: "商品を出す",
      description: "種類と販売方式を選んでから、内容入力に進んでください。",
      color: 0x14b8a6,
      fields: [
        { name: "商品タイプ", value: productTypeLabel(draft.type), inline: true },
        { name: "販売方式", value: saleModeLabel(draft.mode), inline: true },
        { name: "審査", value: "高額商品、称号、権利、サービス、セット商品は審査待ちになります。ロールは公式のみの取り扱いです。", inline: false }
      ],
      components: [
        select("商品タイプ", Object.entries(MARKET_PRODUCT_TYPES).filter(([id]) => id !== "role").map(([id, label]) =>
          option(label, `run:marketplace listing-type ${id}`, `${label}として出品`)
        )),
        select("販売方式", Object.entries(MARKET_SALE_MODES).map(([id, label]) =>
          option(label, `run:marketplace listing-mode ${id}`, id === "timed" ? "期限付き商品" : "永続所持")
        )),
        buttons([
          customButton("内容入力", "eco:market:listing-create", "primary", !shop.shopOpened),
          panelButton("自分の店", "my-shop"),
          panelButton("ショップ", "marketplace")
        ])
      ]
    };
  }

  resubmitListingPromptPanel(user, id) {
    const listing = this.findListing(id);
    if (!listing || listing.sellerId !== user.id || listing.status !== "rejected") return this.myListingsPanel(user);
    return {
      title: `再提出 #${listing.id} ${listing.name}`,
      description: "却下された商品を修正して再提出します。「再提出モーダルを開く」を押すと現在の値が入った状態で開きます。空欄フィールドは元の値のまま使用されます。",
      color: 0xf59e0b,
      fields: [
        { name: "元の商品名", value: listing.name, inline: true },
        { name: "元の価格", value: fmt(listing.price), inline: true },
        { name: "元の在庫", value: `${listing.stock}`, inline: true },
        { name: "却下理由", value: listing.reviewNote || "（記入なし）", inline: false }
      ],
      components: [
        buttons([
          customButton("再提出モーダルを開く", `eco:shop:resubmit:${listing.id}`, "primary"),
          panelButton("商品管理へ戻る", "my-listings"),
          panelButton("自分の店", "my-shop")
        ])
      ]
    };
  }

  editListingPromptPanel(user, id) {
    const listing = this.findListing(id);
    if (!listing || listing.sellerId !== user.id) return this.myListingsPanel(user);
    return {
      title: `編集 #${listing.id} ${listing.name}`,
      description: "「編集モーダルを開く」を押すと、現在の値が入った状態でモーダルが開きます。変更したいフィールドだけ書き換えて送信してください。",
      color: 0x14b8a6,
      fields: [
        { name: "現在の商品名", value: listing.name, inline: true },
        { name: "現在の価格", value: fmt(listing.price), inline: true },
        { name: "現在の在庫", value: `${listing.stock}`, inline: true },
        { name: "現在のステータス", value: listingStatusLabel(listing.status), inline: true },
        { name: "現在の説明", value: listing.description || "説明なし", inline: false }
      ],
      components: [
        buttons([
          customButton("編集モーダルを開く", `eco:shop:edit:${listing.id}`, "primary"),
          panelButton("商品管理へ戻る", "my-listings"),
          panelButton("自分の店", "my-shop")
        ])
      ]
    };
  }

  myListingsPanel(user) {
    const listings = this.sellerListings(user.id).slice(0, 10);
    const editable = listings.filter((l) => !["rejected"].includes(l.status));
    const stoppable = listings.filter((l) => !["stopped", "rejected"].includes(l.status));
    const restartable = listings.filter((l) => l.status === "stopped" && l.stock > 0 && !l.resubmittedTo);
    const rejected = listings.filter((l) => l.status === "rejected");
    const components = [];
    if (editable.length) {
      components.push(select("編集する商品を選ぶ", editable.map((listing) =>
        option(`#${listing.id} ${listing.name}`.slice(0, 90), `run:marketplace edit-listing ${listing.id}`, `${listingStatusLabel(listing.status)} / ${fmt(listing.price)}`))));
    }
    if (stoppable.length) {
      components.push(select("停止する商品を選ぶ", stoppable.map((listing) =>
        option(`#${listing.id} ${listing.name}`.slice(0, 90), `run:marketplace stop-listing ${listing.id}`, "出品を停止する"))));
    }
    if (restartable.length) {
      components.push(select("再開する商品を選ぶ（停止済み）", restartable.map((listing) =>
        option(`#${listing.id} ${listing.name}`.slice(0, 90), `run:marketplace restart-listing ${listing.id}`, "再公開する"))));
    }
    if (rejected.length) {
      components.push(select("再提出する商品を選ぶ（却下済み）", rejected.map((listing) =>
        option(`#${listing.id} ${listing.name}`.slice(0, 90), `run:marketplace resubmit-listing ${listing.id}`, "修正モーダルを開く"))));
    }
    components.push(buttons([
      panelButton("商品を出す", "listing-new", "primary"),
      panelButton("自分の店", "my-shop"),
      panelButton("民営ショップ", "user-shops")
    ]));
    return {
      title: "商品管理",
      description: listings.length ? "出品中/審査待ち/停止/却下の商品を確認・編集できます。1件を選んで詳細操作します。" : "まだ出品がありません。",
      color: 0x14b8a6,
      fields: listings.map((listing) => ({
        name: `#${listing.id} ${listing.name}`,
        value: `${listingStatusLabel(listing.status)} / ${fmt(listing.price)} / 在庫 ${listing.stock}\n${productTypeLabel(listing.type)} / ${saleModeLabel(listing.mode)}${listing.reviewNote ? `\n却下理由: ${listing.reviewNote}` : ""}`,
        inline: false
      })),
      components: components.slice(0, 5)
    };
  }

  mySalesPanel(user) {
    const orders = this.sellerOrders(user.id).slice(0, 10);
    const components = [];
    components.push(buttons([
      panelButton("自分の店", "my-shop"),
      panelButton("商品管理", "my-listings"),
      panelButton("ショップ", "marketplace")
    ]));
    return {
      title: "売上・取引",
      description: "売上と手動対応中の商品を確認できます。手動対応商品の代金は、購入者が受け取り確認をした時点で支払われます。",
      color: 0x14b8a6,
      fields: [
        { name: "売上", value: fmt(user.marketplace.sales || 0), inline: true },
        { name: "取引", value: orders.length ? orders.map((order) => `#${order.id} ${order.itemName} / ${orderStatusLabel(order.status)}${order.payout === "held" ? " / 代金保留中" : ""}`).join("\n") : "まだ取引はありません。", inline: false }
      ],
      components
    };
  }

  officialAuctionsPanel(user) {
    this.closeEndedAuctions();
    const auctions = this.state.marketplace.auctions.filter((auction) => ["open", "scheduled"].includes(auction.status));
    const components = [];
    if (auctions.length) {
      components.push(select("オークションを選ぶ", auctions.map((auction) =>
        option(`#${auction.id} ${auction.name}`.slice(0, 90), `run:marketplace auction ${auction.id}`, `${fmt(auction.currentBid || auction.startPrice)} / 最低 ${fmt(this.minimumAuctionBid(auction))}`))));
    }
    components.push(buttons([
      panelButton("ショップ", "marketplace"),
      panelButton("公式ショップ", "official-shop", "primary"),
      panelButton("民営ショップ", "user-shops")
    ]));
    return {
      title: "公式オークション",
      description: auctions.length ? "公式競売です。入札額は一時的に拘束されます。" : "開催中の公式オークションはありません。",
      color: 0xf59e0b,
      fields: auctions.map((auction) => ({
        name: `#${auction.id} ${auction.name}`,
        value: `現在価格 ${fmt(auction.currentBid || auction.startPrice)}\n最低入札 ${fmt(this.minimumAuctionBid(auction))}\n終了 ${auction.endsAt ? shortDate(auction.endsAt) : "未設定"} / 入札 ${auction.bidCount || 0}件`,
        inline: true
      })),
      components
    };
  }

  auctionDetailPanel(user, id) {
    this.closeEndedAuctions();
    const auction = this.findAuction(id);
    if (!auction) return this.officialAuctionsPanel(user);
    const isOpen = auction.status === "open" && !this.isAuctionExpired(auction);
    const highest = auction.highestBidderName || "まだなし";
    return {
      title: `公式オークション #${auction.id}`,
      description: auction.description || "公式競売です。即決はありません。",
      color: isOpen ? 0xf59e0b : 0x64748b,
      fields: [
        { name: "商品", value: auction.name, inline: true },
        { name: "現在価格", value: fmt(auction.currentBid || auction.startPrice), inline: true },
        { name: "最低入札", value: fmt(this.minimumAuctionBid(auction)), inline: true },
        { name: "最高入札者", value: highest, inline: true },
        { name: "終了", value: auction.endsAt ? shortDate(auction.endsAt) : "未設定", inline: true },
        { name: "入札数", value: `${auction.bidCount || 0}`, inline: true },
        { name: "入札増分", value: fmt(auction.bidIncrement || Math.max(100, Math.ceil((auction.startPrice || 0) * 0.05))), inline: true },
        { name: "即決価格", value: auction.buyoutPrice ? fmt(auction.buyoutPrice) : "なし", inline: true },
        { name: "​", value: "​", inline: true },
        { name: "拘束", value: "入札額は一時的に財布から引かれます。上書きされた人には自動返金されます。即決価格に達すると即クローズします。", inline: false }
      ],
      components: [
        buttons([
          customButton("入札する", `eco:market:auction-bid:${auction.id}`, "primary", !isOpen),
          runButton("入札履歴", `marketplace auction-history ${auction.id}`),
          panelButton("公式オークション", "official-auctions"),
          panelButton("ショップ", "marketplace")
        ])
      ]
    };
  }

  auctionHistoryPanel(user, id) {
    const auction = this.findAuction(id);
    if (!auction) return this.officialAuctionsPanel(user);
    const bids = (auction.bids || []).slice(-10).reverse();
    return {
      title: `入札履歴 #${auction.id}`,
      description: auction.name,
      color: 0xf59e0b,
      fields: [
        {
          name: "履歴",
          value: bids.length
            ? bids.map((bid) => `${shortDate(bid.at)} ${bid.bidderName} / ${fmt(bid.amount)}`).join("\n")
            : "まだ入札はありません。",
          inline: false
        }
      ],
      components: [
        buttons([
          runButton("詳細へ戻る", `marketplace auction ${auction.id}`, "primary"),
          panelButton("公式オークション", "official-auctions"),
          panelButton("ショップ", "marketplace")
        ])
      ]
    };
  }

  marketAdminPanel(user) {
    const settings = this.state.marketplace.settings;
    const pending = this.state.marketplace.listings.filter((listing) => listing.status === "pending").length;
    const openOrders = this.state.marketplace.orders.filter((order) => order.status === "open").length;
    const openAuctions = this.state.marketplace.auctions.filter((auction) => auction.status === "open");
    const officialItems = Object.values(this.officialCustomItems());
    const pendingOfficialFulfillment = this.officialFulfillmentTasks().filter((task) => task.status === "pending").length;
    return {
      title: "ショップ管理",
      description: "公式商品、民営出品、取引対応を入口ごとに整理しています。詳細な設定は各画面から開けます。",
      color: 0x334155,
      fields: [
        { name: "民営出品", value: `公開 ${this.activeListings().length}件 / 審査待ち ${pending}件`, inline: true },
        { name: "取引対応", value: `対応待ち ${openOrders}件`, inline: true },
        { name: "公式商品", value: `販売中 ${officialItems.filter((item) => this.isOfficialItemOnSale(item)).length}件 / 停止・期間外 ${officialItems.length - officialItems.filter((item) => this.isOfficialItemOnSale(item)).length}件`, inline: true },
        { name: "公式対応キュー", value: `未完了 ${pendingOfficialFulfillment}件`, inline: true },
        { name: "公式オークション", value: `開催中 ${openAuctions.length}件`, inline: true },
        { name: "手数料", value: `${(settings.feeBps / 100).toFixed(1)}%`, inline: true },
        { name: "制限", value: `高額審査 ${fmt(settings.reviewPrice)} / 出品上限 ${settings.maxActiveListings}件`, inline: false }
      ],
      components: [
        buttons([
          panelButton("公式商品", "official-product-admin", "primary"),
          panelButton("民営出品", "user-shops"),
          panelButton("取引対応", "market-trades")
        ]),
        buttons([
          panelButton("出品審査", "market-review"),
          panelButton("公式オークション管理", "official-auction-admin"),
          customButton("ショップ設定", "eco:market:settings-edit", "secondary")
        ]),
        buttons([
          panelButton("ログ確認", "market-logs"),
          panelButton("ショップを確認", "marketplace"),
          panelButton("運営パネル", "admin")
        ])
      ]
    };
  }

  officialProductAdminPanel(user) {
    const items = Object.values(this.officialCustomItems());
    const selling = items.filter((item) => this.isOfficialItemOnSale(item)).length;
    const pending = this.officialFulfillmentTasks().filter((task) => task.status === "pending").length;
    return {
      title: "公式商品管理",
      description: "公式商品の追加・編集・販売停止と、購入後対応をここで行います。",
      color: 0x334155,
      fields: [
        { name: "販売状況", value: `販売中 ${selling}件 / 停止・期間外 ${items.length - selling}件`, inline: true },
        { name: "対応キュー", value: `未完了 ${pending}件`, inline: true },
        { name: "次の操作", value: "商品を追加した後は、一覧から在庫・販売期間・ロール・DM案内を編集できます。", inline: false }
      ],
      components: [
        buttons([
          customButton("商品を追加", "eco:market:official-item-create", "primary"),
          panelButton("対応キュー", "official-fulfillment"),
          panelButton("ショップを確認", "official-shop"),
          panelButton("戻る", "market-admin")
        ]),
        ...(items.length
          ? [select("編集する公式商品", items.slice(0, 25).map((item) =>
              option(`${item.name} [${officialItemStatusLabel(item.status)}]`.slice(0, 90), `run:marketplace official-manage ${item.id}`, `${fmt(item.price)} / ${item.stock === null ? "在庫無制限" : `在庫${item.stock}`}`.slice(0, 100))
            ))]
          : [])
      ]
    };
  }

  officialAuctionAdminPanel(user) {
    this.closeEndedAuctions();
    const openAuctions = this.state.marketplace.auctions.filter((auction) => auction.status === "open");
    const scheduledAuctions = this.state.marketplace.auctions.filter((auction) => auction.status === "scheduled");
    return {
      title: "公式オークション管理",
      description: "公式オークションの作成、開催状況の確認、緊急終了を行います。",
      color: 0x334155,
      fields: [
        { name: "開催中", value: `${openAuctions.length}件`, inline: true },
        { name: "開始待ち", value: `${scheduledAuctions.length}件`, inline: true },
        { name: "作成", value: "商品名、開始価格、即決価格、入札単位、開催時間を指定できます。", inline: false }
      ],
      components: [
        buttons([
          customButton("オークションを作成", "eco:market:auction-create", "success"),
          panelButton("開催中を確認", "official-auctions", "primary"),
          panelButton("戻る", "market-admin")
        ]),
        ...(openAuctions.length
          ? [select("緊急終了するオークション", openAuctions.slice(0, 25).map((auction) =>
              option(`#${auction.id} ${auction.name}`.slice(0, 90), `run:marketplace auction-end ${auction.id}`, `現在 ${fmt(auction.currentBid || auction.startPrice)}`)
            ))]
          : [])
      ]
    };
  }

  officialFulfillmentTasks() {
    return Array.isArray(this.state.marketplace.officialFulfillment) ? this.state.marketplace.officialFulfillment : [];
  }

  createOfficialFulfillment(user, item) {
    const id = this.state.marketplace.nextOfficialFulfillmentId++;
    const now = this.now().toISOString();
    const task = {
      id,
      itemId: item.id,
      itemName: item.name,
      buyerId: user.id,
      buyerName: user.name,
      roleId: item.roleId || null,
      roleDurationDays: Number(item.roleDurationDays) || 0,
      status: "pending",
      note: item.roleId ? "ロール付与待ち" : "運営対応待ち",
      createdAt: now,
      completedAt: null,
      completedBy: null,
      expiresAt: null
    };
    this.officialFulfillmentTasks().push(task);
    return task;
  }

  officialFulfillmentPanel(adminUser) {
    const tasks = this.officialFulfillmentTasks().filter((task) => task.status !== "completed").slice(-25).reverse();
    return {
      title: "公式商品対応キュー",
      description: "購入後の運営対応とロール付与の再試行を管理します。ここで完了にしても返金・残高処理は行いません。",
      color: 0x334155,
      fields: tasks.length ? tasks.map((task) => ({
        name: `#${task.id} ${task.itemName}`.slice(0, 256),
        value: `${task.buyerName} / ${officialFulfillmentStatusLabel(task.status)}\n${task.roleId ? `ロール: <@&${task.roleId}>${task.expiresAt ? ` / 期限 ${shortDate(task.expiresAt)}` : ""}` : "手動対応"}\n${task.note || "対応待ち"}`.slice(0, 1024),
        inline: false
      })) : [{ name: "対応待ちなし", value: "現在、運営対応が必要な公式商品の購入はありません。", inline: false }],
      components: [
        ...(tasks.length ? [select("対応する購入を選ぶ", tasks.map((task) =>
          option(`#${task.id} ${task.itemName}`.slice(0, 90), `run:marketplace official-fulfillment ${task.id}`, `${task.buyerName} / ${officialFulfillmentStatusLabel(task.status)}`.slice(0, 100))
        ))] : []),
        buttons([
          panelButton("ショップ管理", "market-admin"),
          panelButton("公式ショップ確認", "official-shop"),
          panelButton("ショップ", "marketplace")
        ])
      ]
    };
  }

  officialFulfillmentTaskPanel(adminUser, id) {
    const task = this.officialFulfillmentTask(id);
    if (!task) return this.officialFulfillmentPanel(adminUser);
    return {
      title: `公式商品対応 #${task.id}`,
      description: "ロールが設定されている場合は再試行でBotが付与を試みます。手動対応だけなら完了にしてください。",
      color: task.status === "completed" ? 0x16a34a : 0xf59e0b,
      fields: [
        { name: "購入者", value: task.buyerName, inline: true },
        { name: "商品", value: task.itemName, inline: true },
        { name: "状態", value: officialFulfillmentStatusLabel(task.status), inline: true },
        { name: "ロール", value: task.roleId ? `<@&${task.roleId}>` : "なし", inline: true },
        { name: "期限", value: task.roleDurationDays > 0 ? `${task.roleDurationDays}日` : "なし / 無期限", inline: true },
        { name: "メモ", value: task.note || "-", inline: false }
      ],
      components: [
        ...(task.status === "pending" ? [buttons([
          customButton("対応を完了", `eco:market:official-fulfillment-complete:${task.id}`, "success"),
          ...(task.roleId ? [customButton("ロールを再試行", `eco:market:official-fulfillment-retry:${task.id}`, "primary")] : []),
          panelButton("対応キュー", "official-fulfillment")
        ])] : []),
        buttons([panelButton("対応キュー", "official-fulfillment"), panelButton("ショップ管理", "market-admin")])
      ]
    };
  }

  officialFulfillmentTask(id) {
    return this.officialFulfillmentTasks().find((task) => String(task.id) === String(id)) || null;
  }

  completeOfficialFulfillment(adminUser, id, note = "運営対応を完了しました") {
    const task = this.officialFulfillmentTask(id);
    if (!task) return { ok: false, title: "対応キューが見つかりません", lines: ["対象の購入記録はありません。"] };
    if (task.status === "completed") return { ok: false, title: "すでに完了しています", lines: [`#${task.id} は完了済みです。`] };
    task.status = "completed";
    task.note = cleanMarketText(note, 240) || "運営対応を完了しました";
    task.completedAt = this.now().toISOString();
    task.completedBy = adminUser.id;
    this.marketLog(`${adminUser.name} が公式商品対応 #${task.id} を完了しました。`);
    return { ok: true, title: "公式商品対応を完了しました", lines: [`#${task.id} ${task.itemName}`, task.note], panel: this.officialFulfillmentPanel(adminUser) };
  }

  recordOfficialRoleGrant(id, data = {}) {
    const task = this.officialFulfillmentTask(id);
    if (!task || task.status === "completed") return null;
    const now = this.now();
    const expiresAt = task.roleDurationDays > 0
      ? new Date(now.getTime() + task.roleDurationDays * 24 * 60 * 60 * 1000).toISOString()
      : null;
    task.status = "completed";
    task.note = "ロールを付与しました";
    task.completedAt = now.toISOString();
    task.completedBy = data.completedBy || "bot";
    task.expiresAt = expiresAt;
    if (task.roleId) {
      this.state.marketplace.officialRoleGrants.push({
        fulfillmentId: task.id,
        guildId: data.guildId || null,
        userId: task.buyerId,
        discordUserId: data.discordUserId || null,
        roleId: task.roleId,
        expiresAt,
        status: "active",
        createdAt: now.toISOString(),
        revokedAt: null
      });
    }
    this.marketLog(`公式商品対応 #${task.id} のロール付与を記録しました。`);
    return task;
  }

  recordOfficialRoleGrantFailure(id, message) {
    const task = this.officialFulfillmentTask(id);
    if (!task || task.status === "completed") return null;
    task.status = "pending";
    task.note = cleanMarketText(message, 240) || "ロール付与に失敗しました。";
    return task;
  }

  updateMarketSettings(adminUser, patch = {}) {
    const settings = this.state.marketplace.settings;
    const changes = [];
    if (patch.feeBps !== undefined && patch.feeBps !== "") {
      const raw = Number(patch.feeBps);
      if (!Number.isFinite(raw) || raw < 0 || raw > 5000) {
        return { ok: false, title: "手数料が変です", lines: ["手数料は 0〜5000 bps（0.0%〜50.0%）で指定してください。"] };
      }
      const value = Math.round(raw);
      if (value !== settings.feeBps) { changes.push(`手数料: ${(settings.feeBps / 100).toFixed(1)}% → ${(value / 100).toFixed(1)}%`); settings.feeBps = value; }
    }
    if (patch.reviewPrice !== undefined && patch.reviewPrice !== "") {
      const value = parsePositiveInt(patch.reviewPrice);
      if (!Number.isFinite(value)) return { ok: false, title: "審査境界が変です", lines: ["高額審査境界は1以上の整数で入力してください。"] };
      if (value !== settings.reviewPrice) { changes.push(`高額審査境界: ${fmt(settings.reviewPrice)} → ${fmt(value)}`); settings.reviewPrice = value; }
    }
    if (patch.maxActiveListings !== undefined && patch.maxActiveListings !== "") {
      const value = parsePositiveInt(patch.maxActiveListings);
      if (!Number.isFinite(value) || value > 99) return { ok: false, title: "出品上限が変です", lines: ["出品上限は 1〜99 の整数で入力してください。"] };
      if (value !== settings.maxActiveListings) { changes.push(`出品上限: ${settings.maxActiveListings} → ${value}`); settings.maxActiveListings = value; }
    }
    if (patch.auctionExtendMinutes !== undefined && patch.auctionExtendMinutes !== "") {
      const value = parsePositiveInt(patch.auctionExtendMinutes);
      if (!Number.isFinite(value) || value > 60) return { ok: false, title: "延長分数が変です", lines: ["オークション延長分数は 1〜60 の整数で入力してください。"] };
      if (value !== settings.auctionExtendMinutes) { changes.push(`オークション延長: ${settings.auctionExtendMinutes}分 → ${value}分`); settings.auctionExtendMinutes = value; }
    }
    if (changes.length === 0) return { ok: false, title: "変更なし", lines: ["少なくとも1つの値を変更してください。"] };
    this.marketLog(`${adminUser.name} がショップ設定を更新: ${changes.slice(0, 3).join(" / ")}`);
    return { ok: true, title: "ショップ設定を更新しました", lines: changes, panel: this.marketAdminPanel(adminUser) };
  }

  resubmitListing(user, id, patch = {}) {
    const listing = this.findListing(id);
    if (!listing) return { ok: false, title: "商品が見つかりません", lines: [`#${id} は台帳にありません。`] };
    if (listing.sellerId !== user.id) return { ok: false, title: "自分の商品ではありません", lines: ["自分の出品だけ再提出できます。"] };
    if (listing.status !== "rejected") return { ok: false, title: "再提出対象ではありません", lines: [`#${listing.id} は却下商品ではありません。編集は「編集」から。`] };
    if (listing.type === "role") return { ok: false, title: "ロールは民営で出品できません", lines: ["ロール商品は公式のみの取り扱いになりました。再提出できません。"] };
    const shop = this.ensureShopShape(user);
    const activeCount = this.sellerListings(user.id).filter((l) => ["active", "pending"].includes(l.status)).length;
    if (activeCount >= this.state.marketplace.settings.maxActiveListings) {
      return { ok: false, title: "出品上限", lines: [`同時に出せる商品は ${this.state.marketplace.settings.maxActiveListings}件までです。`] };
    }
    const name = cleanMarketText(patch.name, 48) || listing.name;
    const description = cleanMarketText(patch.description, 240) || listing.description;
    const price = parsePositiveInt(patch.price);
    const stock = clamp(parsePositiveInt(patch.stock) || listing.stock, 1, 99);
    if (patch.name != null && !name) return { ok: false, title: "商品名が空です", lines: ["商品名を入力してください。"] };
    const newListing = {
      id: this.state.marketplace.nextListingId++,
      sellerId: user.id,
      sellerName: user.name,
      shopName: shop.shopName || `${user.name}の店`,
      name,
      type: listing.type,
      mode: listing.mode,
      price: Number.isFinite(price) ? price : listing.price,
      stock,
      sold: 0,
      description: description || "説明はありません。",
      durationDays: listing.durationDays || null,
      manual: listing.manual,
      status: "pending",
      createdAt: new Date().toISOString(),
      resubmittedFrom: listing.id
    };
    this.state.marketplace.listings.push(newListing);
    listing.status = "stopped";
    listing.resubmittedTo = newListing.id;
    listing.stoppedAt = new Date().toISOString();
    this.marketLog(`${user.name} が #${listing.id} を修正して #${newListing.id} として再提出しました。`);
    return {
      ok: true,
      title: "再提出しました（審査待ち）",
      lines: [`元: #${listing.id} → 新: #${newListing.id} ${newListing.name}`, "運営確認後に公開されます。"],
      panel: this.myListingsPanel(user)
    };
  }

  marketReviewPanel() {
    const pending = this.state.marketplace.listings.filter((listing) => listing.status === "pending").slice(0, 10);
    const rejected = this.state.marketplace.listings.filter((listing) => listing.status === "rejected").slice(-3);
    const components = [];
    if (pending.length) {
      components.push(select("審査する商品を選ぶ", pending.map((listing) =>
        option(`#${listing.id} ${listing.name}`.slice(0, 90), `run:marketplace review ${listing.id}`, `${fmt(listing.price)} / ${listing.sellerName}`))));
    }
    components.push(buttons([panelButton("ショップ管理", "market-admin"), panelButton("運営パネル", "admin")]));
    return {
      title: "出品審査",
      description: pending.length ? "審査待ちの商品です。1件を選んで承認/却下してください。" : "審査待ちの商品はありません。",
      color: 0x334155,
      fields: [
        ...pending.map((listing) => ({
          name: `#${listing.id} ${listing.name}`,
          value: `${fmt(listing.price)} / ${productTypeLabel(listing.type)} / ${saleModeLabel(listing.mode)}\n販売者: ${listing.sellerName}\n${listing.description || "説明なし"}`,
          inline: false
        })),
        ...(rejected.length
          ? [{
              name: "直近の却下",
              value: rejected.map((listing) => `#${listing.id} ${listing.name}${listing.reviewNote ? `（${listing.reviewNote.slice(0, 40)}）` : ""}`).join("\n"),
              inline: false
            }]
          : [])
      ],
      components
    };
  }

  reviewListingPanel(user, id) {
    const listing = this.findListing(id);
    if (!listing || listing.status !== "pending") return this.marketReviewPanel();
    return {
      title: `審査 #${listing.id} ${listing.name}`,
      description: listing.description || "説明はありません。",
      color: 0xf59e0b,
      fields: [
        { name: "販売者", value: listing.sellerName, inline: true },
        { name: "価格", value: fmt(listing.price), inline: true },
        { name: "在庫", value: `${listing.stock}`, inline: true },
        { name: "種類", value: productTypeLabel(listing.type), inline: true },
        { name: "販売方式", value: saleModeLabel(listing.mode), inline: true },
        { name: "手動対応", value: listing.manual ? "はい（購入後は取引中に入る）" : "いいえ（自動付与）", inline: true },
        { name: "提出日時", value: listing.createdAt ? shortDate(listing.createdAt) : "-", inline: false }
      ],
      components: [
        buttons([
          customButton("承認する", `eco:review:approve:${listing.id}`, "success"),
          customButton("却下する（理由入力）", `eco:review:reject:${listing.id}`, "danger"),
          panelButton("審査一覧に戻る", "market-review"),
          panelButton("ショップ管理", "market-admin")
        ])
      ]
    };
  }

  marketTradesPanel() {
    const openOrders = this.state.marketplace.orders
      .filter((order) => order.status === "open" || order.status === "reported")
      .slice(0, 10);
    const components = [];
    if (openOrders.length) {
      components.push(select("この取引を管理", openOrders.map((order) =>
        option(`#${order.id} ${order.itemName}`.slice(0, 90), `run:marketplace order ${order.id}`, `${order.buyerName} <- ${order.sellerName}`))));
    }
    components.push(buttons([panelButton("ショップ管理", "market-admin"), panelButton("運営パネル", "admin")]));
    return {
      title: "取引対応",
      description: openOrders.length ? "手動対応中または報告中の取引です。1件を選んで対応してください。" : "対応待ちの取引はありません。",
      color: 0x334155,
      fields: openOrders.map((order) => ({
        name: `#${order.id} ${order.itemName}${order.status === "reported" ? " ⚠問題報告" : ""}`,
        value: `購入者 ${order.buyerName} / 販売者 ${order.sellerName}\n${fmt(order.price)} / 手数料 ${fmt(order.fee || 0)} / ${productTypeLabel(order.type)}`,
        inline: false
      })),
      components
    };
  }

  adminOrderPanel(user, id) {
    const order = this.state.marketplace.orders.find((entry) => String(entry.id) === String(id));
    if (!order) return this.marketTradesPanel();
    const statusLabel = order.status === "open" ? "対応待ち" : order.status === "reported" ? "問題報告あり" : order.status === "refunded" ? "返金済み" : "完了";
    return {
      title: `取引対応 #${order.id} ${order.itemName}`,
      description: `販売者 ${order.sellerName} → 購入者 ${order.buyerName}`,
      color: order.status === "reported" ? 0xef4444 : 0x334155,
      fields: [
        { name: "商品", value: order.itemName, inline: true },
        { name: "種類", value: productTypeLabel(order.type), inline: true },
        { name: "販売方式", value: saleModeLabel(order.mode), inline: true },
        { name: "金額", value: fmt(order.price), inline: true },
        { name: "手数料", value: fmt(order.fee || 0), inline: true },
        { name: "状態", value: statusLabel, inline: true },
        { name: "代金", value: order.payout === "held" ? "エスクロー保留中" : order.payout === "cancelled" ? "返金で取消" : "販売者へ支払い済み", inline: true },
        { name: "手動対応", value: order.manual ? "はい" : "いいえ", inline: true },
        { name: "作成日時", value: order.createdAt ? shortDate(order.createdAt) : "-", inline: true }
      ],
      components: [
        buttons([
          customButton("完了扱いにする", `eco:order:complete:${order.id}`, "success", ["complete", "refunded"].includes(order.status)),
          customButton("返金する", `eco:order:refund:${order.id}`, "danger", order.status === "refunded"),
          panelButton("取引対応に戻る", "market-trades"),
          panelButton("ショップ管理", "market-admin")
        ])
      ]
    };
  }

  adminBalancePanel(user) {
    return {
      title: "残高操作",
      description: "個人の残高を直接操作する、ロール保持者の残高を揃える、ロール保持者に一律配布する、の3系統です。中央台帳との入出金として記録されます。",
      color: 0x0891b2,
      fields: [
        { name: "個人操作", value: "1人の残高を セット / 加算 / 減算 します。", inline: true },
        { name: "ロール一括セット", value: "ロール保持者全員の残高を同じ額に揃えます。", inline: true },
        { name: "給与配布", value: "ロール保持者全員に同じ額を追加で配布します。", inline: true }
      ],
      components: [
        buttons([
          customButton("個人セット", "eco:admin:balance-user-set", "primary"),
          customButton("個人加算", "eco:admin:balance-user-add", "success"),
          customButton("個人減算", "eco:admin:balance-user-sub", "danger")
        ]),
        buttons([
          customButton("ロール一括セット", "eco:admin:balance-role-set", "primary"),
          customButton("給与配布（ロール一括加算）", "eco:admin:salary-start", "success"),
          panelButton("運営パネル", "admin")
        ])
      ]
    };
  }

  adminRankPanel(user) {
    return {
      title: "ランク設定",
      description: "発言/通話ランクの昇格通知先と、住民向けランク確認パネルを管理します。",
      color: 0x7c3aed,
      fields: [
        { name: "ランク確認パネル", value: "住民が自分のランクと順位を見るための常設パネル。テキストチャンネルに1枚置くだけ。", inline: false },
        { name: "昇格通知先", value: "発言/通話ランクが上がった時にお祝いメッセージを投稿するチャンネル。未設定なら環境変数を使います。", inline: false },
        { name: "VC XP倍率設定", value: "通常XP対象カテゴリ/VCと、対象外VCのXP倍率を管理します。", inline: false }
      ],
      components: [
        buttons([
          customButton("ランク確認パネル設置", "eco:admin:rank-panel-post", "primary"),
          customButton("昇格通知先をここに", "eco:admin:rank-notify-set", "success"),
          customButton("昇格通知先をクリア", "eco:admin:rank-notify-clear"),
          panelButton("VC XP倍率設定", "vc-xp-location-settings", "primary"),
          panelButton("運営パネル", "admin")
        ]),
        buttons([
          customButton("TC一括リセット", "eco:admin:rank-reset-confirm:tc", "danger"),
          customButton("VC一括リセット", "eco:admin:rank-reset-confirm:vc", "danger"),
          customButton("TC/VC一括リセット", "eco:admin:rank-reset-confirm:both", "danger")
        ])
      ]
    };
  }

  marketLogsPanel() {
    return {
      title: "ログ確認",
      description: "直近のショップログです。",
      color: 0x334155,
      fields: [
        { name: "ログ", value: this.state.marketplace.logs.slice(-10).reverse().join("\n") || "まだログはありません。", inline: false }
      ],
      components: [buttons([panelButton("ショップ管理", "market-admin"), panelButton("運営パネル", "admin")])]
    };
  }

  shop(user) {
    return this.marketplace(user);
  }

  ensureShopShape(user) {
    user.marketplace = {
      shopOpened: false,
      shopName: "",
      shopDescription: "",
      shopStatus: "open",
      sales: 0,
      inventory: [],
      listingDraft: { type: "item", mode: "permanent" },
      ...(user.marketplace || {})
    };
    if (!["open", "closed"].includes(user.marketplace.shopStatus)) user.marketplace.shopStatus = "open";
    user.marketplace.inventory = Array.isArray(user.marketplace.inventory) ? user.marketplace.inventory : [];
    user.marketplace.listingDraft = { type: "item", mode: "permanent", ...(user.marketplace.listingDraft || {}) };
    return user.marketplace;
  }

  openShop(user) {
    const shop = this.ensureShopShape(user);
    if (!shop.shopOpened) {
      shop.shopOpened = true;
      shop.shopName = shop.shopName || `${user.name}の店`;
      shop.shopDescription = shop.shopDescription || "まだ何を売るか決まっていない店。";
      this.state.marketplace.shops[user.id] = {
        ownerId: user.id,
        ownerName: user.name,
        name: shop.shopName,
        description: shop.shopDescription,
        openedAt: new Date().toISOString()
      };
      this.marketLog(`${user.name} が店を開きました。`);
    }
    return this.myShop(user);
  }

  updateShopSettings(user, data = {}) {
    const shop = this.ensureShopShape(user);
    shop.shopOpened = true;
    shop.shopName = cleanMarketText(data.name, 40) || shop.shopName || `${user.name}の店`;
    shop.shopDescription = cleanMarketText(data.description, 120) || shop.shopDescription || "説明はまだありません。";
    this.state.marketplace.shops[user.id] = {
      ownerId: user.id,
      ownerName: user.name,
      name: shop.shopName,
      description: shop.shopDescription,
      openedAt: this.state.marketplace.shops[user.id]?.openedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.marketLog(`${user.name} が店の設定を更新しました。`);
    return this.myShop(user);
  }

  setListingDraft(user, patch = {}) {
    const shop = this.ensureShopShape(user);
    if (patch.type === "role") {
      return { ok: false, title: "ロールは民営で出品できません", lines: ["Discordロールの付与は運営にしかできないため、民営ショップでは扱えません。"], panel: this.listingNewPanel(user) };
    }
    if (patch.type && MARKET_PRODUCT_TYPES[patch.type]) shop.listingDraft.type = patch.type;
    if (patch.mode && MARKET_SALE_MODES[patch.mode]) shop.listingDraft.mode = patch.mode;
    return this.panelResult(this.listingNewPanel(user));
  }

  createUserListing(user, data = {}) {
    const shop = this.ensureShopShape(user);
    if (!shop.shopOpened) return { ok: false, title: "店がありません", lines: ["先に「店を開く」を押してください。"] };
    const activeCount = this.sellerListings(user.id).filter((listing) => ["active", "pending"].includes(listing.status)).length;
    const maxActive = this.state.marketplace.settings.maxActiveListings;
    if (activeCount >= maxActive) {
      return { ok: false, title: "出品上限", lines: [`同時に出せる商品は ${maxActive}件までです。`] };
    }
    const name = cleanMarketText(data.name, 48);
    const description = cleanMarketText(data.description, 240);
    const price = parsePositiveInt(data.price);
    const stock = clamp(parsePositiveInt(data.stock) || 1, 1, 99);
    const draft = shop.listingDraft || {};
    const type = MARKET_PRODUCT_TYPES[data.type] ? data.type : (MARKET_PRODUCT_TYPES[draft.type] ? draft.type : "item");
    if (type === "role") {
      return { ok: false, title: "ロールは民営で出品できません", lines: ["Discordロールの付与は運営にしかできないため、民営ショップでは扱えません。", "ロール商品は公式ショップ・公式オークションのみです。"] };
    }
    const mode = MARKET_SALE_MODES[data.mode] ? data.mode : (MARKET_SALE_MODES[draft.mode] ? draft.mode : "permanent");
    const durationDays = mode === "timed" ? clamp(parsePositiveInt(data.durationDays) || MARKETPLACE_CONFIG.defaultDurationDays, 1, 365) : null;
    if (!name) return { ok: false, title: "商品名が空です", lines: ["商品名を入力してください。"] };
    if (!Number.isFinite(price) || price <= 0) return { ok: false, title: "価格が変です", lines: ["価格は1以上の数字で入力してください。"] };

    const needsReview = price >= this.state.marketplace.settings.reviewPrice || ["role", "title", "right", "service", "bundle"].includes(type);
    const manual = ["role", "title", "right", "service", "bundle"].includes(type);
    const listing = {
      id: this.state.marketplace.nextListingId++,
      sellerId: user.id,
      sellerName: user.name,
      shopName: shop.shopName || `${user.name}の店`,
      name,
      type,
      mode,
      price,
      stock,
      sold: 0,
      description: description || "説明はありません。",
      durationDays,
      manual,
      status: needsReview ? "pending" : "active",
      createdAt: new Date().toISOString()
    };
    this.state.marketplace.listings.push(listing);
    this.marketLog(`${user.name} が ${listing.name} を出品しました。${needsReview ? "審査待ち。" : ""}`);
    return {
      ok: true,
      title: needsReview ? "出品しました（審査待ち）" : "出品しました",
      lines: [
        `${listing.name} / ${fmt(price)} / 在庫 ${stock}`,
        needsReview ? "高額または要注意タイプのため、運営確認後に公開されます。" : "民営ショップに公開されました。"
      ],
      panel: this.myListingsPanel(user)
    };
  }

  buyUserListing(user, id) {
    const listing = this.findListing(id);
    if (!listing || listing.status !== "active") return { ok: false, title: "買えません", lines: ["この商品は現在販売されていません。"] };
    if (listing.type === "role") return { ok: false, title: "買えません", lines: ["ロール商品は民営での取り扱いを終了しました。公式ショップ・公式オークションをご利用ください。"] };
    if (listing.sellerId === user.id) return { ok: false, title: "自分の商品です", lines: ["自分の商品は購入できません。"] };
    if (listing.stock <= 0) return { ok: false, title: "在庫切れ", lines: ["この商品は売り切れました。"] };
    const sellerRef = this.state.users[listing.sellerId];
    if ((sellerRef?.marketplace?.shopStatus || "open") === "closed") {
      return { ok: false, title: "現在休業中", lines: ["この店は現在休業中で購入できません。時間をおいてください。"] };
    }
    if (user.wallet < listing.price) {
      const panel = this.insufficientBalancePanel({
        itemName: listing.name,
        needed: listing.price,
        current: user.wallet,
        backCommand: `marketplace listing ${listing.id}`
      });
      return {
        ok: false,
        title: panel.title,
        lines: [
          `必要: ${fmt(listing.price)}`,
          `現在: ${fmt(user.wallet)}`,
          `不足: ${fmt(listing.price - user.wallet)}`
        ],
        panel
      };
    }

    const seller = this.getUser(listing.sellerId, listing.sellerName);
    const fee = Math.floor(listing.price * this.state.marketplace.settings.feeBps / 10000);
    const sellerReceive = listing.price - fee;
    // 手動対応商品は納品前の持ち逃げを防ぐため、購入者の受け取り確認（または運営完了）まで代金を預かる
    const escrow = Boolean(listing.manual);
    user.wallet -= listing.price;
    user.lifetimeLost += listing.price;
    if (!escrow) {
      seller.wallet += sellerReceive;
      seller.lifetimeEarned += sellerReceive;
      this.ensureShopShape(seller).sales += sellerReceive;
    }
    listing.stock -= 1;
    listing.sold += 1;
    if (listing.stock <= 0) listing.status = "soldout";

    const order = {
      id: this.state.marketplace.nextOrderId++,
      listingId: listing.id,
      itemName: listing.name,
      buyerId: user.id,
      buyerName: user.name,
      sellerId: seller.id,
      sellerName: seller.name,
      price: listing.price,
      fee,
      mode: listing.mode,
      type: listing.type,
      manual: listing.manual,
      payout: escrow ? "held" : "paid",
      status: listing.manual ? "open" : "complete",
      createdAt: new Date().toISOString(),
      expiresAt: listing.mode === "timed" ? new Date(Date.now() + listing.durationDays * 86400000).toISOString() : null
    };
    this.state.marketplace.orders.push(order);
    this.ensureShopShape(user).inventory.push({
      orderId: order.id,
      name: listing.name,
      type: listing.type,
      mode: listing.mode,
      sellerName: seller.name,
      acquiredAt: order.createdAt,
      expiresAt: order.expiresAt,
      status: order.status
    });
    this.marketLog(`${user.name} が ${seller.name} から ${listing.name} を購入しました。${escrow ? `代金 ${fmt(listing.price)} はエスクロー保留。` : ""}`);
    return {
      ok: true,
      title: listing.manual ? "購入完了（対応待ち）" : "購入完了",
      lines: [
        `商品: ${listing.name}`,
        `支払い: ${fmt(listing.price)}`,
        `残高: ${fmt(user.wallet)}`,
        listing.manual ? "この商品は販売者の手動対応が必要です。取引中の商品から確認できます。" : "付与が完了しました。",
        escrow ? "代金は受け取り確認まで運営預かりです。商品を受け取ったら持ち物パネルから受け取り確認をしてください。" : null
      ].filter(Boolean),
      panel: this.purchaseCompletePanel(user, {
        title: listing.manual ? "購入完了（対応待ち）" : "購入完了",
        itemName: listing.name,
        price: listing.price,
        description: listing.manual ? "販売者の手動対応が必要です。取引状況は持ち物から確認できます。" : "購入品は持ち物に記録されました。",
        anotherCommand: `marketplace shop-view ${listing.sellerId}`
      }),
      notifications: [
        {
          userId: seller.id,
          event: "listing_sold",
          data: {
            listingId: listing.id,
            itemName: listing.name,
            buyerName: user.name,
            price: listing.price,
            sellerReceive,
            manual: listing.manual
          }
        },
        {
          userId: user.id,
          event: "listing_purchased",
          data: {
            orderId: order.id,
            itemName: listing.name,
            sellerName: seller.name,
            price: listing.price,
            manual: listing.manual,
            mode: listing.mode,
            expiresAt: order.expiresAt
          }
        }
      ]
    };
  }

  approveListing(adminUser, id) {
    const listing = this.findListing(id);
    if (!listing) return { ok: false, title: "商品が見つかりません", lines: [`#${id} は台帳に載っていません。`] };
    if (listing.status !== "pending") return { ok: false, title: "審査できません", lines: [`#${listing.id} は現在 ${listingStatusLabel(listing.status)} です。`] };
    listing.status = "active";
    listing.reviewedAt = new Date().toISOString();
    listing.reviewedBy = adminUser.id;
    listing.reviewedByName = adminUser.name;
    this.marketLog(`${adminUser.name} が #${listing.id} ${listing.name} を承認しました。`);
    return {
      ok: true,
      title: "承認しました",
      lines: [`#${listing.id} ${listing.name} を公開しました。`, `販売者: ${listing.sellerName}`, `価格: ${fmt(listing.price)}`],
      panel: this.marketReviewPanel(),
      notifications: [
        {
          userId: listing.sellerId,
          event: "listing_approved",
          data: { listingId: listing.id, name: listing.name, price: listing.price }
        }
      ]
    };
  }

  rejectListing(adminUser, id, reason = "") {
    const listing = this.findListing(id);
    if (!listing) return { ok: false, title: "商品が見つかりません", lines: [`#${id} は台帳に載っていません。`] };
    if (listing.status !== "pending") return { ok: false, title: "審査できません", lines: [`#${listing.id} は現在 ${listingStatusLabel(listing.status)} です。`] };
    const trimmed = String(reason || "").replace(/\s+/g, " ").trim().slice(0, 200);
    listing.status = "rejected";
    listing.reviewedAt = new Date().toISOString();
    listing.reviewedBy = adminUser.id;
    listing.reviewedByName = adminUser.name;
    listing.reviewNote = trimmed;
    this.marketLog(`${adminUser.name} が #${listing.id} ${listing.name} を却下${trimmed ? `（${trimmed.slice(0, 40)}）` : ""}しました。`);
    return {
      ok: true,
      title: "却下しました",
      lines: [`#${listing.id} ${listing.name} を却下しました。`, `販売者: ${listing.sellerName}`, `理由: ${trimmed || "記入なし"}`],
      panel: this.marketReviewPanel(),
      notifications: [
        {
          userId: listing.sellerId,
          event: "listing_rejected",
          data: { listingId: listing.id, name: listing.name, reason: trimmed || "（理由記入なし）" }
        }
      ]
    };
  }

  stopListing(user, id) {
    const listing = this.findListing(id);
    if (!listing || listing.sellerId !== user.id) return { ok: false, title: "商品が見つかりません", lines: ["自分の出品だけ停止できます。"] };
    if (!["active", "pending", "soldout"].includes(listing.status)) {
      return { ok: false, title: "停止できません", lines: [`#${listing.id} は現在 ${listingStatusLabel(listing.status)} です。`] };
    }
    listing.status = "stopped";
    listing.stoppedAt = new Date().toISOString();
    this.marketLog(`${user.name} が ${listing.name} を停止しました。`);
    return { ok: true, title: "出品停止", lines: [`${listing.name} を停止しました。`], panel: this.myListingsPanel(user) };
  }

  // エスクロー保留中の代金を販売者に支払う。保留中でない注文（旧データ含む）は何もしない。
  releaseOrderPayout(order) {
    if (order.payout !== "held") return 0;
    const seller = this.getUser(order.sellerId, order.sellerName);
    const receive = Math.max(0, order.price - (order.fee || 0));
    seller.wallet += receive;
    seller.lifetimeEarned += receive;
    this.ensureShopShape(seller).sales += receive;
    order.payout = "paid";
    order.payoutAt = new Date().toISOString();
    this.marketLog(`#${order.id} ${order.itemName} のエスクロー ${fmt(receive)} を ${seller.name} に支払いました。`);
    return receive;
  }

  completeOrder(user, id) {
    const order = this.state.marketplace.orders.find((entry) => String(entry.id) === String(id));
    if (!order || order.buyerId !== user.id) {
      return { ok: false, title: "取引が見つかりません", lines: ["受け取り確認（完了報告）は購入者だけができます。"] };
    }
    if (["complete", "refunded", "expired"].includes(order.status)) {
      return { ok: false, title: "完了にできません", lines: [`#${order.id} は現在この状態です: ${order.status === "complete" ? "完了済み" : order.status === "refunded" ? "返金済み" : "期限切れ"}`] };
    }
    order.status = "complete";
    order.completedAt = new Date().toISOString();
    const buyerShop = this.ensureShopShape(user);
    for (const item of buyerShop.inventory || []) {
      if (String(item.orderId) === String(order.id)) item.status = "complete";
    }
    const paid = this.releaseOrderPayout(order);
    this.marketLog(`${user.name} が #${order.id} ${order.itemName} の受け取りを確認しました。`);
    return {
      ok: true,
      title: "受け取り確認",
      lines: [
        `#${order.id} ${order.itemName} を完了にしました。`,
        paid > 0 ? `預かっていた代金 ${fmt(paid)} を ${order.sellerName} に支払いました。` : null
      ].filter(Boolean),
      panel: this.marketInventoryPanel(user)
    };
  }

  reportOrder(user, id) {
    const order = this.state.marketplace.orders.find((entry) => String(entry.id) === String(id));
    if (!order || (order.sellerId !== user.id && order.buyerId !== user.id)) {
      return { ok: false, title: "取引が見つかりません", lines: ["関係者だけが報告できます。"] };
    }
    if (["refunded", "expired"].includes(order.status)) {
      return { ok: false, title: "報告できません", lines: [`#${order.id} はすでに${order.status === "refunded" ? "返金済み" : "期限切れ"}です。`] };
    }
    order.status = "reported";
    order.reportedAt = new Date().toISOString();
    this.marketLog(`#${order.id} ${order.itemName} に問題報告が入りました。`);
    return { ok: true, title: "問題を報告しました", lines: ["運営の取引対応に残ります。"], panel: this.marketInventoryPanel(user) };
  }

  adminCompleteOrder(adminUser, id) {
    const order = this.state.marketplace.orders.find((entry) => String(entry.id) === String(id));
    if (!order) return { ok: false, title: "取引が見つかりません", lines: [`#${id} は台帳に載っていません。`] };
    if (order.status === "complete") return { ok: false, title: "既に完了", lines: [`#${order.id} はすでに完了しています。`] };
    if (order.status === "refunded") return { ok: false, title: "返金済み", lines: [`#${order.id} は返金済みのため完了にできません。`] };
    order.status = "complete";
    order.completedAt = new Date().toISOString();
    order.completedBy = adminUser.id;
    order.completedByName = adminUser.name;
    order.completedByAdmin = true;
    const paid = this.releaseOrderPayout(order);
    this.marketLog(`${adminUser.name} が #${order.id} ${order.itemName} を運営完了にしました。`);
    return {
      ok: true,
      title: "運営完了処理",
      lines: [
        `#${order.id} ${order.itemName} を完了扱いにしました。`,
        `販売者: ${order.sellerName} / 購入者: ${order.buyerName}`,
        paid > 0 ? `預かっていた代金 ${fmt(paid)} を販売者に支払いました。` : null
      ].filter(Boolean),
      panel: this.marketTradesPanel(),
      notifications: [
        {
          userId: order.buyerId,
          event: "order_admin_completed",
          data: { orderId: order.id, itemName: order.itemName }
        }
      ]
    };
  }

  adminRefundOrder(adminUser, id) {
    const order = this.state.marketplace.orders.find((entry) => String(entry.id) === String(id));
    if (!order) return { ok: false, title: "取引が見つかりません", lines: [`#${id} は台帳に載っていません。`] };
    if (order.status === "refunded") return { ok: false, title: "返金済み", lines: [`#${order.id} はすでに返金済みです。`] };

    const buyer = this.getUser(order.buyerId, order.buyerName);
    buyer.wallet += order.price;
    buyer.lifetimeEarned += order.price;

    const notifications = [
      {
        userId: order.buyerId,
        event: "order_refunded",
        data: { orderId: order.id, itemName: order.itemName, amount: order.price, role: "buyer" }
      }
    ];

    const wasHeld = order.payout === "held";
    if (order.sellerId !== "official") {
      const seller = this.getUser(order.sellerId, order.sellerName);
      const sellerReceive = Math.max(0, order.price - (order.fee || 0));
      if (wasHeld) {
        // エスクロー保留中の代金は販売者に渡っていないので、残高調整なしで預かり分を返すだけ
        order.payout = "cancelled";
      } else {
        seller.wallet = Math.max(0, seller.wallet - sellerReceive);
        seller.lifetimeLost += sellerReceive;
        const shop = this.ensureShopShape(seller);
        shop.sales = Math.max(0, (shop.sales || 0) - sellerReceive);
      }

      const listing = this.findListing(order.listingId);
      if (listing) {
        listing.stock = (listing.stock || 0) + 1;
        listing.sold = Math.max(0, (listing.sold || 0) - 1);
        if (listing.status === "soldout" && listing.stock > 0) listing.status = "active";
      }
      notifications.push({
        userId: order.sellerId,
        event: "order_refunded",
        data: { orderId: order.id, itemName: order.itemName, amount: wasHeld ? 0 : sellerReceive, role: "seller" }
      });
    }

    const buyerShop = this.ensureShopShape(buyer);
    buyerShop.inventory = buyerShop.inventory.filter((item) => String(item.orderId) !== String(order.id));

    order.status = "refunded";
    order.refundedAt = new Date().toISOString();
    order.refundedBy = adminUser.id;
    order.refundedByName = adminUser.name;
    this.marketLog(`${adminUser.name} が #${order.id} ${order.itemName} を返金しました（${fmt(order.price)}）。`);
    return {
      ok: true,
      title: "返金完了",
      lines: [
        `#${order.id} ${order.itemName} を返金しました。`,
        `購入者 ${buyer.name} に ${fmt(order.price)} を戻し、購入品を持ち物から削除しました。`,
        order.sellerId === "official"
          ? "販売者は公式のため、売上調整は不要です。"
          : wasHeld
            ? "代金はエスクロー保留中だったため、販売者の残高調整はありません（在庫のみ戻しました）。"
            : `販売者 ${order.sellerName} の売上と在庫を巻き戻しました。`
      ],
      panel: this.marketTradesPanel(),
      notifications
    };
  }

  expireEndedOrders() {
    const now = Date.now();
    const notifications = [];
    const expired = [];
    for (const order of this.state.marketplace.orders) {
      if (order.mode !== "timed") continue;
      if (!order.expiresAt) continue;
      if (["expired", "refunded"].includes(order.status)) continue;
      const t = new Date(order.expiresAt).getTime();
      if (!Number.isFinite(t) || t > now) continue;
      order.status = "expired";
      order.expiredAt = new Date(now).toISOString();
      expired.push(order);
      const buyer = this.state.users[order.buyerId];
      if (buyer?.marketplace?.inventory) {
        for (const item of buyer.marketplace.inventory) {
          if (String(item.orderId) === String(order.id)) {
            item.status = "expired";
            item.expiredAt = order.expiredAt;
          }
        }
      }
      notifications.push({
        userId: order.buyerId,
        event: "listing_expired",
        data: { orderId: order.id, itemName: order.itemName }
      });
      this.marketLog(`#${order.id} ${order.itemName} が期限切れになりました。`);
    }
    return { expired, notifications };
  }

  createOfficialAuction(adminUser, data = {}) {
    const name = cleanMarketText(data.name, 48);
    const description = cleanMarketText(data.description, 240);
    const startPrice = parsePositiveInt(data.startPrice);
    const durationMinutes = clamp(parsePositiveInt(data.durationMinutes) || 60, 5, 10080);
    const type = MARKET_PRODUCT_TYPES[data.type] ? data.type : "title";
    if (!name) return { ok: false, title: "商品名が空です", lines: ["商品名を入力してください。"] };
    if (!Number.isFinite(startPrice) || startPrice <= 0) return { ok: false, title: "開始価格が変です", lines: ["開始価格は1以上の数字で入力してください。"] };

    const bidIncrementRaw = parsePositiveInt(data.bidIncrement);
    const bidIncrement = Number.isFinite(bidIncrementRaw) ? bidIncrementRaw : Math.max(100, Math.ceil(startPrice * 0.05));
    const buyoutRaw = parsePositiveInt(data.buyoutPrice);
    const buyoutPrice = Number.isFinite(buyoutRaw) ? buyoutRaw : null;
    if (buyoutPrice !== null && buyoutPrice <= startPrice) {
      return { ok: false, title: "即決価格が低すぎ", lines: ["即決価格は開始価格より大きくしてください。"] };
    }

    const now = new Date();
    const auction = {
      id: this.state.marketplace.nextAuctionId++,
      name,
      type,
      mode: "permanent",
      description: description || "公式オークション商品です。",
      startPrice,
      currentBid: 0,
      bidIncrement,
      buyoutPrice,
      highestBidderId: null,
      highestBidderName: null,
      bidCount: 0,
      bids: [],
      status: "open",
      createdBy: adminUser.id,
      createdByName: adminUser.name,
      createdAt: now.toISOString(),
      endsAt: new Date(now.getTime() + durationMinutes * 60000).toISOString()
    };
    this.state.marketplace.auctions.push(auction);
    this.marketLog(`${adminUser.name} が公式オークション #${auction.id} ${auction.name} を開始しました。`);
    return {
      ok: true,
      title: "公式オークション作成",
      lines: [
        `商品: ${auction.name}`,
        `開始価格: ${fmt(startPrice)}`,
        `入札増分: ${fmt(bidIncrement)}`,
        buyoutPrice ? `即決価格: ${fmt(buyoutPrice)}` : "即決価格: なし",
        `終了: ${shortDate(auction.endsAt)}`
      ],
      panel: this.auctionDetailPanel(adminUser, auction.id)
    };
  }

  placeAuctionBid(user, id, amountRaw) {
    this.closeEndedAuctions();
    const auction = this.findAuction(id);
    if (!auction || auction.status !== "open") return { ok: false, title: "入札できません", lines: ["このオークションは開催中ではありません。"] };
    if (this.isAuctionExpired(auction)) {
      this.closeAuction(auction, "expired");
      return { ok: false, title: "終了済み", lines: ["このオークションは終了しました。"], panel: this.auctionDetailPanel(user, id) };
    }
    const amount = parsePositiveInt(amountRaw);
    const minimum = this.minimumAuctionBid(auction);
    if (!Number.isFinite(amount) || amount < minimum) {
      return {
        ok: false,
        title: "入札額が足りません",
        lines: [`最低入札: ${fmt(minimum)}`, amount ? `入力: ${fmt(amount)}` : "数字で入力してください。"],
        panel: this.auctionDetailPanel(user, id)
      };
    }
    const previousOwnBid = auction.highestBidderId === user.id ? auction.currentBid : 0;
    const required = amount - previousOwnBid;
    if (required <= 0) {
      return { ok: false, title: "入札額が変です", lines: ["現在の自分の入札額より高くしてください。"], panel: this.auctionDetailPanel(user, id) };
    }
    if (user.wallet < required) {
      return {
        ok: false,
        title: "残高が足りません",
        lines: [`必要: ${fmt(required)}`, `現在: ${fmt(user.wallet)}`, `不足: ${fmt(required - user.wallet)}`],
        panel: this.auctionDetailPanel(user, id)
      };
    }

    if (auction.highestBidderId && auction.highestBidderId !== user.id && auction.currentBid > 0) {
      const previous = this.getUser(auction.highestBidderId, auction.highestBidderName);
      previous.wallet += auction.currentBid;
      this.marketLog(`${previous.name} に #${auction.id} の上書き返金 ${fmt(auction.currentBid)}。`);
    }

    user.wallet -= required;
    user.lifetimeLost += required;
    auction.currentBid = amount;
    auction.highestBidderId = user.id;
    auction.highestBidderName = user.name;
    auction.bidCount = (auction.bidCount || 0) + 1;
    auction.bids = Array.isArray(auction.bids) ? auction.bids : [];
    auction.bids.push({ bidderId: user.id, bidderName: user.name, amount, at: new Date().toISOString() });
    auction.bids = auction.bids.slice(-50);

    const outbidNotifications = [];
    if (auction.highestBidderId && auction.highestBidderId !== user.id && auction.currentBid > 0) {
      // 上書きされた前の入札者は前段で返金済み。ここで通知イベント積む。
      outbidNotifications.push({
        userId: auction.highestBidderId,
        event: "auction_outbid",
        data: {
          auctionId: auction.id,
          name: auction.name,
          previousBid: auction.currentBid,
          newBid: amount,
          newBidderName: user.name
        }
      });
    }

    if (auction.buyoutPrice && amount >= auction.buyoutPrice) {
      this.marketLog(`${user.name} が #${auction.id} ${auction.name} を即決価格 ${fmt(auction.buyoutPrice)} で落札しました。`);
      const closeResult = this.closeAuction(auction, "buyout");
      return {
        ok: true,
        title: "即決落札",
        lines: [
          `商品: ${auction.name}`,
          `即決価格 ${fmt(auction.buyoutPrice)} に達したため即落札しました。`,
          ...closeResult.lines
        ],
        panel: this.auctionDetailPanel(user, id),
        notifications: [...outbidNotifications, ...(closeResult.notifications || [])]
      };
    }

    const extended = this.extendAuctionIfNeeded(auction);
    this.marketLog(`${user.name} が #${auction.id} ${auction.name} に ${fmt(amount)} で入札しました。`);
    return {
      ok: true,
      title: "入札しました",
      lines: [
        `商品: ${auction.name}`,
        `入札額: ${fmt(amount)}`,
        auction.buyoutPrice ? `即決価格: ${fmt(auction.buyoutPrice)}` : null,
        `残高: ${fmt(user.wallet)}`,
        extended ? `終了直前のため ${MARKETPLACE_CONFIG.auctionExtendMinutes}分延長しました。` : `終了: ${shortDate(auction.endsAt)}`
      ].filter(Boolean),
      panel: this.auctionDetailPanel(user, id),
      notifications: outbidNotifications
    };
  }

  forceEndAuction(user, id) {
    const auction = this.findAuction(id);
    if (!auction) return { ok: false, title: "競売が見つかりません", lines: ["指定された公式オークションはありません。"] };
    if (auction.status !== "open") return { ok: false, title: "終了済み", lines: ["このオークションはすでに終了しています。"], panel: this.auctionDetailPanel(user, id) };
    const result = this.closeAuction(auction, "forced");
    return {
      ok: true,
      title: "公式オークション終了",
      lines: result.lines,
      panel: this.auctionDetailPanel(user, id),
      notifications: result.notifications || []
    };
  }

  closeEndedAuctions() {
    const closed = [];
    const notifications = [];
    for (const auction of this.state.marketplace.auctions) {
      if (auction.status === "open" && this.isAuctionExpired(auction)) {
        const res = this.closeAuction(auction, "expired");
        closed.push(res);
        if (res.notifications) notifications.push(...res.notifications);
      }
    }
    return { closed, notifications };
  }

  closeAuction(auction, reason = "expired") {
    auction.status = "ended";
    auction.endedAt = new Date().toISOString();
    auction.endReason = reason;
    if (!auction.highestBidderId || !auction.currentBid) {
      this.marketLog(`#${auction.id} ${auction.name} は入札なしで終了しました。`);
      return { lines: [`${auction.name} は入札なしで終了しました。`], notifications: [] };
    }

    const winner = this.getUser(auction.highestBidderId, auction.highestBidderName);
    const acquiredAt = new Date().toISOString();
    this.ensureShopShape(winner).inventory.push({
      orderId: `auction-${auction.id}`,
      name: auction.name,
      type: auction.type,
      mode: auction.mode || "permanent",
      sellerName: "公式オークション",
      acquiredAt,
      expiresAt: null,
      status: "complete"
    });
    const order = {
      id: this.state.marketplace.nextOrderId++,
      listingId: `auction-${auction.id}`,
      itemName: auction.name,
      buyerId: winner.id,
      buyerName: winner.name,
      sellerId: "official",
      sellerName: "公式オークション",
      price: auction.currentBid,
      fee: 0,
      mode: auction.mode || "permanent",
      type: auction.type,
      manual: false,
      status: "complete",
      createdAt: acquiredAt,
      completedAt: acquiredAt,
      expiresAt: null
    };
    this.state.marketplace.orders.push(order);
    this.marketLog(`#${auction.id} ${auction.name} を ${winner.name} が ${fmt(auction.currentBid)} で落札しました。`);
    return {
      lines: [`落札者: ${winner.name}`, `落札額: ${fmt(auction.currentBid)}`, `商品: ${auction.name}`],
      notifications: [
        {
          userId: winner.id,
          event: "auction_won",
          data: {
            auctionId: auction.id,
            name: auction.name,
            winningBid: auction.currentBid,
            reason
          }
        }
      ]
    };
  }

  minimumAuctionBid(auction) {
    const base = auction.currentBid || 0;
    if (base <= 0) return auction.startPrice || 1;
    return base + (auction.bidIncrement || Math.max(100, Math.ceil(base * 0.05)));
  }

  extendAuctionIfNeeded(auction) {
    const endsAt = new Date(auction.endsAt).getTime();
    if (!Number.isFinite(endsAt)) return false;
    const extendMs = (this.state.marketplace.settings.auctionExtendMinutes || MARKETPLACE_CONFIG.auctionExtendMinutes) * 60000;
    const now = Date.now();
    if (endsAt - now > extendMs) return false;
    auction.endsAt = new Date(now + extendMs).toISOString();
    return true;
  }

  isAuctionExpired(auction) {
    const endsAt = new Date(auction.endsAt).getTime();
    return Number.isFinite(endsAt) && endsAt <= Date.now();
  }

  findAuction(id) {
    return this.state.marketplace.auctions.find((auction) => String(auction.id) === String(id));
  }

  activeListings() {
    return this.state.marketplace.listings.filter((listing) => {
      if (listing.status !== "active" || listing.stock <= 0) return false;
      const seller = this.state.users[listing.sellerId];
      const status = seller?.marketplace?.shopStatus || "open";
      return status === "open";
    });
  }

  searchListings({ keyword = "", minPrice = "", maxPrice = "", type = "", sort = "newest" } = {}) {
    const kw = String(keyword || "").toLowerCase().trim();
    const min = parsePositiveInt(minPrice);
    const max = parsePositiveInt(maxPrice);
    const typeMap = { "ロール": "role", "称号": "title", "アイテム": "item", "チケット": "ticket", "権利": "right", "サービス": "service", "セット": "bundle", "セット商品": "bundle" };
    const typeKey = MARKET_PRODUCT_TYPES[type] ? type : (typeMap[String(type || "").trim()] || null);
    const filtered = this.activeListings().filter((listing) => {
      if (kw && !String(listing.name).toLowerCase().includes(kw) && !String(listing.description || "").toLowerCase().includes(kw)) return false;
      if (typeKey && listing.type !== typeKey) return false;
      if (Number.isFinite(min) && listing.price < min) return false;
      if (Number.isFinite(max) && listing.price > max) return false;
      return true;
    });
    const normalizedSort = String(sort || "newest").toLowerCase();
    if (normalizedSort === "price_asc" || normalizedSort === "price-asc" || normalizedSort === "安い順") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (normalizedSort === "price_desc" || normalizedSort === "price-desc" || normalizedSort === "高い順") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (normalizedSort === "oldest" || normalizedSort === "古い順") {
      filtered.sort((a, b) => a.id - b.id);
    } else {
      filtered.sort((a, b) => b.id - a.id);
    }
    return filtered;
  }

  editListing(user, id, patch = {}) {
    const listing = this.findListing(id);
    if (!listing) return { ok: false, title: "商品が見つかりません", lines: [`#${id} は台帳にありません。`] };
    if (listing.sellerId !== user.id) return { ok: false, title: "自分の商品ではありません", lines: ["自分の出品だけ編集できます。"] };
    if (["rejected"].includes(listing.status)) return { ok: false, title: "却下済み", lines: ["却下された商品は編集できません。新しく出品してください。"] };
    const changes = [];
    if (patch.name != null && String(patch.name).trim() !== "") {
      const name = cleanMarketText(patch.name, 48);
      if (name && name !== listing.name) { changes.push(`名前: ${listing.name} → ${name}`); listing.name = name; }
    }
    if (patch.price != null && String(patch.price).trim() !== "") {
      const price = parsePositiveInt(patch.price);
      if (Number.isFinite(price) && price !== listing.price) { changes.push(`価格: ${fmt(listing.price)} → ${fmt(price)}`); listing.price = price; }
    }
    if (patch.stock != null && String(patch.stock).trim() !== "") {
      const stock = clamp(parsePositiveInt(patch.stock) || 1, 1, 99);
      if (Number.isFinite(stock) && stock !== listing.stock) { changes.push(`在庫: ${listing.stock} → ${stock}`); listing.stock = stock; }
    }
    if (patch.description != null && String(patch.description).trim() !== "") {
      const desc = cleanMarketText(patch.description, 240);
      if (desc && desc !== listing.description) { changes.push("説明を更新"); listing.description = desc; }
    }
    if (changes.length === 0) return { ok: false, title: "変更がありません", lines: ["少なくとも1つのフィールドを変更してください。"] };
    listing.updatedAt = new Date().toISOString();
    if (listing.status === "soldout" && listing.stock > 0) listing.status = "active";
    // 承認後に価格や内容を差し替えて審査を迂回できないよう、内容変更は再審査に回す
    const contentChanged = changes.some((change) => !change.startsWith("在庫:"));
    const needsReview =
      contentChanged &&
      listing.status === "active" &&
      (listing.price >= this.state.marketplace.settings.reviewPrice ||
        ["role", "title", "right", "service", "bundle"].includes(listing.type));
    if (needsReview) {
      listing.status = "pending";
      changes.push("内容が変わったため再審査に回りました");
    }
    this.marketLog(`${user.name} が #${listing.id} を編集: ${changes.slice(0, 3).join(" / ")}${needsReview ? "（再審査待ち）" : ""}`);
    return {
      ok: true,
      title: needsReview ? "商品を更新しました（再審査待ち）" : "商品を更新しました",
      lines: [`#${listing.id} ${listing.name}`, ...changes],
      panel: this.myListingsPanel(user)
    };
  }

  restartListing(user, id) {
    const listing = this.findListing(id);
    if (!listing) return { ok: false, title: "商品が見つかりません", lines: [`#${id} は台帳にありません。`] };
    if (listing.sellerId !== user.id) return { ok: false, title: "自分の商品ではありません", lines: ["自分の出品だけ再開できます。"] };
    if (listing.status !== "stopped") return { ok: false, title: "再開できません", lines: [`#${listing.id} は現在 ${listingStatusLabel(listing.status)} です。停止済みの商品だけ再開できます。`] };
    if (listing.type === "role") return { ok: false, title: "ロールは民営で出品できません", lines: ["ロール商品は公式のみの取り扱いになりました。再開できません。"] };
    if (listing.stock <= 0) return { ok: false, title: "在庫切れ", lines: ["在庫が0の商品は再開できません。編集で在庫を増やしてください。"] };
    const needsReview = listing.price >= this.state.marketplace.settings.reviewPrice || ["role", "title", "right", "service", "bundle"].includes(listing.type);
    listing.status = needsReview ? "pending" : "active";
    listing.updatedAt = new Date().toISOString();
    delete listing.stoppedAt;
    this.marketLog(`${user.name} が #${listing.id} ${listing.name} を再開しました。${needsReview ? "審査待ち。" : ""}`);
    return {
      ok: true,
      title: needsReview ? "再開しました（審査待ち）" : "再開しました",
      lines: [`#${listing.id} ${listing.name}`, needsReview ? "高額または要注意タイプのため、運営確認後に再公開されます。" : "民営ショップに再公開されました。"],
      panel: this.myListingsPanel(user)
    };
  }

  setNotifyEnabled(user, enabled) {
    const before = Boolean(user.notifyEnabled);
    const after = Boolean(enabled);
    user.notifyEnabled = after;
    if (before === after) {
      return {
        ok: false,
        title: "変化なし",
        lines: [`すでに通知は${after ? "ON" : "OFF"}です。`],
        panel: this.notifyPanel(user)
      };
    }
    this.log(user, "notify_toggle", after ? 1 : 0, after ? "通知ON" : "通知OFF");
    return {
      ok: true,
      title: after ? "通知をONにしました" : "通知をOFFにしました",
      lines: [
        after
          ? "承認/却下/売れた/落札/返金/期限切れなどをDMで受け取ります。DM拒否設定の人はログチャンネルに届きます。"
          : "通知は届きません（ログチャンネルには従来通り記録が残ります）。"
      ],
      panel: this.notifyPanel(user)
    };
  }

  notifyPanel(user) {
    const enabled = Boolean(user.notifyEnabled);
    return {
      title: "通知設定",
      description: enabled ? "現在: **通知ON**（DM で受信）" : "現在: **通知OFF**（受信しない）",
      color: enabled ? 0x22c55e : 0x64748b,
      fields: [
        { name: "対象イベント", value: "出品承認/却下/売れた/落札/入札上書き/返金/期限切れ", inline: false },
        { name: "配信先", value: "設定ONの場合、Botから DM。DM拒否ならログチャンネルに fallback。", inline: false }
      ],
      components: [
        buttons([
          customButton(enabled ? "通知をOFFにする" : "通知をONにする", "eco:user:notify-toggle", enabled ? "danger" : "success"),
          panelButton("ホーム", "home")
        ])
      ]
    };
  }

  setShopStatus(user, statusRaw) {
    const shop = this.ensureShopShape(user);
    if (!shop.shopOpened) return { ok: false, title: "店がありません", lines: ["先に「店を開く」を押してください。"] };
    const target = statusRaw === "closed" ? "closed" : "open";
    if (shop.shopStatus === target) {
      return { ok: false, title: "変化なし", lines: [`すでに${target === "open" ? "営業中" : "休業中"}です。`], panel: this.myShopPanel(user) };
    }
    shop.shopStatus = target;
    shop.shopStatusChangedAt = new Date().toISOString();
    this.state.marketplace.shops[user.id] = {
      ...this.state.marketplace.shops[user.id],
      ownerId: user.id,
      ownerName: user.name,
      name: shop.shopName,
      description: shop.shopDescription,
      shopStatus: target,
      updatedAt: shop.shopStatusChangedAt
    };
    this.marketLog(`${user.name} の店を${target === "open" ? "営業中" : "休業中"}に切り替え。`);
    return {
      ok: true,
      title: target === "open" ? "営業を再開しました" : "休業中にしました",
      lines: [
        target === "closed"
          ? "商品は民営ショップと検索から除外され、購入できなくなります。停止しなくてもOKです。"
          : "商品が民営ショップと検索に再表示されます。"
      ],
      panel: this.myShopPanel(user)
    };
  }

  openShopSellerIds() {
    const ids = new Set();
    for (const [id, u] of Object.entries(this.state.users || {})) {
      const shop = u.marketplace;
      if (shop?.shopOpened && (shop.shopStatus || "open") === "open") ids.add(id);
    }
    return ids;
  }

  sellerListings(userId) {
    return this.state.marketplace.listings
      .filter((listing) => listing.sellerId === userId)
      .sort((a, b) => b.id - a.id);
  }

  sellerOrders(userId) {
    return this.state.marketplace.orders
      .filter((order) => order.sellerId === userId)
      .sort((a, b) => b.id - a.id);
  }

  userOrders(userId) {
    return this.state.marketplace.orders
      .filter((order) => order.buyerId === userId || order.sellerId === userId)
      .sort((a, b) => b.id - a.id);
  }

  findListing(id) {
    return this.state.marketplace.listings.find((listing) => String(listing.id) === String(id));
  }

  officialStockLine(user, id) {
    const item = this.officialItemDefinition(id);
    if (!item) return "-";
    return `${user.inventory[id] || 0}/${item.max}`;
  }

  marketLog(line) {
    this.state.marketplace.logs.push(`${shortDate(new Date().toISOString())} ${line}`);
    this.state.marketplace.logs = this.state.marketplace.logs.slice(-80);
  }

  buyItem(user, id) {
    const item = this.officialItem(id);
    if (!item) {
      return { ok: false, title: "棚にない商品", lines: ["この商品は現在販売していません。公式ショップの棚を確認してください。"] };
    }

    const owned = user.inventory[id] || 0;
    if (owned >= item.max) {
      return { ok: false, title: "持ちすぎ", lines: [`${item.name} はこれ以上持てません。`] };
    }

    const price = this.itemPrice(id);
    if (user.wallet < price) {
      const panel = this.insufficientBalancePanel({
        title: "Risが足りません",
        itemName: item.name,
        needed: price,
        current: user.wallet,
        backCommand: `marketplace product ${id}`
      });
      return {
        ok: false,
        title: panel.title,
        lines: [
          `必要: ${fmt(price)}`,
          `現在: ${fmt(user.wallet)}`,
          `不足: ${fmt(price - user.wallet)}`
        ],
        panel
      };
    }

    user.wallet -= price;
    user.inventory[id] = owned + 1;
    user.lifetimeLost += price;
    if (this.officialCustomItems()[id] === item && item.stock !== null) item.stock -= 1;
    const fulfillment = this.officialCustomItems()[id] === item ? this.createOfficialFulfillment(user, item) : null;
    this.log(user, "buy", -price, item.name);
    if (fulfillment) this.marketLog(`${user.name} が公式商品 ${item.name} を購入 (#${fulfillment.id})。`);

    return {
      ok: true,
      title: "購入完了",
      lines: [`${item.name} を買いました。`, item.description, this.moneyLine(user)],
      panel: this.purchaseCompletePanel(user, {
        itemName: item.name,
        price,
        description: item.description,
        anotherCommand: "marketplace recommended",
        useCommand: item.kind === "consumable" ? `use ${id}` : null
      }),
      officialFulfillment: fulfillment ? { id: fulfillment.id, itemName: item.name, roleId: fulfillment.roleId, dmGuide: item.dmGuide } : null
    };
  }

  useItem(user, id) {
    const item = this.officialItemDefinition(id);
    if (!item) {
      return { ok: false, title: "未確認アイテム", lines: ["ショップの持ち物で使えるものを確認してください。"] };
    }

    if (!user.inventory[id]) {
      return { ok: false, title: "持っていません", lines: [`${item.name} は在庫ゼロです。`] };
    }

    if (item.kind !== "consumable") {
      return { ok: false, title: "常時発動アイテム", lines: [`${item.name} は持っているだけで効果があります。`] };
    }

    user.inventory[id] -= 1;
    if (user.inventory[id] <= 0) delete user.inventory[id];

    if (id === "coupon") {
      const swing = randInt(this.rng, -450, 700);
      user.wallet = Math.max(0, user.wallet + swing);
      if (swing >= 0) user.lifetimeEarned += swing;
      else user.lifetimeLost += Math.abs(swing);

      return {
        ok: swing >= 0,
        title: swing >= 0 ? "封筒の中身は当たり" : "封筒の中身はため息",
        lines: [
          `${swing >= 0 ? fmt(swing) : fmt(Math.abs(swing))} ${swing >= 0 ? "増えました" : "減りました"}。`,
          "会計ソフトは黙りました。",
          this.moneyLine(user)
        ]
      };
    }

    return { ok: false, title: "何も起きない", lines: ["そのアイテムはまだ効果が実装されていません。"] };
  }

  leaderboard(typeRaw = "net") {
    const type = String(typeRaw || "net").toLowerCase();
    const users = Object.values(this.state.users).filter((user) => user.joined);
    let title = "純資産ランキング";
    let score = (user) => Math.floor(this.netWorth(user));
    let label = (value) => fmt(value);

    if (["text", "txt"].includes(type)) {
      title = "発言ランクランキング";
      score = (user) => user.activity.textXp;
      label = (value) => `経験値 ${value}`;
    } else if (["vc", "voice"].includes(type)) {
      title = "VCランクランキング";
      score = (user) => user.activity.vcXp;
      label = (value) => `経験値 ${value}`;
    } else if (["invite", "invites", "招待"].includes(type)) {
      title = "招待ランキング";
      score = (user) => user.invites.qualified;
      label = (value, u) => `${value}人 / ${rankFor(INVITE_RANKS, value).name}`;
    } else if (["bump", "バンプ"].includes(type)) {
      title = "Bumpランキング";
      score = (user) => user.bump?.count || 0;
      label = (value) => `${value}回 / ${rankFor(BUMP_RANKS, value).name}`;
    }

    const ranked = users
      .map((user) => ({ user, value: score(user) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    if (ranked.length === 0) {
      return { ok: true, title, lines: ["まだ誰も経済圏に住んでいません。`join` からどうぞ。"] };
    }

    return {
      ok: true,
      title,
      lines: ranked.map((entry, index) => `${index + 1}. ${entry.user.name} - ${label(entry.value, entry.user)}`)
    };
  }

  awardTextActivity(actor, meta = {}) {
    const user = this.getUser(actor.id, actor.name);
    const now = this.now();
    const cooldownMs = meta.cooldownMs ?? 30 * 1000;
    const remaining = cooldownRemaining(user.activity.lastTextAt, now, cooldownMs);
    if (remaining > 0) return null;

    const before = rankFor(TEXT_RANKS, user.activity.textXp);
    const xp = randInt(this.rng, 8, 15);
    const drip = randInt(this.rng, 2, 8);
    user.activity.textXp += xp;
    user.activity.textMessages += 1;
    user.activity.lastTextAt = now.toISOString();
    user.wallet += drip;
    user.lifetimeEarned += drip;

    const after = rankFor(TEXT_RANKS, user.activity.textXp);
    if (after.name !== before.name) {
      const progress = rankWithProgress(TEXT_RANKS, user.activity.textXp);
      return {
        ok: true,
        kind: "text_rank_up",
        title: "発言ランク昇格",
        lines: [`${user.name} が ${after.name} になりました。`, `発言レベル ${this.textLevel(user)} / 会話報酬 +${fmt(drip)} / 発言経験値 +${xp}`],
        meta: {
          axis: "text",
          userName: user.name,
          previousRank: before.name,
          newRank: after.name,
          nextRank: progress.nextMin !== null ? this.nextRankName(TEXT_RANKS, after.name) : null,
          nextRankAt: progress.nextMin,
          progressPercent: rankProgressPercent(progress),
          serverPosition: this.serverPositionByTextXp(user.id),
          serverTotal: this.joinedUserCount(),
          totalMessages: user.activity.textMessages,
          xpTotal: user.activity.textXp,
          xpGained: xp,
          drip,
          level: this.textLevel(user)
        }
      };
    }

    return { silent: true };
  }

  startVoiceSession(actor, channelId) {
    const user = this.getUser(actor.id, actor.name);
    if (!user.activity.voiceJoinedAt) {
      user.activity.voiceJoinedAt = this.now().toISOString();
      user.activity.voiceLastClaimAt = user.activity.voiceJoinedAt;
      user.activity.voiceChannelId = channelId || null;
      this.resetVoiceDay(user);
    }
  }

  finishVoiceSession(actor, options = {}) {
    const user = this.getUser(actor.id, actor.name);
    if (!user.activity.voiceJoinedAt) return null;

    const result = this.claimVoiceReward(user, { ...options, ending: true });
    user.activity.voiceJoinedAt = null;
    user.activity.voiceLastClaimAt = null;
    user.activity.voiceChannelId = null;
    return result?.noop ? null : result;
  }

  clearVoiceSession(user) {
    user.activity.voiceJoinedAt = null;
    user.activity.voiceLastClaimAt = null;
    user.activity.voiceChannelId = null;
  }

  claimVoiceReward(user, options = {}) {
    this.resetVoiceDay(user);
    if (!user.activity.voiceJoinedAt) {
      return options.silent
        ? { noop: true }
        : {
            ok: false,
            title: "VC未接続",
            lines: ["いま台帳上はVCにいません。上がってからまた押して。", this.voiceRewardLine(user)]
          };
    }

    const now = this.now();
    const since = new Date(user.activity.voiceLastClaimAt || user.activity.voiceJoinedAt);
    const minutes = Math.max(0, Math.floor((now - since) / 60000));
    if (minutes <= 0) {
      return options.silent
        ? { noop: true }
        : {
            ok: false,
            title: "VC報酬はまだ薄い",
            lines: ["1分くらいは座ってから押して。台帳にも準備運動があります。", this.voiceRewardLine(user)]
          };
    }

    const result = this.awardVoiceMinutes(user, minutes, options);
    user.activity.voiceLastClaimAt = now.toISOString();
    return result;
  }

  awardVoiceMinutes(user, minutes, options = {}) {
    this.resetVoiceDay(user);
    const before = rankFor(VC_RANKS, user.activity.vcXp);
    const cappedMinutes = Math.min(minutes, VOICE_REWARD_CONFIG.maxClaimMinutes);
    const xpMultiplier = Number.isFinite(Number(options.xpMultiplier)) ? Math.max(0, Number(options.xpMultiplier)) : 1;
    const xp = Math.floor(cappedMinutes * VOICE_REWARD_CONFIG.xpPerMinute * xpMultiplier);
    const salaryPerMinute = this.voiceSalaryPerMinute(user);
    const rawDrip = Math.floor(cappedMinutes * salaryPerMinute);
    const remaining = Math.max(0, this.voiceDailyCap(user) - user.activity.vcDailyEarned);
    const drip = Math.min(rawDrip, remaining);
    user.activity.vcMinutes += cappedMinutes;
    user.activity.vcDailyMinutes += cappedMinutes;
    user.activity.vcXp += xp;
    if (drip > 0) {
      user.wallet += drip;
      user.lifetimeEarned += drip;
      user.activity.vcDailyEarned += drip;
    }
    const campaignVc = this.qualifyCampaignVc(user);

    const after = rankFor(VC_RANKS, user.activity.vcXp);
    const capLine = drip <= 0 ? "今日のVC Risは上限。ランクだけ伸びます。" : this.voiceRewardLine(user);
    const campaignLine = campaignVc ? `Campaign VC達成: 招待者にTicket、あなたに ${fmt(this.state.inviteCampaign.settings.invitedUserVcBonusRis)}。` : null;
    if (after.name !== before.name) {
      const progress = rankWithProgress(VC_RANKS, user.activity.vcXp);
      return {
        ok: true,
        kind: "vc_rank_up",
        title: "通話ランク昇格",
        silent: Boolean(options.silent),
        lines: [`${user.name} が ${after.name} になりました。`, `通話レベル ${this.vcLevel(user)} / 通話 ${cappedMinutes}分 / 経験値 +${xp} / +${fmt(drip)}`, campaignLine, capLine].filter(Boolean),
        meta: {
          axis: "vc",
          userName: user.name,
          previousRank: before.name,
          newRank: after.name,
          nextRank: progress.nextMin !== null ? this.nextRankName(VC_RANKS, after.name) : null,
          nextRankAt: progress.nextMin,
          progressPercent: rankProgressPercent(progress),
          serverPosition: this.serverPositionByVcXp(user.id),
          serverTotal: this.joinedUserCount(),
          totalMinutes: user.activity.vcMinutes,
          xpTotal: user.activity.vcXp,
          xpGained: xp,
          drip,
          minutesThisClaim: cappedMinutes,
          salaryPerMinute: this.voiceSalaryPerMinute(user),
          level: this.vcLevel(user)
        }
      };
    }

    return {
      ok: true,
      kind: "vc_reward",
      title: "VC報酬",
      silent: Boolean(options.silent),
      lines: [`通話レベル ${this.vcLevel(user)} / 通話 ${cappedMinutes}分 / 経験値 +${xp} / +${fmt(drip)}`, campaignLine, capLine].filter(Boolean)
    };
  }

  serverPositionByTextXp(userId) {
    const users = Object.values(this.state.users).filter((u) => u.joined);
    users.sort((a, b) => (b.activity?.textXp || 0) - (a.activity?.textXp || 0));
    const index = users.findIndex((u) => u.id === userId);
    return index >= 0 ? index + 1 : users.length;
  }

  serverPositionByVcXp(userId) {
    const users = Object.values(this.state.users).filter((u) => u.joined);
    users.sort((a, b) => (b.activity?.vcXp || 0) - (a.activity?.vcXp || 0));
    const index = users.findIndex((u) => u.id === userId);
    return index >= 0 ? index + 1 : users.length;
  }

  joinedUserCount() {
    return Object.values(this.state.users).filter((u) => u.joined).length;
  }

  nextRankName(ranks, currentName) {
    const idx = ranks.findIndex((rank) => rank.name === currentName);
    if (idx < 0 || idx + 1 >= ranks.length) return null;
    return ranks[idx + 1].name;
  }

  resetVoiceDay(user) {
    const today = dayKey(this.now());
    if (user.activity.vcDay === today) return;
    user.activity.vcDay = today;
    user.activity.vcDailyEarned = 0;
    user.activity.vcDailyMinutes = 0;
  }

  voiceDailyCap(user) {
    return VOICE_REWARD_CONFIG.dailyCapBase + this.vcLevel(user) * VOICE_REWARD_CONFIG.dailyCapPerLevel;
  }

  textLevel(user) {
    return activityLevel(user.activity.textXp);
  }

  vcLevel(user) {
    return activityLevel(user.activity.vcXp);
  }

  textRank(user) {
    return rankFor(TEXT_RANKS, user.activity.textXp);
  }

  vcRank(user) {
    return rankFor(VC_RANKS, user.activity.vcXp);
  }

  voiceSalaryPerMinute(user) {
    const tier = Math.floor((this.vcLevel(user) - 1) / VOICE_REWARD_CONFIG.salaryStepLevels);
    return VOICE_REWARD_CONFIG.kcPerMinute + tier * VOICE_REWARD_CONFIG.salaryKcPerStep;
  }

  voiceRewardLine(user) {
    this.resetVoiceDay(user);
    const cap = this.voiceDailyCap(user);
    const remaining = Math.max(0, cap - user.activity.vcDailyEarned);
    const state = user.activity.voiceJoinedAt ? "在室中" : "未接続";
    return `${state} / VCレベル ${this.vcLevel(user)} / 給与 ${fmt(this.voiceSalaryPerMinute(user))}/分 / 今日 ${fmt(user.activity.vcDailyEarned)} / ${fmt(cap)} / 残り ${fmt(remaining)}`;
  }

  simulateText(user, countRaw) {
    const count = clamp(parsePositiveInt(countRaw) || 1, 1, 200);
    const xp = count * 12;
    const money = count * 5;
    user.activity.textMessages += count;
    user.activity.textXp += xp;
    user.wallet += money;
    user.lifetimeEarned += money;
    return {
      ok: true,
      title: "Text活動をシミュレート",
      lines: [`${count}メッセージ / 発言経験値 +${xp} / +${fmt(money)}`, `発言ランク: ${rankFor(TEXT_RANKS, user.activity.textXp).name}`]
    };
  }

  simulateVoice(user, minutesRaw) {
    const minutes = clamp(parsePositiveInt(minutesRaw) || 10, 1, 240);
    return this.awardVoiceMinutes(user, minutes);
  }

  resetActivityRanks(adminUser, axis = "both") {
    const normalized = String(axis || "both").toLowerCase();
    const resetText = normalized === "text" || normalized === "tc" || normalized === "both";
    const resetVc = normalized === "vc" || normalized === "voice" || normalized === "both";

    if (!resetText && !resetVc) {
      return { ok: false, title: "リセット対象が不明", lines: ["TC / VC / both のどれかを指定してください。"] };
    }

    const now = this.now();
    const nowIso = now.toISOString();
    let touched = 0;
    let textXpTotal = 0;
    let textMessagesTotal = 0;
    let vcXpTotal = 0;
    let vcMinutesTotal = 0;
    let activeVoiceSessions = 0;

    for (const user of Object.values(this.state.users || {})) {
      user.activity = {
        ...createUser(user.id, user.name).activity,
        ...(user.activity || {})
      };

      let changed = false;

      if (resetText) {
        textXpTotal += user.activity.textXp || 0;
        textMessagesTotal += user.activity.textMessages || 0;

        user.activity.textXp = 0;
        user.activity.textMessages = 0;
        user.activity.lastTextAt = null;
        changed = true;
      }

      if (resetVc) {
        vcXpTotal += user.activity.vcXp || 0;
        vcMinutesTotal += user.activity.vcMinutes || 0;

        user.activity.vcXp = 0;
        user.activity.vcMinutes = 0;
        user.activity.vcDailyEarned = 0;
        user.activity.vcDailyMinutes = 0;
        user.activity.vcDay = dayKey(now);

        if (user.activity.voiceJoinedAt) {
          user.activity.voiceJoinedAt = nowIso;
          user.activity.voiceLastClaimAt = nowIso;
          activeVoiceSessions += 1;
        } else {
          user.activity.voiceLastClaimAt = null;
        }

        changed = true;
      }

      if (changed) {
        touched += 1;
        this.updateTitle(user);
      }
    }

    const label = resetText && resetVc ? "TC/VC" : resetText ? "TC" : "VC";
    this.log(adminUser, "admin_rank_reset", 0, `${label}一括リセット / ${touched}人`);

    return {
      ok: true,
      title: `${label}一括リセット完了`,
      lines: [
        `対象: ${touched}人`,
        resetText ? `TC: ${textXpTotal.toLocaleString("ja-JP")} XP / ${textMessagesTotal.toLocaleString("ja-JP")} メッセージをリセット` : null,
        resetVc ? `VC: ${vcXpTotal.toLocaleString("ja-JP")} XP / ${vcMinutesTotal.toLocaleString("ja-JP")} 分をリセット` : null,
        resetVc && activeVoiceSessions ? `入室中VC: ${activeVoiceSessions}人は現在時刻から再計測にしました。` : null
      ].filter(Boolean)
    };
  }

  getUser(id, name) {
    if (!this.state.users[id]) {
      this.state.users[id] = createUser(id, name);
    } else {
      this.state.users[id] = migrateUser(this.state.users[id]);
    }

    this.state.users[id].name = name || this.state.users[id].name;
    return this.state.users[id];
  }

  netWorth(user) {
    return user.wallet;
  }

  moneyLine(user) {
    return `財布 ${fmt(user.wallet)} / 純資産 ${fmt(Math.floor(this.netWorth(user)))}`;
  }

  inventoryLine(user) {
    const entries = Object.entries(user.inventory);
    if (entries.length === 0) return "なし";
    return entries.map(([id, count]) => `${this.officialItemDefinition(id)?.name || id} x${count}`).join(", ");
  }

  level(user) {
    return Math.floor(Math.sqrt(user.xp / 40)) + 1;
  }

  updateTitle(user) {
    const net = this.netWorth(user);
    if (net >= 200000) user.title = "アイリス財閥";
    else if (net >= 80000) user.title = "経済圏の中枢";
    else if (net >= 25000) user.title = "値動きの支配人";
    else if (user.activity.vcXp >= 2600) user.title = "深夜VC責任者";
    else if (user.activity.textXp >= 1500) user.title = "タイムライン統括";
    else if (user.workCount >= 25) user.title = "労働市場そのもの";
  }

  log(user, type, amount, note) {
    this.state.ledger.push({
      at: this.now().toISOString(),
      userId: user.id,
      userName: user.name,
      type,
      amount,
      note
    });
    this.state.ledger = this.state.ledger.slice(-200);
  }

  setWallet(adminUser, targetActor, amountRaw, note = "") {
    const amount = parseNonNegativeInt(amountRaw);
    if (!Number.isFinite(amount)) {
      return { ok: false, title: "額が変です", lines: ["セット額は0以上の整数で入力してください。"] };
    }
    if (!targetActor?.id) return { ok: false, title: "対象がいません", lines: ["対象ユーザーを指定してください。"] };
    const target = this.getUser(targetActor.id, targetActor.name);
    const before = target.wallet;
    const delta = amount - before;
    target.wallet = amount;
    if (delta > 0) target.lifetimeEarned += delta;
    else if (delta < 0) target.lifetimeLost += -delta;
    this.log(target, "admin_set", delta, note || `${before} → ${amount}`);
    this.log(adminUser, "admin_action", delta, `${target.name} のセット (${before} → ${amount})${note ? " / " + note : ""}`);
    return {
      ok: true,
      title: "残高をセットしました",
      lines: [
        `対象: ${target.name}`,
        `前: ${fmt(before)}`,
        `後: ${fmt(amount)}`,
        `差分: ${delta >= 0 ? "+" : ""}${fmt(delta)}（${delta >= 0 ? "中央発行" : "中央回収"}）`
      ],
      delta,
      before,
      after: amount,
      target: { id: target.id, name: target.name }
    };
  }

  addWallet(adminUser, targetActor, amountRaw, note = "") {
    const amount = parsePositiveInt(amountRaw);
    if (!Number.isFinite(amount)) {
      return { ok: false, title: "額が変です", lines: ["加算額は1以上の整数で入力してください。"] };
    }
    if (!targetActor?.id) return { ok: false, title: "対象がいません", lines: ["対象ユーザーを指定してください。"] };
    const target = this.getUser(targetActor.id, targetActor.name);
    const before = target.wallet;
    target.wallet += amount;
    target.lifetimeEarned += amount;
    this.log(target, "admin_add", amount, note || `+${amount}`);
    this.log(adminUser, "admin_action", amount, `${target.name} へ +${amount}${note ? " / " + note : ""}`);
    return {
      ok: true,
      title: "残高を加算しました",
      lines: [
        `対象: ${target.name}`,
        `前: ${fmt(before)}`,
        `後: ${fmt(target.wallet)}`,
        `加算: +${fmt(amount)}（中央発行）`
      ],
      delta: amount,
      before,
      after: target.wallet,
      target: { id: target.id, name: target.name }
    };
  }

  subtractWallet(adminUser, targetActor, amountRaw, note = "") {
    const amount = parsePositiveInt(amountRaw);
    if (!Number.isFinite(amount)) {
      return { ok: false, title: "額が変です", lines: ["減算額は1以上の整数で入力してください。"] };
    }
    if (!targetActor?.id) return { ok: false, title: "対象がいません", lines: ["対象ユーザーを指定してください。"] };
    const target = this.getUser(targetActor.id, targetActor.name);
    const before = target.wallet;
    const actual = Math.min(amount, Math.max(0, before));
    target.wallet -= actual;
    target.lifetimeLost += actual;
    this.log(target, "admin_sub", -actual, note || `-${actual}`);
    this.log(adminUser, "admin_action", -actual, `${target.name} から -${actual}${note ? " / " + note : ""}`);
    return {
      ok: true,
      title: "残高を減算しました",
      lines: [
        `対象: ${target.name}`,
        `前: ${fmt(before)}`,
        `後: ${fmt(target.wallet)}`,
        `減算: -${fmt(actual)}${actual < amount ? "（残高不足のため上限まで）" : "（中央回収）"}`
      ],
      delta: -actual,
      before,
      after: target.wallet,
      target: { id: target.id, name: target.name }
    };
  }

  setWalletByRoleMembers(adminUser, { entries, amount: amountRaw, roleLabel }) {
    const amount = parseNonNegativeInt(amountRaw);
    if (!Number.isFinite(amount)) {
      return { ok: false, title: "額が変です", lines: ["セット額は0以上の整数で入力してください。"] };
    }
    if (!Array.isArray(entries) || entries.length === 0) {
      return { ok: false, title: "対象がいません", lines: ["ロール保持者が0人でした。"] };
    }
    const seen = new Set();
    const applied = [];
    let totalIssued = 0;
    let totalReclaimed = 0;
    for (const entry of entries) {
      if (!entry?.id) continue;
      const key = String(entry.id);
      if (seen.has(key)) continue;
      seen.add(key);
      const user = this.getUser(entry.id, entry.name || "名無し");
      const before = user.wallet;
      const delta = amount - before;
      user.wallet = amount;
      if (delta > 0) {
        user.lifetimeEarned += delta;
        totalIssued += delta;
      } else if (delta < 0) {
        user.lifetimeLost += -delta;
        totalReclaimed += -delta;
      }
      this.log(user, "admin_role_set", delta, roleLabel || "ロール一括セット");
      applied.push({ id: user.id, name: user.name, before, after: amount, delta });
    }
    this.log(adminUser, "admin_action", totalIssued - totalReclaimed, `${roleLabel || "ロール一括セット"} / ${applied.length}人 → ${amount}`);
    return {
      ok: true,
      title: "ロール一括セット完了",
      lines: [
        `対象: ${roleLabel || "選択したロール"}`,
        `${applied.length}人を ${fmt(amount)} に揃えました。`,
        `発行合計: ${fmt(totalIssued)} / 回収合計: ${fmt(totalReclaimed)}`,
        `純増減: ${fmt(totalIssued - totalReclaimed)}`
      ],
      applied,
      amount,
      totalIssued,
      totalReclaimed
    };
  }

  transferFunds(senderActor, recipientActor, amountRaw) {
    const amount = parsePositiveInt(amountRaw);
    if (!Number.isFinite(amount)) {
      return { ok: false, title: "額が変です", lines: ["送金額は1以上の整数で入力してください。"] };
    }
    if (!senderActor?.id || !recipientActor?.id) {
      return { ok: false, title: "対象が不足", lines: ["送信者と受取人が必要です。"] };
    }
    if (String(senderActor.id) === String(recipientActor.id)) {
      return { ok: false, title: "自分には送れません", lines: ["自分の財布から自分の財布に送金はできません。"] };
    }
    const sender = this.getUser(senderActor.id, senderActor.name);
    if (sender.wallet < amount) {
      return {
        ok: false,
        title: "残高が足りません",
        lines: [`必要: ${fmt(amount)}`, `現在: ${fmt(sender.wallet)}`, `不足: ${fmt(amount - sender.wallet)}`]
      };
    }
    const recipient = this.getUser(recipientActor.id, recipientActor.name);
    sender.wallet -= amount;
    sender.lifetimeLost += amount;
    recipient.wallet += amount;
    recipient.lifetimeEarned += amount;
    this.log(sender, "transfer_out", -amount, `→ ${recipient.name}`);
    this.log(recipient, "transfer_in", amount, `← ${sender.name}`);
    return {
      ok: true,
      title: "送金完了",
      lines: [
        `${sender.name} → ${recipient.name}`,
        `送金額: ${fmt(amount)}`,
        `残高: ${fmt(sender.wallet)}`
      ],
      sender: { id: sender.id, name: sender.name, wallet: sender.wallet },
      recipient: { id: recipient.id, name: recipient.name, wallet: recipient.wallet },
      amount
    };
  }

  distributeSalary(adminUser, { entries, perUser, roleLabel }) {
    const amount = parsePositiveInt(perUser);
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, title: "配布額が変です", lines: ["1人あたりの額は1以上の数字で入力してください。"] };
    }
    if (!Array.isArray(entries) || entries.length === 0) {
      return { ok: false, title: "対象がいません", lines: ["ロール保持者が0人でした。"] };
    }

    const seen = new Set();
    const paid = [];
    for (const entry of entries) {
      if (!entry?.id) continue;
      const key = String(entry.id);
      if (seen.has(key)) continue;
      seen.add(key);
      const user = this.getUser(entry.id, entry.name || "名無し");
      user.wallet += amount;
      user.lifetimeEarned += amount;
      this.log(user, "salary", amount, roleLabel || "給与配布");
      paid.push({ id: user.id, name: user.name });
    }

    const total = amount * paid.length;
    this.log(adminUser, "salary_admin", total, `${roleLabel || "給与配布"} / ${paid.length}人`);

    return {
      ok: true,
      title: "給与配布完了",
      lines: [
        `対象: ${roleLabel || "選択したロール"}`,
        `配布: ${paid.length}人 × ${fmt(amount)} = 合計 ${fmt(total)}`,
        "中央台帳から発行しました。管理者の財布は減っていません。"
      ],
      paid,
      amount,
      total
    };
  }
}

function renderPlayerCardLines(data) {
  const width = data.style.width;
  const header = `${CURRENCY.code} ${data.style.name}カード`;
  const common = [
    `${data.user.name}`,
    `${data.subtitle}`,
    `純資産 ${fmt(data.net)} / 財布 ${fmt(data.wallet)}`
  ];

  if (data.style.layout === "compact") {
    return frameLines(width, header, [
      ...common,
      `経済 ${data.econRank.name}`,
      `テキスト ${data.textRank.name} / VC ${data.vcRank.name}`
    ]);
  }

  if (data.style.layout === "split") {
    return frameLines(width, header, [
      ...common,
      divider(width),
      twoCol("経済", `${data.econRank.name} ${progressText(data.econRank)}`, width),
      twoCol("テキスト", `${data.textRank.name} ${progressText(data.textRank)}`, width),
      twoCol("VC", `${data.vcRank.name} ${progressText(data.vcRank)}`, width)
    ]);
  }

  if (data.style.layout === "ledger") {
    return frameLines(width, header, [
      `${data.user.name} :: ${data.subtitle}`,
      divider(width),
      twoCol("純資産", fmt(data.net), width),
      twoCol("財布", fmt(data.wallet), width),
      divider(width),
      `経済     ${data.econRank.name} ${progressText(data.econRank)}`,
      `テキスト ${data.textRank.name} ${progressText(data.textRank)}`,
      `VC       ${data.vcRank.name} ${progressText(data.vcRank)}`
    ]);
  }

  if (data.style.layout === "matrix") {
    return frameLines(width, header, [
      `${data.user.name} :: ${data.subtitle}`,
      `カード値 ${data.score} / 型 ${data.style.name}`,
      divider(width),
      metricRow(["純資産", fmt(data.net)], ["財布", fmt(data.wallet)], width),
      divider(width),
      matrixRow("経済", data.econRank, width),
      matrixRow("文", data.textRank, width),
      matrixRow("声", data.vcRank, width)
    ]);
  }

  return frameLines(width, header, [
    `${data.user.name} :: ${data.subtitle}`,
    `${data.style.tagline} / 値 ${data.score}`,
    divider(width),
    metricRow(["純資産", fmt(data.net)], ["財布", fmt(data.wallet)], width),
    divider(width),
    matrixRow("経済", data.econRank, width),
    matrixRow("テキスト", data.textRank, width),
    matrixRow("通話", data.vcRank, width),
    divider(width),
    "黒札解放: 台帳はもう遠慮してくれない。"
  ]);
}

function buildDiscordProfileCard(data) {
  const textProgress = progressText(data.textRank) || "(初期)";
  const vcProgress = progressText(data.vcRank) || "(初期)";
  const econProgress = progressText(data.econRank) || "(初期)";
  return {
    color: data.style.color,
    title: data.user.name,
    description: data.subtitle,
    fields: [
      {
        name: "WALLET",
        value: [`財布 ${fmt(data.wallet)}`, `純資産 ${fmt(data.net)}`].join("\n"),
        inline: true
      },
      {
        name: "TEXT",
        value: [`${data.textRank.name}`, `経験値 ${data.user.activity.textXp}`, textProgress].join("\n"),
        inline: true
      },
      {
        name: "VOICE",
        value: [`${data.vcRank.name}`, `${data.user.activity.vcMinutes}分 / 経験値 ${data.user.activity.vcXp}`, vcProgress].join("\n"),
        inline: true
      },
      {
        name: "STATUS",
        value: [`経済 ${data.econRank.name} ${econProgress}`].join("\n"),
        inline: false
      }
    ],
    footer: `型 ${data.style.name} / CARD ${data.score}`
  };
}

function buildProfileImageData(data) {
  return {
    name: data.user.name,
    title: data.subtitle,
    styleName: data.style.name,
    styleTagline: data.style.tagline,
    premiumFrame: Boolean(data.user.inventory.frame),
    color: data.style.color,
    score: data.score,
    wallet: data.wallet,
    net: data.net,
    text: {
      name: data.textRank.name,
      level: data.textLevel,
      xp: data.user.activity.textXp,
      messages: data.user.activity.textMessages,
      progress: rankProgressPercent(data.textRank)
    },
    voice: {
      name: data.vcRank.name,
      level: data.vcLevel,
      salaryPerMinute: data.vcSalaryPerMinute,
      xp: data.user.activity.vcXp,
      minutes: data.user.activity.vcMinutes,
      progress: rankProgressPercent(data.vcRank)
    },
    economy: {
      name: data.econRank.name,
      progress: rankProgressPercent(data.econRank)
    }
  };
}

function rankProgressPercent(rank) {
  if (!Number.isFinite(rank.currentMin)) return 0;
  if (!rank.nextMin) return 100;
  const span = rank.nextMin - rank.currentMin;
  const current = rank.value - rank.currentMin;
  return clamp(Math.floor((current / span) * 100), 0, 100);
}

function frameLines(width, title, body) {
  const innerWidth = width - 4;
  const top = `+${"-".repeat(width - 2)}+`;
  const titleLine = `| ${fit(title, innerWidth)} |`;
  const empty = `| ${" ".repeat(innerWidth)} |`;
  return [
    top,
    titleLine,
    empty,
    ...body.map((line) => `| ${fit(line, innerWidth)} |`),
    top
  ];
}

function divider(width) {
  return "-".repeat(width - 4);
}

function fit(value, width) {
  const text = String(value || "");
  if (text.length > width) return text.slice(0, Math.max(0, width - 1));
  return text + " ".repeat(width - text.length);
}

function twoCol(label, value, width) {
  const inner = width - 4;
  const left = fit(label, 14);
  const right = fit(value, Math.max(1, inner - 17));
  return `${left} | ${right}`;
}

function metricRow(left, right, width) {
  const inner = width - 4;
  const half = Math.floor((inner - 3) / 2);
  return `${fit(`${left[0]} ${left[1]}`, half)} | ${fit(`${right[0]} ${right[1]}`, inner - half - 3)}`;
}

function matrixRow(label, rank, width) {
  const inner = width - 4;
  const text = `${label} ${rank.name}`;
  const progress = progressText(rank) || "(初期)";
  return `${fit(text, 22)} ${fit(progress, inner - 23)}`;
}

function createUser(id, name) {
  return {
    id,
    name: name || "名無しの資本家",
    joined: false,
    wallet: 0,
    streak: 0,
    title: "未上場の一般人",
    xp: 0,
    workCount: 0,
    lifetimeEarned: 0,
    lifetimeLost: 0,
    inventory: {},
    invites: {
      qualified: 0,
      pending: 0,
      earned: 0,
      day: dayKey(new Date()),
      dailyPaid: 0
    },
    bump: {
      count: 0,
      earned: 0,
      lastBumpAt: null
    },
    invite: {
      referredBy: null,
      referredByName: null,
      code: null,
      trackedAt: null,
      qualified: false,
      qualifiedAt: null,
      leftAt: null
    },
    activity: {
      textXp: 0,
      textMessages: 0,
      lastTextAt: null,
      vcXp: 0,
      vcMinutes: 0,
      vcDay: dayKey(new Date()),
      vcDailyEarned: 0,
      vcDailyMinutes: 0,
      voiceJoinedAt: null,
      voiceLastClaimAt: null,
      voiceChannelId: null
    },
    marketplace: {
      shopOpened: false,
      shopName: "",
      shopDescription: "",
      sales: 0,
      inventory: [],
      listingDraft: {
        type: "item",
        mode: "permanent"
      }
    },
    inviteCampaign: {
      tickets: 0,
      ticketsEarned: 0,
      risEarned: 0,
      milestonesLogged: []
    },
    lastDaily: null,
    lastWork: null,
    lastSubsidy: null,
    notifyEnabled: false
  };
}

function createInviteCampaignState(overrides = {}) {
  const settings = {
    ...INVITE_CAMPAIGN_DEFAULTS.settings,
    ...((overrides && overrides.settings) || {})
  };
  return {
    active: Boolean(overrides.active),
    name: overrides.name || INVITE_CAMPAIGN_DEFAULTS.name,
    startsAt: overrides.startsAt || null,
    endsAt: overrides.endsAt || null,
    settings,
    invitedUsers: { ...((overrides && overrides.invitedUsers) || {}) },
    userStats: { ...((overrides && overrides.userStats) || {}) },
    logs: Array.isArray(overrides.logs) ? overrides.logs : []
  };
}

function createCasinoState(overrides = {}) {
  return {
    transactions: { ...((overrides && overrides.transactions) || {}) },
    settings: {
      maxPayoutMultiplier: CASINO_CONFIG.maxPayoutMultiplier,
      maxPayoutRis: CASINO_CONFIG.maxPayoutRis,
      ...((overrides && overrides.settings) || {})
    }
  };
}

function migrateState(state) {
  const base = createInitialState();
  const next = { ...base, ...state };
  next.currency = CURRENCY;
  next.marketplace = { ...base.marketplace, ...(next.marketplace || {}) };
  next.marketplace.shops = { ...base.marketplace.shops, ...(next.marketplace.shops || {}) };
  next.marketplace.listings = Array.isArray(next.marketplace.listings) ? next.marketplace.listings : [];
  next.marketplace.orders = Array.isArray(next.marketplace.orders) ? next.marketplace.orders : [];
  next.marketplace.auctions = Array.isArray(next.marketplace.auctions) ? next.marketplace.auctions : [];
  next.marketplace.officialItems = Object.fromEntries(
    Object.entries(next.marketplace.officialItems || {}).map(([id, item]) => [id, migrateOfficialItem(item, id)])
  );
  next.marketplace.officialFulfillment = Array.isArray(next.marketplace.officialFulfillment)
    ? next.marketplace.officialFulfillment.map(migrateOfficialFulfillment)
    : [];
  next.marketplace.officialRoleGrants = Array.isArray(next.marketplace.officialRoleGrants)
    ? next.marketplace.officialRoleGrants.map(migrateOfficialRoleGrant)
    : [];
  next.marketplace.nextOfficialFulfillmentId = Math.max(1, Number(next.marketplace.nextOfficialFulfillmentId) || 1,
    ...next.marketplace.officialFulfillment.map((task) => Number(task.id) + 1 || 1));
  next.marketplace.logs = Array.isArray(next.marketplace.logs) ? next.marketplace.logs : [];
  next.marketplace.settings = { ...base.marketplace.settings, ...(next.marketplace.settings || {}) };
  next.marketplace.nextListingId = Math.max(1, Number(next.marketplace.nextListingId) || 1);
  next.marketplace.nextOrderId = Math.max(1, Number(next.marketplace.nextOrderId) || 1);
  next.marketplace.nextAuctionId = Math.max(1, Number(next.marketplace.nextAuctionId) || 1);
  next.invites = { ...base.invites, ...(next.invites || {}) };
  next.invites.recent = Array.isArray(next.invites.recent) ? next.invites.recent : [];
  next.inviteCampaign = createInviteCampaignState(next.inviteCampaign || {});
  next.inviteCampaign.invitedUsers = Object.fromEntries(
    Object.entries(next.inviteCampaign.invitedUsers || {}).map(([id, entry]) => [id, migrateCampaignInviteEntry(entry)])
  );
  next.inviteCampaign.userStats = Object.fromEntries(
    Object.entries(next.inviteCampaign.userStats || {}).map(([id, stats]) => [id, migrateCampaignUserStats(stats)])
  );
  next.casino = createCasinoState(next.casino || {});
  next.casino.transactions = Object.fromEntries(
    Object.entries(next.casino.transactions || {}).map(([id, tx]) => [id, migrateCasinoTransaction(tx, id)])
  );
  next.casino.settings.maxPayoutMultiplier = Math.max(0, Number(next.casino.settings.maxPayoutMultiplier) || CASINO_CONFIG.maxPayoutMultiplier);
  next.casino.settings.maxPayoutRis = Math.max(0, Number(next.casino.settings.maxPayoutRis) || CASINO_CONFIG.maxPayoutRis);
  next.inn = { ...base.inn, ...(next.inn || {}) };
  next.inn.rooms = Array.isArray(next.inn.rooms) ? next.inn.rooms : [];
  next.inn.history = Array.isArray(next.inn.history) ? next.inn.history : [];
  next.inn.nextId = Math.max(1, Number(next.inn.nextId) || 1);
  next.ledger = Array.isArray(next.ledger) ? next.ledger : [];
  next.users = Object.fromEntries(Object.entries(next.users || {}).map(([id, user]) => [id, migrateUser(user)]));
  delete next.market;
  delete next.policy;
  delete next.sink;
  delete next.house;
  next.version = 4;
  return next;
}

function migrateUser(user) {
  const fresh = createUser(user.id, user.name);
  const merged = {
    ...fresh,
    ...user,
    inventory: { ...fresh.inventory, ...(user.inventory || {}) },
    invites: { ...fresh.invites, ...(user.invites || {}) },
    invite: { ...fresh.invite, ...(user.invite || {}) },
    bump: { ...fresh.bump, ...(user.bump || {}) },
    activity: { ...fresh.activity, ...(user.activity || {}) },
    marketplace: {
      ...fresh.marketplace,
      ...(user.marketplace || {}),
      listingDraft: { ...fresh.marketplace.listingDraft, ...((user.marketplace || {}).listingDraft || {}) },
      inventory: Array.isArray((user.marketplace || {}).inventory) ? user.marketplace.inventory : []
    },
    inviteCampaign: {
      ...fresh.inviteCampaign,
      ...(user.inviteCampaign || {}),
      milestonesLogged: Array.isArray(user.inviteCampaign?.milestonesLogged) ? user.inviteCampaign.milestonesLogged : []
    }
  };
  delete merged.debt;
  delete merged.heat;
  delete merged.holdings;
  delete merged.kabu;
  delete merged.rpg;
  delete merged.casino;
  delete merged.inn;
  return merged;
}

function migrateCampaignInviteEntry(entry = {}) {
  return {
    inviterId: entry.inviterId || null,
    inviterName: entry.inviterName || "",
    invitedUserId: entry.invitedUserId || null,
    invitedUserName: entry.invitedUserName || "",
    joinedAt: entry.joinedAt || null,
    retainedAt: entry.retainedAt || null,
    vcQualifiedAt: entry.vcQualifiedAt || null,
    shopViewedAt: entry.shopViewedAt || null,
    leftAt: entry.leftAt || null,
    inviteCode: entry.inviteCode || null,
    rewardsPaid: {
      join: Boolean(entry.rewardsPaid?.join),
      retention: Boolean(entry.rewardsPaid?.retention),
      vc: Boolean(entry.rewardsPaid?.vc),
      shopView: Boolean(entry.rewardsPaid?.shopView)
    }
  };
}

function migrateCampaignUserStats(stats = {}) {
  return {
    invited: Math.max(0, Number(stats.invited) || 0),
    retained: Math.max(0, Number(stats.retained) || 0),
    vcQualified: Math.max(0, Number(stats.vcQualified) || 0),
    ticketsEarned: Math.max(0, Number(stats.ticketsEarned) || 0),
    risEarned: Math.max(0, Number(stats.risEarned) || 0)
  };
}

function migrateCasinoTransaction(tx = {}, id = "") {
  const status = ["reserved", "settled", "cancelled"].includes(tx.status) ? tx.status : "reserved";
  return {
    transactionId: cleanToken(tx.transactionId || id, 120),
    discordUserId: cleanToken(tx.discordUserId, 80),
    userId: tx.userId || null,
    userName: tx.userName || "",
    sessionId: cleanToken(tx.sessionId, 120),
    game: cleanToken(tx.game, 80),
    bet: Math.max(0, Number(tx.bet) || 0),
    status,
    payout: tx.payout === null || tx.payout === undefined ? null : Math.max(0, Number(tx.payout) || 0),
    createdAt: tx.createdAt || null,
    reservedAt: tx.reservedAt || tx.createdAt || null,
    settledAt: tx.settledAt || null,
    cancelledAt: tx.cancelledAt || null
  };
}

function migrateOfficialItem(item = {}, id = "") {
  const cleanId = cleanToken(item.id || id, 40);
  return {
    id: cleanId,
    name: cleanMarketText(item.name, 48) || cleanId || "公式商品",
    price: Math.max(1, Math.floor(Number(item.price) || 1)),
    max: clamp(Math.floor(Number(item.max) || 1), 1, 999),
    kind: "passive",
    type: cleanMarketText(item.type, 32) || "アイテム",
    description: cleanMarketText(item.description, 400) || "運営追加の公式商品です。",
    effect: cleanMarketText(item.effect, 160) || "説明文として表示される所持型アイテム",
    usage: cleanMarketText(item.usage, 160) || "購入後は持ち物に残ります。Bot処理が絡む効果はまだ自動発動しません。",
    status: item.status === "active" ? "active" : "stopped",
    stock: item.stock === null || item.stock === undefined ? null : clamp(Math.floor(Number(item.stock) || 0), 0, 999999),
    saleStartsAt: validDateIso(item.saleStartsAt),
    saleEndsAt: validDateIso(item.saleEndsAt),
    roleId: isDiscordSnowflake(item.roleId) ? String(item.roleId) : null,
    roleDurationDays: clamp(Math.floor(Number(item.roleDurationDays) || 0), 0, 3650),
    dmGuide: cleanMarketText(item.dmGuide, 400) || "購入内容は持ち物と運営対応キューに記録されます。",
    source: item.source || "admin",
    createdAt: item.createdAt || null,
    createdBy: item.createdBy || null,
    createdByName: item.createdByName || ""
  };
}

function migrateOfficialFulfillment(task = {}) {
  return {
    id: Math.max(1, Math.floor(Number(task.id) || 1)),
    itemId: cleanToken(task.itemId, 48),
    itemName: cleanMarketText(task.itemName, 48) || "公式商品",
    buyerId: String(task.buyerId || ""),
    buyerName: cleanMarketText(task.buyerName, 80) || "購入者",
    roleId: isDiscordSnowflake(task.roleId) ? String(task.roleId) : null,
    roleDurationDays: clamp(Math.floor(Number(task.roleDurationDays) || 0), 0, 3650),
    status: task.status === "completed" ? "completed" : "pending",
    note: cleanMarketText(task.note, 240),
    createdAt: validDateIso(task.createdAt) || new Date(0).toISOString(),
    completedAt: validDateIso(task.completedAt),
    completedBy: task.completedBy || null,
    expiresAt: validDateIso(task.expiresAt)
  };
}

function migrateOfficialRoleGrant(grant = {}) {
  return {
    fulfillmentId: Math.max(1, Math.floor(Number(grant.fulfillmentId) || 1)),
    guildId: isDiscordSnowflake(grant.guildId) ? String(grant.guildId) : null,
    userId: String(grant.userId || ""),
    discordUserId: isDiscordSnowflake(grant.discordUserId) ? String(grant.discordUserId) : null,
    roleId: isDiscordSnowflake(grant.roleId) ? String(grant.roleId) : null,
    expiresAt: validDateIso(grant.expiresAt),
    status: grant.status === "revoked" ? "revoked" : "active",
    createdAt: validDateIso(grant.createdAt) || new Date(0).toISOString(),
    revokedAt: validDateIso(grant.revokedAt)
  };
}

function parseInput(input) {
  const trimmed = String(input || "").trim();
  if (!trimmed) return { command: "help", args: [] };
  const parts = trimmed.split(/\s+/);
  return { command: parts[0].toLowerCase(), args: parts.slice(1) };
}

function parsePositiveInt(value) {
  const parsed = Math.floor(Number(String(value || "").replace(/,/g, "")));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : NaN;
}

function parseNonNegativeInt(value) {
  const parsed = Math.floor(Number(String(value || "").replace(/,/g, "")));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : NaN;
}

function parseOfficialStock(value) {
  const text = String(value ?? "").trim().toLowerCase();
  if (["", "-", "none", "unlimited", "無制限"].includes(text)) return null;
  return parseNonNegativeInt(text);
}

function parseOfficialSaleDate(value) {
  const text = String(value || "").trim();
  if (!text || ["-", "none", "なし"].includes(text.toLowerCase())) return null;
  if (!/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}$/.test(text)) return null;
  const date = new Date(`${text.replace(" ", "T")}:00+09:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function hasOfficialSaleDateInput(value) {
  const text = String(value || "").trim().toLowerCase();
  return !["", "-", "none", "なし"].includes(text);
}

function validDateIso(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function parseIntegerField(value) {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && /^(0|[1-9]\d*)$/.test(value.trim())) return Number.parseInt(value.trim(), 10);
  return NaN;
}

function isDiscordSnowflake(value) {
  return /^\d{17,20}$/.test(String(value || "").trim());
}

function casinoBetLimit(value, fallback) {
  return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}

function cleanToken(value, max) {
  const text = String(value || "").trim();
  if (!text || text.length > max) return "";
  return /^[A-Za-z0-9:_.-]+$/.test(text) ? text : "";
}

function cooldownRemaining(lastIso, now, durationMs) {
  if (!lastIso) return 0;
  const elapsed = now - new Date(lastIso);
  return Math.max(0, durationMs - elapsed);
}

function formatDuration(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}時間${minutes}分`;
  if (minutes > 0) return `${minutes}分${seconds}秒`;
  return `${seconds}秒`;
}

function randInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick(rng, items) {
  return items[Math.floor(rng() * items.length)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function fmt(amount) {
  const rounded = Math.floor(Math.abs(amount));
  const sign = amount < 0 ? "-" : "";
  return `${sign}${rounded.toLocaleString("ja-JP")} ${CURRENCY.code}`;
}

function bar(value, max) {
  const width = 10;
  const filled = Math.round((clamp(value, 0, max) / max) * width);
  return `[${"#".repeat(filled)}${"-".repeat(width - filled)}]`;
}

function rankFor(ranks, value) {
  return ranks.reduce((best, rank) => (value >= rank.min ? rank : best), ranks[0]);
}

function activityLevel(xp) {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, Number(xp) || 0) / VOICE_REWARD_CONFIG.levelXpBase)) + 1);
}

function rankIndex(ranks, value) {
  let index = 0;
  for (let i = 0; i < ranks.length; i += 1) {
    if (value >= ranks[i].min) index = i;
  }
  return index;
}

function rankWithProgress(ranks, value) {
  let index = 0;
  for (let i = 0; i < ranks.length; i += 1) {
    if (value >= ranks[i].min) index = i;
  }
  const current = ranks[index];
  const next = ranks[index + 1] || null;
  return {
    name: current.name,
    value,
    currentMin: current.min,
    nextMin: next ? next.min : null
  };
}

function progressText(rank) {
  if (!Number.isFinite(rank.currentMin)) return "";
  if (!rank.nextMin) return "(MAX)";
  const span = rank.nextMin - rank.currentMin;
  const current = rank.value - rank.currentMin;
  const pct = clamp(Math.floor((current / span) * 100), 0, 100);
  return `${bar(pct, 100)} ${pct}%`;
}

function buttons(items) {
  return { type: "buttons", items };
}

function runButton(label, command, style = "secondary", disabled = false) {
  return { kind: "run", label, command, style, disabled };
}

function panelButton(label, panel, style = "secondary", disabled = false) {
  return { kind: "panel", label, panel, style, disabled };
}

function customButton(label, customId, style = "secondary", disabled = false) {
  return { kind: "custom", label, customId, style, disabled };
}

function select(placeholder, options, disabled = false) {
  return { type: "select", placeholder, options, disabled };
}

function option(label, value, description) {
  return { label, value, description };
}

function productTypeLabel(type) {
  return MARKET_PRODUCT_TYPES[type] || "アイテム";
}

function saleModeLabel(mode) {
  return MARKET_SALE_MODES[mode] || "買い切り";
}

function listingStatusLabel(status) {
  if (status === "active") return "公開中";
  if (status === "pending") return "審査待ち";
  if (status === "soldout") return "売り切れ";
  if (status === "stopped") return "停止";
  if (status === "rejected") return "却下";
  return "不明";
}

function orderStatusLabel(status) {
  if (status === "open") return "対応待ち";
  if (status === "complete") return "完了";
  if (status === "reported") return "問題報告あり";
  if (status === "refunded") return "返金済み";
  if (status === "expired") return "期限切れ";
  return status || "不明";
}

function officialItemStatusLabel(status) {
  return status === "active" ? "販売中" : "停止中";
}

function officialFulfillmentStatusLabel(status) {
  return status === "completed" ? "完了" : "対応待ち";
}

function marketItemTypeLabel(id) {
  return SHOP_ITEMS[id]?.type || "アイテム";
}

function cleanMarketText(value, max) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function shortDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "未設定";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${month}/${day} ${hour}:${minute}`;
}

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

function formatResult(result) {
  const mark = result.ok ? "◆" : "◇";
  return [`${mark} ${result.title}`, ...result.lines].join("\n");
}

module.exports = {
  BUMP_RANKS,
  CURRENCY,
  ECONOMY_RANKS,
  INVITE_RANKS,
  SHOP_ITEMS,
  TEXT_RANKS,
  VC_RANKS,
  EconomyEngine,
  createInitialState,
  formatResult,
  fmt
};
