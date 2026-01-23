export async function all(m, { conn }) {
  if (conn._antiCallLoaded) return
  conn._antiCallLoaded = true

  conn.ev.on('call', async (calls) => {
    for (const call of calls) {
      if (call.status !== 'offer') continue

      // enviar mensaje al usuario
      await conn.sendMessage(call.from, {
        text: '📵 *No está permitido llamar al bot.*'
      })

      // rechazar llamada
      await conn.rejectCall(call.id, call.from)
    }
  })
}
