import PhoneNumber from "awesome-phonenumber";

let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i;
let linkRegex1 = /whatsapp.com\/channel\/([0-9A-Za-z]{20,24})/i;

function getRealNumber(participant) {
    let raw = null;

    if (participant.jid && participant.jid.endsWith("@s.whatsapp.net")) {
        raw = participant.jid.split("@")[0];
    } else if (participant.id && participant.id.endsWith("@s.whatsapp.net")) {
        raw = participant.id.split("@")[0];
    }

    if (!raw) return null;

    const pn = new PhoneNumber("+" + raw);
    if (!pn.isValid()) return null;

    return pn.getNumber("e164");
}

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner, participants }) {
    if (!m.isGroup) return;
    if (isAdmin || isOwner || m.fromMe || isROwner) return;

    let chat = global.db.data.chats[m.chat];
    let delet = m.key.participant;
    let bang = m.key.id;
    const user = `@${m.sender.split`@`[0]}`;
    const isGroupLink = linkRegex.exec(m.text) || linkRegex1.exec(m.text);

    if (!chat.antilink || !isGroupLink) return true;

    if (isBotAdmin) {
        const linkThisGroup = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`;
        if (m.text.includes(linkThisGroup)) return true;
    }

    const adminRealNumbers = participants
        .filter(p => p.admin || p.admin === "superadmin")
        .map(p => {
            const real = getRealNumber(p);
            return real ? `${real}@s.whatsapp.net` : p.id;
        });

    const senderReal = getRealNumber({ id: m.sender }) ? `${getRealNumber({ id: m.sender })}@s.whatsapp.net` : m.sender;

    if (adminRealNumbers.includes(senderReal)) return true;

    await conn.sendMessage(
        m.chat,
        { text: `${e} Se ha eliminado a ${user}⁩ del grupo por Anti-Link.`, mentions: [m.sender] },
        { quoted: null, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100 }
    );

    if (isBotAdmin) {
        await conn.sendMessage(
            m.chat,
            { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } }
        );

        let responseb = await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
        if (responseb[0].status === "404") return;
    }

    return true;
}
