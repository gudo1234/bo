import fs from 'fs'
import path from 'path'

export async function before(m, { usedPrefix }) {
  try {
    if (!m.text || !global.prefix.test(m.text)) return

    const used = global.prefix.exec(m.text)[0]
    const command = m.text.slice(used.length).trim().split(/ +/)[0].toLowerCase()
    if (!command || command === "bot") return

    const user = global.db.data.users[m.sender]

    // Ruta de los plugins
    const pluginsPath = path.join(process.cwd(), 'plugins')
    const pluginFiles = fs.readdirSync(pluginsPath).filter(f => f.endsWith('.js'))

    // Extraemos todos los handler.command
    const allCommands = []
    for (const file of pluginFiles) {
      const pluginPath = path.join(pluginsPath, file)
      const pluginModule = await import(`file://${pluginPath}`)
      const handler = pluginModule.default || pluginModule
      if (handler && handler.command) {
        const cmds = Array.isArray(handler.command) ? handler.command : [handler.command]
        allCommands.push(...cmds.map(c => c.toLowerCase()))
      }
    }

    // Si existe el comando
    if (allCommands.includes(command)) {
      user.commands = (user.commands || 0) + 1
      return
    }

    // Función Levenshtein
    const levenshteinDistance = (a, b) => {
      const dp = Array.from({ length: a.length + 1 }, (_, i) => [i])
      for (let j = 1; j <= b.length; j++) dp[0][j] = j
      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1,
            dp[i - 1][j - 1] + cost
          )
        }
      }
      return dp[a.length][b.length]
    }

    // Generamos sugerencias
    const similares = allCommands
      .map(cmd => {
        const dist = levenshteinDistance(command, cmd)
        const maxLen = Math.max(command.length, cmd.length)
        const sim = maxLen === 0 ? 100 : Math.round((1 - dist / maxLen) * 100)
        return { cmd, sim }
      })
      .filter(r => r.sim > 0)
      .sort((a, b) => b.sim - a.sim)
      .slice(0, 3)

    let text = `⌗ _*Comando no reconocido*_\n> Usa *${usedPrefix}menu* para ver los comandos disponibles.\n`
    if (similares.length) {
      text += `\n∝ *Sugerencias:*\n`
      text += similares.map(s => `> _${usedPrefix + s.cmd}_ (${s.sim}% coincidencia)`).join('\n')
    }

    await m.reply(text)
  } catch (err) {
    console.error('Error en before:', err)
  }
}
