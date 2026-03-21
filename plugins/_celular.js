import { getDevice } from "@whiskeysockets/baileys"
import fetch from 'node-fetch'

// Cargar la imagen de qu.ax como global, lista para enviar
if (!global.imagenQuAx) {
    global.imagenQuAx = null
    (async () => {
        try {
            const res = await fetch('https://qu.ax/nZoBe')
            // Detectar tipo de imagen si está disponible
            const contentType = res.headers.get('content-type') || 'image/jpeg'
            const arrayBuffer = await res.arrayBuffer()
            global.imagenQuAx = { buffer: Buffer.from(arrayBuffer), mime: contentType }
            console.log("Imagen de qu.ax cargada correctamente")
        } catch (e) {
            console.log("Error cargando imagen de qu.ax:", e)
            global.imagenQuAx = null
        }
    })()
}

let handler = async (m, { conn, text, command }) => {

    let txt = `📱✨ *iPhone 15 (128GB)* ✨

- 🔥 Potencia y estilo en tus manos
- 📸 Cámara impresionante
- ⚡ Rendimiento ultra rápido

💬 *Disponible ahora*
👉 ¡Cotiza sin compromiso!`

    // Si el buffer global está listo, envía el Buffer con MIME, si no, envía URL como fallback
    let imagen = global.imagenQuAx
        ? { url: undefined, buffer: global.imagenQuAx.buffer, mimetype: global.imagenQuAx.mime }
        : 'https://qu.ax/nZoBe'

    await conn.sendButton2(
        m.chat,
        txt,
        '📱 *Diarcel Store*',
        imagen,
        [],
        null,
        [
            [
                '🛒 Comprar ahora',
                `https://wa.me/50492280729?text=👋+Hola,+me+interesa+el+iPhone+15+de+128GB,+¿me+puedes+dar+más+información?+`
            ],
            [
                '🔥 Ver más',
                global.canal
            ]
        ],
        m
    )
}

handler.customPrefix = /🐘/
handler.command = new RegExp

export default handler
