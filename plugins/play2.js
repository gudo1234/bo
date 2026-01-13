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

const handler = async (m, { conn, args, command }) => {
  const docAudio = ['play3', 'ytadoc', 'mp3doc', 'ytmp3doc'];
  const docVideo = ['play4', 'ytvdoc', 'mp4doc', 'ytmp4doc'];
  const normalAudio = ['play', 'yta', 'mp3', 'ytmp3', 'playaudio'];
  const normalVideo = ['play2', 'ytv', 'mp4', 'ytmp4', 'playvid'];

  if (!args || args.length === 0)
    return m.reply("❌ Ingresa texto o enlace de YouTube para descargar.");

  await m.react("🕒");

  try {
    const input = args.join(" ").trim();

    // -------------------------
    // Detectar URL o búsqueda
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

    const sendDoc = mins > 20 || docVideo.includes(command);
    const isAudio = [...docAudio, ...normalAudio].includes(command);

    const type = isAudio ? (sendDoc ? "audio (doc)" : "audio") : (sendDoc ? "video (doc)" : "video");

    const caption = `╭──── • ────╮
> ✰ *Título:* ${title}
> ♢ *Canal:* ${author?.name}
> ♪ *Duración:* ${duration}
> ♫ *Vistas:* ${views?.toLocaleString()}
> ♪ *Publicado:* ${ago}
> ♬ *Link:* ${url}
╰──── • ────╯

⏳ _Preparando ${type}..._`.trim();

    // -------------------------
    // Thumbnail
    // -------------------------
    let thumb = null;
    try {
      const res = await safeFetch(thumbnail);
      const buff = res ? Buffer.from(await res.arrayBuffer()) : null;
      if (buff) thumb = await sharp(buff).resize(200, 200).jpeg({ quality: 80 }).toBuffer();
    } catch {}

    await conn.sendMessage(m.chat, { text: caption }, { quoted: m });

    // -------------------------
    // API Deline
    // -------------------------
    const apiUrl = isAudio
      ? `https://api.deline.web.id/downloader/ytmp3?url=${encodeURIComponent(finalUrl)}`
      : `https://api.deline.web.id/downloader/ytmp4?url=${encodeURIComponent(finalUrl)}`;

    const resApi = await safeFetch(apiUrl);
    const jsonApi = await safeJson(resApi);

    if (!jsonApi?.status || !jsonApi?.result) {
      await m.react("✖️");
      return m.reply("❌ La API deline no devolvió un enlace válido.");
    }

    let fileLink = isAudio ? jsonApi.result.dlink : jsonApi.result.downloadUrl;
    let fileName = isAudio
      ? `${jsonApi.result.youtube?.title || title}.mp3`
      : `${jsonApi.result.youtube?.title || title}.mp4`;

    // -------------------------
    // Enviar archivo
    // -------------------------
    const msg = sendDoc
      ? { document: { url: fileLink }, mimetype: isAudio ? "audio/mpeg" : "video/mp4", fileName, jpegThumbnail: thumb }
      : { [isAudio ? "audio" : "video"]: { url: fileLink }, mimetype: isAudio ? "audio/mpeg" : "video/mp4", ptt: false };

    await conn.sendMessage(m.chat, msg, { quoted: m });

    await m.react("🎧");

  } catch (err) {
    console.error(err);
    await m.react("✖️");
    return m.reply("❌ Ocurrió un error al procesar la descarga.");
  }
};

handler.command = [
  'play', 'yta', 'mp3', 'ytmp3', 'playaudio',
  'play2', 'ytv', 'mp4', 'ytmp4', 'playvid',
  'video' // comando directo
];
handler.group = true;
export default handler;
