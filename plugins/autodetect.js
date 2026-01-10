let WAMessageStubType = (await import('@whiskeysockets/baileys')).default

let handler = m => m

handler.before = async function (m, { conn }) {
  try {
    if (!m?.messageStubType || !m?.isGroup) return

    const chat = global?.db?.data?.chats?.[m.chat] || {}
    if (!chat.detect) return

    const safeStr = v => (typeof v === 'string' ? v : '')
    const first = (s, sep='@') => safeStr(s).split(sep)[0]

    const senderJid =
      m?.sender ||
      m?.key?.participant ||
      m?.participant ||
      m?.key?.remoteJid ||
      ''

    const usuario = senderJid ? `@${first(senderJid)}` : '@usuario'

    const p0 = safeStr(m?.messageStubParameters?.[0])

    const admingp = `🎯 ${p0 ? `@${first(p0)}` : '@usuario'} ahora es admin del grupo.\n\n> ✧ Acción hecha por:\n> » ${usuario}`
    const noadmingp = `🏮 ${p0 ? `@${first(p0)}` : '@usuario'} deja de ser admin del grupo.\n\n> ✧ Acción hecha por:\n> » ${usuario}`

    switch (m.messageStubType) {

      // Dar admin
      case 29: {
        const ms = Array.from(new Set([senderJid, p0].filter(Boolean)))
        await conn.sendMessage(
          m.chat,
          { text: admingp, mentions: ms },
          { quoted: null }
        )
        break
      }

      // Quitar admin
      case 30: {
        const ms = Array.from(new Set([senderJid, p0].filter(Boolean)))
        await conn.sendMessage(
          m.chat,
          { text: noadmingp, mentions: ms },
          { quoted: null }
        )
        break
      }

      default:
        return
    }

  } catch (err) {
    console.error('[_autodetect.before] error:', err?.message, { stub: m?.messageStubType })
  }
}

export default handler
