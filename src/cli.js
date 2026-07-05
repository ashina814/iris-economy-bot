const path = require("path");
const readline = require("readline");
const { EconomyEngine, createInitialState, formatResult } = require("./economy");
const { JsonStore } = require("./storage");

const store = new JsonStore(path.join(__dirname, "..", "data", "local-state.json"), createInitialState);
const state = store.load();
const engine = new EconomyEngine(state);
let actor = { id: "local:player", name: "Local Player" };

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "kc> "
});

console.log("K-Credit Economy Bot local simulator");
console.log("Type `help` to see commands. Type `name YourName` to rename. Type `exit` to quit.");
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
    console.log(`Renamed to ${actor.name}`);
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
  console.log("Saved. See you in the ledger.");
});
