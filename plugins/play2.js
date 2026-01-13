import fetch from "node-fetch";
import yts from "yt-search";
import sharp from "sharp";

const safeFetch = async (url, options = {}) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) return null;
    return response;
  } catch {
    return null;
  }
};

const safeJson = async (res) => {
  try {
    return res ? await res.json() : null;
  } catch {
    return null;
  }
};

const handler = async (m, { conn, args }) => {
  if (!args || args.length === 0) 
    return m.reply("❌ Ingresa texto o enlace de YouTube para descargar el video.");

  await m.react("🕒");

  try {
    const input = args.join(" ").trim();

    // -------------------------
    // DETECTAR URL Y BUSCAR VIDEO
    // -------------------------
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    const match = input.match(ytRegex);

    let finalUrl = "";
    let videoInfo = null;

    if (match) {
      const id = match[1];
      finalUrl = `https://youtube.com/watch?v=${id}`;
      const search = await yts(finalUrl);
      videoInfo = search?.videos?.find(v => v.videoId === id);
    } else {
      const search = await yts(input);
      if (!search?.videos?.length) {
        await m.react("✖️");
        return m.reply("❌ No encontré resultados.");
      }
      videoInfo = search.videos[0];
      finalUrl = videoInfo.url;
    }

    if (!videoInfo) {
      await m.react("✖️");
      return m.reply("❌ No se encontró el video.");
    }

    const { title, thumbnail, timestamp, views, ago, url, author } = videoInfo;
    const duration = timestamp || "0:00";

    const toSeconds = t => t.split(":").reduce((a, n) => a * 60 + +n, 0);
    const mins = toSeconds(duration) / 60;

    const sendDoc = mins > 20; // videos >20 min como documento

    const caption = `╭──── • ────╮
> ✰ *Título:* ${title}
> ♢ *Canal:* ${author?.name}
> ♪ *Duración:* ${duration}
> ♫ *Vistas:* ${views?.toLocaleString()}
> ♪ *Publicado:* ${ago}
> ♬ *Link:* ${url}
╰──── • ────╯

⏳ _Preparando video${sendDoc ? " como documento..." : "..."}_`.trim();

    // -------------------------------
    // THUMBNAIL
    // -------------------------------
    let thumb = null;
    try {
      const res = await safeFetch(thumbnail);
      const buff = res ? Buffer.from(await res.arrayBuffer()) : null;
      if (buff) thumb = await sharp(buff).resize(200, 200).jpeg({ quality: 80 }).toBuffer();
    } catch {}

    // -------------------------------
    // ENVIAR PREVIEW
    // -------------------------------
    await conn.sendMessage(m.chat, { text: caption }, { quoted: m });

    // -------------------------------
    // API DELINE
    // -------------------------------
    const apiUrl = `https://api.deline.web.id/downloader/ytmp4?url=${encodeURIComponent(finalUrl)}`;

    const resApi = await safeFetch(apiUrl);
    const jsonApi = await safeJson(resApi);

    if (!jsonApi?.status || !jsonApi?.result?.downloadUrl) {
      await m.react("✖️");
      return m.reply("❌ La API deline no devolvió un enlace válido.");
    }

    const fileLink = jsonApi.result.downloadUrl;
    const fileName = sendDoc ? `${title}.mp4` : undefined;

    const msg = sendDoc
      ? { document: { url: fileLink }, mimetype: "video/mp4", fileName, jpegThumbnail: thumb }
      : { video: { url: fileLink }, mimetype: "video/mp4" };

    await conn.sendMessage(m.chat, msg, { quoted: m });
    await m.react("🎬");

  } catch (err) {
    console.error(err);
    await m.react("✖️");
    return m.reply("❌ Ocurrió un error al procesar la descarga.");
  }
};

handler.command = ['video'];
handler.group = true;
export default handler;
