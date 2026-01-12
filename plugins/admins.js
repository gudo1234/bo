const handler = async (m, { conn, participants, groupMetadata, args }) => {
  const pp =
    await conn.profilePictureUrl(m.chat, 'image').catch(() => null) || icono

  const groupAdmins = participants.filter(p => p.admin)
  if (!groupAdmins.length) return m.reply('❌ No se encontraron administradores.')

  const admins = groupAdmins.map(v => v.id)

  const listAdmin = groupAdmins
    .map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`)
    .join('\n')

  const pesan = args.join(' ') || '—'
  const oi = `» ${pesan}`

  const infoText = `${e} *Admins del grupo:*

${listAdmin}

> Mensaje: ${oi}

${e} Evita usar este comando con otras intenciones o serás *eliminado* o *baneado* del Bot.`.trim()

  const thumbBuffer = pp
    ? await (await fetch(pp)).buffer().catch(() => null)
    : null

  await conn.sendMessage(
    m.chat,
    {
      text: infoText,
      mentions: admins,
      contextInfo: {
        externalAdReply: {
          title: groupMetadata.subject || 'Administradores',
          body: textbot,
          thumbnailUrl: redes,
          thumbnail: thumbBuffer || undefined,
          sourceUrl: redes,
          mediaType: 1
        }
      }
    },
    { quoted: m }
  )
}

handler.help = ['admins']
handler.tags = ['grupo']
handler.command = ['admins', '@admins', 'dmins']
handler.group = true

export default handler
