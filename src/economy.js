const CURRENCY = {
  code: "KC",
  name: "K-Credit",
  issuer: "Kei Central Ledger"
};

const ECONOMY_CONFIG = {
  starterGrant: 100000
};

const ASSETS = {
  RAMEN: {
    name: "深夜ラーメン先物",
    price: 120,
    volatility: 0.18,
    description: "夜中ほど買われる謎の商品。翌朝に少し反省される。"
  },
  OSHI: {
    name: "推し活ETF",
    price: 300,
    volatility: 0.22,
    description: "尊さで上がり、財布の現実で下がる。"
  },
  FUTON: {
    name: "布団IPO",
    price: 80,
    volatility: 0.13,
    description: "上場すると全員が二度寝する。値動きは意外と堅い。"
  },
  TAX: {
    name: "税務署REIT",
    price: 500,
    volatility: 0.09,
    description: "みんなが嫌がるほど安定する、心の置き場所に困る銘柄。"
  },
  NEON: {
    name: "ネオン雑談HD",
    price: 220,
    volatility: 0.2,
    description: "深夜VCが伸びると買われる。朝になると全員が記憶をなくす。"
  },
  MUTE: {
    name: "ミュート解除工業",
    price: 160,
    volatility: 0.24,
    description: "『あ、ミュートだった』の回数に連動するらしい。IRは全部小声。"
  },
  GABA: {
    name: "ガバナンス豆腐",
    price: 90,
    volatility: 0.31,
    description: "柔らかいのに値動きだけ硬派。決算は毎回ちょっと崩れる。"
  },
  YAMI: {
    name: "闇鍋クラウド",
    price: 420,
    volatility: 0.27,
    description: "何を売ってるか分からないが、なぜか月額課金だけ強い。"
  }
};

const SHOP_ITEMS = {
  chair: {
    name: "社長のイス",
    price: 1500,
    max: 1,
    kind: "passive",
    description: "座るだけで労働報酬 +15%。姿勢も態度もデカくなる。"
  },
  stamp: {
    name: "謎スタンプカード",
    price: 1200,
    max: 1,
    kind: "passive",
    description: "ログボ +250 KC。何の店のカードか誰も知らない。"
  },
  shredder: {
    name: "領収書シュレッダー",
    price: 900,
    max: 99,
    kind: "consumable",
    description: "税務署ヘイトを 25 下げる。使うと部屋が静かになる。"
  },
  coupon: {
    name: "逆クーポン",
    price: 300,
    max: 99,
    kind: "consumable",
    description: "使うとお金が増えることも減ることもある。経理が泣く。"
  },
  helmet: {
    name: "投資ヘルメット",
    price: 1800,
    max: 1,
    kind: "passive",
    description: "市場急落時の損をちょっとだけやわらげる。精神論ではない。"
  },
  tonic: {
    name: "集中トニック",
    price: 650,
    max: 20,
    kind: "consumable",
    description: "RPGのHPとエナジーを少し戻す。味は会議室の水。"
  }
};

const WORKS = [
  { text: "自販機の下を金融街として再開発した", min: 90, max: 260, heat: 2, xp: 8 },
  { text: "会議で『それはレバレッジですね』だけ言い続けた", min: 120, max: 310, heat: 4, xp: 10 },
  { text: "レシートを見て宇宙の真理に近づいた", min: 80, max: 230, heat: 1, xp: 7 },
  { text: "社内通貨を勝手に発行して昼休みに上場した", min: 170, max: 420, heat: 10, xp: 14 },
  { text: "『雰囲気で決算を読む』講座を開いた", min: 140, max: 360, heat: 6, xp: 12 },
  { text: "空き箱をサブスク化して投資家をうならせた", min: 160, max: 390, heat: 8, xp: 13 },
  { text: "給与明細に励ましの付箋を貼る副業をした", min: 100, max: 270, heat: 0, xp: 9 }
];

const MARKET_NEWS = [
  "中央台帳が咳払い。板が一瞬だけ正座しました。",
  "深夜VC指数が上振れ。眠い銘柄ほど買われています。",
  "『実質無料』発言で財布の倫理が崩壊しました。",
  "決算資料のフォントが強すぎて、内容より先に買われています。",
  "謎の専門家が『ここは握力』と言い、握っている理由が消えました。",
  "全銘柄が一瞬だけ『俺、何の会社だっけ』になりました。",
  "ミュート解除需要が急増。会議系銘柄に雑な資金流入。",
  "推し活関連に資金流入。理由は尊いから。以上です。"
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
  { name: "未上場", min: -Infinity },
  { name: "個人商店", min: 1000 },
  { name: "流動性提供者", min: 7000 },
  { name: "地区銀行", min: 25000 },
  { name: "経済圏中枢", min: 80000 },
  { name: "K-Credit 財閥", min: 200000 }
];

const RPG_RANKS = [
  { name: "見習い", min: 0 },
  { name: "探索者", min: 120 },
  { name: "作戦参謀", min: 420 },
  { name: "領域守護者", min: 1000 },
  { name: "伝説の会計係", min: 2400 },
  { name: "世界決算者", min: 5200 }
];

const QUESTS = {
  task: {
    name: "未処理タスクの砦",
    cost: 2,
    power: 18,
    rewardMin: 140,
    rewardMax: 340,
    xpMin: 24,
    xpMax: 46,
    description: "積まれたタスクを片づける。倒すというより、減らす。"
  },
  invoice: {
    name: "請求書の迷宮",
    cost: 3,
    power: 28,
    rewardMin: 280,
    rewardMax: 620,
    xpMin: 42,
    xpMax: 80,
    description: "数字と向き合う試練。目をそらすと増える。"
  },
  deadline: {
    name: "締切前線",
    cost: 4,
    power: 42,
    rewardMin: 520,
    rewardMax: 1100,
    xpMin: 80,
    xpMax: 150,
    description: "集中力で突破する高難度クエスト。通知は切っていけ。"
  }
};

const CASINO_SYMBOLS = ["KC", "7", "BAR", "IPO", "TAX", "UP"];

const CASINO_MASCOT = {
  name: "リリス",
  title: "アイリス地下卓の煽りディーラー",
  opener: "リリスが卓に肘をついた。笑ってるのに、目だけ負けを待ってる。",
  win: [
    "リリス: はいはい、今日はその顔していいよ。次で崩れる顔だけど。",
    "リリス: うわ、通した。台帳が一瞬だけ舌打ちしたわ。",
    "リリス: まだ勝ち顔早い。財布しまってから威張りな。",
    "リリス: いいじゃん。少しだけ、あたしの読みを汚したね。"
  ],
  lose: [
    "リリス: んー、今の押し方、財布が先に謝ってたよ。",
    "リリス: はい床。きれいに抜けたね。そこ座って反省しな。",
    "リリス: 取り返す前に水飲みな。指がもう負けてる。",
    "リリス: その顔、嫌いじゃないよ。負けを認めたらもっと良くなる。"
  ],
  block: [
    "リリス: 今日は閉店。RPG行きな、顔が熱い。",
    "リリス: その指、今信用ない。休憩。",
    "リリス: 台帳ストップ。ここから先はだいたい負け顔。",
    "リリス: 止められて悔しい？ いい顔。でも今日は終わり。"
  ]
};

const KABU_CONFIG = {
  minPrice: 28,
  maxPrice: 680,
  startPrice: 96,
  shelfLifeDays: 7
};

const POLICY_CONFIG = {
  baseCpi: 1000,
  policyCycleCommands: 12,
  targetInflationBps: 8,
  maxDeflationBps: -80,
  maxInflationBps: 240
};

const SAFETY_CONFIG = {
  casinoDailyLossBase: 2400,
  casinoDailyPlayLimit: 80,
  casinoLossStreakLimit: 4,
  casinoCooldownMs: 12 * 60 * 1000
};

const VOICE_REWARD_CONFIG = {
  kcPerMinute: 4,
  xpPerMinute: 6,
  dailyCapBase: 1800,
  dailyCapPerLevel: 90,
  maxClaimMinutes: 240,
  autoSettleMs: 10 * 60 * 1000
};

const SINK_CONFIG = {
  baseTarget: 6000,
  targetGrowth: 1.18,
  minContribution: 100,
  eventDurationCommands: 36
};

const INVITE_CONFIG = {
  rewardBase: 900,
  inviteeBonus: 250,
  dailyPaidLimit: 4
};

const HOUSE_PROFILES = {
  normal: {
    name: "通常営業",
    kugi: 100,
    returnRate: 94,
    volatility: 100,
    jackpot: 100,
    description: "ふつう。リリスが一番つまらなそうな顔をする設定。"
  },
  sweet: {
    name: "甘デジ",
    kugi: 108,
    returnRate: 98,
    volatility: 82,
    jackpot: 92,
    description: "当たりは軽い。脳汁は薄め。雑談向け。"
  },
  middle: {
    name: "ミドル",
    kugi: 100,
    returnRate: 94,
    volatility: 115,
    jackpot: 105,
    description: "今の標準。ちょい荒、ちゃんと痛い。"
  },
  max: {
    name: "強欲",
    kugi: 92,
    returnRate: 90,
    volatility: 145,
    jackpot: 125,
    description: "当たりは重い。刺さると声が出る。やりすぎ注意。"
  },
  festival: {
    name: "祭り",
    kugi: 115,
    returnRate: 101,
    volatility: 130,
    jackpot: 115,
    description: "短時間イベント用。常設すると経済が変な汗をかく。"
  }
};

const CARD_STYLES = [
  {
    id: "civic",
    name: "CIVIC",
    minScore: 0,
    color: 0x64748b,
    width: 54,
    layout: "compact",
    tagline: "Entry ledger card"
  },
  {
    id: "chrome",
    name: "CHROME",
    minScore: 4,
    color: 0x0891b2,
    width: 60,
    layout: "split",
    tagline: "Ranked activity card"
  },
  {
    id: "aurum",
    name: "AURUM",
    minScore: 8,
    color: 0xd97706,
    width: 64,
    layout: "ledger",
    tagline: "Premium balance sheet"
  },
  {
    id: "prism",
    name: "PRISM",
    minScore: 13,
    color: 0x7c3aed,
    width: 68,
    layout: "matrix",
    tagline: "Multi-domain rank matrix"
  },
  {
    id: "black",
    name: "BLACK",
    minScore: 18,
    color: 0x111827,
    width: 72,
    layout: "executive",
    tagline: "Central ledger executive card"
  }
];

function createInitialState() {
  return {
    version: 3,
    currency: CURRENCY,
    commandCount: 0,
    users: {},
    market: {
      day: 1,
      assets: Object.fromEntries(
        Object.entries(ASSETS).map(([symbol, asset]) => [
          symbol,
          {
            name: asset.name,
            price: asset.price,
            previousPrice: asset.price,
            volatility: asset.volatility,
            description: asset.description
          }
        ])
      ),
      kabu: {
        price: KABU_CONFIG.startPrice,
        previousPrice: KABU_CONFIG.startPrice,
        trend: "flat",
        trendAge: 0,
        news: "カブ屋が路地に出ました。買う理由はだいたい雰囲気です。"
      },
      news: ["K-Credit 経済圏が開場しました。最初から少し不安です。"]
    },
    policy: {
      cpi: POLICY_CONFIG.baseCpi,
      previousCpi: POLICY_CONFIG.baseCpi,
      inflationBps: 0,
      targetInflationBps: POLICY_CONFIG.targetInflationBps,
      stance: "neutral",
      issued: 0,
      sunk: 0,
      cycleIssued: 0,
      cycleSunk: 0,
      moneySupply: 0,
      lastPolicyCommand: 0,
      history: []
    },
    sink: {
      name: "自由闇鍋",
      pool: 0,
      target: SINK_CONFIG.baseTarget,
      level: 0,
      totalBurned: 0,
      activeEvent: null,
      history: []
    },
    house: {
      profile: "middle",
      kugi: HOUSE_PROFILES.middle.kugi,
      returnRate: HOUSE_PROFILES.middle.returnRate,
      volatility: HOUSE_PROFILES.middle.volatility,
      jackpot: HOUSE_PROFILES.middle.jackpot,
      updatedBy: null,
      updatedAt: null
    },
    invites: {
      totalTracked: 0,
      totalQualified: 0,
      totalPaid: 0,
      recent: []
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
    this.regenerateRpg(user);
    const parsed = parseInput(input);

    if (!parsed.command) {
      return this.panel(user, "home");
    }

    this.state.commandCount += 1;
    const beforeSupply = this.moneySupply();
    const spoil = this.applyKabuSpoilage(user);
    this.maybeAdvanceMarket();
    const raid = this.maybeTaxRaid(user);

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
      case "policy":
      case "inflation":
      case "cpi":
      case "インフレ":
        result = this.policyReport();
        break;
      case "sink":
      case "burn":
      case "祭壇":
      case "闇鍋":
        result = this.sink(user, parsed.args);
        break;
      case "invite":
      case "invites":
      case "招待":
        result = this.inviteReport(user);
        break;
      case "safety":
      case "safe":
      case "limits":
      case "安全":
        result = this.safetyReport(user);
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
        result = this.shop();
        break;
      case "buy":
      case "買う":
        result = this.buyItem(user, parsed.args[0]);
        break;
      case "use":
      case "使う":
        result = this.useItem(user, parsed.args[0]);
        break;
      case "market":
      case "markets":
      case "相場":
        result = this.market();
        break;
      case "kabu":
      case "turnip":
      case "カブ":
        result = this.kabu(user, parsed.args);
        break;
      case "invest":
      case "投資":
        result = this.invest(user, parsed.args[0], parsed.args[1]);
        break;
      case "sell":
      case "売る":
        result = this.sell(user, parsed.args[0], parsed.args[1]);
        break;
      case "portfolio":
      case "pf":
      case "ポートフォリオ":
        result = this.portfolio(user);
        break;
      case "loan":
      case "借金":
        result = this.loan(user, parsed.args[0]);
        break;
      case "repay":
      case "返済":
        result = this.repay(user, parsed.args[0]);
        break;
      case "rank":
      case "leaderboard":
      case "ランキング":
        result = this.leaderboard(parsed.args[0]);
        break;
      case "news":
      case "events":
      case "ニュース":
        result = this.news();
        break;
      case "lounge":
      case "通話":
        result = this.panel(user, "lounge");
        break;
      case "vc":
      case "voice":
      case "claimvc":
      case "通話報酬":
        result = this.claimVoiceReward(user);
        break;
      case "casino":
      case "カジノ":
        result = this.panel(user, "casino");
        break;
      case "house":
      case "釘":
      case "casino-config":
        result = this.house(user, parsed.args);
        break;
      case "rpg":
      case "status":
      case "ステータス":
        result = this.rpgStatus(user);
        break;
      case "quests":
      case "クエスト":
        result = this.quests();
        break;
      case "quest":
      case "adventure":
      case "冒険":
        result = this.quest(user, parsed.args[0]);
        break;
      case "train":
      case "鍛錬":
        result = this.train(user, parsed.args[0]);
        break;
      case "rest":
      case "休む":
        result = this.rest(user);
        break;
      case "slots":
      case "slot":
      case "スロット":
        result = this.slots(user, parsed.args[0]);
        break;
      case "coinflip":
      case "flip":
      case "コイントス":
        result = this.coinflip(user, parsed.args[0], parsed.args[1]);
        break;
      case "dice":
      case "ダイス":
        result = this.dice(user, parsed.args[0], parsed.args[1]);
        break;
      case "blackjack":
      case "bj":
      case "ブラックジャック":
        result = this.blackjack(user, parsed.args[0]);
        break;
      case "crash":
      case "倍率":
        result = this.crash(user, parsed.args[0], parsed.args[1]);
        break;
      case "roulette":
      case "roul":
      case "ルーレット":
        result = this.roulette(user, parsed.args[0], parsed.args[1]);
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

    if (raid) result.lines.unshift(...raid.lines, "");
    if (spoil) result.lines.unshift(spoil, "");
    this.observeSupplyDelta(this.moneySupply() - beforeSupply);
    this.maybeRunPolicyCycle();
    this.updateTitle(user);
    return result;
  }

  panel(user, panelIdRaw = "home") {
    const panelId = String(panelIdRaw || "home").toLowerCase();
    const safety = this.casinoSafety(user);
    const panels = {
      home: () => ({
        title: "K-Credit Lounge",
        description: "通話しながら触れる経済圏ホーム。まずはカード、ログボ、労働、気分でRPGか市場。",
        color: 0x0f766e,
        fields: [
          { name: "Today", value: this.loopSuggestion(user), inline: false },
          { name: "Status", value: `${this.moneyLine(user)}\nText ${rankFor(TEXT_RANKS, user.activity.textXp).name} / VC ${rankFor(VC_RANKS, user.activity.vcXp).name}`, inline: true },
          { name: "Policy", value: `CPI ${this.cpiLabel()}\n${this.policyLabel()}`, inline: true }
        ],
        components: [
          buttons([
            runButton("参加", "join", "success"),
            runButton("カード", "card", "primary"),
            runButton("ログボ", "daily", "success"),
            runButton("労働", "work", "primary"),
            panelButton("通話", "lounge")
          ]),
          buttons([
            panelButton("RPG", "rpg"),
            panelButton("市場", "market"),
            panelButton("カジノ", "casino", "danger"),
            panelButton("シンク", "sink"),
            panelButton("招待", "invite", "success")
          ]),
          select("行き先を選ぶ", [
            option("通話ラウンジ", "panel:lounge", "Text/VCランクと通話向け導線"),
            option("RPGパネル", "panel:rpg", "クエスト、休息、育成"),
            option("市場パネル", "panel:market", "相場、ポートフォリオ、政策"),
            option("カジノパネル", "panel:casino", "低額ベットと安全上限つき"),
            option("シンク", "panel:sink", "KCを燃やして鯖イベントを起こす"),
            option("招待", "panel:invite", "招待報酬と招待ランキング"),
            option("安全設計", "panel:safety", "損失上限、クールダウン、方針")
          ])
        ]
      }),
      lounge: () => ({
        title: "Voice Lounge Panel",
        description: "通話に上がってるだけでKCが落ちます。退室時にも精算、途中で欲しけりゃ押せばいい。",
        color: 0x2563eb,
        fields: [
          { name: "VC", value: `Rank ${rankFor(VC_RANKS, user.activity.vcXp).name}\n${user.activity.vcMinutes} min / ${user.activity.vcXp} XP`, inline: true },
          { name: "VC Pay", value: this.voiceRewardLine(user), inline: true },
          { name: "Text", value: `Rank ${rankFor(TEXT_RANKS, user.activity.textXp).name}\n${user.activity.textMessages} msg / ${user.activity.textXp} XP`, inline: true },
          { name: "回し方", value: "VCに入る -> しゃべる -> `VC精算` -> カードが育つ。黙ってても少し増えます。", inline: false }
        ],
        components: [
          buttons([
            runButton("カード", "card", "primary"),
            runButton("VC精算", "vc", "success"),
            runButton("Text順位", "rank text"),
            runButton("VC順位", "rank vc"),
            panelButton("ホーム", "home")
          ]),
          select("ラウンジ操作", [
            option("VC報酬を受け取る", "run:vc", "在室分を途中精算"),
            option("プロフィールカード", "run:card", "今の見た目と総合ランク"),
            option("Textランキング", "run:rank text", "よく話す人ランキング"),
            option("VCランキング", "run:rank vc", "よく通話にいる人ランキング"),
            option("安全パネル", "panel:safety", "やりすぎ防止の確認")
          ])
        ]
      }),
      rpg: () => ({
        title: "RPG Panel",
        description: "短い刺激をRPG側に逃がす場所。カジノに寄りすぎないための受け皿でもあります。",
        color: 0x16a34a,
        fields: [
          { name: "Status", value: `${rankFor(RPG_RANKS, user.rpg.xp).name} / Lv ${this.rpgLevel(user)}\n${this.rpgLine(user)}`, inline: true },
          { name: "Stats", value: `ATK ${user.rpg.attack} / DEF ${user.rpg.defense}\nFOCUS ${user.rpg.focus} / LUCK ${user.rpg.luck}`, inline: true },
          { name: "おすすめ", value: user.rpg.energy >= 4 ? "`締切前線` いけます。重いなら `未処理タスク`。" : "Energyが薄いので `rest` か `use tonic`。", inline: false }
        ],
        components: [
          buttons([
            runButton("ステータス", "rpg"),
            runButton("タスク", "quest task", "success"),
            runButton("請求書", "quest invoice", "primary"),
            runButton("締切", "quest deadline", "danger"),
            runButton("休む", "rest", "success")
          ]),
          select("育成/道具", [
            option("ATKを鍛える", "run:train attack", "クエスト突破力"),
            option("DEFを鍛える", "run:train defense", "被ダメージ軽減"),
            option("FOCUSを鍛える", "run:train focus", "Energyと安定感"),
            option("LUCKを鍛える", "run:train luck", "報酬と運要素"),
            option("トニック使用", "run:use tonic", "HPとEnergyを少し回復")
          ]),
          buttons([panelButton("ホーム", "home"), panelButton("カジノ", "casino"), panelButton("市場", "market")])
        ]
      }),
      market: () => ({
        title: "Stock Pit Panel",
        description: "値動きで雑談を起こす場所。パネルは小口だけ。全ツッパは自分の指で打ってください。",
        color: 0x0891b2,
        fields: [
          { name: "Policy", value: `CPI ${this.cpiLabel()}\n${this.policyLabel()}`, inline: true },
          { name: "Portfolio", value: `${fmt(Math.floor(this.holdingsValue(user)))}\n${Object.keys(user.holdings).length} assets`, inline: true },
          { name: "Hot Board", value: this.hotBoard(), inline: false },
          { name: "Note", value: "パネル投資は300 KC固定。胃が動く額はコマンド入力に隔離しています。", inline: false }
        ],
        components: [
          buttons([
            runButton("相場", "market"),
            runButton("PF", "portfolio"),
            runButton("カブ価", "kabu"),
            runButton("政策", "policy"),
            panelButton("ホーム", "home")
          ]),
          select("小口投資", [
            option("カブ 1000 KC買う", "run:kabu buy 1000", "腐る前に売る胃痛商品"),
            option("カブ 全部売る", "run:kabu sell all", "逃げる時は一瞬"),
            option("NEON 300 KC", "run:invest NEON 300", "深夜VCが燃料の雑談株"),
            option("MUTE 300 KC", "run:invest MUTE 300", "ミュート解除需要に賭ける"),
            option("GABA 300 KC", "run:invest GABA 300", "崩れる豆腐に乗る"),
            option("YAMI 300 KC", "run:invest YAMI 300", "正体不明クラウドを買う"),
            option("OSHI 300 KC", "run:invest OSHI 300", "尊さを買う。財布は知らん"),
            option("政策レポート", "run:policy", "インフレ状態を見る")
          ])
        ]
      }),
      casino: () => ({
        title: "Casino Panel",
        description: "脳は使わない。手汗だけ使う。仮想KCだけ、負けが込んだら台帳が肩を叩きます。",
        color: 0xdc2626,
        fields: [
          { name: CASINO_MASCOT.name, value: `${CASINO_MASCOT.title}\n「勝てる顔してないけど、座る？ ま、負け顔も嫌いじゃないけど」`, inline: false },
          { name: "釘", value: this.houseLine(), inline: false },
          { name: "Safety", value: safety.summary, inline: false },
          { name: "Stats", value: `${user.casino.wins}勝 ${user.casino.losses}敗\n収支 ${fmt(user.casino.profit)}`, inline: true },
          { name: "Limit", value: `Daily loss ${fmt(safety.dailyLoss)} / ${fmt(safety.dailyLossLimit)}\nPlays ${safety.dailyPlays}/${SAFETY_CONFIG.casinoDailyPlayLimit}`, inline: true },
          { name: "Vibe", value: "`Crash` は倍率チキンレース。`Roulette` は置いて祈るだけ。取り返しボタンはありません。", inline: false }
        ],
        components: [
          buttons([
            runButton("Crash x2", "crash 100 2.0", "danger", safety.blocked),
            runButton("Roulette 赤", "roulette 100 red", "danger", safety.blocked),
            runButton("Slots 100", "slots 100", "danger", safety.blocked),
            runButton("BJ 100", "bj 100", "danger", safety.blocked),
            panelButton("安全", "safety")
          ]),
          select("低額ゲーム", [
            option("Crash 100 KC / x1.5", "run:crash 100 1.5", "浅く逃げる。勝ちは軽いが生存寄り"),
            option("Crash 100 KC / x3.0", "run:crash 100 3.0", "欲が顔を出すライン"),
            option("Roulette 100 KC / 赤", "run:roulette 100 red", "置くだけ。玉が悪い"),
            option("Roulette 100 KC / ゼロ", "run:roulette 100 zero", "ほぼ祈祷。倍率は高め"),
            option("Slots 100 KC", "run:slots 100", "絵柄3つのスロット"),
            option("Blackjack 100 KC", "run:bj 100", "自動プレイのブラックジャック"),
            option("安全レポート", "run:safety", "今日の上限とクールダウン")
          ], safety.blocked),
          buttons([panelButton("ホーム", "home"), panelButton("RPGへ逃がす", "rpg"), runButton("カード", "card")])
          ,
          select("店の設定", [
            option("甘デジ", "run:house profile sweet", "軽い。雑談向け"),
            option("ミドル", "run:house profile middle", "標準設定"),
            option("強欲", "run:house profile max", "荒い。短時間向け"),
            option("祭り", "run:house profile festival", "イベント用。常設注意"),
            option("現在の釘を見る", "run:house", "設定確認")
          ])
        ]
      }),
      safety: () => ({
        title: "Safety Panel",
        description: "刺激は強め、設計は静かに堅め。煽り通知、実マネー、無制限ベットは扱いません。",
        color: 0x475569,
        fields: [
          { name: "Casino Guard", value: safety.summary, inline: false },
          { name: "Rules", value: "日次損失上限 / 連敗クールダウン / 1日プレイ上限 / CPI連動ベット上限", inline: false },
          { name: "Social Guard", value: "Text XPはクールダウンあり。VCは1回最大240分精算。昇格時以外は静かに保存。", inline: false }
        ],
        components: [
          buttons([
            runButton("安全レポート", "safety"),
            runButton("政策", "policy"),
            panelButton("ホーム", "home"),
            panelButton("RPG", "rpg"),
            panelButton("カジノ", "casino")
          ])
        ]
      }),
      sink: () => {
        const event = this.activeSinkEvent();
        return {
          title: "Sink Panel",
          description: "KCを燃やす場所。財布は減る。鯖には変な追い風が吹く。",
          color: 0x9333ea,
          fields: [
            { name: this.state.sink.name, value: `${fmt(this.state.sink.pool)} / ${fmt(this.state.sink.target)}\n累計焼却 ${fmt(this.state.sink.totalBurned)}`, inline: true },
            { name: "Event", value: event ? `${event.name}\n残り ${event.expiresAtCommand - this.state.commandCount} actions` : "いまは無風。誰か燃やせ。", inline: true },
            { name: "何が起きる", value: "VC報酬ブースト、カブ価の変な風、税務署の目そらし、カードの見栄え。直接配当はありません。", inline: false }
          ],
          components: [
            buttons([
              runButton("100 KC燃やす", "sink 100", "primary"),
              runButton("500 KC燃やす", "sink 500", "primary"),
              runButton("1000 KC燃やす", "sink 1000", "danger"),
              runButton("状態", "sink"),
              panelButton("ホーム", "home")
            ]),
            buttons([panelButton("招待", "invite", "success"), panelButton("通話", "lounge"), panelButton("市場", "market")])
          ]
        };
      },
      invite: () => ({
        title: "Invite Panel",
        description: "人を呼ぶとKC。即抜け農場は台帳が冷めた目で見ます。",
        color: 0x22c55e,
        fields: [
          { name: "あなた", value: this.inviteLine(user), inline: true },
          { name: "報酬", value: `招待成立 ${fmt(this.inviteReward(user))}\n相手にも ${fmt(this.rewardAmount(INVITE_CONFIG.inviteeBonus))}`, inline: true },
          { name: "条件", value: "招待で入る -> その人が `/eco join`。1日の有償招待には上限あり。", inline: false }
        ],
        components: [
          buttons([
            runButton("招待状況", "invite", "success"),
            runButton("招待ランキング", "rank invite"),
            panelButton("シンク", "sink"),
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
      "Discordではボタンとセレクトで操作できます。CLIでは表示された裏コマンドを直接打ってください。"
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
        "基本は `/eco` または `panel` から触ってください。細かいコマンドはパネルの裏側にあります。",
        "`panel` - ホームパネル",
        "`panel lounge` - 通話/Text/VCパネル",
        "`panel rpg` - RPGパネル",
        "`panel market` - 市場パネル",
        "`panel casino` - カジノパネル",
        "`panel safety` - 安全設計パネル",
        "`card` / `policy` / `safety` - 直接見たい時だけ使う短縮コマンド"
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
    const grant = this.rewardAmount(ECONOMY_CONFIG.starterGrant);
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
        "ようこそ。財布は薄いが、声は出せる。",
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
        `投資評価額: ${fmt(Math.floor(this.holdingsValue(user)))}`,
        `カブ評価額: ${fmt(Math.floor(this.kabuValue(user)))}`,
        `借金: ${fmt(user.debt)}`,
        `純資産: ${fmt(Math.floor(this.netWorth(user)))}`,
        `経済ランク: ${rankFor(ECONOMY_RANKS, this.netWorth(user)).name}`,
        `CPI: ${this.cpiLabel()} / 政策: ${this.policyLabel()}`,
        `税務署ヘイト: ${bar(user.heat, 100)} ${user.heat}/100`
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
    const rpgRank = rankWithProgress(RPG_RANKS, user.rpg.xp);
    const style = this.cardStyle(user);
    const score = this.cardScore(user);
    const title = `${user.name} / ${style.name} CARD`;
    const data = {
      mode,
      user,
      style,
      score,
      title,
      subtitle: user.title,
      net,
      wallet: user.wallet,
      debt: user.debt,
      heat: user.heat,
      textRank,
      vcRank,
      econRank,
      rpgRank,
      casinoLine: `${user.casino.wins}勝 ${user.casino.losses}敗 / ${fmt(user.casino.profit)}`,
      rpgLine: this.rpgLine(user),
      cpiLine: `${this.cpiLabel()} / ${this.policyLabel()}`
    };

    return {
      ok: true,
      title,
      lines: renderPlayerCardLines(data),
      card: buildDiscordCard(data)
    };
  }

  policyReport() {
    const policy = this.state.policy;
    const priceFactor = this.priceFactor();
    const rewardFactor = this.rewardFactor();
    const supply = this.moneySupply();

    return {
      ok: true,
      title: "K-Credit Monetary Policy",
      lines: [
        `CPI: ${this.cpiLabel()} (${signedPercent(policy.inflationBps)} / cycle)`,
        `政策スタンス: ${this.policyLabel()}`,
        `Money Supply: ${fmt(Math.floor(supply))}`,
        `Cycle Flow: +${fmt(policy.cycleIssued)} / -${fmt(policy.cycleSunk)}`,
        `Total Flow: +${fmt(policy.issued)} / -${fmt(policy.sunk)}`,
        `価格倍率: x${priceFactor.toFixed(2)} / 報酬倍率: x${rewardFactor.toFixed(2)}`,
        "高インフレ時は価格とベット上限が締まり、報酬の伸びは抑制されます。デフレ時は報酬側が少し支援されます。"
      ]
    };
  }

  sink(user, args = []) {
    const amountRaw = args[0];
    if (!amountRaw || ["status", "状態"].includes(String(amountRaw).toLowerCase())) {
      const event = this.activeSinkEvent();
      return {
        ok: true,
        title: this.state.sink.name,
        lines: [
          `鍋: ${fmt(this.state.sink.pool)} / ${fmt(this.state.sink.target)}`,
          `累計焼却: ${fmt(this.state.sink.totalBurned)} / Lv ${this.state.sink.level}`,
          event ? `発動中: ${event.name} - ${event.description}` : "発動中: なし。鍋が冷めています。",
          "例: `sink 500`。燃やしたKCは戻りません。そこがいい。"
        ]
      };
    }

    const amount = parseAmount(amountRaw, user.wallet);
    if (!Number.isFinite(amount) || amount < SINK_CONFIG.minContribution) {
      return { ok: false, title: "燃料が薄い", lines: [`最低 ${fmt(SINK_CONFIG.minContribution)} から。ケチな火はすぐ消えます。`] };
    }
    if (user.wallet < amount) {
      return { ok: false, title: "財布が足りない", lines: [`燃やせるのは ${fmt(user.wallet)} まで。`, this.moneyLine(user)] };
    }

    user.wallet -= amount;
    user.lifetimeLost += amount;
    this.state.sink.pool += amount;
    this.state.sink.totalBurned += amount;
    this.log(user, "sink", -amount, this.state.sink.name);

    const lines = [
      `${user.name} が ${fmt(amount)} を鍋に落としました。音がよくない。`,
      `鍋: ${fmt(this.state.sink.pool)} / ${fmt(this.state.sink.target)}`,
      this.moneyLine(user)
    ];

    let event = null;
    while (this.state.sink.pool >= this.state.sink.target) {
      this.state.sink.pool -= this.state.sink.target;
      event = this.triggerSinkEvent(user);
      lines.splice(2, 0, `発火: ${event.name}。${event.description}`);
    }

    return {
      ok: true,
      title: event ? "シンク発火" : "シンク投入",
      lines
    };
  }

  triggerSinkEvent(user) {
    const events = [
      { id: "voice_rush", name: "通話バブル", description: "VC報酬が少し太ります。今だけ声に利息がつく。" },
      { id: "kabu_wind", name: "カブ屋の横風", description: "カブ価に変な風が吹きます。勝つかは知らん。" },
      { id: "tax_smoke", name: "税務署スモーク", description: "税務署の目が少し泳ぎます。領収書はまだ見られてます。" },
      { id: "card_glow", name: "カード発光", description: "カードが少し偉そうになります。財布は戻りません。" }
    ];
    const event = {
      ...pick(this.rng, events),
      by: user.id,
      byName: user.name,
      atCommand: this.state.commandCount,
      expiresAtCommand: this.state.commandCount + SINK_CONFIG.eventDurationCommands
    };

    this.state.sink.level += 1;
    this.state.sink.target = this.costAmount(Math.floor(this.state.sink.target * SINK_CONFIG.targetGrowth));
    this.state.sink.activeEvent = event;
    this.state.sink.history.push(event);
    this.state.sink.history = this.state.sink.history.slice(-12);

    if (event.id === "kabu_wind") {
      this.state.market.kabu.trend = "spike";
      this.state.market.kabu.trendAge = 0;
      this.state.market.kabu.news = "誰かが鍋を燃やしたせいでカブ屋が急に強気です。";
    }

    this.state.market.news.push(`Sink: ${event.name} by ${user.name}.`);
    this.state.market.news = this.state.market.news.slice(-25);
    return event;
  }

  activeSinkEvent() {
    const event = this.state.sink.activeEvent;
    if (!event) return null;
    if (this.state.commandCount >= event.expiresAtCommand) {
      this.state.sink.activeEvent = null;
      return null;
    }
    return event;
  }

  inviteReport(user) {
    return {
      ok: true,
      title: "招待台帳",
      lines: [
        this.inviteLine(user),
        `成立報酬: ${fmt(this.inviteReward(user))} / 相手ボーナス ${fmt(this.rewardAmount(INVITE_CONFIG.inviteeBonus))}`,
        `今日の有償招待: ${user.invites.dailyPaid}/${INVITE_CONFIG.dailyPaidLimit}`,
        `全体: tracked ${this.state.invites.totalTracked} / qualified ${this.state.invites.totalQualified}`,
        "招待で入った人が `/eco join` したら成立。即抜け農場は冷めるのでやめ。"
      ]
    };
  }

  inviteLine(user) {
    this.resetInviteDay(user);
    return `成立 ${user.invites.qualified} / 待ち ${user.invites.pending} / 報酬 ${fmt(user.invites.earned)}`;
  }

  inviteReward(user) {
    return this.rewardAmount(INVITE_CONFIG.rewardBase + Math.min(user.invites.qualified, 20) * 45);
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

    const inviteeBonus = this.rewardAmount(INVITE_CONFIG.inviteeBonus);
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

  cardScore(user) {
    const casinoScore = user.casino.profit >= 25000 ? 4 : user.casino.profit >= 8000 ? 3 : user.casino.profit > 0 ? 2 : user.casino.wins >= 10 ? 1 : 0;
    const sinkBonus = this.activeSinkEvent()?.id === "card_glow" ? 2 : 0;
    return (
      rankIndex(ECONOMY_RANKS, this.netWorth(user)) +
      rankIndex(TEXT_RANKS, user.activity.textXp) +
      rankIndex(VC_RANKS, user.activity.vcXp) +
      rankIndex(RPG_RANKS, user.rpg.xp) +
      casinoScore +
      sinkBonus
    );
  }

  cardStyle(user) {
    const score = this.cardScore(user);
    return CARD_STYLES.reduce((best, style) => (score >= style.minScore ? style : best), CARD_STYLES[0]);
  }

  cpiLabel() {
    return `${(this.state.policy.cpi / 10).toFixed(1)}`;
  }

  policyLabel() {
    const labels = {
      stimulus: "stimulus",
      neutral: "neutral",
      watch: "watch",
      tightening: "tightening",
      emergency: "emergency"
    };
    return labels[this.state.policy.stance] || "neutral";
  }

  priceFactor() {
    return clamp(this.state.policy.cpi / POLICY_CONFIG.baseCpi, 0.65, 6);
  }

  rewardFactor() {
    const cpiFactor = Math.pow(this.priceFactor(), 0.72);
    const stance = this.state.policy.stance;
    const policyFactor = stance === "emergency" ? 0.78 : stance === "tightening" ? 0.88 : stance === "watch" ? 0.94 : stance === "stimulus" ? 1.08 : 1;
    return clamp(cpiFactor * policyFactor, 0.55, 4.5);
  }

  costFactor() {
    const stance = this.state.policy.stance;
    const policyFactor = stance === "emergency" ? 1.16 : stance === "tightening" ? 1.08 : stance === "stimulus" ? 0.96 : 1;
    return clamp(this.priceFactor() * policyFactor, 0.7, 7);
  }

  rewardAmount(baseAmount) {
    return Math.max(1, Math.floor(baseAmount * this.rewardFactor()));
  }

  costAmount(baseAmount) {
    return Math.max(1, Math.floor(baseAmount * this.costFactor()));
  }

  itemPrice(id) {
    const item = SHOP_ITEMS[id];
    return item ? this.costAmount(item.price) : 0;
  }

  trainingCost(current) {
    return this.costAmount(450 + current * current * 35);
  }

  restCost(user) {
    return Math.min(user.wallet, this.costAmount(120 + this.rpgLevel(user) * 25));
  }

  minimumBet() {
    return Math.max(10, this.costAmount(10));
  }

  maximumBet(user) {
    const base = 5000 + this.level(user) * 500;
    const inflationLimit = Math.floor(base * Math.sqrt(this.priceFactor()));
    const stance = this.state.policy.stance;
    const policyLimit = stance === "emergency" ? 0.55 : stance === "tightening" ? 0.7 : stance === "watch" ? 0.85 : 1;
    return Math.max(500, Math.floor(inflationLimit * policyLimit));
  }

  house(user, args = []) {
    const action = String(args[0] || "status").toLowerCase();
    if (["status", "view", "見る", "確認"].includes(action)) {
      return {
        ok: true,
        title: "アイリス地下卓 釘設定",
        lines: [
          this.houseLine(),
          "profile: `house profile sweet|middle|max|festival`",
          "manual: `house set kugi 105`, `house set return 96`, `house set volatility 120`, `house set jackpot 110`",
          "リリス: 釘を触る顔してる。こわ。そういう支配欲、嫌いじゃないけど。"
        ]
      };
    }

    if (action === "profile") {
      const profileId = String(args[1] || "").toLowerCase();
      const profile = HOUSE_PROFILES[profileId];
      if (!profile) {
        return { ok: false, title: "設定がない", lines: [`使える設定: ${Object.keys(HOUSE_PROFILES).join(", ")}`] };
      }
      this.state.house = {
        ...this.state.house,
        profile: profileId,
        kugi: profile.kugi,
        returnRate: profile.returnRate,
        volatility: profile.volatility,
        jackpot: profile.jackpot,
        updatedBy: user.id,
        updatedAt: this.now().toISOString()
      };
      return {
        ok: true,
        title: `釘変更: ${profile.name}`,
        lines: [profile.description, this.houseLine()]
      };
    }

    if (action === "set") {
      const key = normalizeHouseKey(args[1]);
      const value = Number(args[2]);
      if (!key || !Number.isFinite(value)) {
        return {
          ok: false,
          title: "釘の触り方が雑",
          lines: ["例: `house set kugi 105`, `house set return 96`, `house set volatility 120`, `house set jackpot 110`"]
        };
      }
      const ranges = {
        kugi: [75, 125],
        returnRate: [82, 105],
        volatility: [65, 160],
        jackpot: [70, 150]
      };
      const [min, max] = ranges[key];
      this.state.house[key] = clamp(Math.round(value), min, max);
      this.state.house.profile = "manual";
      this.state.house.updatedBy = user.id;
      this.state.house.updatedAt = this.now().toISOString();
      return {
        ok: true,
        title: "釘を触りました",
        lines: [`${key}: ${this.state.house[key]}`, this.houseLine()]
      };
    }

    return { ok: false, title: "釘コマンド不明", lines: ["`house` で今の設定、`house profile middle` で一括変更。"] };
  }

  houseLine() {
    const house = this.state.house;
    const profile = HOUSE_PROFILES[house.profile]?.name || "手打ち";
    return `${profile} / 釘 ${house.kugi} / 還元 ${house.returnRate}% / 荒さ ${house.volatility} / 大当たり ${house.jackpot}`;
  }

  casinoChance(base, options = {}) {
    const house = this.state.house;
    const mode = options.jackpot ? house.jackpot / 100 : 1;
    const factor = (house.kugi / 100) * Math.sqrt(house.returnRate / 94) * mode;
    return clamp(base * factor, 0.01, 0.92);
  }

  casinoPayout(betAmount, multiplier, options = {}) {
    const house = this.state.house;
    const volatility = options.jackpot ? house.volatility / 100 : 1;
    const payoutScale = house.returnRate / 94;
    return Math.floor(betAmount * multiplier * payoutScale * volatility);
  }

  casinoVolatility() {
    return this.state.house.volatility / 100;
  }

  casinoSafety(user) {
    this.resetCasinoDay(user);
    const now = this.now();
    const lockedUntil = user.casino.lockedUntil ? new Date(user.casino.lockedUntil) : null;
    const cooldownMs = lockedUntil ? Math.max(0, lockedUntil - now) : 0;
    const dailyLossLimit = this.dailyLossLimit(user);
    const blockedByLoss = user.casino.dailyLoss >= dailyLossLimit;
    const blockedByPlays = user.casino.dailyPlays >= SAFETY_CONFIG.casinoDailyPlayLimit;
    const blocked = cooldownMs > 0 || blockedByLoss || blockedByPlays;
    const reasons = [];
    if (cooldownMs > 0) reasons.push(`cooldown ${formatDuration(cooldownMs)}`);
    if (blockedByLoss) reasons.push("daily loss limit");
    if (blockedByPlays) reasons.push("daily play limit");

    return {
      blocked,
      reasons,
      cooldownMs,
      dailyLoss: user.casino.dailyLoss,
      dailyLossLimit,
      dailyPlays: user.casino.dailyPlays,
      summary: blocked
        ? `今日は止めどころです: ${reasons.join(", ")}。RPGか通話パネルに逃がしましょう。`
        : `OK: 今日の損失 ${fmt(user.casino.dailyLoss)} / ${fmt(dailyLossLimit)}、プレイ ${user.casino.dailyPlays}/${SAFETY_CONFIG.casinoDailyPlayLimit}。`
    };
  }

  safetyReport(user) {
    const safety = this.casinoSafety(user);
    return {
      ok: !safety.blocked,
      title: "Safety Report",
      lines: [
        safety.summary,
        `カジノ日次損失: ${fmt(safety.dailyLoss)} / ${fmt(safety.dailyLossLimit)}`,
        `カジノ日次プレイ: ${safety.dailyPlays}/${SAFETY_CONFIG.casinoDailyPlayLimit}`,
        `連敗ストリーク: ${Math.abs(Math.min(0, user.casino.streak))}/${SAFETY_CONFIG.casinoLossStreakLimit}`,
        `最大ベット: ${fmt(this.maximumBet(user))} / 最低ベット: ${fmt(this.minimumBet())}`,
        "このボットは実マネー、換金、課金連動、DM煽り通知を想定していません。"
      ]
    };
  }

  resetCasinoDay(user) {
    const today = dayKey(this.now());
    if (user.casino.day === today) return;
    user.casino.day = today;
    user.casino.dailyLoss = 0;
    user.casino.dailyPlays = 0;
    user.casino.lockedUntil = null;
  }

  dailyLossLimit(user) {
    const rankBonus = this.level(user) * 120;
    return this.costAmount(SAFETY_CONFIG.casinoDailyLossBase + rankBonus);
  }

  loopSuggestion(user) {
    const suggestions = [];
    if (!user.joined) suggestions.push("まず `参加` で初期資本を受け取る");
    if (!user.lastDaily || cooldownRemaining(user.lastDaily, this.now(), 20 * 60 * 60 * 1000) === 0) suggestions.push("ログボを取る");
    if (user.rpg.energy >= 4) suggestions.push("RPGを1回だけ回す");
    if (this.casinoSafety(user).blocked) suggestions.push("カジノは休んで通話/RPGへ");
    if (suggestions.length === 0) suggestions.push("カードを見る、VCに入る、市場を眺める");
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
    const amount = this.rewardAmount(600 + Math.min(user.streak * 120, 1800) + stampBonus + randInt(this.rng, 0, 180));
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
        stampBonus ? "謎スタンプカードが光りました。意味は分かりません。" : null,
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
    const amount = this.rewardAmount(Math.floor(randInt(this.rng, job.min, job.max) * multiplier));
    user.wallet += amount;
    user.lifetimeEarned += amount;
    user.workCount += 1;
    user.xp += job.xp;
    user.heat = clamp(user.heat + job.heat + randInt(this.rng, 0, 3), 0, 100);
    user.lastWork = now.toISOString();
    this.log(user, "work", amount, job.text);

    const lines = [
      `${job.text}。`,
      `報酬 ${fmt(amount)} を獲得。`,
      hasChair ? "社長のイス効果で報酬がちょっと偉そうに増えました。" : null,
      `税務署ヘイト: ${user.heat}/100`,
      this.moneyLine(user)
    ].filter(Boolean);

    if (this.rng() < 0.12) {
      const bonus = this.rewardAmount(randInt(this.rng, 80, 260));
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
      const fee = Math.min(user.wallet, this.costAmount(randInt(this.rng, 20, 160)));
      user.wallet -= fee;
      user.lifetimeLost += fee;
      user.heat = clamp(user.heat + 2, 0, 100);
      return {
        ok: false,
        title: "申請書が迷子",
        lines: [`手数料 ${fmt(fee)} だけ取られました。これが行政の味。`, this.moneyLine(user)]
      };
    }

    const amount = this.rewardAmount(randInt(this.rng, 80, 380));
    user.wallet += amount;
    user.lifetimeEarned += amount;
    return {
      ok: true,
      title: "給付金チャレンジ成功",
      lines: [`${fmt(amount)} を受け取りました。プライドは非課税です。`, this.moneyLine(user)]
    };
  }

  shop() {
    return {
      ok: true,
      title: `${CURRENCY.name} 商店`,
      lines: Object.entries(SHOP_ITEMS).map(([id, item]) => {
        return `\`${id}\` ${item.name} - ${fmt(this.itemPrice(id))}: ${item.description}`;
      })
    };
  }

  buyItem(user, id) {
    const item = SHOP_ITEMS[id];
    if (!item) {
      return { ok: false, title: "棚にない商品", lines: ["`shop` で買えるものを確認してください。"] };
    }

    const owned = user.inventory[id] || 0;
    if (owned >= item.max) {
      return { ok: false, title: "持ちすぎ", lines: [`${item.name} はこれ以上持てません。`] };
    }

    const price = this.itemPrice(id);
    if (user.wallet < price) {
      return { ok: false, title: "KCが足りない", lines: [`${item.name} には ${fmt(price)} 必要です。`, this.moneyLine(user)] };
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
      return { ok: false, title: "未確認アイテム", lines: ["`shop` で使えるものを確認してください。"] };
    }

    if (!user.inventory[id]) {
      return { ok: false, title: "持っていません", lines: [`${item.name} は在庫ゼロです。`] };
    }

    if (item.kind !== "consumable") {
      return { ok: false, title: "常時発動アイテム", lines: [`${item.name} は持っているだけで効果があります。`] };
    }

    user.inventory[id] -= 1;
    if (user.inventory[id] <= 0) delete user.inventory[id];

    if (id === "shredder") {
      const before = user.heat;
      user.heat = clamp(user.heat - 25, 0, 100);
      return {
        ok: true,
        title: "シュレッダー起動",
        lines: [`税務署ヘイトが ${before} から ${user.heat} になりました。`, "音だけはやけに爽快です。"]
      };
    }

    if (id === "coupon") {
      const rawSwing = randInt(this.rng, -450, 700);
      const swing = rawSwing >= 0 ? this.rewardAmount(rawSwing) : -this.costAmount(Math.abs(rawSwing));
      user.wallet = Math.max(0, user.wallet + swing);
      if (swing >= 0) user.lifetimeEarned += swing;
      else user.lifetimeLost += Math.abs(swing);

      return {
        ok: swing >= 0,
        title: swing >= 0 ? "逆クーポンが逆に勝ち" : "逆クーポンが順当に負け",
        lines: [
          `${swing >= 0 ? fmt(swing) : fmt(Math.abs(swing))} ${swing >= 0 ? "増えました" : "減りました"}。`,
          "会計ソフトは黙りました。",
          this.moneyLine(user)
        ]
      };
    }

    if (id === "tonic") {
      const hp = randInt(this.rng, 8, 16);
      const energy = randInt(this.rng, 2, 4);
      user.rpg.hp = clamp(user.rpg.hp + hp, 0, user.rpg.maxHp);
      user.rpg.energy = clamp(user.rpg.energy + energy, 0, user.rpg.maxEnergy);
      return {
        ok: true,
        title: "集中トニック使用",
        lines: [`HP +${hp} / Energy +${energy}`, this.rpgLine(user)]
      };
    }

    return { ok: false, title: "何も起きない", lines: ["そのアイテムはまだ効果が実装されていません。"] };
  }

  market() {
    const lines = Object.entries(this.state.market.assets).map(([symbol, asset]) => {
      const change = asset.price - asset.previousPrice;
      const pct = asset.previousPrice > 0 ? (change / asset.previousPrice) * 100 : 0;
      const sign = change >= 0 ? "+" : "";
      return `\`${symbol}\` ${asset.name}: ${fmt(asset.price)} (${sign}${pct.toFixed(1)}%) - ${asset.description}`;
    });

    return {
      ok: true,
      title: `KC Market Day ${this.state.market.day}`,
      lines: [
        ...lines,
        "",
        `KABU: ${fmt(this.state.market.kabu.price)} (${kabuChangeLabel(this.state.market.kabu)}) - 腐る前に売るだけの胃痛商品。`,
        `CPI ${this.cpiLabel()} / Policy ${this.policyLabel()}`,
        "例: `invest NEON 1000`, `sell NEON all`, `kabu buy 1000`, `kabu sell all`"
      ]
    };
  }

  hotBoard() {
    return Object.entries(this.state.market.assets)
      .map(([symbol, asset]) => {
        const pct = asset.previousPrice > 0 ? ((asset.price - asset.previousPrice) / asset.previousPrice) * 100 : 0;
        return { symbol, pct, price: asset.price };
      })
      .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
      .slice(0, 4)
      .map((item) => {
        const sign = item.pct >= 0 ? "+" : "";
        return `${item.symbol} ${fmt(item.price)} (${sign}${item.pct.toFixed(1)}%)`;
      })
      .join("\n");
  }

  kabu(user, args = []) {
    this.applyKabuSpoilage(user);
    const action = String(args[0] || "price").toLowerCase();
    const kabu = this.state.market.kabu;

    if (["buy", "買う"].includes(action)) {
      const amount = parseAmount(args[1], user.wallet);
      if (!Number.isFinite(amount) || amount <= 0) {
        return { ok: false, title: "カブ買い注文が雑", lines: ["例: `kabu buy 1000`。胃痛は買えます。"] };
      }
      if (user.wallet < amount) {
        return { ok: false, title: "財布が薄い", lines: [`買えるのは ${fmt(user.wallet)} までです。`] };
      }

      const units = Math.floor(amount / kabu.price);
      if (units <= 0) {
        return { ok: false, title: "カブが買えない", lines: [`今のカブ価は ${fmt(kabu.price)}。もう少しKCが必要です。`] };
      }

      const cost = units * kabu.price;
      const oldValue = user.kabu.units * user.kabu.avgCost;
      user.wallet -= cost;
      user.lifetimeLost += cost;
      user.kabu.units += units;
      user.kabu.avgCost = Math.floor((oldValue + cost) / user.kabu.units);
      user.kabu.boughtDay = this.state.market.day;
      this.log(user, "kabu_buy", -cost, `${units} KABU`);

      return {
        ok: true,
        title: "カブを抱えました",
        lines: [
          `${units} カブを ${fmt(cost)} で購入。平均 ${fmt(user.kabu.avgCost)}。`,
          `賞味期限: Market Day ${user.kabu.boughtDay + KABU_CONFIG.shelfLifeDays} まで。`,
          "リリス: 株じゃないよ、カブ。腐るほう。かわいそうに、胃だけ先物取引してる。",
          this.moneyLine(user)
        ]
      };
    }

    if (["sell", "売る"].includes(action)) {
      if (user.kabu.units <= 0) {
        return { ok: false, title: "売るカブなし", lines: ["手元が空です。胃も空ならログボへ。"] };
      }

      const units = parseShares(args[1] || "all", user.kabu.units);
      if (!Number.isFinite(units) || units <= 0 || units > user.kabu.units) {
        return { ok: false, title: "売却数が変", lines: [`保有は ${user.kabu.units} カブ。例: \`kabu sell all\``] };
      }

      const wholeUnits = Math.floor(units);
      const payout = wholeUnits * kabu.price;
      const costBasis = wholeUnits * user.kabu.avgCost;
      const profit = payout - costBasis;
      user.kabu.units -= wholeUnits;
      if (user.kabu.units <= 0) {
        user.kabu.units = 0;
        user.kabu.avgCost = 0;
        user.kabu.boughtDay = null;
      }
      user.wallet += payout;
      user.lifetimeEarned += payout;
      this.log(user, "kabu_sell", payout, `${wholeUnits} KABU`);

      return {
        ok: profit >= 0,
        title: profit >= 0 ? "カブ利確" : "カブ損切り",
        lines: [
          `${wholeUnits} カブを ${fmt(payout)} で売却。損益 ${fmt(profit)}。`,
          profit >= 0 ? "売り抜けた。今日は少しだけ賢い顔でいい。" : "腐る前に逃げた。負けではなく撤退、たぶん。",
          this.moneyLine(user)
        ]
      };
    }

    return {
      ok: true,
      title: "カブ価",
      lines: [
        `現在価格: ${fmt(kabu.price)} (${kabuChangeLabel(kabu)})`,
        `保有: ${user.kabu.units} カブ / 平均 ${fmt(user.kabu.avgCost || 0)} / 評価 ${fmt(this.kabuValue(user))}`,
        user.kabu.boughtDay ? `腐る目安: Market Day ${user.kabu.boughtDay + KABU_CONFIG.shelfLifeDays}` : "手元は空。胃はまだ静か。",
        kabu.news,
        "例: `kabu buy 1000`, `kabu sell all`"
      ]
    };
  }

  invest(user, symbolRaw, amountRaw) {
    const symbol = normalizeSymbol(symbolRaw);
    const asset = this.state.market.assets[symbol];
    if (!asset) {
      return { ok: false, title: "存在しない銘柄", lines: ["`market` で銘柄コードを確認してください。"] };
    }

    const amount = parseAmount(amountRaw, user.wallet);
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, title: "投資額が変", lines: ["例: `invest RAMEN 1000` または `invest OSHI all`"] };
    }

    if (user.wallet < amount) {
      return { ok: false, title: "財布が薄い", lines: [`投資可能額は ${fmt(user.wallet)} です。`] };
    }

    const shares = amount / asset.price;
    user.wallet -= amount;
    user.holdings[symbol] = roundShares((user.holdings[symbol] || 0) + shares);
    user.lifetimeLost += amount;
    user.xp += 10;
    user.heat = clamp(user.heat + randInt(this.rng, 0, 2), 0, 100);
    this.log(user, "invest", -amount, `${symbol} ${shares.toFixed(4)}`);

    return {
      ok: true,
      title: "約定しました",
      lines: [
        `${asset.name} を ${fmt(amount)} 分、${shares.toFixed(4)} 口買いました。`,
        "購入理由: なんとなく。市場では十分な根拠です。",
        this.moneyLine(user)
      ]
    };
  }

  sell(user, symbolRaw, sharesRaw) {
    const symbol = normalizeSymbol(symbolRaw);
    const asset = this.state.market.assets[symbol];
    if (!asset) {
      return { ok: false, title: "存在しない銘柄", lines: ["`market` で銘柄コードを確認してください。"] };
    }

    const owned = user.holdings[symbol] || 0;
    if (owned <= 0) {
      return { ok: false, title: "保有ゼロ", lines: [`${asset.name} は持っていません。`] };
    }

    const shares = parseShares(sharesRaw, owned);
    if (!Number.isFinite(shares) || shares <= 0 || shares > owned + 0.000001) {
      return { ok: false, title: "売却数量が変", lines: [`保有数は ${owned.toFixed(4)} 口です。例: \`sell ${symbol} all\``] };
    }

    const amount = Math.floor(shares * asset.price);
    user.holdings[symbol] = roundShares(owned - shares);
    if (user.holdings[symbol] <= 0.000001) delete user.holdings[symbol];
    user.wallet += amount;
    user.lifetimeEarned += amount;
    user.xp += 8;
    this.log(user, "sell", amount, `${symbol} ${shares.toFixed(4)}`);

    return {
      ok: true,
      title: "売却完了",
      lines: [
        `${asset.name} を ${shares.toFixed(4)} 口売って ${fmt(amount)} を受け取りました。`,
        "利益か損かは、心が決めます。",
        this.moneyLine(user)
      ]
    };
  }

  portfolio(user) {
    const entries = Object.entries(user.holdings);
    if (entries.length === 0 && user.kabu.units <= 0) {
      return {
        ok: true,
        title: "ポートフォリオ",
        lines: ["保有銘柄はありません。現金こそ最大のポジション。"]
      };
    }

    const lines = entries.map(([symbol, shares]) => {
      const asset = this.state.market.assets[symbol];
      const value = Math.floor(shares * asset.price);
      return `\`${symbol}\` ${asset.name}: ${shares.toFixed(4)}口 / 評価額 ${fmt(value)}`;
    });
    if (user.kabu.units > 0) {
      lines.push(`\`KABU\` カブ: ${user.kabu.units}個 / 評価額 ${fmt(Math.floor(this.kabuValue(user)))}`);
    }

    return {
      ok: true,
      title: "ポートフォリオ",
      lines: [...lines, `合計評価額: ${fmt(Math.floor(this.holdingsValue(user) + this.kabuValue(user)))}`]
    };
  }

  loan(user, amountRaw) {
    const amount = parsePositiveInt(amountRaw);
    if (!amount) {
      return { ok: false, title: "借入額が変", lines: ["例: `loan 1000`"] };
    }

    const maxLoan = 12000 + this.level(user) * 1500;
    if (user.debt + amount > maxLoan) {
      return {
        ok: false,
        title: "与信が限界",
        lines: [`今の上限は ${fmt(maxLoan)} です。すでに借金 ${fmt(user.debt)}。金融機関も眉間に力が入っています。`]
      };
    }

    user.wallet += amount;
    user.debt += Math.ceil(amount * 1.08);
    user.xp += 6;
    user.heat = clamp(user.heat + 3, 0, 100);
    this.log(user, "loan", amount, "借入");

    return {
      ok: true,
      title: "借入完了",
      lines: [
        `${fmt(amount)} を借りました。返済額は手数料込みで ${fmt(Math.ceil(amount * 1.08))} 増えました。`,
        "未来の自分にDMを送っておきましょう。",
        this.moneyLine(user)
      ]
    };
  }

  repay(user, amountRaw) {
    if (user.debt <= 0) {
      return { ok: true, title: "借金なし", lines: ["今だけは胸を張っていいです。"] };
    }

    const amount = Math.min(parseAmount(amountRaw, user.wallet), user.wallet, user.debt);
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, title: "返済額が変", lines: ["例: `repay 500` または `repay all`"] };
    }

    user.wallet -= amount;
    user.debt -= amount;
    user.xp += 10;
    this.log(user, "repay", -amount, "返済");

    return {
      ok: true,
      title: "返済しました",
      lines: [`${fmt(amount)} 返済。残り借金 ${fmt(user.debt)}。`, user.debt === 0 ? "完済です。空気が少し甘い。" : this.moneyLine(user)]
    };
  }

  rpgStatus(user) {
    this.regenerateRpg(user);
    return {
      ok: true,
      title: `${user.name} のRPGステータス`,
      lines: [
        `RPGランク: ${rankFor(RPG_RANKS, user.rpg.xp).name} / Lv ${this.rpgLevel(user)} (${user.rpg.xp} XP)`,
        this.rpgLine(user),
        `ATK ${user.rpg.attack} / DEF ${user.rpg.defense} / FOCUS ${user.rpg.focus} / LUCK ${user.rpg.luck}`,
        `クエスト: ${user.rpg.wins}勝 ${user.rpg.losses}敗`
      ]
    };
  }

  quests() {
    return {
      ok: true,
      title: "クエスト一覧",
      lines: Object.entries(QUESTS).map(([id, quest]) => {
        return `\`${id}\` ${quest.name} - Energy ${quest.cost}: ${quest.description}`;
      })
    };
  }

  quest(user, questIdRaw) {
    this.regenerateRpg(user);
    const questId = String(questIdRaw || "task").toLowerCase();
    const quest = QUESTS[questId];
    if (!quest) {
      return { ok: false, title: "未登録クエスト", lines: ["`quests` で行き先を確認してください。"] };
    }

    if (user.rpg.hp <= 0) {
      return { ok: false, title: "HPゼロ", lines: ["`rest` で立て直しましょう。財布より先に体力です。"] };
    }

    if (user.rpg.energy < quest.cost) {
      return { ok: false, title: "エナジー不足", lines: [`必要 Energy は ${quest.cost}。`, "`rest` か `use tonic` で回復できます。"] };
    }

    user.rpg.energy -= quest.cost;

    const level = this.rpgLevel(user);
    const attackScore =
      user.rpg.attack * 2 +
      user.rpg.defense +
      user.rpg.focus * 1.4 +
      user.rpg.luck * randFloat(this.rng, 1.4, 3.2) +
      level * 2 +
      randInt(this.rng, 0, 24);
    const challenge = quest.power + randInt(this.rng, 0, 24);
    const success = attackScore >= challenge;
    const damage = success
      ? Math.max(1, randInt(this.rng, 2, 8) - Math.floor(user.rpg.defense / 4))
      : Math.max(3, randInt(this.rng, 7, 18) - Math.floor(user.rpg.defense / 5));
    user.rpg.hp = clamp(user.rpg.hp - damage, 0, user.rpg.maxHp);

    if (success) {
      const reward = this.rewardAmount(randInt(this.rng, quest.rewardMin, quest.rewardMax) + user.rpg.luck * 8);
      const xp = randInt(this.rng, quest.xpMin, quest.xpMax);
      user.wallet += reward;
      user.lifetimeEarned += reward;
      user.rpg.xp += xp;
      user.rpg.wins += 1;
      user.xp += Math.floor(xp / 3);
      this.log(user, "quest", reward, quest.name);

      const lines = [
        `${quest.name} を突破しました。`,
        `報酬 ${fmt(reward)} / RPG XP +${xp} / ダメージ ${damage}`,
        this.rpgLine(user),
        this.moneyLine(user)
      ];

      if (this.rng() < 0.12) {
        user.inventory.tonic = (user.inventory.tonic || 0) + 1;
        lines.splice(2, 0, "集中トニックを拾いました。何かの福利厚生です。");
      }

      return { ok: true, title: "クエスト成功", lines };
    }

    const consolation = this.rewardAmount(randInt(this.rng, 20, 90));
    const xp = randInt(this.rng, 8, 22);
    user.wallet += consolation;
    user.lifetimeEarned += consolation;
    user.rpg.xp += xp;
    user.rpg.losses += 1;

    return {
      ok: false,
      title: "クエスト撤退",
      lines: [
        `${quest.name} はまだ硬かった。`,
        `参加賞 ${fmt(consolation)} / RPG XP +${xp} / ダメージ ${damage}`,
        this.rpgLine(user)
      ]
    };
  }

  train(user, statRaw) {
    const stat = String(statRaw || "").toLowerCase();
    const aliases = { atk: "attack", def: "defense", con: "focus", foc: "focus", luck: "luck" };
    const key = aliases[stat] || stat;
    if (!["attack", "defense", "focus", "luck"].includes(key)) {
      return {
        ok: false,
        title: "鍛錬メニュー不明",
        lines: ["例: `train attack`, `train defense`, `train focus`, `train luck`"]
      };
    }

    const current = user.rpg[key];
    const cost = this.trainingCost(current);
    if (user.wallet < cost) {
      return { ok: false, title: "鍛錬費不足", lines: [`${key} を上げるには ${fmt(cost)} 必要です。`, this.moneyLine(user)] };
    }

    user.wallet -= cost;
    user.lifetimeLost += cost;
    user.rpg[key] += 1;
    user.rpg.xp += 18;
    if (key === "defense" && current % 3 === 0) user.rpg.maxHp += 2;
    if (key === "focus" && current % 3 === 0) user.rpg.maxEnergy += 1;
    this.log(user, "train", -cost, key);

    return {
      ok: true,
      title: "鍛錬完了",
      lines: [`${key.toUpperCase()} が ${current} から ${user.rpg[key]} に上がりました。`, this.rpgLine(user), this.moneyLine(user)]
    };
  }

  rest(user) {
    const cost = this.restCost(user);
    user.wallet -= cost;
    user.lifetimeLost += cost;
    user.rpg.hp = user.rpg.maxHp;
    user.rpg.energy = Math.min(user.rpg.maxEnergy, user.rpg.energy + 5);
    user.rpg.lastRegenAt = this.now().toISOString();

    return {
      ok: true,
      title: "休息完了",
      lines: [`${fmt(cost)} で休みました。いい投資です。`, this.rpgLine(user), this.moneyLine(user)]
    };
  }

  slots(user, amountRaw) {
    const bet = this.validateBet(user, amountRaw);
    if (bet.error) return bet.error;

    user.wallet -= bet.amount;
    const reels = [pick(this.rng, CASINO_SYMBOLS), pick(this.rng, CASINO_SYMBOLS), pick(this.rng, CASINO_SYMBOLS)];
    let multiplier = 0;
    const unique = new Set(reels);
    if (unique.size === 1) multiplier = reels[0] === "7" ? 12 : 8;
    else if (unique.size === 2) multiplier = 2;
    else if (reels.includes("KC") && reels.includes("UP")) multiplier = 1.3;

    const payout = multiplier > 0 ? this.casinoPayout(bet.amount, multiplier, { jackpot: multiplier >= 8 }) : 0;
    user.wallet += payout;
    this.recordCasino(user, payout - bet.amount);

    return {
      ok: payout > bet.amount,
      title: "KC Slots",
      lines: [
        CASINO_MASCOT.opener,
        `[ ${reels.join(" | ")} ]`,
        payout > 0 ? `払い戻し ${fmt(payout)} / 収支 ${fmt(payout - bet.amount)}` : `払い戻し 0 / 収支 -${fmt(bet.amount)}`,
        mascotLine(this.rng, payout > bet.amount ? "win" : "lose"),
        this.moneyLine(user)
      ]
    };
  }

  coinflip(user, amountRaw, choiceRaw) {
    const bet = this.validateBet(user, amountRaw);
    if (bet.error) return bet.error;

    const choice = String(choiceRaw || "heads").toLowerCase();
    if (!["heads", "tails", "表", "裏"].includes(choice)) {
      return { ok: false, title: "表か裏か", lines: ["例: `coinflip 100 heads` または `coinflip 100 tails`"] };
    }

    const normalized = ["heads", "表"].includes(choice) ? "heads" : "tails";
    const win = this.rng() < this.casinoChance(0.5);
    const actual = win ? normalized : normalized === "heads" ? "tails" : "heads";
    user.wallet -= bet.amount;
    const payout = win ? this.casinoPayout(bet.amount, 1.95) : 0;
    user.wallet += payout;
    this.recordCasino(user, payout - bet.amount);

    return {
      ok: win,
      title: "コイントス",
      lines: [
        `予想: ${normalized === "heads" ? "表" : "裏"} / 結果: ${actual === "heads" ? "表" : "裏"}`,
        win ? `勝ち。払い戻し ${fmt(payout)}。` : `負け。-${fmt(bet.amount)}。`,
        mascotLine(this.rng, win ? "win" : "lose"),
        this.moneyLine(user)
      ]
    };
  }

  dice(user, amountRaw, guessRaw) {
    const bet = this.validateBet(user, amountRaw);
    if (bet.error) return bet.error;

    const guess = Number(guessRaw);
    if (!Number.isInteger(guess) || guess < 1 || guess > 6) {
      return { ok: false, title: "ダイス予想が変", lines: ["例: `dice 100 4`"] };
    }

    const win = this.rng() < this.casinoChance(1 / 6, { jackpot: true });
    const actual = win ? guess : pick(this.rng, [1, 2, 3, 4, 5, 6].filter((value) => value !== guess));
    user.wallet -= bet.amount;
    const payout = win ? this.casinoPayout(bet.amount, 5.5, { jackpot: true }) : 0;
    user.wallet += payout;
    this.recordCasino(user, payout - bet.amount);

    return {
      ok: win,
      title: "ダイス",
      lines: [
        `予想: ${guess} / 結果: ${actual}`,
        win ? `的中。払い戻し ${fmt(payout)}。` : `外れ。-${fmt(bet.amount)}。`,
        mascotLine(this.rng, win ? "win" : "lose"),
        this.moneyLine(user)
      ]
    };
  }

  blackjack(user, amountRaw) {
    const bet = this.validateBet(user, amountRaw);
    if (bet.error) return bet.error;

    user.wallet -= bet.amount;
    const deck = createDeck(this.rng);
    const player = [deck.pop(), deck.pop()];
    const dealer = [deck.pop(), deck.pop()];

    while (handScore(player) < 16) player.push(deck.pop());
    while (handScore(dealer) < 17) dealer.push(deck.pop());

    const playerScore = handScore(player);
    const dealerScore = handScore(dealer);
    const playerBust = playerScore > 21;
    const dealerBust = dealerScore > 21;
    const natural = player.length === 2 && playerScore === 21;

    let outcome = "lose";
    if (!playerBust && (dealerBust || playerScore > dealerScore)) outcome = "win";
    else if (!playerBust && playerScore === dealerScore) outcome = "push";

    let payout = 0;
    if (outcome === "push") payout = bet.amount;
    if (outcome === "win") payout = this.casinoPayout(bet.amount, natural ? 2.5 : 2, { jackpot: natural });
    user.wallet += payout;
    this.recordCasino(user, payout - bet.amount);

    const ok = outcome === "win";
    return {
      ok,
      title: "Blackjack",
      lines: [
        `あなた: ${formatHand(player)} = ${playerScore}`,
        `ディーラー: ${formatHand(dealer)} = ${dealerScore}`,
        outcome === "win" ? `勝ち。払い戻し ${fmt(payout)}。` : outcome === "push" ? "引き分け。ベット返却。" : `負け。-${fmt(bet.amount)}。`,
        mascotLine(this.rng, outcome === "win" ? "win" : outcome === "push" ? "win" : "lose"),
        this.moneyLine(user)
      ]
    };
  }

  crash(user, amountRaw, targetRaw) {
    const bet = this.validateBet(user, amountRaw);
    if (bet.error) return bet.error;

    const target = clamp(Number(targetRaw || 2), 1.2, 5);
    if (!Number.isFinite(target)) {
      return { ok: false, title: "倍率が変", lines: ["例: `crash 100 2.0`。欲張るほど床が抜けます。"] };
    }

    user.wallet -= bet.amount;
    const volatility = this.casinoVolatility();
    const playerLean = (this.state.house.kugi / 100) * Math.sqrt(this.state.house.returnRate / 94);
    const instantRug = this.rng() < clamp(0.08 / Math.max(0.65, playerLean), 0.02, 0.2);
    const baseCurve = 0.93 * (this.state.house.kugi / 100) * Math.sqrt(this.state.house.returnRate / 94);
    const crashAt = instantRug ? randFloat(this.rng, 1.0, 1.18) : Math.min(9.99, Math.max(1.01, baseCurve / Math.max(0.08, 1 - this.rng() * volatility)));
    const roundedCrash = Math.floor(crashAt * 100) / 100;
    const win = target <= roundedCrash;
    const payout = win ? this.casinoPayout(bet.amount, target, { jackpot: target >= 3 }) : 0;
    user.wallet += payout;
    this.recordCasino(user, payout - bet.amount);

    const track = crashTrack(target, roundedCrash);
    return {
      ok: win,
      title: "Crash",
      lines: [
        track,
        `逃げたい倍率: x${target.toFixed(2)} / 墜落: x${roundedCrash.toFixed(2)}`,
        win ? `生還。${fmt(payout)} 回収。手汗だけ残りました。` : `床、抜けました。-${fmt(bet.amount)}。`,
        mascotLine(this.rng, win ? "win" : "lose"),
        this.moneyLine(user)
      ]
    };
  }

  roulette(user, amountRaw, choiceRaw) {
    const bet = this.validateBet(user, amountRaw);
    if (bet.error) return bet.error;

    const choice = String(choiceRaw || "red").toLowerCase();
    if (!["red", "black", "odd", "even", "zero", "赤", "黒", "奇数", "偶数", "0"].includes(choice)) {
      return { ok: false, title: "置き場所が変", lines: ["例: `roulette 100 red`, `roulette 100 odd`, `roulette 100 zero`"] };
    }

    const normalized = normalizeRouletteChoice(choice);
    const hitChance = normalized === "zero" ? this.casinoChance(1 / 37, { jackpot: true }) : this.casinoChance(18 / 37);
    const forcedHit = this.rng() < hitChance;
    const number = forcedRouletteNumber(this.rng, normalized, forcedHit);
    const color = rouletteColor(number);
    const hit =
      (normalized === "red" && color === "red") ||
      (normalized === "black" && color === "black") ||
      (normalized === "odd" && number !== 0 && number % 2 === 1) ||
      (normalized === "even" && number !== 0 && number % 2 === 0) ||
      (normalized === "zero" && number === 0);
    const multiplier = normalized === "zero" ? 18 : 1.95;

    user.wallet -= bet.amount;
    const payout = hit ? this.casinoPayout(bet.amount, multiplier, { jackpot: normalized === "zero" }) : 0;
    user.wallet += payout;
    this.recordCasino(user, payout - bet.amount);

    return {
      ok: hit,
      title: "Roulette",
      lines: [
        `置いた場所: ${rouletteLabel(normalized)} / 出目: ${number} ${rouletteLabel(color)}`,
        hit ? `刺さりました。払い戻し ${fmt(payout)}。` : `外れ。玉だけが涼しい顔をしています。-${fmt(bet.amount)}。`,
        mascotLine(this.rng, hit ? "win" : "lose"),
        this.moneyLine(user)
      ]
    };
  }

  leaderboard(typeRaw = "net") {
    const type = String(typeRaw || "net").toLowerCase();
    const users = Object.values(this.state.users).filter((user) => user.joined);
    let title = "純資産ランキング";
    let score = (user) => Math.floor(this.netWorth(user));
    let label = (value) => fmt(value);

    if (["text", "txt"].includes(type)) {
      title = "Textランクランキング";
      score = (user) => user.activity.textXp;
      label = (value) => `${value} XP`;
    } else if (["vc", "voice"].includes(type)) {
      title = "VCランクランキング";
      score = (user) => user.activity.vcXp;
      label = (value) => `${value} XP`;
    } else if (type === "rpg") {
      title = "RPGランキング";
      score = (user) => user.rpg.xp;
      label = (value) => `${value} XP`;
    } else if (type === "casino") {
      title = "カジノ収支ランキング";
      score = (user) => user.casino.profit;
      label = (value) => fmt(value);
    } else if (["invite", "invites", "招待"].includes(type)) {
      title = "招待ランキング";
      score = (user) => user.invites.qualified;
      label = (value) => `${value} invited`;
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
      lines: ranked.map((entry, index) => `${index + 1}. ${entry.user.name} - ${label(entry.value)}`)
    };
  }

  news() {
    return {
      ok: true,
      title: "市場ニュース",
      lines: this.state.market.news.slice(-8).reverse()
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
    const drip = this.rewardAmount(randInt(this.rng, 2, 8));
    user.activity.textXp += xp;
    user.activity.textMessages += 1;
    user.activity.lastTextAt = now.toISOString();
    user.wallet += drip;
    user.lifetimeEarned += drip;
    this.observeSupplyDelta(drip);

    const after = rankFor(TEXT_RANKS, user.activity.textXp);
    if (after.name !== before.name) {
      return {
        ok: true,
        kind: "text_rank_up",
        title: "Textランク昇格",
        lines: [`${user.name} が ${after.name} になりました。`, `会話報酬 +${fmt(drip)} / Text XP +${xp}`]
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
    const voiceRush = this.activeSinkEvent()?.id === "voice_rush" ? 1.25 : 1;
    const rawDrip = Math.floor(cappedMinutes * VOICE_REWARD_CONFIG.kcPerMinute * voiceRush);
    const remaining = Math.max(0, this.voiceDailyCap(user) - user.activity.vcDailyEarned);
    const drip = Math.min(this.rewardAmount(rawDrip), remaining);
    user.activity.vcMinutes += cappedMinutes;
    user.activity.vcDailyMinutes += cappedMinutes;
    user.activity.vcXp += xp;
    if (drip > 0) {
      user.wallet += drip;
      user.lifetimeEarned += drip;
      user.activity.vcDailyEarned += drip;
      this.observeSupplyDelta(drip);
    }

    const after = rankFor(VC_RANKS, user.activity.vcXp);
    const capLine = drip <= 0 ? "今日のVC KCは上限。ランクだけ伸びます。" : this.voiceRewardLine(user);
    if (after.name !== before.name) {
      return {
        ok: true,
        kind: "vc_rank_up",
        title: "VCランク昇格",
        silent: Boolean(options.silent),
        lines: [`${user.name} が ${after.name} になりました。`, `VC ${cappedMinutes}分 / +${xp} XP / +${fmt(drip)}`, capLine]
      };
    }

    return {
      ok: true,
      kind: "vc_reward",
      title: "VC報酬",
      silent: Boolean(options.silent),
      lines: [`VC ${cappedMinutes}分 / +${xp} XP / +${fmt(drip)}`, capLine]
    };
  }

  resetVoiceDay(user) {
    const today = dayKey(this.now());
    if (user.activity.vcDay === today) return;
    user.activity.vcDay = today;
    user.activity.vcDailyEarned = 0;
    user.activity.vcDailyMinutes = 0;
  }

  voiceDailyCap(user) {
    return this.rewardAmount(VOICE_REWARD_CONFIG.dailyCapBase + this.level(user) * VOICE_REWARD_CONFIG.dailyCapPerLevel);
  }

  voiceRewardLine(user) {
    this.resetVoiceDay(user);
    const cap = this.voiceDailyCap(user);
    const remaining = Math.max(0, cap - user.activity.vcDailyEarned);
    const state = user.activity.voiceJoinedAt ? "在室中" : "未接続";
    return `${state} / 今日 ${fmt(user.activity.vcDailyEarned)} / ${fmt(cap)} / 残り ${fmt(remaining)}`;
  }

  simulateText(user, countRaw) {
    const count = clamp(parsePositiveInt(countRaw) || 1, 1, 200);
    const xp = count * 12;
    const money = this.rewardAmount(count * 5);
    user.activity.textMessages += count;
    user.activity.textXp += xp;
    user.wallet += money;
    user.lifetimeEarned += money;
    this.observeSupplyDelta(money);
    return {
      ok: true,
      title: "Text活動をシミュレート",
      lines: [`${count}メッセージ / Text XP +${xp} / +${fmt(money)}`, `Textランク: ${rankFor(TEXT_RANKS, user.activity.textXp).name}`]
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

  moneySupply() {
    return Object.values(this.state.users || {}).reduce((sum, rawUser) => {
      const user = migrateUser(rawUser);
      return sum + Math.max(0, user.wallet) + Math.max(0, this.holdingsValue(user)) + Math.max(0, this.kabuValue(user));
    }, 0);
  }

  kabuValue(user) {
    const units = user.kabu?.units || 0;
    return units * (this.state.market.kabu?.price || 0);
  }

  applyKabuSpoilage(user) {
    if (!user.kabu?.units || !user.kabu.boughtDay) return null;
    const age = this.state.market.day - user.kabu.boughtDay;
    if (age < KABU_CONFIG.shelfLifeDays) return null;

    const lostValue = this.kabuValue(user);
    const units = user.kabu.units;
    user.kabu.units = 0;
    user.kabu.avgCost = 0;
    user.kabu.boughtDay = null;
    user.lifetimeLost += lostValue;
    this.log(user, "kabu_spoil", -lostValue, `${units} KABU`);
    return `カブが腐りました。${units} カブ、評価 ${fmt(lostValue)} が台所の闇へ。`;
  }

  observeSupplyDelta(delta) {
    const rounded = Math.floor(Math.abs(delta));
    if (rounded <= 0) return;
    const policy = this.state.policy;
    if (delta > 0) {
      policy.issued += rounded;
      policy.cycleIssued += rounded;
    } else {
      policy.sunk += rounded;
      policy.cycleSunk += rounded;
    }
  }

  maybeRunPolicyCycle() {
    const policy = this.state.policy;
    if (this.state.commandCount - policy.lastPolicyCommand < POLICY_CONFIG.policyCycleCommands) return null;
    return this.runPolicyCycle();
  }

  runPolicyCycle() {
    const policy = this.state.policy;
    const supply = this.moneySupply();
    const joinedUsers = Math.max(1, Object.values(this.state.users).filter((user) => user.joined).length);
    const cpiFactor = this.priceFactor();
    const targetSupply = joinedUsers * 9000 * Math.pow(cpiFactor, 0.35);
    const supplyPressure = clamp((supply - targetSupply) / Math.max(1, targetSupply), -0.6, 2.4);
    const netFlowPressure = (policy.cycleIssued - policy.cycleSunk) / Math.max(1000, supply || 1);
    const marketPressure = this.marketHeat();
    const rawBps =
      policy.targetInflationBps +
      supplyPressure * 85 +
      netFlowPressure * 5200 +
      marketPressure * 20;
    const inflationBps = Math.round(clamp(rawBps, POLICY_CONFIG.maxDeflationBps, POLICY_CONFIG.maxInflationBps));

    policy.previousCpi = policy.cpi;
    policy.inflationBps = inflationBps;
    policy.cpi = Math.round(clamp(policy.cpi * (1 + inflationBps / 10000), 650, 6500));
    policy.moneySupply = Math.floor(supply);
    policy.stance = policyStance(inflationBps, supplyPressure);
    policy.lastPolicyCommand = this.state.commandCount;
    policy.history.push({
      at: this.now().toISOString(),
      command: this.state.commandCount,
      cpi: policy.cpi,
      inflationBps,
      stance: policy.stance,
      supply: Math.floor(supply),
      issued: policy.cycleIssued,
      sunk: policy.cycleSunk
    });
    policy.history = policy.history.slice(-24);
    policy.cycleIssued = 0;
    policy.cycleSunk = 0;

    this.state.market.news.push(`Policy ${policy.history.length}: CPI ${this.cpiLabel()} / ${this.policyLabel()} / ${signedPercent(inflationBps)}.`);
    this.state.market.news = this.state.market.news.slice(-25);
    return policy;
  }

  marketHeat() {
    const changes = Object.values(this.state.market.assets).map((asset) => {
      if (!asset.previousPrice) return 0;
      return (asset.price - asset.previousPrice) / asset.previousPrice;
    });
    if (changes.length === 0) return 0;
    return changes.reduce((sum, value) => sum + value, 0) / changes.length;
  }

  maybeAdvanceMarket() {
    const shouldAdvance = this.state.commandCount % 5 === 0 || this.rng() < 0.08;
    if (!shouldAdvance) return;

    this.state.market.day += 1;
    let news = pick(this.rng, MARKET_NEWS);
    const crash = this.rng() < 0.08;
    const boom = !crash && this.rng() < 0.09;

    if (crash) news = "市場が急落しました。理由は『なんか怖い』です。";
    if (boom) news = "市場が急騰しました。理由は『なんかいけそう』です。";

    for (const asset of Object.values(this.state.market.assets)) {
      asset.previousPrice = asset.price;
      let drift = randFloat(this.rng, -asset.volatility, asset.volatility);
      if (crash) drift -= randFloat(this.rng, 0.08, 0.22);
      if (boom) drift += randFloat(this.rng, 0.08, 0.22);
      asset.price = Math.max(10, Math.floor(asset.price * (1 + drift)));
    }

    this.advanceKabuMarket(crash, boom);
    this.state.market.news.push(`Day ${this.state.market.day}: ${news}`);
    this.state.market.news = this.state.market.news.slice(-25);

    if (crash) {
      for (const user of Object.values(this.state.users).map(migrateUser)) {
        if (user.inventory.helmet && this.holdingsValue(user) > 0) {
          const rebate = randInt(this.rng, 40, 160);
          user.wallet += rebate;
          user.lifetimeEarned += rebate;
        }
      }
    }
  }

  advanceKabuMarket(crash, boom) {
    const kabu = this.state.market.kabu;
    kabu.previousPrice = kabu.price;
    kabu.trendAge += 1;

    if (kabu.trendAge > 4 || this.rng() < 0.22) {
      kabu.trend = pick(this.rng, ["flat", "wave", "spike", "bleed"]);
      kabu.trendAge = 0;
    }

    let drift = randFloat(this.rng, -0.06, 0.06);
    if (kabu.trend === "wave") drift = randFloat(this.rng, -0.14, 0.24);
    if (kabu.trend === "spike") drift = randFloat(this.rng, 0.12, 0.48) - kabu.trendAge * 0.05;
    if (kabu.trend === "bleed") drift = randFloat(this.rng, -0.28, -0.04);
    if (boom) drift += randFloat(this.rng, 0.06, 0.18);
    if (crash) drift -= randFloat(this.rng, 0.08, 0.24);

    kabu.price = clamp(Math.floor(kabu.price * (1 + drift)), KABU_CONFIG.minPrice, KABU_CONFIG.maxPrice);
    if (kabu.price > kabu.previousPrice * 1.25) {
      kabu.news = "カブ価が跳ねました。今だけ全員ちょっと賢そうです。";
    } else if (kabu.price < kabu.previousPrice * 0.82) {
      kabu.news = "カブ価が沈みました。台所から変な匂いがします。";
    } else {
      kabu.news = "カブ屋は涼しい顔。胃だけが少し動いています。";
    }
  }

  maybeTaxRaid(user) {
    if (!user.joined || user.heat < 55) return null;
    const chance = (user.heat - 45) / 180;
    if (this.rng() > chance) return null;

    const smoke = this.activeSinkEvent()?.id === "tax_smoke" ? 0.5 : 1;
    const shield = (user.inventory.shredder ? 0.65 : 1) * smoke;
    const fine = Math.min(user.wallet, this.costAmount(Math.floor((80 + user.heat * randInt(this.rng, 4, 10)) * shield)));
    user.wallet -= fine;
    user.lifetimeLost += fine;
    user.heat = clamp(user.heat - randInt(this.rng, 18, 35), 0, 100);

    return {
      lines: [
        "税務署イベント発生。",
        `「ちょっとお話いいですか？」で ${fmt(fine)} 持っていかれました。ヘイトは ${user.heat}/100 に低下。`
      ]
    };
  }

  regenerateRpg(user) {
    const now = this.now();
    const last = user.rpg.lastRegenAt ? new Date(user.rpg.lastRegenAt) : now;
    const ticks = Math.floor((now - last) / (10 * 60 * 1000));
    if (ticks <= 0) return;
    user.rpg.energy = clamp(user.rpg.energy + ticks, 0, user.rpg.maxEnergy);
    user.rpg.hp = clamp(user.rpg.hp + Math.floor(ticks / 2), 0, user.rpg.maxHp);
    user.rpg.lastRegenAt = new Date(last.getTime() + ticks * 10 * 60 * 1000).toISOString();
  }

  validateBet(user, amountRaw) {
    const safety = this.casinoSafety(user);
    if (safety.blocked) {
      return { error: { ok: false, title: "カジノ休憩中", lines: [mascotLine(this.rng, "block"), safety.summary, "RPG、通話、カード育成に逃がしましょう。"] } };
    }

    const amount = parseAmount(amountRaw, user.wallet);
    if (!Number.isFinite(amount) || amount <= 0) {
      return { error: { ok: false, title: "ベット額が変", lines: ["例: `slots 100`, `bj 250`, `coinflip 100 heads`"] } };
    }
    const minBet = this.minimumBet();
    if (amount < minBet) {
      return { error: { ok: false, title: "ベットが小さすぎ", lines: [`最低ベットは ${fmt(minBet)} です。`] } };
    }
    const maxBet = this.maximumBet(user);
    if (amount > maxBet) {
      return { error: { ok: false, title: "ベット上限", lines: [`今の上限は ${fmt(maxBet)} です。熱くなりすぎ防止。`] } };
    }
    const remainingLossBudget = Math.max(0, safety.dailyLossLimit - safety.dailyLoss);
    if (amount > remainingLossBudget) {
      return { error: { ok: false, title: "日次損失上限ガード", lines: [`今日の残り損失枠は ${fmt(remainingLossBudget)} です。ベットを下げるかRPGへ。`] } };
    }
    if (user.wallet < amount) {
      return { error: { ok: false, title: "財布が薄い", lines: [`所持金は ${fmt(user.wallet)} です。`] } };
    }
    return { amount };
  }

  recordCasino(user, profit) {
    this.resetCasinoDay(user);
    user.casino.plays += 1;
    user.casino.dailyPlays += 1;
    user.casino.lastPlayAt = this.now().toISOString();
    user.casino.profit += profit;
    if (profit > 0) {
      user.casino.wins += 1;
      user.casino.streak = Math.max(1, user.casino.streak + 1);
      user.lifetimeEarned += profit;
    } else if (profit < 0) {
      user.casino.losses += 1;
      user.casino.streak = Math.min(-1, user.casino.streak - 1);
      user.casino.dailyLoss += Math.abs(profit);
      user.lifetimeLost += Math.abs(profit);
      if (
        Math.abs(user.casino.streak) >= SAFETY_CONFIG.casinoLossStreakLimit ||
        user.casino.dailyLoss >= this.dailyLossLimit(user)
      ) {
        user.casino.lockedUntil = new Date(this.now().getTime() + SAFETY_CONFIG.casinoCooldownMs).toISOString();
      }
    }
    user.xp += 2;
  }

  holdingsValue(user) {
    return Object.entries(user.holdings).reduce((sum, [symbol, shares]) => {
      const asset = this.state.market.assets[symbol];
      return sum + (asset ? shares * asset.price : 0);
    }, 0);
  }

  netWorth(user) {
    return user.wallet + this.holdingsValue(user) + this.kabuValue(user) - user.debt;
  }

  moneyLine(user) {
    return `財布 ${fmt(user.wallet)} / 純資産 ${fmt(Math.floor(this.netWorth(user)))}`;
  }

  rpgLine(user) {
    return `HP ${user.rpg.hp}/${user.rpg.maxHp} / Energy ${user.rpg.energy}/${user.rpg.maxEnergy}`;
  }

  inventoryLine(user) {
    const entries = Object.entries(user.inventory);
    if (entries.length === 0) return "なし";
    return entries.map(([id, count]) => `${SHOP_ITEMS[id]?.name || id} x${count}`).join(", ");
  }

  level(user) {
    return Math.floor(Math.sqrt(user.xp / 40)) + 1;
  }

  rpgLevel(user) {
    return Math.floor(Math.sqrt(user.rpg.xp / 55)) + 1;
  }

  updateTitle(user) {
    const net = this.netWorth(user);
    if (user.debt > 20000) user.title = "未来を担保にした人";
    else if (net >= 200000) user.title = "K-Credit 財閥";
    else if (net >= 80000) user.title = "経済圏の中枢";
    else if (net >= 25000) user.title = "値動きの支配人";
    else if (user.activity.vcXp >= 2600) user.title = "深夜VC責任者";
    else if (user.activity.textXp >= 1500) user.title = "タイムライン統括";
    else if (user.rpg.xp >= 1000) user.title = "領域守護者";
    else if (user.workCount >= 25) user.title = "労働市場そのもの";
    else if (user.heat >= 80) user.title = "領収書に追われる者";
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
}

function renderPlayerCardLines(data) {
  const width = data.style.width;
  const header = `${CURRENCY.code} ${data.style.name} CARD`;
  const common = [
    `${data.user.name}`,
    `${data.subtitle}`,
    `NET ${fmt(data.net)} / WALLET ${fmt(data.wallet)} / DEBT ${fmt(data.debt)}`,
    `CPI ${data.cpiLine}`
  ];

  if (data.style.layout === "compact") {
    return frameLines(width, header, [
      ...common,
      `Economy ${data.econRank.name}`,
      `Text ${data.textRank.name} / VC ${data.vcRank.name}`,
      `RPG ${data.rpgRank.name} / ${data.rpgLine}`,
      `Casino ${data.casinoLine}`
    ]);
  }

  if (data.style.layout === "split") {
    return frameLines(width, header, [
      ...common,
      divider(width),
      twoCol("Economy", `${data.econRank.name} ${progressText(data.econRank)}`, width),
      twoCol("Text", `${data.textRank.name} ${progressText(data.textRank)}`, width),
      twoCol("VC", `${data.vcRank.name} ${progressText(data.vcRank)}`, width),
      twoCol("RPG", `${data.rpgRank.name} ${progressText(data.rpgRank)}`, width),
      `Casino ${data.casinoLine}`
    ]);
  }

  if (data.style.layout === "ledger") {
    return frameLines(width, header, [
      `${data.user.name} :: ${data.subtitle}`,
      divider(width),
      twoCol("Net Worth", fmt(data.net), width),
      twoCol("Wallet", fmt(data.wallet), width),
      twoCol("Debt", fmt(data.debt), width),
      twoCol("Tax Heat", `${bar(data.heat, 100)} ${data.heat}/100`, width),
      divider(width),
      `Economy ${data.econRank.name} ${progressText(data.econRank)}`,
      `Text    ${data.textRank.name} ${progressText(data.textRank)}`,
      `VC      ${data.vcRank.name} ${progressText(data.vcRank)}`,
      `RPG     ${data.rpgRank.name} ${progressText(data.rpgRank)}`,
      divider(width),
      `Casino ${data.casinoLine}`,
      `Policy ${data.cpiLine}`
    ]);
  }

  if (data.style.layout === "matrix") {
    return frameLines(width, header, [
      `${data.user.name} :: ${data.subtitle}`,
      `Card Score ${data.score} / Style ${data.style.name}`,
      divider(width),
      metricRow(["NET", fmt(data.net)], ["WALLET", fmt(data.wallet)], width),
      metricRow(["DEBT", fmt(data.debt)], ["HEAT", `${data.heat}/100`], width),
      divider(width),
      matrixRow("ECO", data.econRank, width),
      matrixRow("TXT", data.textRank, width),
      matrixRow("VOC", data.vcRank, width),
      matrixRow("RPG", data.rpgRank, width),
      divider(width),
      `RPG ${data.rpgLine}`,
      `Casino ${data.casinoLine}`,
      `Policy ${data.cpiLine}`
    ]);
  }

  return frameLines(width, header, [
    `${data.user.name} :: ${data.subtitle}`,
    `${data.style.tagline} / Score ${data.score}`,
    divider(width),
    metricRow(["NET", fmt(data.net)], ["WALLET", fmt(data.wallet)], width),
    metricRow(["DEBT", fmt(data.debt)], ["CPI", data.cpiLine], width),
    metricRow(["RPG", data.rpgLine], ["CASINO", data.casinoLine], width),
    divider(width),
    matrixRow("ECONOMY", data.econRank, width),
    matrixRow("TEXT", data.textRank, width),
    matrixRow("VOICE", data.vcRank, width),
    matrixRow("RPG", data.rpgRank, width),
    divider(width),
    "BLACK layout unlock: the ledger is no longer asking politely."
  ]);
}

function buildDiscordCard(data) {
  return {
    color: data.style.color,
    title: data.title,
    description: `${data.subtitle}\n${data.style.tagline}`,
    fields: [
      {
        name: "Ledger",
        value: [`Net: ${fmt(data.net)}`, `Wallet: ${fmt(data.wallet)}`, `Debt: ${fmt(data.debt)}`, `CPI: ${data.cpiLine}`].join("\n"),
        inline: true
      },
      {
        name: "Ranks",
        value: [
          `Economy: ${data.econRank.name}`,
          `Text: ${data.textRank.name}`,
          `VC: ${data.vcRank.name}`,
          `RPG: ${data.rpgRank.name}`
        ].join("\n"),
        inline: true
      },
      {
        name: "Progress",
        value: [
          `Economy ${progressText(data.econRank) || "(base)"}`,
          `Text ${progressText(data.textRank)}`,
          `VC ${progressText(data.vcRank)}`,
          `RPG ${progressText(data.rpgRank)}`
        ].join("\n")
      },
      {
        name: "Activity",
        value: [`RPG: ${data.rpgLine}`, `Casino: ${data.casinoLine}`, `Tax Heat: ${data.heat}/100`].join("\n")
      }
    ],
    footer: `Layout ${data.style.name} / Card Score ${data.score}`
  };
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
  const progress = progressText(rank) || "(base)";
  return `${fit(text, 22)} ${fit(progress, inner - 23)}`;
}

function createUser(id, name) {
  return {
    id,
    name: name || "名無しの資本家",
    joined: false,
    wallet: 0,
    debt: 0,
    heat: 0,
    streak: 0,
    title: "未上場の一般人",
    xp: 0,
    workCount: 0,
    lifetimeEarned: 0,
    lifetimeLost: 0,
    inventory: {},
    holdings: {},
    kabu: {
      units: 0,
      avgCost: 0,
      boughtDay: null
    },
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
    rpg: {
      xp: 0,
      hp: 30,
      maxHp: 30,
      energy: 10,
      maxEnergy: 10,
      attack: 5,
      defense: 4,
      focus: 4,
      luck: 2,
      wins: 0,
      losses: 0,
      lastRegenAt: new Date().toISOString()
    },
    casino: {
      plays: 0,
      wins: 0,
      losses: 0,
      streak: 0,
      profit: 0,
      day: dayKey(new Date()),
      dailyLoss: 0,
      dailyPlays: 0,
      lockedUntil: null,
      lastPlayAt: null
    },
    lastDaily: null,
    lastWork: null,
    lastSubsidy: null
  };
}

function migrateState(state) {
  const base = createInitialState();
  const next = { ...base, ...state };
  next.currency = CURRENCY;
  next.market = next.market || base.market;
  next.market.assets = next.market.assets || base.market.assets;
  next.market.kabu = { ...base.market.kabu, ...(next.market.kabu || {}) };
  for (const [symbol, asset] of Object.entries(base.market.assets)) {
    next.market.assets[symbol] = { ...asset, ...(next.market.assets[symbol] || {}) };
  }
  next.market.news = Array.isArray(next.market.news) ? next.market.news : base.market.news;
  next.policy = { ...base.policy, ...(next.policy || {}) };
  next.policy.history = Array.isArray(next.policy.history) ? next.policy.history : [];
  next.sink = { ...base.sink, ...(next.sink || {}) };
  next.sink.history = Array.isArray(next.sink.history) ? next.sink.history : [];
  next.house = { ...base.house, ...(next.house || {}) };
  next.invites = { ...base.invites, ...(next.invites || {}) };
  next.invites.recent = Array.isArray(next.invites.recent) ? next.invites.recent : [];
  next.ledger = Array.isArray(next.ledger) ? next.ledger : [];
  next.users = Object.fromEntries(Object.entries(next.users || {}).map(([id, user]) => [id, migrateUser(user)]));
  next.version = 3;
  return next;
}

function migrateUser(user) {
  const fresh = createUser(user.id, user.name);
  const merged = {
    ...fresh,
    ...user,
    inventory: { ...fresh.inventory, ...(user.inventory || {}) },
    holdings: { ...fresh.holdings, ...(user.holdings || {}) },
    kabu: { ...fresh.kabu, ...(user.kabu || {}) },
    invites: { ...fresh.invites, ...(user.invites || {}) },
    invite: { ...fresh.invite, ...(user.invite || {}) },
    activity: { ...fresh.activity, ...(user.activity || {}) },
    rpg: { ...fresh.rpg, ...(user.rpg || {}) },
    casino: { ...fresh.casino, ...(user.casino || {}) }
  };
  return merged;
}

function parseInput(input) {
  const trimmed = String(input || "").trim();
  if (!trimmed) return { command: "help", args: [] };
  const parts = trimmed.split(/\s+/);
  return { command: parts[0].toLowerCase(), args: parts.slice(1) };
}

function normalizeSymbol(value) {
  return String(value || "").trim().toUpperCase();
}

function parseAmount(raw, max) {
  if (!raw) return NaN;
  const value = String(raw).toLowerCase();
  if (["all", "max", "全部"].includes(value)) return Math.floor(max);
  return parsePositiveInt(value);
}

function parseShares(raw, max) {
  if (!raw) return NaN;
  const value = String(raw).toLowerCase();
  if (["all", "max", "全部"].includes(value)) return max;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function parsePositiveInt(value) {
  const parsed = Math.floor(Number(String(value || "").replace(/,/g, "")));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : NaN;
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

function randFloat(rng, min, max) {
  return rng() * (max - min) + min;
}

function pick(rng, items) {
  return items[Math.floor(rng() * items.length)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundShares(value) {
  return Math.round(value * 1000000) / 1000000;
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

function select(placeholder, options, disabled = false) {
  return { type: "select", placeholder, options, disabled };
}

function option(label, value, description) {
  return { label, value, description };
}

function mascotLine(rng, mood) {
  const lines = CASINO_MASCOT[mood] || CASINO_MASCOT.lose;
  return pick(rng, lines);
}

function signedPercent(bps) {
  const sign = bps >= 0 ? "+" : "";
  return `${sign}${(bps / 100).toFixed(2)}%`;
}

function policyStance(inflationBps, supplyPressure) {
  if (inflationBps >= 170 || supplyPressure >= 1.4) return "emergency";
  if (inflationBps >= 90) return "tightening";
  if (inflationBps >= 35) return "watch";
  if (inflationBps <= -20) return "stimulus";
  return "neutral";
}

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

function crashTrack(target, crashAt) {
  const points = [1, 1.25, 1.5, 2, 3, 4, 5].filter((point) => point <= Math.max(target, crashAt));
  const trail = points.map((point) => {
    if (point > crashAt) return "XX";
    if (Math.abs(point - target) < 0.01 || (point >= target && target <= crashAt)) return `[x${point.toFixed(2)}]`;
    return `x${point.toFixed(2)}`;
  });
  return trail.join(" -> ");
}

function normalizeRouletteChoice(choice) {
  if (choice === "赤") return "red";
  if (choice === "黒") return "black";
  if (choice === "奇数") return "odd";
  if (choice === "偶数") return "even";
  if (choice === "0") return "zero";
  return choice;
}

function forcedRouletteNumber(rng, choice, shouldHit) {
  const all = Array.from({ length: 37 }, (_, index) => index);
  const hits = all.filter((number) => {
    const color = rouletteColor(number);
    return (
      (choice === "red" && color === "red") ||
      (choice === "black" && color === "black") ||
      (choice === "odd" && number !== 0 && number % 2 === 1) ||
      (choice === "even" && number !== 0 && number % 2 === 0) ||
      (choice === "zero" && number === 0)
    );
  });
  const misses = all.filter((number) => !hits.includes(number));
  return pick(rng, shouldHit ? hits : misses);
}

function rouletteColor(number) {
  if (number === 0) return "zero";
  const red = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
  return red.has(number) ? "red" : "black";
}

function rouletteLabel(value) {
  if (value === "red") return "赤";
  if (value === "black") return "黒";
  if (value === "odd") return "奇数";
  if (value === "even") return "偶数";
  if (value === "zero") return "ゼロ";
  return String(value);
}

function normalizeHouseKey(key) {
  const normalized = String(key || "").toLowerCase();
  if (["kugi", "釘"].includes(normalized)) return "kugi";
  if (["return", "returnrate", "rtp", "還元"].includes(normalized)) return "returnRate";
  if (["volatility", "wave", "荒さ", "波"].includes(normalized)) return "volatility";
  if (["jackpot", "bonus", "大当たり"].includes(normalized)) return "jackpot";
  return null;
}

function kabuChangeLabel(kabu) {
  const diff = kabu.price - kabu.previousPrice;
  const sign = diff >= 0 ? "+" : "";
  const pct = kabu.previousPrice > 0 ? (diff / kabu.previousPrice) * 100 : 0;
  return `${sign}${diff} KC / ${sign}${pct.toFixed(1)}%`;
}

function createDeck(rng) {
  const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const deck = [];
  for (let i = 0; i < 4; i += 1) {
    for (const value of values) deck.push(value);
  }
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function handScore(hand) {
  let score = 0;
  let aces = 0;
  for (const card of hand) {
    if (card === "A") {
      score += 11;
      aces += 1;
    } else if (["J", "Q", "K"].includes(card)) {
      score += 10;
    } else {
      score += Number(card);
    }
  }
  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }
  return score;
}

function formatHand(hand) {
  return hand.join(" ");
}

function formatResult(result) {
  const mark = result.ok ? "◆" : "◇";
  return [`${mark} ${result.title}`, ...result.lines].join("\n");
}

module.exports = {
  ASSETS,
  CURRENCY,
  ECONOMY_RANKS,
  RPG_RANKS,
  SHOP_ITEMS,
  TEXT_RANKS,
  VC_RANKS,
  EconomyEngine,
  createInitialState,
  formatResult,
  fmt
};
