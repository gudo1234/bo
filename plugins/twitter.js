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

        const apiURL = `https://delirius-apiofc.vercel.app/download/twitterdl?url=${encodeURIComponent(args[0])}`;
        const apiResponse = await axios.get(apiURL);
        const res = apiResponse.data;

        const caption = res.caption ? res.caption : `${e} _Video de Twitter (X)_`;

        if (res?.type === "video") {
          await conn.sendFile(m.chat, res.media[0].url, 'video.mp4', caption, m, null, rcanal);
        } else if (res?.type === "image") {
          await conn.sendFile(m.chat, res.media[0].url, 'imagen.jpj', `${e} _Imagen de Twitter (X)_`, m, null, rcanal);
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
