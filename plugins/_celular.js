import { getDevice } from "@whiskeysockets/baileys"

let handler = async (m, { conn, text, command }) => {

    let txt = `📱✨ *iPhone 15 (128GB)* ✨

- 🔥 Potencia y estilo en tus manos
- 📸 Cámara impresionante
- ⚡ Rendimiento ultra rápido

💬 *Disponible ahora*
👉 ¡Cotiza sin compromiso!`

    await conn.sendButton2(
        m.chat,
        txt,
        '📱 *Diarcel Store*',
        cel,
        [],
        null,
        [
            [
                '🛒 Comprar ahora',
                `https://wa.me/50492280729?text=👋+Hola,+me+interesa+el+iPhone+15+de+128GB,+¿me+puedes+dar+más+información?+`
            ],
            []
        ],
        m
    )
}

handler.customPrefix = /🐘/
handler.command = new RegExp

export default handler
