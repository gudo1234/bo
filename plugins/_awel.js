let handler = async (m, { conn, participants, chatUpdate }) => {
  try {
    // Solo eventos de grupo
    if (!m.isGroup) return

    const chat = global.db.data.chats[m.chat]
    if (!chat || !chat.welcome) return

    // Detectar evento
    const update = chatUpdate?.participant || chatUpdate?.participants
    const action = chatUpdate?.action

    if (!update || !action) return

    const users = Array.isArray(update) ? update : [update]

    for (const user of users) {
      const tag = '@' + user.split('@')[0]

      // ───── WELCOME ─────
      if (action === 'add') {
        const text = `
👋 *Bienvenido/a al grupo*

🌱 ${tag}
Lee las reglas y disfruta tu estadía 😄
        `.trim()

        await conn.sendMessage(
          m.chat,
          {
            text,
            mentions: [user]
          }
        )
      }

      // ───── BYE ─────
      if (action === 'remove') {
        const text = `
👋 *Adiós*

${tag} salió del grupo.
        `.trim()

        await conn.sendMessage(
          m.chat,
          {
            text,
            mentions: [user]
          }
        )
      }
    }

  } catch (e) {
    console.error('[WELCOME/BYE ERROR]', e)
  }
}

/* 
  Se ejecuta ANTES de comandos
  para captar eventos de grupo
*/
handler.before = true

export default handler
