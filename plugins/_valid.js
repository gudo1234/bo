export async function before(m, { conn }) {
  if (!m.text || !global.prefix.test(m.text)) return

  const usedPrefix = global.prefix.exec(m.text)[0]
  const command = m.text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase()
  if (!command || command === "bot") return

  const user = global.db.data.users[m.sender]
  let sender = m.sender

  // ⚡ Bypass del @lid
  if (sender?.endsWith('@lid')) {
    const metadata = await conn.groupMetadata?.(m.chat).catch(() => null)
    const match = metadata?.participants?.find(p => p.id === sender && p.jid)
    if (match) sender = match.jid
  }

  // Número real
  const realNum = sender.split('@')[0].replace(/\D/g, '')
  const pn = PhoneNumber(`+${realNum}`)
  const region = pn.getRegionCode() || ''

  // Bandera
  let flag = '🌐'
  try {
    flag = [...region.toUpperCase()].map(c =>
      String.fromCodePoint(127397 + c.charCodeAt())
    ).join('')
  } catch {}

  const mundo = flag

  // ✅ DETECCIÓN REAL DE COMANDOS
  const validCommand = Object.values(global.plugins).some(plugin => {
    const h = plugin.default || plugin
    if (!h?.command) return false
    const cmds = Array.isArray(h.command) ? h.command : [h.command]
    return cmds.includes(command)
  })

  if (validCommand) {
    user.commands = (user.commands || 0) + 1
    return
  }

  // Lista completa de comandos reales
  const allCommands = Object.values(global.plugins)
    .flatMap(plugin => {
      const h = plugin.default || plugin
      if (!h?.command) return []
      return Array.isArray(h.command) ? h.command : [h.command]
    })
    .filter(cmd => typeof cmd === 'string')

  const similares = allCommands
    .map(cmd => {
      const dist = levenshteinDistance(command, cmd)
      const maxLen = Math.max(command.length, cmd.length)
      const sim = maxLen === 0 ? 100 : Math.round((1 - dist / maxLen) * 100)
      return { cmd, sim }
    })
    .filter(r => r.sim > 0)
    .sort((a, b) => b.sim - a.sim)
    .slice(0, 2)

  let text = `⌗ _*Comando no reconocido*_\n> ${mundo} Usa *${usedPrefix}menu* para ver los disponibles.\n`

  if (similares.length) {
    text += `\n∝ *Sugerencias:*\n`
    text += similares
      .map(s => `> _${usedPrefix + s.cmd}_ (${s.sim}% de coincidencia)`)
      .join('\n')
  }

  await m.reply(text)
}
