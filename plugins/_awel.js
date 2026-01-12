import {WAMessageStubType} from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, {conn, participants, groupMetadata}) {
  if (!m.messageStubType || !m.isGroup) return !0;
  let stubData = m.messageStubParameters?.[0]
  let targetJid = stubData
  if (typeof stubData === 'string' && stubData.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(stubData)
      targetJid = parsed.phoneNumber || parsed.id || stubData
    } catch {}
  }
  let pp = await conn.profilePictureUrl(targetJid, 'image').catch(_ => icono)
  let img = await (await fetch(`${pp}`)).buffer()
  let chat = global.db.data.chats[m.chat]
  const mentionId = typeof targetJid === 'string' ? targetJid.split`@`[0] : (stubData?.id || '').split?.('@')?.[0]

  if (chat.welcome && m.messageStubType == 27) {
    let bienvenida = `════ ⋆★⋆ ════\n*${botname}* \n Bienvenido \n  「 @${mentionId} 」\n   ➠  Bienvenido a\n   ➠  ${groupMetadata.subject}\n   ➠  Lee las reglas del grupo\n════ ⋆★⋆ ════`
    
await conn.sendAi(m.chat, botname, textbot, bienvenida, img, img, canal)
  }
  
  if (chat.welcome && m.messageStubType == 28) {
    let bye = `════ ⋆★⋆ ════\n*${botname}* \n│ ADIOS  \n 「 @${mentionId} 」\n   ➠  Se fue\n   ➠ Jamás te quisimos aquí\n════ ⋆★⋆ ════`
await conn.sendAi(m.chat, botname, textbot, bye, img, img, canal)
  }
  
  if (chat.welcome && m.messageStubType == 32) {
    let kick = `════ ⋆★⋆ ════\n*${botname}* \n│ ADIOS  」\n 「 @${mentionId} 」\n   ➠  Se fue\n   ➠ Jamás te quisimos aquí\n════ ⋆★⋆ ════`
await conn.sendAi(m.chat, botname, textbot, kick, img, img, canal)
}}
