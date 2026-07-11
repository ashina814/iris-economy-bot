"use strict";

const {
  installDiscordOperations,
  installEconomyExtensions
} = require("./operations-extension");

installEconomyExtensions();
installDiscordOperations();

require("./discord-entry-manual-join.js");
