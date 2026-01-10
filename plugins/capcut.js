import fetch from "node-fetch"

let handler = async (m, { conn, usedPrefix, args, text }) => {
    const url = args[0]

    if (!url) {
        return m.reply(
`${e} Ingresa una URL de *CapCut* para descargar el video.
Ejemplo:
*${usedPrefix}cc https://www.capcut.com/tv2/ZSPyHAP2c/*`
        )
    }

    const urlRegex = /capcut\.com\/(tv2|template|t)\/[A-Za-z0-9]+/i
    if (!urlRegex.test(url)) {
        return m.reply(`${e} La URL proporcionada no es válida para CapCut`)
    }

    await m.react("🕒")

    try {
        const api = `https://api.deline.web.id/downloader/capcut?url=${encodeURIComponent(url)}`
        const res = await fetch(api, { timeout: 20000 })
        if (!res.ok) throw new Error("API no respondió")

        const json = await res.json()
        if (!json?.status || json?.result?.error) {
            throw new Error("Respuesta inválida")
        }

        const data = json.result
        const medias = data.medias || []

        if (!medias.length) {
            return m.reply(`${e} No se encontraron medios`)
        }

        const best =
            medias.find(v => /HD/i.test(v.quality) && !/Watermark/i.test(v.quality)) ||
            medias.find(v => !/Watermark/i.test(v.quality)) ||
            medias[0]

        const caption =
`🎬 *CapCut*
✦ *Autor:* ${data.author || "Desconocido"}
✦ *Usuario:* ${data.unique_id || "-"}
✦ *Duración:* ${Math.round((data.duration || 0) / 1000)}s`
      await conn.sendFile(m.chat, best.url, 'video.mp4', caption, m, null, rcanal);

        await m.react("✅")

    } catch (err) {
        console.error("CAPCUT ERROR:", err)
        return m.reply(`${e} Error al descargar el video`)
    }
}

handler.help = ["capcut"]
handler.tags = ["descargas"]
handler.command = ["capcut", "cc", "cap"]
handler.group = true

export default handler
