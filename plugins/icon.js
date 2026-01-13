import sharp from "sharp";
import { updateProfilePicture } from "@whiskeysockets/baileys";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

const handler = async (m, { conn }) => {
    try {
        let q = null;

        if (m.quoted) {
            q = m.quoted;
        } else if (m.message?.imageMessage || /image/.test(m.mimetype || "")) {
            q = m;
        } else {
            const ctxQuoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (ctxQuoted && ctxQuoted.imageMessage) {
                q = { ...m, message: ctxQuoted };
            } else {
                return m.reply("❌ Envía o responde a una imagen para actualizar el icono del bot.");
            }
        }

        const mimetype = q.msg?.mimetype || q.mimetype || q.message?.imageMessage?.mimetype || "";
        if (!/image/.test(mimetype)) return m.reply("❌ El mensaje respondido no es una imagen.");

        let mediaBuffer = null;
        if (typeof q.download === "function") {
            try {
                mediaBuffer = await q.download();
            } catch {}
        }

        if (!mediaBuffer) {
            const messageWithMedia = q.msg || q.message || q;
            const stream = await downloadContentFromMessage(messageWithMedia, "image");
            let tmpBuf = Buffer.alloc(0);
            for await (const chunk of stream) tmpBuf = Buffer.concat([tmpBuf, chunk]);
            mediaBuffer = tmpBuf;
        }

        if (!mediaBuffer) return m.reply("❌ No pude descargar la imagen.");

        const metadata = await sharp(mediaBuffer).metadata();
        const width = metadata.width || 720;
        const height = metadata.height || 720;

        const processed = await sharp(mediaBuffer)
            .resize(width > height ? { width: 720 } : { height: 720 })
            .jpeg({ quality: 90 })
            .toBuffer();

        await updateProfilePicture(conn, conn.user.jid, processed);

        await m.react("✅");
        await m.reply("✅ Foto de perfil del bot actualizada correctamente.");

    } catch (err) {
        console.error("[ICONBOT ERROR]", err);
        await m.react("❌");
        return m.reply("❌ Ocurrió un error procesando la imagen.");
    }
};

handler.help = ["icon"];
handler.tags = ["owner"];
handler.command = ["icon", "setppbot", "iconbot"];
handler.owner = true;

export default handler;
