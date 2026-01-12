import PhoneNumber from "awesome-phonenumber";

const fakePrefixes = ["212", "265", "234", "258", "263", "93", "967", "92", "234", "91", "254", "213", "504"];

function getRealNumberFromJid(jid) {
    if (!jid) return null;
    const raw = jid.split("@")[0].replace(/\D/g, "");
    if (!raw) return null;
    const pn = new PhoneNumber("+" + raw);
    if (!pn.isValid()) return null;
    return pn.getNumber("e164");
}

export async function before(m, { conn, participants, isAdmin, isBotAdmin, isOwner, isROwner }) {
    if (!m.isGroup) return;

    const chat = global.db.data.chats[m.chat];
    if (!chat?.antifake) return;

    const metadata = await conn.groupMetadata(m.chat);
    const admins = metadata?.participants?.filter(p => p.admin)?.map(p => p.id) || [];
    const owner = metadata?.owner || `${m.chat.split`-`[0]}@s.whatsapp.net`;
    const botJid = conn.user.jid;

    for (const p of participants) {
        const jid = p.id || p.jid;
        if (!jid) continue;

        if ([botJid, owner, ...admins].includes(jid)) continue;

        const real = getRealNumberFromJid(jid);
        if (!real) continue;

        const numeric = real.replace("+", "");
        const isFake = fakePrefixes.some(prefix => numeric.startsWith(prefix));
        if (!isFake) continue;

        if (!isBotAdmin) continue;

        await conn.groupParticipantsUpdate(m.chat, [jid], "remove");
        await conn.sendMessage(m.chat, {
            text: `${e} @${jid.split("@")[0]} fue eliminado por Anti-Fake.`,
            mentions: [jid]
        });
    }

    return true;
}
