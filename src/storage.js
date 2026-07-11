const fs = require("fs");
const path = require("path");

class StateLoadError extends Error {
  constructor(filePath, cause) {
    super(`経済stateの読込に失敗しました: ${filePath}`);
    this.name = "StateLoadError";
    this.filePath = filePath;
    this.cause = cause;
  }
}

class JsonStore {
  constructor(filePath, initialStateFactory) {
    this.filePath = filePath;
    this.initialStateFactory = initialStateFactory;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  load() {
    if (!fs.existsSync(this.filePath)) {
      return this.initialStateFactory();
    }

    try {
      const raw = fs.readFileSync(this.filePath, "utf8");
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : this.initialStateFactory();
    } catch (error) {
      // 経済データを空の初期stateとして起動すると、既存利用者の残高が消えたように見える。
      // 壊れたファイルの退避や復旧判断は、バックアップを確認できる運営作業として明示的に行う。
      throw new StateLoadError(this.filePath, error);
    }
  }

  save(state) {
    const tempPath = `${this.filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(state, null, 2), "utf8");
    fs.renameSync(tempPath, this.filePath);
  }
}

module.exports = { JsonStore, StateLoadError };
