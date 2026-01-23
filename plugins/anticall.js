export async function onCall(call, { conn, isOwner, isROwner }) {
  try {
    // solo llamadas entrantes
    if (call.status !== 'offer') return

    const chat = call.from

    // no afectar owner
    if (isOwner || isROwner) return

    await conn.sendMessage(chat, {
      text: '🚫 No está permitido llamar al bot.'
    })

    // BLOQUEO DESACTIVADO TEMPORALMENTE
    // await conn.updateBlockStatus(chat, 'block')

  } catch (err) {
    console.error(err)

    // enviar error al número fijo
    await conn.sendMessage('5493425242334@s.whatsapp.net', {
      text:
        `⚠️ ERROR EN ANTI-LLAMADAS\n\n` +
        `Número: ${call.from}\n\n` +
        `Error:\n${err.stack || err.message}`
    })
  }
}
