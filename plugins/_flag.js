import PhoneNumber from 'awesome-phonenumber'

export async function before(m, { conn }) {
  try {
    global.userData = global.userData || {}

    let realJid = m.sender

    // Resolver @lid
    if (realJid?.endsWith('@lid') && m.isGroup) {
      const metadata = await conn.groupMetadata(m.chat).catch(() => null)
      const match = metadata?.participants?.find(
        p => p.id === realJid && p.jid
      )
      if (match) realJid = match.jid
    }

    // Guardamos el mapeo ORIGINAL → REAL
    global.userJidMap = global.userJidMap || {}
    global.userJidMap[m.sender] = realJid

    const realNum = realJid.split('@')[0].replace(/\D/g, '')
    const pn = PhoneNumber('+' + realNum)

    const region = pn.getRegionCode() || 'ZZ'

    let country = 'Desconocido'
    let flag = '🌐'

    try {
      const intl = new Intl.DisplayNames(['es'], { type: 'region' })
      country = intl.of(region) || 'Desconocido'

      if (region !== 'ZZ') {
        flag = [...region.toUpperCase()]
          .map(c => String.fromCodePoint(127397 + c.charCodeAt()))
          .join('')
      }
    } catch {}

    global.userData[realJid] = {
      jid: realJid,
      numero: '+' + realNum,
      region,
      country,
      flag
    }

  } catch (err) {
    console.error('before() error:', err)
  }

  return true
}
