# Iris K-Credit Economy Bot

K-Credit Economy Bot は、Discord サーバー内に独自通貨 `KC` を流通させる経済圏ボットです。
財布、投資、借金、ショップ、Text/VC ランク、RPG、カジノを 1 つの台帳で動かします。
Discord では `/eco` だけ打てばパネルが出ます。コマンド暗記より、ボタンで触る設計です。

今は JavaScript 実装です。小さく配って改造する段階ではこのままで十分です。
DB、管理画面、権限設定、複数サーバー運用が重くなってきたら TypeScript 化すると楽になります。

## できること

- 独自通貨 `KC`
- 参加時の初期配布 `100,000 KC`
- 純資産ベースの経済ランク
- レベル帯でレイアウトが変わるプロフィールカード
- 通常チャットで伸びる Text ランク
- VC 滞在時間で伸びる VC ランク
- VCに上がっているだけで入る日次上限つきKC報酬
- KCを燃やして鯖イベントを起こす共同シンク `自由闇鍋`
- 招待成立でKCが入る招待台帳
- ステータス育成、クエスト、休息、鍛錬の RPG 要素
- マスコット `リリス` がいる仮想カジノ
- Crash、Roulette、スロット、コイントス、ダイス、ブラックジャック
- 通話鯖っぽい銘柄と、カブ価風の期限つきカブ市場
- 市場銘柄への投資、カブ売買、ポートフォリオ
- CPI、発行量、回収量、政策スタンスを持つインフレ制御
- カジノの日次損失上限、連敗クールダウン、プレイ上限
- カジノの釘、還元、荒さ、大当たり寄せを調整可能
- JSON 永続化なので DB なしで起動可能

## ローカルで遊ぶ

```powershell
npm run play
```

PowerShell の実行ポリシーで `npm.ps1` が止まる場合は `npm.cmd run play` のように実行してください。

CLI では `kc>` にコマンドを打ちます。

```text
join
panel
panel lounge
vc
panel casino
panel sink
panel invite
daily
work
ranks
card
policy
quest task
crash 100 2.0
market
kabu buy 1000
```

データは `data/local-state.json` に保存されます。

## Discord で動かす

```powershell
npm install
Copy-Item .env.example .env
```

`.env` の値を環境変数として設定してから起動します。

```powershell
$env:DISCORD_TOKEN="your_bot_token"
$env:DISCORD_CLIENT_ID="your_application_client_id"
$env:DISCORD_GUILD_ID="your_test_guild_id"
npm run discord
```

起動すると `/eco` が登録されます。

```text
/eco
/eco command:panel casino
/eco command:panel market
/eco command:card
```

プレフィックスでも使えます。

```text
!eco profile
!eco panel casino
!eco rank casino
```

通常発言 XP を拾うには Discord Developer Portal で Message Content Intent を有効にしてください。
VC ランクには Guild Voice States intent が必要です。
招待トラッキングには Guild Members intent、Guild Invites intent、Botの招待閲覧権限が必要です。
メンバー参加時に自動で `100,000 KC` が付与されます。
カジノ設定変更を制限する場合は `ECONOMY_ADMIN_IDS` にDiscordユーザーIDをカンマ区切りで入れてください。

## 主要コマンド

基本は `/eco` または `panel` から操作します。
細かいコマンドは、パネルのボタンやセレクトの裏側にあります。

### パネル

- `panel` - ホーム
- `panel lounge` - 通話/Text/VC、VC報酬
- `panel rpg` - RPG
- `panel market` - 株、カブ、政策
- `panel casino` - カジノ
- `panel sink` - KCを燃やす共同シンク
- `panel invite` - 招待報酬
- `panel safety` - 安全設計

### 経済

- `join` - 経済圏に参加
- `daily` - ログインボーナス
- `work` - 労働して KC を稼ぐ
- `subsidy` - 給付金チャレンジ
- `bal` - 財布、投資評価額、借金、純資産
- `profile` - 総合プロフィール
- `ranks` / `card` - Economy / Text / VC / RPG / Casino のランクカード
- `rank net|text|vc|rpg|casino` - ランキング
- `policy` - CPI、インフレ率、発行/回収、政策スタンス
- `vc` - VC在室分のKCとVC XPを途中精算
- `sink 500` - 500 KCを自由闇鍋に燃やす
- `invite` - 招待状況を見る
- `rank invite` - 招待ランキング
- `house` - カジノ釘設定を見る
- `house profile sweet|middle|max|festival` - 釘プロファイルを切り替える
- `house set kugi 105` - 個別に釘を触る

### 市場

- `market` - 銘柄一覧
- `invest NEON 1000` - 1000 KC 分買う
- `invest OSHI all` - 全額投資
- `sell NEON all` - 全部売る
- `kabu` - カブ価を見る
- `kabu buy 1000` - 1000 KC 分カブを買う
- `kabu sell all` - カブを全部売る
- `portfolio` - 保有銘柄
- `news` - 市場ニュース

### RPG

- `rpg` - ステータス
- `quests` - クエスト一覧
- `quest task` - 未処理タスクの砦
- `quest invoice` - 請求書の迷宮
- `quest deadline` - 締切前線
- `train attack|defense|focus|luck` - KC を払って育成
- `rest` - HP と Energy を回復

### カジノ

- `crash 100 2.0`
- `roulette 100 red`
- `slots 100`
- `coinflip 100 heads`
- `dice 100 4`
- `bj 250`

カジノはゲーム内通貨 `KC` のみを使う仮想機能です。
マスコットは `リリス`。アイリス地下卓の煽りディーラーです。
退廃的で口は悪いですが、負けが込んだらちゃんと止めます。

安全ガード:

- 日次損失上限
- 連敗クールダウン
- 1日のプレイ上限
- CPI連動の最低ベット、最大ベット
- 実マネー、換金、課金連動なし

### ショップ

- `shop`
- `buy chair`
- `buy tonic`
- `use tonic`

## ランク設計

Text ランクは通常メッセージで上がります。短時間の連投では XP が入らないように 30 秒のクールダウンがあります。

VC ランクは入室から退室までの滞在分数で上がります。1 回の精算は最大 240 分に制限しています。
VC報酬は退室時に精算され、Discord起動中は10分ごとに静かに自動精算されます。
`panel lounge` の `VC精算` か `vc` でも途中精算できます。
KC報酬には日次上限があります。上限後もVC XPは伸びます。

経済ランクは純資産、RPG ランクは RPG XP、Casino ランクは収支と勝敗で見ます。

## カードレイアウト

`profile`、`ranks`、`card` はカード表示になります。
CLI では ASCII カード、Discord では Embed カードとして表示します。

カードスタイルは総合スコアで変わります。

```text
CIVIC  -> 初期カード
CHROME -> 活動が増えたカード
AURUM  -> ランク進行が見える帳簿カード
PRISM  -> 複数ランクを並べるマトリクスカード
BLACK  -> 上位者向けの高密度カード
```

総合スコアには、経済ランク、Text ランク、VC ランク、RPG ランク、カジノ収支が入ります。

## インフレ制御

`policy` で CPI、インフレ率、Money Supply、発行量、回収量、政策スタンスを確認できます。

K-Credit はコマンド進行に応じて政策サイクルを回します。

- 報酬は CPI に部分連動します
- ショップ価格、鍛錬費、休息費、罰金は CPI に連動します
- カジノの最低ベットと上限は CPI と政策スタンスに連動します
- 高インフレ時は `watch`、`tightening`、`emergency` と締め付けが強くなります
- デフレ時は `stimulus` で報酬側に少し支援が入ります

つまり、発行だけが増えると物価と制限が上がり、アイテム購入、鍛錬、休息、カジノ負け、税務署イベントなどの回収が効くと落ち着きます。

## シンク

`自由闇鍋` はKCを燃やす共同シンクです。

```text
panel sink
sink 500
sink 1000
```

鍋が目標額に届くと、短時間の鯖イベントが発火します。

- 通話バブル: VC報酬が少し太る
- カブ屋の横風: カブ価に変な風が吹く
- 税務署スモーク: 税務署イベントが少し軽くなる
- カード発光: カードの格が少し盛れる

直接配当はありません。燃やしたKCは戻りません。

## 招待報酬

招待は、招待された人がサーバーに入って自動加入した時点で成立します。
招待者にKC、招待された人にも小ボーナスが入ります。

```text
panel invite
invite
rank invite
```

1日の有償招待には上限があります。即抜けや自演っぽい招待を無限にKC化しないためです。

## カジノ設定

現代パチンコの「釘」「当たりの軽さ」「出玉感」「荒さ」っぽい考え方を、ゲーム内の安全な仮想カジノ設定に落としています。

```text
house
house profile sweet
house profile middle
house profile max
house profile festival
house set kugi 105
house set return 96
house set volatility 120
house set jackpot 110
```

- `kugi`: 当たりやすさ寄り
- `return`: 払い戻し寄り
- `volatility`: 波の荒さ
- `jackpot`: 高倍率側の寄り

Discordでは `ECONOMY_ADMIN_IDS` を設定すると、釘変更系コマンドを指定ユーザーだけにできます。

## ファイル構成

```text
src/economy.js      経済・ランク・RPG・カジノの中核
src/discord.js      Discord アダプタ
src/cli.js          ローカルCLI
src/storage.js      JSON保存
src/smoke-test.js   最低限の動作確認
data/               保存データ
```

## 動作確認

```powershell
npm run smoke
```

## カスタムするなら

通貨名、銘柄、ランク名、ショップ、クエスト、カジノ配当は `src/economy.js` の先頭にまとめています。
サーバーのノリに合わせてここを変えると、一気に独自経済圏になります。
