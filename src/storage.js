const fs = require("fs");
const path = require("path");

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
      const brokenPath = `${this.filePath}.broken-${Date.now()}`;
      fs.renameSync(this.filePath, brokenPath);
      return this.initialStateFactory();
    }
  }

  save(state) {
    const tempPath = `${this.filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(state, null, 2), "utf8");
    fs.renameSync(tempPath, this.filePath);
  }
}

module.exports = { JsonStore };
