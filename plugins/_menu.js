export async function handler(m, { conn, usedPrefix }) {
    let menu = []
    let categorias = {}

    for (const plugin of Object.values(global.plugins)) {
        if (!plugin.help || !plugin.tags) continue

        const helps = Array.isArray(plugin.help) ? plugin.help : [plugin.help]
        const tags = Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags]

        for (const tag of tags) {
            if (!categorias[tag]) categorias[tag] = []
            categorias[tag].push(...helps)
        }
    }

    for (const tag of Object.keys(categorias).sort()) {
        menu.push(`\n╭─❏ *${tag.toUpperCase()}*`)
        for (const cmd of [...new Set(categorias[tag])]) {
            menu.push(`│ • ${usedPrefix}${cmd}`)
        }
        menu.push(`╰────────────`)
    }

    const text = `🤖 *MENÚ DE COMANDOS*\n` +
        `━━━━━━━━━━━━━━\n` +
        `📋 Comandos disponibles:\n` +
        menu.join('\n')

    await conn.sendMessage(
        m.chat,
        { text },
        { quoted: m }
    )
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu']
handler.group = true;
