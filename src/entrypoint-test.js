const assert = require("assert");
const fs = require("fs");
const Module = require("module");

process.env.IRIS_ENTRYPOINT_TEST = "1";
process.env.DISCORD_TOKEN = "entrypoint-test-token";
process.env.DISCORD_CLIENT_ID = "000000000000000000";

const originalLoader = Module._extensions[".js"];
require("./discord-entry-operations");
const { buildComponents, engine } = require("./discord-core");

assert.strictEqual(Module._extensions[".js"], originalLoader, "起動経路でModule._extensionsを上書きしてはいけません");
assert(!require.cache[require.resolve("./discord-entry-manual-join")], "通常起動でmanual-joinラッパーを経由してはいけません");
assert(!fs.readFileSync(require.resolve("./discord-core"), "utf8").includes('engine.run("join", actorFromMember(member))'), "入室時に初期Risを自動付与してはいけません");
assert(!fs.readFileSync(require.resolve("./discord-entry"), "utf8").includes("Module._extensions"), "discord-entryはソースを書き換えてはいけません");
assert(!fs.readFileSync(require.resolve("./discord-entry-manual-join"), "utf8").includes("Interaction.prototype"), "応答メソッドをプロトタイプで置き換えてはいけません");

const actor = { id: "entrypoint-test:user", name: "entrypoint tester" };
engine.run("join", actor);
for (const command of [
  "panel home",
  "panel admin",
  "panel admin-maintenance",
  "panel admin-rank",
  "panel rank-xp-settings",
  "panel vc-xp-location-settings",
  "panel boost-rewards",
  "panel market-admin",
  "panel official-product-admin",
  "panel official-auction-admin"
]) {
  const result = engine.run(command, actor);
  if (result.panel) buildComponents(result);
}

console.log("entrypoint-test: passed");
