const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { JsonStore, StateLoadError } = require("./storage");

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "iris-storage-test-"));
const filePath = path.join(dir, "state.json");
const store = new JsonStore(filePath, () => ({ users: {} }));

assert.deepStrictEqual(store.load(), { users: {} }, "stateが存在しない場合だけ初期stateを返す必要があります");
fs.writeFileSync(filePath, "{broken", "utf8");

assert.throws(() => store.load(), StateLoadError, "壊れた経済stateで空state起動してはいけません");
assert(fs.existsSync(filePath), "読込失敗時も元のstateファイルを残す必要があります");
assert.strictEqual(fs.readdirSync(dir).filter((name) => name.includes(".broken-")).length, 0, "読込時にstateを勝手に退避してはいけません");

console.log("storage-test: passed");
