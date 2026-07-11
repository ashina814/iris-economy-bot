"use strict";

const fs = require("fs");
const path = require("path");

const corePath = path.join(__dirname, "..", "src", "discord-core.js");
const source = fs.readFileSync(corePath, "utf8");

// Yado is now maintained directly in discord-core.js. Keep this command as a
// loud compatibility check for deployment scripts, but never rewrite source at
// startup or during deployment.
const requiredAnchors = [
  "const yadoExtendHours =",
  "startYadoControlRefreshSweeper();",
  "async function handleYadoControl(interaction)",
  "async function extendYadoRoom(interaction, ownerKey, room, channel)",
  "async function resyncYadoPermissions(interaction, room, channel)",
  "async function refreshYadoControlPanel(interaction, room, channel)",
  "async function closeYadoRoomFromConfirmation(interaction, ownerKey, channel)",
  "function buildYadoControlPayload(room, channel)",
  "function startYadoControlRefreshSweeper()"
];

for (const anchor of requiredAnchors) {
  if (!source.includes(anchor)) {
    throw new Error(`apply-yado-extension: required direct integration missing: ${anchor}`);
  }
}

console.log("apply-yado-extension: direct integration verified");
