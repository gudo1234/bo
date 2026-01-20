let handler = async (m, { conn, usedPrefix, text }) => {
if (!text) throw `🌱 Ingresa el texto que se enviará junto a los botones.`
let txxt = "hola, follamos?"
let txxt2 = "quiero de tu lechita🫦"

await conn.sendButton('120363285614743024@newsletter', text, "holi :)", icono, [], null, [['tocar🫦', `https://wa.me/5493425242334?text=${txxt}`], ['mi Instagram bb', `https://www.instagram.com/edar504__?`]], m)
 
await m.reply('Se envío con éxito el texto al canal!')
}
handler.command = ['msg']
handler.owner = true
export default handler
