import fetch from "node-fetch";

const handler = async (m, { conn, args, participants, groupMetadata }) => {
    try {
        const texto = args?.join(" ")?.trim() || groupMetadata?.subject || "everyone";
        const remoteJid = m?.chat;
        if (!remoteJid) return m.reply(`${e} No se pudo obtener el chat del grupo.`);
        const users = participants
            .map(u => u.id)
            .filter(id => id && id !== conn.user.id);
        let thumb;
        try {
            const r = await fetch(icono);
            if (r.ok) thumb = Buffer.from(await r.arrayBuffer());
        } catch {}

        const payload = {
            text: texto,
            mentions: users,
            contextInfo: {
                externalAdReply: {
                    title: "Mensaje para todos",
                    body: texto,
                    mediaType: 1,
                    thumbnail: thumb,
                    thumbnailUrl: redes
                }
            }
        };

        await conn.sendMessage(remoteJid, payload, { quoted: null });

    } catch (e) {
        console.error("[EVERYONE ERROR]", e);
        await m.reply("⚠️ Ocurrió un error al ejecutar el comando.");
    }
};

handler.help = ["everyone"];
handler.tags = ["grupo"];
handler.command = ["everyone", "hide"];
handler.group = true;
handler.onlyAdmin = true;

export default handler;
