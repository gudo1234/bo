import { jidNormalizedUser } from "@whiskeysockets/baileys";

let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i;
let linkRegex1 = /whatsapp.com\/channel\/([0-9A-Za-z]{20,24})/i;

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner, participants }) {
    if (!m.isGroup) return;

    const chat = global.db.data.chats[m.chat];
    const sender = m.sender;
    const user = `@${sender.split("@")[0]}`;
    const delet = m.key.participant;
    const bang = m.key.id;
    const groupAdmins = participants.filter(p => p.admin || p.admin === "superadmin").map(p => p.id);

    if (isAdmin || isOwner || m.fromMe || isROwner) return;

    const isGroupLink = linkRegex.exec(m.text) || linkRegex1.exec(m.text);

    if (chat.antilink && isGroupLink) {
        if (isBotAdmin) {
            const linkThisGroup = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`;
            if (m.text.includes(linkThisGroup)) return true;
        }

        if (groupAdmins.includes(sender)) return true;

        await conn.sendMessage(
            m.chat,
            { 
                text: `${e} Se ha eliminado a ${user} del grupo por Anti-Link.`, 
                mentions: [sender] 
            },
            { quoted: null, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100 }
        );

        if (isBotAdmin) {
            await conn.sendMessage(
                m.chat,
                { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } }
            );

            const responseb = await conn.groupParticipantsUpdate(m.chat, [sender], "remove");
            if (responseb[0].status === "404") return;
        }
    }

    return true;
}
