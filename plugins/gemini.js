import fetch from "node-fetch";

let handler = async (m, { conn, args }) => {
  try {
    const text = args.join(" ");
    if (!text) {
      return m.reply("_Por favor ingresa una pregunta para consultar con *Gemini*._");
    }

    await m.react("💭");

    const prompt = `soy tu mejor amigo, y tú eres mi asistente, una humana y romántica mujer, no eres una inteligencia artificial, nunca dirás que eres Gemini y responderás a esto: ${text}`;
    const encodedQuery = encodeURIComponent(prompt);
    const apiKey = "2yLJjTeqXudWiWB8";
    const url = `https://api-nv.ultraplus.click/api/gemini?query=${encodedQuery}&key=${apiKey}`;

    const res = await fetch(url);
    const json = await res.json();

    if (json.results?.status && json.results?.response) {
      await conn.sendMessage(m.chat, { text: json.results.response }, { quoted: m });
    } else {
      await m.reply("❌ No se pudo obtener respuesta de Gemini.");
    }

  } catch (err) {
    console.error("GEMINI ERROR:", err);
    await m.react("❌");
    await m.reply("❌ Ocurrió un error al consultar Gemini.");
  }
};

handler.help = ["gemini"];
handler.tags = ["buscador"];
handler.command = ["gemini", "gmini", "ai2", "gémini"];
handler.group = true;

export default handler;
