let cachedCommands = []

async function updateCachedCommands() {
  try {
    const pluginFiles = Object.values(global.plugins)
    cachedCommands = pluginFiles
      .flatMap(plugin => {
        const handler = plugin.default || plugin
        if (!handler || !handler.command) return []
        return Array.isArray(handler.command) ? handler.command : [handler.command]
      })
      .filter(Boolean)
      .map(c => c.toLowerCase())
  } catch (e) {
    console.error('Error actualizando cachedCommands:', e)
    cachedCommands = []
  }
}

// Llama esto después de cargar los plugins y cada vez que se recargue uno
updateCachedCommands()

// Antes de cada mensaje
export async function before(m, { conn, usedPrefix }) {
  try {
    if (!m.text || !global.prefix.test(m.text)) return

    const command = m.text.slice(usedPrefix.length).trim().split(/ +/)[0].toLowerCase()
    if (!command) return

    const user = global.db.data.users[m.sender]

    // Si existe el comando, incrementamos contador
    if (cachedCommands.includes(command)) {
      user.commands = (user.commands || 0) + 1
      return
    }

    // Levenshtein para sugerencias
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

    const similares = cachedCommands
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

    await conn.sendMessage(m.chat, { text }, { quoted: m })
  } catch (err) {
    console.error('Error en before:', err)
  }
}

// Cada vez que se recargue un plugin
global.reload = async (_ev, filename) => {
  // ...tu código de reload...
  await updateCachedCommands() // actualiza la cache
}
