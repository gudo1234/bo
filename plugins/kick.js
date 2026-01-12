import { jidNormalizedUser } from "@whiskeysockets/baileys";

const handler = async (m, { conn, args = [], participants }) => {
    try {
        let target = null;
        if (m.quoted?.key?.fromMe) {
            return m.reply(`${e} No puedes expulsar al bot respondiendo a sus mensajes.`);
        }

        if (m.quoted?.key?.participant) {
            target = m.quoted.key.participant;
        }

        if (!target && Array.isArray(m.mentions) && m.mentions.length > 0) {
            target = m.mentions[0];
        }
      
        if (!target && args.length > 0) {
            try {
                target = jidNormalizedUser(args[0]);
            } catch {
                const num = args[0].replace(/[^0-9]/g, "");
                if (num) target = `${num}@s.whatsapp.net`;
            }
        }

        if (!target) {
            return m.reply(
`${e} Debes mencionar al usuario, responder su mensaje o escribir su número.

Ejemplo:
.kick @usuario
.kick 50298765432`
            );
        }
        const groupAdmins = participants.filter(p => p.admin === "admin" || p.admin === "superadmin").map(p => p.id);
        if (groupAdmins.includes(target)) {
            return m.reply(`${e} No puedo expulsar a un administrador.`);
        }
        await conn.groupParticipantsUpdate(m.chat, [target], "remove");

        const pretty = target.replace(/@s\.whatsapp\.net$/, "");

    } catch (error) {
        console.error("[KICK ERROR]", error);
        return m.reply("❌ Ocurrió un error al intentar expulsar al usuario.");
    }
};

handler.help = ["kick"];
handler.tags = ["grupo"];
handler.command = ["kick", "expulsar", "ban", "sacar", "b", "bam", "eliminar"];
handler.group = true;
handler.onlyAdmin = true;
handler.botAdmin = true;

export default handler;
