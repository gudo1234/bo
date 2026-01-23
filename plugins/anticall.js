export async function all(m, { conn, isOwner, isROwner }) {
  if (conn._antiCallInstalled) return
  conn._antiCallInstalled = true

  conn.ev.on('call', async (calls) => {
    for (const call of calls) {
      if (call.status !== 'offer') continue

      const jid = call.from
      if (!jid) continue

      let bot = global.db.data.settings[conn.user.jid] || {}
      //if (!bot.antiCall) return
     // if (isOwner || isROwner) return

      try {
        await conn.sendMessage(jid, {
          text: `*No se permiten llamadas a la Bot*\n\nHas sido bloqueado automáticamente.`
        })
        await conn.rejectCall(call.id, call.from)
        await conn.updateBlockStatus(jid, 'block')
      } catch (e) {
        console.error('Error AntiCall:', e)
      }
    }
  })
}
