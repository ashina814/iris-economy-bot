const path = require("path");
const readline = require("readline");
const { EconomyEngine, createInitialState, formatResult } = require("./economy");
const { JsonStore } = require("./storage");

const store = new JsonStore(path.join(__dirname, "..", "data", "local-state.json"), createInitialState);
const state = store.load();
const engine = new EconomyEngine(state);
let actor = { id: "local:player", name: "ローカル住民" };

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "iris> "
});

console.log("アイリス経済Bot ローカル確認");
console.log("`help` でコマンド一覧、`name 名前` で名前変更、`exit` で終了。");
console.log("");
rl.prompt();

rl.on("line", (line) => {
  const input = line.trim();
  if (!input) {
    rl.prompt();
    return;
  }

  if (["exit", "quit", "q"].includes(input.toLowerCase())) {
    rl.close();
    return;
  }

  if (input.toLowerCase().startsWith("name ")) {
    actor = { ...actor, name: input.slice(5).trim() || actor.name };
    console.log(`${actor.name} に変更しました。`);
    rl.prompt();
    return;
  }

  const result = engine.run(input, actor);
  store.save(engine.state);
  console.log(formatResult(result));
  console.log("");
  rl.prompt();
});

rl.on("close", () => {
  store.save(engine.state);
  console.log("保存しました。");
});
