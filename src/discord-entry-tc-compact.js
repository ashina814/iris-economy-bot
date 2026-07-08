"use strict";

const fs = require("fs");
const path = require("path");
const Module = require("module");

const targetEntrypoint = path.join(__dirname, "discord-entry.js");

function injectTcRankCompactPatch(source) {
  if (source.includes("TCランク昇格通知を単行表示にする。")) return source;

  const vcRankPatch = [
    "  content = content.replace(",
    "    'lines: [`${user.name} が ${after.name} になりました。`, `VCレベル ${this.vcLevel(user)} / 通話 ${cappedMinutes}分 / 経験値 +${xp} / +${fmt(drip)}`, capLine],',",
    "    'lines: [`${user.name} が ${after.name} になりました。`],',",
    "  );"
  ].join("\n");

  const tcRankPatch = [
    "",
    "  // TCランク昇格通知を単行表示にする。",
    "  content = content.replace(",
    "    'lines: [`${user.name} が ${after.name} になりました。`, `TCレベル ${this.textLevel(user)} / 会話報酬 +${fmt(drip)} / TC経験値 +${xp}`],',",
    "    'lines: [`${user.name} が ${after.name} になりました。`],',",
    "  );"
  ].join("\n");

  if (!source.includes(vcRankPatch)) {
    throw new Error("TC rank compact patch insertion point not found.");
  }

  return source.replace(vcRankPatch, `${vcRankPatch}${tcRankPatch}`);
}

function installEntrypointPatch() {
  if (Module._extensions[".js"].__irisTcRankCompactEntrypointPatched) return;

  const originalLoader = Module._extensions[".js"];
  Module._extensions[".js"] = function irisTcRankCompactLoader(module, filename) {
    if (path.resolve(filename) !== path.resolve(targetEntrypoint)) {
      return originalLoader(module, filename);
    }

    const content = injectTcRankCompactPatch(fs.readFileSync(filename, "utf8"));
    return module._compile(content, filename);
  };
  Module._extensions[".js"].__irisTcRankCompactEntrypointPatched = true;
}

installEntrypointPatch();
require("./discord-entry.js");
