export default function groupParticipants(conn) {
  conn.ev.on('group-participants.update', async (update) => {
    try {
      const { id, participants, action } = update

      const chat = global.db.data.chats[id]
      if (!chat || !chat.welcome) return

      for (const user of participants) {
        const tag = '@' + user.split('@')[0]

        // ───── ADD ─────
        if (action === 'add') {
          await conn.sendMessage(id, {
            text: `👋 *Bienvenido/a*\n\n${tag}`,
            mentions: [user]
          })
        }

        // ───── REMOVE ─────
        if (action === 'remove') {
          await conn.sendMessage(id, {
            text: `👋 *Adiós*\n\n${tag}`,
            mentions: [user]
          })
        }
      }

    } catch (e) {
      console.error('[GROUP PARTICIPANTS ERROR]', e)
    }
  })
}
