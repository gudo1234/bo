import PhoneNumber from "awesome-phonenumber";

const fakePrefixes = [
    "212", "265", "234", "258", "263",
    "93", "967", "92", "91", "254", "213", "504"
];

function getRealNumberFromJid(jid) {
    if (!jid) return null;

    const num = jid.split("@")[0].replace(/\D/g, "");
    if (!num) return null;

    const pn = new PhoneNumber("+" + num);
    if (!pn.isValid()) return null;

    return pn.getNumber("e164");
}

export async function before(m, { conn }) {
    if (!m.isGroup) return;

    if (!m.messageStubType || m.messageStubType !== 27) return;

    const chat = global.db.data.chats[m.chat];
    if (!chat?.antifake) return;

    const newUsers = m.messageStubParameters || [];
    if (!newUsers.length) return;

    const metadata = await conn.groupMetadata(m.chat);
    const admins = metadata.participants
        .filter(p => p.admin)
        .map(p => p.id);

    const owner = metadata.owner || `${m.chat.split`-`[0]}@s.whatsapp.net`;
    const botJid = conn.user.jid;

    for (const jid of newUsers) {
        if (
            jid === botJid ||
            jid === owner ||
            admins.includes(jid)
        ) continue;

        const real = getRealNumberFromJid(jid);
        if (!real) continue;

        const numeric = real.replace("+", "");

        const isFake = fakePrefixes.some(p => numeric.startsWith(p));
        if (!isFake) continue;

        await conn.sendMessage(m.chat, {
            text: `${e} @${jid.split("@")[0]} fue eliminado por Anti‑Fake.`,
            mentions: [jid]
        });

        await conn.groupParticipantsUpdate(m.chat, [jid], "remove");
    }

    return true;
          }
