import fetch from "node-fetch"
import yts from "yt-search"
import sharp from "sharp"
import crypto from "crypto"
import axios from "axios"

/* =========================
   SaveTube Engine
========================= */

const savetube = {
  api: {
    base: "https://media.savetube.me/api",
    info: "/v2/info",
    download: "/download",
    cdn: "/random-cdn"
  },

  headers: {
    accept: "*/*",
    "content-type": "application/json",
    origin: "https://yt.savetube.me",
    referer: "https://yt.savetube.me/",
    "user-agent": "Mozilla/5.0"
  },

  crypto: {
    hexToBuffer: (hex) => Buffer.from(hex.match(/.{1,2}/g).join(""), "hex"),

    decrypt: async (enc) => {
      const keyHex = "C5D58EF67A7584E4A29F6C35BBC4EB12"
      const data = Buffer.from(enc, "base64")
      const iv = data.slice(0, 16)
      const content = data.slice(16)
      const key = savetube.crypto.hexToBuffer(keyHex)

      const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv)
      let decrypted = decipher.update(content)
      decrypted = Buffer.concat([decrypted, decipher.final()])
      return JSON.parse(decrypted.toString())
    }
  },

  youtube: (url) => {
    const patterns = [
      /v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /embed\/([a-zA-Z0-9_-]{11})/
    ]
    for (const p of patterns) {
      const m = url.match(p)
      if (m) return m[1]
    }
    return null
  },

  request: async (endpoint, data = {}, method = "post") => {
    try {
      const url = endpoint.startsWith("http")
        ? endpoint
        : `${savetube.api.base}${endpoint}`

      const { data: response } = await axios({
        method,
        url,
        data: method === "post" ? data : undefined,
        params: method === "get" ? data : undefined,
        headers: savetube.headers
      })

      return { status: true, data: response }
    } catch (e) {
      return { status: false, error: e.message }
    }
  },

  getCDN: async () => {
    const res = await savetube.request(savetube.api.cdn, {}, "get")
    return res.status ? { status: true, data: res.data.cdn } : res
  },

  download: async (url, type = "video") => {
    const id = savetube.youtube(url)
    if (!id) return { status: false, error: "ID inválido" }

    try {
      const cdnRes = await savetube.getCDN()
      if (!cdnRes.status) return cdnRes
      const cdn = cdnRes.data

      const info = await savetube.request(
        `https://${cdn}${savetube.api.info}`,
        { url: `https://www.youtube.com/watch?v=${id}` }
      )
      if (!info.status) return info

      const decrypted = await savetube.crypto.decrypt(info.data.data)

      const dl = await savetube.request(
        `https://${cdn}${savetube.api.download}`,
        {
          id,
          downloadType: type,
          quality: type === "audio" ? "mp3" : "360",
          key: decrypted.key
        }
      )

      if (!dl?.data?.data?.downloadUrl)
        return { status: false, error: "No se pudo obtener el link" }

      return {
        status: true,
        result: {
          download: dl.data.data.downloadUrl,
          title: decrypted.title
        }
      }
    } catch (e) {
      return { status: false, error: e.message }
    }
  }
}

/* =========================
   Utils
========================= */

const safeFetch = async (url) => {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    if (!res.ok) return null
    return res
  } catch {
    return null
  }
}

/* =========================
   Handler
========================= */

const handler = async (m, { conn, text, command, args }) => {
  const docAudio = ['play3', 'ytadoc', 'mp3doc', 'ytmp3doc']
  const docVideo = ['play4', 'ytvdoc', 'mp4doc', 'ytmp4doc']
  const normalAudio = ['play', 'yta', 'mp3', 'ytmp3', 'playaudio']
  const normalVideo = ['play2', 'ytv', 'mp4', 'ytmp4', 'playvid']

  if (!text) return m.reply("❌ Ingresa texto o link de YouTube.")

  await m.react("🕒")

  try {
    const query = args.join(" ")
    const yt = await yts(query)
    const v = yt.videos[0]
    if (!v) return m.reply("❌ No se encontró el video.")

    const { title, thumbnail, timestamp, views, ago, url, author } = v
    const duration = timestamp || "0:00"

    const toSeconds = t => t.split(":").reduce((a, n) => a * 60 + +n, 0)
    const mins = toSeconds(duration) / 60

    const isAudio = [...docAudio, ...normalAudio].includes(command)
    const sendDoc = mins > 20 || docAudio.includes(command) || docVideo.includes(command)

    let thumb = null
    try {
      const res = await safeFetch(thumbnail)
      const buf = res ? Buffer.from(await res.arrayBuffer()) : null
      if (buf) thumb = await sharp(buf).resize(200, 200).jpeg({ quality: 80 }).toBuffer()
    } catch {}

    await conn.sendMessage(m.chat, {
      text: `🎵 *${title}*\n📺 ${author?.name}\n⏱ ${duration}\n👁 ${views.toLocaleString()}\n📅 ${ago}`
    }, { quoted: m })

    const result = await savetube.download(url, isAudio ? "audio" : "video")
    if (!result.status) return m.reply("❌ Error al descargar.")

    const file = result.result.download
    const fileName = `${title}.${isAudio ? "mp3" : "mp4"}`

    const msg = sendDoc
      ? { document: { url: file }, mimetype: isAudio ? "audio/mpeg" : "video/mp4", fileName, jpegThumbnail: thumb }
      : { [isAudio ? "audio" : "video"]: { url: file }, mimetype: isAudio ? "audio/mpeg" : "video/mp4", fileName }

    await conn.sendMessage(m.chat, msg, { quoted: m })
    await m.react("✅")

  } catch (e) {
    console.error(e)
    await m.react("❌")
    m.reply("❌ Error al procesar la descarga.")
  }
}

handler.help = ["play", "play2", "play3", "play4"]
handler.tags = ["descargas"]
handler.command = [
  'play', 'yta', 'mp3', 'ytmp3', 'playaudio',
  'play3', 'ytadoc', 'mp3doc', 'ytmp3doc',
  'play2', 'ytv', 'mp4', 'ytmp4', 'playvid',
  'play4', 'ytvdoc', 'mp4doc', 'ytmp4doc'
]
handler.group = true

export default handler
