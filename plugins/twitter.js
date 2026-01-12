import axios from "axios";

let enviando = false;

let handler = async (m, { conn, args }) => {
    try {
        if (!args || !args[0]) {
            return m.reply(`${e} *Te faltó el link de una imagen/video de Twitter (X).*`);
        }

        if (enviando) return;
        enviando = true;

        await m.react("🕒");

        // API Twitter v2
        const apiURL = `https://api.delirius.store/download/twitterv2?url=${encodeURIComponent(args[0])}`;
        const apiResponse = await axios.get(apiURL);
        const res = apiResponse.data;

        if (!res.status || !res.data || !res.data.media || res.data.media.length === 0) {
            return m.reply(`${e} 🌊 Este tweet no contiene videos o imágenes descargables.`);
        }

        const mediaItem = res.data.media[0]; // Tomamos el primer media
        const caption = res.data.description || `${e} _Media de Twitter (X)_`;

        if (mediaItem.type === "video") {
            // Elegimos el video de mayor calidad
            const bestVideo = mediaItem.videos.sort((a, b) => b.bitrate - a.bitrate)[0];

            await conn.sendFile(
                m.chat,
                bestVideo.url,
                'video.mp4',
                caption,
                m,
                null,
                rcanal
            );
        } else if (mediaItem.type === "image") {
            await conn.sendFile(
                m.chat,
                mediaItem.cover,
                'image.jpg',
                caption,
                m,
                null,
                rcanal
            );
        }

        await m.react("✅");

    } catch (err) {
        console.error(err);
        await m.reply(`${e} *Error al descargar el archivo.*`);
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
