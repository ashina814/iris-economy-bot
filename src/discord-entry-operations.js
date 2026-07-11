"use strict";

const {
  installDiscordOperations,
  installEconomyExtensions
} = require("./operations-extension");
const { installDailyFourAmReset } = require("./daily-reset-4am");

installEconomyExtensions();
installDailyFourAmReset();
installDiscordOperations();

require("./discord-entry-manual-join.js");
