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

買う側の入口です。

- 公式ショップを見る
- 公式商品を購入する
- 民営ショップを見る
- ユーザー出品の商品を購入する
- 公式オークションを見る
- 公式オークションへ入札する
- 購入履歴と持ち物を見る

購入は必ず、商品詳細から購入確認を挟みます。

## 自分の店

売る側の入口です。

- 店を開く
- 店名と説明を設定する
- 商品タイプを選ぶ
- 販売方式を選ぶ
- 商品を出品する
- 商品を停止する
- 売上を見る
- 取引中の商品を確認する

出品フォームはDiscordのモーダルで入力します。

## 管理

運営用の入口です。

- 公式商品管理
- 公式オークション管理と作成
- 民営ショップ管理
- 出品審査
- 取引対応
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

高額商品、ロール、称号、権利、サービス、セット商品は審査待ちになります。ロール・称号・権利・サービス・セット商品は自動付与できないため、購入後に「取引中」として販売者と購入者で完了報告します。

## 商品タイプ

```text
ロール
称号
アイテム
チケット
権利
サービス
セット商品
```

## 販売方式

```text
買い切り
期間制
```

期間制の商品は持ち物に期限が記録されます。期限切れ時の自動解除は今後の実装です。

## 公式ショップ

- 深座りの椅子（労働報酬+15%）
- 常連カード（ログボ+250）
- くじ付き封筒（ランダム収支）
- 黒金カード枠（プロフィール見栄え）
- 宿の増築券（宿の追加人数枠）

## 民営ショップ

通常のアイテムやチケットは、出品後すぐ公開されます。

以下は審査待ちになります。

- 高額商品（`reviewPrice` 以上）
- ロール
- 称号
- 権利
- サービス
- セット商品

Botが自動付与できない商品は、購入後に「取引中」として残ります。販売者または購入者が完了報告できます。

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
```

The API is scoped to `DISCORD_GUILD_ID`. `guildId` and every `discordUserId` must be numeric Discord Snowflakes; users are resolved only as `${DISCORD_GUILD_ID}:${discordUserId}`. Internal user IDs and suffix matching are not accepted. Reserve, settle, and cancel all enforce the same guild boundary; cross-guild or inconsistent transactions return `TRANSACTION_NOT_FOUND`. Users must have completed `join` before wallet or casino access is allowed. `bet`, `payout`, wallet results, and casino lifetime totals must remain safe integers, and reservations enforce `IRIS_CASINO_MIN_BET` and `IRIS_CASINO_MAX_BET`.

Failed casino state saves restore the complete in-memory state, including wallets, transactions, ledger entries, and lifetime totals. A retry can then complete the same reserve, settle, or cancel operation once. If the internal API cannot bind its configured host/port, the error is logged without secrets and the Discord Bot process continues so the main production bot is not stopped by an optional internal API listener failure.

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

`npm run smoke` は、参加時の初期資本が素の10万Risになること、カジノ/RPG/シンク/政策コマンドが未知扱いになること、ショップとオークションが動作することを検証します。
