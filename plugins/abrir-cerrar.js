let handler = async (m, { conn, args, text, usedPrefix, command }) => {
const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || icono  
let isClose = { // Switch Case Like :v
'open': 'not_announcement',
'close': 'announcement',
'abierto': 'not_announcement',
'cerrado': 'announcement',
'abrir': 'not_announcement',
'cerrar': 'announcement',
}[(args[0] || '')]
if (isClose === undefined)
conn.reply(m.chat, `${e} *Ejemplo:*
.grupo abrir
.grupo cerrar`, m)
await conn.groupSettingUpdate(m.chat, isClose)
  
if (isClose === 'not_announcement'){
//m.reply(`『 *𝙂𝙍𝙐𝙋𝙊 𝘼𝘽𝙄𝙀𝙍𝙏𝙊* 』\n𝙔𝙖 𝙥𝙪𝙚𝙙𝙚 𝙚𝙨𝙘𝙧𝙞𝙗𝙞 𝙩𝙤𝙙𝙤 𝙚𝙣 𝙚𝙨𝙩𝙚 𝙜𝙧𝙪𝙥𝙤!!`)
//conn.sendButton(m.chat, `${eg}𝙔𝙖 𝙥𝙪𝙚𝙙𝙚 𝙚𝙨𝙘𝙧𝙞𝙗𝙞 𝙩𝙤𝙙𝙤 𝙚𝙣 𝙚𝙨𝙩𝙚 𝙜𝙧𝙪𝙥𝙤!!`, `𝙂𝙧𝙪𝙥𝙤 𝙖𝙗𝙞𝙚𝙧𝙩𝙤\n${wm}`, pp, [['𝘾𝙪𝙚𝙣𝙩𝙖𝙨 𝙊𝙛𝙞𝙘𝙞𝙖𝙡𝙚𝙨 ✅', `.cuentasgb`], ['𝙑𝙤𝙡𝙫𝙚𝙧 𝙖𝙡 𝙈𝙚𝙣𝙪́ ☘️', `/menu`]], m)
}
  
if (isClose === 'announcement'){
//m.reply(`『 *𝙂𝙍𝙐𝙋𝙊 𝘾𝙀𝙍𝙍𝘼𝘿𝙊* 』\n𝙎𝙤𝙡𝙤 𝙡𝙤𝙨 𝙖𝙙𝙢𝙞𝙣 𝙥𝙪𝙚𝙙𝙚 𝙚𝙨𝙘𝙧𝙞𝙗𝙞 𝙚𝙣 𝙚𝙨𝙩𝙚 𝙜𝙧𝙪𝙥𝙤!!`)
//conn.sendButton(m.chat, `${eg}𝙎𝙤𝙡𝙤 𝙡𝙤𝙨 𝙖𝙙𝙢𝙞𝙣 𝙥𝙪𝙚𝙙𝙚 𝙚𝙨𝙘𝙧𝙞𝙗𝙞 𝙚𝙣 𝙚𝙨𝙩𝙚 𝙜𝙧𝙪𝙥𝙤!!`, `𝙂𝙧𝙪𝙥𝙤 𝙘𝙚𝙧𝙧𝙖𝙙𝙤\n${wm}`, pp, [['𝙈𝙤𝙢𝙚𝙣𝙩𝙤 𝙖𝙙𝙢𝙞𝙣😎', '.s'], ['𝙑𝙤𝙡𝙫𝙚𝙧 𝙖𝙡 𝙈𝙚𝙣𝙪́ ☘️', `/menu`]], m)
}}
handler.help = ['group open / close', 'grupo abrir / cerrar']
handler.tags = ['grupo']
handler.command = ['group', 'grupo']
handler.admin = true
handler.botAdmin = true
handler.exp = 200
export default handler
