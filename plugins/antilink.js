import PhoneNumber from "awesome-phonenumber";
import { jidNormalizedUser } from "@whiskeysockets/baileys";

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

    const chat = global.db.data.chats[m.chat];
    const sender = m.sender;
    const user = `@${sender.split("@")[0]}`;
    const delet = m.key.participant;
    const bang = m.key.id;

    if (isAdmin || isOwner || m.fromMe || isROwner) return;

    const isGroupLink = linkRegex.exec(m.text) || linkRegex1.exec(m.text);
    if (!chat.antilink || !isGroupLink) return true;

    if (!isBotAdmin) return true;

    const linkThisGroup = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`;
    if (m.text.includes(linkThisGroup)) return true;

    // Obtener admins reales
    const metadata = await conn.groupMetadata(m.chat);
    const owner = metadata.owner || `${m.chat.split`-`[0]}@s.whatsapp.net`;
    const botNumber = conn.user.jid;

    const adminRealNumbers = metadata.participants
        .filter(p => p.admin || p.admin === "superadmin")
        .map(p => {
            const real = getRealNumber(p);
            return real ? `${real}@s.whatsapp.net` : p.id;
        });

    const senderReal = getRealNumber({ id: sender }) ? `${getRealNumber({ id: sender })}@s.whatsapp.net` : sender;

    if (adminRealNumbers.includes(senderReal) || senderReal === owner || senderReal === botNumber) return true;

    await conn.sendMessage(
        m.chat,
        { 
            text: `${e} Se ha eliminado a ${user} del grupo por enviar un enlace no permitido.`, 
            mentions: [sender] 
        },
        { quoted: null, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100 }
    );

    await conn.sendMessage(
        m.chat,
        { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } }
    );

    await conn.groupParticipantsUpdate(m.chat, [sender], "remove");

    return true;
}
