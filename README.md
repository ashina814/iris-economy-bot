# アイリス経済Bot

アイリス用のDiscord経済Botです。通貨は `Ris`。Bot本体は、財布・プロフィール・ショップ・宿・TC/VCランク・招待・安全管理を扱います。

カジノ・株式市場・カブ・ローン・シンク（自由闇鍋）・政策CPI・RPG・税務署ヘイトはBot本体から外しました。カジノについては、後でDiscord ActivityのWebゲームとして分離する予定です。Ris経済を荒らさないため、Bot側は「Ris・ショップ・宿・ランク」だけに絞ります。

## 利用者向けガイド

住民向けの詳しい使い方、初期通貨、カード、`/アイリス`、Risの稼ぎ方・使い道、称号一覧は次にまとめています。

```text
docs/USER_GUIDE.md
```

## 主要導線

ショップ機能は、入口を3つに絞ります。

```text
/ショップ
/自分の店
/管理
```

細かい操作は、パネル・ボタン・セレクトメニュー・モーダルで進めます。

既存のプロフィールとホームはBot全体の導線として残しています。二人宿は運営が固定パネルを設置して使います。

```text
/アイリス
/カード
/宿  ※運営用
```

## 初期資本

参加コマンド `join` で **初期資本 10万 Ris ちょうど**が配布されます（CPI補正なし、素の値）。

## 収入コマンド

```text
daily    - 24時間ごとのログボ
work     - 45秒CDの労働
subsidy  - 2分CDの給付金チャレンジ
vc       - VC在室分を精算
```

## ショップ

買う側の入口です。公式ショップ（Bot・運営が効果や付与を管理する商品）と、IRIS商店街（ユーザー同士の個人間取引）を分けています。トップは「人から探す（店舗を見る）」と「目的から探す（商品を探す）」の2軸です。

- 店舗を見る（販売者・店舗単位の一覧。店舗を開くとその販売者の全出品が見られる）
- 商品を探す（キーワード・カテゴリ・価格などの条件で商品単位の検索）
- ユーザーの出品を購入する（依頼内容・希望を添えられる）
- 自分の取引（購入・販売）の進行状況を見る
- 公式ショップを見る・公式商品を購入する
- 公式オークションを見る・入札する
- 持ち物（公式商品の所持・使用・申請）を見る

公開チャンネルに常設する商店街入口パネルは、誰がボタンを押しても書き換わりません。操作した本人にだけ見えるephemeral画面が開き、以降の個人操作（自分の店・自分の取引・検索・商品詳細など）はその画面内で完結します。

購入は必ず、商品詳細から購入確認を挟みます。確認画面には金額・手数料の扱い・現在残高と、「購入後は代金がIRIS預かりになる」ことを明示します。

## 自分の店（販売者ページ）

売る側の入口です。店舗の開設操作は不要で、初出品時に販売者ページが自動作成されます。1人1店舗です。

- 出品する（商品・サービス名 / 説明 / 価格 / カテゴリ / 受付上限だけ）
- 出品を編集・停止・再開・再提出する
- 自分の取引で受注・対応完了・辞退返金を操作する
- 売上・販売履歴を見る
- 店名・説明を任意のプロフィールとして設定する（未設定なら「〇〇の出品」表示）
- 受付をまとめて休止・再開する
- 店舗Forumの連携状態の確認・再同期（Forum未設定でも /ショップ と /自分の店 だけで完結できます）

出品フォームはDiscordのモーダルで入力します。受付上限は「無制限」か数量指定です。

## 管理

運営用の入口です。

- 公式商品管理
- 公式オークション管理と作成
- 民営（商店街）の出品審査・取引対応・通報キュー
- 商店街フォーラムと取引スペースのチャンネル設定（保守・パネル）
- 商店街入口・公式ショップ入口パネルの送信（保守・パネル）
- ログ確認
- 手数料や出品制限の確認
- 給与配布（ロール指定・一律）

### 給与配布

運営パネルの「給与配布」ボタンから、ロール保持者全員に一律で Ris を配布できます。

1. ボタンを押すとロール選択メニューが開く（最大10ロールまで同時選択可）
2. ロールを選ぶと、1人あたりの額とメモを入力するモーダルが開く
3. 「対象ロール」「対象人数」「1人あたり」「合計」を表示した確認パネルが出る
4. 「配布実行」を押すと、中央台帳から新規発行して全員の財布に一律で入る

- 原資は**中央台帳からの発行**なので、実行した管理者の財布は減りません
- 複数ロールで重複する人は**1回だけ**受け取ります（Bot は除外）
- 配布ログはログチャンネルとサーバー元帳に残ります

## 民営出品のカテゴリ

カテゴリは検索・発見のためだけに使い、処理（エスクロー・審査・支払い）はカテゴリによらず同じです。

```text
voice         通話
game          ゲーム
creative      制作
consultation  相談
fun           ネタ
other         その他
```

旧仕様の「商品タイプ（称号/アイテム/チケット/権利/サービス/セット商品）」と「買い切り/期間制」は新規出品では廃止しました。旧データの出品・注文・持ち物はlegacyとしてそのまま読み込み・閲覧できます。

## 公式ショップ

- 深座りの椅子（労働報酬+15%）
- 常連カード（ログボ+250）
- くじ付き封筒（ランダム収支）
- 黒金カード枠（プロフィール見栄え）
- 宿の増築券（宿の追加人数枠）

公式商品が購入されると、購入者のDiscord username・商品・金額・対応キュー番号を運営ログへ通知します。`IRIS_OFFICIAL_SHOP_LOG_CHANNEL_ID` を設定した場合はそのチャンネルへ、未設定なら `DISCORD_LOG_CHANNEL_ID` へ送信します。手動対応の商品は対応キューから購入者とだけ見えるチケットを作成できます。公式商品管理では、商品ごとに「即時完了」「購入時に対応」「持ち物から申請」を選べます。申請型の商品は購入時には対応キューを作らず、購入者が持ち物の「使う・申請する」から希望内容を送信した時点で、1個消費して対応キューとチケットを作成します。名前変更権（`official:name-henkou`）は、希望名付きの申請を運営が完了すると、Botがニックネームを変更して対応チケットを削除します。権限不足やチケット削除の失敗時は、対応キューとチケットを残して再試行できます。

## IRIS商店街（民営）

ユーザーが別のユーザーへサービスを提供するための個人間市場です。Botは商品の効果を解釈せず、出品の記録・Risの預かり・取引状態の管理・完了後の支払い・運営の返金対応だけを行います。

新規の民営取引はすべて次のエスクロー方式です。

```text
購入 → 購入者からRisを引く → 代金をIRIS預かり
→ 販売者が受注 → 対応 → 対応完了
→ 購入者が受取確認（または72時間で自動完了）
→ 手数料差引後のRisを販売者へ支払い
```

- 取引状態: ordered（受注待ち）/ accepted（対応中）/ delivered（受取確認待ち）/ completed（完了）/ reported（運営対応待ち）/ refunded（返金済み）/ cancelled（キャンセル）
- 購入時に依頼内容・希望を添えられます（販売者DMと取引画面に表示）
- 販売者が受注する前なら購入者はキャンセルできます。販売者は辞退して全額返金できます
- `delivered` から72時間、問題報告がなければ自動完了します（24時間前に購入者へ通知）。`reported` の取引は自動完了しません
- ロールの民営出品は禁止です（付与できるのは運営だけのため。公式のみ）

審査はリスク型です: 初回出品・高額出品（`reviewPrice` 以上）・要確認状態の販売者・通報停止後の再提出だけが審査待ちになり、それ以外は即公開されます。出品には「運営に報告」ボタンがあり、通報は運営の通報キュー（問題なし / 出品停止 / 販売者を要確認）で処理します。

販売者がサーバーを退出すると出品は新規購入停止になり、再参加後に本人が明示的に再開するまで公開されません（進行中の取引は運営対応可能なまま残ります）。

### 商店街フォーラム連携（1販売者 = 1店舗投稿）

運営が `保守・パネル` で ForumChannel を「IRIS商店街フォーラム」に設定すると、フォーラム = 店舗の並ぶ商店街 / Bot = 決済・取引・エスクロー という構成になります。Forum投稿は「1商品1投稿」ではなく「1販売者1店舗投稿」です。

- 販売者が初出品すると、Botがその販売者の店舗Forum投稿（店名タイトル + 店舗紹介本文）を自動作成します。すでに店舗投稿がある場合は新しい投稿を作りません（二重作成防止）
- 店舗投稿にはBotの店舗パネルをピン留めします: 店名・店主・受付状況・受付中の出品数・商品一覧（価格つき）・取引実績。商品が多い場合はセレクトメニューでcomponent上限を守ります
- 店舗パネルの商品一覧から、商品詳細 → 購入確認 → 購入（本人だけのephemeral画面）へ進めます
- 出品の追加・編集・価格変更・停止・再開・売り切れ・受付上限変化・店舗休止/再開があると、Botが店舗パネルを更新します
- DBが正本です。Forum投稿の本文を編集しても出品価格・商品情報・既存取引のスナップショットは変わりません。Forum同期に失敗しても出品・取引・Risはロールバックされず、同期状態を記録して「自分の店」の再同期ボタンからやり直せます
- 商店街フォーラムに手動で投稿を作ると、Botが「この投稿をあなたの店舗ページにしますか？」と案内します（採用できるのは投稿の作成者だけ）
- 店舗投稿が削除された場合は、その販売者のForum連携だけを解除します。DB上の出品・進行中の取引・Risには触れず、`/ショップ` からの販売は継続できます
- 旧仕様の「1商品1投稿」で登録済みの出品はlegacyとして互換維持します。旧投稿が削除された場合もForum連携の解除だけ行い、出品と既存取引の台帳は壊れません

### 取引スペース

運営が `保守・パネル` で取引用テキストチャンネルを設定すると、購入ごとに購入者・販売者だけが見えるprivate threadを作成し、取引の要約と状態に応じた操作ボタンを置きます。取引が終わるとスレッドはアーカイブされます。スレッド作成に失敗しても注文とRisは失われず、DMと「自分の取引」から継続できます。

販売者は「自分の店」から売上・販売履歴を確認できます。取引が動くと販売者・購入者へDM通知を試みます（購入・受注・対応完了・自動完了24時間前・返金・運営処理）。DMが拒否されても取引は失敗せず、ログチャンネルに記録が残ります。

## サーバーブースト報酬・ブーストカウンター

ブースト報酬は完全自動です。枠数ロール（1枠/2枠/3枠）の手動運用は廃止しました（旧設定はlegacyデータとして保持されます）。

- **回数カウント**: Discordのブースト通知（システムメッセージ type 8〜11）を1件=1回としてユーザー別累計を記録します。同じ通知の二重加算はしません。
- **即時ボーナス**: ブースト1回につきその場でRisを付与します（既定 5,000 Ris、月3回まで。額・上限は運営パネルから変更可）。
- **月次一律**: ブースト中の人へ月1回、一律のRisを付与します（既定 10,000 Ris。`premium_since` による自動判定）。
- **継続ボーナス**: 前月も月次報酬を受け取っている場合、+10,000 Risを追加します。
- **お祝い通知**: 通知チャンネルを設定すると、ブースト時に累計回数つきのお祝いを投稿します（未設定でもカウント・報酬は動作）。
- **ランキング**: `rank boost` とランク確認パネルの「ブーストランキング」から累計回数トップ10を表示します（🟢は現在ブースト中）。
- ブースター自動ロールを設定した場合、Botはブースト開始/終了に合わせてそのロールの付け外しを試みます。

Discord APIの仕様上「1人が現在何枠使っているか」は取得できません。通知OFF期間や削除済み通知の分は累計に反映されないため、必要なら旧カウンターBotのデータ取り込み（`scripts/import-boost-counter.js`、同一取り込み元は一度だけ・即時ボーナスなし）を使うか、台帳を直接補正してください。

追跡済みブースターは既定で6時間ごとに個別再確認します。全メンバー一括取得は行いません。再確認間隔は `IRIS_BOOST_REWARD_SWEEP_SECONDS` で変更できます。

## 運用上の安全設定

- `IRIS_SHOP_MAINTENANCE=1` を明示した場合だけ、ショップの出品・購入・審査・オークションを一時停止します。未設定または `0` は通常営業です。
- `data/discord-state.json`、`data/yado-state.json`、`data/panel-state.json` の読込に失敗した場合、Botは空の経済データで起動せず停止します。ファイルを自動で改名・初期化しないため、バックアップを確認してから復旧してください。
- `npm run patch:yado` は二人宿の実装を直接書き換えません。本体へ必要な実装が統合済みであることを検証し、不足時はデプロイを止めます。

## 内部Economy API（Discord Activity連携用）

将来のDiscord Activityカジノなど、Botと同じホストで動く信頼済みバックエンドからRis残高を扱うための内部APIです。`data/discord-state.json` を別プロセスから直接読み書きせず、Discord Botと同じNode.jsプロセス内で起動します。

APIは `IRIS_INTERNAL_API_KEY` が設定されている場合だけ起動します。ブラウザから直接呼ばせず、Activityバックエンドから `Authorization: Bearer <IRIS_INTERNAL_API_KEY>` を付けて呼び出してください。APIキーはログに出しません。キーは16文字以上のランダムな値にしてください。`replace_me`、`changeme`、`secret`、`password` は起動時に拒否されます。

```text
GET  /internal/v1/wallets/:discordUserId
POST /internal/v1/casino/reservations
POST /internal/v1/casino/reservations/:transactionId/settle
POST /internal/v1/casino/reservations/:transactionId/cancel
POST /internal/v1/activity/adjustments
```

The API is scoped to `DISCORD_GUILD_ID`. `guildId` and every `discordUserId` must be numeric Discord Snowflakes; users are resolved only as `${DISCORD_GUILD_ID}:${discordUserId}`. Internal user IDs and suffix matching are not accepted. Reserve, settle, and cancel all enforce the same guild boundary; cross-guild or inconsistent transactions return `TRANSACTION_NOT_FOUND`. Users must have completed `join` before wallet or casino access is allowed. `bet`, `payout`, wallet results, and casino lifetime totals must remain safe integers, and reservations enforce `IRIS_CASINO_MIN_BET` and `IRIS_CASINO_MAX_BET`.

Failed casino and Activity state saves restore the complete in-memory state, including wallets, transactions, ledger entries, and lifetime totals. A retry can then complete the same reserve, settle, cancel, or Activity adjustment once. If the internal API cannot bind its configured host/port, the error is logged without secrets and the Discord Bot process continues so the main production bot is not stopped by an optional internal API listener failure.

`POST /internal/v1/activity/adjustments` は、Discord Activityの既存の支給・消費制度をRis台帳へ移すための内部専用APIです。ブラウザから呼ばせず、Activityバックエンドだけが取引IDを発行して呼び出します。同じ `transactionId` と同じ内容の再送は冪等で、内容が異なる再送は拒否されます。理由コードは許可リスト方式で、支給は `daily`、`mission`、`weekly`、`mystery`、`season`、`album`、`raid`、`pvp`、`party`、`event`、`collection`、`odyssey`、`circuit`、`chest`、`vault`、`relief`、`refund`、`migration`、`treasury-refund`、`bonus` のみ、消費は `treasury` のみです。

```json
{
  "transactionId": "activity-daily-001",
  "discordUserId": "123456789012345678",
  "sessionId": "activity-session-001",
  "operation": "credit",
  "amount": 500,
  "reason": "daily"
}
```

予約 `POST /internal/v1/casino/reservations`:

```json
{
  "transactionId": "casino-tx-001",
  "discordUserId": "123456789012345678",
  "sessionId": "activity-session-001",
  "game": "blackjack",
  "bet": 1000
}
```

- 予約時に残高不足なら拒否します
- 予約成功時に `wallet` から `bet` を控除し、`casino_reserve` を台帳へ記録します
- 同じ `transactionId` と同じ内容の再送は冪等で、二重控除しません
- `transactionId`、`sessionId`、`game` はURLセグメント安全な英数字・`:`・`_`・`.`・`-` のみ使えます
- `discordUserId` is resolved only as `${DISCORD_GUILD_ID}:${discordUserId}`; internal user IDs and suffix matching are rejected

精算 `POST /settle`:

```json
{ "payout": 2000 }
```

- `payout` は賭け金込みの返却総額です
- `reserved -> settled` のみ許可します
- 同じ `payout` の再送は冪等で、二重加算しません
- `IRIS_CASINO_MAX_PAYOUT_MULTIPLIER` と `IRIS_CASINO_MAX_PAYOUT_RIS` で高額配当の上限を設定できます
- 精算時に `casino_settle` を台帳へ記録します

取消 `POST /cancel`:

- `reserved -> cancelled` のみ許可します
- 予約済みの賭け金をwalletへ返し、`casino_cancel` を台帳へ記録します
- 同じ取消の再送は冪等で、二重返金しません

環境変数:

```text
IRIS_INTERNAL_API_KEY=replace_with_long_random_secret
IRIS_INTERNAL_API_HOST=127.0.0.1
IRIS_INTERNAL_API_PORT=8787
IRIS_INTERNAL_API_MAX_BODY_BYTES=16384
IRIS_CASINO_MAX_PAYOUT_MULTIPLIER=100
IRIS_CASINO_MAX_PAYOUT_RIS=100000000
IRIS_CASINO_MIN_BET=1
IRIS_CASINO_MAX_BET=100000000
```

## 公式オークション

公式オークションは運営が作成します。

- 開始価格を設定
- 終了までの分数を設定
- 入札額をモーダル入力
- 最低入札額を表示
- 入札額を一時拘束
- 上書き入札された人へ自動返金
- 終了直前の入札で自動延長
- 終了時に最高入札者へ商品を付与
- 管理パネルから強制終了
- 入札履歴と落札ログを保存

## 二人宿

- パネル設置は運営だけが行います（`/管理` または運営用 `/宿`）
- 公開宿は無料、シークレット宿は10,000 Ris
- 追加人数は1人につき5,000 Ris
- 12時間で自動終了、1人1宿まで
- 空になった宿VCは自動削除

## VC報酬

- VC報酬は自動精算です
- 退出・移動時に精算され、在室中も10分ごとに自動反映されます
- 1回の精算は最大240分
- VC XP/分は運営パネルのXP設定で調整できます

## 貢献（招待・Bump/Up）

招待と DISBOARD の Bump/Up に階級があり、階級が上がるほど1回あたりの報酬が増えます。ホームパネルの「貢献」から確認できます。

**招待階級**（成立数 / 成立報酬）

```text
勧誘見習い        0人〜   900 Ris
声かけ屋          3人〜  1,300 Ris
人脈師           10人〜  1,900 Ris
門番長           20人〜  2,700 Ris
アイリスの広告塔  35人〜  3,800 Ris
伝説の勧誘師     50人〜  5,000 Ris
```

**Bump/Up階級**（累計回数 / 1回の報酬）

```text
はじめての宣伝     0回〜   500 Ris
常連宣伝員       10回〜   700 Ris
広報担当         30回〜   900 Ris
宣伝部長         60回〜  1,200 Ris
アイリスの拡声器 100回〜  1,500 Ris
```

- DISBOARD で `/bump` または `/up` が成功すると自動で報酬が入り、チャンネルにお礼が投稿されます
- 招待・Bump/Up とも階級が上がると昇格通知が流れます

## ランキング

```text
rank net     - 純資産（デフォルト）
rank text    - 発言経験値
rank vc      - VC経験値
rank invite  - 招待成立数（階級付き）
rank bump    - Bump/Up回数（階級付き）
```

## 動作確認

```powershell
node --check src/economy.js
node --check src/discord.js
npm run smoke
```

`npm run smoke` は、参加時の初期資本が素の10万Risになること、カジノ/RPG/シンク/政策コマンドが未知扱いになること、ショップ・オークション・IRIS商店街（エスクロー取引の状態遷移、キャンセル・返金、自動完了、販売者退出、ページ送り、フォーラム連携のガード、店舗Forum（1販売者1投稿・二重作成防止・削除時の連携解除・同期失敗時のDB維持）、公開入口パネルの内容、旧データmigration）が動作することを検証します。entrypoint-testでは、公開商店街パネルのボタン操作が元メッセージを書き換えず、各ユーザーへephemeralで返ることも検証します。
