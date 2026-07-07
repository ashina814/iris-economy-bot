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
    kind: "consumable",
    type: "チケット",
    description: "宿の追加人数枠を1つ増やせるチケット。",
    effect: "二人宿の人数上限 +1（別途 5,000 Ris の増築費用は不要）",
    usage: "宿の管理パネルから使用"
  }
};

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
  rewardBase: 900,
  inviteeBonus: 250,
  dailyPaidLimit: 4
};

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
      "マーケット管理": "market-admin",
      "招待": "invite",
      "管理": "admin",
      "運営": "admin"
    };
    const panelId = panelAliases[rawPanelId] || rawPanelId;
    const panels = {
      home: () => ({
        title: "アイリス",
        description: "財布、ランク、マーケット、宿。よく使うものだけ置いています。",
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
            panelButton("マーケット", "marketplace", "primary"),
            panelButton("通話", "lounge")
          ]),
          buttons([
            panelButton("二人宿", "inn", "success"),
            panelButton("自分の店", "my-shop"),
            panelButton("招待", "invite"),
            panelButton("通知設定", "notify")
          ]),
          select("行き先を選ぶ", [
            option("通話ラウンジ", "panel:lounge", "発言と通話ランク"),
            option("マーケット", "panel:marketplace", "買う、見る、入札する"),
            option("自分の店", "panel:my-shop", "出品、売上、取引管理"),
            option("二人宿", "panel:inn", "2人用VCを作成するパネル"),
            option("招待", "panel:invite", "招待報酬と招待ランキング"),
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
      "market-review": () => this.marketReviewPanel(),
      "market-trades": () => this.marketTradesPanel(),
      "market-logs": () => this.marketLogsPanel(),
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
            panelButton("二人宿", "inn", "success"),
            runButton("Text順位", "rank text"),
            runButton("VC順位", "rank vc")
          ]),
          select("ラウンジ操作", [
            option("VC報酬を受け取る", "run:vc", "在室分を途中精算"),
            option("二人宿パネル", "panel:inn", "2人用VCを作成する"),
            option("プロフィールカード", "run:card", "今の見た目と総合ランク"),
            option("Textランキング", "run:rank text", "よく話す人ランキング"),
            option("VCランキング", "run:rank vc", "よく通話にいる人ランキング")
          ])
        ]
      }),
      inn: () => ({
        title: "二人宿",
        description: "このカテゴリに宿VCを作成します。作成後、宿内の管理パネルから名前と人数を変更できます。",
        color: 0x14b8a6,
        fields: [
          { name: "公開宿", value: "無料 / 誰でも見える / 基本2人", inline: true },
          { name: "シークレット宿", value: "10,000 Ris / 選んだ相手と自分だけ見える", inline: true },
          { name: "人数追加", value: "どちらも追加1人につき5,000 Ris", inline: true },
          { name: "期限", value: "12時間で自動終了", inline: true },
          { name: "制限", value: "1人につき作成できる宿は1つまで。空になった宿VCは自動削除されます。", inline: false }
        ],
        components: [
          buttons([
            runButton("公開宿を作る", "create-yado-vc", "primary"),
            runButton("シークレット宿", "choose-secret-yado", "danger")
          ])
        ]
      }),
      admin: () => ({
        title: "運営パネル",
        description: "運営機能を目的別のサブパネルに分けています。",
        color: 0x334155,
        fields: [
          { name: "マーケット管理", value: "公式商品、審査、取引対応、公式オークション", inline: true },
          { name: "残高操作", value: "個人セット/加算/減算、ロール一括セット、給与配布（一括加算）", inline: true },
          { name: "ランク設定", value: "昇格通知先の指定、ランク確認パネルの設置", inline: true },
          { name: "パネル送信", value: "住民向けの常設パネルをこのチャンネルへ送信できます。", inline: false }
        ],
        components: [
          buttons([
            panelButton("マーケット管理", "market-admin", "primary"),
            panelButton("残高操作", "admin-balance", "success"),
            panelButton("ランク設定", "admin-rank"),
            customButton("常設マーケット送信", "eco:market:post-panel"),
            panelButton("ホーム", "home")
          ]),
          select("公開したいパネル", [
            option("ホーム", "panel:home", "入口"),
            option("マーケット", "panel:marketplace", "買う側の入口"),
            option("自分の店", "panel:my-shop", "売る側の入口"),
            option("マーケット管理", "panel:market-admin", "公式商品、審査、取引対応"),
            option("二人宿", "panel:inn", "2人用VC作成パネル"),
            option("招待", "panel:invite", "招待台帳")
          ])
        ]
      }),
      invite: () => ({
        title: "招待台帳",
        description: "招待成立数と報酬を確認できます。",
        color: 0x22c55e,
        fields: [
          { name: "あなた", value: this.inviteLine(user), inline: true },
          { name: "報酬", value: `招待成立 ${fmt(this.inviteReward(user))}\n相手にも ${fmt(INVITE_CONFIG.inviteeBonus)}`, inline: true },
          { name: "条件", value: "招待で入る -> その人が `/eco join`。1日の有償招待には上限あり。", inline: false }
        ],
        components: [
          buttons([
            runButton("招待状況", "invite", "success"),
            runButton("招待ランキング", "rank invite"),
            panelButton("ホーム", "home")
          ])
        ]
      })
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
        "Discordでは `/マーケット`, `/自分の店`, `/管理` からマーケットを操作します。",
        "`panel` - ホームパネル",
        "`panel lounge` - 発言/通話パネル",
        "`panel inn` - 二人宿パネル",
        "`panel marketplace` - マーケット",
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
      ].filter(Boolean)
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
    return {
      ok: true,
      title: "招待台帳",
      lines: [
        this.inviteLine(user),
        `成立報酬: ${fmt(this.inviteReward(user))} / 相手ボーナス ${fmt(INVITE_CONFIG.inviteeBonus)}`,
        `今日の有償招待: ${user.invites.dailyPaid}/${INVITE_CONFIG.dailyPaidLimit}`,
        `全体: 追跡 ${this.state.invites.totalTracked} / 成立 ${this.state.invites.totalQualified}`,
        "招待で入った人が `/eco join` したら成立。即抜け農場は冷めるのでやめ。"
      ]
    };
  }

  inviteLine(user) {
    this.resetInviteDay(user);
    return `成立 ${user.invites.qualified} / 待ち ${user.invites.pending} / 報酬 ${fmt(user.invites.earned)}`;
  }

  inviteReward(user) {
    return INVITE_CONFIG.rewardBase + Math.min(user.invites.qualified, 20) * 45;
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
    return { ok: true, inviter, invitee };
  }

  recordInviteLeave(inviteeActor) {
    const invitee = this.getUser(inviteeActor.id, inviteeActor.name);
    invitee.invite.leftAt = this.now().toISOString();
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
    user.invite.qualified = true;
    user.invite.qualifiedAt = this.now().toISOString();
    inviter.invites.pending = Math.max(0, inviter.invites.pending - 1);
    inviter.invites.qualified += 1;
    this.state.invites.totalQualified += 1;

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

    this.log(inviter, "invite_reward", reward, user.name);
    return { inviter, reward, inviteeBonus };
  }

  inn() {
    return {
      ok: true,
      title: "二人宿",
      lines: [
        "二人宿はDiscordの固定パネルから使います。",
        "運営が `/管理` からカテゴリ内のテキストチャンネルにパネルを送信します。",
        "公開宿は無料。シークレット宿は10,000 Risで、選んだ相手と自分だけが見えるVCです。",
        "宿名と人数は、作成後に宿内の管理パネルから変更できます。追加人数は1人ごとに5,000 Risです。"
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
    const item = SHOP_ITEMS[id];
    return item ? item.price : 0;
  }

  loopSuggestion(user) {
    const suggestions = [];
    if (!user.joined) suggestions.push("まず `参加` で初期資本を受け取る");
    if (!user.lastDaily || cooldownRemaining(user.lastDaily, this.now(), 20 * 60 * 60 * 1000) === 0) suggestions.push("ログボを取る");
    if (suggestions.length === 0) suggestions.push("カードを見る、VCに入る、マーケットを眺める");
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
      title: "マーケット",
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
    if (["auction", "auctions"].includes(action)) return this.panelResult(this.officialAuctionsPanel(user));
    if (["inventory", "history"].includes(action)) return this.panelResult(this.marketInventoryPanel(user));
    if (["my", "my-shop"].includes(action)) return this.myShop(user);
    if (action === "product") return this.panelResult(this.officialProductPanel(user, args[1]));
    if (action === "confirm") return this.panelResult(this.officialConfirmPanel(user, args[1]));
    if (action === "buy") return this.buyItem(user, args[1]);
    if (action === "listing") return this.panelResult(this.userListingPanel(user, args[1]));
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

  marketplacePanel(user) {
    return {
      title: "マーケット",
      description: "商品購入、民営ショップ、公式オークションを利用できます。",
      color: 0x7c3aed,
      fields: [
        { name: "残高", value: this.moneyLine(user), inline: true },
        { name: "民営出品", value: `${this.activeListings().length}件`, inline: true },
        { name: "入口", value: "買う人は上段、売る人は自分の店へ。迷ったらトップへ戻れます。", inline: false }
      ],
      components: [
        buttons([
          panelButton("公式ショップ", "official-shop", "primary"),
          panelButton("民営ショップ", "user-shops", "primary"),
          panelButton("公式オークション", "official-auctions"),
          panelButton("自分の店", "my-shop", "success"),
          panelButton("持ち物", "market-inventory")
        ])
      ]
    };
  }

  officialShopPanel(user) {
    const fields = Object.entries(SHOP_ITEMS).map(([id, item]) => ({
      name: `${item.name}（${item.type}）`,
      value: `${fmt(this.itemPrice(id))} / ${item.kind === "consumable" ? "使い切り" : "常時発動"}\n効果: ${item.effect}\n所持 ${this.officialStockLine(user, id)}`,
      inline: true
    }));
    return {
      title: "公式ショップ",
      description: "Botが自動で付与する公式商品です。**常時発動** は所持中ずっと効果が出る、**使い切り** は `使う` コマンドまたはパネルで消費します。購入前に必ず確認画面を挟みます。",
      color: 0x8b5cf6,
      fields,
      components: [
        select("公式商品を選ぶ", Object.entries(SHOP_ITEMS).map(([id, item]) =>
          option(item.name, `run:marketplace product ${id}`, `${fmt(this.itemPrice(id))} / ${item.type} / ${item.effect}`.slice(0, 100))
        )),
        buttons([
          panelButton("マーケット", "marketplace"),
          panelButton("持ち物", "market-inventory"),
          panelButton("自分の店", "my-shop", "success")
        ])
      ]
    };
  }

  officialProductPanel(user, id) {
    const item = SHOP_ITEMS[id];
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
        { name: "効果", value: item.effect, inline: false },
        { name: "使い方", value: item.usage, inline: false },
        { name: "販売方式", value: item.kind === "consumable" ? "使い切り（消費型）" : "常時発動（所持型）", inline: false }
      ],
      components: [
        buttons([
          runButton("購入確認", `marketplace confirm ${id}`, "primary", soldOut),
          panelButton("公式ショップ", "official-shop"),
          panelButton("マーケット", "marketplace")
        ])
      ]
    };
  }

  officialConfirmPanel(user, id) {
    const item = SHOP_ITEMS[id];
    if (!item) return this.marketplacePanel(user);
    const price = this.itemPrice(id);
    const shortage = Math.max(0, price - user.wallet);
    return {
      title: "購入確認",
      description: "内容を確認してから購入してください。",
      color: 0xf59e0b,
      fields: [
        { name: "商品", value: item.name, inline: true },
        { name: "価格", value: fmt(price), inline: true },
        { name: "販売者", value: "公式", inline: true },
        { name: "残高", value: `${fmt(user.wallet)}${shortage ? `\n不足 ${fmt(shortage)}` : ""}`, inline: false }
      ],
      components: [
        buttons([
          runButton("購入する", `marketplace buy ${id}`, "success", shortage > 0),
          panelButton("やめる", "official-shop"),
          panelButton("マーケット", "marketplace")
        ])
      ]
    };
  }

  userShopsPanel(user) {
    const listings = this.activeListings().slice(0, 25);
    const openShops = this.openShopSellerIds();
    const shopEntries = Array.from(openShops)
      .map((ownerId) => this.state.marketplace.shops[ownerId])
      .filter(Boolean)
      .slice(0, 25);
    return {
      title: "民営ショップ",
      description: listings.length ? "ユーザーが出品している商品です。絞り込みや店ごとの一覧も見られます。" : "出品中の商品はまだありません。",
      color: 0x0f766e,
      fields: listings.slice(0, 6).map((listing) => ({
        name: listing.name,
        value: `${fmt(listing.price)} / ${saleModeLabel(listing.mode)} / 在庫 ${listing.stock}\n販売者 ${listing.sellerName}`,
        inline: true
      })),
      components: [
        buttons([
          customButton("絞り込みで探す", "eco:shop:search-open", "primary"),
          panelButton("マーケット", "marketplace"),
          panelButton("自分の店", "my-shop", "success"),
          panelButton("持ち物", "market-inventory")
        ]),
        listings.length
          ? select("商品を選ぶ", listings.map((listing) =>
            option(listing.name.slice(0, 90), `run:marketplace listing ${listing.id}`, `${fmt(listing.price)} / ${listing.sellerName}`)))
          : buttons([panelButton("自分の店", "my-shop", "success"), panelButton("マーケット", "marketplace")]),
        shopEntries.length
          ? select("店を選ぶ", shopEntries.map((shop) =>
              option(`${shop.name || `${shop.ownerName}の店`}`.slice(0, 90), `run:marketplace shop-view ${shop.ownerId}`, `${shop.ownerName || ""}`.slice(0, 100) || "店主")
            ))
          : buttons([panelButton("マーケット", "marketplace")])
      ]
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
        components: [buttons([panelButton("民営ショップ", "user-shops"), panelButton("マーケット", "marketplace")])]
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
          panelButton("マーケット", "marketplace"),
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
    const summaryLine = summary.length ? summary.join(" / ") : "条件なし（全商品）";
    return {
      title: `絞り込み結果（${results.length}件）`,
      description: `条件: ${summaryLine}\n上位25件までを表示します。`,
      color: 0x0f766e,
      fields: results.slice(0, 6).map((listing) => ({
        name: listing.name,
        value: `${fmt(listing.price)} / ${productTypeLabel(listing.type)} / ${listing.sellerName}\n在庫 ${listing.stock}`,
        inline: true
      })),
      components: [
        results.length
          ? select("商品を選ぶ", results.slice(0, 25).map((listing) =>
              option(listing.name.slice(0, 90), `run:marketplace listing ${listing.id}`, `${fmt(listing.price)} / ${listing.sellerName}`)
            ))
          : buttons([panelButton("民営ショップ", "user-shops")]),
        buttons([
          customButton("再検索", "eco:shop:search-open", "primary"),
          panelButton("民営ショップ", "user-shops"),
          panelButton("マーケット", "marketplace")
        ])
      ]
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
          panelButton("マーケット", "marketplace")
        ])
      ]
    };
  }

  userListingConfirmPanel(user, id) {
    const listing = this.findListing(id);
    if (!listing || listing.status !== "active") return this.userShopsPanel(user);
    const shortage = Math.max(0, listing.price - user.wallet);
    return {
      title: "購入確認",
      description: "民営商品です。内容と販売者を確認してください。",
      color: 0xf59e0b,
      fields: [
        { name: "商品", value: listing.name, inline: true },
        { name: "価格", value: fmt(listing.price), inline: true },
        { name: "販売者", value: listing.sellerName, inline: true },
        { name: "方式", value: saleModeLabel(listing.mode), inline: true },
        { name: "残高", value: `${fmt(user.wallet)}${shortage ? `\n不足 ${fmt(shortage)}` : ""}`, inline: false }
      ],
      components: [
        buttons([
          runButton("購入する", `marketplace listing-buy ${listing.id}`, "success", shortage > 0 || listing.sellerId === user.id),
          panelButton("やめる", "user-shops"),
          panelButton("マーケット", "marketplace")
        ])
      ]
    };
  }

  marketInventoryPanel(user) {
    const official = Object.entries(user.inventory || {})
      .filter(([, count]) => count > 0)
      .map(([id, count]) => `${SHOP_ITEMS[id]?.name || id} x${count}`);
    const marketItems = (user.marketplace.inventory || []).slice(-8).reverse().map((item) =>
      `${item.name} / ${item.expiresAt ? `期限 ${shortDate(item.expiresAt)}` : "買い切り"}`
    );
    const orders = this.userOrders(user.id).slice(0, 5).map((order) =>
      `#${order.id} ${order.itemName} / ${order.status === "open" ? "対応待ち" : "完了"}`
    );
    return {
      title: "購入履歴・持ち物",
      description: "公式商品、民営商品、手動対応中の取引を確認できます。",
      color: 0x475569,
      fields: [
        { name: "公式持ち物", value: official.join("\n") || "まだありません。", inline: false },
        { name: "民営持ち物", value: marketItems.join("\n") || "まだありません。", inline: false },
        { name: "取引中", value: orders.join("\n") || "対応待ちの取引はありません。", inline: false }
      ],
      components: [
        buttons([
          panelButton("マーケット", "marketplace"),
          panelButton("公式ショップ", "official-shop", "primary"),
          panelButton("民営ショップ", "user-shops", "primary")
        ])
      ]
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
          customButton("店の設定", "eco:market:shop-settings", "primary", !shop.shopOpened),
          customButton(isClosed ? "営業を再開する" : "休業中にする", "eco:shop:status-toggle", isClosed ? "success" : "danger", !shop.shopOpened),
          panelButton("商品を出す", "listing-new", "primary", !shop.shopOpened),
          panelButton("商品を管理", "my-listings")
        ]),
        buttons([
          panelButton("売上を見る", "my-sales"),
          panelButton("取引中の商品", "my-sales"),
          panelButton("民営ショップ", "user-shops"),
          panelButton("マーケット", "marketplace")
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
        { name: "審査", value: "高額商品、権利、サービス、ロールは審査待ちになる場合があります。", inline: false }
      ],
      components: [
        select("商品タイプ", Object.entries(MARKET_PRODUCT_TYPES).map(([id, label]) =>
          option(label, `run:marketplace listing-type ${id}`, `${label}として出品`)
        )),
        select("販売方式", Object.entries(MARKET_SALE_MODES).map(([id, label]) =>
          option(label, `run:marketplace listing-mode ${id}`, id === "timed" ? "期限付き商品" : "永続所持")
        )),
        buttons([
          customButton("内容入力", "eco:market:listing-create", "primary", !shop.shopOpened),
          panelButton("自分の店", "my-shop"),
          panelButton("マーケット", "marketplace")
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
    const restartable = listings.filter((l) => l.status === "stopped" && l.stock > 0);
    return {
      title: "商品管理",
      description: listings.length ? "出品中/審査待ち/停止/却下の商品を確認・編集できます。1件を選んで詳細操作します。" : "まだ出品がありません。",
      color: 0x14b8a6,
      fields: listings.map((listing) => ({
        name: `#${listing.id} ${listing.name}`,
        value: `${listingStatusLabel(listing.status)} / ${fmt(listing.price)} / 在庫 ${listing.stock}\n${productTypeLabel(listing.type)} / ${saleModeLabel(listing.mode)}${listing.reviewNote ? `\n却下理由: ${listing.reviewNote}` : ""}`,
        inline: false
      })),
      components: [
        editable.length
          ? select("編集する商品を選ぶ", editable.map((listing) =>
              option(`#${listing.id} ${listing.name}`.slice(0, 90), `run:marketplace edit-listing ${listing.id}`, `${listingStatusLabel(listing.status)} / ${fmt(listing.price)}`)
            ))
          : buttons([panelButton("商品を出す", "listing-new", "primary"), panelButton("自分の店", "my-shop")]),
        stoppable.length
          ? select("停止する商品を選ぶ", stoppable.map((listing) =>
              option(`#${listing.id} ${listing.name}`.slice(0, 90), `run:marketplace stop-listing ${listing.id}`, "出品を停止する")
            ))
          : buttons([panelButton("商品を出す", "listing-new", "primary")]),
        restartable.length
          ? select("再開する商品を選ぶ（停止済み）", restartable.map((listing) =>
              option(`#${listing.id} ${listing.name}`.slice(0, 90), `run:marketplace restart-listing ${listing.id}`, "再公開する")
            ))
          : buttons([panelButton("自分の店", "my-shop"), panelButton("民営ショップ", "user-shops")])
      ]
    };
  }

  mySalesPanel(user) {
    const orders = this.sellerOrders(user.id).slice(0, 10);
    return {
      title: "売上・取引",
      description: "売上と手動対応中の商品を確認できます。",
      color: 0x14b8a6,
      fields: [
        { name: "売上", value: fmt(user.marketplace.sales || 0), inline: true },
        { name: "取引", value: orders.length ? orders.map((order) => `#${order.id} ${order.itemName} / ${order.status === "open" ? "対応待ち" : "完了"}`).join("\n") : "まだ取引はありません。", inline: false }
      ],
      components: [
        orders.some((order) => order.status === "open")
          ? select("完了報告する取引", orders.filter((order) => order.status === "open").map((order) =>
            option(`#${order.id} ${order.itemName}`.slice(0, 90), `run:marketplace complete-order ${order.id}`, "手動対応を完了にする")
          ))
          : buttons([panelButton("自分の店", "my-shop")]),
        buttons([
          panelButton("自分の店", "my-shop"),
          panelButton("商品管理", "my-listings"),
          panelButton("マーケット", "marketplace")
        ])
      ]
    };
  }

  officialAuctionsPanel(user) {
    this.closeEndedAuctions();
    const auctions = this.state.marketplace.auctions.filter((auction) => ["open", "scheduled"].includes(auction.status));
    return {
      title: "公式オークション",
      description: auctions.length ? "公式競売です。入札額は一時的に拘束されます。" : "開催中の公式オークションはありません。",
      color: 0xf59e0b,
      fields: auctions.map((auction) => ({
        name: `#${auction.id} ${auction.name}`,
        value: `現在価格 ${fmt(auction.currentBid || auction.startPrice)}\n最低入札 ${fmt(this.minimumAuctionBid(auction))}\n終了 ${auction.endsAt ? shortDate(auction.endsAt) : "未設定"} / 入札 ${auction.bidCount || 0}件`,
        inline: true
      })),
      components: [
        auctions.length
          ? select("オークションを選ぶ", auctions.map((auction) =>
            option(`#${auction.id} ${auction.name}`.slice(0, 90), `run:marketplace auction ${auction.id}`, `${fmt(auction.currentBid || auction.startPrice)} / 最低 ${fmt(this.minimumAuctionBid(auction))}`)
          ))
          : buttons([panelButton("マーケット", "marketplace")]),
        buttons([
          panelButton("マーケット", "marketplace"),
          panelButton("公式ショップ", "official-shop", "primary"),
          panelButton("民営ショップ", "user-shops")
        ])
      ]
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
          panelButton("マーケット", "marketplace")
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
          panelButton("マーケット", "marketplace")
        ])
      ]
    };
  }

  marketAdminPanel(user) {
    const settings = this.state.marketplace.settings;
    const pending = this.state.marketplace.listings.filter((listing) => listing.status === "pending").length;
    const openOrders = this.state.marketplace.orders.filter((order) => order.status === "open").length;
    const openAuctions = this.state.marketplace.auctions.filter((auction) => auction.status === "open");
    return {
      title: "マーケット管理",
      description: "公式商品、公式オークション、民営出品、取引トラブルを管理します。",
      color: 0x334155,
      fields: [
        { name: "民営出品", value: `公開 ${this.activeListings().length}件 / 審査待ち ${pending}件`, inline: true },
        { name: "取引対応", value: `対応待ち ${openOrders}件`, inline: true },
        { name: "公式オークション", value: `開催中 ${openAuctions.length}件`, inline: true },
        { name: "手数料", value: `${(settings.feeBps / 100).toFixed(1)}%`, inline: true },
        { name: "制限", value: `高額審査 ${fmt(settings.reviewPrice)} / 出品上限 ${settings.maxActiveListings}件`, inline: false }
      ],
      components: [
        buttons([
          panelButton("公式商品管理", "official-shop", "primary"),
          panelButton("公式オークション管理", "official-auctions"),
          panelButton("民営ショップ管理", "user-shops"),
          panelButton("出品審査", "market-review"),
          panelButton("取引対応", "market-trades")
        ]),
        buttons([
          customButton("競売を作る", "eco:market:auction-create", "success"),
          panelButton("ログ確認", "market-logs"),
          panelButton("運営パネル", "admin"),
          panelButton("マーケット", "marketplace")
        ]),
        openAuctions.length
          ? select("強制終了する競売", openAuctions.slice(0, 25).map((auction) =>
            option(`#${auction.id} ${auction.name}`.slice(0, 90), `run:marketplace auction-end ${auction.id}`, `現在 ${fmt(auction.currentBid || auction.startPrice)}`)
          ))
          : buttons([panelButton("公式オークション", "official-auctions")])
      ]
    };
  }

  marketReviewPanel() {
    const pending = this.state.marketplace.listings.filter((listing) => listing.status === "pending").slice(0, 10);
    const rejected = this.state.marketplace.listings.filter((listing) => listing.status === "rejected").slice(-3);
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
      components: [
        pending.length
          ? select("審査する商品を選ぶ", pending.map((listing) =>
              option(`#${listing.id} ${listing.name}`.slice(0, 90), `run:marketplace review ${listing.id}`, `${fmt(listing.price)} / ${listing.sellerName}`)
            ))
          : buttons([panelButton("マーケット管理", "market-admin")]),
        buttons([panelButton("マーケット管理", "market-admin"), panelButton("運営パネル", "admin")])
      ]
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
          panelButton("マーケット管理", "market-admin")
        ])
      ]
    };
  }

  marketTradesPanel() {
    const openOrders = this.state.marketplace.orders
      .filter((order) => order.status === "open" || order.status === "reported")
      .slice(0, 10);
    return {
      title: "取引対応",
      description: openOrders.length ? "手動対応中または報告中の取引です。1件を選んで対応してください。" : "対応待ちの取引はありません。",
      color: 0x334155,
      fields: openOrders.map((order) => ({
        name: `#${order.id} ${order.itemName}${order.status === "reported" ? " ⚠問題報告" : ""}`,
        value: `購入者 ${order.buyerName} / 販売者 ${order.sellerName}\n${fmt(order.price)} / 手数料 ${fmt(order.fee || 0)} / ${productTypeLabel(order.type)}`,
        inline: false
      })),
      components: [
        openOrders.length
          ? select("この取引を管理", openOrders.map((order) =>
              option(`#${order.id} ${order.itemName}`.slice(0, 90), `run:marketplace order ${order.id}`, `${order.buyerName} <- ${order.sellerName}`)
            ))
          : buttons([panelButton("マーケット管理", "market-admin")]),
        buttons([panelButton("マーケット管理", "market-admin"), panelButton("運営パネル", "admin")])
      ]
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
        { name: "手動対応", value: order.manual ? "はい" : "いいえ", inline: true },
        { name: "作成日時", value: order.createdAt ? shortDate(order.createdAt) : "-", inline: true }
      ],
      components: [
        buttons([
          customButton("完了扱いにする", `eco:order:complete:${order.id}`, "success", ["complete", "refunded"].includes(order.status)),
          customButton("返金する", `eco:order:refund:${order.id}`, "danger", order.status === "refunded"),
          panelButton("取引対応に戻る", "market-trades"),
          panelButton("マーケット管理", "market-admin")
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
        { name: "昇格通知先", value: "発言/通話ランクが上がった時にお祝いメッセージを投稿するチャンネル。未設定なら環境変数を使います。", inline: false }
      ],
      components: [
        buttons([
          customButton("ランク確認パネル設置", "eco:admin:rank-panel-post", "primary"),
          customButton("昇格通知先をここに", "eco:admin:rank-notify-set", "success"),
          customButton("昇格通知先をクリア", "eco:admin:rank-notify-clear"),
          panelButton("運営パネル", "admin")
        ])
      ]
    };
  }

  marketLogsPanel() {
    return {
      title: "ログ確認",
      description: "直近のマーケットログです。",
      color: 0x334155,
      fields: [
        { name: "ログ", value: this.state.marketplace.logs.slice(-10).reverse().join("\n") || "まだログはありません。", inline: false }
      ],
      components: [buttons([panelButton("マーケット管理", "market-admin"), panelButton("運営パネル", "admin")])]
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
    if (listing.sellerId === user.id) return { ok: false, title: "自分の商品です", lines: ["自分の商品は購入できません。"] };
    if (listing.stock <= 0) return { ok: false, title: "在庫切れ", lines: ["この商品は売り切れました。"] };
    const sellerRef = this.state.users[listing.sellerId];
    if ((sellerRef?.marketplace?.shopStatus || "open") === "closed") {
      return { ok: false, title: "現在休業中", lines: ["この店は現在休業中で購入できません。時間をおいてください。"] };
    }
    if (user.wallet < listing.price) {
      return {
        ok: false,
        title: "残高が足りません",
        lines: [
          `必要: ${fmt(listing.price)}`,
          `現在: ${fmt(user.wallet)}`,
          `不足: ${fmt(listing.price - user.wallet)}`
        ]
      };
    }

    const seller = this.getUser(listing.sellerId, listing.sellerName);
    const fee = Math.floor(listing.price * this.state.marketplace.settings.feeBps / 10000);
    const sellerReceive = listing.price - fee;
    user.wallet -= listing.price;
    user.lifetimeLost += listing.price;
    seller.wallet += sellerReceive;
    seller.lifetimeEarned += sellerReceive;
    this.ensureShopShape(seller).sales += sellerReceive;
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
    this.marketLog(`${user.name} が ${seller.name} から ${listing.name} を購入しました。`);
    return {
      ok: true,
      title: listing.manual ? "購入完了（対応待ち）" : "購入完了",
      lines: [
        `商品: ${listing.name}`,
        `支払い: ${fmt(listing.price)}`,
        `残高: ${fmt(user.wallet)}`,
        listing.manual ? "この商品は販売者の手動対応が必要です。取引中の商品から確認できます。" : "付与が完了しました。"
      ],
      panel: listing.manual ? this.marketInventoryPanel(user) : this.userShopsPanel(user),
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
    listing.status = "stopped";
    listing.stoppedAt = new Date().toISOString();
    this.marketLog(`${user.name} が ${listing.name} を停止しました。`);
    return { ok: true, title: "出品停止", lines: [`${listing.name} を停止しました。`], panel: this.myListingsPanel(user) };
  }

  completeOrder(user, id) {
    const order = this.state.marketplace.orders.find((entry) => String(entry.id) === String(id));
    if (!order || (order.sellerId !== user.id && order.buyerId !== user.id)) {
      return { ok: false, title: "取引が見つかりません", lines: ["関係者だけが完了報告できます。"] };
    }
    order.status = "complete";
    order.completedAt = new Date().toISOString();
    this.marketLog(`#${order.id} ${order.itemName} が完了しました。`);
    return { ok: true, title: "完了報告", lines: [`#${order.id} ${order.itemName} を完了にしました。`], panel: this.mySalesPanel(user) };
  }

  reportOrder(user, id) {
    const order = this.state.marketplace.orders.find((entry) => String(entry.id) === String(id));
    if (!order || (order.sellerId !== user.id && order.buyerId !== user.id)) {
      return { ok: false, title: "取引が見つかりません", lines: ["関係者だけが報告できます。"] };
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
    this.marketLog(`${adminUser.name} が #${order.id} ${order.itemName} を運営完了にしました。`);
    return {
      ok: true,
      title: "運営完了処理",
      lines: [`#${order.id} ${order.itemName} を完了扱いにしました。`, `販売者: ${order.sellerName} / 購入者: ${order.buyerName}`],
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

    if (order.sellerId !== "official") {
      const seller = this.getUser(order.sellerId, order.sellerName);
      const sellerReceive = Math.max(0, order.price - (order.fee || 0));
      seller.wallet = Math.max(0, seller.wallet - sellerReceive);
      seller.lifetimeLost += sellerReceive;
      const shop = this.ensureShopShape(seller);
      shop.sales = Math.max(0, (shop.sales || 0) - sellerReceive);

      const listing = this.findListing(order.listingId);
      if (listing) {
        listing.stock = (listing.stock || 0) + 1;
        listing.sold = Math.max(0, (listing.sold || 0) - 1);
        if (listing.status === "soldout" && listing.stock > 0) listing.status = "active";
      }
      notifications.push({
        userId: order.sellerId,
        event: "order_refunded",
        data: { orderId: order.id, itemName: order.itemName, amount: sellerReceive, role: "seller" }
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
        order.sellerId === "official" ? "販売者は公式のため、売上調整は不要です。" : `販売者 ${order.sellerName} の売上と在庫を巻き戻しました。`
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

  searchListings({ keyword = "", minPrice = "", maxPrice = "", type = "" } = {}) {
    const kw = String(keyword || "").toLowerCase().trim();
    const min = parsePositiveInt(minPrice);
    const max = parsePositiveInt(maxPrice);
    const typeMap = { "ロール": "role", "称号": "title", "アイテム": "item", "チケット": "ticket", "権利": "right", "サービス": "service", "セット": "bundle", "セット商品": "bundle" };
    const typeKey = MARKET_PRODUCT_TYPES[type] ? type : (typeMap[String(type || "").trim()] || null);
    return this.activeListings().filter((listing) => {
      if (kw && !String(listing.name).toLowerCase().includes(kw) && !String(listing.description || "").toLowerCase().includes(kw)) return false;
      if (typeKey && listing.type !== typeKey) return false;
      if (Number.isFinite(min) && listing.price < min) return false;
      if (Number.isFinite(max) && listing.price > max) return false;
      return true;
    });
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
    this.marketLog(`${user.name} が #${listing.id} を編集: ${changes.slice(0, 3).join(" / ")}`);
    return {
      ok: true,
      title: "商品を更新しました",
      lines: [`#${listing.id} ${listing.name}`, ...changes],
      panel: this.myListingsPanel(user)
    };
  }

  restartListing(user, id) {
    const listing = this.findListing(id);
    if (!listing) return { ok: false, title: "商品が見つかりません", lines: [`#${id} は台帳にありません。`] };
    if (listing.sellerId !== user.id) return { ok: false, title: "自分の商品ではありません", lines: ["自分の出品だけ再開できます。"] };
    if (listing.status !== "stopped") return { ok: false, title: "再開できません", lines: [`#${listing.id} は現在 ${listingStatusLabel(listing.status)} です。停止済みの商品だけ再開できます。`] };
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
    const item = SHOP_ITEMS[id];
    if (!item) return "-";
    return `${user.inventory[id] || 0}/${item.max}`;
  }

  marketLog(line) {
    this.state.marketplace.logs.push(`${shortDate(new Date().toISOString())} ${line}`);
    this.state.marketplace.logs = this.state.marketplace.logs.slice(-80);
  }

  buyItem(user, id) {
    const item = SHOP_ITEMS[id];
    if (!item) {
      return { ok: false, title: "棚にない商品", lines: ["マーケットの公式ショップで買えるものを確認してください。"] };
    }

    const owned = user.inventory[id] || 0;
    if (owned >= item.max) {
      return { ok: false, title: "持ちすぎ", lines: [`${item.name} はこれ以上持てません。`] };
    }

    const price = this.itemPrice(id);
    if (user.wallet < price) {
      return { ok: false, title: "Risが足りない", lines: [`${item.name} には ${fmt(price)} 必要です。`, this.moneyLine(user)] };
    }

    user.wallet -= price;
    user.inventory[id] = owned + 1;
    user.lifetimeLost += price;
    this.log(user, "buy", -price, item.name);

    return {
      ok: true,
      title: "購入完了",
      lines: [`${item.name} を買いました。`, item.description, this.moneyLine(user)]
    };
  }

  useItem(user, id) {
    const item = SHOP_ITEMS[id];
    if (!item) {
      return { ok: false, title: "未確認アイテム", lines: ["マーケットの持ち物で使えるものを確認してください。"] };
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
      label = (value) => `${value}人`;
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

  finishVoiceSession(actor) {
    const user = this.getUser(actor.id, actor.name);
    if (!user.activity.voiceJoinedAt) return null;

    const result = this.claimVoiceReward(user, { ending: true });
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
    const xp = cappedMinutes * VOICE_REWARD_CONFIG.xpPerMinute;
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

    const after = rankFor(VC_RANKS, user.activity.vcXp);
    const capLine = drip <= 0 ? "今日のVC Risは上限。ランクだけ伸びます。" : this.voiceRewardLine(user);
    if (after.name !== before.name) {
      const progress = rankWithProgress(VC_RANKS, user.activity.vcXp);
      return {
        ok: true,
        kind: "vc_rank_up",
        title: "通話ランク昇格",
        silent: Boolean(options.silent),
        lines: [`${user.name} が ${after.name} になりました。`, `通話レベル ${this.vcLevel(user)} / 通話 ${cappedMinutes}分 / 経験値 +${xp} / +${fmt(drip)}`, capLine],
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
      lines: [`通話レベル ${this.vcLevel(user)} / 通話 ${cappedMinutes}分 / 経験値 +${xp} / +${fmt(drip)}`, capLine]
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
    return entries.map(([id, count]) => `${SHOP_ITEMS[id]?.name || id} x${count}`).join(", ");
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
    lastDaily: null,
    lastWork: null,
    lastSubsidy: null,
    notifyEnabled: false
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
  next.marketplace.logs = Array.isArray(next.marketplace.logs) ? next.marketplace.logs : [];
  next.marketplace.settings = { ...base.marketplace.settings, ...(next.marketplace.settings || {}) };
  next.marketplace.nextListingId = Math.max(1, Number(next.marketplace.nextListingId) || 1);
  next.marketplace.nextOrderId = Math.max(1, Number(next.marketplace.nextOrderId) || 1);
  next.marketplace.nextAuctionId = Math.max(1, Number(next.marketplace.nextAuctionId) || 1);
  next.invites = { ...base.invites, ...(next.invites || {}) };
  next.invites.recent = Array.isArray(next.invites.recent) ? next.invites.recent : [];
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
    activity: { ...fresh.activity, ...(user.activity || {}) },
    marketplace: {
      ...fresh.marketplace,
      ...(user.marketplace || {}),
      listingDraft: { ...fresh.marketplace.listingDraft, ...((user.marketplace || {}).listingDraft || {}) },
      inventory: Array.isArray((user.marketplace || {}).inventory) ? user.marketplace.inventory : []
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
  CURRENCY,
  ECONOMY_RANKS,
  SHOP_ITEMS,
  TEXT_RANKS,
  VC_RANKS,
  EconomyEngine,
  createInitialState,
  formatResult,
  fmt
};
