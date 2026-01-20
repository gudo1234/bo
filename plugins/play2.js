import fetch from "node-fetch"
import yts from "yt-search"
import sharp from "sharp"

const safeFetch = async (url, options = {}) => {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timeout)

    if (!response.ok) return null
    return response
  } catch {
    return null
  }
}

const safeJson = async (res) => {
  try {
    return res ? await res.json() : null
  } catch {
    return null
  }
}

const handler = async (m, { conn, text, usedPrefix, command, args }) => {

  const docAudio = ['play3', 'ytadoc', 'mp3doc', 'ytmp3doc']
  const docVideo = ['play4', 'ytvdoc', 'mp4doc', 'ytmp4doc']
  const normalAudio = ['play', 'yta', 'mp3', 'ytmp3', 'playaudio']
  const normalVideo = ['play2', 'ytv', 'mp4', 'ytmp4', 'playvid']

  if (!text) {
    const tipo = normalAudio.includes(command)
      ? 'audio'
      : docAudio.includes(command)
      ? 'audio en documento'
      : normalVideo.includes(command)
      ? 'video'
      : 'video en documento'

    return m.reply(`${e} Ingresa _texto_ o _enlace_ de YouTube para descargar el *${tipo}.*`)
  }

  await m.react("🕒")

  try {
    const query = args.join(" ")
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const ytMatch = query.match(ytRegex)
    const search = ytMatch ? `https://youtube.com/watch?v=${ytMatch[1]}` : query

    const yt = await yts(search).catch(() => null)
    const v = ytMatch ? yt?.videos?.find(x => x.videoId === ytMatch[1]) : yt?.videos?.[0]
    if (!v) {
      await m.react("✖️")
      return m.reply("❌ No se encontró el video.")
    }

    const { title, thumbnail, timestamp, views, ago, url, author } = v
    const duration = timestamp || "0:00"

    const toSeconds = t => t.split(":").reduce((a, n) => a * 60 + +n, 0)
    const mins = toSeconds(duration) / 60

    const sendDoc = mins > 20 || docAudio.includes(command) || docVideo.includes(command)
    const isAudio = [...docAudio, ...normalAudio].includes(command)

    const caption = `╭──── • ────╮
> ✰ *Título:* ${title}
> ♢ *Canal:* ${author?.name}
> ♪ *Duración:* ${duration}
> ♫ *Vistas:* ${views?.toLocaleString()}
> ♪ *Publicado:* ${ago}
> ♬ *Link:* ${url}
╰──── • ────╯

⏳ _Preparando descarga..._
`.trim()

    let thumb = null
    try {
      const res = await safeFetch(thumbnail)
      const buff = res ? Buffer.from(await res.arrayBuffer()) : null
      if (buff) {
        thumb = await sharp(buff).resize(200, 200).jpeg({ quality: 80 }).toBuffer()
      }
    } catch {}

    await conn.sendMessage(m.chat, { text: caption }, { quoted: m })

    const sylphyUrl = isAudio
      ? `https://sylphy.xyz/download/ytmp3?url=${encodeURIComponent(url)}&api_key=sylphy-FBU1gDr`
      : `https://sylphy.xyz/download/ytmp4?url=${encodeURIComponent(url)}&q=&api_key=sylphy-FBU1gDr`

    const res = await safeFetch(sylphyUrl)
    const json = await safeJson(res)

    if (!json?.status || !json?.result) throw 0

    const data = {
      link: isAudio ? json.result.dl_url : json.result.url,
      title: json.result.title || title
    }

    const fileName = `${data.title}.${isAudio ? "mp3" : "mp4"}`
    const mimetype = isAudio ? "audio/mpeg" : "video/mp4"

    const msg = sendDoc
      ? {
          document: { url: data.link },
          mimetype,
          fileName,
          jpegThumbnail: thumb
        }
      : isAudio
      ? {
          audio: { url: data.link },
          mimetype,
          fileName,
          ptt: false
        }
      : {
          video: {
            url: data.link,
            headers: {
              "User-Agent": "Mozilla/5.0",
              "Accept": "video/mp4",
              "Accept-Encoding": "identity"
            }
          },
          mimetype,
          fileName
        }

    await conn.sendMessage(m.chat, msg, { quoted: m })
    await m.react("✨")

  } catch {
    return m.reply(`${e} No se pudo procesar la descarga, intenta de nuevo.`)
  }
}

handler.command = [
  'play', 'yta', 'mp3', 'ytmp3', 'playaudio',
  'play3', 'ytadoc', 'mp3doc', 'ytmp3doc',
  'play2', 'ytv', 'mp4', 'ytmp4', 'playvid',
  'play4', 'ytvdoc', 'mp4doc', 'ytmp4doc'
]
handler.group = true
export default handler
