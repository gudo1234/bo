import { getDevice } from "@whiskeysockets/baileys"
import fetch from 'node-fetch'

let handler = async (m, { conn, text, command }) => {

 let txt = `📱✨ *iPhone 15 (128GB)* ✨

- 🔥 Potencia y estilo en tus manos
- 📸 Cámara impresionante
- ⚡ Rendimiento ultra rápido

💬 *Disponible ahora*
👉 ¡Cotiza sin compromiso!`

 let im = await (await fetch(`https://qu.ax/nZoBe`)).buffer()

 await conn.sendButton2(
   m.chat,
   txt,
   '📱 *Diarcel Store*',
   im,
   [],
   null,
   [[
     '🛒 Comprar ahora',
     `https://wa.me/50492280729?text=👋+Hola,+me+interesa+el+iPhone+15+de+128GB,+¿me+puedes+dar+más+información?+`
   ],
   [
     '🔥 Ver más',
     channel
   ]],
   null
 )

}

handler.customPrefix = /🐘/
handler.command = new RegExp

export default handler
