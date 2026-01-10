import PhoneNumber from "awesome-phonenumber"

export async function before(m, { conn }) {
    try {
        let realSender = m.sender

        // Resolver @lid en grupos
        if (realSender?.endsWith("@lid") && m.isGroup) {
            const metadata = await conn.groupMetadata(m.chat).catch(() => null)
            const match = metadata?.participants?.find(
                p => p.id === realSender && p.jid
            )
            if (match) realSender = match.jid
        }

        const num = realSender.split("@")[0].replace(/\D/g, "")
        const pn = PhoneNumber("+" + num)

        const region = pn.getRegionCode() || "🌐"

        let country = "Desconocido"
        try {
            const intl = new Intl.DisplayNames(["es"], { type: "region" })
            country = intl.of(region) || "Desconocido"
        } catch {}

        let flag = "🌐"
        try {
            flag = [...region.toUpperCase()]
                .map(c => String.fromCodePoint(127397 + c.charCodeAt()))
                .join("")
        } catch {}

        // Guardar info global si la necesitas luego
        global.mundo = {
            numero: "+" + num,
            region,
            country,
            flag
        }

    } catch {
        global.mundo = {
            numero: "desconocido",
            region: "🌐",
            country: "Desconocido",
            flag: "🌐"
        }
    }

    return true
              }
