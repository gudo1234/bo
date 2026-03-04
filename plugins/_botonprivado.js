import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { randomBytes } from 'crypto';
import moment from 'moment-timezone'

export async function before(m, { conn, args, usedPrefix, command }) {
    if (m.fromMe) return
    if (m.isBaileys && m.fromMe) return !0
    if (m.isGroup) return !1
    if (!m.message) return !0
    if (m.chat === '120363395205399025@newsletter') return !0

    // Verificación de la opción "boton" solo en privado
    if (!global.db.data.settings[conn.user.jid]?.boton || m.isGroup) return

    let vn = './media/prueba4.mp3'
    let vn2 = './media/prueba3.mp3'
    let user = global.db.data.users[m.sender] || {}
    
    // Evitar repeticiones inmediatas
    if (user.lastBoton && new Date() - user.lastBoton < 21600000) return
    user.lastBoton = new Date() * 1

    // Enviar PRIMERO el mensaje de texto (m.reply)
    await conn.reply(m.chat, `🖐🏻 ¡Hola! *${m.pushName}* mi nombre es *${wm}* y fui desarrollada para cumplir multiples funciones en *WhatsApp🪀*.

✧──────‧₊˚📁˚₊‧──────╮
│ _Tengo muchos comandos_
│ _con diferentes funciones_
│ _como la descarga de videos,_
│ _audios, fotos y mucho mas,_
│ _contiene búsquedas con_
│ _chatGPT y diversos juegos._
✧──────‧₊˚🎠˚₊‧──────╯

╭︶︶︶︶︶🌐︶︶︶︶︶╮
*Síguenos en nuestro canal*
*y mantente informado....*
╰︶︶︶︶︶🎉︶︶︶︶︶╯`, m, fake)

    // Pequeña pausa antes de continuar
    await new Promise(resolve => setTimeout(resolve, 800))

    const { imageMessage } = await prepareWAMessageMedia({
        image: { url: icono }
    }, { upload: conn.waUploadToServer });

    const sections = [
        {
            title: "💻Información",
            highlight_label: "Más detalles",
            rows: [
                { header: "", title: "¿Qué más sabes hacer?", description: "", id: `.tes` }
            ]
        },
        {
            title: "🤖Servicio",
            highlight_label: "ASESOR",
            rows: [
                { header: "", title: "Hablar con su desarrollador", description: "", id: `.tes2` },
                { header: "", title: "📅Horario", description: "", id: `.tes3`}
            ]
        },
        {
            title: "🌐Convivir",
            highlight_label: "Unete a nuestra comunidad",
            rows: [
                { header: "", title: "Grupo", description: "", id: `.tes4`}
            ]
        }
    ];

    const buttonParamsJson = JSON.stringify({
        title: "OPCIONES",
        description: "Seleccione una opción",
        sections: sections
    });

    const interactiveMessage = {
        body: { text: '*Le compartimos nuestro menú, para más detalles*' },
        footer: { text: 'Seleccione la *OPCION* requerida para ser atendido:' },
        header: {
            hasMediaAttachment: true,
            imageMessage: imageMessage
        },
        nativeFlowMessage: {
            buttons: [{
                name: "single_select",
                buttonParamsJson: buttonParamsJson
            }]
        }
    };

    const message = {
        messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
        },
        interactiveMessage: interactiveMessage
    };

    m.react('🤖')

    await conn.relayMessage(m.chat, { viewOnceMessage: { message } }, {});
    await conn.sendFile(m.chat, [vn, vn2].getRandom(), 'prueba3.mp3', null, null, true, { 
        type: 'audioMessage', 
        ptt: true 
    })
      }
