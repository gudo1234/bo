import axios from "axios";

let enviando = false;

let handler = async (m, { conn, args }) => {
    try {
        if (!args || !args[0]) {
            return m.reply(`${e} *Te faltó el link de un tweet de Twitter (X).*`);
        }

        if (enviando) return;
        enviando = true;

        await m.react("🕒");

        // 🔹 Llamada a la API de Nekolabs
        const apiURL = `https://api.nekolabs.web.id/downloader/twitter?url=${encodeURIComponent(args[0])}`;
        const { data } = await axios.get(apiURL);

        if (!data.success || !data.result) {
            return m.reply(`${e} No se pudo obtener información del tweet.`);
        }

        const { title, media } = data.result;

        // 🔹 Si no hay medios, enviar solo el título
        if (!media || media.length === 0) {
            return m.reply(`${e} Tweet sin medios descargables.\n\n📌 Contenido: ${title}`);
        }

        // 🔹 Si hay medios, enviarlos todos
        for (let i = 0; i < media.length; i++) {
            const item = media[i];
            const url = item.url;
            const type = item.type; // "video" o "image"
            const filename = type === "video" ? `video_${i + 1}.mp4` : `imagen_${i + 1}.jpg`;
            const caption = type === "video" ? `${e} ${title}` : `${e} _Imagen de Twitter (X)_`;

            await conn.sendFile(m.chat, url, filename, caption, m);
        }

        await m.react("✅");

    } catch (err) {
        console.error("[TWITTER ERROR]", err);
        await m.reply(`${e} *Error al descargar el tweet.*\n${err.message}`);
        await m.react("❌");

    } finally {
        enviando = false;
    }
};

handler.help = ["twitter"];
handler.tags = ["descargas"];
handler.command = ["twitter","x","xdl","dlx","twdl","tw","twt"];
handler.group = true;

export default handler;
