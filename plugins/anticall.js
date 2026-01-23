export async function all(m, { conn, isOwner, isROwner }) {
  // evitar múltiples registros
  if (conn._antiCallLoaded) return
  conn._antiCallLoaded = true

  conn.ev.on('call', async (calls) => {
    for (const call of calls) {
      try {
        if (call.status !== 'offer') continue

        const chat = call.from

        // no afectar owners (comentado si luego quieres)
        // if (isOwner || isROwner) return

        // mensaje al usuario
        await conn.sendMessage(chat, {
          text: '📵 *No está permitido llamar al bot.*'
        })

        // BLOQUEO DESACTIVADO
        // await conn.updateBlockStatus(chat, 'block')

        // rechazar llamada
        await conn.rejectCall(call.id, chat)

      } catch (err) {
        console.error(err)

        // reportar error
        await conn.sendMessage('5493425242334@s.whatsapp.net', {
          text:
            `❌ ERROR ANTILLAMADA\n\n` +
            `Número: ${call.from}\n\n` +
            `${err.stack || err.message}`
        })
      }
    }
  })
}
