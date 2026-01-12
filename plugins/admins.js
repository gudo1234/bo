import fetch from "node-fetch";
import { jidNormalizedUser } from "@whiskeysockets/baileys";

const handler = async (m, { conn, participants, groupMetadata, args }) => {
  try {
    const admins = [];

    for (const p of participants) {
      if (p.admin !== "admin" && p.admin !== "superadmin") continue;

      let jid = p.id;
      if (jid.endsWith("@lid")) {
        const real = participants.find(x => x.id === jid && x.jid);
        if (real?.jid) jid = real.jid;
      }

      jid = jidNormalizedUser(jid);
      admins.push(jid);
    }

    if (!admins.length)
      return m.reply("❌ No se encontraron administradores.");

    const texto = args.length ? args.join(" ") : "¡Atención administradores!";
    const listado = admins
      .map(jid => `@${jid.split("@")[0]}`)
      .join("\n");

    const infoText = `${e} *Admins del grupo:*

${listado}

> Mensaje:
» ${texto}`.trim();
    let thumbBuffer;
    try {
      const pp = await conn.profilePictureUrl(m.chat, "image");
      thumbBuffer = await (await fetch(pp)).buffer();
    } catch {
      thumbBuffer = undefined;
    }

    await conn.sendMessage(
      m.chat,
      {
        text: infoText,
        mentions: admins,
        contextInfo: {
          externalAdReply: {
            title: groupMetadata.subject || "Administradores",
            body: textbot,
            thumbnailUrl: redes,
            thumbnail: thumbBuffer,
            sourceUrl: redes,
            mediaType: 1
          }
        }
      },
      { quoted: m }
    );

  } catch (e) {
    console.error("[ADMINS ERROR]", e);
    m.reply(`${e} Ocurrió un error al mencionar a los administradores.`);
  }
};

handler.help = ["admins"];
handler.tags = ["grupo"];
handler.command = ["admins", "@admins", "tagadmins"];
handler.group = true;

export default handler;
