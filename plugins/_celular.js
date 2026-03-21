import { getDevice } from "@whiskeysockets/baileys"

// Primero, asegurarnos de tener una "imagen global" de qu.ax
if (!global.imagenQuAx) {
    global.imagenQuAx = null
    (async () => {
        try {
            const res = await fetch('https://qu.ax/nZoBe')
            global.imagenQuAx = Buffer.from(await res.arrayBuffer())
        } catch (e) {
            console.log("Error cargando imagen de qu.ax:", e)
            global.imagenQuAx = null
        }
    })()
}

// Handler principal
let handler = async (m, { conn, text, command }) => {

    let txt = `📱✨ *iPhone 15 (128GB)* ✨

- 🔥 Potencia y estilo en tus manos
- 📸 Cámara impresionante
- ⚡ Rendimiento ultra rápido

💬 *Disponible ahora*
👉 ¡Cotiza sin compromiso!`

    // Usamos la imagen global ya cargada
    let imagen = global.imagenQuAx || 'https://qu.ax/nZoBe' // fallback a URL si Buffer no está listo

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
