import sharp from "sharp";
import { S_WHATSAPP_NET, downloadContentFromMessage } from "@whiskeysockets/baileys";

const handler = async (m, { conn }) => {
    try {
        const q = m.quoted ? m.quoted : m;

        if (!q) return m.reply(`${e} Responde a una imagen para actualizar el icono del bot.`);

        const mimetype = q.msg?.mimetype || q.mimetype || q.message?.imageMessage?.mimetype || "";
        if (!/image/.test(mimetype)) return m.reply(`${e} El mensaje respondido no es una imagen.`);

        let mediaBuffer = null;

        if (typeof q.download === "function") {
            try {
                mediaBuffer = await q.download();
            } catch {
                mediaBuffer = null;
            }
        }

        if (!mediaBuffer) {
            const messageWithMedia = q.msg || q.message || q;
            try {
                const stream = await downloadContentFromMessage(messageWithMedia, "image");
                let tmpBuf = Buffer.alloc(0);
                for await (const chunk of stream) tmpBuf = Buffer.concat([tmpBuf, chunk]);
                mediaBuffer = tmpBuf;
            } catch {
                mediaBuffer = null;
            }
        }

        if (!mediaBuffer) return m.reply(`${e} No pude descargar la imagen.`);

        const metadata = await sharp(mediaBuffer).metadata();
        const width = metadata.width || 720;
        const height = metadata.height || 720;

        const processed = await sharp(mediaBuffer)
            .resize(width > height ? { width: 720 } : { height: 720 })
            .jpeg({ quality: 90 })
            .toBuffer();

        await conn.query({
            tag: "iq",
            attrs: {
                to: S_WHATSAPP_NET,
                target: S_WHATSAPP_NET,
                type: "set",
                xmlns: "w:profile:picture"
            },
            content: [
                {
                    tag: "picture",
                    attrs: { type: "image" },
                    content: processed
                }
            ]
        });

        await m.reply("✅ Foto de perfil del bot actualizada correctamente.");
        await m.react("✅");

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
