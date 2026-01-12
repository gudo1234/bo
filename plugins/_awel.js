export const disabled = false

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.isGroup) return

  const chat = global.db.data.chats[m.chat]
  if (!chat || !chat.welcome) return

  // 27 = ADD | 32 = LEAVE
  if (![27, 32].includes(m.messageStubType)) return

  const userJid = m.messageStubParameters?.[0]
  if (!userJid) return

  const user = userJid.split('@')[0]
  const groupName = groupMetadata?.subject || 'el grupo'

  // 🟢 BIENVENIDA
  if (m.messageStubType === 27) {
    await conn.sendMessage(m.chat, {
      text:
`👋 *Bienvenido/a*

@${user}
Bienvenido a *${groupName}*
Lee las reglas y disfruta 😄`,
      mentions: [userJid]
    })
  }

  // 🔴 DESPEDIDA
  if (m.messageStubType === 32) {
    await conn.sendMessage(m.chat, {
      text:
`👋 *Adiós*

@${user}
Salió de *${groupName}*`,
      mentions: [userJid]
    })
  }
}
