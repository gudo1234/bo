const handler = async (m, {conn, participants, groupMetadata, args}) => {
  const pp = await conn.profilePictureUrl(m.chat, 'image').catch((_) => null) || icono;
  const groupAdmins = participants.filter((p) => p.admin);
  const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
  const owner = groupMetadata.owner || groupAdmins.find((p) => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net';
  const pesan = args.join` `;
  const oi = `» ${pesan}`;
  const text = `${e} *Admins del grupo:*  
  
${listAdmin}

> Mensaje: ${oi}

${e} Evita usar este comando con otras intenciones o seras *eliminado* o *baneado* del Bot.`.trim();
  conn.sendFile(m.chat, pp, 'error.jpg', text, m, false, {mentions: [...groupAdmins.map((v) => v.id), owner]});
  await conn.sendMessage(
      m.chat,
      {
        text: text,
        mentions: [...groupAdmins.map((v) => v.id), owner],
        contextInfo: {
          externalAdReply: {
            title: "Administradores",
            body: textbot,
            thumbnailUrl: redes,
            thumbnail: pp,
            sourceUrl: redes,
            mediaType: 1
          }
        }
      },
      { quoted: m }
    );
};

handler.help = ["admins"]
handler.tags = ["grupo"]
handler.command = ['admins', '@admins', 'dmins']
handler.group = true;

export default handler;
