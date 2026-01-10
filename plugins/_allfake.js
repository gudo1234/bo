import PhoneNumber from "awesome-phonenumber"
global.mundo = async function (m, conn) {
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

        const region = pn.getRegionCode() || "ZZ"

        let country = "Desconocido"
        let flag = "🌐"

        try {
            const intl = new Intl.DisplayNames(["es"], { type: "region" })
            country = intl.of(region) || "Desconocido"

            if (region !== "ZZ") {
                flag = [...region.toUpperCase()]
                    .map(c => String.fromCodePoint(127397 + c.charCodeAt()))
                    .join("")
            }
        } catch {}

        return {
            numero: "+" + num,
            region,
            country,
            flag
        }

    } catch {
        return {
            numero: "desconocido",
            region: "ZZ",
            country: "Desconocido",
            flag: "🌐"
        }
    }
  global.canalIdM = ["120363285614743024@newsletter", "120363395205399025@newsletter"]
    global.canalNombreM = ["🤖⃧►iʑυвöτ◃2.0▹", "Zeus Bot🔆Channel-OFC"]
    global.channelRD = await getRandomChannel()
}
