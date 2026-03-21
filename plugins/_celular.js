import { getDevice } from "@whiskeysockets/baileys"
import fetch from 'node-fetch'

let handler = async (m, { conn, text, command }) => {

 let txt = `📱✨ *iPhone 15 (128GB)* ✨

- 🔥 Potencia y estilo en tus manos
- 📸 Cámara impresionante
- ⚡ Rendimiento ultra rápido

💬 *Disponible ahora*
👉 ¡Cotiza sin compromiso!`

 // Traemos la imagen de la URL
 const response = await fetch(`https://qu.ax/nZoBe`)
 const arrayBuffer = await response.arrayBuffer()
 const buffer = Buffer.from(arrayBuffer)
 await conn.sendButton2(
   m.chat,
   txt,
   '📱 *Diarcel Store*',
   { url: buffer }, // ✅ así funciona con Buffer
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
