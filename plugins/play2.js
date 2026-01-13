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

  if (!args || args.length === 0) {
    const tipo = normalAudio.includes(command)
      ? 'audio'
      : docAudio.includes(command)
      ? 'audio en documento'
      : normalVideo.includes(command)
      ? 'video'
      : 'video en documento';
    return m.reply(`❌ Ingresa texto o enlace de YouTube para descargar el *${tipo}*`);
  }

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

    const sendDoc = mins > 20 || docAudio.includes(command) || docVideo.includes(command);
    const isAudio = [...docAudio, ...normalAudio].includes(command);

    const type = isAudio ? (sendDoc ? "audio (doc)" : "audio") : (sendDoc ? "video (doc)" : "video");
    const aviso = !docAudio.includes(command) && !docVideo.includes(command) && mins > 20
      ? `\n> ‣ Se enviará como documento por superar 20 minutos.` : "";

    const caption = `╭──── • ────╮
> ✰ *Título:* ${title}
> ♢ *Canal:* ${author?.name}
> ♪ *Duración:* ${duration}
> ♫ *Vistas:* ${views?.toLocaleString()}
> ♪ *Publicado:* ${ago}
> ♬ *Link:* ${url}
╰──── • ────╯

⏳ _Preparando ${type}..._${aviso}
`.trim();

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
    const apiUrl = isAudio
      ? `https://api.deline.web.id/downloader/ytmp3?url=${encodeURIComponent(finalUrl)}`
      : `https://api.deline.web.id/downloader/ytmp4?url=${encodeURIComponent(finalUrl)}`;

    const resApi = await safeFetch(apiUrl);
    const jsonApi = await safeJson(resApi);

    if (!jsonApi?.status || !jsonApi?.result) {
      await m.react("✖️");
      return m.reply("❌ La API deline no devolvió un resultado válido.");
    }

    // AUDIO usa dlink, VIDEO usa downloadUrl
    const fileLink = isAudio ? jsonApi.result.dlink : jsonApi.result.downloadUrl;

    if (!fileLink) {
      await m.react("✖️");
      return m.reply("❌ La API deline no devolvió un enlace válido para este video.");
    }

    const fileName = sendDoc ? `${title}.${isAudio ? "mp3" : "mp4"}` : undefined;
    const mimetype = isAudio ? "audio/mpeg" : "video/mp4";

    const msg = sendDoc
      ? { document: { url: fileLink }, mimetype, fileName, jpegThumbnail: thumb }
      : isAudio
        ? { audio: { url: fileLink }, mimetype, ptt: false }
        : { video: { url: fileLink }, mimetype };

    await conn.sendMessage(m.chat, msg, { quoted: m });
    await m.react("🎧");

  } catch (err) {
    console.error(err);
    await m.react("✖️");
    return m.reply("❌ Ocurrió un error inesperado al procesar la descarga.");
  }
};

handler.command = [
  'play', 'yta', 'mp3', 'ytmp3', 'playaudio',
  'play3', 'ytadoc', 'mp3doc', 'ytmp3doc',
  'play2', 'ytv', 'mp4', 'ytmp4', 'playvid',
  'play4', 'ytvdoc', 'mp4doc', 'ytmp4doc'
];
handler.group = true;
export default handler;
