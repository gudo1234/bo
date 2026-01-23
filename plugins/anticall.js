export async function all(m, { conn }) {
  // evitar múltiples cargas
  if (conn._antiCallLoaded) return
  conn._antiCallLoaded = true

  // escucha llamadas entrantes
  conn.ev.on('call', async (calls) => {
    for (const call of calls) {
      try {
        if (call.status !== 'offer') continue

        // enviar mensaje
        await conn.sendMessage(call.from, {
          text: '📵 *No está permitido llamar al bot.*'
        })

        // rechazar la llamada
        await conn.rejectCall(call.id, call.from)
      } catch (err) {
        console.error(err)
      }
    }
  })
}
