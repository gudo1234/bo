import PhoneNumber from "awesome-phonenumber"

export async function before(m, { conn }) {
    try {
        global.mundo = global.mundo || {}

        let realSender = m.sender

        if (realSender?.endsWith("@lid") && m.isGroup) {
            const metadata = await conn.groupMetadata(m.chat).catch(() => null)
            const match = metadata?.participants?.find(
                p => p.id === realSender && p.jid
            )
            if (match) realSender = match.jid
        }

        const num = realSender.split("@")[0].replace(/\D/g, "")
        const pn = PhoneNumber("+" + num)

        const region = pn.getRegionCode() || "ZZ"

        let country = "Desconocido"
        try {
            const intl = new Intl.DisplayNames(["es"], { type: "region" })
            country = intl.of(region) || "Desconocido"
        } catch {}

        let flag = "🌐"
        if (region !== "ZZ") {
            try {
                flag = [...region.toUpperCase()]
                    .map(c => String.fromCodePoint(127397 + c.charCodeAt()))
                    .join("")
            } catch {}
        }

        global.mundo[realSender] = {
            numero: "+" + num,
            region,
            country,
            flag
        }

    } catch {
        global.mundo[m.sender] = {
            numero: "desconocido",
            region: "ZZ",
            country: "Desconocido",
            flag: "🌐"
        }
    }

    return true
}
