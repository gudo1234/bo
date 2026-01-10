export default async (m, { conn, usedPrefix }) => {
  try {
    if (!m.text || !usedPrefix) return

    const command = m.text.slice(usedPrefix.length).trim().split(/ +/)[0].toLowerCase()
    if (!command) return

    const user = global.db.data.users[m.sender]

    // Todos los comandos de todos los plugins
    const allCommands = Object.values(global.plugins)
      .flatMap(p => {
        const h = p.default || p
        if (!h || !h.command) return []
        return Array.isArray(h.command) ? h.command : [h.command]
      })
      .filter(Boolean)
      .map(c => c.toLowerCase())

    // Si el comando existe, incrementamos contador y salimos
    if (allCommands.includes(command)) {
      user.commands = (user.commands || 0) + 1
      return
    }

    // Levenshtein para sugerencias
    const similars = allCommands
      .map(c => {
        const len = Math.max(command.length, c.length)
        const dist = [...command].reduce((acc, ch, i) => acc + (c[i] === ch ? 0 : 1), 0)
        const sim = len === 0 ? 100 : Math.round((1 - dist / len) * 100)
        return { cmd: c, sim }
      })
      .filter(r => r.sim >= 40)
      .sort((a, b) => b.sim - a.sim)
      .slice(0, 3)

    // Mensaje final
    let text = `⌗ _*Comando no reconocido*_\n> Usa *${usedPrefix}menu* para ver todos los comandos.\n`
    if (similars.length) {
      text += `\n∝ *Sugerencias:*\n`
      text += similars.map(s => `> _${usedPrefix + s.cmd}_ (${s.sim}% coincidencia)`).join('\n')
    }

    await m.reply(text)

  } catch (e) {
    console.error('Error en plugin de comando desconocido:', e)
  }
}
