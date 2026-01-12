import fetch from "node-fetch";
import {
    generateWAMessageFromContent,
    generateWAMessage,
    delay
} from "@whiskeysockets/baileys";

async function sendAlbumMessage(conn, jid, medias, options = {}) {
    if (!Array.isArray(medias) || medias.length < 2)
        throw new RangeError("Se requieren mínimo 2 imágenes");

    const caption = options.caption || "";
    const wait = !isNaN(options.delay) ? options.delay : 500;

    for (let i = 0; i < medias.length; i++) {
        try {
            const msg = await generateWAMessage(
                jid,
                {
                    image: medias[i],
                    ...(i === 0 ? { caption } : {})
                },
                { upload: conn.waUploadToServer }
            );

            if (options.quoted) {
                msg.message.messageContextInfo = {
                    messageAssociation: {
                        associationType: 1,
                        parentMessageKey: options.quoted.key
                    }
                };
            }

            await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
            await delay(wait);
        } catch (err) {
            console.warn("Error enviando imagen:", err.message);
        }
    }
}

let enviando = false;

let handler = async (m, { conn, args }) => {
    try {
        const query = args.join(" ");
        if (!query) return m.reply(`${e} Ingresa una búsqueda.\nEjemplo: *wallpaper Minecraft*`);

        if (enviando) return;
        enviando = true;

        await m.react("🕒");

        const apiUrl = `https://api.dorratz.com/v2/wallpaper-s?q=${encodeURIComponent(query)}`;
        const res = await (await fetch(apiUrl)).json();

        const lista = res?.result;
        if (!Array.isArray(lista) || lista.length === 0) {
            return m.reply(`✨ No se encontraron imágenes para: *${query}*`);
        }

        const imgs = lista.sort(() => Math.random() - 0.5).slice(0, 10);

        // Descargar imágenes a buffers
        const buffers = [];
        for (const img of imgs) {
            try {
                const r = await fetch(img);
                buffers.push(Buffer.from(await r.arrayBuffer()));
            } catch {
                continue;
            }
        }

        if (buffers.length === 0) {
            return m.reply(`✨ No se pudieron descargar imágenes de: *${query}*`);
        }

        if (buffers.length === 1) {
            // Si solo hay una imagen, también podemos enviarla con generateWAMessage
            await sendAlbumMessage(conn, m.chat, buffers, {
                caption: `✨ *Resultado para:* ${query}`,
                quoted: m
            });
        } else {
            await sendAlbumMessage(conn, m.chat, buffers, {
                caption: `${e} *Wallpapers encontrados*`,
                quoted: m,
                delay: 300
            });
        }

        await m.react("✅");

    } catch (err) {
        console.error(err);
        await m.reply(`${e} ❌ Error al descargar el wallpaper: ${err.message}`);
        await m.react("❌");
    } finally {
        enviando = false;
    }
};

handler.help = ["wallpaper"];
handler.tags = ["descargas"];
handler.command = ["wallpaper","wall","wp"];
handler.group = true;

export default handler;
