#!/usr/bin/env node
// 旧ブーストカウンターBot（DiscordBoostCounterBOT）の boost-data.json を
// iris の経済台帳（data/discord-state.json）へ一度だけ取り込む。
//
// 使い方（Botを止めてから実行すること）:
//   node scripts/import-boost-counter.js /opt/discord-boost-counter-bot/data/boost-data.json
//
// - 即時ボーナスは支払わない（過去分の取り込みは記録のみ）
// - 同じ sourceId での二回目以降の実行は拒否される（二重加算防止）
// - 取り込んだメッセージIDは重複防止台帳に入り、同じ通知を後から再カウントしない

const fs = require("fs");
const path = require("path");
const { EconomyEngine, createInitialState } = require("../src/economy");
const { JsonStore } = require("../src/storage");

const sourcePath = process.argv[2] || "/opt/discord-boost-counter-bot/data/boost-data.json";
const statePath = process.argv[3] || path.join(__dirname, "..", "data", "discord-state.json");

if (!fs.existsSync(sourcePath)) {
  console.error(`取り込み元が見つかりません: ${sourcePath}`);
  process.exit(1);
}
if (!fs.existsSync(statePath)) {
  console.error(`iris台帳が見つかりません: ${statePath}`);
  process.exit(1);
}

const boostData = JSON.parse(fs.readFileSync(sourcePath, "utf8").replace(/^﻿/, ""));
const guilds = Object.entries(boostData.guilds || {});
if (guilds.length === 0) {
  console.log("取り込むギルドデータがありません。終了します。");
  process.exit(0);
}

const store = new JsonStore(statePath, createInitialState);
const engine = new EconomyEngine(store.load());

let changed = false;
for (const [guildId, guild] of guilds) {
  const result = engine.importBoostCounter({
    sourceId: `boost-counter-bot:${guildId}`,
    guildId,
    users: guild.users || {},
    processedMessages: guild.processedMessages || {}
  });
  if (result.ok) {
    changed = true;
    console.log(`ギルド ${guildId}: ${result.importedUsers}人 / 累計 ${result.importedBoosts}回 / 重複防止ID ${result.importedMessages}件 を取り込みました。`);
  } else if (result.code === "ALREADY_IMPORTED") {
    console.log(`ギルド ${guildId}: すでに取り込み済み（${result.importedAt}）。スキップします。`);
  } else {
    console.error(`ギルド ${guildId}: 取り込みに失敗しました（${result.code}）。`);
    process.exitCode = 1;
  }
}

if (changed) {
  store.save(engine.state);
  console.log("iris台帳へ保存しました。");
} else {
  console.log("変更はありません。");
}
