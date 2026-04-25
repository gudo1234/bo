import fetch from 'node-fetch'
import { URL } from 'url'

let handler = async (m, { text, conn, command, usedPrefix }) => {

  if (!/^https?:\/\//.test(text)) {
    return conn.reply(m.chat,
      `📎 Ingresa una URL válida que contenga videos o contenido multimedia.\n\n> Ejemplo:\n*${usedPrefix + command}* https://qu-leo.pro/1052-2/`,
      m
    )
  }

  await m.react('🕒')

  try {
    const res = await fetch(text)
    const contentType = res.headers.get('content-type') || ''

    // 📦 Si la URL ya es directa (video, imagen, audio)
    if (/image|audio|video/i.test(contentType)) {
      const type = contentType.split('/')[0]

      if (type === 'image') {
        return conn.sendMessage(m.chat, {
          image: { url: text },
          caption: text
        }, { quoted: m })
      }

      if (type === 'audio') {
        return conn.sendMessage(m.chat, {
          audio: { url: text },
          mimetype: contentType
        }, { quoted: m })
      }

      if (type === 'video') {
        return conn.sendMessage(m.chat, {
          video: { url: text },
          mimetype: contentType,
          caption: text
        }, { quoted: m })
      }
    }

    const html = await res.text()

    // 🔞 Detectar páginas adultas
    const adultSites = [
      'xvideos', 'xnxx', 'pornhub', 'redtube', 'spankbang',
      'youjizz', 'youporn', 'tube8', 'tnaflix', 'eporner',
      'jav', 'rule34', 'hclips', 'beeg'
    ]
    const isAdult = adultSites.some(site => text.includes(site))

    // 📌 Pinterest
    let pinterestMatch = text.match(/https?:\/\/(www\.)?pinterest\.[a-z]+\/pin\/(\d+)/)

    if (pinterestMatch) {
      const pinId = pinterestMatch[2]
      try {
        const pinApi = `https://api.pinterest.com/v3/pidgets/pins/info/?pin_ids=${pinId}`
        const pinRes = await fetch(pinApi)
        const pinJson = await pinRes.json()
        const pinData = pinJson.data[pinId]

        if (pinData?.videos?.video_list) {
          const videoKeys = Object.keys(pinData.videos.video_list)

          for (let key of videoKeys) {
            let videoUrl = pinData.videos.video_list[key].url
            await conn.sendMessage(m.chat, {
              video: { url: videoUrl },
              caption: `📌 Pinterest`
            }, { quoted: m })
          }

        } else if (pinData?.images?.orig?.url) {
          await conn.sendMessage(m.chat, {
            image: { url: pinData.images.orig.url },
            caption: `📌 Pinterest`
          }, { quoted: m })
        }

      } catch {
        await conn.sendMessage(m.chat, { text: `📌 Pinterest: ${text}` }, { quoted: m })
      }
    }

    // 🐦 Twitter/X
    let twitterMatch = text.match(/https?:\/\/(www\.)?twitter\.com\/[^\/]+\/status\/\d+/)
    if (twitterMatch) {
      await conn.sendMessage(m.chat, {
        text: `🐦 Twitter/X: ${twitterMatch[0]}`
      }, { quoted: m })
    }

    // 🔎 Buscar archivos en HTML
    const regexAll = /(https?:\/\/[^\s"'<>]+?\.(jpg|jpeg|png|gif|webp|svg|mp3|m4a|ogg|wav|mp4|webm|mov|avi|mkv)(\?[^\s"'<>]*)?)/gi
    const foundLinks = [...html.matchAll(regexAll)].map(v => v[0])

    const tagSrcRegex = /<(img|video|audio|source)[^>]+src=["']([^"']+)["']/gi
    const srcMatches = [...html.matchAll(tagSrcRegex)].map(v => v[2])

    const iframeRegex = /<iframe[^>]+src=["']([^"']+)["']/gi
    const iframeMatches = [...html.matchAll(iframeRegex)].map(v => v[1])

    const allCandidates = [...foundLinks, ...srcMatches, ...iframeMatches].filter(Boolean)

    // 📦 Guardar múltiples resultados
    let videos = []
    let images = []
    let audios = []

    for (let url of allCandidates) {
      try {
        let fullUrl = url.startsWith('http') ? url : new URL(url, text).href

        if (/\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(fullUrl)) {
          videos.push(fullUrl)
        } else if (/\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(fullUrl)) {
          images.push(fullUrl)
        } else if (/\.(mp3|m4a|ogg|wav)(\?|$)/i.test(fullUrl)) {
          audios.push(fullUrl)
        }
      } catch {}
    }

    // 🧹 Quitar duplicados
    videos = [...new Set(videos)]
    images = [...new Set(images)]
    audios = [...new Set(audios)]

    // 🚀 Envío múltiple
    if (videos.length) {
      for (let vid of videos) {
        if (isAdult) {
          await conn.sendMessage(m.chat, {
            document: { url: vid },
            fileName: 'video_adulto.mp4',
            mimetype: 'video/mp4',
            caption: text
          }, { quoted: m })
        } else {
          await conn.sendMessage(m.chat, {
            video: { url: vid },
            mimetype: 'video/mp4',
            caption: vid
          }, { quoted: m })
        }
      }

    } else if (images.length) {
      for (let img of images) {
        await conn.sendMessage(m.chat, {
          image: { url: img },
          caption: img
        }, { quoted: m })
      }

    } else if (audios.length) {
      for (let aud of audios) {
        await conn.sendMessage(m.chat, {
          audio: { url: aud },
          mimetype: 'audio/mpeg'
        }, { quoted: m })
      }

    } else {
      await conn.sendMessage(m.chat, {
        text: html.slice(0, 4000)
      }, { quoted: m })
    }

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply(`Error: ${e.message}`)
  }
}

handler.help = ["fetch"]
handler.tags = ["buscador"]
handler.command = ['vi']
handler.group = true

export default handler
