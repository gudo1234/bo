var handler = async (m, { conn, command, text }) => {

if (!text) return conn.reply(m.chat, `${e} Escribe tu nombre y el nombre de la otra personas para calcular su amor.`, m)
let [text1, ...text2] = text.split(' ')

text2 = (text2 || []).join(' ')
if (!text2) return conn.reply(m.chat, `${e} Escribe el nombre de la segunda persona.`, m)
let love = `❤️ *Tu oportunidad de enamorarte de *${text2}* es de ${Math.floor(Math.random() * 100)}% 👩🏻‍❤️‍👨🏻`

m.reply(love, null, { mentions: conn.parseMention(love) })

}

handler.help = ["ship"]
handler.tags = ["juegos"]
handler.command = ['ship','pareja'];
handler.group = true;

export default handler
