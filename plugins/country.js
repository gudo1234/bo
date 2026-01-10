// ================== BASE DE BANDERAS ==================
const flags = [
  {
    name: "España",
    code: "ES",
    emoji: "🇪🇸",
    image: "https://qu.ax/UwGhG.jpg",
    dialCodes: ["+34"],
    slug: "spain"
  },
  {
    name: "México",
    code: "MX",
    emoji: "🇲🇽",
    image: "https://qu.ax/Etmmp.jpg",
    dialCodes: ["+52"],
    slug: "mexico"
  },
  {
    name: "Argentina",
    code: "AR",
    emoji: "🇦🇷",
    image: "https://qu.ax/YhKzd.jpg",
    dialCodes: ["+54"],
    slug: "argentina"
  },
  {
    name: "Estados Unidos",
    code: "US",
    emoji: "🇺🇸",
    image: "https://qu.ax/YOTFE.jpg",
    dialCodes: ["+1"],
    slug: "united-states"
  },
  {
    name: "Colombia",
    code: "CO",
    emoji: "🇨🇴",
    image: "https://qu.ax/sUANQ.jpg",
    dialCodes: ["+57"],
    slug: "colombia"
  },
  {
    name: "Perú",
    code: "PE",
    emoji: "🇵🇪",
    image: "https://qu.ax/xmYFk.jpg",
    dialCodes: ["+51"],
    slug: "peru"
  },
  {
    name: "Chile",
    code: "CL",
    emoji: "🇨🇱",
    image: "https://qu.ax/bkJGU.jpg",
    dialCodes: ["+56"],
    slug: "chile"
  },
  {
    name: "Venezuela",
    code: "VE",
    emoji: "🇻🇪",
    image: "https://qu.ax/RyTlQ.jpg",
    dialCodes: ["+58"],
    slug: "venezuela"
  }
]

// ================== ESTADO GLOBAL ==================
const userMessageCount = {}

// ================== HOOK BEFORE ==================
export async function before(m, { conn }) {
  try {
    const chat = db.data.chats[m.chat]
    if (!chat || !chat.autoband || !m.isGroup) return true
    if (!m.message) return true

    if (!userMessageCount[m.chat]) {
      userMessageCount[m.chat] = {
        count: 0,
        currentFlag: null,
        questionMessage: null,
        timestamp: null
      }
    }

    const data = userMessageCount[m.chat]
    data.count++

    // Cada 103 mensajes
    if (data.count % 103 === 0) {
      const randomFlag = flags[Math.floor(Math.random() * flags.length)]

      data.currentFlag = randomFlag.name
      data.currentEmoji = randomFlag.emoji
      data.currentDial = randomFlag.dialCodes?.[0] || "DESCONOCIDO"

      const text = `💣 *¿A qué país pertenece esta bandera?* ${data.currentEmoji}\n\n⏳ Responde a este mensaje en *3 minutos*.`

      data.questionMessage = await conn.sendMessage(m.chat, {
        image: { url: randomFlag.image },
        caption: text
      })

      data.timestamp = Date.now()

      setTimeout(async () => {
        try {
          if (data.questionMessage) {
            await conn.sendMessage(m.chat, {
              delete: {
                remoteJid: m.chat,
                fromMe: true,
                id: data.questionMessage.key.id
              }
            })
          }
        } catch {}
        data.currentFlag = null
        data.questionMessage = null
        data.timestamp = null
      }, 180000)
    }

    // Si no hay pregunta activa, no hacemos nada
    if (!data.questionMessage || !data.timestamp) return true

    const elapsed = Date.now() - data.timestamp
    if (elapsed > 180000) return true

    // Validar respuesta
    if (
      m.quoted &&
      m.quoted.id === data.questionMessage.key.id
    ) {
      const userText = (m.text || "").trim().toLowerCase()
      const correct = data.currentFlag.toLowerCase()

      if (userText === correct) {
        await m.react("🎉")
        await conn.reply(
          m.chat,
          `🎉 *¡Correcto, ${m.pushName}!*\n\nLa bandera es de *${data.currentFlag}* ${data.currentEmoji}\n📞 Código: *${data.currentDial}*`,
          m
        )

        try {
          await conn.sendMessage(m.chat, {
            delete: {
              remoteJid: m.chat,
              fromMe: true,
              id: data.questionMessage.key.id
            }
          })
        } catch {}

        data.currentFlag = null
        data.questionMessage = null
        data.timestamp = null
      } else {
        const remaining = Math.max(0, 180000 - elapsed)
        const min = Math.floor(remaining / 60000)
        const sec = Math.floor((remaining % 60000) / 1000)

        await m.react("❌")
        await conn.reply(
          m.chat,
          `❌ *Respuesta incorrecta*\n\n🧩 *Pista:* Código *${data.currentDial}* ${data.currentEmoji}\n⏳ Tiempo restante: ${min}m ${sec}s`,
          m
        )
      }
    }

  } catch (e) {
    console.error("Error en autoband:", e)
  }

  return true
}
