"use strict";

const fs = require("fs");
const path = require("path");
const Module = require("module");

const targetCompactEntrypoint = path.join(__dirname, "discord-entry-tc-compact.js");

const oldGuildMemberAddHandler = [
  'client.on(Events.GuildMemberAdd, async (member) => {',
  '  if (member.user.bot) return;',
  '  const used = await detectUsedInvite(member.guild);',
  '  const result = used?.inviter',
  '    ? engine.recordInviteJoin(',
  '        actorFromUser(member.guild.id, used.inviter),',
  '        actorFromMember(member),',
  '        { code: used.code }',
  '      )',
  '    : null;',
  '  const joinResult = engine.run("join", actorFromMember(member));',
  '  store.save(engine.state);',
  '  if (result) {',
  '    await sendLog({',
  '      ok: true,',
  '      title: "招待成立",',
  '      lines: [`${result.inviter.name} -> ${result.invitee.name}`, ...joinResult.lines.slice(0, 2)]',
  '    });',
  '    if (joinResult.inviteRankUp && joinResult.inviterId) {',
  '      const inviterDiscordId = extractDiscordUserId(joinResult.inviterId);',
  '      await sendRankAnnouncement(',
  '        { title: "招待階級昇格", lines: [], meta: joinResult.inviteRankUp },',
  '        inviterDiscordId,',
  '        member',
  '      );',
  '    }',
  '  } else {',
  '    await sendLog({',
  '      ok: true,',
  '      title: "自動加入",',
  '      lines: [`${member.displayName || member.user.username} に初期Risを付与。`, ...joinResult.lines.slice(0, 1)]',
  '    });',
  '  }',
  '});'
].join("\n");

const patchedGuildMemberAddHandler = [
  'client.on(Events.GuildMemberAdd, async (member) => {',
  '  if (member.user.bot) return;',
  '  const used = await detectUsedInvite(member.guild);',
  '  const result = used?.inviter',
  '    ? engine.recordInviteJoin(',
  '        actorFromUser(member.guild.id, used.inviter),',
  '        actorFromMember(member),',
  '        { code: used.code }',
  '      )',
  '    : null;',
  '  const joinResult = engine.run("join", actorFromMember(member));',
  '  store.save(engine.state);',
  '  if (result) {',
  '    await sendLog({',
  '      ok: true,',
  '      title: "招待成立",',
  '      lines: [`${result.inviter.name} -> ${result.invitee.name}`, ...joinResult.lines.slice(0, 2)]',
  '    });',
  '    if (joinResult.inviteRankUp && joinResult.inviterId) {',
  '      const inviterDiscordId = extractDiscordUserId(joinResult.inviterId);',
  '      const inviterMember = inviterDiscordId && member.guild',
  '        ? await member.guild.members.fetch(inviterDiscordId).catch(() => null)',
  '        : null;',
  '      const inviterUser = inviterDiscordId',
  '        ? await client.users.fetch(inviterDiscordId).catch(() => null)',
  '        : null;',
  '      const inviterContext = inviterMember',
  '        ? { user: inviterMember.user, member: inviterMember, guild: inviterMember.guild }',
  '        : { user: inviterUser, guild: member.guild, member: null };',
  '      await sendRankAnnouncement(',
  '        { title: "招待階級昇格", lines: [], meta: joinResult.inviteRankUp },',
  '        inviterDiscordId,',
  '        inviterContext',
  '      );',
  '    }',
  '  } else {',
  '    await sendLog({',
  '      ok: true,',
  '      title: "自動加入",',
  '      lines: [`${member.displayName || member.user.username} に初期Risを付与。`, ...joinResult.lines.slice(0, 1)]',
  '    });',
  '  }',
  '});'
].join("\n");

const newGuildMemberAddHandler = [
  'client.on(Events.GuildMemberAdd, async (member) => {',
  '  if (member.user.bot) return;',
  '  const used = await detectUsedInvite(member.guild);',
  '  const result = used?.inviter',
  '    ? engine.recordInviteJoin(',
  '        actorFromUser(member.guild.id, used.inviter),',
  '        actorFromMember(member),',
  '        { code: used.code }',
  '      )',
  '    : null;',
  '  store.save(engine.state);',
  '  if (result) {',
  '    await sendLog({',
  '      ok: true,',
  '      title: "招待追跡",',
  '      lines: [`${result.inviter.name} -> ${result.invitee.name}`, "初期Risは参加ボタンを押した時に付与します。"]',
  '    });',
  '  } else {',
  '    await sendLog({',
  '      ok: true,',
  '      title: "新規参加",',
  '      lines: [`${member.displayName || member.user.username} が参加しました。`, "初期Risは参加ボタンを押した時に付与します。"]',
  '    });',
  '  }',
  '});'
].join("\n");

function injectManualJoinPatchLoader(source) {
  if (source.includes("参加ボタンでのみ初期資本を付与する。")) return source;

  const helper = `
function injectManualJoinGrantPatch(source) {
  if (source.includes("参加ボタンでのみ初期資本を付与する。")) return source;

  const oldValue = ${JSON.stringify(oldGuildMemberAddHandler)};
  const patchedOldValue = ${JSON.stringify(patchedGuildMemberAddHandler)};
  const newValue = ${JSON.stringify(newGuildMemberAddHandler)};
  const manualJoinPatch = [
    "",
    "  // 参加ボタンでのみ初期資本を付与する。",
    "  if (!content.includes(" + JSON.stringify(newValue) + ")) {",
    "    if (content.includes(" + JSON.stringify(patchedOldValue) + ")) {",
    "      content = content.replace(" + JSON.stringify(patchedOldValue) + ", " + JSON.stringify(newValue) + ");",
    "    } else if (content.includes(" + JSON.stringify(oldValue) + ")) {",
    "      content = content.replace(" + JSON.stringify(oldValue) + ", " + JSON.stringify(newValue) + ");",
    "    } else {",
    "      throw new Error(\"Manual join runtime patch insertion point not found.\");",
    "    }",
    "  }"
  ].join("\\n");
  const insertionPoint = "\\n  return content;\\n}\\n\\nfunction patchRankingSource";

  if (!source.includes(insertionPoint)) {
    throw new Error("Manual join runtime patch insertion point not found.");
  }

  return source.replace(insertionPoint, "\\n" + manualJoinPatch + "\\n  return content;\\n}\\n\\nfunction patchRankingSource");
}
`;

  const oldEntrypointPatch = `function injectEntrypointPatch(source) {
  return injectYadoPanelTextPatch(injectYadoExtensionPatch(injectTcRankCompactPatch(source)));
}`;
  const newEntrypointPatch = `${helper}
function injectEntrypointPatch(source) {
  return injectYadoPanelTextPatch(injectYadoExtensionPatch(injectManualJoinGrantPatch(injectTcRankCompactPatch(source))));
}`;

  if (!source.includes(oldEntrypointPatch)) {
    throw new Error("Compact entrypoint patch insertion point not found.");
  }

  return source.replace(oldEntrypointPatch, newEntrypointPatch);
}

function installManualJoinPatchLoader() {
  if (Module._extensions[".js"].__irisManualJoinPatchLoaderInstalled) return;

  const originalLoader = Module._extensions[".js"];
  Module._extensions[".js"] = function irisManualJoinPatchLoader(module, filename) {
    if (path.resolve(filename) !== path.resolve(targetCompactEntrypoint)) {
      return originalLoader(module, filename);
    }

    const content = injectManualJoinPatchLoader(fs.readFileSync(filename, "utf8"));
    return module._compile(content, filename);
  };
  Module._extensions[".js"].__irisManualJoinPatchLoaderInstalled = true;
}

installManualJoinPatchLoader();
require("./discord-entry-tc-compact.js");
