"use strict";

const {
  installDiscordOperations,
  installEconomyExtensions
} = require("./operations-extension");
const { installCampaignV2 } = require("./campaign-v2");
const { installDailyFourAmReset } = require("./daily-reset-4am");

installEconomyExtensions();
installCampaignV2();
installDailyFourAmReset();
installDiscordOperations();

require("./discord-entry-manual-join.js");
