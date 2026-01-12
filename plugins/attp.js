import fetch from "node-fetch";
import { sticker } from "../lib/sticker.js"; // tu función de sticker

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const text = args.join(" ");
    if (!text) return m.reply(`${e} Ingresa un texto para crear el sticker animado.`);
    if (text.length > 25) {
        return m.reply(`${e} El texto no puede tener más de 25 caracteres. Actualmente tiene ${text.length}.`);
    }

    await m.react("🕒");

    try {
        // Llamada a la API ATTP
        const apiUrl = `https://api.deline.web.id/maker/attp?text=${encodeURIComponent(text)}`;
        const res = await fetch(apiUrl);

        if (!res.ok) throw new Error("API no respondió correctamente");

        const stickerBuffer = Buffer.from(await res.arrayBuffer());

        // Generar sticker con el nombre del usuario
        let stiker = await sticker(stickerBuffer, false, `${m.pushName}`);

        if (!stiker) throw new Error("No se pudo crear el sticker");

        await conn.sendMessage(
            m.chat,
            {
                sticker: stiker,
                animated: true
            },
            {
                quoted: m,
                contextInfo: {
                    externalAdReply: {
                        showAdAttribution: false,
                        title: `${m.pushName}`, // Nombre del usuario
                        body: textbot,          // opcional: cuerpo del bot
                        mediaType: 1,
                        sourceUrl: redes,
                        thumbnail: await (await fetch(icono)).buffer(),
                        thumbnailUrl: redes
                    }
                }
            }
        );

        await m.react("✅");

    } catch (err) {
        console.error("ATTP STICKER ERROR:", err);
        await m.react("❌");
        return m.reply(`${e} Error al crear el sticker: ${err.message}`);
    }
};

handler.help = ["attp"];
handler.tags = ["maker"];
handler.command = ["attp", "attpsticker"];
handler.group = true;

export default handler;
