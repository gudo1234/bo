import { getDevice } from "@whiskeysockets/baileys"

let handler = async (m, { conn, text, command }) => {

 let txt = `📱✨ *iPhone 15 (128GB)* ✨

- 🔥 Potencia y estilo en tus manos
- 📸 Cámara impresionante
- ⚡ Rendimiento ultra rápido

💬 *Disponible ahora*
👉 ¡Cotiza sin compromiso!`

 // Usamos la URL directamente, no fetch
 let imageUrl = 'https://qu.ax/nZoBe'

 await conn.sendButton2(
   m.chat,
   txt,
   '📱 *Diarcel Store*',
   { url: imageUrl }, // ✅ URL directa
   [],
   null,
   [[
     '🛒 Comprar ahora',
     `https://wa.me/50492280729?text=👋+Hola,+me+interesa+el+iPhone+15+de+128GB,+¿me+puedes+dar+más+información?+`
   ],
   [
     '🔥 Ver más',
     "https://whatsapp.com/channel/0029VaXHNMZL7UVTeseuqw3H"
   ]],
   m
 )

}

handler.customPrefix = /🐘/
handler.command = new RegExp

export default handler
