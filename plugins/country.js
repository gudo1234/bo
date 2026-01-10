const flags = [
  {
    "name": "Isla Ascensión",
    "code": "AC",
    "emoji": "🇦🇨",
    "image": "https://qu.ax/vloWC.jpg",
    "slug": "ascension-island"
  },
  {
    "name": "Australia",
    "code": "AU",
    "emoji": "🇦🇺",
    "image": "https://qu.ax/Jctpa.jpg",
    "dialCodes": ["+61"],
    "slug": "australia"
  },
  {
    "name": "Austria",
    "code": "AT",
    "emoji": "🇦🇹",
    "image": "https://qu.ax/VWjcQ.jpg",
    "dialCodes": ["+43"],
    "slug": "austria"
  },
  {
    "name": "Azerbaiyán",
    "code": "AZ",
    "emoji": "🇦🇿",
    "image": "https://qu.ax/tfcMQ.jpg",
    "dialCodes": ["+994"],
    "slug": "azerbaijan"
  },
  {
    "name": "Bahamas",
    "code": "BS",
    "emoji": "🇧🇸",
    "image": "https://qu.ax/ZTadr.jpg",
    "dialCodes": ["+1242"],
    "slug": "bahamas"
  },
  {
    "name": "Baréin",
    "code": "BH",
    "emoji": "🇧🇭",
    "image": "https://qu.ax/xKeUE.jpg",
    "dialCodes": ["+973"],
    "slug": "bahrain"
  },
  {
    "name": "Bangladés",
    "code": "BD",
    "emoji": "🇧🇩",
    "image": "https://qu.ax/acDQH.jpg",
    "dialCodes": ["+880"],
    "slug": "bangladesh"
  },
  {
    "name": "Barbados",
    "code": "BB",
    "emoji": "🇧🇧",
    "image": "https://qu.ax/QrfEu.jpg",
    "dialCodes": ["+1246"],
    "slug": "barbados"
  },
  {
    "name": "Bielorrusia",
    "code": "BY",
    "emoji": "🇧🇾",
    "image": "https://qu.ax/ioleP.jpg",
    "dialCodes": ["+375"],
    "slug": "belarus"
  },
  {
    "name": "Bélgica",
    "code": "BE",
    "emoji": "🇧🇪",
    "image": "https://qu.ax/hjKQK.jpg",
    "dialCodes": ["+32"],
    "slug": "belgium"
  },
  {
    "name": "Belice",
    "code": "BZ",
    "emoji": "🇧🇿",
    "image": "https://qu.ax/zbJEg.jpg",
    "dialCodes": ["+501"],
    "slug": "belize"
  },
  {
    "name": "Bolivia",
    "code": "BO",
    "emoji": "🇧🇴",
    "image": "https://qu.ax/ISfZQ.jpg",
    "dialCodes": ["+591"],
    "slug": "bolivia"
  },
  {
    "name": "Brasil",
    "code": "BR",
    "emoji": "🇧🇷",
    "image": "https://qu.ax/GaZQk.jpg",
    "dialCodes": ["+55"],
    "slug": "brazil"
  },
  {
    "name": "Canadá",
    "code": "CA",
    "emoji": "🇨🇦",
    "image": "https://qu.ax/mkFqr.jpg",
    "dialCodes": ["+1"],
    "slug": "canada"
  },
  {
    "name": "Chile",
    "code": "CL",
    "emoji": "🇨🇱",
    "image": "https://qu.ax/bkJGU.jpg",
    "dialCodes": ["+56"],
    "slug": "chile"
  },
  {
    "name": "China",
    "code": "CN",
    "emoji": "🇨🇳",
    "image": "https://qu.ax/qcLpH.jpg",
    "dialCodes": ["+86"],
    "slug": "china"
  },
  {
    "name": "Colombia",
    "code": "CO",
    "emoji": "🇨🇴",
    "image": "https://qu.ax/sUANQ.jpg",
    "dialCodes": ["+57"],
    "slug": "colombia"
  },
  {
    "name": "Costa Rica",
    "code": "CR",
    "emoji": "🇨🇷",
    "image": "https://qu.ax/GRPXW.jpg",
    "dialCodes": ["+506"],
    "slug": "costa-rica"
  },
  {
    "name": "Cuba",
    "code": "CU",
    "emoji": "🇨🇺",
    "image": "https://qu.ax/TBKCu.jpg",
    "dialCodes": ["+53"],
    "slug": "cuba"
  },
  {
    "name": "Ecuador",
    "code": "EC",
    "emoji": "🇪🇨",
    "image": "https://qu.ax/dMJnR.jpg",
    "dialCodes": ["+593"],
    "slug": "ecuador"
  },
  {
    "name": "España",
    "code": "ES",
    "emoji": "🇪🇸",
    "image": "https://qu.ax/UwGhG.jpg",
    "dialCodes": ["+34"],
    "slug": "spain"
  },
  {
    "name": "Estados Unidos",
    "code": "US",
    "emoji": "🇺🇸",
    "image": "https://qu.ax/YOTFE.jpg",
    "dialCodes": ["+1"],
    "slug": "united-states"
  },
  {
    "name": "México",
    "code": "MX",
    "emoji": "🇲🇽",
    "image": "https://qu.ax/Etmmp.jpg",
    "dialCodes": ["+52"],
    "slug": "mexico"
  },
  {
    "name": "Perú",
    "code": "PE",
    "emoji": "🇵🇪",
    "image": "https://qu.ax/xmYFk.jpg",
    "dialCodes": ["+51"],
    "slug": "peru"
  },
  {
    "name": "Venezuela",
    "code": "VE",
    "emoji": "🇻🇪",
    "image": "https://qu.ax/RyTlQ.jpg",
    "dialCodes": ["+58"],
    "slug": "venezuela"
  }
]

// ==================== ESTADO ====================
const chatState = {}

// ================== JUEGO ==================
export async function before(m, { conn }) {
  try {
    const chat = db.data.chats[m.chat]
    if (!chat || !chat.autoband || !m.isGroup) return true
    if (!m.key || !m.key.id) return true

    if (!chatState[m.chat]) {
      chatState[m.chat] = {
        lastMsg: null,
        count: 0,
        flag: null,
        msg: null,
        time: 0
      }
    }

    const data = chatState[m.chat]

    // 🔥 Conteo REAL usando el ID de WhatsApp
    if (data.lastMsg !== m.key.id) {
      data.lastMsg = m.key.id
      data.count++
    }

    // Cambia 10 por 103 cuando termines pruebas
    if (data.count > 0 && data.count % 10 === 0 && !data.msg) {
      const flag = flags[Math.floor(Math.random() * flags.length)]

      data.flag = flag
      data.msg = await conn.sendMessage(m.chat, {
        image: { url: flag.image },
        caption: `💣 ¿A qué país pertenece esta bandera? ${flag.emoji}\n\n⏳ Tienes 3 minutos`
      })
      data.time = Date.now()
    }

    if (!data.msg) return true

    // Timeout
    if (Date.now() - data.time > 180000) {
      try {
        await conn.sendMessage(m.chat, {
          delete: { remoteJid: m.chat, fromMe: true, id: data.msg.key.id }
        })
      } catch {}
      data.msg = null
      return true
    }

    // Validar respuesta
    if (m.quoted && m.quoted.id === data.msg.key.id) {
      const txt = (m.text || "").trim().toLowerCase()

      if (txt === data.flag.name.toLowerCase()) {
        await m.react("🎉")
        await conn.reply(m.chat, `🎉 ¡Correcto!\n\n${data.flag.name} ${data.flag.emoji}`, m)

        try {
          await conn.sendMessage(m.chat, {
            delete: { remoteJid: m.chat, fromMe: true, id: data.msg.key.id }
          })
        } catch {}

        data.msg = null
      } else {
        await m.react("❌")
        await conn.reply(m.chat, `❌ Incorrecto\n\nPista: ${data.flag.emoji}`, m)
      }
    }

  } catch (e) {
    console.error("AutoBand:", e)
  }

  return true
        }
