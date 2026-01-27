import fetch from "node-fetch"
import yts from "yt-search"
import sharp from "sharp"

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

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

const safeContentType = async (url) => {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    if (!res.ok) return ''
    return (res.headers.get('content-type') || '').split(';')[0].trim()
  } catch {
    return ''
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
    const type = isAudio ? (sendDoc ? "audio (doc)" : "audio") : (sendDoc ? "video (doc)" : "video")

    const aviso = !docAudio.includes(command) && !docVideo.includes(command) && mins > 20
      ? `\n> ‣ Se enviará como documento por superar 20 minutos.` : ""

    const caption = `╭──── • ────╮
> ✰ *Título:* ${title}
> ♢ *Canal:* ${author?.name}
> ♪ *Duración:* ${duration}
> ♫ *Vistas:* ${views?.toLocaleString()}
> ♪ *Publicado:* ${ago}
> ♬ *Link:* ${url}
╰──── • ────╯

⏳ _Preparando ${type}..._${aviso}
`.trim()

    let thumb = null
    try {
      const res = await safeFetch(thumbnail)
      const buff = res ? Buffer.from(await res.arrayBuffer()) : null
      if (buff) {
        thumb = await sharp(buff).resize(200, 200).jpeg({ quality: 80 }).toBuffer()
      }
    } catch {}

    await conn.sendMessage(m.chat, {
      text: caption,
      footer: textbot,
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channelRD.id,
          newsletterName: channelRD.name,
          serverMessageId: -1,
        },
        externalAdReply: {
          title: '🎧 YOUTUBE EXTRACTOR',
          body: textbot,
          thumbnail: thumb,
          thumbnailUrl: redes,
          sourceUrl: redes,
          mediaType: 1,
        },
      }
    }, { quoted: m })

    let data = null
    let usedApi = ""

    if (isAudio) {
      const sylphyUrl = `https://sylphy.xyz/download/ytmp3?url=${encodeURIComponent(url)}&api_key=sylphy-FBU1gDr`
      const res = await safeFetch(sylphyUrl)
      const json = await safeJson(res)
      if (json?.status && json?.result) {
        data = {
          link: json.result.dl_url,
          title: json.result.title || title
        }
        usedApi = "sylphy"
      }
    } else {
      const danzyUrl = `https://api.danzy.web.id/api/download/ytdl?url=${encodeURIComponent(url)}`
      const res = await safeFetch(danzyUrl)
      const json = await safeJson(res)
      if (json?.status && json?.result?.fileUrl) {
        let link = json.result.fileUrl
        if (!/^https?:\/\//i.test(link)) link = `https://${link}`
        data = { link, title }
        usedApi = "danzy"
      } else {
        const sylphyUrl = `https://sylphy.xyz/download/ytmp4?url=${encodeURIComponent(url)}&q=&api_key=sylphy-FBU1gDr`
        const res2 = await safeFetch(sylphyUrl)
        const json2 = await safeJson(res2)
        if (json2?.status && json2?.result?.url) {
          data = {
            link: json2.result.url,
            title: json2.result.title || title
          }
          usedApi = "sylphy"
        }
      }
    }

    if (usedApi === "danzy") await delay(3000)

if (!data?.link) {
      await m.react("✖️")
      return m.reply(`${e} No se pudo obtener enlace desde ninguna API (todas fallaron).`)
    }

    const fileName = `${data.title}.${isAudio ? "mp3" : "mp4"}`
    const mimetype = isAudio ? "audio/mpeg" : "video/mp4"
    let finalMime = mimetype
    let forceDoc = sendDoc

    // Danzy a veces devuelve mp4 con codecs raros para Android;
    // consultamos el content-type real y, si es necesario, enviamos como documento.
    if (!isAudio && usedApi === "danzy") {
      const ct = await safeContentType(data.link)
      if (ct) finalMime = ct
      if (ct && !/video\/mp4/i.test(ct)) forceDoc = true
    }

    const msg = forceDoc
      ? { document: { url: data.link }, mimetype: finalMime, fileName, jpegThumbnail: thumb }
      : { [isAudio ? "audio" : "video"]: { url: data.link }, mimetype: finalMime, fileName, ptt: false }

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
