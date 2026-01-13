import fetch from "node-fetch"
import ytSearch from "yt-search"
import sharp from "sharp"
import got from "got"
import { createDecipheriv } from "node:crypto"

/* =========================
   SaveTube Utils
========================= */
const audioQualities = [92, 128, 256, 320]

function decode(enc) {
  const secret_key = "C5D58EF67A7584E4A29F6C35BBC4EB12"
  const data = Buffer.from(enc, "base64")
  const iv = data.slice(0, 16)
  const content = data.slice(16)
  const key = Buffer.from(secret_key, "hex")
  const decipher = createDecipheriv("aes-128-cbc", key, iv)
  return JSON.parse(Buffer.concat([decipher.update(content), decipher.final()]).toString())
}

async function savetube(link, quality, type) {
  try {
    const cdnRes = await got("https://media.savetube.me/api/random-cdn", { responseType: "json", timeout: { request: 120000 } })
    const cdn = cdnRes.body?.cdn
    if (!cdn) throw new Error("No CDN encontrado")

    const infoRes = await got.post(`https://${cdn}/v2/info`, {
      json: { url: link },
      headers: { "User-Agent": "Mozilla/5.0" },
      responseType: "json",
      timeout: { request: 120000 }
    })

    const info = decode(infoRes.body?.data)

    const downloadRes = await got.post(`https://${cdn}/download`, {
      json: { downloadType: type, quality: `${quality}`, key: info.key },
      headers: { "Content-Type": "application/json" },
      responseType: "json",
      timeout: { request: 120000 }
    })

    const url = downloadRes.body?.data?.downloadUrl
    if (!url) throw new Error("No se pudo obtener URL de descarga")

    const filename = type === "audio" ? `${info.title} (${quality}kbps).mp3` : `${info.title}.mp4`
    return { url, filename, info }
  } catch (err) {
    return { error: err.message }
  }
}

async function ytmp3(link, quality = 128) {
  const q = audioQualities.includes(quality) ? quality : 128
  const data = await savetube(link, q, "audio")
  if (!data.url) return { status: false, message: data.error || "Error desconocido" }
  return { status: true, data }
}

async function ytmp4(link) {
  const data = await savetube(link, "360", "video")
  if (!data.url) return { status: false, message: data.error || "Error desconocido" }
  return { status: true, data }
}

/* =========================
   Handler
========================= */
const handler = async (m, { conn, command, args }) => {
  const docAudio = ['play3', 'ytadoc', 'mp3doc', 'ytmp3doc']
  const docVideo = ['play4', 'ytvdoc', 'mp4doc', 'ytmp4doc']
  const normalAudio = ['play', 'yta', 'mp3', 'ytmp3', 'playaudio']
  const normalVideo = ['play2', 'ytv', 'mp4', 'ytmp4', 'playvid']

  if (!args.length) return m.reply("❌ Ingresa texto o enlace de YouTube")

  const query = args.join(" ")
  await m.react("🕒")

  // Detecta URL o busca
  let url, video
  const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  if (ytRegex.test(query)) {
    const id = query.match(ytRegex)[1]
    url = `https://www.youtube.com/watch?v=${id}`
    const searchRes = await ytSearch({ videoId: id })
    video = searchRes?.videos?.[0]
  } else {
    const results = await ytSearch(query)
    video = results?.videos?.[0]
    if (!video) return m.reply("❌ No encontré resultados")
    url = video.url
  }

  const { title, thumbnail, timestamp, views, ago, author } = video
  const duration = timestamp || "0:00"
  const toSeconds = t => t.split(":").reduce((a,n)=>a*60+ +n,0)
  const mins = toSeconds(duration)/60

  const isAudio = [...docAudio,...normalAudio].includes(command)
  const sendDoc = mins > 20 || docAudio.includes(command) || docVideo.includes(command)

  // Thumbnail
  let thumb = null
  try {
    const r = await fetch(video.thumbnail)
    const buf = Buffer.from(await r.arrayBuffer())
    thumb = await sharp(buf).resize(200,200).jpeg({quality:80}).toBuffer()
  } catch {}

  // Info
  const infoText = `🎬 *${title}*\n📺 ${author?.name}\n⏱ ${duration}\n👁 ${views.toLocaleString()}\n📅 ${ago}`
  await conn.sendMessage(m.chat, { text: infoText }, { quoted: m })

  // Descargar
  let result
  if (isAudio) result = await ytmp3(url, 128)
  else result = await ytmp4(url)

  if (!result.status) return m.reply("❌ " + result.message)

  const file = result.data.url
  const fileName = result.data.filename

  const msg = sendDoc
    ? { document: { url: file }, mimetype: isAudio?"audio/mpeg":"video/mp4", fileName, jpegThumbnail: thumb }
    : { [isAudio?"audio":"video"]: { url: file }, mimetype: isAudio?"audio/mpeg":"video/mp4", fileName }

  await conn.sendMessage(m.chat, msg, { quoted:m })
  await m.react("✅")
}

handler.help = ["play","play2","play3","play4"]
handler.tags = ["descargas"]
handler.command = [
  'play','yta','mp3','ytmp3','playaudio',
  'play3','ytadoc','mp3doc','ytmp3doc',
  'play2','ytv','mp4','ytmp4','playvid',
  'play4','ytvdoc','mp4doc','ytmp4doc'
]
handler.group = true
export default handler
